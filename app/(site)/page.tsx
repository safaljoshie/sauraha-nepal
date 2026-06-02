import Image from "next/image"
import Link from "next/link"
import CategoryCard from "@/components/CategoryCard"
import HeroSearch from "@/components/HeroSearch"
import ListingCard from "@/components/ListingCard"
import {
  activities,
  blogPosts,
  categories,
  featuredListings,
} from "@/lib/data"

const heroStats = [
  { value: "120+", label: "Businesses Listed" },
  { value: "7", label: "Categories" },
  { value: "932 km²", label: "National Park" },
  { value: "Free", label: "To Explore" },
]

export default function HomePage() {
  return (
    <main>
      <section className="relative mt-[68px] flex min-h-[88vh] items-center justify-center overflow-hidden bg-[#0a2310] px-6 py-16 text-center">
        <video
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=80"
        >
          <source
            src="https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_25fps.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(10,35,12,0.6)] via-[rgba(10,35,12,0.45)] to-[rgba(10,35,12,0.7)]" />

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
          <HeroSearch />
          <div className="flex flex-wrap justify-center gap-10">
            {heroStats.map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <strong className="block text-2xl font-bold text-orange-light">
                  {stat.value}
                </strong>
                <span className="text-sm opacity-80">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="section-label">Browse by Category</p>
          <h2 className="section-title">What are you looking for?</h2>
          <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-5">
            {categories.map((cat) => (
              <CategoryCard key={cat.name} {...cat} />
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
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.name} {...listing} />
            ))}
          </div>
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
            {activities.map((activity) => (
              <div
                key={activity.name}
                className="group relative h-60 cursor-pointer overflow-hidden rounded-2xl transition-transform hover:scale-[1.03]"
              >
                <Image
                  src={activity.image}
                  alt={activity.name}
                  fill
                  className="object-cover"
                  sizes="240px"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[rgba(10,35,12,0.85)] to-transparent p-5">
                  <p className="font-bold text-white">{activity.name}</p>
                  <p className="text-sm text-white/75">{activity.description}</p>
                </div>
              </div>
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
            <Link href="#" className="view-all-link">
              Read all guides →
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
            {blogPosts.map((post) => (
              <article
                key={post.title}
                className="card-hover overflow-hidden rounded-2xl border border-border-brand"
              >
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
                  <p className="mt-2 text-sm text-text-light">{post.meta}</p>
                </div>
              </article>
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
