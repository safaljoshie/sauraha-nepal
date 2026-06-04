import Image from "next/image"

const CHAT_AVATAR_SRC = "/images/chat-assistant-elephant.png"

type ChatAssistantAvatarProps = {
  size?: number
  className?: string
  /** Launcher: orange circle. Messages/header: cream ring. */
  variant?: "bubble" | "avatar"
}

/** Elephant with headphones — fills circular frame (desktop + mobile). */
export default function ChatAssistantAvatar({
  size = 40,
  className = "",
  variant = "avatar",
}: ChatAssistantAvatarProps) {
  const isBubble = variant === "bubble"

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${
        isBubble
          ? "bg-orange-brand shadow-[0_2px_12px_rgba(232,98,26,0.45)] ring-2 ring-orange-light"
          : "bg-cream ring-2 ring-orange-brand/25"
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
        className="h-[90%] w-[90%] object-cover object-[center_42%]"
        sizes={`${size}px`}
        priority={isBubble}
      />
    </span>
  )
}
