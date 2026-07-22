"use client"

import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { useCallback } from "react"

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
