"use client"

import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { useCallback } from "react"

/**
 * Returns an async function that produces a reCAPTCHA v3 token for a given
 * action. Resolves to `null` when reCAPTCHA is unavailable (no site key), so
 * callers can still submit and let the server decide.
 */
export function useRecaptchaToken() {
  const { executeRecaptcha } = useGoogleReCaptcha()

  return useCallback(
    async (action: string): Promise<string | null> => {
      if (!executeRecaptcha) return null
      try {
        return await executeRecaptcha(action)
      } catch {
        return null
      }
    },
    [executeRecaptcha],
  )
}
