import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import type { NewsletterCampaign } from "@/lib/newsletter"
import { sendCampaign } from "@/lib/newsletter-send"
import { getSupabaseAdmin } from "@/lib/supabase"

export const maxDuration = 300

// Lightweight cron replacement: called from the admin Newsletter tab on load
// and on a 5-minute interval. Sends any scheduled campaigns now due.
export async function POST() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const supabase = getSupabaseAdmin()
    const nowIso = new Date().toISOString()
    const { data, error } = await supabase
      .from("newsletter_campaigns")
      .select("id")
      .eq("status", "scheduled")
      .lte("scheduled_at", nowIso)

    if (error) {
      console.error("Newsletter process-scheduled error:", error)
      return NextResponse.json({ error: "Failed to process scheduled campaigns." }, { status: 500 })
    }

    const due = (data ?? []) as Pick<NewsletterCampaign, "id">[]
    let processed = 0
    for (const campaign of due) {
      const result = await sendCampaign(campaign.id)
      if (result.ok) processed += 1
    }

    return NextResponse.json({ success: true, processed })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
