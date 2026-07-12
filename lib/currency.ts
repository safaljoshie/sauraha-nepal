/**
 * Approximate fixed NPR exchange rates for display only — not for transactions.
 * Update manually when market rates shift significantly.
 * As of mid-2025: ~133 NPR = 1 USD, ~1.58 NPR = 1 INR.
 */
const NPR_PER_USD = 133
const NPR_PER_INR = 1.58

export function nprToUsd(npr: number): number {
  return Math.round(npr / NPR_PER_USD)
}

export function nprToInr(npr: number): number {
  return Math.round(npr / NPR_PER_INR)
}

export function formatUsdFromNpr(npr: number): string {
  return `$${nprToUsd(npr).toLocaleString("en-US")}`
}

export function formatInrFromNpr(npr: number): string {
  return `₹${nprToInr(npr).toLocaleString("en-IN")}`
}
