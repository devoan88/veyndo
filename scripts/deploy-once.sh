#!/usr/bin/env bash
# ONE production deploy. Run only after Netlify credits reset (2026-10-29)
# or after Ani upgrades. Do not run while next dev is open.
set -euo pipefail
export PATH="$HOME/.local/node/bin:$HOME/.local/bin:$PATH"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if pgrep -fl "next dev" >/dev/null 2>&1; then
  echo "REFUSE: next dev is running. Stop it, then run this script."
  exit 1
fi
if lsof -nP -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "REFUSE: something is listening on port 3000 (likely next dev)."
  exit 1
fi

TMP="$(mktemp -d /tmp/veyndo-deploy.XXXXXX)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

# Copy the project without local secrets. Keep .netlify/state.json so CLI
# still targets site d73d0957-8c4a-4b04-b2ca-bd75b515892b.
rsync -a \
  --exclude '.env' \
  --exclude '.env.*' \
  --exclude '**/.env' \
  --exclude '**/.env.*' \
  --exclude 'web/.next' \
  --exclude 'web/node_modules' \
  --exclude 'node_modules' \
  --exclude '.git' \
  "$ROOT/" "$TMP/"

echo "Copied to $TMP (no .env.local)."
cd "$TMP"

npx -y netlify-cli@latest deploy --build --prod

echo
echo "==== HTTP ===="
for p in / /start /preise /p/beispiel-friseur; do
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 25 -I "https://veyndo-app.netlify.app$p" || echo "000")"
  echo "$p $code"
done

echo
echo "==== FORMS ===="
npx -y netlify-cli@latest api listSiteForms --data '{"site_id":"d73d0957-8c4a-4b04-b2ca-bd75b515892b"}'
