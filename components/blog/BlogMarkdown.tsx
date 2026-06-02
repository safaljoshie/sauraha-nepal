import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"

const components: Components = {
  h1: ({ children }) => (
    <h2 className="blog-heading-1">{children}</h2>
  ),
  h2: ({ children }) => (
    <h2 className="blog-heading-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="blog-heading-3">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="blog-heading-4">{children}</h4>
  ),
  p: ({ children }) => <p className="blog-paragraph">{children}</p>,
  ul: ({ children }) => <ul className="blog-list">{children}</ul>,
  ol: ({ children }) => <ol className="blog-list blog-list-ordered">{children}</ol>,
  li: ({ children }) => <li className="blog-list-item">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="blog-blockquote">{children}</blockquote>
  ),
  hr: () => <hr className="blog-hr" />,
  a: ({ href, children }) => (
    <a href={href} className="blog-link" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
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
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src ?? ""} alt={alt ?? ""} className="blog-image" />
  ),
}

export default function BlogMarkdown({ content }: { content: string }) {
  return (
    <div className="blog-content">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
