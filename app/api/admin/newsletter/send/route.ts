import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import type { NewsletterCampaign } from "@/lib/newsletter"
import { sendCampaign } from "@/lib/newsletter-send"
import { getSupabaseAdmin } from "@/lib/supabase"

// Sending can take a while (batched with delays); allow more headroom.
export const maxDuration = 300

type SendBody = {
  campaignId?: string
  sendAt?: string | null
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let body: SendBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const campaignId = body.campaignId?.trim()
  if (!campaignId) {
    return NextResponse.json({ error: "Campaign is required." }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data: campaign, error } = await supabase
    .from("newsletter_campaigns")
    .select("id, status")
    .eq("id", campaignId)
    .maybeSingle<Pick<NewsletterCampaign, "id" | "status">>()

  if (error) {
    console.error("Newsletter send lookup error:", error)
    return NextResponse.json({ error: "Failed to load campaign." }, { status: 500 })
  }
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found." }, { status: 404 })
  }
  if (campaign.status === "sending" || campaign.status === "sent") {
    return NextResponse.json(
      { error: "This campaign has already been sent." },
      { status: 400 },
    )
  }

  // Schedule for later.
  if (body.sendAt) {
    const when = new Date(body.sendAt)
    if (Number.isNaN(when.getTime())) {
      return NextResponse.json({ error: "Invalid schedule date." }, { status: 400 })
    }
    if (when.getTime() > Date.now()) {
      const { error: scheduleError } = await supabase
        .from("newsletter_campaigns")
        .update({
          status: "scheduled",
          scheduled_at: when.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaignId)

      if (scheduleError) {
        console.error("Newsletter schedule error:", scheduleError)
        return NextResponse.json({ error: "Failed to schedule campaign." }, { status: 500 })
      }
      return NextResponse.json({ success: true, scheduled: true, scheduledAt: when.toISOString() })
    }
  }

  // Send now.
  const result = await sendCampaign(campaignId)
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Failed to send campaign." }, { status: 500 })
  }

  return NextResponse.json({ success: true, sent: result.sent, failed: result.failed })
}
