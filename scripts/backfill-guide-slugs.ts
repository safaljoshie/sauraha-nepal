/**
 * One-time manual tool: backfill missing tour_guides.slug from full_name.
 * NOT part of the Next.js app — run via `npm run backfill-guide-slugs`.
 *
 * Pass --dry-run to preview without writing.
 */
import { createClient } from "@supabase/supabase-js"
import { slugifyBusinessName } from "../lib/listing-slug"
import { loadEnvLocal } from "./load-env"

type Row = {
  id: string
  full_name: string
  slug: string | null
}

loadEnvLocal()

const dryRun = process.argv.includes("--dry-run")

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const readKey = serviceKey || (dryRun ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined)

if (!url || !readKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Add them to .env.local (the service role key is required to write; " +
      "--dry-run also accepts NEXT_PUBLIC_SUPABASE_ANON_KEY).",
  )
  process.exit(1)
}

if (!dryRun && !serviceKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required to write slugs (omit --dry-run).")
  process.exit(1)
}

const supabase = createClient(url, readKey, {
  auth: { persistSession: false },
})

function uniqueSlug(fullName: string, taken: Set<string>): string {
  const base = slugifyBusinessName(fullName) || "guide"
  let candidate = base
  let suffix = 2
  while (taken.has(candidate)) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }
  return candidate
}

async function main() {
  const { data, error } = await supabase.from("tour_guides").select("id, full_name, slug")

  if (error) {
    console.error("Failed to load guides:", error.message)
    process.exit(1)
  }

  const all = (data ?? []) as Row[]
  const todo = all.filter((row) => !row.slug?.trim())
  const taken = new Set(
    all.map((row) => row.slug?.trim()).filter((slug): slug is string => Boolean(slug)),
  )

  console.log(
    `${all.length} guides total, ${todo.length} missing a slug` +
      (dryRun ? " (dry run — nothing will be written)" : ""),
  )
  if (todo.length === 0) return

  let written = 0
  let failed = 0

  for (const row of todo) {
    const name = row.full_name?.trim()
    if (!name) {
      console.warn(`  skip (no full_name): ${row.id}`)
      failed += 1
      continue
    }

    const slug = uniqueSlug(name, taken)
    taken.add(slug)
    console.log(`Guide ${name} -> slug: ${slug}`)

    if (dryRun) {
      written += 1
      continue
    }

    const { error: updateError } = await supabase
      .from("tour_guides")
      .update({ slug, updated_at: new Date().toISOString() })
      .eq("id", row.id)

    if (updateError) {
      console.error(`  write failed for ${name}: ${updateError.message}`)
      failed += 1
      continue
    }

    written += 1
  }

  console.log(
    `\nDone. ${written} ${dryRun ? "resolvable" : "written"}, ${failed} failed/skipped.`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
