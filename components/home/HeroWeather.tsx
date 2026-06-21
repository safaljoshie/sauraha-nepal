import SiteIcon from "@/components/icons/SiteIcon"
import type { SaurahaWeather } from "@/lib/sauraha-weather"

type HeroWeatherProps = SaurahaWeather

export default function HeroWeather({
  temperatureC,
  conditionLabel,
  iconName,
}: HeroWeatherProps) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/35 px-4 py-2 text-sm font-medium text-white backdrop-blur-md"
      aria-label={`Sauraha weather: ${temperatureC} degrees, ${conditionLabel.toLowerCase()}`}
    >
      <SiteIcon name={iconName} size={18} strokeWidth={2} className="shrink-0 text-orange-light" />
      <span className="font-semibold tabular-nums">{temperatureC}°C</span>
      <span className="hidden text-white/85 md:inline" aria-hidden>
        · {conditionLabel}
      </span>
    </div>
  )
}
