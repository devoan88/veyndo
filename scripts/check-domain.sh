#!/usr/bin/env bash
# Read-only check: nic.at WHOIS + public DNS + HTTPS for veyndo.at
set -euo pipefail
export PATH="$HOME/.local/node/bin:$HOME/.local/bin:$PATH"

echo "==== WHOIS nic.at veyndo.at ===="
whois_out="$(whois -h whois.nic.at veyndo.at 2>/dev/null || true)"
printf '%s\n' "$whois_out"
echo
if printf '%s' "$whois_out" | grep -qiE 'nothing found|not found|^% No match'; then
  echo "registered: no"
elif printf '%s' "$whois_out" | grep -qiE '^domain:[[:space:]]*veyndo\.at|nserver:|registrant:'; then
  echo "registered: yes"
else
  # nic.at often returns only % comments when unpublished
  if [ -z "$(printf '%s' "$whois_out" | grep -v '^%' | grep -v '^[[:space:]]*$')" ]; then
    echo "registered: no"
  else
    echo "registered: unknown (see WHOIS above)"
  fi
fi

echo
echo "==== DNS ===="
echo -n "veyndo.at A: "
dig +short veyndo.at A || true
echo -n "www.veyndo.at CNAME: "
dig +short www.veyndo.at CNAME || true

echo
echo "==== HTTPS ===="
for url in "https://veyndo.at" "https://www.veyndo.at"; do
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$url" 2>/dev/null || true)"
  if [ -z "$code" ]; then code=000; fi
  echo "$url $code"
done
