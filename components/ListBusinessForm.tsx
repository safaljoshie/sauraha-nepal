"use client"

import { useState } from "react"
import { businessCategories, pricingPlans } from "@/lib/data"

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-border-brand bg-cream px-4 py-3 text-sm text-text-brand outline-none transition-colors focus:border-green-mid focus:bg-white"

export default function ListBusinessForm() {
  const [plan, setPlan] = useState("Basic")

  return (
    <form
      className="rounded-[20px] border border-border-brand bg-white p-10 shadow-[0_8px_32px_rgba(26,92,42,0.08)]"
      onSubmit={(e) => e.preventDefault()}
    >
      <FormSection title="1. Business Details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Business Name">
            <input type="text" placeholder="e.g. Jungle Wildlife Camp" className={inputClass} required />
          </Field>
          <Field label="Category">
            <select className={inputClass} required>
              {businessCategories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Description">
          <textarea
            className={`${inputClass} min-h-[100px] resize-y`}
            placeholder="Describe your business, services, and what makes it special..."
            required
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Price Range">
            <select className={inputClass}>
              <option>$ Budget</option>
              <option>$$ Mid-range</option>
              <option>$$$ Premium</option>
            </select>
          </Field>
          <Field label="Opening Hours">
            <input type="text" placeholder="e.g. 7:00 AM – 10:00 PM" className={inputClass} />
          </Field>
        </div>
      </FormSection>

      <FormSection title="2. Contact Details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Owner Name">
            <input type="text" className={inputClass} required />
          </Field>
          <Field label="Email">
            <input type="email" className={inputClass} required />
          </Field>
          <Field label="Phone">
            <input type="tel" className={inputClass} required />
          </Field>
          <Field label="WhatsApp">
            <input type="tel" placeholder="+977..." className={inputClass} />
          </Field>
          <Field label="Website (optional)">
            <input type="url" className={inputClass} />
          </Field>
          <Field label="Facebook (optional)">
            <input type="url" className={inputClass} />
          </Field>
        </div>
      </FormSection>

      <FormSection title="3. Location">
        <Field label="Full Address">
          <input type="text" placeholder="Street, Sauraha, Chitwan" className={inputClass} required />
        </Field>
        <Field label="Google Maps Link">
          <input type="url" placeholder="https://maps.google.com/..." className={inputClass} />
        </Field>
      </FormSection>

      <FormSection title="4. Photos">
        <Field label="Photo URLs (one per line)">
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            placeholder="Paste links to your photos..."
          />
        </Field>
      </FormSection>

      <FormSection title="5. Choose Your Plan">
        <div className="grid gap-4 md:grid-cols-3">
          {pricingPlans.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setPlan(p.name)}
              className={`cursor-pointer rounded-2xl border-2 p-5 text-left transition-all ${
                plan === p.name
                  ? "border-orange-brand bg-orange-brand/5"
                  : "border-border-brand hover:border-green-mid"
              }`}
            >
              {p.popular && (
                <span className="mb-2 inline-block rounded-full bg-orange-brand px-2 py-0.5 text-[0.65rem] font-bold text-white uppercase">
                  Most Popular
                </span>
              )}
              <p className="font-[family-name:var(--font-playfair)] text-lg font-bold text-green-brand">
                {p.name}
              </p>
              <p className="text-2xl font-bold text-orange-brand">
                {p.price}
                <span className="text-xs font-normal text-text-light"> / {p.period}</span>
              </p>
            </button>
          ))}
        </div>
      </FormSection>

      <label className="mt-8 flex cursor-pointer items-start gap-3 text-sm text-text-mid">
        <input type="checkbox" required className="mt-1" />
        <span>
          I confirm the information provided is accurate and I agree to the listing
          terms and review process.
        </span>
      </label>

      <button type="submit" className="btn-primary mt-6 w-full cursor-pointer py-4 text-base">
        Submit Listing Application
      </button>
    </form>
  )
}

function FormSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="mb-10 border-none">
      <legend className="mb-5 font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
        {title}
      </legend>
      <div className="space-y-4">{children}</div>
    </fieldset>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-text-mid">{label}</label>
      {children}
    </div>
  )
}
