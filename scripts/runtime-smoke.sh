#!/usr/bin/env bash
set -euo pipefail

app_url="${1:?application URL is required}"
out_dir="${2:-runtime-evidence}"
mkdir -p "$out_dir"

check_json() {
  local name="$1"
  local url="$2"
  local code
  code="$(curl --silent --show-error --max-time 30 \
    --output "$out_dir/$name.json" --write-out "%{http_code}" "$url")"
  test "$code" = "200"
  jq -e '.status == "ok"' "$out_dir/$name.json" >/dev/null
}

check_json health "$app_url/api/health"
check_json readiness "$app_url/api/readiness"

host="${app_url#https://}"
host="${host%%/*}"
redirect_code="$(curl --silent --output /dev/null --write-out "%{http_code}" \
  --max-time 30 "http://$host/api/health")"
case "$redirect_code" in
  301|302|307|308) ;;
  *) echo "Expected HTTP-to-HTTPS redirect, got $redirect_code" >&2; exit 1 ;;
esac

printf 'PASS health\nPASS readiness\nPASS http-redirect\n' > "$out_dir/smoke-status.txt"
