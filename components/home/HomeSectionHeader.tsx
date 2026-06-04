import Link from "next/link"

type HomeSectionHeaderProps = {
  title: string
  subtitle?: string
  action?: { href: string; label: string }
  dark?: boolean
  id?: string
  /** @deprecated NSW style omits small labels */
  label?: string
}

export default function HomeSectionHeader({
  title,
  subtitle,
  action,
  dark = false,
  id,
}: HomeSectionHeaderProps) {
  return (
    <div
      id={id}
      className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-12"
    >
      <div className="max-w-2xl">
        <h2
          className={`nsw-section-title ${dark ? "!text-white" : ""}`}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={`mt-4 max-w-xl text-[1.05rem] leading-relaxed ${
              dark ? "text-white/80" : "text-ink-muted"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <Link href={action.href} className="nsw-view-all shrink-0">
          {action.label}
        </Link>
      )}
    </div>
  )
}
