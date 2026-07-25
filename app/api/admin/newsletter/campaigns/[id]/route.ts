import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import type { NewsletterCampaign } from "@/lib/newsletter"
import { renderCampaignContent } from "@/lib/newsletter-send"
import { getSupabaseAdmin } from "@/lib/supabase"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .eq("id", id)
      .maybeSingle<NewsletterCampaign>()

    if (error) {
      console.error("Newsletter campaign fetch error:", error)
      return NextResponse.json({ error: "Failed to load campaign." }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 })
    }

    return NextResponse.json({ campaign: data })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}

type UpdateBody = {
  title?: string
  subject?: string
  preview_text?: string
  content?: string
}

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params

  let body: UpdateBody
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

  try {
    const supabase = getSupabaseAdmin()
    const { data: existing, error: existingError } = await supabase
      .from("newsletter_campaigns")
      .select("status")
      .eq("id", id)
      .maybeSingle<Pick<NewsletterCampaign, "status">>()

    if (existingError) {
      console.error("Newsletter campaign lookup error:", existingError)
      return NextResponse.json({ error: "Failed to update campaign." }, { status: 500 })
    }
    if (!existing) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 })
    }
    // Only drafts and scheduled campaigns can be edited.
    if (existing.status !== "draft" && existing.status !== "scheduled") {
      return NextResponse.json(
        { error: "Only draft or scheduled campaigns can be edited." },
        { status: 400 },
      )
    }

    const markdown = body.content ?? ""
    const contentHtml = await renderCampaignContent(markdown)

    const { data, error } = await supabase
      .from("newsletter_campaigns")
      .update({
        title,
        subject,
        preview_text: body.preview_text?.trim() || null,
        content_json: markdown,
        content_html: contentHtml,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single<NewsletterCampaign>()

    if (error) {
      console.error("Newsletter update campaign error:", error)
      return NextResponse.json({ error: "Failed to update campaign." }, { status: 500 })
    }

    return NextResponse.json({ success: true, campaign: data })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params

  try {
    const supabase = getSupabaseAdmin()
    const { data: existing, error: existingError } = await supabase
      .from("newsletter_campaigns")
      .select("status")
      .eq("id", id)
      .maybeSingle<Pick<NewsletterCampaign, "status">>()

    if (existingError) {
      console.error("Newsletter campaign lookup error:", existingError)
      return NextResponse.json({ error: "Failed to delete campaign." }, { status: 500 })
    }
    if (!existing) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 })
    }
    // Only drafts can be deleted.
    if (existing.status !== "draft") {
      return NextResponse.json({ error: "Only draft campaigns can be deleted." }, { status: 400 })
    }

    const { error } = await supabase.from("newsletter_campaigns").delete().eq("id", id)
    if (error) {
      console.error("Newsletter delete campaign error:", error)
      return NextResponse.json({ error: "Failed to delete campaign." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
