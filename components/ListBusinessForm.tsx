"use client"

import Image from "next/image"
import { useEffect, useState, type FormEvent } from "react"
import {
  isPaidPlan,
  planFromFormName,
  type ListingPlan,
} from "@/lib/list-business"
import {
  isAllowedPhotoFile,
  mergePhotoLinks,
  parsePhotoLinkLines,
  photoLimitForPlan,
} from "@/lib/list-business-photos"
import {
  compressImage,
  MAX_PRE_COMPRESS_BYTES,
  POST_COMPRESS_WARN_BYTES,
} from "@/lib/compress-image"
import { formatImageBytes } from "@/lib/image"
import {
  DEFAULT_CATEGORY_CATALOG,
  getActiveCategoryNames,
} from "@/lib/category-catalog"
import { pricingPlans } from "@/lib/data"

const inputClass =
  "w-full rounded-xl border-[1.5px] border-border-brand bg-cream px-4 py-3 text-sm text-text-brand outline-none transition-colors focus:border-green-mid focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"

type SubmitStatus = "idle" | "loading" | "success" | "error"

const GENERIC_ERROR = "Something went wrong. Please try again."

type ListBusinessFormState = {
  businessName: string
  category: string
  description: string
  priceRange: string
  openingHours: string
  ownerName: string
  email: string
  phone: string
  whatsapp: string
  website: string
  facebook: string
  address: string
  googleMapsLink: string
  photoLinks: string
  agreedToTerms: boolean
}

function buildInitialForm(defaultCategory: string): ListBusinessFormState {
  return {
    businessName: "",
    category: defaultCategory,
    description: "",
    priceRange: "$ Budget",
    openingHours: "",
    ownerName: "",
    email: "",
    phone: "",
    whatsapp: "",
    website: "",
    facebook: "",
    address: "",
    googleMapsLink: "",
    photoLinks: "",
    agreedToTerms: false,
  }
}

async function submitListing(payload: Record<string, unknown>) {
  const res = await fetch("/api/list-business", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = (await res.json().catch(() => ({}))) as {
    error?: string
    plan?: ListingPlan
    emailWarning?: string
  }

  if (!res.ok) {
    throw new Error(data.error ?? GENERIC_ERROR)
  }

  return data
}

async function uploadPhotos(
  files: File[],
  plan: ListingPlan,
  existingCount: number,
  submissionId: string,
) {
  const formData = new FormData()
  formData.set("plan", plan)
  formData.set("existingCount", String(existingCount))
  formData.set("submissionId", submissionId)
  for (const file of files) {
    formData.append("files", file)
  }

  const res = await fetch("/api/list-business/upload-photos", {
    method: "POST",
    body: formData,
  })

  const data = (await res.json().catch(() => ({}))) as {
    error?: string
    urls?: string[]
  }

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to upload photos.")
  }

  return data.urls ?? []
}

type PhotoFileEntry = {
  id: string
  file: File
  previewUrl: string
  compressing?: boolean
  originalSizeBytes?: number
  compressedSizeBytes?: number
  sizeWarning?: string
}

