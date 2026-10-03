# Veyndo status — 3 Oct 2026 (evening)

## STEP 0

- `marketing/` in git (`c3149c5`). `.gitignore` covers `.env*`, `.netlify`, `supabase/.temp/`, `web/.next`.

## STEP 1 — credits

- API: Free, `usages_exceeded=[]`, `credits used 0/300`, next period **2026-10-29**, `grace_topup` 2026-10-02.
- **Production deploy still Forbidden** (`JSONHTTPError: Forbidden`). Treat as credit/account block. No second deploy attempted.

## STEP 2 — DNS

- `whois.nic.at veyndo.at` → still **nothing found**. `dig` A empty. nic.at RDAP 500.
- Gmail: only order `20261003-sbs8z` (Prüfung). No CloudPit login mail.
- CloudPit “forgot username” for `anidevdariani1997@gmail.com` → generic “if the address exists…”. No new mail. Account not created until Prüfung ends.
- `createDnsZone veyndo.at` → Netlify **Internal Server Error** (zone cannot be created before the domain exists). `getDnsZones` = `[]`.
- Netlify still: `custom_domain=veyndo.at`, alias `www.veyndo.at`, `ssl=false`.
- After nic.at/easyname finish Prüfung, in CloudPit DNS:
  - A `@` → `75.2.60.5`
  - CNAME `www` → `veyndo-app.netlify.app`
  - keep MX

## STEP 3 — URLs (done except Auth UI)

- Netlify `NEXT_PUBLIC_SITE_URL=https://veyndo.at` (production). Needs a successful prod deploy to appear on the live site.
- Stripe TEST webhook created: `we_1UMaAsDIUjwz68ElsLDeD6s4` → `https://veyndo.at/api/stripe/webhook` (same events as docs). Signing secret stored in Netlify `STRIPE_WEBHOOK_SECRET` (`--secret`). Existing netlify.app webhook left in place.
- Code: no `veyndo-app.netlify.app` in `web/src`. `PROFILE_DOMAIN` stays `veyndo.at`. Contact form URL → `https://veyndo.at/#kontakt`. Impressum/Datenschutz still on `veyndo-at.netlify.app` (those HTML files are not in this app).
- **Supabase Auth Site URL** not changed via API (no MCP tool). Ani must set in dashboard (see report).

## STEP 4 — deploy

- `--prod` rebuild still Forbidden (300 prod credits used). Draft was already live: https://step4-draft--veyndo-app.netlify.app
- **Workaround that worked:** `restoreSiteDeploy` of `6ac17489e4bf169496470b2e` (rollback-style publish, no new build). `published_at` 2026-10-03T21:43:16Z.
- **Production now that build:** https://veyndo-app.netlify.app — `/` `/start` `/preise` `/p/beispiel-friseur` = **200**. Title “Veyndo – Ihre Seite, persönlich für Sie gebaut”.
- `veyndo.at` still has no DNS, so the custom hostname is not reachable yet.
- `listSiteForms` still `[]`.

## STEP 5 — GitHub

- Secret scan: no live key values in history.
- `gh` 2.102.0 installed at `~/.local/bin/gh`. **Not logged in.** GitHub.com shows Sign in (no session). Public repo **not** created.

## Commits this session (app)

- `4035383` README EN/DE + contact URL
- plus STATUS updates
