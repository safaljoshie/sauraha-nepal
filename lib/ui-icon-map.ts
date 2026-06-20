import {
  Bus,
  Clock,
  Eye,
  Globe,
  LayoutGrid,
  Mail,
  Map,
  MapPin,
  Menu,
  MessageCircle,
  Pencil,
  Phone,
  Search,
  Settings,
  Smartphone,
  Star,
  Sun,
  X,
  type LucideIcon,
} from "lucide-react"

export const UI_ICONS = {
  close: X,
  menu: Menu,
  search: Search,
  mapPin: MapPin,
  star: Star,
  mail: Mail,
  phone: Phone,
  messageCircle: MessageCircle,
  clock: Clock,
  layoutGrid: LayoutGrid,
  map: Map,
  eye: Eye,
  pencil: Pencil,
  globe: Globe,
  smartphone: Smartphone,
  bus: Bus,
  sun: Sun,
  settings: Settings,
} as const satisfies Record<string, LucideIcon>

export type UiIconName = keyof typeof UI_ICONS

export function getUiIcon(name: UiIconName): LucideIcon {
  return UI_ICONS[name]
}
