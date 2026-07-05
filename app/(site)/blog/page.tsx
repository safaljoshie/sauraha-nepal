import type { Metadata } from "next"
import BlogPostCard from "@/components/blog/BlogPostCard"
import type { BlogPostRow } from "@/lib/blog-db"
import { pageMetadata } from "@/lib/seo"
import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export const metadata: Metadata = pageMetadata({
  title: "Travel Guides & Tips for Sauraha, Nepal | Sauraha Nepal",
  description:
    "Read our guides on jungle safari, hotels, things to do, and travel tips for Sauraha and Chitwan National Park.",
  path: "/blog",
  titleAbsolute: true,
})

/** Same query pattern as app/(site)/blog/[slug]/page.tsx → fetchPublishedBlogPostBySlug */
async function fetchPublishedBlogPostsForIndex(): Promise<BlogPostRow[]> {
  const runQuery = async (client: ReturnType<typeof getSupabasePublic>) => {
    const { data, error } = await client
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
    if (error) throw error
    return (data ?? []) as BlogPostRow[]
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data: articles, error, count } = await supabase
      .from("blog_posts")
      .select("*", { count: "exact" })

    console.log("Blog fetch result:", {
      articleCount: count,
      error: error?.message,
      firstArticle: articles?.[0],
      statusValues: articles?.map((a) => a.status),
    })

    const rows = await runQuery(supabase)
    if (process.env.NODE_ENV === "development") {
      console.log(`[blog index] ${rows.length} published posts (admin)`)
    }
    return rows
  } catch (adminError) {
    console.error("[blog index] admin fetch failed:", adminError)
  }

  try {
    const supabase = getSupabasePublic()
    const { data: articles, error, count } = await supabase
      .from("blog_posts")
      .select("*", { count: "exact" })

    console.log("Blog fetch result:", {
      articleCount: count,
      error: error?.message,
      firstArticle: articles?.[0],
      statusValues: articles?.map((a) => a.status),
    })

    const rows = await runQuery(supabase)
    if (process.env.NODE_ENV === "development") {
      console.log(`[blog index] ${rows.length} published posts (anon)`)
    }
    return rows
  } catch (publicError) {
    console.error("[blog index] public fetch failed:", publicError)
  }

  return []
}

export default async function BlogIndexPage() {
  const posts = await fetchPublishedBlogPostsForIndex()

  if (process.env.NODE_ENV === "development") {
    console.log(
      "[blog index] rendering",
      posts.length,
      "cards:",
      posts.map((post) => post.slug).join(", ") || "(none)",
    )
  }

  return (
    <main className="mt-[68px] bg-cream py-12 md:py-16">
      <div className="site-container">
        <p className="section-label">Travel Tips</p>
        <h1 className="section-title">Sauraha & Chitwan Guides</h1>
        <p className="mt-4 max-w-2xl text-lg text-text-mid">
          Practical advice for planning your trip — seasons, transport, park permits, packing lists, and more.
        </p>

        {posts.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border-brand bg-white px-8 py-16 text-center">
            <p className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
              Guides coming soon
            </p>
            <p className="mt-2 text-text-mid">Check back shortly.</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <BlogPostCard
                key={post.id}
                post={post}
                priority={index === 0}
                showReadMore
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
