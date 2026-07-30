import { NextResponse } from "next/server"
import {
  isFavouriteTargetType,
  toggleFavourite,
} from "@/lib/favourites"
import { createSupabaseServerClient } from "@/lib/supabase/auth-server"

export async function POST(request: Request) {
  const auth = await createSupabaseServerClient()
  const {
    data: { user },
  } = await auth.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to save favourites." },
      { status: 401 },
    )
  }

  let body: { targetType?: unknown; targetId?: unknown }
  try {
    body = (await request.json()) as { targetType?: unknown; targetId?: unknown }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (!isFavouriteTargetType(body.targetType)) {
    return NextResponse.json({ error: "Invalid favourite type." }, { status: 400 })
  }
  if (typeof body.targetId !== "string" || !body.targetId.trim()) {
    return NextResponse.json({ error: "Invalid target." }, { status: 400 })
  }

  const result = await toggleFavourite(user.id, body.targetType, body.targetId.trim())
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({ favourited: result.favourited })
}
