import { type ListBusinessRecord, planDisplayLabel } from "@/lib/list-business"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function row(label: string, value: string) {
  if (!value) return ""
  return `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;color:#1a5c2a;font-weight:600;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;color:#333;vertical-align:top;">${escapeHtml(value).replace(/\n/g, "<br>")}</td>
    </tr>
  `
}

function emailShell(title: string, body: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e4dc;">
        <tr>
          <td style="background:linear-gradient(135deg,#1a5c2a 0%,#0d3a18 100%);padding:28px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#f5c49a;">Sauraha Nepal</p>
            <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">${escapeHtml(title)}</h1>
          </td>
        </tr>
        <tr><td style="padding:28px 32px;">${body}</td></tr>
        <tr>
          <td style="background:#faf7f2;padding:20px 32px;text-align:center;border-top:1px solid #e8e4dc;">
            <p style="margin:0;font-size:12px;color:#666;">saurahanepal.com · Gateway to Chitwan</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim()
}

export function buildAdminNotificationEmail(data: ListBusinessRecord) {
  const planBadge = planDisplayLabel(data.plan)
  const planColor = data.plan === "premium" ? "#e8621a" : data.plan === "featured" ? "#e8621a" : "#1a5c2a"

  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.6;">A new business listing application was submitted and is awaiting review.</p>
    <p style="margin:0 0 24px;text-align:center;">
      <span style="display:inline-block;background:${planColor};color:#fff;font-size:13px;font-weight:700;padding:8px 18px;border-radius:999px;">${escapeHtml(planBadge)}</span>
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e4dc;border-radius:12px;overflow:hidden;font-size:14px;font-family:Arial,Helvetica,sans-serif;">
      ${row("Business", data.business_name)}
      ${row("Category", data.category)}
      ${row("Plan", planBadge)}
      ${row("Owner", data.owner_name)}
      ${row("Email", data.email)}
      ${row("Phone", data.phone)}
      ${row("WhatsApp", data.whatsapp)}
      ${row("Website", data.website)}
      ${row("Social Media", data.facebook)}
      ${row("Address", data.address)}
      ${row("Google Maps", data.google_maps_link)}
      ${row("Price range", data.price_range)}
      ${row("Opening hours", data.opening_hours)}
      ${row("Description", data.description)}
      ${row("Photo links", data.photo_links)}
    </table>
    <p style="margin:24px 0 0;font-size:13px;color:#888;">Status: pending review</p>
  `

  const text = [
    "New business listing submission",
    "",
    `Plan: ${planBadge}`,
    `Business: ${data.business_name}`,
    `Category: ${data.category}`,
    `Owner: ${data.owner_name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    data.whatsapp ? `WhatsApp: ${data.whatsapp}` : null,
    data.website ? `Website: ${data.website}` : null,
    data.facebook ? `Social Media: ${data.facebook}` : null,
    `Address: ${data.address}`,
    data.google_maps_link ? `Maps: ${data.google_maps_link}` : null,
    data.price_range ? `Price range: ${data.price_range}` : null,
    data.opening_hours ? `Hours: ${data.opening_hours}` : null,
    "",
    "Description:",
    data.description,
    data.photo_links ? `\nPhotos:\n${data.photo_links}` : null,
  ]
    .filter(Boolean)
    .join("\n")

  return {
    subject: `New Business Listing - ${data.business_name} (${planBadge} plan)`,
    html: emailShell("New listing submission", body),
    text,
  }
}

export function buildOwnerConfirmationEmail(data: ListBusinessRecord) {
  const planBadge = planDisplayLabel(data.plan)
  const paid = data.plan === "featured" || data.plan === "premium"

  const paymentNote = paid
    ? `<p style="margin:20px 0 0;padding:16px;background:#fff4ed;border-left:4px solid #e8621a;border-radius:8px;font-size:14px;color:#444;line-height:1.6;">Payment instructions will be sent to <strong>${escapeHtml(data.email)}</strong> within <strong>24 hours</strong>.</p>`
    : ""

  const body = `
    <p style="margin:0 0 16px;font-size:16px;color:#1a5c2a;font-weight:700;">Hi ${escapeHtml(data.owner_name)},</p>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">Thank you for submitting <strong>${escapeHtml(data.business_name)}</strong> to Sauraha Nepal. We have received your application and our team will review it within <strong>48 hours</strong>.</p>
    <p style="margin:0 0 8px;font-size:14px;color:#666;">Your selected plan:</p>
    <p style="margin:0 0 20px;text-align:center;">
      <span style="display:inline-block;background:#1a5c2a;color:#fff;font-size:13px;font-weight:700;padding:8px 18px;border-radius:999px;">${escapeHtml(planBadge)}</span>
    </p>
    ${paymentNote}
    <p style="margin:24px 0 0;font-size:14px;color:#666;line-height:1.6;">If you have questions, reply to this email or contact us at hello@mail.saurahanepal.com.</p>
  `

  const text = [
    `Hi ${data.owner_name},`,
    "",
    `Thank you for submitting ${data.business_name} to Sauraha Nepal.`,
    "We have received your application and will review it within 48 hours.",
    "",
    `Plan: ${planBadge}`,
    paid
      ? `Payment instructions will be sent to ${data.email} within 24 hours.`
      : null,
    "",
    "Questions? hello@mail.saurahanepal.com",
  ]
    .filter(Boolean)
    .join("\n")

  return {
    subject: "Your listing submission received - Sauraha Nepal",
    html: emailShell("Listing received", body),
    text,
  }
}
