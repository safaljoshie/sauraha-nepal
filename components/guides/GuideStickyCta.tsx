import {
  formatGuidePhoneUrl,
  formatGuideWhatsAppUrl,
  type TourGuide,
} from "@/lib/tour-guides"

type GuideStickyCtaProps = {
  guide: TourGuide
}

export default function GuideStickyCta({ guide }: GuideStickyCtaProps) {
  const waUrl = guide.whatsapp ? formatGuideWhatsAppUrl(guide.whatsapp) : ""
  const callUrl = guide.phone ? formatGuidePhoneUrl(guide.phone) : ""

  if (!waUrl && !callUrl) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-brand bg-white/95 p-3 backdrop-blur md:hidden mobile-bottom-nav-clearance">
      <div className="site-container flex gap-2">
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-green-brand px-4 py-3 text-sm font-bold text-white"
          >
            Contact on WhatsApp
          </a>
        ) : null}
        {callUrl ? (
          <a
            href={callUrl}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-green-brand px-4 py-3 text-sm font-bold text-green-brand"
          >
            Call
          </a>
        ) : null}
      </div>
    </div>
  )
}
