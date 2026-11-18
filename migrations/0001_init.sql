-- Software Factories: core schema (Cloudflare D1 / SQLite)

CREATE TABLE IF NOT EXISTS factories (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT    NOT NULL UNIQUE,
  name            TEXT    NOT NULL,
  tagline         TEXT    NOT NULL DEFAULT '',
  description     TEXT    NOT NULL DEFAULT '',
  website_url     TEXT    NOT NULL DEFAULT '',
  logo_url        TEXT,
  category        TEXT    NOT NULL CHECK (category IN ('autonomous-agent', 'platform', 'ide-agent', 'open-source', 'cli-agent')),
  pricing_summary TEXT    NOT NULL DEFAULT '',
  open_source     INTEGER NOT NULL DEFAULT 0 CHECK (open_source IN (0, 1)),
  created_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- One current editorial review per factory (UNIQUE factory_id).
CREATE TABLE IF NOT EXISTS reviews (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  factory_id      INTEGER NOT NULL UNIQUE REFERENCES factories(id) ON DELETE CASCADE,
  overall_score   REAL    NOT NULL CHECK (overall_score BETWEEN 0 AND 10),
  score_autonomy  REAL    NOT NULL CHECK (score_autonomy BETWEEN 0 AND 10),
  score_quality   REAL    NOT NULL CHECK (score_quality BETWEEN 0 AND 10),
  score_speed     REAL    NOT NULL CHECK (score_speed BETWEEN 0 AND 10),
  score_value     REAL    NOT NULL CHECK (score_value BETWEEN 0 AND 10),
  verdict         TEXT    NOT NULL DEFAULT '',
  body_markdown   TEXT    NOT NULL DEFAULT '',
  pros            TEXT    NOT NULL DEFAULT '[]', -- JSON array of strings
  cons            TEXT    NOT NULL DEFAULT '[]', -- JSON array of strings
  editors_pick    INTEGER NOT NULL DEFAULT 0 CHECK (editors_pick IN (0, 1)),
  published       INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0, 1)),
  reviewed_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_factories_slug     ON factories (slug);
CREATE INDEX        IF NOT EXISTS idx_factories_category ON factories (category);
CREATE INDEX        IF NOT EXISTS idx_reviews_overall    ON reviews (overall_score DESC);
