"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { ContactPageContent } from "@/lib/site-content"

type Toast = { id: string; type: "success" | "error"; message: string }
type FormState = {
  heading: string
  subheading: string
  address: string
  phone: string
  whatsapp: string
  email: string
  response_time: string
}

const fieldClass =
  "w-full rounded-[10px] border border-border-brand bg-cream px-3 py-2 text-sm text-text-brand outline-none focus:border-green-mid focus:bg-white"

export default function AdminContactContentManager() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    heading: "",
    subheading: "",
    address: "",
    phone: "",
    whatsapp: "",
    email: "",
    response_time: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [toasts, setToasts] = useState<Toast[]>([])

  function showToast(type: Toast["type"], message: string) {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

  function applyContent(content: ContactPageContent | null) {
    setForm({
      heading: content?.heading ?? "Let's connect",
      subheading:
        content?.subheading ??
        "Have a question about Sauraha? Want to list your business or partner with us? Fill in the form and we'll get back to you within 24 hours.",
      address: content?.address ?? "Sauraha, Chitwan, Nepal",
      phone: content?.phone ?? "",
      whatsapp: content?.whatsapp ?? "+977 98XXXXXXXX",
      email: content?.email ?? "hello@mail.saurahanepal.com",
      response_time: content?.response_time ?? "Within 24 hours (NPT timezone)",
    })
  }

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("/api/admin/site/contact")
        if (res.status === 401) {
          router.push("/admin")
          return
        }
        const data = (await res.json()) as { content?: ContactPageContent | null; error?: string }
        if (!res.ok) {
          if (mounted) setError(data.error ?? "Failed to load contact content.")
          return
        }
        if (mounted) applyContent(data.content ?? null)
      } catch {
        if (mounted) setError("Failed to load contact content.")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [router])

  async function handleSave() {
    const heading = form.heading.trim()
    const phone = form.phone.trim()
    const whatsapp = form.whatsapp.trim()
    const email = form.email.trim()

    if (!heading) {
      setError("Heading is required.")
      return
    }
    if (!phone && !whatsapp && !email) {
      setError("Provide at least one contact method: phone, WhatsApp, or email.")
      return
    }

    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/admin/site/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          heading,
          subheading: form.subheading.trim(),
          address: form.address.trim(),
          phone,
          whatsapp,
          email,
          response_time: form.response_time.trim(),
        }),
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { content?: ContactPageContent; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to save contact content.")
        showToast("error", "Failed to save contact content.")
        return
      }
      applyContent(data.content ?? null)
      showToast("success", "Contact content updated.")
    } catch {
      setError("Failed to save contact content.")
      showToast("error", "Failed to save contact content.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border-brand pb-6">
        <div>
          <p className="text-xs font-bold tracking-widest text-orange-brand uppercase">Admin</p>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand md:text-3xl">
            Contact Content
          </h1>
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

      <div className="rounded-2xl border border-border-brand bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-text-light">Loading contact content…</p>
        ) : (
          <div className="space-y-4">
            <Field label="Heading" required>
              <input
                value={form.heading}
                onChange={(e) => setForm((prev) => ({ ...prev, heading: e.target.value }))}
                className={fieldClass}
              />
            </Field>
            <Field label="Subheading">
              <textarea
                value={form.subheading}
                onChange={(e) => setForm((prev) => ({ ...prev, subheading: e.target.value }))}
                className={`${fieldClass} min-h-[80px]`}
              />
            </Field>
            <Field label="Address">
              <input
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                className={fieldClass}
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Phone">
                <input
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className={fieldClass}
                />
              </Field>
              <Field label="WhatsApp">
                <input
                  value={form.whatsapp}
                  onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                  className={fieldClass}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className={fieldClass}
                />
              </Field>
            </div>
            <Field label="Response Time">
              <input
                value={form.response_time}
                onChange={(e) => setForm((prev) => ({ ...prev, response_time: e.target.value }))}
                className={fieldClass}
              />
            </Field>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-green-brand px-5 py-2 text-sm font-semibold text-white hover:bg-green-mid disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Contact Content"}
            </button>
          </div>
        )}
      </div>

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
