# Veyndo status — 4 Oct 2026 (morning)

## STEP 0

- `marketing/` in git (`c3149c5`). `.gitignore` covers `.env*`, `.netlify`, `supabase/.temp/`, `web/.next`.

## GitHub

- CLI logged in as `devoan88` (keyring). Public repo create was interrupted; push still pending.

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
- Smoke (`scripts/smoke.sh` vs http://localhost:3000): all **200**.

### [OFFEN: …]

- `[OFFEN: Geschäfts-E-Mail, z. B. hallo@veyndo.at]` (Impressum + Datenschutz)
- `[OFFEN: Gewerbewortlaut + GISA-Zahl nach Anmeldung]`
- `[OFFEN: Aufbewahrungsfrist in Monaten]` (Anfragen)
- `[OFFEN: Aufbewahrungsfrist für Aufrufstatistiken]` (events)

## Older notes

- Production URL https://veyndo-app.netlify.app still older/restored build until 29 Oct.
- Stripe TEST webhook `we_1UMaAsDIUjwz68ElsLDeD6s4`.
