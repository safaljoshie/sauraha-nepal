import { redirect } from "next/navigation"
import { getOwnProfile } from "@/lib/profiles"
import { fetchMyReviews, type MyReview } from "@/lib/account-reviews"

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-green-mid/10 text-green-brand",
  pending: "bg-orange-brand/10 text-orange-brand",
  rejected: "bg-black/5 text-text-mid",
}

export default async function MyReviewsPage() {
  const result = await getOwnProfile()
  if (!result) redirect("/signin?next=/account/reviews")

  const reviews = await fetchMyReviews(result.user.id)

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-ink md:text-3xl">My reviews</h1>
        <p className="mt-1 text-text-mid">Reviews you’ve written and their moderation status.</p>
      </header>

      {reviews.length === 0 ? (
        <p className="rounded-xl border border-border-brand bg-white px-5 py-8 text-center text-text-mid">
          You haven’t written any reviews yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={`${review.kind}-${review.id}`} review={review} />
          ))}
        </ul>
      )}
    </div>
  )
}

function ReviewCard({ review }: { review: MyReview }) {
  const badge = STATUS_STYLES[review.status] ?? "bg-black/5 text-text-mid"
  return (
    <li className="rounded-xl border border-border-brand bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="text-xs font-bold tracking-wide text-text-mid uppercase">
            {review.kind}
          </span>
          <p className="font-semibold text-ink">{review.subjectName}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${badge}`}>
          {review.status}
        </span>
      </div>
      <p className="mt-2 text-sm text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
        {"★".repeat(review.rating)}
        <span className="text-black/15">{"★".repeat(5 - review.rating)}</span>
      </p>
      <p className="mt-2 text-sm text-text-mid">{review.comment}</p>
    </li>
  )
}
