type ChatAssistantAvatarProps = {
  size?: number
  className?: string
  /** Orange filled circle (floating bubble). Default: transparent with orange ring for message avatars */
  variant?: "bubble" | "avatar"
}

/** Elephant head with headphones — Sauraha Assistant mascot */
export default function ChatAssistantAvatar({
  size = 40,
  className = "",
  variant = "avatar",
}: ChatAssistantAvatarProps) {
  const isBubble = variant === "bubble"

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {isBubble ? (
        <circle cx="32" cy="32" r="32" fill="#e8621a" />
      ) : (
        <circle cx="32" cy="32" r="31" fill="#fff5ef" stroke="#e8621a" strokeWidth="2" />
      )}

      {/* Headphones band */}
      <path
        d="M14 28c0-10 8-16 18-16s18 6 18 16"
        stroke={isBubble ? "#fff" : "#e8621a"}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left ear cup */}
      <rect
        x="10"
        y="26"
        width="10"
        height="14"
        rx="4"
        fill={isBubble ? "#faf7f2" : "#e8621a"}
      />
      {/* Right ear cup */}
      <rect
        x="44"
        y="26"
        width="10"
        height="14"
        rx="4"
        fill={isBubble ? "#faf7f2" : "#e8621a"}
      />

      {/* Elephant head */}
      <ellipse
        cx="32"
        cy="36"
        rx="16"
        ry="14"
        fill={isBubble ? "#faf7f2" : "#e8621a"}
      />
      {/* Left ear */}
      <ellipse
        cx="18"
        cy="34"
        rx="7"
        ry="9"
        fill={isBubble ? "#f4895a" : "#c94d0e"}
      />
      {/* Right ear */}
      <ellipse
        cx="46"
        cy="34"
        rx="7"
        ry="9"
        fill={isBubble ? "#f4895a" : "#c94d0e"}
      />
      {/* Trunk */}
      <path
        d="M32 40c0 0 2 8 0 12-2 4-6 2-6 0 0 0-4-6-2-8 2-4 6-2 6 2z"
        fill={isBubble ? "#f4895a" : "#c94d0e"}
      />
      {/* Eyes */}
      <circle cx="26" cy="35" r="2" fill={isBubble ? "#1a5c2a" : "#faf7f2"} />
      <circle cx="38" cy="35" r="2" fill={isBubble ? "#1a5c2a" : "#faf7f2"} />
      {/* Smile hint */}
      <path
        d="M27 41 Q32 44 37 41"
        stroke={isBubble ? "#1a5c2a" : "#faf7f2"}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
