-- Admin login brute-force protection: failed password attempts per client IP in a rolling window.
-- Additive only (new table), so it is backward-compatible with the previous deploy.
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  ip            TEXT    PRIMARY KEY,
  failures      INTEGER NOT NULL DEFAULT 0,
  window_start  INTEGER NOT NULL, -- unix epoch milliseconds of the first failure in the current window
  updated_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
