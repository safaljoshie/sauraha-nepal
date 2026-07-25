import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { isValidEmail } from "@/lib/newsletter"
import { getSupabaseAdmin } from "@/lib/supabase"

/** Minimal CSV line parser handling quoted fields with embedded commas/quotes. */
function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ",") {
      out.push(cur)
      cur = ""
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No CSV file provided." }, { status: 400 })
  }

  const text = await file.text()
  const rawLines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (rawLines.length === 0) {
    return NextResponse.json({ error: "The CSV file is empty." }, { status: 400 })
  }

  // Detect a header row (first cell is "email").
  const firstCells = parseCsvLine(rawLines[0]).map((c) => c.trim().toLowerCase())
  let emailIdx = 0
  let nameIdx = 1
  let startRow = 0
  if (firstCells.includes("email")) {
    emailIdx = firstCells.indexOf("email")
    nameIdx = firstCells.indexOf("name")
    startRow = 1
  }

  const parsed = new Map<string, string | null>()
  for (let i = startRow; i < rawLines.length; i += 1) {
    const cells = parseCsvLine(rawLines[i])
    const email = cells[emailIdx]?.trim().toLowerCase()
    if (!email || !isValidEmail(email)) continue
    const name = nameIdx >= 0 ? cells[nameIdx]?.trim() || null : null
    if (!parsed.has(email)) parsed.set(email, name)
  }

  if (parsed.size === 0) {
    return NextResponse.json({ imported: 0, skipped: 0 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const emails = Array.from(parsed.keys())

    const { data: existingRows, error: existingError } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .in("email", emails)

    if (existingError) {
      console.error("Newsletter import lookup error:", existingError)
      return NextResponse.json({ error: "Failed to import subscribers." }, { status: 500 })
    }

    const existing = new Set((existingRows ?? []).map((r) => (r as { email: string }).email))
    const now = new Date().toISOString()
    const toInsert = emails
      .filter((email) => !existing.has(email))
      .map((email) => ({
        email,
        name: parsed.get(email) ?? null,
        source: "import" as const,
        status: "active" as const,
        confirmed: true,
        confirmed_at: now,
      }))

    let imported = 0
    if (toInsert.length > 0) {
      const { data: insertedRows, error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert(toInsert)
        .select("id")

      if (insertError) {
        console.error("Newsletter import insert error:", insertError)
        return NextResponse.json({ error: "Failed to import subscribers." }, { status: 500 })
      }
      imported = insertedRows?.length ?? toInsert.length
    }

    const skipped = parsed.size - imported
    return NextResponse.json({ imported, skipped })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
