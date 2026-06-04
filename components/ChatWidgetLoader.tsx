"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"

const ChatWidget = dynamic(() => import("@/components/ChatWidget"), { ssr: false })

export default function ChatWidgetLoader() {
  const pathname = usePathname()
  if (pathname.startsWith("/admin")) return null
  return <ChatWidget />
}
