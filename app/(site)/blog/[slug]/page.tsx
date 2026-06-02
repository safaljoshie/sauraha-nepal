import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import BlogMarkdown from "@/components/blog/BlogMarkdown"
import BlogShareBar from "@/components/blog/BlogShareBar"
import {
  fetchPublishedBlogPostBySlug,
  fetchPublishedBlogPosts,
  formatBlogDate,
  getRelatedPublishedPosts,
} from "@/lib/blog-db"
import { SITE_URL } from "@/lib/blog-posts"

export const revalidate = 60

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPublishedBlogPostBySlug(slug)
  if (!post) {
    return { title: "Post Not Found" }
  }

  const title = post.meta_title?.trim() || post.title
  const description = post.meta_description?.trim() || post.excerpt || undefined
  const image = post.cover_image ?? "/images/sauraha-hero.jpg"

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE_URL}/blog/${post.slug}`,
      images: [image],
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await fetchPublishedBlogPostBySlug(slug)
  if (!post) notFound()

  const allPosts = await fetchPublishedBlogPosts()
  const related = getRelatedPublishedPosts(allPosts, slug)
  const articleUrl = `${SITE_URL}/blog/${post.slug}`
  const cover = post.cover_image ?? "/images/sauraha-hero.jpg"

  return (
    <main className="mt-[68px] bg-cream">
      <article className="mx-auto max-w-4xl px-6 py-12">
        <nav className="mb-4 text-sm text-text-light">
          <Link href="/" className="hover:text-green-brand">
            Home
          </Link>
          <span className="mx-2">›</span>
          <Link href="/blog" className="hover:text-green-brand">
            Blog
          </Link>
          {post.tag && (
            <>
              <span className="mx-2">›</span>
              <span className="text-text-mid">{post.tag}</span>
            </>
          )}
        </nav>

        <header className="mb-12">
          <Link
            href="/blog"
            className="text-sm font-semibold text-green-mid transition-colors hover:text-green-brand"
          >
            ← Back to Blog
          </Link>
          {post.tag && <span className="section-label mt-6 block">{post.tag}</span>}
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl leading-tight font-bold text-green-brand md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-text-light">
            {post.author ?? "Sauraha Nepal Team"}
            {post.read_time && <> · {post.read_time}</>}
            {post.published_at && <> · {formatBlogDate(post.published_at)}</>}
          </p>
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={cover}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
              unoptimized={cover.startsWith("http")}
            />
          </div>
        </header>

        <BlogMarkdown content={post.content ?? ""} />

        <div className="mt-12">
          <BlogShareBar title={post.title} url={articleUrl} />
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-border-brand pt-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
              Related articles
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug}`}
                  className="rounded-xl border border-border-brand bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <span className="text-xs font-bold text-orange-brand uppercase">
                    {item.tag}
                  </span>
                  <h3 className="mt-2 font-semibold text-green-brand">{item.title}</h3>
                  {item.excerpt && (
                    <p className="mt-1 line-clamp-2 text-sm text-text-light">{item.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  )
}
