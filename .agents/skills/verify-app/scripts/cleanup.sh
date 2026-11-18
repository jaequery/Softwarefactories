#!/usr/bin/env bash
# Stop ONLY the dev server launch.sh started (its whole process group). Evidence and local D1 are kept.
source "$(dirname "$0")/common.sh"
if [ ! -f "$PID_FILE" ]; then echo "nothing to clean up (no $PID_FILE)"; exit 0; fi
PID=$(cat "$PID_FILE")
if kill -0 "$PID" 2>/dev/null; then
  kill -TERM -- "-$PID" 2>/dev/null || kill -TERM "$PID"
  for _ in $(seq 1 10); do kill -0 "$PID" 2>/dev/null || break; sleep 1; done
  kill -0 "$PID" 2>/dev/null && kill -KILL -- "-$PID" 2>/dev/null
  echo "stopped dev server process group $PID"
else
  echo "pid $PID already gone"
fi
rm -f "$PID_FILE"
echo "evidence kept in $EVID_ROOT/"
