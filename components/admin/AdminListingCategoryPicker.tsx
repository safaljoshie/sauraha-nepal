"use client"

export type CategoryPickerOption = {
  name: string
  groupLabel: string
  is_active: boolean
}

type AdminListingCategoryPickerProps = {
  options: CategoryPickerOption[]
  value: string[]
  onChange: (categories: string[]) => void
  disabled?: boolean
}

export default function AdminListingCategoryPicker({
  options,
  value,
  onChange,
  disabled = false,
}: AdminListingCategoryPickerProps) {
  const selected = new Set(value)
  const grouped = options.reduce<Record<string, CategoryPickerOption[]>>((acc, option) => {
    const key = option.groupLabel || "Other"
    if (!acc[key]) acc[key] = []
    acc[key].push(option)
    return acc
  }, {})

  const groupNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b))

  function toggle(name: string) {
    if (disabled) return
    const next = new Set(selected)
    if (next.has(name)) {
      next.delete(name)
    } else {
      next.add(name)
    }
    onChange([...next])
  }

  if (options.length === 0) {
    return <p className="text-sm text-text-light">No categories available. Add categories in Manage Categories.</p>
  }

  return (
    <div className="space-y-4 rounded-xl border border-border-brand bg-cream/40 p-4">
      {groupNames.map((groupLabel) => (
        <div key={groupLabel}>
          <p className="mb-2 text-xs font-bold tracking-wide text-text-light uppercase">{groupLabel}</p>
          <div className="flex flex-wrap gap-2">
            {grouped[groupLabel].map((option) => {
              const active = selected.has(option.name)
              return (
                <button
                  key={option.name}
                  type="button"
                  disabled={disabled || !option.is_active}
                  onClick={() => toggle(option.name)}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    active
                      ? "border-green-brand bg-green-brand text-white"
                      : "border-border-brand bg-white text-text-mid hover:border-green-mid"
                  }`}
                  aria-pressed={active}
                >
                  {option.name}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {value.length > 0 ? (
        <p className="text-xs text-text-light">
          {value.length} selected: {value.join(", ")}
        </p>
      ) : (
        <p className="text-xs font-semibold text-orange-brand">Select at least one category.</p>
      )}
    </div>
  )
}
