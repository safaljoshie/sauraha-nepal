import { revalidatePath } from "next/cache"

/** Invalidate cached blog listings after admin publish/save. */
export function revalidateBlogPaths(slug?: string) {
  revalidatePath("/")
  revalidatePath("/blog")
  if (slug) {
    revalidatePath(`/blog/${slug}`)
  }
}
