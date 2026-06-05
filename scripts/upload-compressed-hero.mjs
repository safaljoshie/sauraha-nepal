import { readFileSync, existsSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { createClient } from "@supabase/supabase-js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")

function loadEnvFile(filename) {
  const path = resolve(root, filename)
  if (!existsSync(path)) return
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

function publicUrlToStoragePath(publicUrl, supabaseUrl, bucket) {
  const prefix = `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/`
  if (!publicUrl.startsWith(prefix)) return null
  const encoded = publicUrl.slice(prefix.length)
  return decodeURIComponent(encoded)
}

loadEnvFile(".env")
loadEnvFile(".env.local")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucket =
  process.env.SUPABASE_LISTING_PHOTOS_BUCKET || "Sauraha Nepal Listing uploads"
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.saurahanepal.com"

const variant = process.argv[2] || "1080"
const videoFile =
  variant === "1080"
    ? "hero-1080-crf32.mp4"
    : variant === "1280"
      ? "hero-1280-crf30.mp4"
      : process.argv[2]

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const videoPath = resolve(root, "tmp/hero-compress", videoFile)
if (!existsSync(videoPath)) {
  console.error("Compressed video not found:", videoPath)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)
const buffer = readFileSync(videoPath)
const storagePath = `admin/site/hero/video/compressed-${Date.now()}/hero-home.mp4`

const { data: rows, error: fetchError } = await supabase
  .from("hero_media")
  .select("*")
  .eq("type", "video")
  .eq("is_active", true)
  .order("priority", { ascending: true })
  .limit(1)

if (fetchError || !rows?.length) {
  console.error("Could not find active hero video row:", fetchError?.message)
  process.exit(1)
}

const hero = rows[0]
const previousUrl = hero.url

const { error: uploadError } = await supabase.storage
  .from(bucket)
  .upload(storagePath, buffer, {
    contentType: "video/mp4",
    upsert: true,
  })

if (uploadError) {
  console.error("Upload failed:", uploadError.message)
  process.exit(1)
}

const encodedPath = storagePath
  .split("/")
  .map((segment) => encodeURIComponent(segment))
  .join("/")
const publicUrl = `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`

const { data: updated, error: updateError } = await supabase
  .from("hero_media")
  .update({ url: publicUrl })
  .eq("id", hero.id)
  .select("*")
  .single()

if (updateError || !updated) {
  console.error("DB update failed:", updateError?.message)
  process.exit(1)
}

const pathsToDelete = new Set()

const previousPath = publicUrlToStoragePath(previousUrl, supabaseUrl, bucket)
if (previousPath && previousPath !== storagePath) {
  pathsToDelete.add(previousPath)
}

const { data: videoDirs, error: listError } = await supabase.storage
  .from(bucket)
  .list("admin/site/hero/video", { limit: 200 })

if (listError) {
  console.warn("Could not list hero video folder for cleanup:", listError.message)
} else {
  for (const entry of videoDirs ?? []) {
    const dir = `admin/site/hero/video/${entry.name}`
    for (const filename of ["hero-home.mp4", "5000.mp4"]) {
      const candidate = `${dir}/${filename}`
      if (candidate !== storagePath) {
        pathsToDelete.add(candidate)
      }
    }
  }
}

for (const path of pathsToDelete) {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) {
    console.warn("Could not delete:", path, error.message)
  } else {
    console.log("Deleted:", path)
  }
}

if (process.env.ADMIN_PASSWORD) {
  try {
    const login = await fetch(`${siteUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
    })
    const cookie =
      login.headers.getSetCookie?.()?.map((c) => c.split(";")[0]).join("; ") || ""
    if (login.ok && cookie) {
      const put = await fetch(`${siteUrl}/api/admin/site/hero`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ ...updated, type: "video" }),
      })
      console.log("Homepage revalidate:", put.ok ? "ok" : put.status)
    } else {
      console.warn("Homepage revalidate skipped: admin login failed", login.status)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn("Homepage revalidate skipped:", message)
  }
}

console.log("Uploaded:", publicUrl)
console.log("Updated hero_media id:", hero.id)
console.log("Previous URL:", previousUrl)
console.log("New size:", `${(buffer.length / 1024 / 1024).toFixed(1)} MB`)
