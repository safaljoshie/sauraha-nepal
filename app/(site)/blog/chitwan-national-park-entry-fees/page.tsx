import type { Metadata } from "next"
import BlogArticleLayout from "@/components/blog/BlogArticleLayout"
import { getBlogPost } from "@/lib/blog-posts"
import { pageMetadata } from "@/lib/seo"

const post = getBlogPost("chitwan-national-park-entry-fees")!

export const metadata: Metadata = pageMetadata({
  title: "Chitwan National Park Entry Fees & Permits 2025",
  description: post.description,
  path: post.href,
  image: post.image,
  type: "article",
})

export default function ChitwanEntryFeesPage() {
  return (
    <BlogArticleLayout post={post} label="Park Info">
      <section>
        <p className="leading-8">
          Visiting Chitwan National Park from Sauraha requires the correct permits and park
          fees. Rates vary by nationality and activity. Always confirm current prices at the
          park office or with your lodge before travel — figures below are typical guides for
          2025 planning.
        </p>
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
          Park entry fees (per day)
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border-brand bg-white">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-brand bg-cream/80 text-xs font-bold uppercase text-text-light">
                <th className="px-4 py-3">Visitor type</th>
                <th className="px-4 py-3">Approx. fee (NPR)</th>
              </tr>
            </thead>
            <tbody className="text-text-mid">
              <tr className="border-b border-border-brand/60">
                <td className="px-4 py-3 font-semibold">Foreign nationals</td>
                <td className="px-4 py-3">2,000+ per day</td>
              </tr>
              <tr className="border-b border-border-brand/60">
                <td className="px-4 py-3 font-semibold">SAARC nationals</td>
                <td className="px-4 py-3">1,000+ per day</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Nepali citizens</td>
                <td className="px-4 py-3">150+ per day</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-text-light">
          Children and students may receive discounts with valid ID. Fees are subject to change
          by the Department of National Parks and Wildlife Conservation.
        </p>
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
          Where to buy permits
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 leading-8">
          <li>Chitwan National Park visitor centre near Sauraha</li>
          <li>Through your hotel, guesthouse, or tour operator (often includes handling fee)</li>
          <li>At the start of organised jungle safari or canoe packages</li>
        </ul>
        <p className="mt-4 leading-8">
          Keep your permit receipt with you during activities inside the buffer zone and core
          areas where checks apply.
        </p>
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
          Activities that need permits
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 leading-8">
          <li>Jungle walks and guided safaris (jeep or walking)</li>
          <li>Canoe rides on the Rapti River</li>
          <li>Bird-watching and cultural village tours in regulated zones</li>
          <li>Elephant breeding centre visits (separate ticket may apply)</li>
        </ul>
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
          Jungle safari permit process
        </h2>
        <p className="mt-4 leading-8">
          Most travellers book a package: park entry + guide + transport. Your operator obtains
          permits on your behalf. For independent visits, visit the park office in Sauraha with
          passport or citizenship copy, pay the daily entry fee, and hire a licensed guide for
          walking safaris as required.
        </p>
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
          Canoe ride fees
        </h2>
        <p className="mt-4 leading-8">
          Short canoe trips on the Rapti are often bundled with sunset packages (roughly NPR
          800–1,500 per person depending on duration and operator). Longer wildlife-focused
          canoe tours cost more. Always confirm whether park entry is included in the quoted
          price.
        </p>
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
          Tips to save money
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 leading-8">
          <li>Compare package prices from several lodges in Sauraha before booking</li>
          <li>Travel in a small group to split guide and jeep costs</li>
          <li>Visit in shoulder season (April–May or late September) for softer lodge rates</li>
          <li>Ask if park entry is already included — avoid paying twice</li>
          <li>Carry cash (NPR) for on-site permit counters</li>
        </ul>
      </section>
    </BlogArticleLayout>
  )
}
