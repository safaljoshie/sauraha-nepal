"use client"

import { useState, type FormEvent } from "react"
import {
  isPaidPlan,
  planFromFormName,
  type ListingPlan,
} from "@/lib/list-business"
import { businessCategories, pricingPlans } from "@/lib/data"

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-border-brand bg-cream px-4 py-3 text-sm text-text-brand outline-none transition-colors focus:border-green-mid focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"

type SubmitStatus = "idle" | "loading" | "success" | "error"

const GENERIC_ERROR = "Something went wrong. Please try again."

const initialForm = {
  businessName: "",
  category: businessCategories[0] as string,
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

async function submitListing(payload: Record<string, unknown>) {
  const res = await fetch("/api/list-business", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = (await res.json().catch(() => ({}))) as {
    error?: string
    plan?: ListingPlan
  }

  if (!res.ok) {
    throw new Error(GENERIC_ERROR)
  }

  return data
}

export default function ListBusinessForm() {
  const [plan, setPlan] = useState<(typeof pricingPlans)[number]["name"]>("Basic")
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [submittedPlan, setSubmittedPlan] = useState<ListingPlan>("basic")
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [submittedOwnerName, setSubmittedOwnerName] = useState("")

  function updateField<K extends keyof typeof initialForm>(
    key: K,
    value: (typeof initialForm)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

    if (
      !form.businessName.trim() ||
      !form.category ||
      !form.description.trim() ||
      !form.ownerName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.agreedToTerms
    ) {
      setStatus("error")
      setErrorMessage(GENERIC_ERROR)
      return
    }

    const email = form.email.trim()
    const ownerName = form.ownerName.trim()
    const planValue = planFromFormName(plan)

    try {
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
        photo_links: form.photoLinks.trim(),
        plan: planValue,
        agreed_to_terms: form.agreedToTerms,
      })

      setSubmittedPlan(result.plan ?? planValue)
      setSubmittedEmail(email)
      setSubmittedOwnerName(ownerName)
      setStatus("success")
      setForm(initialForm)
      setPlan("Basic")
    } catch {
      setStatus("error")
      setErrorMessage(GENERIC_ERROR)
    }
  }

  const isLoading = status === "loading"

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-[20px] border border-green-mid/30 bg-white p-10 text-center shadow-[0_8px_32px_rgba(26,92,42,0.08)]"
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
        {isPaidPlan(submittedPlan) && (
          <p className="mt-4 rounded-[10px] border border-orange-brand/30 bg-orange-brand/10 px-4 py-3 text-sm font-semibold text-orange-brand">
            Payment instructions will be sent to {submittedEmail} within 24 hours.
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            setStatus("idle")
            setSubmittedEmail("")
            setSubmittedOwnerName("")
            setSubmittedPlan("basic")
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
      className="rounded-[20px] border border-border-brand bg-white p-10 shadow-[0_8px_32px_rgba(26,92,42,0.08)]"
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
              {businessCategories.map((cat) => (
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
          <Field label="Email">
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
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
              type="url"
              className={inputClass}
              value={form.website}
              onChange={(e) => updateField("website", e.target.value)}
              disabled={isLoading}
            />
          </Field>
          <Field label="Facebook (optional)">
            <input
              type="url"
              className={inputClass}
              value={form.facebook}
              onChange={(e) => updateField("facebook", e.target.value)}
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
            type="url"
            placeholder="https://maps.google.com/..."
            className={inputClass}
            value={form.googleMapsLink}
            onChange={(e) => updateField("googleMapsLink", e.target.value)}
            disabled={isLoading}
          />
        </Field>
      </FormSection>

      <FormSection title="4. Photos">
        <Field label="Photo URLs (one per line)">
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            placeholder="Paste links to your photos..."
            value={form.photoLinks}
            onChange={(e) => updateField("photoLinks", e.target.value)}
            disabled={isLoading}
          />
        </Field>
      </FormSection>

      <FormSection title="5. Choose Your Plan">
        <div className="grid gap-4 md:grid-cols-3">
          {pricingPlans.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setPlan(p.name)}
              disabled={isLoading}
              className={`cursor-pointer rounded-2xl border-2 p-5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                plan === p.name
                  ? "border-orange-brand bg-orange-brand/5"
                  : "border-border-brand hover:border-green-mid"
              }`}
            >
              {p.popular && (
                <span className="mb-2 inline-block rounded-full bg-orange-brand px-2 py-0.5 text-[0.65rem] font-bold text-white uppercase">
                  Most Popular
                </span>
              )}
              <p className="font-[family-name:var(--font-playfair)] text-lg font-bold text-green-brand">
                {p.name}
              </p>
              <p className="text-2xl font-bold text-orange-brand">
                {p.price}
                <span className="text-xs font-normal text-text-light"> / {p.period}</span>
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
          className="mt-4 rounded-[10px] border border-orange-brand/30 bg-orange-brand/10 px-4 py-3 text-center text-sm font-semibold text-orange-brand"
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
