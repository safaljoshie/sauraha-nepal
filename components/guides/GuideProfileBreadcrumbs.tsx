import Link from "next/link"

type GuideProfileBreadcrumbsProps = {
  guideName: string
}

export default function GuideProfileBreadcrumbs({ guideName }: GuideProfileBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="site-container mx-auto max-w-4xl pt-4">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-text-light">
        <li>
          <Link href="/" className="font-semibold text-green-brand hover:text-green-mid hover:underline">
            Home
          </Link>
        </li>
        <li aria-hidden className="text-text-light/60">
          /
        </li>
        <li>
          <Link href="/guides" className="font-semibold text-green-brand hover:text-green-mid hover:underline">
            Jungle Guides
          </Link>
        </li>
        <li aria-hidden className="text-text-light/60">
          /
        </li>
        <li aria-current="page" className="font-semibold text-text-mid">
          {guideName}
        </li>
      </ol>
    </nav>
  )
}
