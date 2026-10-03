# Veyndo status — 3 Oct 2026

## Done

- Git: `marketing/` committed (`c3149c5`) — flyer PDFs, `flyer-quellen/`, `Besuchsliste-Favoriten.csv`.
- `.gitignore` already covers `.env*`, `.netlify`, `supabase/.temp/`, `web/.next`.
- Netlify CLI logged in as `anidevdariani1997@gmail.com`, site `veyndo-app` (`d73d0957-8c4a-4b04-b2ca-bd75b515892b`).
- `getSite`: `custom_domain=veyndo.at`, alias `www.veyndo.at`. Not changed.
- Secret scan of `git log -p`: no `sk_live_` / `sk_test_<key>` / `rk_*` / `whsec_` / JWT `eyJhbGci` **values**. Hits are comments (`sk_test_`) and SQL role name `service_role`.
- `web/src` has no hard-coded `veyndo-app.netlify.app`. `PROFILE_DOMAIN` already `veyndo.at`.

## Blocked

### Netlify credits (STEP 1)

- Plan: Free (`credit-free`), `plan_credits=300`.
- `capabilities.credits.used=0`, `usages_exceeded=[]`, `sites_with_usage_exceeded=[]`.
- `grace_topup_granted_at=2026-10-02T10:40:22Z`.
- Next usage/billing period: **2026-10-29**.
- CLI does **not** currently show “Account credit usage exceeded”.
- **No production deploy run** this session (STEP 2 DNS not live; STEP 4 skipped).

### Domain DNS (STEP 2)

- `dig` / `host @8.8.8.8`: **NXDOMAIN** (no A, no www CNAME, no NS).
- `https://veyndo.at` / `www` did not connect (HTTP 000).
- `https://veyndo-app.netlify.app` → **200**.
- SSL on custom domain: `ssl=false`, `ssl_status=null` until DNS exists.
- **Waiting on Ani** to set easyname DNS (A `@` → `75.2.60.5`, CNAME `www` → `veyndo-app.netlify.app`, keep MX).

### URLs / Stripe / deploy (STEP 3–4)

- Skipped until DNS resolves.
- Netlify Forms API `listSiteForms` returned `[]` (form not listed). No test submission sent.
- Stripe MCP not authenticated; webhook for `veyndo.at` not added.

### GitHub portfolio (STEP 5)

- `gh` is **not installed** / not logged in. Public repo **not** created. Do not `gh auth login` for Ani.

## Next

1. Ani: easyname DNS as above; reply **მზადაა**.
2. Re-check DNS, then HTTPS, then env/Auth/Stripe TEST webhook, then **one** prod deploy if credits still clear.
3. Ani: install GitHub CLI and `gh auth login`, then push public `veyndo`.
4. Ani: Form notification email + one demo from her phone (no agent outreach).
