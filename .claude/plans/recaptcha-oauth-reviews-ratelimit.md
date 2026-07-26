# Plan: reCAPTCHA v3, Google OAuth + gated reviews, and Upstash rate limiting

## Context

Sauraha Nepal's public submission endpoints (guide listing, business listing, guide
reviews) currently accept anonymous writes through the service-role Supabase client with
**no bot protection and no durable rate limiting**. A recent migration
(`20260721104031_drop_anon_insert_on_guide_reviews.sql`) already flagged reviews as a spam
vector into the `/admin` moderation queue. We want to:

1. Add **Google reCAPTCHA v3** to both listing submissions and review submissions.
2. Add **Google OAuth sign-in/up** (the app has *no* end-user auth today — only cookie-password
   gates for `/admin` and `/team`) and require sign-in before submitting **any** review. Add a
   **business review** feature mirroring the existing guide reviews.
3. Add **durable rate limiting (Upstash Redis)** across public mutation routes, surfacing a
   **toast** ("try again later") on HTTP 429.

Confirmed decisions: env vars are `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` + `RECAPTCHA_SECRET_KEY`
(already in Vercel); dedicated `/signin` page **plus** navbar sign-in/avatar; Upstash Redis for
rate limiting; **both** guide and business reviews become sign-in-only.

Stack facts: Next.js **16.2.6** App Router, React 19, `@supabase/supabase-js` only (no
`@supabase/ssr` yet). AGENTS.md warns this is a modified Next.js — **implementation must consult
`node_modules/next/dist/docs/` for route-handler, middleware, and `cookies()` APIs before writing
code**, not assume Next 14/15 behavior.

There is a fully-reverted prior implementation in git commit `7db48da` (reverted by `5b9cf11`)
containing reusable patterns: `lib/verify-recaptcha.ts`, `lib/use-recaptcha-token.ts`,
`components/RecaptchaProvider.tsx`, `lib/api-security.ts`, `lib/security-messages.ts`. Recover these
via `git show 7db48da:<path>` — reuse verbatim where they fit (the reCAPTCHA verify + client hook
are directly reusable; the rate-limit module must be replaced with Upstash).

---

## Prerequisites (manual — user must do; not code)

- **Google Cloud**: OAuth consent screen + OAuth client credentials (client ID/secret).
- **Supabase dashboard**: enable the **Google** auth provider, paste client ID/secret, and add
  redirect URLs (site `…/auth/callback` and the Supabase-hosted callback).
- **reCAPTCHA**: confirm the v3 site is registered for the production + preview domains (keys already
  in Vercel per user).
- **Upstash**: create a Redis database; add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
  to Vercel (all environments) and `.env.local`.
- Add all new keys to `.env.example`.

New npm packages: `@supabase/ssr`, `@upstash/ratelimit`, `@upstash/redis`. (reCAPTCHA client uses the
manual `RecaptchaProvider` script loader — **not** `@next/third-parties`, which has no reCAPTCHA helper.)

---

## Part A — reCAPTCHA v3 on listing + review submissions

**Server helper** — restore `lib/verify-recaptcha.ts` from `7db48da` (fetches
`https://www.google.com/recaptcha/api/siteverify`, requires `success && score >= 0.5`, returns a
friendly error string). Keep the threshold at 0.5.

