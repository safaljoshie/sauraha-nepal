"use client"

import { useState } from "react"
import { whatsappShareUrl } from "@/lib/whatsapp"

type BlogShareBarProps = {
  title: string
  url: string
}

export default function BlogShareBar({ title, url }: BlogShareBarProps) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const shareText = `${title} — Sauraha Nepal`
  const waShare = whatsappShareUrl(`${shareText} ${url}`)

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border-brand pt-8">
      <span className="text-sm font-semibold text-text-mid">Share:</span>
      <button
        type="button"
        onClick={copyLink}
        className="rounded-full border border-border-brand bg-white px-4 py-2 text-sm font-semibold text-green-brand hover:bg-cream"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
      <a
        href={waShare}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-green-mid/15 px-4 py-2 text-sm font-semibold text-green-brand hover:bg-green-mid/25"
      >
        WhatsApp
      </a>
    </div>
  )
}
