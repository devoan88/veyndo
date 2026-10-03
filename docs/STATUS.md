# Veyndo status — 3 Oct 2026 (night)

## STEP 0

- `marketing/` in git (`c3149c5`). `.gitignore` covers `.env*`, `.netlify`, `supabase/.temp/`, `web/.next`.

## GitHub (this task STEP 1)

- `gh auth status` → **not logged in**. Repo **not** created (waiting for Ani: `~/.local/bin/gh auth login --web` + Authorize).
- Secret scan `git log -p --all` with value pattern (`sk_/rk_/rkcs_/whsec_/eyJhbGciOi` + 16+ chars): **value_hits 0**. Doc/prefix mentions of `sk_test_` / `service_role` remain; no push.

## Domain (this task STEP 2)

- `scripts/check-domain.sh` run once: nic.at **% nothing found**, `registered: no`, A empty, www CNAME empty, `https://veyndo.at` and `https://www.veyndo.at` **000** (Could not resolve host).
- Runbook: `docs/DOMAIN.md`. No DNS records written by agent. No CloudPit login/password.

## Supabase (this task STEP 3)

- Agent cannot change Auth URL Configuration (no API tool). Ani must add redirects in dashboard (see report). Site URL unchanged until veyndo.at resolves.

## Deploy (this task STEP 4 — script only, not executed)

- **No** `netlify deploy`, **no** `restoreSiteDeploy`. Next prod deploy: **2026-10-29** or after Ani upgrades.
- `scripts/deploy-once.sh` + `docs/DEPLOY.md`. Form `demo-request` in `web/public/__forms.html`. Detection already `ignore_html_forms=false`.

## Admin (this task STEP 5)

- `/admin` already lists `service_requests` newest first (name, slug, message, created_at) + Vorschau `/p/{slug}` (unpublished visible to admin via RLS `is_admin` + `viewerIsAdmin` in `p/[slug]/page.tsx`).
- `npx tsc --noEmit` OK after deleting Finder dupes in gitignored `web/.next/types/* 2.ts`. `npx next lint` ✔ no warnings. No deploy.

## Older notes

- Production still the restored draft on https://veyndo-app.netlify.app (do not repeat restore). Custom domain ssl=false until DNS.
- Stripe TEST webhook `we_1UMaAsDIUjwz68ElsLDeD6s4` → `https://veyndo.at/api/stripe/webhook`.
- `listSiteForms` was `[]`.

## Commits this session (app)

- `4035383` README EN/DE + contact URL
- STATUS / DOMAIN / DEPLOY / scripts (this task)