**Client** — restore `components/RecaptchaProvider.tsx` (loads the v3 script with the site key via
`next/script`) and mount it once in `app/layout.tsx`. Restore `lib/use-recaptcha-token.ts`
(`grecaptcha.execute(siteKey, { action })` → token). If `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is unset,
the hook returns `null` and routes should treat verification as skipped (so local dev without keys
still works) — but log a warning.

**Wire into the 3 submit routes** — in each of `app/api/list-guide/route.ts`,
`app/api/list-business/route.ts`, `app/api/guide-reviews/submit/route.ts` (and the new business
review route), read a `recaptchaToken` field from the JSON body, call `verifyRecaptcha(token)` **after
JSON parse / before the Supabase insert**, and return `400`/`403` with the friendly error on failure.

**Wire into the 3 client forms** — in `components/ListGuideForm.tsx`,
`components/ListBusinessForm.tsx`, and the `GuideReviewForm` inside
`components/guides/GuideReviewsSection.tsx` (plus the new business review form), call the token hook in
the submit handler and add `recaptchaToken` to the `fetch` JSON body.

---

## Part B — Google OAuth + sign-in-gated reviews + business reviews

### B1. Auth plumbing (net-new)
- Add `@supabase/ssr`. Create cookie-aware clients:
  - `lib/supabase/browser.ts` — `createBrowserClient` (for the sign-in button + client review forms
    to read session/user).
  - `lib/supabase/auth-server.ts` — `createServerClient` bound to `cookies()` for reading the session
    inside server components and route handlers. **Do not** collide with the existing service-role
    `lib/supabase/server.ts`; keep service-role for admin inserts.
- **`middleware.ts`**: add Supabase `updateSession` (cookie refresh) **alongside** the existing
  admin/team cookie checks, and broaden the `matcher` to run on general pages so sessions refresh.
  Verify middleware/cookie API against the vendored Next docs first.
- **`app/auth/callback/route.ts`**: OAuth code-exchange handler
  (`exchangeCodeForSession`) that redirects back to the originating page (`?next=` param).

### B1b. `profiles` table (net-new — required by soft-delete, editable fields & "My Reviews")
- New table **`profiles`**: `id uuid PK references auth.users(id) on delete cascade`, `display_name text`,
  `country text`, `avatar_url text`, `email text`, `deleted_at timestamptz` (soft-delete flag),
  `created_at`, `updated_at`. RLS: a user can `select`/`update` **only their own** row
  (`auth.uid() = id`) — the first `auth.uid()` policies in this codebase.
- A DB trigger on `auth.users` insert (`handle_new_user`) upserts a `profiles` row seeded from Google
  metadata (`raw_user_meta_data` → name, email, avatar). This is the canonical Supabase pattern.

### B2. Sign-in surface (split-screen design — ref image 1, adapted to brand)
- `app/(site)/signin/page.tsx` — **split-screen** layout mirroring the reference: left panel uses the
  brand green (`bg-green-brand`/`green-mid`, not the reference teal) with a **"Welcome"** heading and a
  single **"Continue with Google"** button (no email/password/remember-me/forgot-password — OAuth only).
  Right panel is the optimized jungle feature image (see Image handling below), full-bleed. Responsive:
  stacks to a single column on mobile (image top or hidden). Button calls
  `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: …/auth/callback?next=… }})`.
  Accept a `?next=` query param so review gating can bounce users here and back. If already signed in,
  redirect to `/account`.
- `components/auth/UserMenu.tsx` (client) — in `components/Navbar.tsx` at the right-side action cluster
  (line ~136) and the mobile drawer: show **"Sign in"** when logged out, avatar + dropdown (**Profile** →
  `/account`, **Sign out**) when logged in. Sign-out calls `supabase.auth.signOut()` + `router.refresh()`.

### B2b. Profile area (`/account`) — greenish dashboard shell (ref image 2, adapted)
- `app/(site)/account/layout.tsx` — a **sidebar dashboard shell** matching the greenish reference
  (dark sidebar, brand-green active state): top user block (avatar + name + "Member"), nav items
  **Profile** and **My Reviews** (the reference "Dashboard" item is renamed to **Profile** per request).
  Server-guard: redirect to `/signin?next=/account` if no session. Adapt colors to brand tokens; do
  **not** copy the fintech nav items (Trades/Portfolio/Wallet/Payouts).
- `app/(site)/account/page.tsx` — **Profile** panel: Google-connected banner ("This account is
  connected to your Google account", ref image 3), avatar + email shown **read-only** (managed by
  Google), **editable** `display_name` + `country` (used as the reviewer identity on new reviews),
  Save via a small route/action updating the user's `profiles` row. **No "Change Password" tab**
  (OAuth has no password). Include the **Danger Zone** (see B2c).
- `app/(site)/account/reviews/page.tsx` — **My Reviews**: lists the signed-in user's guide + business
  reviews (join `guide_reviews`/`business_reviews` on `user_id`) with their moderation status.

### B2c. Account deletion — **soft delete only** (no hard delete)
- Danger Zone "Delete account" with an explicit confirm step calls a new
  `app/api/account/delete/route.ts` that (service-role): sets `profiles.deleted_at = now()`, sets the
  user's own `guide_reviews`/`business_reviews` to a non-public status (e.g. `status='removed'`) so the
  rating triggers recompute aggregates, then signs the user out. **No rows are physically deleted** and
  the `auth.users` record is **not** removed.
- Re-login guard: the OAuth callback / middleware checks `profiles.deleted_at`; if set, sign the user
  straight back out and show a "This account was deactivated" notice (decide reactivation later — default
  is blocked, not auto-reactivated).

### B3. Gate reviews behind auth (both guide + business)
- Reviews keep going through the **service-role insert route** (preserves the pending-moderation
  queue), but the route now **requires a valid Supabase session**: read the user via the cookie-bound
  server client; if none → `401`. Store `user_id` on the row and denormalize the reviewer display
  name/country from the user's `profiles` row (falling back to Google metadata).
- Client review forms: if no session, replace the form with a "Sign in to leave a review" prompt
  linking to `/signin?next=<current path>`. Only render the form (and run reCAPTCHA) when signed in.
- Anti-duplicate: unique constraint on `(user_id, guide_id)` / `(user_id, business_id)` so each user
  reviews a given entity once; route returns a friendly `409`.

### B4. Business reviews (mirror guides)
- New table **`business_reviews`** mirroring `guide_reviews` (see Migrations) with `business_id` FK,
  `user_id`, rating 1–5, comment, `status default 'pending'`; add `avg_rating` + `review_count`
  columns to `business_listings` and a trigger mirroring `update_guide_rating()`.
- New route `app/api/business-reviews/submit/route.ts` — clone of the guide review route (auth check +
  reCAPTCHA + service-role insert + Resend admin notification; reuse an emails helper mirroring
  `lib/emails/guide-review`).
- New display/form component `components/businesses/BusinessReviewsSection.tsx` mirroring
  `components/guides/GuideReviewsSection.tsx`; render it on the business detail page
  (`app/(site)/listings/[id]/page.tsx`) and fetch approved rows via a `fetchApprovedBusinessReviews`
  helper mirroring `fetchApprovedGuideReviews` in `lib/tour-guides.ts`.
- Admin moderation: extend the existing `/admin` reviews moderation to include `business_reviews`
  (find the current guide-review moderation UI/route under `app/admin/**` and mirror it).

---

## Part C — Upstash rate limiting + toast

- `lib/rate-limit.ts` (replace the reverted in-memory version with Upstash): export a helper built on
  `@upstash/ratelimit` + `@upstash/redis` (sliding window, keyed by client IP via the existing
  `getClientIp` from `lib/chat-rate-limit.ts`). Provide per-route limiter configs (e.g. reviews &
  listings ~5/min & ~20/hour; tune later). If Upstash env vars are missing, fail **open** with a
  logged warning so local dev is unaffected.
- Apply the limiter at the top of each public mutation route: `list-guide`, `list-business`,
  `guide-reviews/submit`, `business-reviews/submit`. On block, return **HTTP 429** with
  `{ error, retryAfter }`. Optionally migrate `app/api/chat/route.ts` off its bespoke in-memory
  limiter onto the shared one.
- **Toast system** (none exists; codebase hand-rolls Tailwind): add a minimal
  `components/ui/ToastProvider.tsx` (context + `useToast()`) and a `Toast` component styled with the
  existing tokens (`bg-orange-brand/10`, `border-border-brand`, reuse the `fade-up` keyframe in
  `app/globals.css`). Mount the provider in `app/layout.tsx`.
- Client forms: when a `fetch` returns **429**, call `toast(...)` with "You're doing that too fast —
  please try again in a moment." Keep existing inline `role="alert"` for validation errors.

---

## Migrations (new files in `supabase/migrations/`)

1. `…_profiles.sql` — create `profiles` (`id` → `auth.users`, `display_name`, `country`, `avatar_url`,
   `email`, `deleted_at`, timestamps); RLS: owner-only `select`/`update` (`auth.uid() = id`); trigger
   `handle_new_user` on `auth.users` insert to seed a profile row from Google metadata.
2. `…_guide_reviews_user_id.sql` — add `user_id uuid references auth.users` + unique `(user_id, guide_id)`
   to `guide_reviews`. (Insert still via service role.) Note: `update_guide_rating()` already recomputes
   aggregates on any status change, so soft-delete's `status='removed'` update recomputes correctly.
3. `…_business_reviews.sql` — create `business_reviews` (mirror `guide_reviews` incl. `user_id` + unique
   `(user_id, business_id)`), add `avg_rating` + `review_count` to `business_listings`, create
   `update_business_rating()` trigger, RLS: public `select` where `status='approved'` (mirroring the
   guide policy). No anon insert policy (writes via service role only, matching `20260721104031`).

Apply via Supabase migration tooling; verify with `list_tables` / `list_migrations` before and after.
**Google provider must be enabled in the Supabase dashboard before the `auth.users` trigger is useful.**

---

## Image handling (sign-in feature image)

- Source: `/Users/sj/Dev/Projects/SaurahaNepal/sauraha-jungle-login-page-feature-image.avif` (2070×1380,
  ~745 KB). Copy into `public/images/` and generate optimized web-scaled variants using the existing
  `lib/compress-image.ts` / `sharp` tooling (target a responsive AVIF/WebP, e.g. ~1400px wide). Serve via
  `next/image` (respecting the project's modified Next — check the vendored image docs) with priority load
  on `/signin`. Ask the user only if a materially larger/original crop is needed (current res is ample).

---

## Key files

**Add**: `lib/verify-recaptcha.ts`, `lib/use-recaptcha-token.ts`, `components/RecaptchaProvider.tsx`
(restore from `7db48da`); `lib/rate-limit.ts` (Upstash); `lib/supabase/browser.ts`,
`lib/supabase/auth-server.ts`; `app/auth/callback/route.ts`; `app/(site)/signin/page.tsx`
(split-screen); `app/(site)/account/{layout,page}.tsx` + `app/(site)/account/reviews/page.tsx`;
`app/api/account/{update,delete}/route.ts`; `components/auth/UserMenu.tsx`;
`components/account/*` (sidebar shell, profile form, danger zone); `components/ui/ToastProvider.tsx`;
`components/businesses/BusinessReviewsSection.tsx`; `app/api/business-reviews/submit/route.ts`;
`lib/profiles.ts`; three migrations; a business-review email helper; optimized feature image in
`public/images/`.

**Modify**: `app/layout.tsx` (mount RecaptchaProvider + ToastProvider); `middleware.ts` (session refresh
+ soft-delete guard); `components/Navbar.tsx` + `components/MobileBottomNav.tsx` (UserMenu); the 3
existing submit routes; `components/ListGuideForm.tsx`, `components/ListBusinessForm.tsx`,
`components/guides/GuideReviewsSection.tsx`; `app/(site)/listings/[id]/page.tsx`; `lib/tour-guides.ts`
(or a new `lib/business-reviews.ts`); `.env.example`; admin review-moderation UI/route.

---

## Cross-cutting requirements

- **Mobile-first & responsive**: every new/changed UI (split-screen `/signin`, the `/account` sidebar
  shell + panels, `UserMenu` in navbar & mobile drawer, business reviews section, toasts) must be fully
  responsive. Sidebar collapses/drawers on mobile; split-screen stacks to one column; touch targets and
  spacing follow the existing Tailwind patterns. Verify at ~375px, ~768px, and desktop widths.

## Workflow & constraints (per user)

- **Branch off fresh `main`**: before any code, `git checkout main && git pull` then create a new
  feature branch. Do **not** build on the current `perf/social-images-and-weather-decoupling` branch.
- **Commit categorically**: group work into logical, self-contained commits (e.g. `feat: auth plumbing`,
  `feat: signin page`, `feat: profile + soft-delete`, `feat: business reviews`, `feat: recaptcha`,
  `feat: upstash rate limiting + toast`, migrations separate) — not one giant commit.
- **Always ask before `git commit` and before `git push`.**
- **Never delete anything (files, data, rows, columns) without explicit consent.** Soft-delete only.
- Vercel MCP is now reauthorized by the user — env vars can be read/verified via MCP during implementation.

## Verification

1. `npm run dev`; `npm run build` and `npm run lint` must pass.
2. **reCAPTCHA**: submit each form → confirm `verifyRecaptcha` runs (temporarily log score); a request
   with a missing/garbage token is rejected `400/403`.
3. **OAuth + profile**: `/signin` split-screen renders (feature image + brand-green panel); "Continue
   with Google" → consent → back signed in; a `profiles` row was auto-created from Google metadata;
   navbar shows avatar + Profile/Sign-out; refresh persists session. `/account` shows the sidebar shell,
   Google-connected read-only email, editable display-name/country that saves, and "My Reviews".
4. **Soft delete**: Danger Zone "Delete account" → confirm → signed out; `profiles.deleted_at` set, the
   user's reviews flipped to `removed` (aggregates recomputed), rows still present in DB; signing in
   again shows the "deactivated" notice and does not restore access.
5. **Gated reviews**: signed-out users see the sign-in prompt (no form); after sign-in, submit a guide
   and a business review → row lands `status='pending'` with `user_id`; second attempt on same entity
   → `409`; approving in `/admin` recomputes `avg_rating`/`review_count` (trigger) on both entities.
6. **Rate limiting**: exceed the limit on a submit route → HTTP 429 and the toast appears; verify the
   limit is shared/durable (Upstash key visible) not per-instance.
7. Re-run Supabase `get_advisors` (security/perf) after migrations.
