import ListingCardSkeleton from "@/components/listings/ListingCardSkeleton"

export default function HomeLoading() {
  return (
    <main>
      <section className="relative mt-[68px] flex min-h-[60vh] items-center justify-center bg-[#0a2310] px-6 py-16 text-center">
        <div className="mx-auto max-w-3xl animate-pulse">
          <div className="mx-auto mb-6 h-6 w-48 rounded-full bg-white/20" />
          <div className="mx-auto h-12 w-full max-w-lg rounded-lg bg-white/20" />
          <div className="mx-auto mt-4 h-20 w-full max-w-xl rounded-full bg-white/20" />
          <div className="mt-10 flex justify-center gap-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-16 rounded bg-white/20" />
            ))}
          </div>
        </div>
      </section>
      <section className="bg-cream px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
