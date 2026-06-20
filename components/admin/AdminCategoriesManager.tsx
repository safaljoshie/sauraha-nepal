"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CategoryIcon from "@/components/icons/CategoryIcon"
import SiteIcon from "@/components/icons/SiteIcon"
import { CATEGORY_ICON_OPTIONS } from "@/lib/category-icon-map"
import type { BusinessCategoryRow, CategoryGroupRow } from "@/lib/category-catalog"

type Toast = { id: string; type: "success" | "error"; message: string }

type CategoryWithGroup = BusinessCategoryRow & {
  category_groups?: { slug: string; label: string } | null
}

type GroupForm = {
  id?: string
  slug: string
  label: string
  tab_label: string
  icon: string
  sort_order: number
  is_active: boolean
}

type CategoryForm = {
  id?: string
  name: string
  group_id: string
  sort_order: number
  is_active: boolean
  update_listings: boolean
}

const fieldClass =
  "w-full rounded-[10px] border border-border-brand bg-cream px-3 py-2 text-sm text-text-brand outline-none focus:border-green-mid focus:bg-white"

const emptyGroupForm: GroupForm = {
  slug: "",
  label: "",
  tab_label: "",
  icon: "",
  sort_order: 0,
  is_active: true,
}

const emptyCategoryForm: CategoryForm = {
  name: "",
  group_id: "",
  sort_order: 0,
  is_active: true,
  update_listings: false,
}

