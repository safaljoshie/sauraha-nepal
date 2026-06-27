"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import type { TeamMember } from "@/lib/team-members"
import { compressImage } from "@/lib/compress-image"

type TeamFormState = {
  id?: string
  name: string
  role: string
  image: string
  bio: string
  display_order: number
  is_active: boolean
}

type Toast = {
  id: string
  type: "success" | "error"
  message: string
}

const emptyForm: TeamFormState = {
  name: "",
  role: "",
  image: "",
  bio: "",
  display_order: 0,
  is_active: true,
}

export default function AdminTeamManager() {
  const router = useRouter()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState<TeamFormState | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const loadMembers = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/team")
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { members?: TeamMember[]; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to load team members.")
        return
      }
      setMembers(data.members ?? [])
    } catch {
      setError("Failed to load team members.")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  function showToast(type: Toast["type"], message: string) {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

  function openCreate() {
    setForm({ ...emptyForm })
    setError("")
  }

  function openEdit(member: TeamMember) {
    setForm({
      id: member.id,
      name: member.name,
      role: member.role,
      image: member.image,
      bio: member.bio ?? "",
      display_order: member.display_order,
      is_active: member.is_active,
    })
    setError("")
  }

  function validateForm(state: TeamFormState) {
    if (!state.name.trim() || !state.role.trim() || !state.image.trim()) {
      return "Name, role/title, and photo are required."
    }
    if (!/^https?:\/\//i.test(state.image.trim())) {
      return "Photo must be a valid URL."
    }
    return ""
  }

  async function handleSave() {
    if (!form) return
    const validationError = validateForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError("")
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        role: form.role.trim(),
        image: form.image.trim(),
        bio: form.bio.trim(),
      }
      const res = await fetch("/api/admin/team", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { error?: string; member?: TeamMember }
      if (!res.ok || !data.member) {
        setError(data.error ?? "Failed to save team member.")
        showToast("error", "Failed to save team member.")
        return
      }

      if (form.id) {
        setMembers((prev) =>
          prev
            .map((m) => (m.id === data.member!.id ? data.member! : m))
            .sort((a, b) => a.display_order - b.display_order),
        )
      } else {
        setMembers((prev) =>
          [...prev, data.member!].sort((a, b) => a.display_order - b.display_order),
        )
      }
      setForm(null)
      showToast("success", "Team member saved successfully.")
    } catch {
      setError("Failed to save team member.")
      showToast("error", "Failed to save team member.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(member: TeamMember) {
    const confirmed = window.confirm(
      `Delete '${member.name}' from the team?\nThis cannot be undone.`,
    )
    if (!confirmed) return

    const previous = members
    setMembers((prev) => prev.filter((m) => m.id !== member.id))

    try {
      const res = await fetch("/api/admin/team", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id }),
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setMembers(previous)
        setError(data.error ?? "Failed to delete team member.")
        showToast("error", "Failed to delete team member.")
        return
      }
      showToast("success", "Team member deleted successfully.")
    } catch {
      setMembers(previous)
      setError("Failed to delete team member.")
      showToast("error", "Failed to delete team member.")
    }
  }

  async function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !form) return

    setUploading(true)
    setError("")
    try {
      const compressed = await compressImage(file)
      const body = new FormData()
      body.set("file", compressed)

      const res = await fetch("/api/admin/team/upload-photo", {
        method: "POST",
        body,
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { error?: string; url?: string }
      if (!res.ok || !data.url) {
        setError(data.error ?? "Failed to upload photo.")
        showToast("error", "Failed to upload photo.")
        return
      }

      setForm((prev) => (prev ? { ...prev, image: data.url! } : prev))
      showToast("success", "Photo uploaded successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo.")
      showToast("error", err instanceof Error ? err.message : "Failed to upload photo.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border-brand pb-6">
        <div>
          <p className="text-xs font-bold tracking-widest text-orange-brand uppercase">
            Admin
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand md:text-3xl">
            Team Management
          </h1>
          <p className="mt-1 text-sm text-text-light">
            Manage the People behind the directory section on About page.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard"
            className="rounded-full border border-border-brand bg-white px-4 py-2 text-sm font-semibold text-text-mid hover:bg-cream"
          >
            Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-full bg-green-brand px-5 py-2 text-sm font-semibold text-white hover:bg-green-mid"
          >
            Add Team Member
          </button>
        </div>
      </header>

      {error && (
        <p className="mb-4 rounded-[10px] border border-orange-brand/30 bg-orange-brand/10 px-4 py-3 text-sm font-semibold text-orange-brand">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-border-brand bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-brand bg-cream/80 text-xs font-bold uppercase tracking-wide text-text-light">
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-light">
                    Loading team members…
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-light">
                    No team members yet.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="border-b border-border-brand/60 hover:bg-cream/40">
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-full border border-border-brand">
                        <Image src={member.image} alt={member.name} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-text-brand">{member.name}</td>
                    <td className="px-4 py-3 text-text-mid">{member.role}</td>
                    <td className="px-4 py-3 text-text-mid">{member.display_order}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          member.is_active
                            ? "bg-green-mid/15 text-green-brand"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {member.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(member)}
                          className="rounded-lg bg-blue-100 px-2.5 py-1 text-sm text-blue-700 hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(member)}
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
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border-brand bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
                {form.id ? "Edit Team Member" : "Add Team Member"}
              </h2>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="text-2xl leading-none text-text-light hover:text-text-brand"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name" required>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={fieldClass}
                />
              </Field>
              <Field label="Role / Title" required>
                <input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={fieldClass}
                />
              </Field>
              <Field label="Photo URL" required className="md:col-span-2">
                <div className="mb-2 flex items-center gap-2">
                  <label className="cursor-pointer rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-200">
                    {uploading ? "Uploading..." : "Upload Photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  <span className="text-xs text-text-light">JPEG/PNG, max 5MB</span>
                </div>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className={fieldClass}
                />
                {form.image && (
                  <div className="relative mt-2 h-20 w-20 overflow-hidden rounded-full border border-border-brand">
                    <Image src={form.image} alt="" fill className="object-cover" />
                  </div>
                )}
              </Field>
              <Field label="Bio" className="md:col-span-2">
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className={`${fieldClass} min-h-[90px]`}
                />
              </Field>
              <Field label="Display Order">
                <input
                  type="number"
                  min={0}
                  value={form.display_order}
                  onChange={(e) =>
                    setForm({ ...form, display_order: Number.parseInt(e.target.value || "0", 10) })
                  }
                  className={fieldClass}
                />
              </Field>
              <Field label="Active">
                <label className="flex items-center gap-2 text-sm text-text-mid">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  Show on About page
                </label>
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="rounded-full border border-border-brand px-4 py-2 text-sm font-semibold text-text-mid hover:bg-cream"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-green-brand px-5 py-2 text-sm font-semibold text-white hover:bg-green-mid disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
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
  )
}

const fieldClass =
  "w-full rounded-[10px] border-[1.5px] border-border-brand bg-cream px-3 py-2 text-sm text-text-brand outline-none transition-colors focus:border-green-mid focus:bg-white"

function Field({
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
    <div className={className}>
      <label className="mb-1.5 block text-sm font-semibold text-text-mid">
        {label} {required ? "*" : ""}
      </label>
      {children}
    </div>
  )
}
