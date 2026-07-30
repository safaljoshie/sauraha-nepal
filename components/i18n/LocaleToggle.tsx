"use client"

import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/locales"
import { useLocale } from "@/components/i18n/LocaleProvider"

type LocaleToggleProps = {
  transparent?: boolean
  className?: string
  showLabel?: boolean
}

export default function LocaleToggle({
  transparent = false,
  className = "",
  showLabel = false,
}: LocaleToggleProps) {
  const { locale, setLocale, t } = useLocale()

  return (
    <div
      className={`flex flex-col gap-1 ${showLabel ? "items-stretch w-full" : "items-end"} ${className}`.trim()}
    >
      {showLabel ? (
        <span className="text-[10px] font-bold tracking-wide text-ink-muted uppercase">
          {t("nav.language")}
        </span>
      ) : null}
      <label className="sr-only" htmlFor="locale-toggle">
        {t("common.displayLanguage")}
      </label>
      <select
        id="locale-toggle"
        value={locale}
        aria-label={t("common.displayLanguage")}
        onChange={(e) => {
          const next = e.target.value
          if ((LOCALES as readonly string[]).includes(next)) {
            setLocale(next as Locale)
          }
        }}
        className={`cursor-pointer appearance-none rounded border bg-[length:7px] bg-[right_0.2rem_center] bg-no-repeat py-0.5 pr-4 pl-0.5 text-[0.55rem] font-bold leading-tight tracking-wide outline-none transition-colors focus-visible:ring-1 focus-visible:ring-green-brand/40 ${
          transparent
            ? "border-white/40 bg-white/15 text-white [color-scheme:dark] hover:bg-white/25"
            : "border-border-brand bg-cream text-ink hover:border-green-mid"
        } ${showLabel ? "w-full" : "w-[2.5rem]"}`}
        style={{
          backgroundImage: transparent
            ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        }}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code} className="bg-white text-ink">
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </div>
  )
}
