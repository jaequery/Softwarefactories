# Shared helpers for verify-app scripts. Source from the repo root.
set -euo pipefail
PORT="${PORT:-3000}"
BASE="http://localhost:${PORT}"
EVID_ROOT="verify-evidence"
PID_FILE="${EVID_ROOT}/.dev.pid"
mkdir -p "$EVID_ROOT"
d1() { npx wrangler d1 execute DB --local --json --command "$1" 2>/dev/null; }
d1_scalar() { d1 "$1" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=JSON.parse(s)[0].results[0];console.log(Object.values(r)[0])})'; }
