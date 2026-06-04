import Link from "next/link"
import HomeImageCard from "@/components/home/HomeImageCard"
import type { HomepageData } from "@/lib/homepage-data"

export default function HomeExperiences({
  experiences,
}: {
  experiences: HomepageData["experiences"]
}) {
  return (
    <section id="experiences" className="home-section scroll-mt-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-12">
          <h2 className="nsw-section-title">Things to do</h2>
          <Link href="/listings?category=activities" className="nsw-view-all shrink-0">
            View all activities
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((exp) => (
            <HomeImageCard
              key={exp.name}
              href={exp.href}
              image={exp.image}
              title={exp.name}
              subtitle={exp.description}
              aspect="landscape"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
