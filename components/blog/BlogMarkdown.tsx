import Link from "next/link"
import BlogMarkdownImage from "@/components/blog/BlogMarkdownImage"
import {
  getNodeText,
  isInternalSiteLink,
  slugifyHeading,
  stripBlogBoilerplateSections,
  toInternalPath,
} from "@/lib/blog-markdown-utils"
import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"

function headingClass(level: 1 | 2 | 3 | 4, text: string) {
  const normalized = text.trim().toLowerCase()
  if (level === 2 && normalized === "table of contents") return "blog-heading-2 blog-toc-heading"
  if (level === 3 && normalized === "pro tip") return "blog-heading-3 blog-pro-tip-heading"
  if (level === 2 && normalized.includes("frequently asked questions")) return "blog-heading-2 blog-faq-heading"
  return `blog-heading-${level}`
}

function buildComponents(): Components {
  return {
    h1: ({ children }) => {
      const text = getNodeText(children)
      return (
        <h2 id={slugifyHeading(text)} className={headingClass(2, text)}>
          {children}
        </h2>
      )
    },
    h2: ({ children }) => {
      const text = getNodeText(children)
      return (
        <h2 id={slugifyHeading(text)} className={headingClass(2, text)}>
          {children}
        </h2>
      )
    },
    h3: ({ children }) => {
      const text = getNodeText(children)
      return (
        <h3 id={slugifyHeading(text)} className={headingClass(3, text)}>
          {children}
        </h3>
      )
    },
    h4: ({ children }) => {
      const text = getNodeText(children)
      return (
        <h4 id={slugifyHeading(text)} className={headingClass(4, text)}>
          {children}
        </h4>
      )
    },
    p: ({ children }) => {
      const text = getNodeText(children).trim()
      if (text.startsWith("✓") || text.startsWith("✔")) {
        return <p className="blog-check-item blog-check-yes">{children}</p>
      }
      if (text.startsWith("✗") || text.startsWith("✘")) {
        return <p className="blog-check-item blog-check-no">{children}</p>
      }
      return <p className="blog-paragraph">{children}</p>
    },
    ul: ({ children }) => <ul className="blog-list">{children}</ul>,
    ol: ({ children }) => <ol className="blog-list blog-list-ordered">{children}</ol>,
    li: ({ children }) => {
      const text = getNodeText(children).trim()
      if (text.startsWith("✓") || text.startsWith("✔")) {
        return <li className="blog-list-item blog-check-item blog-check-yes">{children}</li>
      }
      if (text.startsWith("✗") || text.startsWith("✘")) {
        return <li className="blog-list-item blog-check-item blog-check-no">{children}</li>
      }
      return <li className="blog-list-item">{children}</li>
    },
    blockquote: ({ children }) => (
      <blockquote className="blog-blockquote">{children}</blockquote>
    ),
    hr: () => <hr className="blog-hr" />,
    a: ({ href, children }) => {
      if (isInternalSiteLink(href)) {
        return (
          <Link href={toInternalPath(href!)} className="blog-link">
            {children}
          </Link>
        )
      }
      return (
        <a href={href} className="blog-link" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      )
    },
    strong: ({ children }) => <strong className="blog-strong">{children}</strong>,
    em: ({ children }) => <em className="blog-em">{children}</em>,
    pre: ({ children }) => <pre className="blog-pre">{children}</pre>,
    code: ({ className, children }) => {
      const isBlock = className?.includes("language-")
      if (isBlock) {
        return <code className={className}>{children}</code>
      }
      return <code className="blog-code-inline">{children}</code>
    },
    table: ({ children }) => (
      <div className="blog-table-wrap">
        <table className="blog-table">{children}</table>
      </div>
    ),
    img: ({ src, alt }) => <BlogMarkdownImage src={src} alt={alt} />,
  }
}

const components = buildComponents()

export default function BlogMarkdown({ content }: { content: string }) {
  const cleaned = stripBlogBoilerplateSections(content)

  return (
    <div className="blog-content">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
        {cleaned}
      </ReactMarkdown>
    </div>
  )
}
