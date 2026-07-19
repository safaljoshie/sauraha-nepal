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
import HomeScrollToTop from "@/components/home/HomeScrollToTop"
import HomeTravelGuides from "@/components/home/HomeTravelGuides"
import HomeTrust from "@/components/home/HomeTrust"
import HomeWhereToStay from "@/components/home/HomeWhereToStay"
import { fetchPublishedBlogPostsPreview, fetchPublishedBlogPostCount } from "@/lib/blog-db"
import { buildHomepageData } from "@/lib/homepage-data"
import { fetchApprovedListings, fetchApprovedListingsCount } from "@/lib/listings-fetch"
import { toHeroSearchListings } from "@/lib/listings-catalog"
import { fetchCategoryCatalog } from "@/lib/category-catalog"
import { fetchActiveHeroMedia } from "@/lib/site-content"

import { DEFAULT_OG_IMAGE, SITE_KEYWORDS } from "@/lib/seo"

export async function generateMetadata(): Promise<Metadata> {
  const heroMedia = await fetchActiveHeroMedia()
  const primaryVideo = heroMedia[0] ?? null
  const ogImage = primaryVideo?.poster_url?.trim() || DEFAULT_OG_IMAGE

  return {
    title: {
      absolute: "Sauraha | Nepal - Complete Tour Guide",
    },
    description:
      "Your complete guide to Sauraha — gateway to Chitwan National Park. Best stays, food, activities & local experiences.",
    keywords: [...SITE_KEYWORDS],
    alternates: { canonical: "https://www.saurahanepal.com" },
    openGraph: {
      title: "Sauraha | Nepal - Complete Tour Guide",
      description:
        "Your complete guide to Sauraha — gateway to Chitwan National Park. Best stays, food, activities & local experiences.",
      url: "https://www.saurahanepal.com",
      siteName: "Sauraha Nepal",
      locale: "en_US",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Sauraha | Nepal - Complete Tour Guide",
      description:
        "Your complete guide to Sauraha — gateway to Chitwan National Park. Best stays, food, activities & local experiences.",
      images: [ogImage],
    },
  }
}

export default async function HomePage() {
  const [listings, heroMedia, blogPosts, catalog, businessCount, guidesCount] = await Promise.all([
    fetchApprovedListings(),
    fetchActiveHeroMedia(),
    fetchPublishedBlogPostsPreview(4),
    fetchCategoryCatalog(),
    fetchApprovedListingsCount(),
    fetchPublishedBlogPostCount(),
  ])
  const data = buildHomepageData(listings, catalog)
  const primaryHeroMedia = heroMedia[0] ?? null
  const useBlogFallback = blogPosts.length === 0

  return (
    <>
      <div id="home-page-marker" hidden aria-hidden />
      <HomeScrollToTop />
      <HomeJsonLd
        featuredListings={data.featured}
        blogCount={guidesCount}
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
