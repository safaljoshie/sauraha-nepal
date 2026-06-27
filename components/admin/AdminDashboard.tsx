"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react"
import type { BusinessListing } from "@/lib/business-listing"
import { formatSubmittedDate, planLabel } from "@/lib/business-listing"
import { DEFAULT_CATEGORY_CATALOG, getActiveCategoryNames } from "@/lib/category-catalog"
import {
  compressImage,
  MAX_PRE_COMPRESS_BYTES,
  POST_COMPRESS_WARN_BYTES,
} from "@/lib/compress-image"
import { mergePhotoLinks } from "@/lib/list-business-photos"
import { isNextOptimizedImageSrc } from "@/lib/image"
import { matchesAdminListingSearch } from "@/lib/listings-catalog"
import AdminBlogSection from "@/components/admin/AdminBlogSection"
import AdminCalendarSection from "@/components/admin/AdminCalendarSection"
import AdminSiteSettingsSection from "@/components/admin/AdminSiteSettingsSection"
import AdminTeamItinerarySection from "@/components/admin/AdminTeamItinerarySection"
import AdminTeamResourcesSection from "@/components/admin/AdminTeamResourcesSection"
import AdminTabNav, { type AdminTab } from "@/components/admin/AdminTabNav"
import SiteIcon from "@/components/icons/SiteIcon"

type FilterTab =
  | "all"
  | "pending"
  | "approved"
  | "rejected"
  | "basic"
  | "featured"
  | "premium"

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "basic", label: "Basic" },
  { id: "featured", label: "Featured" },
  { id: "premium", label: "Premium" },
]

function planBadgeClass(plan: string) {
  switch (plan) {
    case "featured":
      return "bg-orange-brand/15 text-orange-brand"
    case "premium":
      return "bg-green-mid/15 text-green-brand"
    default:
      return "bg-gray-200 text-gray-700"
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "approved":
      return "bg-green-mid/15 text-green-brand"
    case "rejected":
      return "bg-red-100 text-red-700"
    default:
      return "bg-yellow-100 text-yellow-800"
  }
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="border-b border-border-brand py-3 last:border-0">
      <dt className="text-xs font-bold uppercase tracking-wide text-text-light">{label}</dt>
      <dd className="mt-1 break-words text-sm text-text-brand">{value}</dd>
    </div>
  )
}

type ToastType = "success" | "error"
type Toast = {
  id: string
  type: ToastType
  message: string
}

type EditFormState = {
  id: string
  business_name: string
  category: string
  description: string
  price_range: string
  opening_hours: string
  owner_name: string
  email: string
  phone: string
  whatsapp: string
  website: string
  facebook: string
  address: string
  google_maps_link: string
  photo_links: string
  plan: "basic" | "featured" | "premium"
  status: "pending" | "approved" | "rejected"
}

function normalizeEditForm(listing: BusinessListing, defaultCategory: string): EditFormState {
  return {
    id: listing.id,
    business_name: listing.business_name ?? "",
    category: listing.category ?? defaultCategory,
    description: listing.description ?? "",
    price_range: listing.price_range ?? "",
    opening_hours: listing.opening_hours ?? "",
    owner_name: listing.owner_name ?? "",
    email: listing.email ?? "",
    phone: listing.phone ?? "",
    whatsapp: listing.whatsapp ?? "",
    website: listing.website ?? "",
    facebook: listing.facebook ?? "",
    address: listing.address ?? "",
    google_maps_link: listing.google_maps_link ?? "",
    photo_links: listing.photo_links ?? "",
    plan: (["basic", "featured", "premium"].includes(listing.plan)
      ? listing.plan
      : "basic") as "basic" | "featured" | "premium",
    status: (["pending", "approved", "rejected"].includes(listing.status)
      ? listing.status
      : "pending") as "pending" | "approved" | "rejected",
  }
}

function mergeListing(existing: BusinessListing, updates: Partial<BusinessListing>): BusinessListing {
  return { ...existing, ...updates }
}

