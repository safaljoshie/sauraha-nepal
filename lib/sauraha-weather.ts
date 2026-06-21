export const SAURAHA_LAT = 27.575
export const SAURAHA_LON = 84.635

export type SaurahaWeather = {
  temperatureC: number
  conditionLabel: string
  iconName: string
}

type WeatherCodeInfo = {
  conditionLabel: string
  iconName: string
}

const WEATHER_BY_CODE: Record<number, WeatherCodeInfo> = {
  0: { conditionLabel: "Clear", iconName: "sun" },
  1: { conditionLabel: "Mainly clear", iconName: "cloud-sun" },
  2: { conditionLabel: "Partly cloudy", iconName: "cloud-sun" },
  3: { conditionLabel: "Overcast", iconName: "cloud" },
  45: { conditionLabel: "Foggy", iconName: "cloud" },
  48: { conditionLabel: "Foggy", iconName: "cloud" },
  51: { conditionLabel: "Light drizzle", iconName: "cloud-rain" },
  53: { conditionLabel: "Drizzle", iconName: "cloud-rain" },
  55: { conditionLabel: "Heavy drizzle", iconName: "cloud-rain" },
  56: { conditionLabel: "Freezing drizzle", iconName: "cloud-rain" },
  57: { conditionLabel: "Freezing drizzle", iconName: "cloud-rain" },
  61: { conditionLabel: "Light rain", iconName: "cloud-rain" },
  63: { conditionLabel: "Rain", iconName: "cloud-rain" },
  65: { conditionLabel: "Heavy rain", iconName: "cloud-rain" },
  66: { conditionLabel: "Freezing rain", iconName: "cloud-rain" },
  67: { conditionLabel: "Freezing rain", iconName: "cloud-rain" },
  71: { conditionLabel: "Light snow", iconName: "snowflake" },
  73: { conditionLabel: "Snow", iconName: "snowflake" },
  75: { conditionLabel: "Heavy snow", iconName: "snowflake" },
  77: { conditionLabel: "Snow grains", iconName: "snowflake" },
  80: { conditionLabel: "Rain showers", iconName: "cloud-rain" },
  81: { conditionLabel: "Rain showers", iconName: "cloud-rain" },
  82: { conditionLabel: "Heavy showers", iconName: "cloud-rain" },
  85: { conditionLabel: "Snow showers", iconName: "snowflake" },
  86: { conditionLabel: "Heavy snow showers", iconName: "snowflake" },
  95: { conditionLabel: "Thunderstorm", iconName: "cloud-lightning" },
  96: { conditionLabel: "Thunderstorm with hail", iconName: "cloud-lightning" },
  99: { conditionLabel: "Thunderstorm with hail", iconName: "cloud-lightning" },
}

function weatherFromCode(code: number): WeatherCodeInfo {
  return WEATHER_BY_CODE[code] ?? { conditionLabel: "Unknown", iconName: "cloud" }
}

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number
    weather_code?: number
  }
}

export async function fetchSaurahaWeather(): Promise<SaurahaWeather | null> {
  const url = new URL("https://api.open-meteo.com/v1/forecast")
  url.searchParams.set("latitude", String(SAURAHA_LAT))
  url.searchParams.set("longitude", String(SAURAHA_LON))
  url.searchParams.set("current", "temperature_2m,weather_code")
  url.searchParams.set("timezone", "Asia/Kathmandu")

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 1800 } })
    if (!res.ok) return null

    const data = (await res.json()) as OpenMeteoResponse
    const temperature = data.current?.temperature_2m
    const weatherCode = data.current?.weather_code

    if (typeof temperature !== "number" || typeof weatherCode !== "number") {
      return null
    }

    const { conditionLabel, iconName } = weatherFromCode(weatherCode)

    return {
      temperatureC: Math.round(temperature),
      conditionLabel,
      iconName,
    }
  } catch {
    return null
  }
}
