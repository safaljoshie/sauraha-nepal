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
      className="hero-weather inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:px-4 sm:py-2 md:gap-2 md:px-4 md:py-2 md:text-[0.9rem]"
      aria-label={`Sauraha weather: ${temperatureC} degrees Celsius, ${conditionLabel}`}
    >
      <SiteIcon name={iconName} size={18} strokeWidth={2} className="hero-weather-icon shrink-0 text-orange-light md:h-[1.05rem] md:w-[1.05rem]" />
      <span className="whitespace-nowrap">
        <span className="font-semibold">{temperatureC}°C</span>
        <span className="hidden text-white/85 sm:inline"> · {conditionLabel}</span>
      </span>
      <span className="hidden text-xs text-white/60 md:inline">Sauraha</span>
    </div>
  )
}

export function HeroWeatherSkeleton() {
  return (
    <div
      className="hero-weather hero-weather-skeleton inline-flex h-[34px] w-[108px] animate-pulse items-center rounded-full border border-white/15 bg-white/10 px-4 backdrop-blur-xl sm:h-[40px] sm:w-[140px] md:h-[2.4rem] md:w-[9rem]"
      aria-hidden
    />
  )
}
