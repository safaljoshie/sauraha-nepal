import Image from "next/image"
import Link from "next/link"
import BlogShareBar from "@/components/blog/BlogShareBar"
import { getRelatedPosts, SITE_URL, type BlogPost } from "@/lib/blog-posts"

type BlogArticleLayoutProps = {
  post: BlogPost
  label?: string
  children: React.ReactNode
}

export default function BlogArticleLayout({
  post,
  label = "Travel Guide",
  children,
}: BlogArticleLayoutProps) {
  const articleUrl = `${SITE_URL}${post.href}`
  const related = getRelatedPosts(post.slug)

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
          <span className="mx-2">›</span>
          <span className="text-text-mid">{post.tag}</span>
        </nav>

        <header className="mb-12">
          <Link
            href="/blog"
            className="text-sm font-semibold text-green-mid transition-colors hover:text-green-brand"
          >
            ← Back to blog
          </Link>
          <span className="section-label mt-6 block">{label}</span>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl leading-tight font-bold text-green-brand md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-text-light">
            {post.tag} · {post.readTime} ·{" "}
            {new Date(post.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
              unoptimized={post.image.startsWith("http")}
            />
          </div>
        </header>

        <div className="prose-blog space-y-6 text-text-mid">{children}</div>

        <BlogShareBar title={post.title} url={articleUrl} />

        {related.length > 0 && (
          <section className="mt-12 border-t border-border-brand pt-10">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
              Related articles
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  className="group overflow-hidden rounded-2xl border border-border-brand bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative h-40">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="400px"
                      unoptimized={item.image.startsWith("http")}
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-bold tracking-wide text-orange-brand uppercase">
                      {item.tag}
                    </span>
                    <h3 className="mt-1 font-[family-name:var(--font-playfair)] text-lg font-bold text-green-brand">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-text-light">{item.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  )
}
