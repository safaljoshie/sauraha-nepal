"use client"

import { CURRENCIES, CURRENCY_DISCLAIMER, type DisplayCurrency } from "@/lib/currency"
import { useCurrency } from "@/components/currency/CurrencyProvider"

type CurrencyToggleProps = {
  /** When true (home hero transparent nav), use light styles. */
  transparent?: boolean
  className?: string
  /** Show compact disclaimer under the control (mobile drawer). */
  showDisclaimer?: boolean
}

export default function CurrencyToggle({
  transparent = false,
  className = "",
  showDisclaimer = false,
}: CurrencyToggleProps) {
  const { currency, setCurrency } = useCurrency()

  return (
    <div
      className={`flex flex-col gap-1 ${showDisclaimer ? "items-stretch w-full" : "items-end"} ${className}`.trim()}
    >
      <label className="sr-only" htmlFor="currency-toggle">
        Display currency
      </label>
      <select
        id="currency-toggle"
        value={currency}
        title={CURRENCY_DISCLAIMER}
        aria-label="Display currency"
        onChange={(e) => {
          const next = e.target.value
          if ((CURRENCIES as readonly string[]).includes(next)) {
            setCurrency(next as DisplayCurrency)
          }
        }}
        className={`cursor-pointer appearance-none rounded border bg-[length:7px] bg-[right_0.2rem_center] bg-no-repeat py-0.5 pr-4 pl-0.5 text-[0.55rem] font-bold leading-tight tracking-wide outline-none transition-colors focus-visible:ring-1 focus-visible:ring-green-brand/40 ${
          transparent
            ? "border-white/40 bg-white/15 text-white [color-scheme:dark] hover:bg-white/25"
            : "border-border-brand bg-cream text-ink hover:border-green-mid"
        } ${showDisclaimer ? "w-full" : "w-[2.5rem]"}`}
        style={{
          backgroundImage: transparent
            ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        }}
      >
        {CURRENCIES.map((code) => (
          <option key={code} value={code} className="bg-white text-ink">
            {code}
          </option>
        ))}
      </select>
      {showDisclaimer ? (
        <p className="text-[10px] font-medium text-ink-muted">{CURRENCY_DISCLAIMER}</p>
      ) : null}
    </div>
  )
}
