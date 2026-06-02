/** Strip formatting and normalize to Nepal country code (977 + mobile digits). */
export function normalizeNepalPhoneDigits(phone: string): string {
  return normalizeNepalWhatsAppDigits(phone)
}

export function normalizeNepalWhatsAppDigits(phone: string): string {
  let digits = phone.replace(/\D/g, "")
  if (!digits) return ""

  if (digits.startsWith("00")) digits = digits.slice(2)
  while (digits.startsWith("0")) digits = digits.slice(1)

  if (digits.startsWith("977")) {
    return digits
  }

  if (digits.length === 10 && digits.startsWith("9")) {
    return `977${digits}`
  }

  return digits
}

/** tel: link using normalized digits */
export function telUrl(phone: string): string {
  const digits = normalizeNepalPhoneDigits(phone)
  return digits ? `tel:${digits}` : ""
}

/** wa.me link: https://wa.me/977XXXXXXXXXX */
export function whatsappUrl(phone: string): string {
  const digits = normalizeNepalWhatsAppDigits(phone)
  return digits ? `https://wa.me/${digits}` : ""
}

/** Display format: +977 98XXXXXXXX */
export function formatWhatsAppDisplay(phone: string): string {
  const digits = normalizeNepalWhatsAppDigits(phone)
  if (!digits.startsWith("977") || digits.length < 12) return phone.trim()
  return `+977 ${digits.slice(3)}`
}

/** Share listing via WhatsApp with prefilled message (no specific recipient). */
export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
