import { NextResponse } from "next/server"
import { fetchMyFavourites } from "@/lib/favourites"
import { createSupabaseServerClient } from "@/lib/supabase/auth-server"

export async function GET() {
  const auth = await createSupabaseServerClient()
  const {
    data: { user },
  } = await auth.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to view favourites." },
      { status: 401 },
    )
  }

  try {
    const favourites = await fetchMyFavourites(user.id)
    return NextResponse.json({ favourites })
  } catch (error) {
    console.error("GET /api/favourites:", error)
    return NextResponse.json({ error: "Failed to load favourites." }, { status: 500 })
  }
}
