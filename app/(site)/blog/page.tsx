import type { Metadata } from "next"
import { createClient } from "@supabase/supabase-js"
import BlogPostCard from "@/components/blog/BlogPostCard"
import { pageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export const metadata: Metadata = pageMetadata({
  title: "Travel Guides & Tips for Sauraha, Nepal | Sauraha Nepal",
  description:
    "Read our guides on jungle safari, hotels, things to do, and travel tips for Sauraha and Chitwan National Park.",
  path: "/blog",
  titleAbsolute: true,
})

export default async function BlogIndexPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: articles } = await supabase
    .from("blog_posts")
    .select("id, title, slug, tag, read_time, published_at, cover_image, excerpt")
    .eq("status", "published")
    .order("published_at", { ascending: false })

  console.log("BLOG ARTICLES:", articles?.length)

  return (
    <main className="mt-[68px] bg-cream py-12 md:py-16">
      <div className="site-container">
        <p className="section-label">Travel Tips</p>
        <h1 className="section-title">Sauraha & Chitwan Guides</h1>
        <p className="mt-4 max-w-2xl text-lg text-text-mid">
          Practical advice for planning your trip — seasons, transport, park permits, packing lists, and more.
        </p>

        {articles && articles.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <BlogPostCard
                key={article.id}
                post={article}
                priority={index === 0}
                showReadMore
              />
            ))}
          </div>
        ) : (
          <p className="mt-12">Coming soon. New travel guides are on the way. Check back shortly.</p>
        )}
      </div>
    </main>
  )
}
