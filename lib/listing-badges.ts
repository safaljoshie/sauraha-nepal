const NEW_LISTING_MS = 7 * 24 * 60 * 60 * 1000

export function isNewListing(createdAt: string) {
  const created = new Date(createdAt).getTime()
  if (Number.isNaN(created)) return false
  return Date.now() - created < NEW_LISTING_MS
}
