"use client"

import { CURRENCY_DISCLAIMER, formatMoneyFromNpr } from "@/lib/currency"
import { useCurrency } from "@/components/currency/CurrencyProvider"

type NprPriceProps = {
  amount: number
  className?: string
  /** Prefix before the formatted amount, e.g. "From ". */
  prefix?: string
  /** Show “Approx.” when not NPR. Default true. */
  showApprox?: boolean
}

export default function NprPrice({
  amount,
  className = "",
  prefix = "",
  showApprox = true,
}: NprPriceProps) {
  const { currency } = useCurrency()
  const formatted = formatMoneyFromNpr(amount, currency)
  const approx = showApprox && currency !== "NPR"

  return (
    <span className={className} title={approx ? CURRENCY_DISCLAIMER : undefined}>
      {prefix}
      {approx ? <span className="opacity-80">≈ </span> : null}
      {formatted}
    </span>
  )
}
