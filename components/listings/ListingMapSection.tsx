import { getGoogleMapsEmbedUrl } from "@/lib/google-maps"

type ListingMapSectionProps = {
  address: string | null
  googleMapsLink: string | null
}

function addressEmbedUrl(address: string) {
  const q = encodeURIComponent(`${address}, Sauraha, Nepal`)
  return `https://www.google.com/maps?q=${q}&output=embed`
}

export default function ListingMapSection({
  address,
  googleMapsLink,
}: ListingMapSectionProps) {
  const embedUrl = googleMapsLink
    ? getGoogleMapsEmbedUrl(googleMapsLink)
    : address
      ? addressEmbedUrl(address)
      : null
  const directionsUrl =
    googleMapsLink?.trim() ||
    (address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, Sauraha, Nepal`)}` : null)

  if (!embedUrl && !address) return null

  return (
    <section className="rounded-2xl border border-border-brand bg-white p-6">
      <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-green-brand">
        Location
      </h2>
      {address && <p className="mt-2 text-sm text-text-mid">{address}</p>}

      {embedUrl && (
        <iframe
          title="Map location"
          src={embedUrl}
          className="mt-4 h-56 w-full rounded-xl border border-border-brand"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}

      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm font-semibold text-green-mid hover:underline"
        >
          Get Directions →
        </a>
      )}
    </section>
  )
}
