import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks"
import type { Components } from "react-markdown"

const components: Components = {
  p: ({ children }) => <p className="[&:not(:first-child)]:mt-2">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-4">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-4">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  a: ({ href, children }) => (
    <a href={href} className="underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
}

export default function ChatMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkBreaks]} components={components}>
      {content}
    </ReactMarkdown>
  )
}
