/**
 * Read-only integrity check for listing photo URLs in business_listings.
 * Run: npm run check-listing-photo-integrity
 */
import { createClient } from "@supabase/supabase-js"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import sharp from "sharp"

type ListingRow = {
  id: string
  business_name: string
  photo_links: string | null
}

type Issue = {
  business_name: string
  id: string
  url: string
  file: string
  reason: string
}

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local")
  if (!existsSync(envPath)) return
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
    if (process.env[key] === undefined) process.env[key] = value
  }
}

async function main() {
  loadEnvLocal()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase env vars in .env.local")
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase
    .from("business_listings")
    .select("id, business_name, photo_links")

  if (error) throw error

  const issues: Issue[] = []
  let totalUrls = 0

  for (const row of (data ?? []) as ListingRow[]) {
    const urls = (row.photo_links ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    for (const url of urls) {
      totalUrls += 1

      if (
        url.includes("home-hero") ||
        url.includes("placeholder-listing") ||
        url.includes("/images/")
      ) {
        issues.push({
          business_name: row.business_name,
          id: row.id,
          url,
          file: url.split("/").pop() ?? url,
          reason: "photo_links points at a local site asset (placeholder/hero), not uploaded storage",
        })
        continue
      }

      if (!url.includes("/compressed/")) continue

      try {
        const res = await fetch(url)
        if (!res.ok) {
          issues.push({
            business_name: row.business_name,
            id: row.id,
            url,
            file: url.split("/").pop() ?? url,
            reason: `HTTP ${res.status} when fetching storage URL`,
          })
          continue
        }

        const buffer = Buffer.from(await res.arrayBuffer())
        try {
          await sharp(buffer).metadata()
        } catch {
          issues.push({
            business_name: row.business_name,
            id: row.id,
            url,
            file: url.split("/").pop() ?? url,
            reason: "Corrupt or unreadable image in storage (browser cannot decode)",
          })
        }
      } catch (fetchError) {
        issues.push({
          business_name: row.business_name,
          id: row.id,
          url,
          file: url.split("/").pop() ?? url,
          reason:
            fetchError instanceof Error ? fetchError.message : "Failed to fetch storage URL",
        })
      }
    }
  }

  console.log("═".repeat(72))
  console.log("LISTING PHOTO INTEGRITY CHECK (read-only)")
  console.log("═".repeat(72))
  console.log(`Listings scanned: ${(data ?? []).length}`)
  console.log(`Photo URLs checked: ${totalUrls}`)
  console.log(`Issues found:     ${issues.length}`)
  console.log("═".repeat(72))

  if (issues.length === 0) {
    console.log("No corrupt URLs or placeholder paths found in photo_links.")
    return
  }

  for (const issue of issues) {
    console.log(`\n• ${issue.business_name} (${issue.id})`)
    console.log(`  file:   ${issue.file}`)
    console.log(`  reason: ${issue.reason}`)
    console.log(`  url:    ${issue.url}`)
  }

  console.log("\nNo data was modified. Review flagged listings manually.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
