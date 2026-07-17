const STEPS = [
  {
    step: 1,
    title: "Browse profiles",
    description:
      "Filter by language, speciality or experience. Read bios, languages and services on each guide profile.",
  },
  {
    step: 2,
    title: "Contact the guide",
    description:
      "Message or call directly via WhatsApp or phone. Discuss dates, group size and what you want to see.",
  },
  {
    step: 3,
    title: "Confirm your experience",
    description:
      "Agree on price, meeting point and what is included — including permits or transport if needed.",
  },
] as const

export default function GuidesHowItWorks() {
  return (
    <section
      className="home-section home-section-muted"
      aria-labelledby="how-it-works-heading"
    >
      <div className="site-container">
        <p className="section-label text-center">Simple process</p>
        <h2 id="how-it-works-heading" className="section-title text-center">
          How It Works
        </h2>
        <ol className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
          {STEPS.map((item) => (
            <li
              key={item.step}
              className="rounded-2xl border border-border-brand bg-white p-6 text-center"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-brand text-sm font-bold text-white">
                {item.step}
              </span>
              <h3 className="mt-4 font-[family-name:var(--font-playfair)] text-lg font-bold text-text-brand">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-mid">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
