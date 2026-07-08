import type { GuideReview, TourGuide } from "@/lib/tour-guides"

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

export function buildGuideReviewNotificationEmail(
  guide: Pick<TourGuide, "id" | "full_name">,
  review: Pick<
    GuideReview,
    "reviewer_name" | "reviewer_country" | "rating" | "comment" | "tour_type" | "visit_date"
  >,
) {
  const adminUrl = `https://www.saurahanepal.com/admin/dashboard`
  const subject = `New review for ${guide.full_name} — ${review.rating}★`
  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">
      A new tour guide review is awaiting approval.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e4dc;border-radius:12px;font-size:14px;font-family:Arial,Helvetica,sans-serif;">
      <tr><td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;font-weight:600;color:#1a5c2a;">Guide</td><td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;">${escapeHtml(guide.full_name)}</td></tr>
      <tr><td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;font-weight:600;color:#1a5c2a;">Reviewer</td><td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;">${escapeHtml(review.reviewer_name)}${review.reviewer_country ? ` (${escapeHtml(review.reviewer_country)})` : ""}</td></tr>
      <tr><td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;font-weight:600;color:#1a5c2a;">Rating</td><td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;">${review.rating} / 5</td></tr>
      ${review.tour_type ? `<tr><td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;font-weight:600;color:#1a5c2a;">Tour type</td><td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;">${escapeHtml(review.tour_type)}</td></tr>` : ""}
      ${review.visit_date ? `<tr><td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;font-weight:600;color:#1a5c2a;">Visit date</td><td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;">${escapeHtml(review.visit_date)}</td></tr>` : ""}
      <tr><td style="padding:10px 12px;font-weight:600;color:#1a5c2a;vertical-align:top;">Comment</td><td style="padding:10px 12px;">${escapeHtml(review.comment).replace(/\n/g, "<br>")}</td></tr>
    </table>
    <p style="margin:24px 0 0;text-align:center;">
      <a href="${adminUrl}" style="display:inline-block;background:#1a5c2a;color:#fff;font-size:14px;font-weight:700;padding:12px 24px;border-radius:999px;text-decoration:none;">Open admin dashboard</a>
    </p>
  `
  const html = emailShell("New guide review", body)
  const text = [
    `New review for ${guide.full_name}`,
    `Rating: ${review.rating}/5`,
    `Reviewer: ${review.reviewer_name}${review.reviewer_country ? ` (${review.reviewer_country})` : ""}`,
    review.tour_type ? `Tour: ${review.tour_type}` : "",
    review.visit_date ? `Visit: ${review.visit_date}` : "",
    "",
    review.comment,
    "",
    `Approve in admin: ${adminUrl}`,
  ]
    .filter(Boolean)
    .join("\n")

  return { subject, html, text }
}
