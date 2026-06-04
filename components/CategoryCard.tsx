import Link from "next/link"

export interface CategoryCardProps {
  icon: string
  name: string
  count: string
  href: string
}

export default function CategoryCard({ icon, name, count, href }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border-[1.5px] border-border-brand bg-cream p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-green-brand hover:bg-green-brand hover:shadow-[0_12px_32px_rgba(26,92,42,0.18)]"
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-mid/10 text-2xl transition-colors group-hover:bg-white/20">
        {icon}
      </div>
      <div className="mb-1 font-semibold text-text-brand transition-colors group-hover:text-white">
        {name}
      </div>
      <div className="text-sm text-text-light transition-colors group-hover:text-white/70">
        {count}
      </div>
    </Link>
  )
}
