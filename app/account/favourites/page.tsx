import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import FavouriteButton from "@/components/favourites/FavouriteButton"
import { fetchMyFavourites } from "@/lib/favourites"
import { getOwnProfile } from "@/lib/profiles"

export default async function MyFavouritesPage() {
  const result = await getOwnProfile()
  if (!result) redirect("/signin?next=/account/favourites")

  const favourites = await fetchMyFavourites(result.user.id)
  const listings = favourites.filter((f) => f.target_type === "listing")
  const guides = favourites.filter((f) => f.target_type === "guide")

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-ink md:text-3xl">My Favourites</h1>
        <p className="mt-1 text-text-mid">
          Listings and guides you&apos;ve saved for later.
        </p>
      </header>

      {favourites.length === 0 ? (
        <div className="rounded-xl border border-border-brand bg-white px-5 py-10 text-center">
          <p className="text-text-mid">No favourites yet.</p>
          <p className="mt-2 text-sm text-text-light">
            Tap the green heart on a listing or guide to save it here.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/listings"
              className="rounded-xl bg-green-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-mid"
            >
              Browse listings
            </Link>
            <Link
              href="/guides"
              className="rounded-xl border border-green-brand px-4 py-2.5 text-sm font-bold text-green-brand transition-colors hover:bg-green-brand/5"
            >
              Browse guides
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {listings.length > 0 ? (
            <section>
              <h2 className="mb-4 font-heading text-lg font-bold text-ink">Listings</h2>
              <ul className="space-y-3">
                {listings.map((item) => (
                  <FavouriteRow key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ) : null}

          {guides.length > 0 ? (
            <section>
              <h2 className="mb-4 font-heading text-lg font-bold text-ink">Guides</h2>
              <ul className="space-y-3">
                {guides.map((item) => (
                  <FavouriteRow key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  )
}

function FavouriteRow({
  item,
}: {
  item: Awaited<ReturnType<typeof fetchMyFavourites>>[number]
}) {
  return (
    <li className="flex items-center gap-4 rounded-xl border border-border-brand bg-white p-3 sm:p-4">
      <Link href={item.href} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-text-light">
            {item.target_type === "guide" ? "Guide" : "Listing"}
          </span>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={item.href}
          className="font-semibold text-ink hover:text-green-brand"
        >
          {item.title}
        </Link>
        {item.subtitle ? (
          <p className="mt-0.5 truncate text-sm text-text-mid">{item.subtitle}</p>
        ) : null}
      </div>
      <FavouriteButton
        targetType={item.target_type}
        targetId={item.target_id}
        signedIn
        initialFavourited
        variant="card"
      />
    </li>
  )
}
