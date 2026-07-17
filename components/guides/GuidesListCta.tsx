import Link from "next/link"

export default function GuidesListCta() {
  return (
    <section
      className="px-6 py-14 md:px-8 md:py-16"
      style={{ background: "linear-gradient(135deg, #1a5c2e, #0d3a18)" }}
      aria-labelledby="guides-list-cta-heading"
    >
      <div className="site-container mx-auto max-w-2xl text-center text-white">
        <h2 id="guides-list-cta-heading" className="font-[family-name:var(--font-playfair)] text-2xl font-bold md:text-3xl">
          Are You a Jungle Guide in Sauraha?
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/85">
          List your profile on Sauraha Nepal and reach travellers planning Chitwan National Park
          trips. Show your experience, languages and contact details — free to apply.
        </p>
        <Link
          href="/list-your-guide"
          className="mt-8 inline-flex rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-green-brand transition-colors hover:bg-white/90"
        >
          List Your Guide Profile
        </Link>
      </div>
    </section>
  )
}
