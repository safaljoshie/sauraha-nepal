import type { BusinessReview } from "@/lib/business-reviews"

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
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim()
}

export function buildBusinessReviewNotificationEmail(
  business: { id: string; business_name: string },
  review: Pick<BusinessReview, "reviewer_name" | "reviewer_country" | "rating" | "comment" | "visit_date">,
) {
  const adminUrl = `https://www.saurahanepal.com/admin/dashboard`
  const subject = `New review for ${business.business_name} — ${review.rating}★`
  const rowStyle =
    "padding:10px 12px;border-bottom:1px solid #e8e4dc;font-weight:600;color:#1a5c2a;"
  const cellStyle = "padding:10px 12px;border-bottom:1px solid #e8e4dc;"
  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">
      A new business review is awaiting approval.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e4dc;border-radius:12px;font-size:14px;font-family:Arial,Helvetica,sans-serif;">
      <tr><td style="${rowStyle}">Business</td><td style="${cellStyle}">${escapeHtml(business.business_name)}</td></tr>
      <tr><td style="${rowStyle}">Reviewer</td><td style="${cellStyle}">${escapeHtml(review.reviewer_name)}${review.reviewer_country ? ` (${escapeHtml(review.reviewer_country)})` : ""}</td></tr>
      <tr><td style="${rowStyle}">Rating</td><td style="${cellStyle}">${review.rating} / 5</td></tr>
      ${review.visit_date ? `<tr><td style="${rowStyle}">Visit date</td><td style="${cellStyle}">${escapeHtml(review.visit_date)}</td></tr>` : ""}
      <tr><td style="padding:10px 12px;font-weight:600;color:#1a5c2a;vertical-align:top;">Comment</td><td style="padding:10px 12px;">${escapeHtml(review.comment).replace(/\n/g, "<br>")}</td></tr>
    </table>
    <p style="margin:24px 0 0;text-align:center;">
      <a href="${adminUrl}" style="display:inline-block;background:#1a5c2a;color:#fff;font-size:14px;font-weight:700;padding:12px 24px;border-radius:999px;text-decoration:none;">Open admin dashboard</a>
    </p>
  `
  return { subject, html: emailShell(subject, body), text: `${subject}\n\n${review.comment}` }
}
