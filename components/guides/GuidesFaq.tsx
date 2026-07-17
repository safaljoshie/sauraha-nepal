import { GUIDES_FAQ } from "@/lib/guides-seo"

export default function GuidesFaq() {
  return (
    <section className="site-container py-14 md:py-16" aria-labelledby="guides-faq-heading">
      <p className="section-label text-center">FAQ</p>
      <h2 id="guides-faq-heading" className="section-title text-center">
        Frequently Asked Questions
      </h2>
      <div className="mx-auto mt-8 max-w-3xl space-y-3">
        {GUIDES_FAQ.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl border border-border-brand bg-white"
          >
            <summary className="flex cursor-pointer list-none flex-col items-center gap-2 px-5 py-4 text-center font-semibold text-green-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-brand sm:flex-row sm:justify-center sm:gap-4 [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                className="shrink-0 text-orange-brand transition-transform group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <div className="border-t border-border-brand px-5 py-4 text-center text-sm leading-relaxed text-text-mid">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
