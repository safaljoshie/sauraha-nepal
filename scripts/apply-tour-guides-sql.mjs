/**
 * Applies supabase/tour_guides.sql when SUPABASE_DB_URL or DATABASE_URL is set.
 * Otherwise prints instructions to run the SQL in the Supabase SQL Editor.
 */
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import postgres from "postgres"

const url = process.env.SUPABASE_DB_URL?.trim() || process.env.DATABASE_URL?.trim()
const sqlPath = resolve("supabase/tour_guides.sql")

if (!url) {
  console.error(
    "No SUPABASE_DB_URL or DATABASE_URL found. Run supabase/tour_guides.sql in the Supabase SQL Editor, then re-run this script or seed via admin.",
  )
  process.exit(1)
}

const sql = postgres(url, { max: 1 })
try {
  const ddl = readFileSync(sqlPath, "utf8")
  await sql.unsafe(ddl)
  console.log("tour_guides schema applied successfully.")
} catch (error) {
  console.error("Failed to apply tour_guides SQL:", error)
  process.exit(1)
} finally {
  await sql.end({ timeout: 5 })
}
