import type { Metadata } from "next"
import type { BlogPostRow } from "@/lib/blog-db"
import { pageMetadata } from "@/lib/seo"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = pageMetadata({
  title: "Travel Guides & Tips for Sauraha, Nepal | Sauraha Nepal",
  description:
    "Read our guides on jungle safari, hotels, things to do, and travel tips for Sauraha and Chitwan National Park.",
  path: "/blog",
  titleAbsolute: true,
})

async function fetchPublishedBlogPostsForIndex(): Promise<BlogPostRow[]> {
  const supabase = createClient()
  const { data: articles, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (articles ?? []) as BlogPostRow[]
}

export default async function BlogIndexPage() {
  const articles = await fetchPublishedBlogPostsForIndex()

  return (
    <main className="mt-[68px] bg-cream py-12 md:py-16">
      <div className="site-container">
        <p className="section-label">Travel Tips</p>
        <h1 className="section-title">Sauraha & Chitwan Guides</h1>
        <p className="mt-4 max-w-2xl text-lg text-text-mid">
          Practical advice for planning your trip — seasons, transport, park permits, packing lists, and more.
        </p>

        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <a key={article.id} href={`/blog/${article.slug}`} className="block group">
                <div className="border rounded-lg overflow-hidden hover:shadow-md transition">
                  <div className="p-4">
                    {article.tag && (
                      <span className="text-xs uppercase tracking-wide text-green-700 font-semibold">
                        {article.tag}
                      </span>
                    )}
                    <h2 className="text-lg font-semibold mt-1 group-hover:underline">
                      {article.title}
                    </h2>
                    <div className="text-sm text-gray-500 mt-2 flex gap-3">
                      <span>{article.read_time}</span>
                      <span>
                        {article.published_at
                          ? new Date(article.published_at).toLocaleDateString("en-AU", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p>Coming soon. New travel guides are on the way. Check back shortly.</p>
        )}
      </div>
    </main>
  )
}
