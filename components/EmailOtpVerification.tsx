"use client"

import { useEffect, useState } from "react"
import SiteIcon from "@/components/icons/SiteIcon"
import {
  guideContactSessionKey,
  reviewEmailSessionKey,
  type EmailVerificationPurpose,
} from "@/lib/email-verification"
import { useRecaptchaToken } from "@/lib/use-recaptcha-token"

type EmailOtpVerificationProps = {
  purpose: EmailVerificationPurpose
  referenceId: string
  recaptchaAction: string
  onVerified: (email: string, token: string) => void
  title?: string
  description?: string
  compact?: boolean
  initialEmail?: string
}

const inputClass =
  "w-full rounded-xl border-[1.5px] border-border-brand bg-cream px-4 py-3 text-sm text-text-brand outline-none transition-colors focus:border-green-mid focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"

export default function EmailOtpVerification({
  purpose,
  referenceId,
  recaptchaAction,
  onVerified,
  title = "Verify your email",
  description = "We'll send you a quick 6-digit verification code.",
  compact = false,
  initialEmail = "",
}: EmailOtpVerificationProps) {
  const getRecaptchaToken = useRecaptchaToken()
  const [email, setEmail] = useState(initialEmail)
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""])
  const [step, setStep] = useState<"email" | "otp">("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  async function sendOtp() {
    setError("")
    const trimmed = email.trim()
    if (!trimmed) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)
    try {
      const recaptchaToken = await getRecaptchaToken(recaptchaAction)
      if (!recaptchaToken) {
        setError("We couldn't verify you're human. Please try again.")
        return
      }

      const res = await fetch("/api/verify-email/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          purpose,
          reference_id: referenceId,
          recaptchaToken,
        }),
      })

      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }

      setStep("otp")
      setResendCooldown(60)
      setOtpDigits(["", "", "", "", "", ""])
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function confirmOtp() {
    setError("")
    const otp = otpDigits.join("")
    if (otp.length !== 6) {
      setError("Please enter the full 6-digit code.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/verify-email/confirm-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp_code: otp,
          purpose,
          reference_id: referenceId,
        }),
      })

      const data = (await res.json()) as { error?: string; token?: string }
      if (!res.ok || !data.token) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }

      const sessionKey =
        purpose === "guide_contact"
          ? guideContactSessionKey(referenceId)
          : reviewEmailSessionKey(referenceId)

      sessionStorage.setItem(sessionKey, "true")
      sessionStorage.setItem(`${sessionKey}_email`, email.trim().toLowerCase())
      if (purpose === "guide_contact") {
        window.dispatchEvent(
          new CustomEvent("guide-contact-verified", { detail: { guideId: referenceId } }),
        )
      }
      onVerified(email.trim().toLowerCase(), data.token)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...otpDigits]
    next[index] = digit
    setOtpDigits(next)

    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-${referenceId}-${index + 1}`)
      nextInput?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${referenceId}-${index - 1}`)
      prevInput?.focus()
    }
  }

  if (step === "email") {
    return (
      <div className={compact ? "space-y-3" : "space-y-4"}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-brand/10 text-green-brand">
            <SiteIcon name="lock" size={20} strokeWidth={2.25} />
          </div>
          <div>
            <p className="font-semibold text-text-brand">{title}</p>
            <p className="mt-1 text-sm text-text-light">{description}</p>
          </div>
        </div>
        <label className="block text-sm font-semibold text-text-mid">
          Email address
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className={`${inputClass} mt-1.5`}
            disabled={loading}
            autoComplete="email"
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm font-semibold text-orange-brand">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void sendOtp()}
          disabled={loading}
          className="w-full cursor-pointer rounded-xl bg-green-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-green-mid disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send verification code"}
        </button>
      </div>
    )
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <p className="text-sm text-text-mid">
        Enter the 6-digit code sent to{" "}
        <span className="font-semibold text-text-brand">{email}</span>
      </p>
      <div className="flex justify-center gap-2">
        {otpDigits.map((digit, index) => (
          <input
            key={index}
            id={`otp-${referenceId}-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            disabled={loading}
            className="h-12 w-10 rounded-xl border-[1.5px] border-border-brand bg-cream text-center text-lg font-bold text-text-brand outline-none focus:border-green-mid focus:bg-white disabled:opacity-60 sm:h-14 sm:w-12"
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>
      {error ? (
        <p role="alert" className="text-center text-sm font-semibold text-orange-brand">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => void confirmOtp()}
        disabled={loading}
        className="w-full cursor-pointer rounded-xl bg-green-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-green-mid disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Verifying…" : "Verify code"}
      </button>
      <button
        type="button"
        onClick={() => void sendOtp()}
        disabled={loading || resendCooldown > 0}
        className="w-full cursor-pointer text-sm font-semibold text-green-brand hover:underline disabled:cursor-not-allowed disabled:text-text-light disabled:no-underline"
      >
        {resendCooldown > 0
          ? `Resend code (available in ${resendCooldown}s)`
          : "Resend code"}
      </button>
    </div>
  )
}

export function isEmailVerifiedInSession(
  purpose: EmailVerificationPurpose,
  referenceId: string,
): boolean {
  if (typeof window === "undefined") return false
  const key =
    purpose === "guide_contact"
      ? guideContactSessionKey(referenceId)
      : reviewEmailSessionKey(referenceId)
  return sessionStorage.getItem(key) === "true"
}

export function getVerifiedEmailFromSession(
  purpose: EmailVerificationPurpose,
  referenceId: string,
): string | null {
  if (typeof window === "undefined") return null
  const key =
    purpose === "guide_contact"
      ? guideContactSessionKey(referenceId)
      : reviewEmailSessionKey(referenceId)
  return sessionStorage.getItem(`${key}_email`)
}
