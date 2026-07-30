import { unstable_cache } from "next/cache"
import type { BusinessListingSummary } from "@/lib/business-listing"
import { fetchApprovedListings } from "@/lib/listings-fetch"
import { getListingDetailPath } from "@/lib/listing-url"

const MAX_LISTINGS = 80
const MAX_QUERY_MATCHES = 30
const DESCRIPTION_SLICE = 80

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "for",
  "to",
  "in",
  "of",
  "on",
  "at",
  "is",
  "are",
  "me",
  "my",
  "i",
  "we",
  "you",
  "with",
  "from",
  "about",
  "best",
  "good",
  "please",
  "want",
  "need",
  "looking",
  "find",
  "any",
  "some",
  "can",
  "do",
  "what",
  "where",
  "how",
  "near",
  "sauraha",
  "nepal",
  "chitwan",
])

/**
 * Cached approved listings for chat. Short TTL + `listings` tag so admin
 * approve/edit/delete via revalidateTag keeps Dhurbe's directory fresh.
 */
const getCachedApprovedListingsForChat = unstable_cache(
  async (): Promise<BusinessListingSummary[]> => fetchApprovedListings(),
  ["chat-approved-listings"],
  { revalidate: 900, tags: ["listings"] },
)

function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t))
}

function scoreListing(listing: BusinessListingSummary, tokens: string[]): number {
  if (tokens.length === 0) return 0

  const name = listing.business_name.toLowerCase()
  const category = (listing.category ?? "").toLowerCase()
  const desc = (listing.description_preview ?? "").toLowerCase()

  let score = 0
  for (const token of tokens) {
    if (name.includes(token)) score += 5
    if (category.includes(token)) score += 4
    if (desc.includes(token)) score += 2
  }

  if (listing.plan === "premium") score += 1.5
  else if (listing.plan === "featured") score += 1
  if (listing.verified) score += 0.5

  return score
}

function selectListingsForQuery(
  listings: BusinessListingSummary[],
  query: string,
): BusinessListingSummary[] {
  if (listings.length === 0) return []

  const tokens = tokenizeQuery(query)
  if (tokens.length === 0) {
    return listings.slice(0, MAX_LISTINGS)
  }

  const scored = listings
    .map((listing) => ({ listing, score: scoreListing(listing, tokens) }))
    .sort((a, b) => b.score - a.score)

  const matches = scored
    .filter((row) => row.score > 0)
    .slice(0, MAX_QUERY_MATCHES)
    .map((row) => row.listing)

  if (matches.length >= MAX_LISTINGS) {
    return matches.slice(0, MAX_LISTINGS)
  }

  const seen = new Set(matches.map((l) => l.id))
  const fallback = listings.filter((l) => !seen.has(l.id))
  return [...matches, ...fallback].slice(0, MAX_LISTINGS)
}

function formatListingRow(listing: BusinessListingSummary): string {
  const desc = listing.description_preview?.trim().slice(0, DESCRIPTION_SLICE) ?? ""
  const parts = [
    `- ${listing.business_name}`,
    listing.category ? `Category: ${listing.category}` : null,
    listing.plan ? `Plan: ${listing.plan}` : null,
    listing.verified ? "Verified" : null,
    listing.price_range ? `Price: ${listing.price_range}` : null,
    desc || null,
    `Listing URL: ${getListingDetailPath(listing)}`,
  ].filter(Boolean)
  return parts.join(" | ")
}

/** Build a compact, query-ranked directory block for the system prompt. */
export async function buildListingsContext(query = ""): Promise<string> {
  const listings = await getCachedApprovedListingsForChat()
  const slice = selectListingsForQuery(listings, query)

  if (slice.length === 0) {
    return "No listings available yet"
  }

  return slice.map(formatListingRow).join("\n")
}

export function buildChatSystemPrompt(listingsContext: string): string {
  return `You are Dhurbe, a concise AI travel guide for Sauraha, Nepal (gateway to Chitwan National Park).

Introduce yourself as Dhurbe only on the first greeting in a conversation — not every reply.

Facts you may use briefly when relevant:
- Park: UNESCO site; rhinos, tigers, elephants, gharials, birds
- Activities: jeep safari, canoe, jungle walk, birdwatching, Tharu culture
- Best season: Oct–Mar
- Getting there: tourist bus from Kathmandu (~5–6 hrs), private car, or flight to Bharatpur
- Park fees: foreigners ~$25/day, SAARC ~$10/day (confirm locally)

Current directory on saurahanepal.com (recommend ONLY from this list):
${listingsContext}

Reply rules:
- Keep answers short: about 80 words max unless the user asks for a full itinerary
- Lead with one short sentence, then up to 3 listing bullets with the given Listing URL when recommending places
- Prefer verified / premium / featured when several options fit
- Never invent businesses, prices, or URLs not in the directory above
- If nothing matches, say so and point to https://www.saurahanepal.com/listings
- For prices: "prices may vary — contact them directly"
- No emojis; no obligatory closing questions
- Match the user's language
- If unsure: "I'm not sure — email hello@mail.saurahanepal.com"`
}
