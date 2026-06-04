import Image from "next/image"

const CHAT_AVATAR_SRC = "/images/chat-assistant-elephant.png"

type ChatAssistantAvatarProps = {
  size?: number
  className?: string
  /** Launcher: image only (orange bg on parent button). Messages: small ring avatar. */
  variant?: "bubble" | "avatar"
}

/** Elephant with headphones — transparent PNG (unoptimized to preserve alpha on mobile). */
export default function ChatAssistantAvatar({
  size = 40,
  className = "",
  variant = "avatar",
}: ChatAssistantAvatarProps) {
  const isBubble = variant === "bubble"

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${
        isBubble
          ? "overflow-visible bg-transparent"
          : "overflow-hidden rounded-full bg-cream ring-2 ring-orange-brand/25"
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
        className="h-[80%] w-[80%] object-contain object-center"
        sizes={`${size}px`}
        priority={isBubble}
      />
    </span>
  )
}
