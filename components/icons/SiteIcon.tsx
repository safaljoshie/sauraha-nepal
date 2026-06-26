import {
  Binoculars,
  BookOpen,
  Bus,
  Calendar,
  Camera,
  Car,
  ClipboardList,
  Clock,
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Compass,
  FolderOpen,
  Globe,
  Heart,
  Hotel,
  Info,
  LayoutGrid,
  Mail,
  Map,
  MapPin,
  Menu,
  MessageCircle,
  Pencil,
  PenLine,
  Phone,
  Search,
  Settings,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  TreePine,
  Utensils,
  X,
  type LucideIcon,
} from "lucide-react"
import { UI_ICONS } from "@/lib/ui-icon-map"

const LUCIDE_BY_NAME: Record<string, LucideIcon> = {
  ...UI_ICONS,
  hotel: Hotel,
  utensils: Utensils,
  binoculars: Binoculars,
  car: Car,
  "shopping-bag": ShoppingBag,
  compass: Compass,
  info: Info,
  "map-pin": MapPin,
  "tree-pine": TreePine,
  camera: Camera,
  heart: Heart,
  sparkles: Sparkles,
  "clipboard-list": ClipboardList,
  "pen-line": PenLine,
  calendar: Calendar,
  "folder-open": FolderOpen,
  "book-open": BookOpen,
  cloud: Cloud,
  "cloud-sun": CloudSun,
  "cloud-rain": CloudRain,
  "cloud-lightning": CloudLightning,
  "cloud-snow": CloudSnow,
}

type SiteIconProps = {
  name: string
  size?: number
  className?: string
  strokeWidth?: number
  "aria-hidden"?: boolean
}

export default function SiteIcon({
  name,
  size = 20,
  className = "",
  strokeWidth = 2.25,
  "aria-hidden": ariaHidden = true,
}: SiteIconProps) {
  const key = name.trim().toLowerCase()
  const Icon = LUCIDE_BY_NAME[key] ?? MapPin

  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={ariaHidden}
    />
  )
}
