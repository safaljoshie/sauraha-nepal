import HeroWeather from "@/components/home/HeroWeather"
import { fetchSaurahaWeather } from "@/lib/sauraha-weather"

export default async function HeroWeatherSlot() {
  const weather = await fetchSaurahaWeather()
  if (!weather) return null
  return <HeroWeather {...weather} />
}
