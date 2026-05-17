import Link from "next/link"

const exploreLinks = [
  { href: "/listings", label: "All Listings" },
  { href: "/listings?category=stay", label: "Stay" },
  { href: "/listings?category=eat", label: "Eat & Drink" },
  { href: "/listings?category=activities", label: "Activities" },
]

const infoLinks = [
  { href: "#", label: "Travel Tips" },
  { href: "#", label: "Park Permits" },
  { href: "#", label: "Getting Here" },
  { href: "#", label: "Blog" },
]

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/list-your-business", label: "List Your Business" },
]

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { href: string; label: string }[]
}) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-bold tracking-widest text-white uppercase">
        {title}
      </h4>
      <ul>
        {links.map((link) => (
          <li key={link.label} className="mb-2">
            <Link
              href={link.href}
              className="text-sm text-white/60 transition-colors hover:text-orange-light"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-text-brand px-8 py-14 text-white/75">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <h4 className="font-[family-name:var(--font-playfair)] text-xl text-white">
              Sauraha Nepal
            </h4>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Your complete guide to Sauraha — the gateway to Chitwan National Park.
              Find the best stays, food, activities, and local experiences.
            </p>
          </div>
          <FooterColumn title="Explore" links={exploreLinks} />
          <FooterColumn title="Info" links={infoLinks} />
          <FooterColumn title="Company" links={companyLinks} />
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-sm text-white/40">
          © 2025 SaurahaNePal.com · Built with ❤️ for travellers exploring Chitwan
        </div>
      </div>
    </footer>
  )
}
