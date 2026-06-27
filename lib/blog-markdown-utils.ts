import type { ReactNode } from "react"
import { isValidElement } from "react"

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function getNodeText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(getNodeText).join("")
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getNodeText(node.props.children)
  }
  return ""
}

export function isInternalSiteLink(href: string | undefined): boolean {
  if (!href) return false
  if (href.startsWith("/")) return true
  try {
    const url = new URL(href)
    return url.hostname === "www.saurahanepal.com" || url.hostname === "saurahanepal.com"
  } catch {
    return false
  }
}

export function toInternalPath(href: string): string {
  if (href.startsWith("/")) return href
  try {
    const url = new URL(href)
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return href
  }
}

/** Hide CMS boilerplate blocks that should not appear on the public article. */
export function stripBlogBoilerplateSections(content: string): string {
  const markers = [
    /^##\s*Internal Linking Suggestions/im,
    /^##\s*Call to Action/im,
    /^##\s*SEO Notes/im,
  ]
  let cutAt = content.length
  for (const pattern of markers) {
    const match = pattern.exec(content)
    if (match && match.index < cutAt) cutAt = match.index
  }
  return cutAt < content.length ? content.slice(0, cutAt).trimEnd() : content
}
