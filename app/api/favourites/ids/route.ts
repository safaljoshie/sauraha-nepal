import { NextResponse } from "next/server"
import { fetchFavouritedIds, isFavouriteTargetType } from "@/lib/favourites"
import { createSupabaseServerClient } from "@/lib/supabase/auth-server"

export async function GET(request: Request) {
  const auth = await createSupabaseServerClient()
  const {
    data: { user },
  } = await auth.auth.getUser()

  if (!user) {
    return NextResponse.json({ ids: [] })
  }

  const type = new URL(request.url).searchParams.get("type")
  if (!isFavouriteTargetType(type)) {
    return NextResponse.json({ error: "Invalid type." }, { status: 400 })
  }

  const ids = await fetchFavouritedIds(type)
  return NextResponse.json({ ids: [...ids] })
}
