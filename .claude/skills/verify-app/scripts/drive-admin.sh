#!/usr/bin/env bash
# Drive /admin against the running dev server (launch.sh first, with ADMIN_PASSWORD + ADMIN_SESSION_SECRET in .dev.vars).
# 1) direct requests with no / a forged session: every admin page redirects, every write action answers 401, nothing is written;
# 2) per-IP login lockout; 3) the full browser flow in drive-admin.mjs (login, create, publish, reorder, unpublish, delete, logout).
# Exits non-zero if any assertion fails.
source "$(dirname "$0")/common.sh"
RUN="${RUN_ID:-admin-$(date -u +%Y%m%dT%H%M%SZ)}"; OUT="$EVID_ROOT/$RUN"; mkdir -p "$OUT"
LOG="$OUT/drive.log"; : > "$LOG"; FAIL=0
log() { echo "$*" | tee -a "$LOG"; }
ok() { log "  PASS  $*"; }; bad() { log "  FAIL  $*"; FAIL=1; }
counts() { echo "factories=$(d1_scalar "SELECT COUNT(*) FROM factories") reviews=$(d1_scalar "SELECT COUNT(*) FROM reviews") published=$(d1_scalar "SELECT COUNT(*) FROM reviews WHERE published=1") picks=$(d1_scalar "SELECT COUNT(*) FROM reviews WHERE editors_pick=1")"; }

ADMIN_PASSWORD="${ADMIN_PASSWORD:-$(sed -n 's/^ADMIN_PASSWORD=//p' .dev.vars 2>/dev/null | tail -1)}"
[ -n "$ADMIN_PASSWORD" ] || { log "ADMIN_PASSWORD missing: copy .dev.vars.example to .dev.vars, set it, and relaunch"; exit 2; }
ID=$(d1_scalar "SELECT id FROM factories ORDER BY id LIMIT 1")
FORGED="sf_admin_session=v1.9999999999999.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
BEFORE=$(counts); log "before: $BEFORE"

log "== admin pages without a valid session redirect to /admin/login"
for p in /admin /admin/factories/new "/admin/factories/$ID"; do
  for c in "" "$FORGED"; do
    R=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' ${c:+-H "Cookie: $c"} "$BASE$p"); log "GET $p ${c:+(forged cookie) }-> $R"
    [ "$R" = "307 $BASE/admin/login" ] && ok "$p ${c:+forged }-> login" || bad "$p ${c:+forged }-> $R"
  done
done

# Server action ids come from the dev build's manifest (the pages above compiled them).
MANIFEST=.next/dev/server/server-reference-manifest.json; [ -f "$MANIFEST" ] || MANIFEST=.next/server/server-reference-manifest.json
aid() { node -e 'const m=require(process.argv[1]);const e=Object.entries(m.node||{}).find(([,v])=>v.exportedName===process.argv[2]);console.log(e?e[0]:"")' "./$MANIFEST" "$1"; }
SAVE=$(aid saveFactory); DEL=$(aid deleteFactory); LOGIN=$(aid login)
log "action ids: saveFactory=$SAVE deleteFactory=$DEL login=$LOGIN"
[ -n "$SAVE" ] && [ -n "$DEL" ] && [ -n "$LOGIN" ] || bad "could not read server action ids from $MANIFEST"

log "== write actions without a valid session answer 401 (direct POSTs, no browser)"
post_save() { curl -s -o "$OUT/$1.txt" -w '%{http_code}' -X POST "$BASE$2" -H "Next-Action: $SAVE" -H "Accept: text/x-component" ${3:+-H "Cookie: $3"} \
  -F '0=[{},"$K1"]' -F "1_id=$4" -F '1_name=Intruder' -F '1_slug=intruder' -F '1_category=platform' -F '1_published=on' -F '1_editors_pick=on' \
  -F '1_overall_score=10' -F '1_score_autonomy=10' -F '1_score_quality=10' -F '1_score_speed=10' -F '1_score_value=10'; }
post_del() { curl -s -o "$OUT/$1.txt" -w '%{http_code}' -X POST "$BASE/admin/factories/$ID" -H "Next-Action: $DEL" -H "Accept: text/x-component" ${2:+-H "Cookie: $2"} -F '0=["$K1"]' -F "1_id=$ID"; }
for c in "" "$FORGED"; do
  tag=${c:+forged}; tag=${tag:-nocookie}
  S=$(post_save "save-create-$tag" /admin/factories/new "$c" ""); log "POST saveFactory (create, $tag) -> $S"; [ "$S" = 401 ] && ok "saveFactory create $tag -> 401" || bad "saveFactory create $tag -> $S"
  S=$(post_save "save-update-$tag" "/admin/factories/$ID" "$c" "$ID"); log "POST saveFactory (update id $ID, $tag) -> $S"; [ "$S" = 401 ] && ok "saveFactory update $tag -> 401" || bad "saveFactory update $tag -> $S"
  S=$(post_del "delete-$tag" "$c"); log "POST deleteFactory (id $ID, $tag) -> $S"; [ "$S" = 401 ] && ok "deleteFactory $tag -> 401" || bad "deleteFactory $tag -> $S"
done
AFTER=$(counts); log "after:  $AFTER"
[ "$BEFORE" = "$AFTER" ] && [ "$(d1_scalar "SELECT COUNT(*) FROM factories WHERE slug='intruder'")" = 0 ] && ok "no rows written by unauthenticated writes" || bad "D1 changed: $BEFORE -> $AFTER"

log "== login brute-force limit (per IP, via cf-connecting-ip)"
IP="203.0.113.$((RANDOM % 250 + 1))"
login_as() { local pw="$1"; shift; curl -s "$@" -X POST "$BASE/admin/login" -H "Next-Action: $LOGIN" -H "Accept: text/x-component" -H "cf-connecting-ip: $IP" -F '0=[{},"$K1"]' -F "1_password=$pw"; }
for i in 1 2 3 4 5; do login_as "wrong-$i" | grep -q "Wrong password" && ok "attempt $i from $IP: wrong password" || bad "attempt $i: no 'Wrong password'"; done
log "failures recorded for $IP: $(d1_scalar "SELECT failures FROM admin_login_attempts WHERE ip='$IP'")"
login_as "$ADMIN_PASSWORD" -D "$OUT/lockout.headers" > "$OUT/lockout.txt"; grep -q "Too many failed attempts" "$OUT/lockout.txt" && ! grep -qi "^set-cookie: sf_admin_session" "$OUT/lockout.headers" && ok "6th attempt (even the right password) is refused while locked out" || bad "no lockout after 5 failures"
npx wrangler d1 execute DB --local --command "DELETE FROM admin_login_attempts WHERE ip='$IP'" >/dev/null 2>&1 && log "cleared test lockout row for $IP"

log "== browser flow (drive-admin.mjs)"
if BASE="$BASE" ADMIN_PASSWORD="$ADMIN_PASSWORD" node "$(dirname "$0")/drive-admin.mjs" "$OUT" | tee -a "$LOG"; [ "${PIPESTATUS[0]}" = 0 ]; then ok "browser flow"; else bad "browser flow"; fi
FINAL=$(counts); log "final:  $FINAL"
[ "$FINAL" = "$BEFORE" ] && ok "D1 back to the starting counts (the drive deletes what it created)" || bad "D1 counts $BEFORE -> $FINAL"

log "evidence: $OUT"
[ "$FAIL" = 0 ] && log "RESULT: PASS" || log "RESULT: FAIL"
exit "$FAIL"
