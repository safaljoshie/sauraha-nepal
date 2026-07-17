import Link from "next/link"

export default function GuidesBreadcrumbs() {
  return (
    <nav aria-label="Breadcrumb" className="site-container pt-6">
      <ol className="flex flex-wrap items-center justify-center gap-2 text-sm text-text-light">
        <li>
          <Link href="/" className="font-semibold text-green-brand hover:text-green-mid hover:underline">
            Home
          </Link>
        </li>
        <li aria-hidden className="text-text-light/60">
          /
        </li>
        <li aria-current="page" className="font-semibold text-text-mid">
          Jungle Guides
        </li>
      </ol>
    </nav>
  )
}
