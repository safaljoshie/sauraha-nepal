/**
 * Approximate fixed NPR exchange rates for display only — not for transactions.
 * Refresh ~monthly from Nepal Rastra Bank mid-market sell/buy average.
 * As of July 2026: ~154 NPR = 1 USD, ~176 NPR = 1 EUR, ~206 NPR = 1 GBP, ~1.60 NPR = 1 INR.
 */
export const DISPLAY_RATES_AS_OF = "July 2026"

export const CURRENCIES = ["NPR", "USD", "EUR", "GBP"] as const
export type DisplayCurrency = (typeof CURRENCIES)[number]

const NPR_PER_USD = 154
const NPR_PER_EUR = 176
const NPR_PER_GBP = 206
const NPR_PER_INR = 1.6

export const CURRENCY_DISCLAIMER = "Approx. · rates for display only"

function convertFromNpr(npr: number, perUnit: number): number {
  if (!Number.isFinite(npr) || npr <= 0) return 0
  return Math.round(npr / perUnit)
}

export function nprToUsd(npr: number): number {
  return convertFromNpr(npr, NPR_PER_USD)
}

export function nprToEur(npr: number): number {
  return convertFromNpr(npr, NPR_PER_EUR)
}

export function nprToGbp(npr: number): number {
  return convertFromNpr(npr, NPR_PER_GBP)
}

export function nprToInr(npr: number): number {
  return convertFromNpr(npr, NPR_PER_INR)
}

export function isDisplayCurrency(value: unknown): value is DisplayCurrency {
  return typeof value === "string" && (CURRENCIES as readonly string[]).includes(value)
}

export function formatMoneyFromNpr(
  npr: number,
  currency: DisplayCurrency = "NPR",
): string {
  const amount = Number.isFinite(npr) ? Math.max(0, Math.round(npr)) : 0

  switch (currency) {
    case "USD":
      return `$${nprToUsd(amount).toLocaleString("en-US")}`
    case "EUR":
      return `€${nprToEur(amount).toLocaleString("en-US")}`
    case "GBP":
      return `£${nprToGbp(amount).toLocaleString("en-GB")}`
    case "NPR":
    default:
      return `NPR ${amount.toLocaleString("en-US")}`
  }
}

/** @deprecated Prefer formatMoneyFromNpr(npr, "USD") */
export function formatUsdFromNpr(npr: number): string {
  return formatMoneyFromNpr(npr, "USD")
}

/** Legacy INR helper — not used by the site currency toggle. */
export function formatInrFromNpr(npr: number): string {
  return `₹${nprToInr(npr).toLocaleString("en-IN")}`
}
