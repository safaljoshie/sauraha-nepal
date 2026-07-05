import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import type { BlogPostRow } from "@/lib/blog-db"
import { formatBlogDate } from "@/lib/blog-db"
import { DEFAULT_IMAGE_QUALITY, isNextOptimizedImageSrc } from "@/lib/image"
import { blogCoverAlt, DEFAULT_OG_IMAGE, pageMetadata } from "@/lib/seo"
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
  const posts = await fetchPublishedBlogPostsForIndex()

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
            {posts.map((post, index) => {
              const image = post.cover_image ?? DEFAULT_OG_IMAGE

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="blog-card group flex h-full flex-col overflow-hidden rounded-2xl border border-border-brand bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative h-[3in] w-full shrink-0 overflow-hidden">
                    <Image
                      src={image}
                      alt={blogCoverAlt(post.title)}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                      quality={DEFAULT_IMAGE_QUALITY}
                      priority={index === 0}
                      loading={index === 0 ? undefined : "lazy"}
                      unoptimized={!isNextOptimizedImageSrc(image)}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    {post.tag && (
                      <span className="text-xs font-bold tracking-wide text-orange-brand uppercase">
                        {post.tag}
                      </span>
                    )}
                    <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-lg font-bold leading-snug text-green-brand md:text-xl">
                      {post.title}
                    </h2>
                    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-light">
                      {post.read_time && <span>{post.read_time}</span>}
                      {post.read_time && post.published_at && (
                        <span aria-hidden="true" className="text-border-brand">
                          ·
                        </span>
                      )}
                      {post.published_at && <span>{formatBlogDate(post.published_at)}</span>}
                    </div>
                    <span className="mt-3 text-sm font-semibold text-green-brand group-hover:text-green-mid">
                      Read more →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
