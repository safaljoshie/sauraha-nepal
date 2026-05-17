import Image from "next/image"

type PageHeaderProps = {
  label?: string
  title: string
  subtitle?: string
  variant?: "solid" | "image"
  imageSrc?: string
}

export default function PageHeader({
  label,
  title,
  subtitle,
  variant = "solid",
  imageSrc,
}: PageHeaderProps) {
  if (variant === "image" && imageSrc) {
    return (
      <header className="relative mt-[68px] flex h-[360px] items-center justify-center overflow-hidden bg-[#0a2310] text-center">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover opacity-45"
          priority
        />
        <div className="relative z-10 px-6">
          {label && <p className="section-label text-orange-light">{label}</p>}
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-white md:text-5xl">
            {title}
          </h1>
        </div>
      </header>
    )
  }

  return (
    <header className="mt-[68px] bg-green-brand px-8 py-14 text-center">
      {label && <p className="section-label text-orange-light">{label}</p>}
      <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-white md:text-5xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-4 text-base text-white/70">{subtitle}</p>
      )}
    </header>
  )
}
