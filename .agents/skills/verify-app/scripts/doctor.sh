#!/usr/bin/env bash
# Read-only health check. Changes nothing.
source "$(dirname "$0")/common.sh"
set +e
echo "node      $(node -v)"
echo "npm       $(npm -v)"
echo "next      $(node -p 'require("next/package.json").version' 2>/dev/null || echo 'not installed')"
echo "wrangler  $(npx wrangler --version 2>/dev/null | tail -1)"
echo "opennext  $(node -p 'require("./node_modules/@opennextjs/cloudflare/package.json").version' 2>/dev/null || echo 'not installed')"
echo; echo "== local D1 migrations"
if [ -d .wrangler/state ]; then npx wrangler d1 migrations list DB --local 2>&1 | tail -6; else echo "no local D1 yet (.wrangler/state missing): run launch.sh"; fi
echo; echo "== row counts"
for q in "factories:SELECT COUNT(*) FROM factories" "reviews:SELECT COUNT(*) FROM reviews" \
         "published:SELECT COUNT(*) FROM reviews WHERE published = 1" "editors_pick:SELECT COUNT(*) FROM reviews WHERE editors_pick = 1"; do
  printf '%-13s %s\n' "${q%%:*}" "$(d1_scalar "${q#*:}" 2>/dev/null || echo '?')"
done
echo; echo "== dev server"
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then echo "pid $(cat "$PID_FILE") alive"; else echo "not started by launch.sh"; fi
echo "GET $BASE/ -> $(curl -s -o /dev/null -w '%{http_code}' "$BASE/" 2>/dev/null || echo down)"
exit 0
