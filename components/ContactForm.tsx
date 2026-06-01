"use client"

import { useState } from "react"

const listingPlans = [
  {
    name: "Basic Listing",
    desc: "Name, contact, category, location",
    price: "Free",
    period: "Forever",
    featured: false,
  },
  {
    name: "Featured Listing",
    desc: "Top placement, photos, WhatsApp button",
    price: "$50",
    period: "per year",
    featured: true,
  },
  {
    name: "Premium Listing",
    desc: "Homepage feature, banner ad, priority support",
    price: "$120",
    period: "per year",
    featured: false,
  },
]

export default function ContactForm() {
  const [tab, setTab] = useState<"general" | "listing">("general")

  return (
    <div className="rounded-[20px] border border-border-brand bg-white p-10 shadow-[0_8px_32px_rgba(26,92,42,0.08)]">
      <div className="mb-8 flex gap-1 rounded-[10px] bg-cream p-1">
        <button
          type="button"
          onClick={() => setTab("general")}
          className={`flex-1 cursor-pointer rounded-lg py-2.5 text-sm font-semibold transition-all ${
            tab === "general"
              ? "bg-white text-green-brand shadow-sm"
              : "text-text-light"
          }`}
        >
          General Enquiry
        </button>
        <button
          type="button"
          onClick={() => setTab("listing")}
          className={`flex-1 cursor-pointer rounded-lg py-2.5 text-sm font-semibold transition-all ${
            tab === "listing"
              ? "bg-white text-green-brand shadow-sm"
              : "text-text-light"
          }`}
        >
          List My Business
        </button>
      </div>

      {tab === "general" ? <GeneralForm /> : <ListingForm />}
    </div>
  )
}

function FormField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-sm font-semibold text-text-mid">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-border-brand bg-cream px-4 py-3 text-sm text-text-brand outline-none transition-colors focus:border-green-mid focus:bg-white"

function GeneralForm() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Your Name">
          <input type="text" placeholder="e.g. John Smith" className={inputClass} />
        </FormField>
        <FormField label="Email Address">
          <input type="email" placeholder="your@email.com" className={inputClass} />
        </FormField>
      </div>
      <FormField label="Subject">
        <select className={inputClass}>
          <option>General Question</option>
          <option>Travel Advice</option>
          <option>Partnership</option>
          <option>Other</option>
        </select>
      </FormField>
      <FormField label="Message">
        <textarea
          placeholder="What would you like to know about Sauraha?"
          className={`${inputClass} min-h-[110px] resize-y`}
        />
      </FormField>
      <button type="submit" className="btn-primary mt-2 w-full cursor-pointer py-3.5">
        Send Message
      </button>
      <p className="mt-3 text-center text-sm text-text-light">
        We&apos;ll reply within 24 hours to your email address.
      </p>
    </form>
  )
}

function ListingForm() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Business Name">
          <input type="text" placeholder="e.g. Jungle Safari Resort" className={inputClass} />
        </FormField>
        <FormField label="Category">
          <select className={inputClass}>
            <option>Stay</option>
            <option>Eat & Drink</option>
            <option>Activities</option>
            <option>Transport</option>
            <option>Shopping</option>
            <option>Tour Guides</option>
            <option>Travel Info</option>
          </select>
        </FormField>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Your Name">
          <input type="text" placeholder="Owner / Manager name" className={inputClass} />
        </FormField>
        <FormField label="Phone / WhatsApp">
          <input type="text" placeholder="+977 98XXXXXXXX" className={inputClass} />
        </FormField>
      </div>
      <FormField label="Email Address">
        <input type="email" placeholder="business@email.com" className={inputClass} />
      </FormField>
      <FormField label="Website or Facebook Page (optional)">
        <input type="text" placeholder="https://..." className={inputClass} />
      </FormField>
      <FormField label="Brief Description of Your Business">
        <textarea
          placeholder="Tell us about your business — what you offer, location, and what makes it special..."
          className={`${inputClass} min-h-[110px] resize-y`}
        />
      </FormField>
      <FormField label="Listing Plan">
        <select className={inputClass}>
          <option>Free Basic Listing</option>
          <option>Featured Listing – $50/yr</option>
          <option>Premium Listing – $120/yr</option>
        </select>
      </FormField>
      <button type="submit" className="btn-primary mt-2 w-full cursor-pointer py-3.5">
        Submit My Business
      </button>
      <p className="mt-3 text-center text-sm text-text-light">
        Free listings are approved within 48 hours. We&apos;ll contact you to confirm
        details.
      </p>
    </form>
  )
}

export function ContactSidebar() {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-green-brand">
        Let&apos;s connect
      </h2>
      <p className="mt-4 mb-8 leading-relaxed text-text-mid">
        Have a question about Sauraha? Want to list your business or partner with us?
        Fill in the form and we&apos;ll get back to you within 24 hours.
      </p>

      <div className="space-y-6">
        <InfoItem icon="📍" title="Location" text="Sauraha, Chitwan, Nepal" />
        <InfoItem
          icon="📧"
          title="Email"
          text="hello@mail.saurahanepal.com"
          href="mailto:hello@mail.saurahanepal.com"
        />
        <InfoItem icon="💬" title="WhatsApp" text="+977 98XXXXXXXX" href="#" />
        <InfoItem icon="🕐" title="Response Time" text="Within 24 hours (NPT timezone)" />
      </div>

      <div className="mt-10">
        <h3 className="font-[family-name:var(--font-playfair)] mb-4 text-xl font-semibold text-green-brand">
          Listing Plans
        </h3>
        {listingPlans.map((plan) => (
          <div
            key={plan.name}
            className={`mb-3 flex items-center justify-between rounded-[14px] border-[1.5px] p-5 ${
              plan.featured
                ? "border-orange-brand bg-orange-brand/5"
                : "border-border-brand bg-white"
            }`}
          >
            <div>
              <p className="text-sm font-bold text-text-brand">
                {plan.name}
                {plan.featured && (
                  <span className="ml-2 rounded-full bg-orange-brand px-2 py-0.5 text-[0.7rem] font-bold text-white">
                    Popular
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-text-light">{plan.desc}</p>
            </div>
            <div className="text-right">
              <p className="font-[family-name:var(--font-playfair)] text-lg font-bold text-green-brand">
                {plan.price}
              </p>
              <span className="text-xs text-text-light">{plan.period}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InfoItem({
  icon,
  title,
  text,
  href,
}: {
  icon: string
  title: string
  text: string
  href?: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-mid/10 text-xl">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-text-brand">{title}</h4>
        {href ? (
          <a href={href} className="text-sm text-green-mid hover:underline">
            {text}
          </a>
        ) : (
          <span className="text-sm text-text-light">{text}</span>
        )}
      </div>
    </div>
  )
}
