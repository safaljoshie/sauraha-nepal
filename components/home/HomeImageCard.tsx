import Image from "next/image"
import Link from "next/link"
import { DEFAULT_IMAGE_QUALITY } from "@/lib/image"

type HomeImageCardProps = {
  href: string
  image: string
  title: string
  subtitle: string
  aspect?: "portrait" | "landscape"
  sizes?: string
  priority?: boolean
}

export default function HomeImageCard({
  href,
  image,
  title,
  subtitle,
  aspect = "portrait",
  sizes = "(max-width: 768px) 80vw, 25vw",
  priority = false,
}: HomeImageCardProps) {
  const aspectClass =
    aspect === "portrait" ? "nsw-destination-card" : "nsw-experience-card"

  return (
    <Link href={href} className={`${aspectClass} card-hover`}>
      <article className="relative h-full w-full">
        <Image
          src={image}
          alt={title}
          fill
          className="nsw-card-image"
          sizes={sizes}
          quality={DEFAULT_IMAGE_QUALITY}
          priority={priority}
          loading={priority ? undefined : "lazy"}
        />
        <div className="nsw-destination-overlay" aria-hidden />
        <div className="absolute right-0 bottom-0 left-0 p-5 text-white md:p-6">
          <h3 className="font-heading text-xl font-bold tracking-tight md:text-2xl">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-snug text-white/85 md:text-[0.95rem]">
            {subtitle}
          </p>
        </div>
      </article>
    </Link>
  )
}
