/**
 * Seeds one approved test guide via the admin API (requires schema + admin cookie flow).
 * Usage: ADMIN_PASSWORD=... node scripts/seed-test-guide.mjs
 */
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

for (const line of readFileSync(resolve(".env.local"), "utf8").split("\n")) {
  const t = line.trim()
  if (!t || t.startsWith("#")) continue
  const eq = t.indexOf("=")
  if (eq < 0) continue
  let v = t.slice(eq + 1).trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1)
  }
  process.env[t.slice(0, eq).trim()] = v
}

const base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"
const password = process.env.ADMIN_PASSWORD?.trim()

if (!password) {
  console.error("ADMIN_PASSWORD is required.")
  process.exit(1)
}

const loginRes = await fetch(`${base}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password }),
})

if (!loginRes.ok) {
  console.error("Admin login failed:", loginRes.status, await loginRes.text())
  process.exit(1)
}

const cookie = loginRes.headers.get("set-cookie")?.split(";")[0]
if (!cookie) {
  console.error("No admin session cookie returned.")
  process.exit(1)
}

const payload = {
  full_name: "Ram Bahadur Thapa",
  nickname: "Ram Dai",
  bio: "Licensed Chitwan guide with 12 years of experience leading jungle safaris, bird watching walks, and Tharu village cultural tours around Sauraha.",
  years_experience: 12,
  location: "Sauraha, Chitwan",
  phone: "+977 9841234567",
  whatsapp: "+9779841234567",
  email: "ram.guide@example.com",
  licence_number: "CHT-2014-8821",
  licence_verified: true,
  languages: ["Nepali", "English", "Hindi"],
  expertise: ["Jungle Safari", "Bird Watching", "Tharu Culture"],
  services: [
    { name: "Full-day jungle safari", price_npr: 3500, description: "Jeep and walking safari in Chitwan National Park." },
    { name: "Bird watching tour", price_npr: 2000 },
    { name: "Tharu village tour", price_npr: 1500 },
  ],
  status: "approved",
  meta_title: "Ram Bahadur Thapa | Jungle Guide in Sauraha, Chitwan",
  meta_description:
    "Book Ram Bahadur for jungle safaris and cultural tours in Sauraha. Speaks English, Hindi and Nepali. Licensed Chitwan guide.",
}

const createRes = await fetch(`${base}/api/admin/guides`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Cookie: cookie,
  },
  body: JSON.stringify(payload),
})

const createData = await createRes.json()
if (!createRes.ok) {
  console.error("Create guide failed:", createData)
  process.exit(1)
}

const guide = createData.guide
console.log("Created guide:", guide.id, guide.full_name)

const verifyRes = await fetch(`${base}/api/admin/guides/${guide.id}/verify`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Cookie: cookie,
  },
  body: JSON.stringify({ is_verified: true }),
})

if (!verifyRes.ok) {
  console.error("Verify guide failed:", await verifyRes.text())
  process.exit(1)
}

const publicRes = await fetch(`${base}/api/guides`)
const publicData = await publicRes.json()
console.log("Public approved guides:", publicData.guides?.length ?? 0)
console.log("Profile URL:", `${base}/guides/${guide.id}`)
