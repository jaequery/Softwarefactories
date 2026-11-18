#!/usr/bin/env bash
# Drive the real dev server over HTTP and assert on the rendered DOM. Exits non-zero if any assertion fails.
source "$(dirname "$0")/common.sh"
RUN="${RUN_ID:-$(date -u +%Y%m%dT%H%M%SZ)}"; OUT="$EVID_ROOT/$RUN"; mkdir -p "$OUT"
LOG="$OUT/drive.log"; : > "$LOG"; FAIL=0
log() { echo "$*" | tee -a "$LOG"; }
ok() { log "  PASS  $*"; }; bad() { log "  FAIL  $*"; FAIL=1; }
counts() { for t in factories reviews; do echo "$t=$(d1_scalar "SELECT COUNT(*) FROM $t")"; done; }
fetch() { # fetch <name> <path>: saves HTML, echoes status
  local code; code=$(curl -s -o "$OUT/$1.html" -w '%{http_code}' "$BASE$2"); log "GET $2 -> $code  (saved $OUT/$1.html)"; echo "$code" > "$OUT/$1.status"; }
slugs() { grep -o 'data-testid="factory-row" data-slug="[^"]*"' "$OUT/$1.html" | sed 's/.*data-slug="//; s/"$//'; }
nrows() { slugs "$1" | wc -l | tr -d ' '; }

echo "before: $(counts | tr '\n' ' ')" > "$OUT/side-effects.txt"
TOTAL=$(d1_scalar "SELECT COUNT(*) FROM reviews WHERE published = 1")

log "== home listing"; fetch home /
[ "$(cat "$OUT/home.status")" = 200 ] && ok "/ returns 200" || bad "/ status $(cat "$OUT/home.status")"
[ "$(nrows home)" = "$TOTAL" ] && ok "lists all $TOTAL published factories" || bad "rows $(nrows home) != $TOTAL"
grep -q "// $TOTAL factories reviewed · updated" "$OUT/home.html" && ok "hero kicker shows $TOTAL" || bad "hero kicker wrong"
while IFS= read -r name; do grep -qF "$name" "$OUT/home.html" && ok "shows '$name'" || bad "missing '$name'"; done < <(d1 "SELECT name FROM factories" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>JSON.parse(s)[0].results.forEach(r=>console.log(r.name.replace(/&/g,"&amp;").replace(/'"'"'/g,"&#x27;"))))')
SCORES=$(grep -o 'data-testid="score">[0-9.]*' "$OUT/home.html" | sed 's/.*>//')
[ "$SCORES" = "$(sort -rn <<<"$SCORES")" ] && ok "default sort is score descending" || bad "not sorted by score"
[ "$(grep -c "editor&#x27;s pick\|editor's pick" "$OUT/home.html")" -ge 1 ] && ok "editor's pick label shown" || bad "no editor's pick label"

log "== search ?q="
NAME=$(d1_scalar "SELECT name FROM factories ORDER BY name LIMIT 1"); Q=$(node -p "encodeURIComponent(process.argv[1])" "$NAME")
fetch search "/?q=$Q"
EXP=$(d1_scalar "SELECT COUNT(*) FROM factories f JOIN reviews r ON r.factory_id=f.id AND r.published=1 WHERE f.name LIKE '%$NAME%' OR f.tagline LIKE '%$NAME%'")
[ "$(nrows search)" = "$EXP" ] && [ "$EXP" -ge 1 ] && ok "?q=$NAME -> $EXP row(s)" || bad "?q=$NAME rows $(nrows search) != $EXP"

log "== category filter"
for c in autonomous-agent platform ide-agent open-source cli-agent; do
  fetch "cat-$c" "/?category=$c"
  EXP=$(d1_scalar "SELECT COUNT(*) FROM factories f JOIN reviews r ON r.factory_id=f.id AND r.published=1 WHERE f.category='$c'")
  [ "$(nrows "cat-$c")" = "$EXP" ] && ok "?category=$c -> $EXP row(s)" || bad "?category=$c rows $(nrows "cat-$c") != $EXP"
  grep -q "aria-current=\"true\" data-category=\"$c\"" "$OUT/cat-$c.html" && ok "chip '$c' active" || bad "chip '$c' not active"
done

log "== sort"
fetch sort-name "/?sort=name"
EXPN=$(d1 "SELECT f.slug FROM factories f JOIN reviews r ON r.factory_id=f.id AND r.published=1 ORDER BY f.name COLLATE NOCASE" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>JSON.parse(s)[0].results.forEach(r=>console.log(r.slug)))')
[ "$(slugs sort-name)" = "$EXPN" ] && ok "?sort=name is A–Z" || bad "?sort=name order wrong"
fetch sort-newest "/?sort=newest"; [ "$(nrows sort-newest)" = "$TOTAL" ] && ok "?sort=newest lists all" || bad "?sort=newest rows"
fetch sort-bogus "/?sort=bogus&category=bogus"; [ "$(nrows sort-bogus)" = "$TOTAL" ] && ok "unknown sort/category fall back to defaults" || bad "fallback failed"

log "== empty state"
fetch empty "/?q=zzzz-no-such-factory"
grep -q 'data-testid="empty-state"' "$OUT/empty.html" && [ "$(nrows empty)" = 0 ] && ok "empty state shown" || bad "empty state missing"

log "== row links"
for s in $(slugs home | head -3); do
  fetch "factory-$s" "/factories/$s"; [ "$(cat "$OUT/factory-$s.status")" = 200 ] && ok "/factories/$s -> 200" || bad "/factories/$s"
done
fetch factory-missing "/factories/does-not-exist"; [ "$(cat "$OUT/factory-missing.status")" = 404 ] && ok "unknown slug -> 404" || bad "unknown slug not 404"
for p in compare methodology about; do fetch "page-$p" "/$p"; [ "$(cat "$OUT/page-$p.status")" = 200 ] && ok "/$p -> 200" || bad "/$p"; done

echo "after:  $(counts | tr '\n' ' ')" >> "$OUT/side-effects.txt"
log "== side effects (D1 row counts must be unchanged)"; cat "$OUT/side-effects.txt" | tee -a "$LOG"
[ "$(sed -n 1p "$OUT/side-effects.txt" | cut -d: -f2 | xargs)" = "$(sed -n 2p "$OUT/side-effects.txt" | cut -d: -f2 | xargs)" ] && ok "no writes" || bad "row counts changed"
log "evidence: $OUT"
[ "$FAIL" = 0 ] && log "RESULT: PASS" || log "RESULT: FAIL"
exit "$FAIL"
