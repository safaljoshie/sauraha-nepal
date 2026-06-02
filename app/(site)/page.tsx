import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import CategoryCard from "@/components/CategoryCard"
import HomeActivityCard from "@/components/home/HomeActivityCard"
import HomeFeaturedCard from "@/components/home/HomeFeaturedCard"
import HeroSearch from "@/components/home/HeroSearch"
import HeroStats from "@/components/home/HeroStats"
import { BLOG_POSTS } from "@/lib/blog-posts"
import { buildHomepageData } from "@/lib/homepage-data"
import { fetchApprovedListings } from "@/lib/listings-fetch"
import { fetchActiveHeroMedia } from "@/lib/site-content"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Sauraha Nepal — Your Complete Guide to Sauraha & Chitwan",
  description:
    "Find the best hotels, restaurants, activities and tour guides in Sauraha, Nepal. Your complete directory for Chitwan National Park visitors.",
  openGraph: {
    title: "Sauraha Nepal — Your Complete Guide to Sauraha & Chitwan",
    description:
      "Find the best hotels, restaurants, activities and tour guides in Sauraha, Nepal. Your complete directory for Chitwan National Park visitors.",
    url: "https://www.saurahanepal.com",
    siteName: "Sauraha Nepal",
    type: "website",
    images: ["/images/home-hero.png"],
  },
}

export default async function HomePage() {
  const listings = await fetchApprovedListings()
  const data = buildHomepageData(listings)
  const heroMedia = await fetchActiveHeroMedia()
  const primaryHeroMedia = heroMedia[0] ?? null

  const heroStats = [
    {
      label: "Businesses Listed",
      type: "animated" as const,
      value: data.stats.businessCount,
    },
    {
      label: "Categories",
      type: "animated" as const,
      value: data.stats.categoryCount,
    },
    { label: "National Park", type: "static" as const, display: "932 km²" },
    { label: "To Explore", type: "static" as const, display: "Free" },
  ]

  return (
    <main>
      <section className="relative mt-[68px] flex min-h-[88vh] items-center justify-center overflow-hidden bg-[#0a2310] px-6 py-16 text-center">
        {/* Replace hero video with a compressed MP4/WebM under ~5MB for faster loads */}
        {primaryHeroMedia?.type === "video" ? (
          <video
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={primaryHeroMedia.poster_url ?? "/images/home-hero.png"}
          >
            <source src={primaryHeroMedia.url} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={primaryHeroMedia?.url ?? "/images/home-hero.png"}
            alt={
              primaryHeroMedia?.alt_text ||
              "One-horned rhinoceros in Chitwan National Park near Sauraha"
            }
            fill
            priority
            className="pointer-events-none object-cover object-center"
            sizes="100vw"
          />
        )}
        <div
          className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(26,92,42,0.12)] via-[rgba(26,92,42,0.22)] to-[rgba(10,35,12,0.52)]"
          aria-hidden
        />

        <div className="relative z-20 max-w-3xl">
          <span className="mb-6 inline-block rounded-full bg-orange-brand px-4 py-1.5 text-xs font-bold tracking-widest text-white uppercase">
            Gateway to Chitwan National Park
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl leading-tight font-bold text-white md:text-6xl">
            Discover the Wild Heart of{" "}
            <span className="text-orange-light">Sauraha</span>
          </h1>
          <p className="mx-auto mt-5 mb-8 max-w-xl text-lg font-light text-white/88">
            Your complete guide to hotels, restaurants, activities, and everything
            in between — from jungle safaris to riverside sunsets.
          </p>
          <HeroSearch listings={data.listings} />
          <HeroStats stats={heroStats} />
        </div>
      </section>

      <section className="bg-white px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="section-label">Browse by Category</p>
          <h2 className="section-title">What are you looking for?</h2>
          <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-5">
            {data.categories.map((cat) => (
              <CategoryCard
                key={cat.slug}
                icon={cat.icon}
                name={cat.name}
                count={cat.countLabel}
                href={cat.href}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-label">Featured Listings</p>
              <h2 className="section-title mb-0">Top picks in Sauraha</h2>
            </div>
            <Link href="/listings" className="view-all-link">
              View all listings →
            </Link>
          </div>
          {data.featured.length === 0 ? (
            <div className="rounded-2xl border border-border-brand bg-white px-8 py-14 text-center">
              <p className="text-lg text-text-mid">
                No listings yet — be the first to list your business!
              </p>
              <Link href="/list-your-business" className="btn-primary mt-6 inline-block px-8 py-3">
                List Your Business
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.featured.map((listing) => (
                <HomeFeaturedCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="activities" className="bg-green-brand px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold tracking-widest text-orange-light uppercase">
            Popular Experiences
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white md:text-4xl">
            Things to do in Sauraha
          </h2>
          <p className="section-sub mt-4 text-white/70">
            From jungle safaris at dawn to cultural Tharu shows at dusk — there&apos;s
            something for every explorer.
          </p>
          <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
            {data.activities.map((item, i) => (
              <HomeActivityCard key={item.type === "listing" ? item.listing.id : `p-${i}`} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-label">Travel Tips</p>
              <h2 className="section-title mb-0">Plan your perfect trip</h2>
            </div>
            <Link href="/listings" className="view-all-link">
              Browse listings →
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.href}
                href={post.href}
                className="card-hover group overflow-hidden rounded-2xl border border-border-brand"
              >
                <article>
                  <div className="relative h-[180px] overflow-hidden">
                    <Image
                      src={post.image}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-400 group-hover:scale-105"
                      sizes="400px"
                    />
                  </div>
                  <div className="p-5">
                    <p className="mb-2 text-xs font-bold tracking-widest text-orange-brand uppercase">
                      {post.tag}
                    </p>
                    <h3 className="font-[family-name:var(--font-playfair)] text-lg leading-snug text-text-brand">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-text-light">{post.readTime}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-orange-brand to-[#c94d0e] px-8 py-20 text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white md:text-4xl">
          Own a business in Sauraha?
        </h2>
        <p className="mx-auto mt-4 mb-8 max-w-lg text-lg text-white/85">
          Get your hotel, restaurant, or tour operation in front of thousands of
          visitors every month. Listing is free to start.
        </p>
        <Link
          href="/list-your-business"
          className="inline-block rounded-full bg-white px-9 py-3.5 font-bold text-orange-brand transition-colors hover:bg-green-brand hover:text-white"
        >
          List Your Business Free →
        </Link>
      </section>
    </main>
  )
}
