import sharp from "sharp"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const out = path.join(root, "public", "og-image.jpg")

const W = 1200
const H = 630

const hero = path.join(root, "public", "images", "jungle-safari-sauraha.png")
const logo = path.join(root, "public", "one.png")

const background = await sharp(hero)
  .resize(W, H, { fit: "cover", position: "center" })
  .toBuffer()

const logoSize = 112
const logoRadius = logoSize / 2

const logoBuffer = await sharp(logo)
  .resize(logoSize, logoSize, { fit: "cover" })
  .png()
  .toBuffer()

const logoMask = Buffer.from(
  `<svg width="${logoSize}" height="${logoSize}"><circle cx="${logoRadius}" cy="${logoRadius}" r="${logoRadius}" fill="white"/></svg>`,
)

const circularLogo = await sharp(logoBuffer)
  .composite([{ input: logoMask, blend: "dest-in" }])
  .png()
  .toBuffer()

const logoRing = Buffer.from(
  `<svg width="${logoSize + 8}" height="${logoSize + 8}"><circle cx="${(logoSize + 8) / 2}" cy="${(logoSize + 8) / 2}" r="${logoRadius + 2}" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="4"/></svg>`,
)

const logoLeft = 72
const logoTop = Math.round((H - logoSize) / 2) - 64
const textX = logoLeft + logoSize + 32

const overlaySvg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0d2818" stop-opacity="0.2"/>
      <stop offset="50%" stop-color="#0d2818" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#1a5c2a" stop-opacity="0.94"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#shade)"/>
  <text x="${textX}" y="${logoTop + 48}" font-family="Georgia, 'Times New Roman', serif" font-size="56" font-weight="700" fill="#ffffff">Sauraha Nepal</text>
  <text x="${textX}" y="${logoTop + 92}" font-family="system-ui, -apple-system, sans-serif" font-size="23" font-weight="600" fill="#ffffff" fill-opacity="0.95">Your gateway to Chitwan National Park</text>
  <text x="${textX}" y="${logoTop + 132}" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="500" fill="#ffffff" fill-opacity="0.88">Hotels · Restaurants · Jungle Safari · Tour Guides</text>
  <text x="${W - 72}" y="${H - 44}" font-family="system-ui, -apple-system, sans-serif" font-size="17" font-weight="600" fill="#ffffff" fill-opacity="0.78" text-anchor="end">saurahanepal.com</text>
</svg>`)

await sharp(background)
  .composite([
    { input: overlaySvg, top: 0, left: 0 },
    { input: circularLogo, top: logoTop, left: logoLeft },
    { input: logoRing, top: logoTop - 4, left: logoLeft - 4 },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(out)

const meta = await sharp(out).metadata()
console.log(`Wrote ${out} (${meta.width}x${meta.height})`)
