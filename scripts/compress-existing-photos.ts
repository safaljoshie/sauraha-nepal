/**
 * One-time manual tool: compress existing approved listing photos in Supabase.
 * NOT part of the Next.js app — run via `npm run compress-photos:dry` or `npm run compress-photos`.
 */
import { createClient } from "@supabase/supabase-js"
import { existsSync, readFileSync } from "node:fs"
import { basename, resolve } from "node:path"
import sharp from "sharp"
import {
  getListingPhotosBucket,
  getStoragePublicUrl,
  parsePhotoLinkLines,
} from "../lib/list-business-photos"

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
  photosProcessed: number
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

export async function compressImageBuffer(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1280, 1280, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer()
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
  return `compressed/${listingId}/${stem || "photo"}.webp`
}

function isAlreadyCompressedUrl(url: string) {
  try {
    const path = new URL(url).pathname
    return path.includes("/compressed/")
  } catch {
    return false
  }
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

async function processPhoto(
  listingId: string,
  photoUrl: string,
  bucket: string,
  supabaseUrl: string,
  dryRun: boolean,
): Promise<PhotoResult> {
  if (isAlreadyCompressedUrl(photoUrl)) {
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

  console.log(`    ↓ Downloading: ${photoUrl}`)
  const originalBuffer = await downloadImage(photoUrl)
  const originalBytes = originalBuffer.byteLength

  const compressedBuffer = await compressImageBuffer(originalBuffer)
  const compressedBytes = compressedBuffer.byteLength

  const storagePath = compressedStoragePath(listingId, photoUrl)
  const newUrl = getStoragePublicUrl(bucket, storagePath, supabaseUrl)

  console.log(
    `    ✓ Compressed ${formatBytes(originalBytes)} → ${formatBytes(compressedBytes)} (${reductionPercent(originalBytes, compressedBytes)} smaller)`,
  )

  if (dryRun) {
    console.log(`    [DRY RUN] Would upload to: ${storagePath}`)
    console.log(`    [DRY RUN] New public URL: ${newUrl}`)
    return { url: photoUrl, originalBytes, compressedBytes, newUrl, skipped: false }
  }

  const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error } = await supabase.storage.from(bucket).upload(storagePath, compressedBuffer, {
    contentType: "image/webp",
    upsert: true,
  })

  if (error) {
    throw new Error(`Upload failed for ${storagePath}: ${error.message}`)
  }

  console.log(`    ↑ Uploaded: ${newUrl}`)
  return { url: photoUrl, originalBytes, compressedBytes, newUrl, skipped: false }
}

async function processListing(
  listing: ListingRow,
  bucket: string,
  supabaseUrl: string,
  dryRun: boolean,
): Promise<ListingSummary> {
  const photoUrls = parsePhotoLinksField(listing.photo_links)
  console.log(`\n━━━ ${listing.business_name} (${listing.id}) ━━━`)
  console.log(`  Photos found: ${photoUrls.length}`)

  if (photoUrls.length === 0) {
    console.log("  No photos to process.")
    return {
      name: listing.business_name,
      photosProcessed: 0,
      originalBytes: 0,
      compressedBytes: 0,
      failed: false,
    }
  }

  const results: PhotoResult[] = []
  let originalBytes = 0
  let compressedBytes = 0
  let processedCount = 0

  for (const photoUrl of photoUrls) {
    try {
      const result = await processPhoto(listing.id, photoUrl, bucket, supabaseUrl, dryRun)
      results.push(result)
      if (!result.skipped) {
        originalBytes += result.originalBytes
        compressedBytes += result.compressedBytes
        processedCount += 1
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`    ✗ Photo failed: ${message}`)
      throw new Error(message)
    }
  }

  const newPhotoLinks = results.map((result) => result.newUrl).join("\n")

  if (dryRun) {
    console.log(`  [DRY RUN] Would update photo_links to:\n${newPhotoLinks}`)
  } else {
    const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { error } = await supabase
      .from("business_listings")
      .update({ photo_links: newPhotoLinks })
      .eq("id", listing.id)
      .eq("status", "approved")

    if (error) {
      throw new Error(`Database update failed: ${error.message}`)
    }

    console.log(`  ✓ Updated photo_links (${processedCount} photo${processedCount === 1 ? "" : "s"} compressed)`)
  }

  return {
    name: listing.business_name,
    photosProcessed: processedCount,
    originalBytes,
    compressedBytes,
    failed: false,
  }
}

function printSummaryTable(rows: ListingSummary[], dryRun: boolean) {
  console.log(`\n${"═".repeat(90)}`)
  console.log(dryRun ? "DRY RUN SUMMARY" : "COMPRESSION SUMMARY")
  console.log("═".repeat(90))

  const header = [
    "Listing Name".padEnd(32),
    "Photos".padStart(8),
    "Original".padStart(12),
    "Compressed".padStart(12),
    "Reduction".padStart(10),
    "Status".padStart(10),
  ].join(" | ")

  console.log(header)
  console.log("-".repeat(90))

  let totalOriginal = 0
  let totalCompressed = 0
  let totalPhotos = 0

  for (const row of rows) {
    totalOriginal += row.originalBytes
    totalCompressed += row.compressedBytes
    totalPhotos += row.photosProcessed

    const status = row.failed ? "FAILED" : row.photosProcessed === 0 ? "SKIPPED" : dryRun ? "DRY RUN" : "OK"
    console.log(
      [
        row.name.slice(0, 32).padEnd(32),
        String(row.photosProcessed).padStart(8),
        formatBytes(row.originalBytes).padStart(12),
        formatBytes(row.compressedBytes).padStart(12),
        reductionPercent(row.originalBytes, row.compressedBytes).padStart(10),
        status.padStart(10),
      ].join(" | "),
    )

    if (row.failed && row.error) {
      console.log(`  Error: ${row.error}`)
    }
  }

  console.log("-".repeat(90))
  console.log(
    [
      "TOTAL".padEnd(32),
      String(totalPhotos).padStart(8),
      formatBytes(totalOriginal).padStart(12),
      formatBytes(totalCompressed).padStart(12),
      reductionPercent(totalOriginal, totalCompressed).padStart(10),
      "".padStart(10),
    ].join(" | "),
  )
  console.log("═".repeat(90))
}

async function main() {
  const dryRun = process.argv.includes("--dry-run")

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
  console.log(`photo_links format: newline-separated URLs (also supports comma / JSON arrays)`)

  const { data, error } = await supabase
    .from("business_listings")
    .select("id, business_name, photo_links, status")
    .eq("status", "approved")
    .order("business_name", { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch listings: ${error.message}`)
  }

  const listings = (data ?? []) as ListingRow[]
  console.log(`Found ${listings.length} approved listing${listings.length === 1 ? "" : "s"}.`)

  const summaries: ListingSummary[] = []
  const failedListings: string[] = []

  for (let index = 0; index < listings.length; index += 1) {
    const listing = listings[index]!
    try {
      const summary = await processListing(listing, bucket, supabaseUrl, dryRun)
      summaries.push(summary)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`\n✗ Listing failed: ${listing.business_name} — ${message}`)
      failedListings.push(listing.business_name)
      summaries.push({
        name: listing.business_name,
        photosProcessed: 0,
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
    console.log(`\nFailed listings (${failedListings.length}): ${failedListings.join(", ")}`)
    process.exitCode = 1
  } else if (dryRun) {
    console.log("\nDry run complete. Run `npm run compress-photos` when ready to apply changes.")
  } else {
    console.log("\nDone. Original files were left in storage as backup.")
  }
}

main().catch((error) => {
  console.error("\nFatal error:", error instanceof Error ? error.message : error)
  process.exit(1)
})
