export type AdminTab = "listings" | "blog" | "settings"

const TABS: { id: AdminTab; label: string }[] = [
  { id: "listings", label: "📋 Listings" },
  { id: "blog", label: "✍️ Blog Posts" },
  { id: "settings", label: "⚙️ Site Settings" },
]

export default function AdminTabNav({
  active,
  onChange,
}: {
  active: AdminTab
  onChange: (tab: AdminTab) => void
}) {
  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-border-brand pb-4">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
            active === tab.id
              ? "bg-green-brand text-white"
              : "bg-white text-text-mid hover:bg-cream"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
