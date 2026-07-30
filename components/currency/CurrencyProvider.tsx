"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  CURRENCIES,
  isDisplayCurrency,
  type DisplayCurrency,
} from "@/lib/currency"

const STORAGE_KEY = "sauraha_currency"

type CurrencyContextValue = {
  currency: DisplayCurrency
  setCurrency: (currency: DisplayCurrency) => void
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<DisplayCurrency>("NPR")

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (isDisplayCurrency(stored)) setCurrencyState(stored)
    } catch {
      // ignore storage failures
    }
  }, [])

  const setCurrency = useCallback((next: DisplayCurrency) => {
    if (!CURRENCIES.includes(next)) return
    setCurrencyState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore storage failures
    }
  }, [])

  const value = useMemo(
    () => ({ currency, setCurrency }),
    [currency, setCurrency],
  )

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  )
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    return {
      currency: "NPR",
      setCurrency: () => undefined,
    }
  }
  return ctx
}
