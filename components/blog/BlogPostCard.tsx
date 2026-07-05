import Image from "next/image"
import Link from "next/link"
import type { BlogPostPreview } from "@/lib/blog-db"
import { formatBlogDate, getBlogPostExcerptPreview } from "@/lib/blog-db"
import { DEFAULT_IMAGE_QUALITY, isNextOptimizedImageSrc } from "@/lib/image"
import { blogCoverAlt } from "@/lib/seo"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"

type BlogPostCardProps = {
  post: Pick<
    BlogPostPreview,
    "slug" | "title" | "excerpt" | "cover_image" | "tag" | "read_time" | "published_at"
  > & { content?: string | null }
  priority?: boolean
  showReadMore?: boolean
}

export default function BlogPostCard({
  post,
  priority = false,
  showReadMore = false,
}: BlogPostCardProps) {
  const image = post.cover_image ?? DEFAULT_OG_IMAGE
  const excerpt = getBlogPostExcerptPreview(post.excerpt, post.content)

  return (
    <Link
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
          priority={priority}
          loading={priority ? undefined : "lazy"}
          unoptimized={!isNextOptimizedImageSrc(image)}
        />
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        {post.tag && (
          <span className="text-xs font-bold tracking-wide text-orange-brand uppercase">{post.tag}</span>
        )}
        <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-lg font-bold leading-snug text-green-brand md:text-xl">
          {post.title}
        </h2>
        {excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-text-mid">{excerpt}</p>
        )}
        <p className="mt-3 text-xs text-text-light">
          {post.published_at ? formatBlogDate(post.published_at) : (post.read_time ?? "Article")}
        </p>
        {showReadMore && (
          <span className="mt-3 text-sm font-semibold text-green-brand group-hover:text-green-mid">
            Read more →
          </span>
        )}
      </div>
    </Link>
  )
}
