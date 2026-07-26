import type { NewsletterCampaign, NewsletterSubscriber } from "@/lib/newsletter"

const SITE_URL = "https://www.saurahanepal.com"
const PHYSICAL_ADDRESS = "Sauraha Nepal · Sauraha, Chitwan, Nepal"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * Email clients strip <style> blocks and external CSS, so the rendered
 * markdown HTML must carry inline styles on every element. This post-processes
 * `marked` output, injecting the brand styles onto each supported tag while
 * preserving any attributes the tag already has (e.g. href/src/alt).
 */
const INLINE_STYLES: Record<string, string> = {
  h1: "font-size:28px;color:#1a5c2a;margin:0 0 16px;font-weight:700;",
  h2: "font-size:22px;color:#1a5c2a;margin:16px 0 12px;font-weight:700;",
  h3: "font-size:18px;color:#1a5c2a;margin:12px 0 8px;font-weight:700;",
  p: "font-size:16px;color:#3d4f3e;line-height:1.7;margin:0 0 16px;",
  a: "color:#e8621a;text-decoration:underline;",
  ul: "padding-left:24px;margin:0 0 16px;color:#3d4f3e;font-size:16px;line-height:1.7;",
  ol: "padding-left:24px;margin:0 0 16px;color:#3d4f3e;font-size:16px;line-height:1.7;",
  img: "max-width:100%;height:auto;border-radius:8px;display:block;margin:16px 0;",
  blockquote:
    "border-left:4px solid #1a5c2a;padding-left:16px;color:#6b7f6c;margin:16px 0;font-style:italic;",
  hr: "border:none;border-top:1px solid #e5e7eb;margin:24px 0;",
}

export function applyInlineStyles(html: string): string {
  let output = html
  for (const [tag, style] of Object.entries(INLINE_STYLES)) {
    const openTag = new RegExp(`<${tag}(\\s[^>]*)?>`, "gi")
    output = output.replace(openTag, (_match, attrs: string | undefined) => {
      return `<${tag}${attrs ?? ""} style="${style}">`
    })
  }
  return output
}

/**
 * Wraps rendered campaign content in the branded, mobile-responsive email
 * shell. Uses only inline styles + a single-column 600px layout so it renders
 * consistently across Gmail, Apple Mail and Outlook.
 */
