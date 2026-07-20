/**
 * One-time manual tool: resolve listing coordinates and persist them.
 * NOT part of the Next.js app — run via `npm run backfill:coordinates`.
 *
 * Geocoding used to run on every render of /listings and the homepage map,
 * serially, with a 1.1s sleep between Nominatim attempts. That is both slow and
 * against Nominatim's usage policy, which requires bulk geocoding to happen
 * offline. Coordinates never change, so they belong in the database.
 *
 * Pass --dry-run to resolve and report without writing.
 * Pass --all to re-resolve listings that already have coordinates.
 * Pass --json <path> to also write resolved coordinates to a JSON file.
 */
import { writeFileSync } from "node:fs"
import { createClient } from "@supabase/supabase-js"
import { buildListingCoordinateMap } from "../lib/map-coordinates"
import { loadEnvLocal } from "./load-env"

type Row = {
  id: string
  business_name: string
  address: string | null
  google_maps_link: string | null
  latitude: number | null
  longitude: number | null
}

loadEnvLocal()

const dryRun = process.argv.includes("--dry-run")
const redoAll = process.argv.includes("--all")

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
// A dry run only reads, so the anon key is enough to preview results.
const readKey = serviceKey || (dryRun ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined)

if (!url || !readKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Add them to .env.local (the service role key is required to write; " +
      "--dry-run also accepts NEXT_PUBLIC_SUPABASE_ANON_KEY).",
  )
  process.exit(1)
}

const supabase = createClient(url, readKey, {
  auth: { persistSession: false },
})

async function main() {
  const { data, error } = await supabase
    .from("business_listings")
    .select("id, business_name, address, google_maps_link, latitude, longitude")
    .eq("status", "approved")

  if (error) {
    console.error("Failed to load listings:", error.message)
    process.exit(1)
  }

  const all = (data ?? []) as Row[]
  const todo = all.filter((row) => {
    if (!redoAll && typeof row.latitude === "number" && typeof row.longitude === "number") {
      return false
    }
    // Nothing to geocode from: no link, no address, no name to search on.
    return Boolean(row.google_maps_link?.trim() || row.address?.trim() || row.business_name?.trim())
  })

  console.log(
    `${all.length} approved listings, ${todo.length} to resolve` +
      (dryRun ? " (dry run — nothing will be written)" : ""),
  )
  if (todo.length === 0) return

  console.log("Geocoding is rate limited to ~1 request/sec; this may take several minutes.\n")

  const coordinates = await buildListingCoordinateMap(todo)

  let written = 0
  let unresolved = 0

  for (const row of todo) {
    const coords = coordinates[row.id]
    if (!coords) {
      unresolved += 1
      console.warn(`  unresolved: ${row.business_name}`)
      continue
    }

    if (dryRun) {
      console.log(`  ${row.business_name} → ${coords.lat}, ${coords.lng}`)
      written += 1
      continue
    }

    const { error: updateError } = await supabase
      .from("business_listings")
      .update({
        latitude: coords.lat,
        longitude: coords.lng,
        geocoded_at: new Date().toISOString(),
      })
      .eq("id", row.id)

    if (updateError) {
      console.error(`  write failed for ${row.business_name}: ${updateError.message}`)
      continue
    }

    written += 1
    console.log(`  ${row.business_name} → ${coords.lat}, ${coords.lng}`)
  }

  const jsonFlag = process.argv.indexOf("--json")
  if (jsonFlag !== -1 && process.argv[jsonFlag + 1]) {
    const payload = todo
      .filter((row) => coordinates[row.id])
      .map((row) => ({
        id: row.id,
        business_name: row.business_name,
        lat: coordinates[row.id].lat,
        lng: coordinates[row.id].lng,
      }))
    writeFileSync(process.argv[jsonFlag + 1], JSON.stringify(payload, null, 2))
    console.log(`\nWrote ${payload.length} resolved coordinates to ${process.argv[jsonFlag + 1]}`)
  }

  console.log(
    `\nDone. ${written} ${dryRun ? "resolvable" : "written"}, ${unresolved} unresolved.`,
  )
  if (unresolved > 0) {
    console.log(
      "Unresolved listings simply render without a map pin. Add a lat/lng to their " +
        "google_maps_link in admin, then re-run to fix them.",
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
