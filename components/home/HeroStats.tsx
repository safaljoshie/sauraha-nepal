type StatConfig =
  | { label: string; type: "static"; display: string }
  | { label: string; type: "animated"; value: number; suffix?: string }

/** Server-rendered hero stats — avoids client animation resetting counts to 0. */
export default function HeroStats({ stats }: { stats: StatConfig[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-10">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center text-white">
          <strong className="block text-2xl font-bold text-orange-light">
            {stat.type === "static"
              ? stat.display
              : `${stat.value}${stat.suffix ?? ""}`}
          </strong>
          <span className="text-sm opacity-80">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}
