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
      className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-12 md:gap-4"
    >
      <div className="max-w-2xl">
        <h2
          className={`font-heading text-xl font-bold tracking-tight md:text-[clamp(1.75rem,4vw,2.5rem)] ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={`mt-2 max-w-xl text-sm leading-snug md:mt-4 md:text-[1.05rem] md:leading-relaxed ${
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