export default function ListBusinessForm({ categories }: { categories: string[] }) {
  const categoryOptions =
    categories.length > 0
      ? categories
      : getActiveCategoryNames(DEFAULT_CATEGORY_CATALOG)
  const defaultCategory = categoryOptions[0] ?? ""

  const [submissionId] = useState(() => crypto.randomUUID())
  const [plan, setPlan] = useState<(typeof pricingPlans)[number]["name"]>("Basic")
  const [form, setForm] = useState(() => buildInitialForm(defaultCategory))
  const [photoFiles, setPhotoFiles] = useState<PhotoFileEntry[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [submittedPlan, setSubmittedPlan] = useState<ListingPlan>("basic")
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [submittedOwnerName, setSubmittedOwnerName] = useState("")
  const [emailWarning, setEmailWarning] = useState("")

  function updateField<K extends keyof ListBusinessFormState>(
    key: K,
    value: ListBusinessFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const planValue = planFromFormName(plan)
  const photoLimit = photoLimitForPlan(planValue)
  const pastedLinkCount = parsePhotoLinkLines(form.photoLinks).length
  const totalPhotoCount = photoFiles.length + pastedLinkCount

  useEffect(() => {
    return () => {
      for (const entry of photoFiles) {
        URL.revokeObjectURL(entry.previewUrl)
      }
    }
  }, [photoFiles])

  function clearPhotoFiles() {
    setPhotoFiles((prev) => {
      for (const entry of prev) {
        URL.revokeObjectURL(entry.previewUrl)
      }
      return []
    })
  }

  async function handlePhotoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    e.target.value = ""

    if (selected.length === 0) return

    const tooLarge = selected.find((f) => f.size > MAX_PRE_COMPRESS_BYTES)
    if (tooLarge) {
      setStatus("error")
      setErrorMessage("This image is too large. Please choose a photo under 15MB.")
      return
    }

    const invalid = selected.find((f) => !isAllowedPhotoFile(f))
    if (invalid) {
      setStatus("error")
      setErrorMessage("Only JPEG, PNG, WEBP, and HEIC images are allowed.")
      return
    }

    const remaining = photoLimit - pastedLinkCount - photoFiles.length
    if (remaining <= 0) {
      setStatus("error")
      setErrorMessage(
        `You can add at most ${photoLimit} photo${photoLimit === 1 ? "" : "s"} on the ${plan} plan.`,
      )
      return
    }

    const toAdd = selected.slice(0, remaining)
    if (toAdd.length < selected.length) {
      setErrorMessage(
        `Only ${remaining} more photo${remaining === 1 ? "" : "s"} allowed on the ${plan} plan.`,
      )
      setStatus("error")
    }

    for (const file of toAdd) {
      const id = crypto.randomUUID()
      const placeholderPreview = URL.createObjectURL(file)

      setPhotoFiles((prev) => [
        ...prev,
        {
          id,
          file,
          previewUrl: placeholderPreview,
          compressing: true,
          originalSizeBytes: file.size,
        },
      ])

      try {
        const compressed = await compressImage(file)
        const sizeWarning =
          compressed.size > POST_COMPRESS_WARN_BYTES
            ? "Large file after optimization — upload may be slower."
            : undefined

        setPhotoFiles((prev) =>
          prev.map((entry) => {
            if (entry.id !== id) return entry
            URL.revokeObjectURL(placeholderPreview)
            const previewUrl = URL.createObjectURL(compressed)
            return {
              ...entry,
              file: compressed,
              previewUrl,
              compressing: false,
              compressedSizeBytes: compressed.size,
              sizeWarning,
            }
          }),
        )
      } catch {
        setPhotoFiles((prev) =>
          prev.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  compressing: false,
                  compressedSizeBytes: entry.file.size,
                  sizeWarning: "Could not optimize this image — uploading original.",
                }
              : entry,
          ),
        )
      }
    }
  }

  function removePhotoFile(id: string) {
    setPhotoFiles((prev) => {
      const entry = prev.find((p) => p.id === id)
      if (entry) URL.revokeObjectURL(entry.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

    if (!form.agreedToTerms) {
      setStatus("error")
      setErrorMessage("Please agree to the listing terms before submitting.")
      return
    }
    if (
      !form.businessName.trim() ||
      !form.category ||
      !form.description.trim() ||
      !form.ownerName.trim() ||
      !form.phone.trim() ||
      !form.address.trim()
    ) {
      setStatus("error")
      setErrorMessage("Please fill in all required fields.")
      return
    }

    const email = form.email.trim()
    const ownerName = form.ownerName.trim()

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error")
      setErrorMessage("Please provide a valid email address.")
      return
    }

    if (photoFiles.some((entry) => entry.compressing)) {
      setStatus("error")
      setErrorMessage("Please wait while your photos finish optimizing.")
      return
    }

    if (totalPhotoCount > photoLimit) {
      setStatus("error")
      setErrorMessage(
        `You can add at most ${photoLimit} photo${photoLimit === 1 ? "" : "s"} on the ${plan} plan.`,
      )
      return
    }

    try {
      let uploadedUrls: string[] = []
      if (photoFiles.length > 0) {
        setUploadingPhotos(true)
        try {
          uploadedUrls = await uploadPhotos(
            photoFiles.map((p) => p.file),
            planValue,
            pastedLinkCount,
            submissionId,
          )
        } finally {
          setUploadingPhotos(false)
        }
      }

      const photo_links = mergePhotoLinks(uploadedUrls, form.photoLinks)

      const result = await submitListing({
        business_name: form.businessName.trim(),
        category: form.category,
        description: form.description.trim(),
        price_range: form.priceRange,
        opening_hours: form.openingHours.trim(),
        owner_name: form.ownerName.trim(),
        email,
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        website: form.website.trim(),
        facebook: form.facebook.trim(),
        address: form.address.trim(),
        google_maps_link: form.googleMapsLink.trim(),
        photo_links,
        plan: planValue,
        agreed_to_terms: form.agreedToTerms,
      })

      setSubmittedPlan(result.plan ?? planValue)
      setSubmittedEmail(email)
      setSubmittedOwnerName(ownerName)
      setEmailWarning(result.emailWarning ?? "")
      setStatus("success")
      setForm(buildInitialForm(defaultCategory))
      setPlan("Basic")
      clearPhotoFiles()
    } catch (err) {
      setStatus("error")
      setErrorMessage(err instanceof Error ? err.message : GENERIC_ERROR)
    }
  }

  const isLoading = status === "loading"

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-green-mid/30 bg-white p-10 text-center shadow-[0_8px_32px_rgba(26,92,42,0.08)]"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-mid/15 text-2xl">
          ✓
        </div>
        <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
          Thank you {submittedOwnerName}!
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-text-mid">
          Your listing has been submitted successfully.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-text-mid">
          We will review and get back to you within 48 hours.
        </p>
        {emailWarning && (
          <p className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-50 px-4 py-3 text-sm text-text-mid">
            {emailWarning}
          </p>
        )}
        {isPaidPlan(submittedPlan) && (
          <p className="mt-4 rounded-xl border border-orange-brand/30 bg-orange-brand/10 px-4 py-3 text-sm font-semibold text-orange-brand">
            {submittedEmail
              ? `Payment instructions will be sent to ${submittedEmail} within 24 hours.`
              : "We will contact you by phone with payment instructions within 24 hours."}
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            setStatus("idle")
            setSubmittedEmail("")
            setSubmittedOwnerName("")
            setSubmittedPlan("basic")
            setEmailWarning("")
            clearPhotoFiles()
          }}
          className="btn-primary mt-8 cursor-pointer px-8 py-3"
        >
          Submit another listing
        </button>
      </div>
    )
  }

  return (
    <form
      className="rounded-2xl border border-border-brand bg-white p-10 shadow-[0_8px_32px_rgba(26,92,42,0.08)]"
      onSubmit={handleSubmit}
      noValidate
    >
      <FormSection title="1. Business Details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Business Name">
            <input
              type="text"
              placeholder="e.g. Jungle Wildlife Camp"
              className={inputClass}
              value={form.businessName}
              onChange={(e) => updateField("businessName", e.target.value)}
              required
              disabled={isLoading}
            />
          </Field>
          <Field label="Category">
            <select
              className={inputClass}
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              required
              disabled={isLoading}
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Description">
          <textarea
            className={`${inputClass} min-h-[100px] resize-y`}
            placeholder="Describe your business, services, and what makes it special..."
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            required
            disabled={isLoading}
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Price Range">
            <select
              className={inputClass}
              value={form.priceRange}
              onChange={(e) => updateField("priceRange", e.target.value)}
              disabled={isLoading}
            >
              <option>$ Budget</option>
              <option>$$ Mid-range</option>
              <option>$$$ Premium</option>
            </select>
          </Field>
          <Field label="Opening Hours">
            <input
              type="text"
              placeholder="e.g. 7:00 AM – 10:00 PM"
              className={inputClass}
              value={form.openingHours}
              onChange={(e) => updateField("openingHours", e.target.value)}
              disabled={isLoading}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="2. Contact Details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Owner Name">
            <input
              type="text"
              className={inputClass}
              value={form.ownerName}
              onChange={(e) => updateField("ownerName", e.target.value)}
              required
              disabled={isLoading}
            />
          </Field>
          <Field label="Email (optional)">
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </Field>
          <Field label="Phone">
            <input
              type="tel"
              className={inputClass}
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              required
              disabled={isLoading}
            />
          </Field>
          <Field label="WhatsApp">
            <input
              type="tel"
              placeholder="+977..."
              className={inputClass}
              value={form.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
              disabled={isLoading}
            />
          </Field>
          <Field label="Website (optional)">
            <input
              type="text"
              className={inputClass}
              value={form.website}
              onChange={(e) => updateField("website", e.target.value)}
              placeholder="https://..."
              disabled={isLoading}
            />
          </Field>
          <Field label="Social Media (optional)">
            <input
              type="text"
              className={inputClass}
              value={form.facebook}
              onChange={(e) => updateField("facebook", e.target.value)}
              placeholder="https://..."
              disabled={isLoading}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="3. Location">
        <Field label="Full Address">
          <input
            type="text"
            placeholder="Street, Sauraha, Chitwan"
            className={inputClass}
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            required
            disabled={isLoading}
          />
        </Field>
        <Field label="Google Maps Link">
          <input
            type="text"
            placeholder="https://maps.google.com/..."
            className={inputClass}
            value={form.googleMapsLink}
            onChange={(e) => updateField("googleMapsLink", e.target.value)}
            disabled={isLoading}
          />
        </Field>
      </FormSection>

      <FormSection title="4. Photos">
        <p className="text-sm text-text-light">
          Upload JPEG, PNG, WEBP, or HEIC files and/or paste image links (one per line). Photos are
          optimized in your browser before upload.{" "}
          <span className="font-semibold text-text-mid">
            {totalPhotoCount} / {photoLimit} used
          </span>{" "}
          on your {plan} plan.
        </p>
        <Field label="Upload photos (JPEG, PNG, WEBP, or HEIC)">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
            multiple
            className={`${inputClass} cursor-pointer file:mr-4 file:rounded-xl file:border-0 file:bg-green-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white`}
            onChange={handlePhotoFileChange}
            disabled={isLoading || uploadingPhotos || photoFiles.some((p) => p.compressing) || totalPhotoCount >= photoLimit}
          />
        </Field>
        {uploadingPhotos && (
          <div className="mt-2">
            <div className="h-2 overflow-hidden rounded-xl bg-cream">
              <div className="h-full w-2/3 animate-pulse rounded-xl bg-green-brand" />
            </div>
            <p className="mt-1 text-xs text-text-light">Uploading photos…</p>
          </div>
        )}
        {photoFiles.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photoFiles.map((entry) => (
              <li
                key={entry.id}
                className="relative aspect-square overflow-hidden rounded-xl border border-border-brand"
              >
                <Image
                  src={entry.previewUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="120px"
                  unoptimized
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/65 px-2 py-1.5 text-[0.65rem] leading-snug text-white">
                  {entry.compressing ? (
                    <span>Optimizing image…</span>
                  ) : entry.originalSizeBytes != null && entry.compressedSizeBytes != null ? (
                    <span>
                      {formatImageBytes(entry.originalSizeBytes)} →{" "}
                      {formatImageBytes(entry.compressedSizeBytes)}
                    </span>
                  ) : null}
                  {entry.sizeWarning ? (
                    <p className="mt-0.5 text-orange-light">{entry.sizeWarning}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => removePhotoFile(entry.id)}
                  disabled={isLoading}
                  className="absolute top-1 right-1 rounded-xl bg-black/60 px-2 py-0.5 text-xs font-bold text-white"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <Field label="Photo links (one per line)">
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            placeholder="https://example.com/photo1.jpg"
            value={form.photoLinks}
            onChange={(e) => updateField("photoLinks", e.target.value)}
            disabled={isLoading}
          />
        </Field>
      </FormSection>

      <FormSection title="5. Choose Your Plan">
        <div className="grid gap-3 md:grid-cols-3">
          {pricingPlans.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setPlan(p.name)}
              disabled={isLoading}
              className={`cursor-pointer rounded-xl border-2 p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                plan === p.name
                  ? "border-orange-brand bg-orange-brand/5"
                  : "border-border-brand hover:border-green-mid"
              }`}
            >
              {p.popular && (
                <span className="mb-1 inline-block rounded-full bg-orange-brand px-2 py-0.5 text-[0.6rem] font-bold text-white uppercase">
                  Most Popular
                </span>
              )}
              <p className="font-[family-name:var(--font-playfair)] text-base font-bold text-green-brand">
                {p.name}
              </p>
              <p className="text-lg font-bold text-orange-brand">
                {p.price}
                <span className="text-[0.65rem] font-normal text-text-light"> / {p.period}</span>
              </p>
            </button>
          ))}
        </div>
      </FormSection>

      <label className="mt-8 flex cursor-pointer items-start gap-3 text-sm text-text-mid">
        <input
          type="checkbox"
          required
          className="mt-1"
          checked={form.agreedToTerms}
          onChange={(e) => updateField("agreedToTerms", e.target.checked)}
          disabled={isLoading}
        />
        <span>
          I confirm the information provided is accurate and I agree to the listing
          terms and review process.
        </span>
      </label>

      {status === "error" && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-orange-brand/30 bg-orange-brand/10 px-4 py-3 text-center text-sm font-semibold text-orange-brand"
        >
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        className="btn-primary mt-6 flex w-full cursor-pointer items-center justify-center gap-2 py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isLoading}
      >
        {isLoading && <Spinner />}
        {isLoading ? "Submitting…" : "Submit Listing Application"}
      </button>
    </form>
  )
}

function Spinner() {
  return (
    <span
      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
      aria-hidden
    />
  )
}

function FormSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="mb-10 border-none">
      <legend className="mb-5 font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
        {title}
      </legend>
      <div className="space-y-4">{children}</div>
    </fieldset>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-text-mid">{label}</label>
      {children}
    </div>
  )
}
