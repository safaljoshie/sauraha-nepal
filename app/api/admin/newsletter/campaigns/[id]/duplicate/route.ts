import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import type { NewsletterCampaign } from "@/lib/newsletter"
import { getSupabaseAdmin } from "@/lib/supabase"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params

  try {
    const supabase = getSupabaseAdmin()
    const { data: source, error: sourceError } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .eq("id", id)
      .maybeSingle<NewsletterCampaign>()

    if (sourceError) {
      console.error("Newsletter duplicate lookup error:", sourceError)
      return NextResponse.json({ error: "Failed to duplicate campaign." }, { status: 500 })
    }
    if (!source) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 })
    }

    const { data, error } = await supabase
      .from("newsletter_campaigns")
      .insert({
        title: `${source.title} (copy)`,
        subject: source.subject,
        preview_text: source.preview_text,
        content_json: source.content_json,
        content_html: source.content_html,
        status: "draft",
      })
      .select("*")
      .single<NewsletterCampaign>()

    if (error) {
      console.error("Newsletter duplicate insert error:", error)
      return NextResponse.json({ error: "Failed to duplicate campaign." }, { status: 500 })
    }

    return NextResponse.json({ success: true, campaign: data })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
