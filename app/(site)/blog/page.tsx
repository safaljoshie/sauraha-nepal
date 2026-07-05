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

export default async function BlogIndexPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: articles, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, tag, read_time, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })

  console.log("BLOG ARTICLES:", articles?.length, error?.message)

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
