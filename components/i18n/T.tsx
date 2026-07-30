"use client"

import { useT } from "@/components/i18n/LocaleProvider"

type TProps = {
  id: string
  vars?: Record<string, string | number>
  className?: string
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "label" | "div"
}

/** Client island for a single translated string inside server components. */
export default function T({ id, vars, className, as: Tag = "span" }: TProps) {
  const t = useT()
  return <Tag className={className}>{t(id, vars)}</Tag>
}
