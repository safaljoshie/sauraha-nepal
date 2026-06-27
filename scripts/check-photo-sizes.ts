/**
 * One-time diagnostic: inspect file sizes in the listing photos Supabase bucket.
 * Run: npm run check-photo-sizes
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { existsSync, readFileSync } from "node:fs"
import { extname, resolve } from "node:path"
import { getListingPhotosBucket } from "../lib/list-business-photos"

type StorageEntry = {
  path: string
  size: number
  ext: string
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

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function isFolder(entry: { id: string | null; metadata: Record<string, unknown> | null }) {
  return entry.id === null || entry.metadata === null
}

async function listAllFiles(
  supabase: SupabaseClient,
  bucket: string,
  prefix = "",
): Promise<StorageEntry[]> {
  const results: StorageEntry[] = []
  let offset = 0
  const limit = 1000

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    })

    if (error) {
      throw new Error(`Failed to list "${prefix || "/"}": ${error.message}`)
    }

    if (!data || data.length === 0) break

    for (const item of data) {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name

      if (isFolder(item)) {
        const nested = await listAllFiles(supabase, bucket, itemPath)
        results.push(...nested)
        continue
      }

      const size =
        typeof item.metadata?.size === "number"
          ? item.metadata.size
          : Number(item.metadata?.size ?? 0)

      results.push({
        path: itemPath,
        size: Number.isFinite(size) ? size : 0,
        ext: extname(item.name).toLowerCase(),
      })
    }

    if (data.length < limit) break
    offset += limit
  }

  return results
}

async function main() {
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

  console.log(`Scanning bucket: ${bucket}\n`)

  const files = await listAllFiles(supabase, bucket)
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
  const averageBytes = files.length > 0 ? totalBytes / files.length : 0
  const nonWebp = files.filter((file) => file.ext !== ".webp")

  console.log("═".repeat(72))
  console.log("STORAGE SUMMARY")
  console.log("═".repeat(72))
  console.log(`Total files:        ${files.length}`)
  console.log(`Total storage:      ${formatBytes(totalBytes)} (${totalBytes.toLocaleString()} bytes)`)
  console.log(`Average file size:  ${formatBytes(averageBytes)}`)
  console.log(`Non-.webp files:    ${nonWebp.length} (${files.length ? ((nonWebp.length / files.length) * 100).toFixed(1) : "0"}%)`)

  const byExt = new Map<string, number>()
  for (const file of files) {
    const key = file.ext || "(no extension)"
    byExt.set(key, (byExt.get(key) ?? 0) + 1)
  }

  if (byExt.size > 0) {
    console.log("\nBy extension:")
    for (const [ext, count] of [...byExt.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${ext.padEnd(16)} ${count}`)
    }
  }

  const largest = [...files].sort((a, b) => b.size - a.size).slice(0, 10)

  console.log("\n" + "═".repeat(72))
  console.log("10 LARGEST FILES")
  console.log("═".repeat(72))

  if (largest.length === 0) {
    console.log("(no files found)")
  } else {
    for (const [index, file] of largest.entries()) {
      console.log(
        `${String(index + 1).padStart(2)}. ${formatBytes(file.size).padStart(10)}  ${file.ext || "?"}  ${file.path}`,
      )
    }
  }

  if (nonWebp.length > 0) {
    console.log("\n" + "═".repeat(72))
    console.log(`NON-WEBP FILES (first 20 of ${nonWebp.length})`)
    console.log("═".repeat(72))
    for (const file of nonWebp.slice(0, 20)) {
      console.log(`  ${formatBytes(file.size).padStart(10)}  ${file.ext || "?"}  ${file.path}`)
    }
    if (nonWebp.length > 20) {
      console.log(`  … and ${nonWebp.length - 20} more`)
    }
  }

  console.log("\nDone.")
}

main().catch((error) => {
  console.error("\nFatal error:", error instanceof Error ? error.message : error)
  process.exit(1)
})
