import Image from "next/image"

const CHAT_AVATAR_SRC = "/images/chat-assistant-elephant.png"

type ChatAssistantAvatarProps = {
  size?: number
  className?: string
  /** Larger launcher with orange ring. Smaller avatars in messages/header. */
  variant?: "bubble" | "avatar"
}

/** Elephant with headphones — transparent PNG mascot */
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
        className="h-[88%] w-[88%] object-contain object-center"
        sizes={`${size}px`}
        priority={isBubble}
      />
    </span>
  )
}
