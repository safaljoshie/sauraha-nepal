import Image from "next/image"

const CHAT_AVATAR_SRC = "/images/chat-assistant-elephant.png"

type ChatAssistantAvatarProps = {
  size?: number
  className?: string
  /** launcher: image only inside parent circle. bubble: standalone orange circle. avatar: messages/header. */
  variant?: "launcher" | "bubble" | "avatar"
}

/** Dhurbe avatar — elephant with headset (desktop + mobile). */
export default function ChatAssistantAvatar({
  size = 40,
  className = "",
  variant = "avatar",
}: ChatAssistantAvatarProps) {
  if (variant === "launcher") {
    return (
      <span
        className={`relative block h-full w-full overflow-hidden rounded-full bg-black ${className}`}
        aria-hidden
      >
        <Image
          src={CHAT_AVATAR_SRC}
          alt=""
          fill
          unoptimized
          className="object-cover object-center"
          sizes="48px"
          priority
        />
      </span>
    )
  }

  const isBubble = variant === "bubble"

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${
        isBubble
          ? "bg-black shadow-[0_2px_12px_rgba(232,98,26,0.45)] ring-2 ring-orange-light"
          : "bg-black ring-2 ring-orange-brand/25"
      } ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Image
        src={CHAT_AVATAR_SRC}
        alt=""
        width={size}
        height={size}
        unoptimized
        className="h-full w-full object-cover object-center"
        sizes={`${size}px`}
        priority={isBubble}
      />
    </span>
  )
}
