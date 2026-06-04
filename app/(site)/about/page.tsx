import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import PageHeader from "@/components/PageHeader"
import { missionCards } from "@/lib/data"
import { fetchActiveTeamMembers } from "@/lib/team-members"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "Learn about Sauraha Nepal — your local directory for Chitwan National Park travellers and businesses.",
  path: "/about",
})

export const revalidate = 60

const stats = [
  { value: "120+", label: "Businesses Listed" },
  { value: "7", label: "Categories" },
  { value: "50,000+", label: "Annual Visitors" },
  { value: "932 km²", label: "National Park" },
]

export default function AboutPage() {
  return <AboutPageContent />
}

async function AboutPageContent() {
  const teamMembers = await fetchActiveTeamMembers()

  return (
    <main>
      <PageHeader
        variant="image"
        label="Our Story"
        title="About Sauraha Nepal"
        imageSrc="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&q=80"
      />

      <section className="mx-auto max-w-3xl px-8 py-20">
        <p className="section-label">Who We Are</p>
        <h2 className="section-title">Built by locals, for travellers</h2>
        <p className="mb-5 text-[1.05rem] leading-relaxed text-text-mid">
          Sauraha Nepal is an independent travel directory created to help visitors
          discover the very best of Sauraha — the vibrant village at the gateway to
          Chitwan National Park, one of Asia&apos;s premier wildlife destinations.
        </p>
        <p className="mb-5 text-[1.05rem] leading-relaxed text-text-mid">
          Whether you&apos;re looking for a comfortable jungle resort, a riverside
          restaurant, an experienced local guide, or simply want to know the best
          time to spot a one-horned rhino — we&apos;ve got you covered. Every listing
          on our directory is personally reviewed to ensure quality and accuracy.
        </p>
        <p className="mb-5 text-[1.05rem] leading-relaxed text-text-mid">
          We are passionate about sustainable tourism and work closely with local
          businesses to promote responsible travel that benefits the Tharu community
          and protects the incredible natural environment of Chitwan.
        </p>

        <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
          {missionCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border-[1.5px] border-border-brand bg-white p-8 text-center"
            >
              <div className="mb-4 text-4xl">{card.icon}</div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-green-brand">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-light">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-green-brand px-8 py-12">
        <div className="mx-auto grid max-w-3xl grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <strong className="font-[family-name:var(--font-playfair)] block text-4xl font-bold text-orange-light">
                {stat.value}
              </strong>
              <span className="text-sm text-white/75">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-8 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="section-label">The Team</p>
          <h2 className="section-title">People behind the directory</h2>
          {teamMembers.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-border-brand bg-cream p-8 text-center text-text-light">
              Team details will be added soon.
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="text-center">
                  <div className="relative mx-auto mb-4 h-[90px] w-[90px] overflow-hidden rounded-full border-[3px] border-green-light">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="font-[family-name:var(--font-playfair)] text-lg text-text-brand">
                    {member.name}
                  </h4>
                  <span className="text-sm text-text-light">{member.role}</span>
                  {member.bio && (
                    <p className="mt-1 text-xs text-text-light">{member.bio}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-br from-green-brand to-[#0d3a18] px-8 py-16 text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white md:text-4xl">
          Want to be part of Sauraha Nepal?
        </h2>
        <p className="mx-auto mt-4 mb-8 max-w-md text-lg text-white/75">
          List your business for free and reach thousands of travellers planning
          their Chitwan adventure.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/list-your-business" className="btn-orange inline-block px-9 py-3.5">
            List Your Business
          </Link>
          <Link
            href="/listings"
            className="inline-block rounded-xl bg-white px-9 py-3.5 font-bold text-green-brand transition-colors hover:bg-cream"
          >
            Browse Listings
          </Link>
        </div>
      </section>
    </main>
  )
}
