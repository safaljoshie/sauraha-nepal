/**
 * One-time manual tool: compress existing listing photos in Supabase.
 * NOT part of the Next.js app — run via `npm run compress-photos:dry` or `npm run compress-photos`.
 */
import { createClient } from "@supabase/supabase-js"
import { existsSync, readFileSync } from "node:fs"
import { basename, resolve } from "node:path"
import {
  getListingPhotosBucket,
  parsePhotoLinkLines,
  photoLinkStorageKey,
} from "../lib/list-business-photos"
import {
  buildCompressedListingPhotoPath,
  compressListingPhotoBuffer,
  isAlreadyCompressedListingPhotoUrl,
  isLegacyUncompressedListingPhotoUrl,
  LISTING_PHOTO_MAX_DIMENSION,
  LISTING_PHOTO_WEBP_QUALITY,
  uploadListingPhoto,
} from "../lib/upload-listing-photo"

const LISTING_DELAY_MS = 800

type ListingRow = {
  id: string
  business_name: string
  photo_links: string | null
  status: string
}

type PhotoResult = {
  url: string
  originalBytes: number
  compressedBytes: number
  newUrl: string
  skipped: boolean
  skipReason?: string
}

type ListingSummary = {
  name: string
  status: string
  photosProcessed: number
  photosSkipped: number
  photosFailed: number
  originalBytes: number
  compressedBytes: number
  failed: boolean
  error?: string
}

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local")
  if (!existsSync(envPath)) {
    console.warn("Warning: .env.local not found — relying on existing process.env")
    return
  }

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

/** Canonical format is newline-separated; also tolerates comma or JSON arrays. */
export function parsePhotoLinksField(photoLinks: string | null): string[] {
  if (!photoLinks?.trim()) return []

  const trimmed = photoLinks.trim()
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (Array.isArray(parsed)) {
        return parsed.map((entry) => String(entry).trim()).filter(Boolean)
      }
    } catch {
      // fall through to line-based parsing
    }
  }

  if (trimmed.includes("\n")) {
    return parsePhotoLinkLines(trimmed)
  }

  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
  }

  return [trimmed]
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function sleep(ms: number) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms))
}

function compressedStoragePath(listingId: string, sourceUrl: string) {
  const originalName = basename(new URL(sourceUrl).pathname)
  const stem = originalName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_")
  return buildCompressedListingPhotoPath(listingId, `${stem || "photo"}.webp`)
}

