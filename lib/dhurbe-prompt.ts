export const DHURBE_PROMPT_KEY = "dhurbe_prompted"

export const PROMPT_DELAY_MS = 12_000
export const AUTO_DISMISS_MS = 8_000

const MESSAGES = {
  home: "Looking for something? I can help you find hotels, restaurants or activities in Sauraha!",
  listings: "Need help narrowing down your search? Ask me anything!",
  listingDetail: "Want to know more about this place, or see similar options nearby?",
  blog: "Planning your trip? I can answer quick questions about Chitwan too!",
} as const

export function isDhurbePromptBlocked(): boolean {
  try {
    return sessionStorage.getItem(DHURBE_PROMPT_KEY) === "1"
  } catch {
    return false
  }
}

export function markDhurbePromptBlocked(): void {
  try {
    sessionStorage.setItem(DHURBE_PROMPT_KEY, "1")
  } catch {
    // sessionStorage unavailable (private mode, etc.)
  }
}

export function getDhurbePromptMessage(pathname: string): string {
  if (pathname === "/") return MESSAGES.home
  if (pathname === "/listings") return MESSAGES.listings
  if (pathname.startsWith("/listings/")) return MESSAGES.listingDetail
  if (pathname === "/blog" || pathname.startsWith("/blog/")) return MESSAGES.blog
  return MESSAGES.home
}

export function isKeyboardLikelyOpen(): boolean {
  if (typeof window === "undefined") return false
  const viewport = window.visualViewport
  if (!viewport) return false
  return viewport.height < window.innerHeight * 0.8
}

export function hasScrolledPastHalf(): boolean {
  if (typeof window === "undefined") return false
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  if (scrollable <= 0) return false
  return window.scrollY / scrollable >= 0.5
}
