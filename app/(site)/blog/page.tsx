import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { BLOG_POSTS } from "@/lib/blog-posts"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Travel Tips & Guides",
  description:
    "Travel guides for Sauraha and Chitwan — best time to visit, getting here, park fees, and local tips.",
  path: "/blog",
})

export default function BlogIndexPage() {
  return (
    <main className="mt-[68px] bg-cream px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <p className="section-label">Travel Tips</p>
        <h1 className="section-title">Sauraha & Chitwan Guides</h1>
        <p className="mt-4 max-w-2xl text-lg text-text-mid">
          Practical advice for planning your trip — seasons, transport, park permits, and more.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={post.href}
              className="group overflow-hidden rounded-2xl border border-border-brand bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative h-48">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 400px"
                  unoptimized={post.image.startsWith("http")}
                />
              </div>
              <div className="p-6">
                <span className="text-xs font-bold tracking-wide text-orange-brand uppercase">
                  {post.tag}
                </span>
                <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-text-light">
                  {post.readTime} ·{" "}
                  {new Date(post.date).toLocaleDateString("en-GB", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