function reductionPercent(original: number, compressed: number) {
  if (original <= 0) return "0%"
  return `${(((original - compressed) / original) * 100).toFixed(1)}%`
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${url}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

function compressedStoragePathFromUrl(photoUrl: string, bucket: string) {
  const key = photoLinkStorageKey(photoUrl)
  if (!key.startsWith(`${bucket}/`)) return null
  return key.slice(bucket.length + 1)
}

async function processPhoto(
  listingId: string,
  photoUrl: string,
  supabaseUrl: string,
  bucket: string,
  dryRun: boolean,
  recompress: boolean,
): Promise<PhotoResult> {
  if (recompress && isAlreadyCompressedListingPhotoUrl(photoUrl)) {
    const storagePath = compressedStoragePathFromUrl(photoUrl, bucket)
    if (!storagePath?.startsWith("compressed/")) {
      console.log(`    ↷ Skipping non-compressed storage path: ${photoUrl}`)
      return {
        url: photoUrl,
        originalBytes: 0,
        compressedBytes: 0,
        newUrl: photoUrl,
        skipped: true,
        skipReason: "not under compressed/",
      }
    }

    console.log(`    ↓ Re-downloading compressed: ${photoUrl}`)
    const originalBuffer = await downloadImage(photoUrl)
    const originalBytes = originalBuffer.byteLength

    if (dryRun) {
      const estimated = await compressListingPhotoBuffer(originalBuffer)
      console.log(
        `    [DRY RUN] Would recompress ${formatBytes(originalBytes)} → ${formatBytes(estimated.byteLength)} at ${storagePath}`,
      )
      return {
        url: photoUrl,
        originalBytes,
        compressedBytes: estimated.byteLength,
        newUrl: photoUrl,
        skipped: false,
      }
    }

    const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const result = await uploadListingPhoto(originalBuffer, listingId, {
      supabase,
      supabaseUrl,
      originalSize: originalBytes,
      storagePath,
      upsert: true,
    })

    if (!result.ok) {
      throw new Error(result.error)
    }

    console.log(
      `    ✓ Recompressed ${formatBytes(originalBytes)} → ${formatBytes(result.bytes)} at ${storagePath}`,
    )

    return {
      url: photoUrl,
      originalBytes,
      compressedBytes: result.bytes,
      newUrl: result.url,
      skipped: false,
    }
  }

  if (isAlreadyCompressedListingPhotoUrl(photoUrl)) {
    console.log(`    ↷ Skipping already-compressed URL: ${photoUrl}`)
    return {
      url: photoUrl,
      originalBytes: 0,
      compressedBytes: 0,
      newUrl: photoUrl,
      skipped: true,
      skipReason: "already compressed",
    }
  }

  if (!isLegacyUncompressedListingPhotoUrl(photoUrl)) {
    console.log(`    ↷ Skipping non-legacy URL (not /pending/ or /admin/): ${photoUrl}`)
    return {
      url: photoUrl,
      originalBytes: 0,
      compressedBytes: 0,
      newUrl: photoUrl,
      skipped: true,
      skipReason: "not legacy uncompressed path",
    }
  }

  console.log(`    ↓ Downloading: ${photoUrl}`)
  const originalBuffer = await downloadImage(photoUrl)
  const originalBytes = originalBuffer.byteLength

  const storagePath = compressedStoragePath(listingId, photoUrl)

  if (dryRun) {
    console.log(
      `    [DRY RUN] Would compress ${formatBytes(originalBytes)} → upload to ${storagePath}`,
    )
    return {
      url: photoUrl,
      originalBytes,
      compressedBytes: Math.round(originalBytes * 0.15),
      newUrl: `(dry-run) ${storagePath}`,
      skipped: false,
    }
  }

  const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const result = await uploadListingPhoto(originalBuffer, listingId, {
    supabase,
    supabaseUrl,
    originalSize: originalBytes,
    storagePath,
    upsert: true,
  })

  if (!result.ok) {
    throw new Error(result.error)
  }

  const compressedSize = result.bytes
  console.log(
    `    ✓ Compressed ${formatBytes(originalBytes)} → ${formatBytes(compressedSize)} (${reductionPercent(originalBytes, compressedSize)} smaller)`,
  )
  console.log(`    ↑ Uploaded: ${result.url}`)

  return {
    url: photoUrl,
    originalBytes,
    compressedBytes: compressedSize,
    newUrl: result.url,
    skipped: false,
  }
}

async function processListing(
  listing: ListingRow,
  supabaseUrl: string,
  bucket: string,
  dryRun: boolean,
  recompress: boolean,
): Promise<ListingSummary> {
  const photoUrls = parsePhotoLinksField(listing.photo_links)
  console.log(`\n━━━ ${listing.business_name} [${listing.status}] (${listing.id}) ━━━`)
  console.log(`  Photos found: ${photoUrls.length}`)

  if (photoUrls.length === 0) {
    console.log("  No photos to process.")
    return {
      name: listing.business_name,
      status: listing.status,
      photosProcessed: 0,
      photosSkipped: 0,
      photosFailed: 0,
      originalBytes: 0,
      compressedBytes: 0,
      failed: false,
    }
  }

  const results: PhotoResult[] = []
  let originalBytes = 0
  let compressedBytes = 0
  let processedCount = 0
  let skippedCount = 0
  let failedCount = 0

  for (const photoUrl of photoUrls) {
    try {
      const result = await processPhoto(
        listing.id,
        photoUrl,
        supabaseUrl,
        bucket,
        dryRun,
        recompress,
      )
      results.push(result)
      if (result.skipped) {
        skippedCount += 1
      } else {
        originalBytes += result.originalBytes
        compressedBytes += result.compressedBytes
        processedCount += 1
      }
    } catch (error) {
      failedCount += 1
      const message = error instanceof Error ? error.message : String(error)
      console.error(`    ✗ Photo failed: ${message}`)
      results.push({
        url: photoUrl,
        originalBytes: 0,
        compressedBytes: 0,
        newUrl: photoUrl,
        skipped: false,
      })
    }
  }

  const newPhotoLinks = results.map((result) => result.newUrl).join("\n")
  const listingFailed = failedCount > 0

  if (processedCount === 0) {
    console.log(
      recompress
        ? "  No compressed photos to recompress."
        : "  No legacy uncompressed photos to migrate.",
    )
  } else if (dryRun) {
    console.log(`  [DRY RUN] Would update photo_links (${processedCount} photo${processedCount === 1 ? "" : "s"})`)
    if (newPhotoLinks !== (listing.photo_links ?? "").trim()) {
      console.log(`  [DRY RUN] New photo_links:\n${newPhotoLinks}`)
    }
  } else if (newPhotoLinks !== (listing.photo_links ?? "").trim()) {
    const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { error } = await supabase
      .from("business_listings")
      .update({ photo_links: newPhotoLinks })
      .eq("id", listing.id)

    if (error) {
      throw new Error(`Database update failed: ${error.message}`)
    }

    console.log(`  ✓ Updated photo_links (${processedCount} photo${processedCount === 1 ? "" : "s"} compressed)`)
  } else {
    console.log(`  ✓ Recompressed ${processedCount} photo${processedCount === 1 ? "" : "s"} (URLs unchanged)`)
  }

  return {
    name: listing.business_name,
    status: listing.status,
    photosProcessed: processedCount,
    photosSkipped: skippedCount,
    photosFailed: failedCount,
    originalBytes,
    compressedBytes,
    failed: listingFailed,
  }
}

function printSummaryTable(rows: ListingSummary[], dryRun: boolean) {
  console.log(`\n${"═".repeat(100)}`)
  console.log(dryRun ? "DRY RUN SUMMARY" : "COMPRESSION SUMMARY")
  console.log("═".repeat(100))

  const header = [
    "Listing Name".padEnd(28),
    "Status".padEnd(12),
    "Done".padStart(6),
    "Skip".padStart(6),
    "Fail".padStart(6),
    "Original".padStart(12),
    "Compressed".padStart(12),
    "Reduction".padStart(10),
  ].join(" | ")

  console.log(header)
  console.log("-".repeat(100))

  let totalOriginal = 0
  let totalCompressed = 0
  let totalPhotos = 0
  let totalSkipped = 0
  let totalFailed = 0
  let listingsWithWork = 0

  for (const row of rows) {
    totalOriginal += row.originalBytes
    totalCompressed += row.compressedBytes
    totalPhotos += row.photosProcessed
    totalSkipped += row.photosSkipped
    totalFailed += row.photosFailed
    if (row.photosProcessed > 0) listingsWithWork += 1

    console.log(
      [
        row.name.slice(0, 28).padEnd(28),
        row.status.slice(0, 12).padEnd(12),
        String(row.photosProcessed).padStart(6),
        String(row.photosSkipped).padStart(6),
        String(row.photosFailed).padStart(6),
        formatBytes(row.originalBytes).padStart(12),
        formatBytes(row.compressedBytes).padStart(12),
        reductionPercent(row.originalBytes, row.compressedBytes).padStart(10),
      ].join(" | "),
    )

    if (row.failed && row.error) {
      console.log(`  Error: ${row.error}`)
    }
  }

  console.log("-".repeat(100))
  console.log(
    [
      "TOTAL".padEnd(28),
      "".padEnd(12),
      String(totalPhotos).padStart(6),
      String(totalSkipped).padStart(6),
      String(totalFailed).padStart(6),
      formatBytes(totalOriginal).padStart(12),
      formatBytes(totalCompressed).padStart(12),
      reductionPercent(totalOriginal, totalCompressed).padStart(10),
    ].join(" | "),
  )
  console.log("═".repeat(100))
  console.log(`Listings with migrated photos: ${listingsWithWork}`)
  console.log(`Photo failures: ${totalFailed}`)
}

async function main() {
  const dryRun = process.argv.includes("--dry-run")
  const recompress = process.argv.includes("--recompress")

  loadEnvLocal()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    )
  }

  const bucket = getListingPhotosBucket()
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  console.log(dryRun ? "=== DRY RUN (no uploads or DB writes) ===" : "=== LIVE RUN ===")
  console.log(`Bucket: ${bucket}`)
  if (recompress) {
    console.log(
      `Mode: recompress existing /compressed/ URLs at ${LISTING_PHOTO_MAX_DIMENSION}px WebP q${LISTING_PHOTO_WEBP_QUALITY}`,
    )
  } else {
    console.log(`Targets: photo_links pointing to /pending/ or /admin/ (not already /compressed/)`)
  }
  console.log(`photo_links format: newline-separated URLs (also supports comma / JSON arrays)`)

  const { data, error } = await supabase
    .from("business_listings")
    .select("id, business_name, photo_links, status")
    .order("business_name", { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch listings: ${error.message}`)
  }

  const listings = (data ?? []) as ListingRow[]
  console.log(`Found ${listings.length} listing${listings.length === 1 ? "" : "s"} (all statuses).`)

  const summaries: ListingSummary[] = []
  const failedListings: string[] = []

  for (let index = 0; index < listings.length; index += 1) {
    const listing = listings[index]!
    try {
      const summary = await processListing(listing, supabaseUrl, bucket, dryRun, recompress)
      summaries.push(summary)
      if (summary.failed) failedListings.push(listing.business_name)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`\n✗ Listing failed: ${listing.business_name} — ${message}`)
      failedListings.push(listing.business_name)
      summaries.push({
        name: listing.business_name,
        status: listing.status,
        photosProcessed: 0,
        photosSkipped: 0,
        photosFailed: 0,
        originalBytes: 0,
        compressedBytes: 0,
        failed: true,
        error: message,
      })
    }

    if (index < listings.length - 1) {
      await sleep(LISTING_DELAY_MS)
    }
  }

  printSummaryTable(summaries, dryRun)

  if (failedListings.length > 0) {
    console.log(`\nListings with failures (${failedListings.length}): ${failedListings.join(", ")}`)
    process.exitCode = 1
  } else if (dryRun) {
    console.log("\nDry run complete. Run `npm run compress-photos -- --recompress` when ready to apply changes.")
  } else if (recompress) {
    console.log("\nDone. Recompressed files were upserted in place under compressed/.")
  } else {
    console.log("\nDone. Original /pending/ and /admin/ files were left in storage as backup.")
  }
}

main().catch((error) => {
  console.error("\nFatal error:", error instanceof Error ? error.message : error)
  process.exit(1)
})
