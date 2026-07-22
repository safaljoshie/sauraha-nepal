"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, type FormEvent } from "react"
import { MAX_PRE_COMPRESS_BYTES, compressImage } from "@/lib/compress-image"
import { isAllowedPhotoFile } from "@/lib/list-business-photos"
import {
  COMMON_EXPERTISE,
  COMMON_LANGUAGES,
  type GuideService,
} from "@/lib/tour-guides"
import { useRecaptchaToken } from "@/lib/use-recaptcha-token"

const inputClass =
  "w-full rounded-xl border-[1.5px] border-border-brand bg-cream px-4 py-3 text-sm text-text-brand outline-none transition-colors focus:border-green-mid focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"

type SubmitStatus = "idle" | "loading" | "success" | "error"

const GENERIC_ERROR = "Something went wrong. Please try again."

type ListGuideFormState = {
  full_name: string
  nickname: string
  bio: string
  years_experience: string
  location: string
  phone: string
  whatsapp: string
  email: string
  facebook_url: string
  instagram_url: string
  website_url: string
  licence_number: string
  languages: string[]
  expertise: string[]
  services: GuideService[]
  agreedToTerms: boolean
}

const INITIAL_FORM: ListGuideFormState = {
  full_name: "",
  nickname: "",
  bio: "",
  years_experience: "",
  location: "Sauraha, Chitwan",
  phone: "",
  whatsapp: "",
  email: "",
  facebook_url: "",
  instagram_url: "",
  website_url: "",
  licence_number: "",
  languages: [],
  expertise: [],
  services: [{ name: "", price_npr: 0, description: "" }],
  agreedToTerms: false,
}

async function submitGuideApplication(
  payload: Record<string, unknown>,
  submissionId: string,
) {
  const res = await fetch("/api/list-guide", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, id: submissionId }),
  })

  const data = (await res.json().catch(() => ({}))) as {
    error?: string
    emailWarning?: string
  }

  if (!res.ok) {
    throw new Error(data.error ?? GENERIC_ERROR)
  }

  return data
}

async function uploadPhoto(file: File, submissionId: string) {
  const formData = new FormData()
  formData.set("submissionId", submissionId)
  formData.append("files", file)

  const res = await fetch("/api/list-guide/upload-photo", {
    method: "POST",
    body: formData,
  })

  const data = (await res.json().catch(() => ({}))) as {
    error?: string
    urls?: string[]
  }

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to upload photo.")
  }

  return data.urls?.[0] ?? ""
}

