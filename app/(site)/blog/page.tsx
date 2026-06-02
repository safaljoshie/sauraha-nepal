import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { fetchPublishedBlogPosts, formatBlogDate } from "@/lib/blog-db"
import { pageMetadata } from "@/lib/seo"

export const revalidate = 60

export const metadata: Metadata = pageMetadata({
  title: "Travel Tips & Guides",
  description:
    "Travel guides for Sauraha and Chitwan — best time to visit, getting here, park fees, and local tips.",
  path: "/blog",
})

export default async function BlogIndexPage() {
  const posts = await fetchPublishedBlogPosts()

  return (
    <main className="mt-[68px] bg-cream px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <p className="section-label">Travel Tips</p>
        <h1 className="section-title">Sauraha & Chitwan Guides</h1>
        <p className="mt-4 max-w-2xl text-lg text-text-mid">
          Practical advice for planning your trip — seasons, transport, park permits, and more.
        </p>

        {posts.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border-brand bg-white px-8 py-16 text-center">
            <p className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
              Coming soon
            </p>
            <p className="mt-2 text-text-mid">
              New travel guides are on the way. Check back shortly.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const image = post.cover_image ?? "/images/placeholder-listing.jpg"
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border-brand bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative h-48">
                    <Image
                      src={image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 400px"
                      unoptimized={image.startsWith("http")}
                    />
                  </div>
                  <div className="p-6">
                    {post.tag && (
                      <span className="text-xs font-bold tracking-wide text-orange-brand uppercase">
                        {post.tag}
                      </span>
                    )}
                    <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm text-text-light">{post.excerpt}</p>
                    )}
                    <p className="mt-2 text-sm text-text-light">
                      {post.read_time ?? "Article"}
                      {post.published_at && (
                        <>
                          {" "}
                          · {formatBlogDate(post.published_at)}
                        </>
                      )}
                    </p>
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
