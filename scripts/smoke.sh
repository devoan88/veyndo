#!/usr/bin/env bash
# Local HTTP smoke check. Default: http://localhost:3000
set -euo pipefail
export PATH="$HOME/.local/node/bin:$HOME/.local/bin:$PATH"

BASE="${1:-http://localhost:3000}"
fail=0
paths="/ /start /preise /impressum /datenschutz /p/beispiel-friseur /sitemap.xml /robots.txt"

echo "base: $BASE"
for p in $paths; do
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 25 "$BASE$p" || echo "000")"
  echo "$p $code"
  if [ "$code" != "200" ]; then
    fail=1
  fi
done

if [ "$fail" -ne 0 ]; then
  echo "smoke: FAIL"
  exit 1
fi
echo "smoke: OK"
