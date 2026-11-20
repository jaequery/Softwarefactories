-- Add 8 software factories the owner asked for: Paseo, Superconductor, Orca, Multica, Harness,
-- Agentastic.dev, cmux and Guild, researched on each product's own site on 2026-11-20.
-- Fields that could not be verified are left empty. Scores are DRAFTS pending hands-on review.
-- Safe to re-run: factories are INSERT OR IGNORE on the unique slug (a row the owner already added
-- in /admin is left as it is), and a review is only inserted when that factory has none yet.
-- Factory, Devin and OpenHands are already listed; factory.ai redirects to factory.com, so the
-- existing 'factory' row's website_url is unchanged.

INSERT OR IGNORE INTO factories (slug, name, tagline, description, website_url, logo_url, category, pricing_summary, open_source, created_at, updated_at) VALUES
  ('paseo', 'Paseo', 'Run many coding agents in parallel, desktop and mobile', 'Paseo is an open-source agentic development environment for running many coding agents at once, such as Claude Code, Codex and OpenCode, on any of your machines. It puts an editor, terminals, diffs, pull requests and a browser in one window, and its native iOS and Android apps match the desktop app''s features. The core is licensed under Apache-2.0.', 'https://paseo.sh', NULL, 'open-source', 'Free and open source (bring your own agent credentials)', 1, '2026-11-20T00:00:00.000Z', '2026-11-20T00:00:00.000Z'),
  ('superconductor', 'Superconductor', 'Multiplayer AI workspace for teams and coding agents', 'Superconductor is a multiplayer AI workspace where a team runs many Claude Code, Codex and other agents in cloud sandboxes and shares their agent sessions. It adds live app previews, screenshots and video of agent work, automated QA and guided code review, and launches agents from desktop, Slack, GitHub, Linear and mobile.', 'https://www.superconductor.com', NULL, 'platform', 'Free (20,000 credits to start); Pro $100/mo; Enterprise custom; agent compute metered by usage', 0, '2026-11-20T00:00:00.000Z', '2026-11-20T00:00:00.000Z'),
  ('orca', 'Orca', 'Agent development environment for parallel coding agents', 'Orca is an agent development environment (ADE) that runs Claude Code, Codex and other CLI agents in parallel, each in its own git worktree. Orca Bots take jobs from Slack, Linear or GitHub and ask for help when they need it. It is free and open source under the MIT licence for macOS, Windows and Linux, with a mobile companion app.', 'https://orca.dev', NULL, 'open-source', 'Free and open source; Enterprise on request', 1, '2026-11-20T00:00:00.000Z', '2026-11-20T00:00:00.000Z'),
  ('multica', 'Multica', 'Project management for human and agent teams', 'Multica is a source-available workspace where coding agents such as Claude Code, Codex and OpenCode are assigned issues, tracked and reviewed like teammates. It manages the task lifecycle and runs agents on your own machines through a local daemon or in managed cloud sandboxes, and can be self-hosted with Docker Compose or Kubernetes.', 'https://multica.ai', NULL, 'platform', 'Free to use and self-host inside your own organization; a commercial licence is needed to offer it to others', 0, '2026-11-20T00:00:00.000Z', '2026-11-20T00:00:00.000Z'),
  ('harness', 'Harness', 'Autonomous SDLC platform, from idea to production', 'Harness is an autonomous SDLC platform that bills itself as a software factory from idea to production. Its AI agents cover software delivery, security testing, runtime protection and cost management, and its Cosmos Software Factory Agent takes engineering work from ticket to code.', 'https://www.harness.io', NULL, 'platform', 'Free plan; Essentials and Enterprise plans via sales', 0, '2026-11-20T00:00:00.000Z', '2026-11-20T00:00:00.000Z'),
  ('agentastic-dev', 'Agentastic.dev', 'Multi-agent IDE for your AI software factory', 'Agentastic.dev is a native macOS multi-agent IDE that runs and orchestrates Claude Code, Codex and more than 50 other agents from issue to merged pull request. It combines code, terminals, git and a browser with Manager Agents, one-click cloud agents and an iPhone app. It is proprietary software that is free to download and use.', 'https://www.agentastic.dev', NULL, 'platform', 'Free (bring your own agent subscriptions or API keys)', 0, '2026-11-20T00:00:00.000Z', '2026-11-20T00:00:00.000Z'),
  ('cmux', 'cmux', 'Open-source macOS terminal for running AI coding agents', 'cmux is a native macOS terminal built on Ghostty for running Claude Code, Codex, Gemini and other CLI agents side by side, with vertical tabs, split panes, notifications when an agent needs attention and a scriptable CLI. The app is open source under GPL-3.0, and paid plans add cloud agents on isolated Cloud VMs.', 'https://cmux.com', NULL, 'open-source', 'Free (open source); Pro $50/mo; Max $200/mo; Team $60/user/mo; Enterprise custom', 1, '2026-11-20T00:00:00.000Z', '2026-11-20T00:00:00.000Z'),
  ('guild', 'Guild', 'Control plane to build, run and govern AI agents', 'Guild is a control plane for running, monitoring and governing an organization''s AI agents, with scoped credentials, policies, human approval gates, tracing and spend tracking. Its Software Factory, built on Guild, plans, builds, tests and reviews work in sandboxed environments and hands engineers validated pull requests that humans approve and merge.', 'https://www.guild.ai', NULL, 'platform', '', 0, '2026-11-20T00:00:00.000Z', '2026-11-20T00:00:00.000Z');

INSERT INTO reviews (factory_id, overall_score, score_autonomy, score_quality, score_speed, score_value, verdict, body_markdown, pros, cons, editors_pick, published, reviewed_at, updated_at)
SELECT f.id, 7.9, 8.0, 7.8, 7.6, 8.8, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