export function buildEmailHTML(
  content: string,
  campaign: Pick<NewsletterCampaign, "subject" | "preview_text">,
  subscriber: Pick<NewsletterSubscriber, "email" | "name" | "unsubscribe_token">,
): string {
  const unsubscribeUrl = `${SITE_URL}/newsletter/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token)}`
  const previewText = campaign.preview_text?.trim()
    ? escapeHtml(campaign.preview_text.trim())
    : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(campaign.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Calibri,Arial,Helvetica,sans-serif;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</div>` : ""}
  <div style="max-width:600px;margin:0 auto;padding:8px 0;text-align:center;">
    <a href="${SITE_URL}" style="font-size:12px;color:#6b7f6c;text-decoration:none;">View on saurahanepal.com</a>
  </div>

  <!-- Header -->
  <div style="background:#1a5c2a;padding:20px;text-align:center;">
    <span style="color:#ffffff;font-size:22px;font-weight:bold;">Sauraha Nepal</span>
    <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0 0;">
      Your guide to Sauraha &amp; Chitwan National Park
    </p>
  </div>

  <!-- Content -->
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;background:#ffffff;">
    ${content}
  </div>

  <!-- Footer -->
  <div style="max-width:600px;margin:0 auto;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;background:#ffffff;">
    <p style="font-size:12px;color:#6b7f6c;margin:0 0 8px;line-height:1.6;">
      You're receiving this because you subscribed at saurahanepal.com<br>
      <a href="${unsubscribeUrl}" style="color:#e8621a;">Unsubscribe</a>
      &nbsp;·&nbsp;
      <a href="${SITE_URL}" style="color:#1a5c2a;">Visit Sauraha Nepal</a>
    </p>
    <p style="font-size:12px;color:#9ca89c;margin:0;">${PHYSICAL_ADDRESS}</p>
  </div>
</body>
</html>`
}

/** Double opt-in confirmation email sent right after signup. */
export function buildSubscriptionConfirmationEmail(
  subscriber: Pick<NewsletterSubscriber, "email" | "name" | "confirm_token" | "unsubscribe_token">,
) {
  const confirmUrl = `${SITE_URL}/newsletter/confirm?token=${encodeURIComponent(subscriber.confirm_token)}`
  const unsubscribeUrl = `${SITE_URL}/newsletter/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token)}`
  const greetingName = subscriber.name?.trim()
    ? escapeHtml(subscriber.name.trim())
    : "there"

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Confirm your Sauraha Nepal newsletter subscription</title>
</head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Calibri,Arial,Helvetica,sans-serif;">
  <div style="background:#1a5c2a;padding:20px;text-align:center;">
    <span style="color:#ffffff;font-size:22px;font-weight:bold;">Sauraha Nepal</span>
    <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0 0;">
      Your guide to Sauraha &amp; Chitwan National Park
    </p>
  </div>
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;background:#ffffff;">
    <p style="font-size:18px;color:#1a5c2a;font-weight:700;margin:0 0 16px;">Hi ${greetingName}, thanks for subscribing!</p>
    <p style="font-size:16px;color:#3d4f3e;line-height:1.7;margin:0 0 24px;">
      Click below to confirm your email and start receiving travel tips, new listings, and Chitwan guides from Sauraha Nepal.
    </p>
    <p style="text-align:center;margin:0 0 24px;">
      <a href="${confirmUrl}" style="display:inline-block;background:#1a5c2a;color:#ffffff;font-size:16px;font-weight:700;padding:14px 28px;border-radius:999px;text-decoration:none;">Confirm My Subscription</a>
    </p>
    <p style="font-size:14px;color:#6b7f6c;line-height:1.6;margin:0;">
      If you didn't sign up for this, ignore this email.
    </p>
  </div>
  <div style="max-width:600px;margin:0 auto;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;background:#ffffff;">
    <p style="font-size:12px;color:#6b7f6c;margin:0 0 8px;">
      <a href="${unsubscribeUrl}" style="color:#e8621a;">Unsubscribe</a>
      &nbsp;·&nbsp;
      <a href="${SITE_URL}" style="color:#1a5c2a;">Visit Sauraha Nepal</a>
    </p>
    <p style="font-size:12px;color:#9ca89c;margin:0;">${PHYSICAL_ADDRESS}</p>
  </div>
</body>
</html>`

  const text = [
    `Hi ${subscriber.name?.trim() || "there"}, thanks for subscribing!`,
    "",
    "Confirm your email to start receiving travel tips, new listings, and Chitwan guides from Sauraha Nepal:",
    confirmUrl,
    "",
    "If you didn't sign up for this, ignore this email.",
    "",
    PHYSICAL_ADDRESS,
  ].join("\n")

  return {
    subject: "Confirm your Sauraha Nepal newsletter subscription",
    html,
    text,
  }
}

/** Welcome / thank-you email sent once, right after a subscriber confirms. */
export function buildWelcomeEmail(
  subscriber: Pick<NewsletterSubscriber, "email" | "name" | "unsubscribe_token">,
) {
  const unsubscribeUrl = `${SITE_URL}/newsletter/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token)}`
  const greetingName = subscriber.name?.trim() ? escapeHtml(subscriber.name.trim()) : "there"

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Welcome to the Sauraha Nepal newsletter</title>
</head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Calibri,Arial,Helvetica,sans-serif;">
  <div style="background:#1a5c2a;padding:20px;text-align:center;">
    <span style="color:#ffffff;font-size:22px;font-weight:bold;">Sauraha Nepal</span>
    <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0 0;">
      Your guide to Sauraha &amp; Chitwan National Park
    </p>
  </div>
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;background:#ffffff;">
    <p style="font-size:20px;color:#1a5c2a;font-weight:700;margin:0 0 16px;">Welcome aboard, ${greetingName}! 🎉</p>
    <p style="font-size:16px;color:#3d4f3e;line-height:1.7;margin:0 0 16px;">
      Thanks for confirming your subscription. You're all set to receive the best of Sauraha
      &amp; Chitwan straight to your inbox.
    </p>
    <p style="font-size:16px;color:#3d4f3e;line-height:1.7;margin:0 0 8px;">Here's what to expect:</p>
    <ul style="padding-left:24px;margin:0 0 24px;color:#3d4f3e;font-size:16px;line-height:1.7;">
      <li>Practical travel tips &amp; seasonal guides for Chitwan National Park</li>
      <li>New hotels, restaurants, and tour guides worth knowing about</li>
      <li>Wildlife, culture, and things to do around Sauraha</li>
    </ul>
    <p style="text-align:center;margin:0 0 24px;">
      <a href="${SITE_URL}/blog" style="display:inline-block;background:#1a5c2a;color:#ffffff;font-size:16px;font-weight:700;padding:14px 28px;border-radius:999px;text-decoration:none;">Read our latest guides</a>
    </p>
    <p style="font-size:14px;color:#6b7f6c;line-height:1.6;margin:0;">
      Have a question or a place we should feature? Just reply to this email — we'd love to hear from you.
    </p>
  </div>
  <div style="max-width:600px;margin:0 auto;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;background:#ffffff;">
    <p style="font-size:12px;color:#6b7f6c;margin:0 0 8px;line-height:1.6;">
      You're receiving this because you confirmed your subscription at saurahanepal.com<br>
      <a href="${unsubscribeUrl}" style="color:#e8621a;">Unsubscribe</a>
      &nbsp;·&nbsp;
      <a href="${SITE_URL}" style="color:#1a5c2a;">Visit Sauraha Nepal</a>
    </p>
    <p style="font-size:12px;color:#9ca89c;margin:0;">${PHYSICAL_ADDRESS}</p>
  </div>
</body>
</html>`

  const text = [
    `Welcome aboard, ${subscriber.name?.trim() || "there"}!`,
    "",
    "Thanks for confirming your subscription. You're all set to receive the best of Sauraha & Chitwan straight to your inbox.",
    "",
    "Here's what to expect:",
    "- Practical travel tips & seasonal guides for Chitwan National Park",
    "- New hotels, restaurants, and tour guides worth knowing about",
    "- Wildlife, culture, and things to do around Sauraha",
    "",
    `Read our latest guides: ${SITE_URL}/blog`,
    "",
    "Have a question or a place we should feature? Just reply to this email.",
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
    PHYSICAL_ADDRESS,
  ].join("\n")

  return {
    subject: "Welcome to Sauraha Nepal 🎉",
    html,
    text,
  }
}
