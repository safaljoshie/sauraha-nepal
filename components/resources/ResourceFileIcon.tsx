type ResourceFileIconProps = {
  kind: "pdf" | "word" | "image"
  className?: string
}

export default function ResourceFileIcon({ kind, className = "" }: ResourceFileIconProps) {
  const shared = `h-10 w-10 shrink-0 ${className}`

  if (kind === "pdf") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden>
        <path
          d="M7 3.5h7.2L18.5 7.3V20.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M14 3.5V8h4.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8.5 12.5h7M8.5 15.5h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect x="8" y="17" width="8" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }

  if (kind === "word") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden>
        <path
          d="M7 3.5h7.2L18.5 7.3V20.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M14 3.5V8h4.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8.5 11.5 10 16.5l1.5-3 1.5 3 1.5-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden>
      <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m6.5 17 4-4 2.5 2.5L14.5 14 18.5 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
