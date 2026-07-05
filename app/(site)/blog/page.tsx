import type { Metadata } from "next"
import { createClient } from "@supabase/supabase-js"
import { pageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

export const metadata: Metadata = pageMetadata({
  title: "Travel Guides & Tips for Sauraha, Nepal | Sauraha Nepal",
  description:
    "Read our guides on jungle safari, hotels, things to do, and travel tips for Sauraha and Chitwan National Park.",
  path: "/blog",
  titleAbsolute: true,
})

export default async function BlogPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: articles, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  return (
    <pre style={{ padding: 20, fontSize: 12 }}>
      {JSON.stringify(
        {
          articleCount: articles?.length,
          error: error?.message,
          firstArticle: articles?.[0],
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "URL set" : "URL MISSING",
          key: process.env.SUPABASE_SERVICE_ROLE_KEY ? "KEY set" : "KEY MISSING",
        },
        null,
        2,
      )}
    </pre>
  )
}
