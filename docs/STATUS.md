# Veyndo status — 4 Oct 2026 (morning)

## STEP 0

- `marketing/` in git (`c3149c5`). `.gitignore` covers `.env*`, `.netlify`, `supabase/.temp/`, `web/.next`.

## GitHub

- Public repo: https://github.com/devoan88/veyndo (`master` pushed).

## Domain

- nic.at still unpublished at last check. Runbook: `docs/DOMAIN.md`. No DNS by agent.

## Deploy

- **No** `netlify deploy` / restore. Next prod: **2026-10-29** or Upgrade.

## Task 3 — legal / smoke (local)

- `/impressum`, `/datenschutz` live on localhost. Footer links on `/`, `/preise`, `/start`, `/p/[slug]`.
- Fonts: self-hosted `web/public/fonts` (Figtree, Newsreader). No Google Fonts CDN.
- Unsplash: still hotlinked from `images.unsplash.com` (landing, demo, beispiel-*). Documented in Datenschutz.
- First-party `/api/events` (view/call/whatsapp/route/qr) exists — reported, not removed.
- Migration **not applied** remotely: `supabase/migrations/20261004_service_requests_handled_at.sql`
- Retention **applied** remotely: `retention_cleanup` + cron `veyndo-retention` daily 03:15. Preview counts were 0/0/0. See `docs/RETENTION.md`.
- **Reminder:** Netlify Forms `demo-request` are **not** in SQL. After 12 months delete them by hand (Netlify → Forms → demo-request).
- Smoke (`scripts/smoke.sh` vs http://localhost:3000): all **200**.

### [OFFEN: …]

- `[OFFEN: Geschäfts-E-Mail, z. B. hallo@veyndo.at]` (Impressum + Datenschutz)
- `[OFFEN: Gewerbewortlaut + GISA-Zahl nach Anmeldung]`
- `[OFFEN: welche Uhr]` for anonymous-demo inactivity (`last_sign_in_at` vs `updated_at`) — see `docs/RETENTION.md`

## Older notes

- Production URL https://veyndo-app.netlify.app still older/restored build until 29 Oct.
- Stripe TEST webhook `we_1UMaAsDIUjwz68ElsLDeD6s4`.
