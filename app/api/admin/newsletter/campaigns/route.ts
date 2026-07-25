import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import type { NewsletterCampaign } from "@/lib/newsletter"
import { renderCampaignContent } from "@/lib/newsletter-send"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Newsletter campaigns fetch error:", error)
      return NextResponse.json({ error: "Failed to load campaigns." }, { status: 500 })
    }

    return NextResponse.json({ campaigns: (data ?? []) as NewsletterCampaign[] })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}

type CampaignBody = {
  title?: string
  subject?: string
  preview_text?: string
  content?: string
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let body: CampaignBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const title = body.title?.trim()
  const subject = body.subject?.trim()
  if (!title || !subject) {
    return NextResponse.json({ error: "Campaign title and subject are required." }, { status: 400 })
  }

  const markdown = body.content ?? ""
  const contentHtml = await renderCampaignContent(markdown)

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("newsletter_campaigns")
      .insert({
        title,
        subject,
        preview_text: body.preview_text?.trim() || null,
        content_json: markdown,
        content_html: contentHtml,
        status: "draft",
      })
      .select("*")
      .single<NewsletterCampaign>()

    if (error) {
      console.error("Newsletter create campaign error:", error)
      return NextResponse.json({ error: "Failed to create campaign." }, { status: 500 })
    }

    return NextResponse.json({ success: true, campaign: data })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
