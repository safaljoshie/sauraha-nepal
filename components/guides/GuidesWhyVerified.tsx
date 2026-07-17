import SiteIcon from "@/components/icons/SiteIcon"

const BENEFITS = [
  {
    title: "Local wildlife knowledge",
    description:
      "Guides who know the forest read animal signs, bird calls and seasonal patterns that maps cannot show.",
    icon: "tree-pine" as const,
  },
  {
    title: "Safer exploration",
    description:
      "Experienced guides help you navigate terrain, river edges and wildlife viewing with sensible distances and pace.",
    icon: "compass" as const,
  },
  {
    title: "Direct communication",
    description:
      "Contact guides by phone or WhatsApp, ask questions in advance, and agree on timing and inclusions yourself.",
    icon: "message-circle" as const,
  },
  {
    title: "Support local tourism",
    description:
      "Hiring a local guide keeps income in Sauraha communities and rewards people who steward the landscape.",
    icon: "heart" as const,
  },
] as const

export default function GuidesWhyVerified() {
  return (
    <section className="site-container py-14 md:py-16" aria-labelledby="why-verified-heading">
      <p className="section-label text-center">Why book local</p>
      <h2 id="why-verified-heading" className="section-title text-center">
        Why Choose a Verified Local Guide?
      </h2>
      <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2">
        {BENEFITS.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-border-brand bg-white p-5 text-center"
          >
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-mid/15 text-green-brand">
              <SiteIcon name={item.icon} size={18} />
            </span>
            <h3 className="mt-3 font-semibold text-text-brand">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-mid">{item.description}</p>
          </article>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-text-light">
        Verified guides have had identity and licence details reviewed by Sauraha Nepal before their
        profile was approved. Verification helps travellers find trustworthy listings but does not
        replace confirming availability, pricing and current park requirements directly with your
        guide.
      </p>
    </section>
  )
}