export default function AdminCategoriesManager() {
  const router = useRouter()
  const [tab, setTab] = useState<"groups" | "categories">("groups")
  const [groups, setGroups] = useState<CategoryGroupRow[]>([])
  const [categories, setCategories] = useState<CategoryWithGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [toasts, setToasts] = useState<Toast[]>([])
  const [groupForm, setGroupForm] = useState<GroupForm | null>(null)
  const [categoryForm, setCategoryForm] = useState<CategoryForm | null>(null)

  function showToast(type: Toast["type"], message: string) {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [groupsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/category-groups"),
        fetch("/api/admin/categories"),
      ])
      if (groupsRes.status === 401 || categoriesRes.status === 401) {
        router.push("/admin")
        return
      }
      const groupsData = (await groupsRes.json()) as { groups?: CategoryGroupRow[]; error?: string }
      const categoriesData = (await categoriesRes.json()) as {
        categories?: CategoryWithGroup[]
        error?: string
      }
      if (!groupsRes.ok) {
        setError(groupsData.error ?? "Failed to load groups.")
        return
      }
      if (!categoriesRes.ok) {
        setError(categoriesData.error ?? "Failed to load categories.")
        return
      }
      setGroups(groupsData.groups ?? [])
      setCategories(categoriesData.categories ?? [])
    } catch {
      setError("Failed to load category data.")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  async function saveGroup() {
    if (!groupForm) return
    if (!groupForm.label.trim()) {
      setError("Label is required.")
      return
    }
    if (!groupForm.id && !groupForm.slug.trim()) {
      setError("Slug is required for new groups.")
      return
    }

    setSaving(true)
    setError("")
    try {
      const isEdit = Boolean(groupForm.id)
      const res = await fetch(
        isEdit ? `/api/admin/category-groups/${groupForm.id}` : "/api/admin/category-groups",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: groupForm.slug.trim().toLowerCase(),
            label: groupForm.label.trim(),
            tab_label: groupForm.tab_label.trim() || groupForm.label.trim(),
            icon: groupForm.icon.trim(),
            sort_order: groupForm.sort_order,
            is_active: groupForm.is_active,
          }),
        },
      )
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to save group.")
        showToast("error", data.error ?? "Failed to save group.")
        return
      }
      setGroupForm(null)
      showToast("success", "Group saved.")
      await loadAll()
    } catch {
      setError("Failed to save group.")
      showToast("error", "Failed to save group.")
    } finally {
      setSaving(false)
    }
  }

  async function saveCategory() {
    if (!categoryForm) return
    if (!categoryForm.name.trim()) {
      setError("Category name is required.")
      return
    }
    if (!categoryForm.group_id) {
      setError("Select a filter group.")
      return
    }

    setSaving(true)
    setError("")
    try {
      const isEdit = Boolean(categoryForm.id)
      const res = await fetch(
        isEdit ? `/api/admin/categories/${categoryForm.id}` : "/api/admin/categories",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: categoryForm.name.trim(),
            group_id: categoryForm.group_id,
            sort_order: categoryForm.sort_order,
            is_active: categoryForm.is_active,
            update_listings: isEdit ? categoryForm.update_listings : false,
          }),
        },
      )
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to save category.")
        showToast("error", data.error ?? "Failed to save category.")
        return
      }
      setCategoryForm(null)
      showToast("success", "Category saved.")
      await loadAll()
    } catch {
      setError("Failed to save category.")
      showToast("error", "Failed to save category.")
    } finally {
      setSaving(false)
    }
  }

  async function deleteGroup(group: CategoryGroupRow) {
    const confirmed = window.confirm(`Delete filter group "${group.label}"?\nThis cannot be undone.`)
    if (!confirmed) return

    try {
      const res = await fetch(`/api/admin/category-groups/${group.id}`, { method: "DELETE" })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to delete group.")
        showToast("error", data.error ?? "Failed to delete group.")
        return
      }
      showToast("success", "Group deleted.")
      await loadAll()
    } catch {
      showToast("error", "Failed to delete group.")
    }
  }

  async function deleteCategory(category: CategoryWithGroup) {
    const confirmed = window.confirm(`Delete category "${category.name}"?\nThis cannot be undone.`)
    if (!confirmed) return

    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to delete category.")
        showToast("error", data.error ?? "Failed to delete category.")
        return
      }
      showToast("success", "Category deleted.")
      await loadAll()
    } catch {
      showToast("error", "Failed to delete category.")
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border-brand pb-6">
        <div>
          <p className="text-xs font-bold tracking-widest text-orange-brand uppercase">Admin</p>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand md:text-3xl">
            Categories &amp; Filter Groups
          </h1>
          <p className="mt-1 text-sm text-text-light">
            Manage listing categories and how they appear in directory filters.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="rounded-full border border-border-brand bg-white px-4 py-2 text-sm font-semibold text-text-mid hover:bg-cream"
        >
          Back to Dashboard
        </Link>
      </header>

      {error && (
        <p className="mb-4 rounded-[10px] border border-orange-brand/30 bg-orange-brand/10 px-4 py-3 text-sm font-semibold text-orange-brand">
          {error}
        </p>
      )}

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("groups")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            tab === "groups"
              ? "bg-green-brand text-white"
              : "border border-border-brand bg-white text-text-mid"
          }`}
        >
          Filter groups
        </button>
        <button
          type="button"
          onClick={() => setTab("categories")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            tab === "categories"
              ? "bg-green-brand text-white"
              : "border border-border-brand bg-white text-text-mid"
          }`}
        >
          Business categories
        </button>
      </div>

      {tab === "groups" && (
        <section className="rounded-2xl border border-border-brand bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border-brand px-4 py-3">
            <h2 className="font-semibold text-text-brand">Filter groups</h2>
            <button
              type="button"
              onClick={() => setGroupForm({ ...emptyGroupForm })}
              className="rounded-full bg-green-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-mid"
            >
              Add group
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-brand bg-cream/80 text-xs font-bold uppercase tracking-wide text-text-light">
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Label</th>
                  <th className="px-4 py-3">Tab label</th>
                  <th className="px-4 py-3">Icon</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-text-light">
                      Loading…
                    </td>
                  </tr>
                ) : groups.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-text-light">
                      No groups yet. Run supabase/business_categories.sql or add one.
                    </td>
                  </tr>
                ) : (
                  groups.map((group) => (
                    <tr key={group.id} className="border-b border-border-brand/60 hover:bg-cream/40">
                      <td className="px-4 py-3 font-mono text-xs">{group.slug}</td>
                      <td className="px-4 py-3">{group.label}</td>
                      <td className="px-4 py-3">{group.tab_label}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2">
                          <CategoryIcon slug={group.slug} storedIcon={group.icon} size={18} />
                          <span className="font-mono text-xs text-text-light">{group.icon ?? "—"}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">{group.sort_order}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            group.is_active
                              ? "bg-green-mid/15 text-green-brand"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {group.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setGroupForm({
                                id: group.id,
                                slug: group.slug,
                                label: group.label,
                                tab_label: group.tab_label,
                                icon: group.icon ?? "",
                                sort_order: group.sort_order,
                                is_active: group.is_active,
                              })
                            }
                            className="rounded-lg bg-blue-100 px-2.5 py-1 text-sm text-blue-700 hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteGroup(group)}
                            className="rounded-lg bg-red-100 px-2.5 py-1 text-sm text-red-700 hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "categories" && (
        <section className="rounded-2xl border border-border-brand bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border-brand px-4 py-3">
            <h2 className="font-semibold text-text-brand">Business categories</h2>
            <button
              type="button"
              onClick={() =>
                setCategoryForm({
                  ...emptyCategoryForm,
                  group_id: groups[0]?.id ?? "",
                })
              }
              disabled={groups.length === 0}
              className="rounded-full bg-green-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-mid disabled:opacity-50"
            >
              Add category
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-brand bg-cream/80 text-xs font-bold uppercase tracking-wide text-text-light">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Filter group</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-text-light">
                      Loading…
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-text-light">
                      No categories yet.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="border-b border-border-brand/60 hover:bg-cream/40">
                      <td className="px-4 py-3 font-semibold">{cat.name}</td>
                      <td className="px-4 py-3 text-text-mid">
                        {cat.category_groups?.label ?? "—"}
                      </td>
                      <td className="px-4 py-3">{cat.sort_order}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            cat.is_active
                              ? "bg-green-mid/15 text-green-brand"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {cat.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setCategoryForm({
                                id: cat.id,
                                name: cat.name,
                                group_id: cat.group_id,
                                sort_order: cat.sort_order,
                                is_active: cat.is_active,
                                update_listings: false,
                              })
                            }
                            className="rounded-lg bg-blue-100 px-2.5 py-1 text-sm text-blue-700 hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCategory(cat)}
                            className="rounded-lg bg-red-100 px-2.5 py-1 text-sm text-red-700 hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {groupForm && (
        <Modal title={groupForm.id ? "Edit filter group" : "Add filter group"} onClose={() => setGroupForm(null)}>
          <div className="grid gap-4">
            <Field label="Slug (URL)" required>
              <input
                value={groupForm.slug}
                onChange={(e) => setGroupForm((f) => (f ? { ...f, slug: e.target.value } : f))}
                disabled={Boolean(groupForm.id)}
                placeholder="e.g. activities"
                className={`${fieldClass} disabled:opacity-60`}
              />
              {groupForm.id && (
                <p className="mt-1 text-xs text-text-light">Slug cannot be changed after creation.</p>
              )}
            </Field>
            <Field label="Label" required>
              <input
                value={groupForm.label}
                onChange={(e) => setGroupForm((f) => (f ? { ...f, label: e.target.value } : f))}
                className={fieldClass}
              />
            </Field>
            <Field label="Tab label" required>
              <input
                value={groupForm.tab_label}
                onChange={(e) => setGroupForm((f) => (f ? { ...f, tab_label: e.target.value } : f))}
                placeholder="e.g. Activities"
                className={fieldClass}
              />
            </Field>
            <Field label="Icon">
              <select
                value={groupForm.icon}
                onChange={(e) => setGroupForm((f) => (f ? { ...f, icon: e.target.value } : f))}
                className={fieldClass}
              >
                <option value="">Default for slug</option>
                {CATEGORY_ICON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {groupForm.icon ? (
                <span className="mt-2 inline-flex items-center gap-2 text-sm text-text-mid">
                  <SiteIcon name={groupForm.icon} size={18} strokeWidth={2.25} />
                  Preview
                </span>
              ) : null}
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                min={0}
                value={groupForm.sort_order}
                onChange={(e) =>
                  setGroupForm((f) =>
                    f ? { ...f, sort_order: Number.parseInt(e.target.value || "0", 10) } : f,
                  )
                }
                className={fieldClass}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-text-mid">
              <input
                type="checkbox"
                checked={groupForm.is_active}
                onChange={(e) =>
                  setGroupForm((f) => (f ? { ...f, is_active: e.target.checked } : f))
                }
              />
              Active on site
            </label>
          </div>
          <ModalActions
            onCancel={() => setGroupForm(null)}
            onSave={saveGroup}
            saving={saving}
            saveLabel="Save group"
          />
        </Modal>
      )}

      {categoryForm && (
        <Modal
          title={categoryForm.id ? "Edit business category" : "Add business category"}
          onClose={() => setCategoryForm(null)}
        >
          <div className="grid gap-4">
            <Field label="Name" required>
              <input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm((f) => (f ? { ...f, name: e.target.value } : f))}
                className={fieldClass}
              />
            </Field>
            <Field label="Filter group" required>
              <select
                value={categoryForm.group_id}
                onChange={(e) =>
                  setCategoryForm((f) => (f ? { ...f, group_id: e.target.value } : f))
                }
                className={fieldClass}
              >
                <option value="">Select group</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label} ({g.slug})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                min={0}
                value={categoryForm.sort_order}
                onChange={(e) =>
                  setCategoryForm((f) =>
                    f ? { ...f, sort_order: Number.parseInt(e.target.value || "0", 10) } : f,
                  )
                }
                className={fieldClass}
              />
            </Field>
            {categoryForm.id && (
              <label className="flex items-center gap-2 text-sm text-text-mid">
                <input
                  type="checkbox"
                  checked={categoryForm.update_listings}
                  onChange={(e) =>
                    setCategoryForm((f) =>
                      f ? { ...f, update_listings: e.target.checked } : f,
                    )
                  }
                />
                Also update existing listings that use the old name
              </label>
            )}
            <label className="flex items-center gap-2 text-sm text-text-mid">
              <input
                type="checkbox"
                checked={categoryForm.is_active}
                onChange={(e) =>
                  setCategoryForm((f) => (f ? { ...f, is_active: e.target.checked } : f))
                }
              />
              Active (shown in list-your-business form)
            </label>
          </div>
          <ModalActions
            onCancel={() => setCategoryForm(null)}
            onSave={saveCategory}
            saving={saving}
            saveLabel="Save category"
          />
        </Modal>
      )}

      <div className="pointer-events-none fixed right-4 bottom-4 z-[70] flex max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.type === "success" ? "bg-green-brand text-white" : "bg-red-600 text-white"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  )
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border-brand bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-text-light hover:text-text-brand"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ModalActions({
  onCancel,
  onSave,
  saving,
  saveLabel,
}: {
  onCancel: () => void
  onSave: () => void
  saving: boolean
  saveLabel: string
}) {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-full border border-border-brand px-4 py-2 text-sm font-semibold text-text-mid hover:bg-cream"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="rounded-full bg-green-brand px-5 py-2 text-sm font-semibold text-white hover:bg-green-mid disabled:opacity-60"
      >
        {saving ? "Saving…" : saveLabel}
      </button>
    </div>
  )
}

function Field({
  label,
  children,
  required,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label className="block text-sm text-text-mid">
      <span className="mb-1 block font-semibold text-text-brand">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  )
}
