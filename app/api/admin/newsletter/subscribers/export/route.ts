import { requireAdminApi } from "@/lib/admin-auth"
import type { NewsletterSubscriber } from "@/lib/newsletter"
import { getSupabaseAdmin } from "@/lib/supabase"

function csvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("email, name, created_at")
      .eq("status", "active")
      .eq("confirmed", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Newsletter export error:", error)
      return new Response("Failed to export subscribers.", { status: 500 })
    }

    const rows = (data ?? []) as Pick<NewsletterSubscriber, "email" | "name" | "created_at">[]
    const lines = ["email,name,subscribed_date"]
    for (const row of rows) {
      const date = row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : ""
      lines.push([csvCell(row.email), csvCell(row.name ?? ""), csvCell(date)].join(","))
    }

    return new Response(lines.join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="newsletter-subscribers.csv"',
      },
    })
  } catch {
    return new Response("Database is not configured.", { status: 500 })
  }
}