function parsePhotoUrls(photoLinks: string) {
  return photoLinks
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

export default function AdminDashboard() {
  const router = useRouter()
  const [listings, setListings] = useState<BusinessListing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>("all")
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState<BusinessListing | null>(null)
  const [editForm, setEditForm] = useState<EditFormState | null>(null)
  const [editErrors, setEditErrors] = useState<string>("")
  const [toasts, setToasts] = useState<Toast[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [adminTab, setAdminTab] = useState<AdminTab>("listings")
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [categoryOptions, setCategoryOptions] = useState<string[]>(
    getActiveCategoryNames(DEFAULT_CATEGORY_CATALOG),
  )

  const loadCategoryOptions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories")
      if (res.status === 401) return
      const data = (await res.json()) as {
        categories?: { name: string; is_active: boolean }[]
      }
      if (!res.ok) return
      const names = (data.categories ?? [])
        .filter((c) => c.is_active)
        .map((c) => c.name)
      if (names.length > 0) setCategoryOptions(names)
    } catch {
      // keep defaults
    }
  }, [])

  const loadListings = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/listings")
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as {
        listings?: BusinessListing[]
        error?: string
      }
      if (!res.ok) {
        setError(data.error ?? "Failed to load listings.")
        return
      }
      setListings(data.listings ?? [])
      setSelectedIds([])
    } catch {
      setError("Failed to load listings.")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadListings()
    loadCategoryOptions()
  }, [loadListings, loadCategoryOptions])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const defaultCategory = categoryOptions[0] ?? ""

  const stats = useMemo(() => {
    const total = listings.length
    const pending = listings.filter((l) => l.status === "pending").length
    const approved = listings.filter((l) => l.status === "approved").length
    const rejected = listings.filter((l) => l.status === "rejected").length
    return { total, pending, approved, rejected }
  }, [listings])

  const filtered = useMemo(() => {
    const byTab =
      filter === "all"
        ? listings
        : filter === "pending" || filter === "approved" || filter === "rejected"
          ? listings.filter((l) => l.status === filter)
          : listings.filter((l) => l.plan === filter)

    if (!debouncedSearch.trim()) return byTab
    return byTab.filter((listing) => matchesAdminListingSearch(listing, debouncedSearch))
  }, [listings, filter, debouncedSearch])

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => filtered.some((listing) => listing.id === id)))
  }, [filtered])

  const allVisibleSelected = filtered.length > 0 && filtered.every((l) => selectedIds.includes(l.id))

  function showToast(type: ToastType, message: string) {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

  function updateListingState(
    id: string,
    updater: (current: BusinessListing) => BusinessListing,
  ) {
    setListings((prev) => prev.map((listing) => (listing.id === id ? updater(listing) : listing)))
    setSelected((prev) => (prev?.id === id ? updater(prev) : prev))
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin")
    router.refresh()
  }

  async function handleAction(id: string, action: "approve" | "reject") {
    setActionId(id)
    setError("")
    const nextStatus = action === "approve" ? "approved" : "rejected"
    const previousListings = listings
    updateListingState(id, (listing) => ({ ...listing, status: nextStatus }))
    try {
      const res = await fetch(`/api/admin/listings/${id}/${action}`, {
        method: "POST",
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setListings(previousListings)
        setError(data.error ?? `Failed to ${action} listing.`)
        showToast("error", `Failed to ${action} listing. Please try again.`)
        return
      }
      showToast("success", `Listing ${action}d successfully`)
    } catch {
      setListings(previousListings)
      setError(`Failed to ${action} listing.`)
      showToast("error", `Failed to ${action} listing. Please try again.`)
    } finally {
      setActionId(null)
    }
  }

  async function handleDelete(listing: BusinessListing) {
    const confirmed = window.confirm(
      `Are you sure you want to delete '${listing.business_name}'?\nThis cannot be undone.`,
    )
    if (!confirmed) return

    setActionId(listing.id)
    setError("")
    const previousListings = listings
    setListings((prev) => prev.filter((row) => row.id !== listing.id))
    setSelected((prev) => (prev?.id === listing.id ? null : prev))
    setEditForm((prev) => (prev?.id === listing.id ? null : prev))
    setSelectedIds((prev) => prev.filter((id) => id !== listing.id))

    try {
      const res = await fetch("/api/admin/delete-listing", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: listing.id }),
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setListings(previousListings)
        setError(data.error ?? "Failed to delete listing. Please try again.")
        showToast("error", "Failed to delete listing. Please try again.")
        return
      }
      showToast("success", "Listing deleted successfully")
    } catch {
      setListings(previousListings)
      setError("Failed to delete listing. Please try again.")
      showToast("error", "Failed to delete listing. Please try again.")
    } finally {
      setActionId(null)
    }
  }

  function openEdit(listing: BusinessListing) {
    setEditErrors("")
    setEditForm(normalizeEditForm(listing, defaultCategory))
  }

  async function handleAdminPhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    if (!editForm || files.length === 0) return

    const tooLarge = files.find((file) => file.size > MAX_PRE_COMPRESS_BYTES)
    if (tooLarge) {
      setEditErrors("This image is too large. Please choose a photo under 15MB.")
      showToast("error", "Image must be under 15MB.")
      return
    }

    setUploadingPhotos(true)
    setEditErrors("")
    try {
      const compressedFiles: File[] = []
      for (const file of files) {
        const compressed = await compressImage(file)
        if (compressed.size > POST_COMPRESS_WARN_BYTES) {
          console.warn(
            `${file.name} is still ${Math.round(compressed.size / (1024 * 1024))}MB after optimization.`,
          )
        }
        compressedFiles.push(compressed)
      }

      const formData = new FormData()
      formData.set("folder", `admin/${editForm.id}`)
      for (const file of compressedFiles) {
        formData.append("files", file)
      }

      const res = await fetch("/api/admin/upload-listing-photos", {
        method: "POST",
        body: formData,
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { error?: string; urls?: string[] }
      if (!res.ok || !data.urls) {
        throw new Error(data.error ?? "Failed to upload image.")
      }

      const merged = mergePhotoLinks(data.urls, editForm.photo_links)
      setEditForm((prev) => (prev ? { ...prev, photo_links: merged } : prev))
      showToast("success", `Uploaded ${data.urls.length} image${data.urls.length === 1 ? "" : "s"} successfully`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload image. Please try again."
      setEditErrors(message)
      showToast("error", "Failed to upload image. Please try again.")
    } finally {
      setUploadingPhotos(false)
    }
  }

  function validateEditForm(form: EditFormState) {
    if (!form.business_name.trim() || !form.category.trim() || !form.owner_name.trim() || !form.email.trim()) {
      return "Business name, category, owner name, and email are required."
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return "Please provide a valid email address."
    }
    return ""
  }

  async function handleSaveEdit() {
    if (!editForm) return

    const validationError = validateEditForm(editForm)
    if (validationError) {
      setEditErrors(validationError)
      return
    }

    setActionId(editForm.id)
    setError("")
    setEditErrors("")
    const previousListings = listings
    const optimistic = {
      ...editForm,
      business_name: editForm.business_name.trim(),
      category: editForm.category.trim(),
      description: editForm.description.trim() || null,
      price_range: editForm.price_range.trim() || null,
      opening_hours: editForm.opening_hours.trim() || null,
      owner_name: editForm.owner_name.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone.trim() || null,
      whatsapp: editForm.whatsapp.trim() || null,
      website: editForm.website.trim() || null,
      facebook: editForm.facebook.trim() || null,
      address: editForm.address.trim() || null,
      google_maps_link: editForm.google_maps_link.trim() || null,
      photo_links: editForm.photo_links.trim() || null,
      plan: editForm.plan,
      status: editForm.status,
    } as Partial<BusinessListing>
    updateListingState(editForm.id, (listing) => mergeListing(listing, optimistic))

    try {
      const res = await fetch("/api/admin/update-listing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { error?: string; listing?: BusinessListing }
      if (!res.ok || !data.listing) {
        setListings(previousListings)
        setError(data.error ?? "Failed to update listing. Please try again.")
        showToast("error", "Failed to update listing. Please try again.")
        return
      }

      updateListingState(editForm.id, () => data.listing as BusinessListing)
      setEditForm(null)
      showToast("success", "Listing updated successfully")
    } catch {
      setListings(previousListings)
      setError("Failed to update listing. Please try again.")
      showToast("error", "Failed to update listing. Please try again.")
    } finally {
      setActionId(null)
    }
  }

  function toggleRowSelection(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      if (checked) return [...new Set([...prev, id])]
      return prev.filter((rowId) => rowId !== id)
    })
  }

  function toggleSelectAll(checked: boolean) {
    if (!checked) {
      setSelectedIds((prev) => prev.filter((id) => !filtered.some((l) => l.id === id)))
      return
    }
    setSelectedIds((prev) => [...new Set([...prev, ...filtered.map((listing) => listing.id)])])
  }

  async function handleBulkAction(action: "approve" | "reject" | "delete") {
    if (selectedIds.length === 0) return
    if (action === "delete") {
      const confirmed = window.confirm(
        `Are you sure you want to delete ${selectedIds.length} listing${selectedIds.length === 1 ? "" : "s"}?\nThis cannot be undone.`,
      )
      if (!confirmed) return
    }

    const affected = listings.filter((listing) => selectedIds.includes(listing.id))
    const previousListings = listings
    setError("")

    if (action === "delete") {
      setListings((prev) => prev.filter((listing) => !selectedIds.includes(listing.id)))
      setSelectedIds([])
    } else {
      const nextStatus = action === "approve" ? "approved" : "rejected"
      setListings((prev) =>
        prev.map((listing) =>
          selectedIds.includes(listing.id) ? { ...listing, status: nextStatus } : listing,
        ),
      )
    }

    try {
      const results = await Promise.all(
        affected.map(async (listing) => {
          const endpoint =
            action === "delete" ? "/api/admin/delete-listing" : `/api/admin/listings/${listing.id}/${action}`
          const options: RequestInit =
            action === "delete"
              ? {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: listing.id }),
                }
              : { method: "POST" }
          const res = await fetch(endpoint, options)
          return { id: listing.id, ok: res.ok, status: res.status }
        }),
      )

      const unauthorized = results.some((result) => result.status === 401)
      if (unauthorized) {
        router.push("/admin")
        return
      }

      const failed = results.filter((result) => !result.ok).map((result) => result.id)
      if (failed.length > 0) {
        setListings(previousListings)
        setError(`Failed to ${action} ${failed.length} listing${failed.length === 1 ? "" : "s"}.`)
        showToast("error", `Failed to ${action} selected listings. Please try again.`)
        return
      }

      if (action !== "delete") {
        setSelectedIds([])
      }
      showToast("success", `${action === "delete" ? "Deleted" : action === "approve" ? "Approved" : "Rejected"} ${affected.length} listing${affected.length === 1 ? "" : "s"} successfully`)
    } catch {
      setListings(previousListings)
      setError(`Failed to ${action} selected listings.`)
      showToast("error", `Failed to ${action} selected listings. Please try again.`)
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl overflow-x-hidden px-4 py-8 md:px-8">
      <header className="mb-8 flex flex-col gap-4 border-b border-border-brand pb-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand md:text-3xl">
            Sauraha Nepal — Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-text-light">
            Manage listings, blog posts, content calendar, and site settings
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/team"
            className="self-start rounded-full border border-border-brand bg-white px-5 py-2 text-sm font-semibold text-text-mid transition-colors hover:border-green-mid hover:text-green-brand"
          >
            Manage Team
          </Link>
          <Link
            href="/admin/content/contact"
            className="self-start rounded-full border border-border-brand bg-white px-5 py-2 text-sm font-semibold text-text-mid transition-colors hover:border-green-mid hover:text-green-brand"
          >
            Edit Contact
          </Link>
          <Link
            href="/admin/content/hero"
            className="self-start rounded-full border border-border-brand bg-white px-5 py-2 text-sm font-semibold text-text-mid transition-colors hover:border-green-mid hover:text-green-brand"
          >
            Edit Hero Video
          </Link>
          <Link
            href="/admin/content/categories"
            className="self-start rounded-full border border-border-brand bg-white px-5 py-2 text-sm font-semibold text-text-mid transition-colors hover:border-green-mid hover:text-green-brand"
          >
            Manage Categories
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer self-start rounded-full border border-border-brand bg-white px-5 py-2 text-sm font-semibold text-text-mid transition-colors hover:border-green-mid hover:text-green-brand"
          >
            Logout
          </button>
        </div>
      </header>

      <AdminTabNav active={adminTab} onChange={setAdminTab} />

      {adminTab === "blog" && <AdminBlogSection />}

      {adminTab === "calendar" && <AdminCalendarSection />}

      {adminTab === "resources" && <AdminTeamResourcesSection />}

      {adminTab === "itineraries" && <AdminTeamItinerarySection />}

      {adminTab === "settings" && <AdminSiteSettingsSection />}

      {adminTab === "listings" && (
        <div className="min-w-0 w-full max-w-full">
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total listings", value: stats.total },
          { label: "Pending", value: stats.pending },
          { label: "Approved", value: stats.approved },
          { label: "Rejected", value: stats.rejected },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border-brand bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-text-light">
              {stat.label}
            </p>
            <p className="mt-1 font-[family-name:var(--font-playfair)] text-3xl font-bold text-green-brand">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filter === tab.id
                ? "bg-green-brand text-white"
                : "bg-white text-text-mid hover:bg-green-mid/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <input
          type="search"
          placeholder="Search listings by name, owner, email, phone..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full max-w-md rounded-xl border border-border-brand bg-white px-4 py-2.5 text-sm text-text-brand outline-none focus:border-green-mid"
          aria-label="Search listings"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-[10px] border border-orange-brand/30 bg-orange-brand/10 px-4 py-3 text-sm font-semibold text-orange-brand"
        >
          {error}
        </p>
      )}

      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-brand bg-cream px-4 py-3">
          <p className="text-sm font-semibold text-text-mid">
            {selectedIds.length} listing{selectedIds.length === 1 ? "" : "s"} selected
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleBulkAction("approve")}
              className="cursor-pointer rounded-full bg-green-brand px-4 py-2 text-xs font-semibold text-white hover:bg-green-mid"
            >
              Approve All
            </button>
            <button
              type="button"
              onClick={() => handleBulkAction("reject")}
              className="cursor-pointer rounded-full bg-orange-brand px-4 py-2 text-xs font-semibold text-white hover:bg-orange-light"
            >
              Reject All
            </button>
            <button
              type="button"
              onClick={() => handleBulkAction("delete")}
              className="cursor-pointer rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500"
            >
              Delete All
            </button>
          </div>
        </div>
      )}

      <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-border-brand bg-white shadow-sm">
        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-brand bg-cream/80 text-xs font-bold uppercase tracking-wide text-text-light">
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    aria-label="Select all visible listings"
                  />
                </th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-text-light">
                    Loading listings…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-text-light">
                    {debouncedSearch.trim()
                      ? "No listings match your search."
                      : "No listings found."}
                  </td>
                </tr>
              ) : (
                filtered.map((listing) => (
                  <tr
                    key={listing.id}
                    className="border-b border-border-brand/60 hover:bg-cream/40"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(listing.id)}
                        onChange={(e) => toggleRowSelection(listing.id, e.target.checked)}
                        aria-label={`Select ${listing.business_name}`}
                      />
                    </td>
                    <td className="max-w-[12rem] truncate px-4 py-3 font-semibold text-text-brand">
                      {listing.business_name}
                    </td>
                    <td className="max-w-[8rem] truncate px-4 py-3 text-text-mid">{listing.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${planBadgeClass(listing.plan)}`}
                      >
                        {planLabel(listing.plan)}
                      </span>
                    </td>
                    <td className="max-w-[9rem] truncate px-4 py-3 text-text-mid">{listing.owner_name}</td>
                    <td className="max-w-[11rem] truncate px-4 py-3">
                      {listing.email ? (
                        <a
                          href={`mailto:${listing.email}`}
                          className="block truncate text-green-mid hover:underline"
                          title={listing.email}
                        >
                          {listing.email}
                        </a>
                      ) : (
                        <span className="text-text-light">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-mid">{listing.phone ?? "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-text-light">
                      {formatSubmittedDate(listing.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusBadgeClass(listing.status)}`}
                      >
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          title="View"
                          onClick={() => setSelected(listing)}
                          className="cursor-pointer rounded-lg bg-gray-200 px-2 py-1 text-sm text-gray-800 hover:bg-gray-300"
                        >
                          <SiteIcon name="eye" size={16} strokeWidth={2.25} />
                        </button>
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => openEdit(listing)}
                          disabled={actionId === listing.id}
                          className="cursor-pointer rounded-lg bg-blue-100 px-2 py-1 text-sm text-blue-700 hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <SiteIcon name="pencil" size={16} strokeWidth={2.25} />
                        </button>
                        <button
                          type="button"
                          title="Approve"
                          disabled={actionId === listing.id || listing.status === "approved"}
                          onClick={() => handleAction(listing.id, "approve")}
                          className="cursor-pointer rounded-lg bg-green-100 px-2 py-1 text-sm text-green-700 hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          title="Reject"
                          disabled={actionId === listing.id || listing.status === "rejected"}
                          onClick={() => handleAction(listing.id, "reject")}
                          className="cursor-pointer rounded-lg bg-orange-100 px-2 py-1 text-sm text-orange-700 hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ✗
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          disabled={actionId === listing.id}
                          onClick={() => handleDelete(listing)}
                          className="cursor-pointer rounded-lg bg-red-100 px-2 py-1 text-sm text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="listing-detail-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg min-w-0 overflow-x-hidden overflow-y-auto rounded-2xl border border-border-brand bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2
                id="listing-detail-title"
                className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand"
              >
                {selected.business_name}
              </h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="cursor-pointer text-2xl leading-none text-text-light hover:text-text-brand"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <dl>
              <DetailRow label="Category" value={selected.category} />
              <DetailRow label="Plan" value={planLabel(selected.plan)} />
              <DetailRow label="Status" value={selected.status} />
              <DetailRow label="Owner" value={selected.owner_name} />
              <DetailRow label="Email" value={selected.email} />
              <DetailRow label="Phone" value={selected.phone} />
              <DetailRow label="WhatsApp" value={selected.whatsapp} />
              <DetailRow label="Description" value={selected.description} />
              <DetailRow label="Address" value={selected.address} />
              <DetailRow label="Price range" value={selected.price_range} />
              <DetailRow label="Opening hours" value={selected.opening_hours} />
              <DetailRow label="Website" value={selected.website} />
              <DetailRow label="Social Media" value={selected.facebook} />
              <DetailRow label="Google Maps" value={selected.google_maps_link} />
              <DetailRow label="Photo links" value={selected.photo_links} />
              <DetailRow
                label="Submitted"
                value={formatSubmittedDate(selected.created_at)}
              />
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              {selected.status !== "approved" && (
                <button
                  type="button"
                  disabled={actionId === selected.id}
                  onClick={() => handleAction(selected.id, "approve")}
                  className="btn-primary cursor-pointer px-4 py-2 text-sm disabled:opacity-60"
                >
                  Approve
                </button>
              )}
              {selected.status !== "rejected" && (
                <button
                  type="button"
                  disabled={actionId === selected.id}
                  onClick={() => handleAction(selected.id, "reject")}
                  className="cursor-pointer rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                >
                  Reject
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl min-w-0 overflow-x-hidden overflow-y-auto rounded-2xl border border-border-brand bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
                Edit listing
              </h2>
              <button
                type="button"
                onClick={() => setEditForm(null)}
                className="cursor-pointer text-2xl leading-none text-text-light hover:text-text-brand"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {editErrors && (
              <p className="mb-4 rounded-[10px] border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {editErrors}
              </p>
            )}

            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              <EditField label="Business Name" required>
                <input
                  value={editForm.business_name}
                  onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                  className={fieldClass}
                />
              </EditField>
              <EditField label="Category" required>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className={fieldClass}
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </EditField>
              <EditField label="Description" className="md:col-span-2">
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className={`${fieldClass} min-h-[90px]`}
                />
              </EditField>
              <EditField label="Price Range">
                <select
                  value={editForm.price_range}
                  onChange={(e) => setEditForm({ ...editForm, price_range: e.target.value })}
                  className={fieldClass}
                >
                  <option value="">—</option>
                  <option value="$ Budget">$ Budget</option>
                  <option value="$$ Mid-range">$$ Mid-range</option>
                  <option value="$$$ Premium">$$$ Premium</option>
                </select>
              </EditField>
              <EditField label="Opening Hours">
                <input
                  value={editForm.opening_hours}
                  onChange={(e) => setEditForm({ ...editForm, opening_hours: e.target.value })}
                  className={fieldClass}
                />
              </EditField>
              <EditField label="Owner Name" required>
                <input
                  value={editForm.owner_name}
                  onChange={(e) => setEditForm({ ...editForm, owner_name: e.target.value })}
                  className={fieldClass}
                />
              </EditField>
              <EditField label="Email" required>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className={fieldClass}
                />
              </EditField>
              <EditField label="Phone">
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className={fieldClass}
                />
              </EditField>
              <EditField label="WhatsApp">
                <input
                  value={editForm.whatsapp}
                  onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                  className={fieldClass}
                />
              </EditField>
              <EditField label="Website">
                <input
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  className={fieldClass}
                />
              </EditField>
              <EditField label="Social Media">
                <input
                  value={editForm.facebook}
                  onChange={(e) => setEditForm({ ...editForm, facebook: e.target.value })}
                  className={fieldClass}
                />
              </EditField>
              <EditField label="Address">
                <input
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className={fieldClass}
                />
              </EditField>
              <EditField label="Google Maps Link">
                <input
                  value={editForm.google_maps_link}
                  onChange={(e) => setEditForm({ ...editForm, google_maps_link: e.target.value })}
                  className={fieldClass}
                />
              </EditField>
              <EditField label="Photo Links" className="md:col-span-2">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-200">
                    {uploadingPhotos ? "Uploading..." : "Upload image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                      multiple
                      onChange={handleAdminPhotoUpload}
                      disabled={uploadingPhotos || actionId === editForm.id}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-text-light sm:max-w-none">
                    JPEG/PNG/WEBP/HEIC, max 15MB each (optimized before upload)
                  </span>
                </div>
                <textarea
                  value={editForm.photo_links}
                  onChange={(e) => setEditForm({ ...editForm, photo_links: e.target.value })}
                  className={`${fieldClass} min-h-[90px]`}
                />
                {parsePhotoUrls(editForm.photo_links).length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-semibold text-text-light">Image preview</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {parsePhotoUrls(editForm.photo_links)
                        .slice(0, 8)
                        .map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="group relative aspect-square overflow-hidden rounded-lg border border-border-brand bg-cream"
                            title={url}
                          >
                            <Image
                              src={url}
                              alt=""
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                              sizes="120px"
                              loading="lazy"
                              unoptimized={!isNextOptimizedImageSrc(url)}
                            />
                          </a>
                        ))}
                    </div>
                    {parsePhotoUrls(editForm.photo_links).length > 8 && (
                      <p className="mt-2 text-xs text-text-light">
                        Showing first 8 images.
                      </p>
                    )}
                  </div>
                )}
              </EditField>
              <EditField label="Plan">
                <select
                  value={editForm.plan}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      plan: e.target.value as "basic" | "featured" | "premium",
                    })
                  }
                  className={fieldClass}
                >
                  <option value="basic">basic</option>
                  <option value="featured">featured</option>
                  <option value="premium">premium</option>
                </select>
              </EditField>
              <EditField label="Status">
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      status: e.target.value as "pending" | "approved" | "rejected",
                    })
                  }
                  className={fieldClass}
                >
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                </select>
              </EditField>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditForm(null)}
                className="cursor-pointer rounded-full border border-border-brand px-4 py-2 text-sm font-semibold text-text-mid hover:bg-cream"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={actionId === editForm.id}
                className="cursor-pointer rounded-full bg-green-brand px-5 py-2 text-sm font-semibold text-white hover:bg-green-mid disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${
              toast.type === "success" ? "bg-green-brand" : "bg-red-600"
            }`}
          >
            {toast.type === "success" ? "✓ " : "✗ "}
            {toast.message}
          </div>
        ))}
      </div>
        </div>
      )}
    </div>
  )
}

const fieldClass =
  "w-full min-w-0 rounded-[10px] border-[1.5px] border-border-brand bg-cream px-3 py-2 text-sm text-text-brand outline-none transition-colors focus:border-green-mid focus:bg-white"

function EditField({
  label,
  children,
  required = false,
  className = "",
}: {
  label: string
  children: React.ReactNode
  required?: boolean
  className?: string
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label className="mb-1.5 block text-sm font-semibold text-text-mid">
        {label} {required ? "*" : ""}
      </label>
      {children}
    </div>
  )
}