Paseo is an open-source agentic development environment for running many coding agents at once, such as Claude Code, Codex and OpenCode, on any of your machines. It puts an editor, terminals, diffs, pull requests and a browser in one window, and its native iOS and Android apps match the desktop app''s features. The core is licensed under Apache-2.0.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-20T00:00:00.000Z', '2026-11-20T00:00:00.000Z'
FROM factories f WHERE f.slug = 'paseo' AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.factory_id = f.id);

INSERT INTO reviews (factory_id, overall_score, score_autonomy, score_quality, score_speed, score_value, verdict, body_markdown, pros, cons, editors_pick, published, reviewed_at, updated_at)
SELECT f.id, 8.0, 8.4, 7.8, 7.8, 7.6, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

Superconductor is a multiplayer AI workspace where a team runs many Claude Code, Codex and other agents in cloud sandboxes and shares their agent sessions. It adds live app previews, screenshots and video of agent work, automated QA and guided code review, and launches agents from desktop, Slack, GitHub, Linear and mobile.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-20T00:00:00.000Z', '2026-11-20T00:00:00.000Z'
FROM factories f WHERE f.slug = 'superconductor' AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.factory_id = f.id);

INSERT INTO reviews (factory_id, overall_score, score_autonomy, score_quality, score_speed, score_value, verdict, body_markdown, pros, cons, editors_pick, published, reviewed_at, updated_at)
SELECT f.id, 8.0, 8.2, 7.8, 7.8, 8.6, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

Orca is an agent development environment (ADE) that runs Claude Code, Codex and other CLI agents in parallel, each in its own git worktree. Orca Bots take jobs from Slack, Linear or GitHub and ask for help when they need it. It is free and open source under the MIT licence for macOS, Windows and Linux, with a mobile companion app.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-20T00:00:00.000Z', '2026-11-20T00:00:00.000Z'
FROM factories f WHERE f.slug = 'orca' AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.factory_id = f.id);

INSERT INTO reviews (factory_id, overall_score, score_autonomy, score_quality, score_speed, score_value, verdict, body_markdown, pros, cons, editors_pick, published, reviewed_at, updated_at)
SELECT f.id, 7.8, 8.0, 7.6, 7.4, 8.2, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

Multica is a source-available workspace where coding agents such as Claude Code, Codex and OpenCode are assigned issues, tracked and reviewed like teammates. It manages the task lifecycle and runs agents on your own machines through a local daemon or in managed cloud sandboxes, and can be self-hosted with Docker Compose or Kubernetes.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-20T00:00:00.000Z', '2026-11-20T00:00:00.000Z'
FROM factories f WHERE f.slug = 'multica' AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.factory_id = f.id);

INSERT INTO reviews (factory_id, overall_score, score_autonomy, score_quality, score_speed, score_value, verdict, body_markdown, pros, cons, editors_pick, published, reviewed_at, updated_at)
SELECT f.id, 7.8, 7.8, 8.0, 7.6, 7.4, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

Harness is an autonomous SDLC platform that bills itself as a software factory from idea to production. Its AI agents cover software delivery, security testing, runtime protection and cost management, and its Cosmos Software Factory Agent takes engineering work from ticket to code.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-20T00:00:00.000Z', '2026-11-20T00:00:00.000Z'
FROM factories f WHERE f.slug = 'harness' AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.factory_id = f.id);

INSERT INTO reviews (factory_id, overall_score, score_autonomy, score_quality, score_speed, score_value, verdict, body_markdown, pros, cons, editors_pick, published, reviewed_at, updated_at)
SELECT f.id, 7.8, 8.0, 7.6, 7.6, 8.4, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

Agentastic.dev is a native macOS multi-agent IDE that runs and orchestrates Claude Code, Codex and more than 50 other agents from issue to merged pull request. It combines code, terminals, git and a browser with Manager Agents, one-click cloud agents and an iPhone app. It is proprietary software that is free to download and use.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-20T00:00:00.000Z', '2026-11-20T00:00:00.000Z'
FROM factories f WHERE f.slug = 'agentastic-dev' AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.factory_id = f.id);

INSERT INTO reviews (factory_id, overall_score, score_autonomy, score_quality, score_speed, score_value, verdict, body_markdown, pros, cons, editors_pick, published, reviewed_at, updated_at)
SELECT f.id, 7.6, 7.4, 7.8, 8.0, 8.6, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

cmux is a native macOS terminal built on Ghostty for running Claude Code, Codex, Gemini and other CLI agents side by side, with vertical tabs, split panes, notifications when an agent needs attention and a scriptable CLI. The app is open source under GPL-3.0, and paid plans add cloud agents on isolated Cloud VMs.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-20T00:00:00.000Z', '2026-11-20T00:00:00.000Z'
FROM factories f WHERE f.slug = 'cmux' AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.factory_id = f.id);

INSERT INTO reviews (factory_id, overall_score, score_autonomy, score_quality, score_speed, score_value, verdict, body_markdown, pros, cons, editors_pick, published, reviewed_at, updated_at)
SELECT f.id, 7.6, 8.0, 7.6, 7.2, 7.4, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

Guild is a control plane for running, monitoring and governing an organization''s AI agents, with scoped credentials, policies, human approval gates, tracing and spend tracking. Its Software Factory, built on Guild, plans, builds, tests and reviews work in sandboxed environments and hands engineers validated pull requests that humans approve and merge.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-20T00:00:00.000Z', '2026-11-20T00:00:00.000Z'
FROM factories f WHERE f.slug = 'guild' AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.factory_id = f.id);
