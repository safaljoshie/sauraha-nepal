import type { ListGuideRecord } from "@/lib/list-guide"
import type { TourGuide } from "@/lib/tour-guides"
import { buildGuideProfileUrl } from "@/lib/tour-guides"

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

function formatServices(services: ListGuideRecord["services"]) {
  if (services.length === 0) return ""
  return services
    .map((s) => `${s.name} — NPR ${s.price_npr.toLocaleString()}`)
    .join("\n")
}

export function buildGuideAdminNotificationEmail(data: ListGuideRecord) {
  const adminUrl = "https://www.saurahanepal.com/admin/dashboard"
  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.6;">A new tour guide profile application was submitted and is awaiting review.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e4dc;border-radius:12px;overflow:hidden;font-size:14px;font-family:Arial,Helvetica,sans-serif;">
      ${row("Name", data.full_name)}
      ${row("Nickname", data.nickname)}
      ${row("Email", data.email)}
      ${row("Phone", data.phone)}
      ${row("WhatsApp", data.whatsapp)}
      ${row("Location", data.location)}
      ${row("Licence", data.licence_number)}
      ${row("Languages", data.languages.join(", "))}
      ${row("Expertise", data.expertise.join(", "))}
      ${row("Services", formatServices(data.services))}
      ${row("Bio", data.bio)}
      ${row("Photo", data.photo_url)}
    </table>
    <p style="margin:24px 0 0;text-align:center;">
      <a href="${adminUrl}" style="display:inline-block;background:#1a5c2a;color:#fff;font-size:14px;font-weight:700;padding:12px 24px;border-radius:999px;text-decoration:none;">Review in admin</a>
    </p>
  `

  const text = [
    "New tour guide application",
    "",
    `Name: ${data.full_name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Languages: ${data.languages.join(", ")}`,
    "",
    "Review: " + adminUrl,
  ].join("\n")

  return {
    subject: `New Guide Application — ${data.full_name}`,
    html: emailShell("New guide application", body),
    text,
  }
}

export function buildGuideApplicantConfirmationEmail(data: ListGuideRecord) {
  const body = `
    <p style="margin:0 0 16px;font-size:16px;color:#1a5c2a;font-weight:700;">Hi ${escapeHtml(data.full_name)},</p>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">Thank you for applying to list your guide profile on Sauraha Nepal. We have received your application and our team will review it within <strong>24–48 hours</strong>.</p>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">Once approved, your profile will appear on our <a href="https://www.saurahanepal.com/guides" style="color:#1a5c2a;">Tour Guides directory</a> where travellers can contact you directly.</p>
    <p style="margin:24px 0 0;font-size:14px;color:#666;line-height:1.6;">Questions? Reply to this email or contact hello@mail.saurahanepal.com.</p>
  `

  const text = [
    `Hi ${data.full_name},`,
    "",
    "Thank you for applying to list your guide profile on Sauraha Nepal.",
    "We have received your application and will review it within 24–48 hours.",
    "",
    "Questions? hello@mail.saurahanepal.com",
  ].join("\n")

  return {
    subject: "Your guide application received — Sauraha Nepal",
    html: emailShell("Application received", body),
    text,
  }
}

export function buildGuideApprovalEmail(guide: TourGuide) {
  const profileUrl = buildGuideProfileUrl(guide)
  const body = `
    <p style="margin:0 0 16px;font-size:16px;color:#1a5c2a;font-weight:700;">Hi ${escapeHtml(guide.full_name)},</p>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">Congratulations! Your tour guide profile has been approved and is now live on Sauraha Nepal.</p>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">Travellers can view your profile and contact you directly — no commission from us.</p>
    <p style="margin:24px 0 0;text-align:center;">
      <a href="${profileUrl}" style="display:inline-block;background:#1a5c2a;color:#fff;font-size:14px;font-weight:700;padding:12px 24px;border-radius:999px;text-decoration:none;">View your profile</a>
    </p>
  `

  const text = [
    `Hi ${guide.full_name},`,
    "",
    "Your tour guide profile has been approved and is now live on Sauraha Nepal.",
    "",
    `View your profile: ${profileUrl}`,
  ].join("\n")

  return {
    subject: "Your guide profile is approved — Sauraha Nepal",
    html: emailShell("Guide profile approved", body),
    text,
  }
}

export function buildGuideRejectionEmail(guide: TourGuide) {
  const body = `
    <p style="margin:0 0 16px;font-size:16px;color:#1a5c2a;font-weight:700;">Hi ${escapeHtml(guide.full_name)},</p>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">Thank you for applying to list your guide profile on Sauraha Nepal.</p>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">After reviewing your application, we’re unable to approve your profile at this time. This may be due to incomplete information, missing licence details, or information we couldn’t verify.</p>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">You’re welcome to resubmit with updated details at <a href="https://www.saurahanepal.com/list-your-guide" style="color:#1a5c2a;">saurahanepal.com/list-your-guide</a>, or contact us if you have questions.</p>
  `

  const text = [
    `Hi ${guide.full_name},`,
    "",
    "Thank you for applying to list your guide profile on Sauraha Nepal.",
    "",
    "After review, we’re unable to approve your profile at this time.",
    "You can resubmit at saurahanepal.com/list-your-guide.",
  ].join("\n")

  return {
    subject: "Update on your guide application — Sauraha Nepal",
    html: emailShell("Guide application update", body),
    text,
  }
}
