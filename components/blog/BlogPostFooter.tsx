import Image from "next/image"
import Link from "next/link"
import BlogShareBar from "@/components/blog/BlogShareBar"
import { getRelatedPosts, SITE_URL, type BlogPost } from "@/lib/blog-posts"

export default function BlogPostFooter({ post }: { post: BlogPost }) {
  const related = getRelatedPosts(post.slug)
  const articleUrl = `${SITE_URL}${post.href}`

  return (
    <>
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
                className="group overflow-hidden rounded-2xl border border-border-brand bg-white shadow-sm"
              >
                <div className="relative h-36">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="400px"
                    unoptimized={item.image.startsWith("http")}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-green-brand">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-light">{item.readTime}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
