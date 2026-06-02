import { isPaidPlan, planLabel, type BusinessListing } from "@/lib/business-listing"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
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

export function buildApprovalEmail(listing: BusinessListing) {
  const paid = isPaidPlan(listing.plan)
  const paymentBlock = paid
    ? `<p style="margin:20px 0 0;padding:16px;background:#fff4ed;border-left:4px solid #e8621a;border-radius:8px;font-size:14px;color:#444;line-height:1.6;"><strong>Payment for your ${escapeHtml(planLabel(listing.plan))} plan:</strong><br>Please send payment via bank transfer or contact us at <a href="mailto:hello@mail.saurahanepal.com" style="color:#1a5c2a;">hello@mail.saurahanepal.com</a> for payment details.</p>`
    : ""

  const body = `
    <p style="margin:0 0 16px;font-size:16px;color:#1a5c2a;font-weight:700;">Hi ${escapeHtml(listing.owner_name)},</p>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">Congratulations! Your listing for <strong>${escapeHtml(listing.business_name)}</strong> has been approved and is now live on Sauraha Nepal.</p>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">Travellers can now discover your business on our directory. Thank you for being part of the Sauraha community.</p>
    <p style="margin:0;font-size:14px;color:#666;">Plan: <strong>${escapeHtml(planLabel(listing.plan))}</strong></p>
    ${paymentBlock}
    <p style="margin:24px 0 0;font-size:14px;color:#666;">Questions? Reply to this email or contact hello@mail.saurahanepal.com.</p>
  `

  const text = [
    `Hi ${listing.owner_name},`,
    "",
    `Congratulations! Your listing for ${listing.business_name} has been approved and is now live on Sauraha Nepal.`,
    "",
    `Plan: ${planLabel(listing.plan)}`,
    paid
      ? "Payment: Please send payment via bank transfer or contact hello@mail.saurahanepal.com for details."
      : null,
  ]
    .filter(Boolean)
    .join("\n")

  return {
    subject: "Your listing is approved — Sauraha Nepal 🎉",
    html: emailShell("Listing approved", body),
    text,
  }
}

export function buildRejectionEmail(listing: BusinessListing) {
  const body = `
    <p style="margin:0 0 16px;font-size:16px;color:#1a5c2a;font-weight:700;">Hi ${escapeHtml(listing.owner_name)},</p>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">Thank you for submitting <strong>${escapeHtml(listing.business_name)}</strong> to Sauraha Nepal.</p>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">After reviewing your application, we’re unable to approve this listing at this time. This may be due to incomplete information, missing photos, or details we couldn’t verify.</p>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">You’re welcome to resubmit with more complete details at <a href="https://www.saurahanepal.com/list-your-business" style="color:#1a5c2a;">saurahanepal.com/list-your-business</a>, or contact us if you have questions.</p>
    <p style="margin:24px 0 0;font-size:14px;color:#666;">We appreciate your interest in listing with us.</p>
  `

  const text = [
    `Hi ${listing.owner_name},`,
    "",
    `Thank you for submitting ${listing.business_name} to Sauraha Nepal.`,
    "",
    "After reviewing your application, we're unable to approve this listing at this time.",
    "You're welcome to resubmit with more complete details at saurahanepal.com/list-your-business.",
    "",
    "Questions? hello@mail.saurahanepal.com",
  ].join("\n")

  return {
    subject: "Your listing submission — Sauraha Nepal",
    html: emailShell("Listing update", body),
    text,
  }
}
