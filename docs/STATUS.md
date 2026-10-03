# Veyndo status — 3 Oct 2026 (evening)

## STEP 0

- `marketing/` in git (`c3149c5`). `.gitignore` covers `.env*`, `.netlify`, `supabase/.temp/`, `web/.next`.

## STEP 1 — credits

- API: Free, `usages_exceeded=[]`, `credits used 0/300`, next period **2026-10-29**, `grace_topup` 2026-10-02.
- **Production deploy still Forbidden** (`JSONHTTPError: Forbidden`). Treat as credit/account block. No second deploy attempted.

## STEP 2 — DNS

- `whois.nic.at veyndo.at` → **nothing found** (not in the registry yet).
- `host @8.8.8.8` → **NXDOMAIN**. No A / www CNAME.
- Gmail: only order `20261003-sbs8z`; **no CloudPit / DNS-ready mail**.
- Netlify already has `custom_domain=veyndo.at` + alias `www.veyndo.at` (unchanged). `ssl=false`.
- **Cannot set records until nic.at/easyname finish Prüfung.** After that, easyname DNS:
  - A `@` → `75.2.60.5`
  - CNAME `www` → `veyndo-app.netlify.app`
  - keep MX

## STEP 3 — URLs (done except Auth UI)

- Netlify `NEXT_PUBLIC_SITE_URL=https://veyndo.at` (production). Needs a successful prod deploy to appear on the live site.
- Stripe TEST webhook created: `we_1UMaAsDIUjwz68ElsLDeD6s4` → `https://veyndo.at/api/stripe/webhook` (same events as docs). Signing secret stored in Netlify `STRIPE_WEBHOOK_SECRET` (`--secret`). Existing netlify.app webhook left in place.
- Code: no `veyndo-app.netlify.app` in `web/src`. `PROFILE_DOMAIN` stays `veyndo.at`. Contact form URL → `https://veyndo.at/#kontakt`. Impressum/Datenschutz still on `veyndo-at.netlify.app` (those HTML files are not in this app).
- **Supabase Auth Site URL** not changed via API (no MCP tool). Ani must set in dashboard (see report).

## STEP 4 — deploy

- `next dev` was off.
- `netlify deploy --build --prod` → **Forbidden**. Live **veyndo-app.netlify.app**: `/` `/start` `/preise` `/p/beispiel-friseur` all **200** (previous build).
- `listSiteForms` → `[]`. Form notification not created (no form id). No test submission sent.

## STEP 5 — GitHub

- Secret scan: no live key values in history.
- `gh` 2.102.0 installed at `~/.local/bin/gh`. **Not logged in.** GitHub.com shows Sign in (no session). Public repo **not** created.

## Commits this session (app)

- `4035383` README EN/DE + contact URL
- plus STATUS updates
