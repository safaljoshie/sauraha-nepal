import type { Locale } from "@/lib/i18n/locales"
import { DEFAULT_LOCALE } from "@/lib/i18n/locales"
import en from "@/lib/i18n/messages/en"
import zh from "@/lib/i18n/messages/zh"
import de from "@/lib/i18n/messages/de"
import fr from "@/lib/i18n/messages/fr"
import type { Messages } from "@/lib/i18n/messages/types"

const catalogs: Record<Locale, Messages> = { en, zh, de, fr }

export type MessageKey = string

function getByPath(obj: unknown, path: string): string | undefined {
  const parts = path.split(".")
  let cur: unknown = obj
  for (const part of parts) {
    if (!cur || typeof cur !== "object") return undefined
    cur = (cur as Record<string, unknown>)[part]
  }
  return typeof cur === "string" ? cur : undefined
}

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? catalogs[DEFAULT_LOCALE]
}

/** Resolve a dotted key like `nav.listings`, falling back to English. */
export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const primary = getByPath(getMessages(locale), key)
  const fallback = locale === DEFAULT_LOCALE ? undefined : getByPath(en, key)
  let text = primary ?? fallback ?? key

  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value))
    }
  }

  return text
}