export default function ListGuideForm() {
  const [submissionId] = useState(() => crypto.randomUUID())
  const [form, setForm] = useState<ListGuideFormState>(INITIAL_FORM)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [submittedName, setSubmittedName] = useState("")
  const [emailWarning, setEmailWarning] = useState("")
  const [customLanguage, setCustomLanguage] = useState("")
  const [customExpertise, setCustomExpertise] = useState("")
  const getRecaptchaToken = useRecaptchaToken()

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview])

  function updateField<K extends keyof ListGuideFormState>(
    key: K,
    value: ListGuideFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleArrayItem(key: "languages" | "expertise", value: string) {
    setForm((prev) => {
      const list = prev[key]
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      }
    })
  }

  function addCustomTag(key: "languages" | "expertise", raw: string) {
    const value = raw.trim()
    if (!value) return
    setForm((prev) => {
      if (prev[key].includes(value)) return prev
      return { ...prev, [key]: [...prev[key], value] }
    })
    if (key === "languages") setCustomLanguage("")
    else setCustomExpertise("")
  }

  function updateService(index: number, patch: Partial<GuideService>) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }))
  }

  function addServiceRow() {
    setForm((prev) => ({
      ...prev,
      services: [...prev.services, { name: "", price_npr: 0, description: "" }],
    }))
  }

  function removeServiceRow(index: number) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.length > 1 ? prev.services.filter((_, i) => i !== index) : prev.services,
    }))
  }

  function clearPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    if (file.size > MAX_PRE_COMPRESS_BYTES) {
      setStatus("error")
      setErrorMessage("This image is too large. Please choose a photo under 15MB.")
      return
    }

    if (!isAllowedPhotoFile(file)) {
      setStatus("error")
      setErrorMessage("Only JPEG, PNG, WEBP, and HEIC images are allowed.")
      return
    }

    clearPhoto()
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setStatus("idle")
    setErrorMessage("")
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

    if (!form.agreedToTerms) {
      setStatus("error")
      setErrorMessage("Please agree to the terms before submitting.")
      return
    }

    try {
      let photo_url = ""
      if (photoFile) {
        setUploadingPhoto(true)
        try {
          const compressed = await compressImage(photoFile)
          photo_url = await uploadPhoto(compressed, submissionId)
          if (!photo_url) {
            throw new Error("Photo upload did not return a URL. Please try again.")
          }
        } finally {
          setUploadingPhoto(false)
        }
      }

      const years =
        form.years_experience.trim() === ""
          ? null
          : Number.parseInt(form.years_experience, 10)

      const recaptchaToken = await getRecaptchaToken("list_guide")
      if (!recaptchaToken) {
        throw new Error("We couldn't verify you're human. Please try again.")
      }

      const result = await submitGuideApplication(
        {
          full_name: form.full_name.trim(),
          nickname: form.nickname.trim(),
          photo_url,
          bio: form.bio.trim(),
          years_experience: years != null && !Number.isNaN(years) ? years : null,
          location: form.location.trim(),
          phone: form.phone.trim(),
          whatsapp: form.whatsapp.trim(),
          email: form.email.trim(),
          facebook_url: form.facebook_url.trim(),
          instagram_url: form.instagram_url.trim(),
          website_url: form.website_url.trim(),
          licence_number: form.licence_number.trim(),
          languages: form.languages,
          expertise: form.expertise,
          services: form.services,
          agreed_to_terms: form.agreedToTerms,
          recaptchaToken,
        },
        submissionId,
      )

      setSubmittedName(form.full_name.trim())
      setEmailWarning(result.emailWarning ?? "")
      setStatus("success")
      setForm(INITIAL_FORM)
      clearPhoto()
      setCustomLanguage("")
      setCustomExpertise("")
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
        className="rounded-2xl border border-green-mid/30 bg-white p-5 text-center shadow-[0_8px_32px_rgba(26,92,42,0.08)] sm:p-8 md:p-10"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-mid/15 text-2xl">
          ✓
        </div>
        <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
          Thank you{submittedName ? `, ${submittedName}` : ""}!
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-text-mid">
          Your guide application has been received.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-text-mid">
          We will review your profile and get back to you within 24 hours.
        </p>
        {emailWarning && (
          <p className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-50 px-4 py-3 text-sm text-text-mid">
            {emailWarning}
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            setStatus("idle")
            setSubmittedName("")
            setEmailWarning("")
          }}
          className="btn-primary mt-8 w-full cursor-pointer px-8 py-3 sm:w-auto"
        >
          Submit another application
        </button>
      </div>
    )
  }

  return (
    <form
      className="scroll-pb-28 rounded-2xl border border-border-brand bg-white p-5 shadow-[0_8px_32px_rgba(26,92,42,0.08)] sm:p-8 md:p-10"
      onSubmit={handleSubmit}
      noValidate
    >
      <FormSection title="1. Personal Details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name *">
            <input
              type="text"
              placeholder="e.g. Ram Bahadur Thapa"
              className={inputClass}
              value={form.full_name}
              onChange={(e) => updateField("full_name", e.target.value)}
              required
              disabled={isLoading}
            />
          </Field>
          <Field label="Nickname (optional)">
            <input
              type="text"
              placeholder="e.g. Ram Dai"
              className={inputClass}
              value={form.nickname}
              onChange={(e) => updateField("nickname", e.target.value)}
              disabled={isLoading}
            />
          </Field>
          <Field label="Years of experience">
            <input
              type="number"
              min={0}
              placeholder="e.g. 12"
              className={inputClass}
              value={form.years_experience}
              onChange={(e) => updateField("years_experience", e.target.value)}
              disabled={isLoading}
            />
          </Field>
          <Field label="Location">
            <input
              type="text"
              className={inputClass}
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              disabled={isLoading}
            />
          </Field>
        </div>
        <Field label="Profile photo (optional)">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <label
              className={`inline-flex cursor-pointer items-center rounded-full border-2 border-green-brand px-5 py-2.5 text-sm font-semibold text-green-brand transition-colors hover:bg-green-brand/5 ${
                isLoading || uploadingPhoto ? "pointer-events-none opacity-60" : ""
              }`}
            >
              Choose file
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={handlePhotoChange}
                disabled={isLoading || uploadingPhoto}
                className="sr-only"
              />
            </label>
            {!photoPreview ? (
              <span className="text-sm text-text-light">JPEG, PNG, WEBP, or HEIC</span>
            ) : null}
            {photoPreview ? (
              <div className="flex items-center gap-3">
                <Image
                  src={photoPreview}
                  alt="Profile preview"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  disabled={isLoading}
                  className="text-sm font-semibold text-red-700 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : null}
          </div>
        </Field>
        <Field label="Bio / About *">
          <textarea
            className={`${inputClass} min-h-[120px] resize-y`}
            placeholder="Tell travellers about your experience, specialities, and what makes your tours memorable..."
            value={form.bio}
            onChange={(e) => updateField("bio", e.target.value)}
            required
            disabled={isLoading}
          />
        </Field>
      </FormSection>

      <FormSection title="2. Contact">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Phone *">
            <input
              type="tel"
              placeholder="+977 98XXXXXXXX"
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
              placeholder="+977 98XXXXXXXX"
              className={inputClass}
              value={form.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
              disabled={isLoading}
            />
          </Field>
          <Field label="Email *">
            <input
              type="email"
              placeholder="you@example.com"
              className={inputClass}
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
              disabled={isLoading}
            />
          </Field>
          <Field label="Website">
            <input
              type="url"
              placeholder="https://"
              className={inputClass}
              value={form.website_url}
              onChange={(e) => updateField("website_url", e.target.value)}
              disabled={isLoading}
            />
          </Field>
          <Field label="Facebook">
            <input
              type="url"
              placeholder="https://facebook.com/..."
              className={inputClass}
              value={form.facebook_url}
              onChange={(e) => updateField("facebook_url", e.target.value)}
              disabled={isLoading}
            />
          </Field>
          <Field label="Instagram">
            <input
              type="url"
              placeholder="https://instagram.com/..."
              className={inputClass}
              value={form.instagram_url}
              onChange={(e) => updateField("instagram_url", e.target.value)}
              disabled={isLoading}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="3. Professional">
        <Field label="Tour guide licence number">
          <input
            type="text"
            placeholder="Your Nepal Tourism Board licence number"
            className={inputClass}
            value={form.licence_number}
            onChange={(e) => updateField("licence_number", e.target.value)}
            disabled={isLoading}
          />
        </Field>
      </FormSection>

      <FormSection title="4. Languages *">
        <div className="flex flex-wrap gap-2">
          {COMMON_LANGUAGES.map((lang) => (
            <TagButton
              key={lang}
              active={form.languages.includes(lang)}
              onClick={() => toggleArrayItem("languages", lang)}
              label={lang}
              disabled={isLoading}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={customLanguage}
            onChange={(e) => setCustomLanguage(e.target.value)}
            placeholder="Add another language"
            className={inputClass}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addCustomTag("languages", customLanguage)
              }
            }}
          />
          <button
            type="button"
            onClick={() => addCustomTag("languages", customLanguage)}
            disabled={isLoading}
            className="w-full shrink-0 cursor-pointer rounded-xl bg-cream px-4 py-3 text-sm font-semibold text-text-brand hover:bg-green-mid/10 disabled:opacity-60 sm:w-auto"
          >
            Add
          </button>
        </div>
      </FormSection>

      <FormSection title="5. Expertise">
        <div className="flex flex-wrap gap-2">
          {COMMON_EXPERTISE.map((tag) => (
            <TagButton
              key={tag}
              active={form.expertise.includes(tag)}
              onClick={() => toggleArrayItem("expertise", tag)}
              label={tag}
              disabled={isLoading}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={customExpertise}
            onChange={(e) => setCustomExpertise(e.target.value)}
            placeholder="Add another expertise"
            className={inputClass}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addCustomTag("expertise", customExpertise)
              }
            }}
          />
          <button
            type="button"
            onClick={() => addCustomTag("expertise", customExpertise)}
            disabled={isLoading}
            className="w-full shrink-0 cursor-pointer rounded-xl bg-cream px-4 py-3 text-sm font-semibold text-text-brand hover:bg-green-mid/10 disabled:opacity-60 sm:w-auto"
          >
            Add
          </button>
        </div>
      </FormSection>

      <FormSection title="6. Services & pricing *">
        <p className="mb-4 text-sm text-text-light">
          Add at least one service with a price in NPR (Nepalese Rupees).
        </p>
        {form.services.map((service, index) => (
          <div
            key={index}
            className="mb-3 grid gap-3 rounded-xl border border-border-brand bg-cream/50 p-3 sm:p-4 md:grid-cols-[1fr_140px_1fr_auto]"
          >
            <input
              value={service.name}
              onChange={(e) => updateService(index, { name: e.target.value })}
              placeholder="Full-day jungle safari"
              className={inputClass}
              disabled={isLoading}
            />
            <input
              type="number"
              min={0}
              value={service.price_npr || ""}
              onChange={(e) =>
                updateService(index, { price_npr: Number(e.target.value) || 0 })
              }
              placeholder="Price (NPR)"
              className={inputClass}
              disabled={isLoading}
            />
            <input
              value={service.description ?? ""}
              onChange={(e) => updateService(index, { description: e.target.value })}
              placeholder="Description (optional)"
              className={inputClass}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => removeServiceRow(index)}
              disabled={isLoading || form.services.length === 1}
              className="mt-1 w-full rounded-lg border border-red-200 bg-white py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40 md:mt-0 md:w-auto md:self-center md:border-0 md:bg-transparent md:py-0 md:hover:bg-transparent md:hover:underline"
            >
              <span className="md:hidden">Remove service</span>
              <span className="hidden md:inline">Remove</span>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addServiceRow}
          disabled={isLoading}
          className="cursor-pointer text-sm font-semibold text-green-brand hover:underline disabled:opacity-60"
        >
          + Add another service
        </button>
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
          I confirm the information provided is accurate and I agree to the{" "}
          <Link href="/privacy-policy" className="font-semibold text-green-brand hover:underline">
            privacy policy
          </Link>{" "}
          and review process.
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
        {isLoading ? (
          uploadingPhoto ? (
            "Uploading photo…"
          ) : (
            "Submitting…"
          )
        ) : (
          <>
            <span className="sm:hidden">Submit application</span>
            <span className="hidden sm:inline">Submit Guide Application</span>
          </>
        )}
      </button>
    </form>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 border-b border-border-brand pb-6 last:mb-0 last:border-0 last:pb-0 sm:mb-8 sm:pb-8">
      <h3 className="font-[family-name:var(--font-playfair)] text-base font-bold text-green-brand sm:text-lg">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-text-mid">{label}</span>
      {children}
    </label>
  )
}

function TagButton({
  active,
  onClick,
  label,
  disabled,
}: {
  active: boolean
  onClick: () => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[44px] cursor-pointer rounded-full px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? "bg-green-brand text-white"
          : "border border-border-brand bg-white text-text-mid hover:border-green-mid"
      }`}
    >
      {label}
    </button>
  )
}

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
      aria-hidden
    />
  )
}
