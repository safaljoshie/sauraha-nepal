import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import BlogMarkdown from "@/components/blog/BlogMarkdown"
import BlogPostCard from "@/components/blog/BlogPostCard"
import BlogRelatedLinks from "@/components/blog/BlogRelatedLinks"
import BlogShareBar from "@/components/blog/BlogShareBar"
import {
  fetchPublishedBlogPosts,
  fetchPublishedBlogPostBySlug,
  fetchRelatedBlogPosts,
  formatBlogDate,
} from "@/lib/blog-db"
import { filterBlogRelatedLinks, getBlogPostRelatedLinks } from "@/lib/blog-related-links"
import { getBlogSlugRedirect } from "@/lib/blog-slug-redirects"
import { SITE_URL } from "@/lib/blog-posts"
import { articleJsonLd, blogCoverAlt, buildBlogPostMetadata, DEFAULT_OG_IMAGE } from "@/lib/seo"
import { DEFAULT_IMAGE_QUALITY, isNextOptimizedImageSrc } from "@/lib/image"

export const revalidate = 60

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const redirectSlug = getBlogSlugRedirect(slug)
  if (redirectSlug) {
    const post = await fetchPublishedBlogPostBySlug(redirectSlug)
    if (post) return buildBlogPostMetadata(post)
  }
  const post = await fetchPublishedBlogPostBySlug(slug)
  if (!post) {
    return { title: { absolute: "Post Not Found | Sauraha Nepal" } }
  }
  return buildBlogPostMetadata(post)
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const redirectSlug = getBlogSlugRedirect(slug)
  if (redirectSlug) redirect(`/blog/${redirectSlug}`)

  const post = await fetchPublishedBlogPostBySlug(slug)
  if (!post) notFound()

  const [related, publishedPosts] = await Promise.all([
    fetchRelatedBlogPosts(slug),
    fetchPublishedBlogPosts(),
  ])
  const publishedSlugs = new Set(publishedPosts.map((p) => p.slug))
  const relatedLinks = filterBlogRelatedLinks(getBlogPostRelatedLinks(post.slug), publishedSlugs)
  const articleUrl = `${SITE_URL}/blog/${post.slug}`
  const cover = post.cover_image ?? DEFAULT_OG_IMAGE
  const coverAlt = blogCoverAlt(post.title)
  const jsonLd = articleJsonLd(post)
  const lead =
    post.excerpt?.trim() &&
    !post.excerpt.toLowerCase().startsWith("draft brief:")
      ? post.excerpt.trim()
      : null

  return (
    <main className="mt-[68px] bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-12">
        <nav className="mb-4 flex flex-wrap gap-x-2 text-sm text-text-light">
          <Link href="/" className="hover:text-green-brand">
            Home
          </Link>
          <span aria-hidden>›</span>
          <Link href="/blog" className="hover:text-green-brand">
            Blog
          </Link>
          {post.tag && (
            <>
              <span aria-hidden>›</span>
              <span className="text-text-mid">{post.tag}</span>
            </>
          )}
        </nav>

        <header className="mb-8">
          <Link
            href="/blog"
            className="text-sm font-semibold text-green-mid transition-colors hover:text-green-brand"
          >
            ← Back to Blog
          </Link>
          {post.tag && <span className="section-label mt-6 block">{post.tag}</span>}
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight font-bold text-green-brand md:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-text-light">
            {post.author ?? "Sauraha Nepal Team"}
            {post.read_time && <> · {post.read_time}</>}
            {post.published_at && <> · {formatBlogDate(post.published_at)}</>}
          </p>
          <div className="relative mt-8 h-[3in] w-full overflow-hidden rounded-2xl border border-border-brand shadow-sm">
            <Image
              src={cover}
              alt={coverAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              quality={DEFAULT_IMAGE_QUALITY}
              priority
              unoptimized={!isNextOptimizedImageSrc(cover)}
            />
          </div>
        </header>

        {lead && <p className="blog-lead rounded-2xl">{lead}</p>}

        <div className="blog-article-card">
          <BlogMarkdown content={post.content ?? ""} />
        </div>

        <div className="mt-10">
          <BlogShareBar title={post.title} url={articleUrl} />
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-border-brand pt-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
              Related articles
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {related.map((item) => (
                <BlogPostCard key={item.slug} post={item} />
              ))}
            </div>
          </section>
        )}

        <BlogRelatedLinks links={relatedLinks} />
      </article>
    </main>
  )
}
