import type { Metadata } from "next"
import HomeEatDrink from "@/components/home/HomeEatDrink"
import HomeExperiences from "@/components/home/HomeExperiences"
import HomeHero from "@/components/home/HomeHero"
import HomeIntro from "@/components/home/HomeIntro"
import HomeJsonLd from "@/components/home/HomeJsonLd"
import HomeListBusiness from "@/components/home/HomeListBusiness"
import HomeMapSectionLoader from "@/components/home/HomeMapSectionLoader"
import HomeNewsletter from "@/components/home/HomeNewsletter"
import HomePlacesToGo from "@/components/home/HomePlacesToGo"
import HomePlanTrip from "@/components/home/HomePlanTrip"
import HomePromoBanner from "@/components/home/HomePromoBanner"
import HomeTravelGuides from "@/components/home/HomeTravelGuides"
import HomeTrust from "@/components/home/HomeTrust"
import HomeWhereToStay from "@/components/home/HomeWhereToStay"
import { fetchPublishedBlogPostsPreview } from "@/lib/blog-db"
import { buildHomepageData } from "@/lib/homepage-data"
import { fetchApprovedListings } from "@/lib/listings-fetch"
import { toHeroSearchListings } from "@/lib/listings-catalog"
import { fetchCategoryCatalog } from "@/lib/category-catalog"
import { fetchActiveHeroMedia } from "@/lib/site-content"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const heroMedia = await fetchActiveHeroMedia()
  const primaryVideo = heroMedia[0] ?? null
  const ogImage = primaryVideo?.poster_url?.trim() || "/images/sauraha-hero.jpg"

  return {
    title: "Discover Sauraha & Chitwan National Park | Sauraha Nepal",
    description:
      "Find the best Sauraha hotels, Chitwan safari experiences, restaurants, and travel guides. Plan your trip to Nepal's wildlife capital.",
    keywords: [
      "Sauraha hotels",
      "Chitwan safari",
      "things to do in Sauraha",
      "Chitwan travel guide",
      "Sauraha restaurants",
    ],
    openGraph: {
      title: "Discover Sauraha & Chitwan National Park",
      description:
        "Hotels, jungle safaris, restaurants, guides and travel information in Nepal's wildlife capital.",
      url: "https://www.saurahanepal.com",
      siteName: "Sauraha Nepal",
      type: "website",
      images: [ogImage],
    },
  }
}

export default async function HomePage() {
  const [listings, heroMedia, blogPosts, catalog] = await Promise.all([
    fetchApprovedListings(),
    fetchActiveHeroMedia(),
    fetchPublishedBlogPostsPreview(4),
    fetchCategoryCatalog(),
  ])
  const data = buildHomepageData(listings, catalog)
  const primaryHeroMedia = heroMedia[0] ?? null
  const useBlogFallback = blogPosts.length === 0
  const businessCount = listings.length
  const guidesCount = blogPosts.length

  return (
    <>
      <HomeJsonLd
        featuredListings={data.featured}
        blogCount={blogPosts.length}
      />
      <main className="bg-surface">
        <HomeHero
          primaryHeroMedia={primaryHeroMedia}
          searchListings={toHeroSearchListings(data.listings)}
          searchCategories={catalog}
        />
        <HomeIntro />
        <HomePlacesToGo />
        <HomeExperiences experiences={data.experiences} />
        <HomePromoBanner />
        <HomePlanTrip />
        <HomeWhereToStay stayListings={data.stayListings} />
        <HomeEatDrink />
        <HomeMapSectionLoader listings={data.listings} catalog={catalog} />
        <HomeTravelGuides posts={blogPosts} useFallback={useBlogFallback} />
        <HomeTrust businessCount={businessCount} guidesCount={guidesCount} />
        <HomeListBusiness />
        <HomeNewsletter />
      </main>
    </>
  )
}
