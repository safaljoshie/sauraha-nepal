import Image from "next/image"
import Link from "next/link"
import { HOMEPAGE_BLOG_FALLBACK } from "@/lib/homepage-blog-fallback"
import type { BlogPostRow } from "@/lib/blog-db"

type GuideCard = {
  href: string
  title: string
  image: string
  tag: string
  readTime: string
}

function toGuideCards(posts: BlogPostRow[]): GuideCard[] {
  return posts.map((post) => ({
    href: `/blog/${post.slug}`,
    title: post.title,
    image: post.cover_image ?? "/images/placeholder-listing.jpg",
    tag: post.tag ?? "Travel Guide",
    readTime: post.read_time ?? "Article",
  }))
}

export default function HomeTravelGuides({
  posts,
  useFallback,
}: {
  posts: BlogPostRow[]
  useFallback: boolean
}) {
  const guides: GuideCard[] = useFallback
    ? HOMEPAGE_BLOG_FALLBACK.map((p) => ({
        href: p.href,
        title: p.title,
        image: p.image,
        tag: p.tag,
        readTime: p.readTime,
      }))
    : toGuideCards(posts)

  if (guides.length === 0) return null

  return (
    <section id="travel-guides" className="home-section home-section-muted scroll-mt-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-12">
          <h2 className="nsw-section-title">Latest articles</h2>
          <Link href="/blog" className="nsw-view-all shrink-0">
            View all
          </Link>
        </div>
        <ul className="divide-y divide-black/8 border-t border-black/8">
          {guides.map((post) => (
            <li key={post.href}>
              <Link
                href={post.href}
                className="group flex gap-5 py-6 transition-colors hover:bg-white md:items-center md:gap-8 md:px-2"
              >
                <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-40">
                  <Image
                    src={post.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="160px"
                    unoptimized={post.image.startsWith("http")}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading text-lg font-bold leading-snug text-ink group-hover:text-green-brand md:text-xl">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted">
                    {post.tag} · {post.readTime}
                  </p>
                </div>
                <span className="hidden shrink-0 text-green-brand md:inline">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
