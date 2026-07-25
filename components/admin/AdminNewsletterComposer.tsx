"use client"

import "@uiw/react-md-editor/markdown-editor.css"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { marked } from "marked"
import { useCallback, useEffect, useMemo, useState } from "react"
import { applyInlineStyles, buildEmailHTML } from "@/lib/emails/newsletter"
import {
  PREVIEW_TEXT_MAX,
  SUBJECT_MAX,
  type CampaignStatus,
  type NewsletterCampaign,
} from "@/lib/newsletter"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

const DEFAULT_TEST_EMAIL = "safaljoshie@gmail.com"

const fieldClass =
  "w-full rounded-[10px] border border-border-brand bg-cream px-3 py-2 text-sm text-text-brand outline-none focus:border-green-mid focus:bg-white"

type FormState = {
  title: string
  subject: string
  preview_text: string
  content: string
}

const emptyForm: FormState = { title: "", subject: "", preview_text: "", content: "" }

export default function AdminNewsletterComposer({ campaignId }: { campaignId?: string }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [status, setStatus] = useState<CampaignStatus>("draft")
  const [loading, setLoading] = useState(!!campaignId)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(false)

  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("09:00")

  const [testEmail, setTestEmail] = useState(DEFAULT_TEST_EMAIL)
  const [renderedHtml, setRenderedHtml] = useState("")

  const readOnly = status === "sent" || status === "sending"

  const load = useCallback(async () => {
    if (!campaignId) return
    // `loading` already initializes to true when campaignId is set, so we avoid
    // a synchronous setState here (which would trigger cascading renders).
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${campaignId}`)
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { campaign?: NewsletterCampaign; error?: string }
      if (!res.ok || !data.campaign) {
        setError(data.error ?? "Campaign not found.")
        return
      }
      setForm({
        title: data.campaign.title,
        subject: data.campaign.subject,
        preview_text: data.campaign.preview_text ?? "",
        content: data.campaign.content_json ?? "",
      })
      setStatus(data.campaign.status)
    } catch {
      setError("Failed to load campaign.")
    } finally {
      setLoading(false)
    }
  }, [campaignId, router])

  useEffect(() => {
    load()
  }, [load])

  // Live email preview: render markdown (async-safe) then inline styles.
  useEffect(() => {
    let active = true
    Promise.resolve(marked.parse(form.content || "")).then((html) => {
      if (active) setRenderedHtml(applyInlineStyles(html))
    })
    return () => {
      active = false
    }
  }, [form.content])

  const previewDoc = useMemo(() => {
    return buildEmailHTML(
      renderedHtml,
      { subject: form.subject, preview_text: form.preview_text },
      { email: testEmail, name: null, unsubscribe_token: "preview-token" },
    )
  }, [renderedHtml, form.subject, form.preview_text, testEmail])

  function validate(): string | null {
    if (!form.title.trim()) return "Campaign title is required."
    if (!form.subject.trim()) return "Email subject line is required."
    return null
  }

  /** Creates or updates the campaign; returns its id (or null on failure). */
  const persist = useCallback(async (): Promise<string | null> => {
    const payload = {
      title: form.title.trim(),
      subject: form.subject.trim(),
      preview_text: form.preview_text.trim(),
      content: form.content,
    }
    const res = campaignId
      ? await fetch(`/api/admin/newsletter/campaigns/${campaignId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/newsletter/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

    if (res.status === 401) {
      router.push("/admin")
      return null
    }
    const data = (await res.json()) as { campaign?: NewsletterCampaign; error?: string }
    if (!res.ok || !data.campaign) {
      setError(data.error ?? "Failed to save campaign.")
      return null
    }
    return data.campaign.id
  }, [campaignId, form, router])

  async function saveDraft() {
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }
    setBusy(true)
    setError("")
    setNotice("")
    const id = await persist()
    setBusy(false)
    if (id) {
      router.push("/admin/dashboard")
      router.refresh()
    }
  }

  async function sendNow() {
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }
    if (!window.confirm("Send this campaign now to all active, confirmed subscribers?")) return
    setBusy(true)
    setError("")
    setNotice("")
    const id = await persist()
    if (!id) {
      setBusy(false)
      return
    }
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: id }),
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { sent?: number; failed?: number; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to send campaign.")
        return
      }
      router.push("/admin/dashboard")
      router.refresh()
    } catch {
      setError("Failed to send campaign.")
    } finally {
      setBusy(false)
    }
  }

  async function schedule() {
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }
    if (!scheduleDate || !scheduleTime) {
      setError("Choose a date and time to schedule.")
      return
    }
    // Interpret the chosen wall-clock time as Nepal Time (UTC+5:45).
    const sendAt = new Date(`${scheduleDate}T${scheduleTime}:00+05:45`)
    if (Number.isNaN(sendAt.getTime())) {
      setError("Invalid schedule date or time.")
      return
    }
    if (sendAt.getTime() <= Date.now()) {
      setError("Pick a time in the future.")
      return
    }
    setBusy(true)
    setError("")
    setNotice("")
    const id = await persist()
    if (!id) {
      setBusy(false)
      return
    }
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: id, sendAt: sendAt.toISOString() }),
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to schedule campaign.")
        return
      }
      router.push("/admin/dashboard")
      router.refresh()
    } catch {
      setError("Failed to schedule campaign.")
    } finally {
      setBusy(false)
    }
  }

  async function sendTest() {
    if (!form.subject.trim()) {
      setError("Add a subject line before sending a test.")
      return
    }
    setBusy(true)
    setError("")
    setNotice("")
    try {
      const res = await fetch("/api/admin/newsletter/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: testEmail,
          subject: form.subject,
          preview_text: form.preview_text,
          content: form.content,
        }),
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to send test email.")
        return
      }
      setNotice(`Test email sent to ${testEmail}.`)
    } catch {
      setError("Failed to send test email.")
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-12 text-text-light">Loading composer…</div>
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8" data-color-mode="light">
      <Link
        href="/admin/dashboard"
        className="text-sm font-semibold text-green-mid hover:text-green-brand"
      >
        ← Back to dashboard
      </Link>

      <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
        {campaignId ? "Edit Campaign" : "New Campaign"}
      </h1>

      {readOnly && (
        <p className="mt-4 rounded-[10px] border border-border-brand bg-cream px-4 py-3 text-sm font-medium text-text-mid">
          This campaign has already been sent and is read-only. You can still send a test copy.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-[10px] border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-4 rounded-[10px] border border-green-300 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          {notice}
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Left: settings + editor */}
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-mid">
              Campaign Title (internal reference)
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className={fieldClass}
              placeholder="July 2026 — New Listings Roundup"
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-mid">
              Email Subject Line
            </label>
            <input
              value={form.subject}
              maxLength={120}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              className={fieldClass}
              placeholder="What subscribers see in their inbox"
              disabled={readOnly}
            />
            <p className={`mt-1 text-xs ${form.subject.length > SUBJECT_MAX ? "text-orange-600" : "text-text-light"}`}>
              {form.subject.length}/{SUBJECT_MAX} recommended
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-mid">Preview Text</label>
            <input
              value={form.preview_text}
              maxLength={150}
              onChange={(e) => setForm((p) => ({ ...p, preview_text: e.target.value }))}
              className={fieldClass}
              placeholder="Short preview shown after the subject"
              disabled={readOnly}
            />
            <p className={`mt-1 text-xs ${form.preview_text.length > PREVIEW_TEXT_MAX ? "text-orange-600" : "text-text-light"}`}>
              {form.preview_text.length}/{PREVIEW_TEXT_MAX} recommended
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-mid">Content</label>
            <div className="overflow-hidden rounded-xl border border-border-brand">
              <MDEditor
                value={form.content}
                onChange={(value) => setForm((p) => ({ ...p, content: value ?? "" }))}
                height={420}
                preview="edit"
              />
            </div>
            <p className="mt-1 text-xs text-text-light">
              Markdown supports headings, bold/italic, lists, links, images (paste a URL),
              blockquotes and dividers.
            </p>
          </div>
        </div>

        {/* Right: live email preview */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-mid">Email preview</label>
          <div className="overflow-hidden rounded-xl border border-border-brand bg-white">
            <iframe
              title="Email preview"
              srcDoc={previewDoc}
              className="h-[560px] w-full"
              sandbox=""
            />
          </div>
        </div>
      </div>

      {/* Test send */}
      <div className="mt-8 rounded-2xl border border-border-brand bg-cream p-4">
        <label className="mb-1.5 block text-sm font-semibold text-text-mid">Send test email to:</label>
        <div className="flex flex-wrap gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className={`${fieldClass} max-w-sm`}
          />
          <button
            type="button"
            onClick={sendTest}
            disabled={busy}
            className="cursor-pointer rounded-full border border-green-brand bg-white px-5 py-2 text-sm font-semibold text-green-brand transition-colors hover:bg-green-brand hover:text-white disabled:opacity-50"
          >
            Send Test
          </button>
        </div>
      </div>

      {/* Send options */}
      {!readOnly && (
        <div className="mt-8 border-t border-border-brand pt-6">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={sendNow}
              disabled={busy}
              className="cursor-pointer rounded-full bg-green-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-green-mid disabled:opacity-50"
            >
              {busy ? "Working…" : "Send Now"}
            </button>
            <button
              type="button"
              onClick={() => setScheduleOpen((v) => !v)}
              disabled={busy}
              className="cursor-pointer rounded-full bg-orange-brand px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              Schedule
            </button>
            <button
              type="button"
              onClick={saveDraft}
              disabled={busy}
              className="cursor-pointer rounded-full border border-border-brand bg-white px-6 py-2.5 text-sm font-semibold text-text-mid hover:bg-cream disabled:opacity-50"
            >
              Save Draft
            </button>
          </div>

          {scheduleOpen && (
            <div className="mt-4 rounded-2xl border border-border-brand bg-white p-4">
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-mid">Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-mid">Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={schedule}
                  disabled={busy}
                  className="cursor-pointer rounded-full bg-orange-brand px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
                >
                  Schedule Campaign
                </button>
              </div>
              <p className="mt-2 text-xs text-text-light">Times are in Nepal Time (NPT, UTC+5:45).</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
