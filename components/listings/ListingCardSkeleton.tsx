export default function ListingCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-border-brand bg-white">
      <div className="h-[210px] bg-gray-200" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 rounded bg-gray-200" />
        <div className="h-5 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-5/6 rounded bg-gray-200" />
        <div className="flex justify-between border-t border-border-brand pt-3">
          <div className="h-4 w-16 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 rounded-2xl bg-gray-200" />
          <div className="h-8 w-24 rounded-2xl bg-gray-200" />
        </div>
      </div>
    </div>
  )
}
