#!/usr/bin/env node
/**
 * Enable Resend inbound on mail.saurahanepal.com and print Hostinger DNS steps.
 * Usage: node scripts/setup-mail-receiving.mjs
 *
 * DNS must still be added manually in Hostinger hPanel (we cannot access your account).
 */

import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { execSync } from "node:child_process"

const MAIL_DOMAIN = "mail.saurahanepal.com"
const ROOT_DOMAIN = "saurahanepal.com"
const WEBHOOK_URL = "https://www.saurahanepal.com/api/webhooks/resend"

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
    for (const line of raw.split("\n")) {
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
      if (!(key in process.env)) process.env[key] = value
    }
  } catch {
    // optional
  }
}

async function resend(path, options = {}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("RESEND_API_KEY is not set (.env.local or environment)")

  const res = await fetch(`https://api.resend.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.message ?? body.error ?? `Resend API ${res.status}`)
  }
  return body
}

function digMx(host) {
  try {
    return execSync(`dig ${host} MX +short @8.8.8.8`, { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean)
  } catch {
    return []
  }
}

function hostingerName(recordName, domain) {
  if (!recordName || recordName === "@" || recordName === domain) return "@"
  if (recordName.endsWith(`.${ROOT_DOMAIN}`)) {
    return recordName.slice(0, -(ROOT_DOMAIN.length + 1))
  }
  return recordName
}

loadEnvLocal()

console.log(`\n=== Mail receiving setup: ${MAIL_DOMAIN} ===\n`)

const currentMx = digMx(MAIL_DOMAIN)
if (currentMx.length > 0) {
  console.log("Current MX records (public DNS):")
  for (const line of currentMx) console.log(`  ${line}`)
} else {
  console.log("Current MX records: NONE (this is why hello@mail.saurahanepal.com bounces)\n")
}

let domainId = null
let domainData = null

try {
  const list = await resend("/domains")
  const match = (list.data ?? []).find((d) => d.name === MAIL_DOMAIN)
  if (!match) {
    console.error(`Domain "${MAIL_DOMAIN}" not found in Resend. Add it in the Resend dashboard first.`)
    process.exit(1)
  }
  domainId = match.id

  console.log(`Resend domain: ${MAIL_DOMAIN} (${domainId})`)
  console.log(`Receiving: ${match.capabilities?.receiving ?? "unknown"}\n`)

  if (match.capabilities?.receiving !== "enabled") {
    console.log("Enabling receiving in Resend...")
    await resend(`/domains/${domainId}`, {
      method: "PATCH",
      body: JSON.stringify({ capabilities: { receiving: "enabled" } }),
    })
    console.log("Receiving enabled.\n")
  }

  domainData = await resend(`/domains/${domainId}`)
  await resend(`/domains/${domainId}/verify`, { method: "POST" })
} catch (err) {
  console.error(`Resend API error: ${err.message}`)
  console.error("\nAdd DNS manually in Hostinger (see below) and enable Receiving in Resend dashboard.\n")
}

const mxRecords =
  domainData?.records?.filter(
    (r) =>
      r.type === "MX" &&
      (r.record === "Receiving" ||
        (typeof r.value === "string" && r.value.includes("inbound-smtp"))),
  ) ?? []

if (mxRecords.length === 0) {
  console.log("Could not fetch inbound MX from Resend API.")
  console.log("Use the MX value shown in Resend → Domains → mail.saurahanepal.com → Receiving.\n")
  console.log("Typical value for ap-northeast-1: inbound-smtp.ap-northeast-1.amazonaws.com\n")
} else {
  console.log("Add this MX record in Hostinger (hPanel → Domains → saurahanepal.com → DNS):\n")
  for (const record of mxRecords) {
    const name = hostingerName(record.name, MAIL_DOMAIN)
    console.log(`  Type:     MX`)
    console.log(`  Name:     ${name}`)
    console.log(`  Mail srv: ${record.value}`)
    console.log(`  Priority: ${record.priority ?? 10}`)
    console.log(`  TTL:      3600`)
    console.log("")
  }
}

console.log("Keep existing records (do not delete):")
console.log("  • send.mail MX → feedback-smtp.ap-northeast-1.amazonses.com (Resend sending)")
console.log("  • mail TXT → v=spf1 include:amazonses.com ~all")
console.log("  • resend._domainkey.mail TXT (DKIM)\n")

console.log("After adding MX in Hostinger:")
console.log("  1. Resend → Domains → Verify DNS (receiving MX should turn green)")
console.log(`  2. Resend → Webhooks → Add → ${WEBHOOK_URL}`)
console.log("     Event: email.received")
console.log("  3. Vercel → Environment variables → RESEND_WEBHOOK_SECRET=whsec_...")
console.log("  4. Redeploy, then test by emailing hello@mail.saurahanepal.com\n")

const mxAfter = digMx(MAIL_DOMAIN)
if (mxAfter.length > 0) {
  console.log("MX propagation detected — receiving may already work once Resend verifies.")
} else {
  console.log("Waiting for MX record in Hostinger — run this script again after you add it.")
}

console.log("")
