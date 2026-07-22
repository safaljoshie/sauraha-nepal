"use client"

import SiteIcon from "@/components/icons/SiteIcon"

export type AdminTab =
  | "listings"
  | "business-reviews"
  | "guides"
  | "blog"
  | "calendar"
  | "resources"
  | "itineraries"
  | "settings"

const TABS: { id: AdminTab; label: string; icon: string }[] = [
  { id: "listings", label: "Listings", icon: "clipboard-list" },
  { id: "business-reviews", label: "Business Reviews", icon: "star" },
  { id: "guides", label: "Tour Guides", icon: "compass" },
  { id: "blog", label: "Blog Posts", icon: "pen-line" },
  { id: "calendar", label: "Content Calendar", icon: "calendar" },
  { id: "resources", label: "Team Resources", icon: "folder-open" },
  { id: "itineraries", label: "Team Itinerary", icon: "map" },
  { id: "settings", label: "Site Settings", icon: "settings" },
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
          className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
            active === tab.id
              ? "bg-green-brand text-white"
              : "bg-white text-text-mid hover:bg-cream"
          }`}
        >
          <SiteIcon
            name={tab.icon}
            size={16}
            strokeWidth={2.25}
            className={active === tab.id ? "text-white" : "text-green-brand"}
          />
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
