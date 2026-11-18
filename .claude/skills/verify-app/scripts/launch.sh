#!/usr/bin/env bash
# Launch from an EMPTY local D1: wipe .wrangler/state, migrate + seed, start `npm run dev`, wait for ready.
source "$(dirname "$0")/common.sh"
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "dev server already running (pid $(cat "$PID_FILE")); run cleanup.sh first" >&2; exit 1
fi
[ -d node_modules ] || npm install
echo "== resetting local D1 (.wrangler/state)"; rm -rf .wrangler/state
echo "== applying migrations"; npm run db:migrate:local
EXPECTED=$(d1_scalar "SELECT COUNT(*) FROM reviews WHERE published = 1")
echo "== seeded published reviews: $EXPECTED"
echo "== starting dev server on :$PORT"
setsid nohup npx next dev -p "$PORT" > "$EVID_ROOT/dev.log" 2>&1 < /dev/null &
echo $! > "$PID_FILE"
for _ in $(seq 1 60); do
  if html=$(curl -sf "$BASE/" 2>/dev/null); then
    rows=$(grep -o 'data-testid="factory-row"' <<<"$html" | wc -l | tr -d ' ')
    if [ "$rows" -ge 1 ] && [ "$rows" -eq "$EXPECTED" ]; then echo "READY: $BASE/ 200 with $rows factory rows (pid $(cat "$PID_FILE"))"; exit 0; fi
  fi
  sleep 2
done
echo "NOT READY after 120s; see $EVID_ROOT/dev.log" >&2; tail -30 "$EVID_ROOT/dev.log" >&2; exit 1
