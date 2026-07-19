/**
 * Shared env loader for the one-off scripts in this directory.
 *
 * These run outside Next.js, so nothing populates process.env from .env.local
 * automatically. Existing process.env values always win, so CI/shell overrides
 * keep working.
 */
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

export function loadEnvLocal() {
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
