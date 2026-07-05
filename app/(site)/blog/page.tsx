import type { Metadata } from "next"
import BlogPostCard from "@/components/blog/BlogPostCard"
import { fetchPublishedBlogPosts } from "@/lib/blog-db"
import { pageMetadata } from "@/lib/seo"

export const revalidate = 60

export const metadata: Metadata = pageMetadata({
  title: "Travel Guides & Tips for Sauraha, Nepal | Sauraha Nepal",
  description:
    "Read our guides on jungle safari, hotels, things to do, and travel tips for Sauraha and Chitwan National Park.",
  path: "/blog",
  titleAbsolute: true,
})

export default async function BlogIndexPage() {
  const posts = await fetchPublishedBlogPosts()

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
