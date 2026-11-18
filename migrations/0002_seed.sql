-- Seed: real AI software factories, researched on each product's own site on 2026-11-18.
-- Fields that could not be verified are left empty. Scores are DRAFTS pending hands-on review;
-- the site owner will edit them in the admin.

INSERT INTO factories (slug, name, tagline, description, website_url, logo_url, category, pricing_summary, open_source, created_at, updated_at) VALUES
  ('factory', 'Factory', 'Software development agents via desktop, CLI and SDK', 'Factory offers AI agents for software development, available as a desktop app, a CLI and an SDK. It supports frontier and open-weight models such as GPT-5, Claude and Gemini, and its enterprise plans include on-premise deployment.', 'https://factory.com', NULL, 'autonomous-agent', 'Free (bring your own inference); Pro $20/mo; Plus $100/mo; Max $200/mo; Teams $60/team + $40/member; Business/Enterprise custom', 0, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ('claude-code', 'Claude Code', 'Anthropic''s agentic coding tool for terminal and IDE', 'Claude Code is Anthropic''s agentic coding tool. It runs in the terminal, VS Code and JetBrains, on the web, in the desktop and mobile apps, and through Slack and GitHub. It can explore a codebase, write and test code, and turn issues into pull requests within the permissions you set.', 'https://www.claude.com/product/claude-code', NULL, 'cli-agent', 'Included in Claude Pro $20/mo ($17/mo annual); Max $100/mo; Ultra $200/mo; Team from $20-25/seat; Enterprise $20/seat + usage', 0, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ('openai-codex', 'OpenAI Codex', 'OpenAI''s coding agent for CLI, IDE, app and cloud', 'Codex is OpenAI''s coding agent, available in the ChatGPT apps, the Codex CLI, an IDE extension, an SDK and Codex Cloud. It handles local and cloud tasks and code review, and integrates with GitHub and Slack. The Codex CLI is open source under Apache-2.0.', 'https://openai.com/codex/', NULL, 'cli-agent', 'Included in ChatGPT plans: Free $0; Go $8/mo; Plus $20/mo; Pro from $100/mo; Business $20-25/user/mo; Enterprise custom; or API usage', 1, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ('devin', 'Devin', 'Cognition''s AI coding agent with cloud agents', 'Devin is an AI coding product from Cognition. It offers agent-based coding, a desktop app, Tab completions, cloud-hosted agents and bots, and lets users pick models from major AI providers or Cognition''s own SWE-2 model.', 'https://devin.ai', NULL, 'autonomous-agent', 'Free tier; Pro $20/mo; Max $200/mo; Teams $80/mo + $40/dev seat; Enterprise custom', 0, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ('fredrin', 'Fredrin', 'Desktop software factory: humans plan, AI Workers code', 'Fredrin is a desktop agentic development environment for macOS, Windows and Linux. Each kanban ticket gets its own branch and an AI Worker (Claude Code or Codex), and many Workers can run in parallel on cloud sandboxes or paired machines. It runs on the user''s existing AI subscription.', 'https://fredrin.com', NULL, 'platform', 'Free for up to 5 members; Pro $20/mo per workspace; Team $29/seat/mo from 6th member; Enterprise custom', 0, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ('cursor', 'Cursor', 'AI code editor with in-editor and cloud agents', 'Cursor is an AI code editor that includes Cursor Agent on all plans. Its higher tiers add cloud agents and automations that run work off the local machine.', 'https://cursor.com', NULL, 'ide-agent', 'Free; Plus $8/mo; Premium $30/mo; Super $100/mo; Ultra $200/mo; Teams $30+/user/mo; Enterprise custom', 0, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ('github-copilot-coding-agent', 'GitHub Copilot coding agent', 'Assign GitHub issues to Copilot, get a pull request', 'GitHub Copilot''s cloud agent works in the background on a chosen repository and branch: it investigates, plans and makes changes, then opens a pull request. It runs in a cloud sandbox, a GitHub Actions runner or a custom remote environment.', 'https://github.com/features/copilot', NULL, 'autonomous-agent', 'Copilot Free $0 (no cloud agent); Pro $10/mo; Pro+ $39/mo; Max $100/mo', 0, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ('openhands', 'OpenHands', 'Open-source, model-agnostic coding agent platform', 'OpenHands is a platform for autonomous coding agents that works with any model and can also run third-party agents such as Claude Code or Codex. The core is MIT-licensed and free to self-host, with paid Teams and Enterprise tiers.', 'https://www.openhands.dev', NULL, 'open-source', 'Open source free (bring your own LLM key); Teams $500/mo for 10 users (+$50/seat); Enterprise custom', 1, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ('google-jules', 'Jules', 'Google''s async coding agent that opens GitHub PRs', 'Jules is an autonomous coding agent from Google Labs for tasks such as bug fixes, dependency bumps, tests and features. It clones a GitHub repository into a cloud VM, proposes a plan using Gemini, shows a diff and opens a pull request.', 'https://jules.google', NULL, 'autonomous-agent', '', 0, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ('replit-agent', 'Replit Agent', 'Build and deploy apps from natural-language prompts', 'Replit is an AI platform where users describe what they want in natural language, then build, launch and grow apps and websites in one place. Replit Agent is the LLM-powered agent that does the building.', 'https://replit.com', NULL, 'platform', 'Core $20/mo ($18 annual); Pro $100/mo ($90 annual, higher tiers to $2,000/mo); Enterprise custom', 0, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ('lovable', 'Lovable', 'Chat-based builder for websites and web apps', 'Lovable describes itself as an AI software engineer that lets anyone build for the web. Users describe what they want in chat, and Lovable builds and publishes websites and web apps, with credit-based pricing instead of per-seat pricing.', 'https://lovable.dev', NULL, 'platform', 'Free (5 daily credits); Pro $25/mo; Business $50/mo; Enterprise custom', 0, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ('bolt-new', 'Bolt.new', 'AI builder for websites and apps without coding', 'Bolt is an AI-powered builder that creates websites and apps from prompts, with hosting and databases included. Usage is measured in tokens, which cover reading prompts, planning and writing code.', 'https://bolt.new', NULL, 'platform', 'Free (1M tokens/mo); Pro $25/mo; Teams $30/member/mo; Enterprise custom', 0, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z');

INSERT INTO reviews (factory_id, overall_score, score_autonomy, score_quality, score_speed, score_value, verdict, body_markdown, pros, cons, editors_pick, published, reviewed_at, updated_at) VALUES
  ((SELECT id FROM factories WHERE slug = 'factory'), 8.9, 9.4, 9, 8.8, 8.4, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

Factory offers AI agents for software development, available as a desktop app, a CLI and an SDK. It supports frontier and open-weight models such as GPT-5, Claude and Gemini, and its enterprise plans include on-premise deployment.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 1, 1, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ((SELECT id FROM factories WHERE slug = 'claude-code'), 8.8, 8.8, 9.2, 8.4, 8.6, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

Claude Code is Anthropic''s agentic coding tool. It runs in the terminal, VS Code and JetBrains, on the web, in the desktop and mobile apps, and through Slack and GitHub. It can explore a codebase, write and test code, and turn issues into pull requests within the permissions you set.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ((SELECT id FROM factories WHERE slug = 'openai-codex'), 8.6, 8.6, 8.8, 8.4, 8.6, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

Codex is OpenAI''s coding agent, available in the ChatGPT apps, the Codex CLI, an IDE extension, an SDK and Codex Cloud. It handles local and cloud tasks and code review, and integrates with GitHub and Slack. The Codex CLI is open source under Apache-2.0.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ((SELECT id FROM factories WHERE slug = 'devin'), 8.2, 9, 8.2, 8, 7.6, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

Devin is an AI coding product from Cognition. It offers agent-based coding, a desktop app, Tab completions, cloud-hosted agents and bots, and lets users pick models from major AI providers or Cognition''s own SWE-2 model.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ((SELECT id FROM factories WHERE slug = 'fredrin'), 8.5, 8.6, 8.4, 8.2, 8.6, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

Fredrin is a desktop agentic development environment for macOS, Windows and Linux. Each kanban ticket gets its own branch and an AI Worker (Claude Code or Codex), and many Workers can run in parallel on cloud sandboxes or paired machines. It runs on the user''s existing AI subscription.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ((SELECT id FROM factories WHERE slug = 'cursor'), 8.3, 7.6, 8.6, 8.8, 8, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

Cursor is an AI code editor that includes Cursor Agent on all plans. Its higher tiers add cloud agents and automations that run work off the local machine.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ((SELECT id FROM factories WHERE slug = 'github-copilot-coding-agent'), 8.1, 7.8, 8, 7.6, 8.8, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

GitHub Copilot''s cloud agent works in the background on a chosen repository and branch: it investigates, plans and makes changes, then opens a pull request. It runs in a cloud sandbox, a GitHub Actions runner or a custom remote environment.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ((SELECT id FROM factories WHERE slug = 'openhands'), 8.1, 8.2, 7.8, 7.4, 9, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

OpenHands is a platform for autonomous coding agents that works with any model and can also run third-party agents such as Claude Code or Codex. The core is MIT-licensed and free to self-host, with paid Teams and Enterprise tiers.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ((SELECT id FROM factories WHERE slug = 'google-jules'), 7.8, 8, 7.6, 7.2, 8.2, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

Jules is an autonomous coding agent from Google Labs for tasks such as bug fixes, dependency bumps, tests and features. It clones a GitHub repository into a cloud VM, proposes a plan using Gemini, shows a diff and opens a pull request.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ((SELECT id FROM factories WHERE slug = 'replit-agent'), 7.7, 8.2, 7.2, 8, 7.2, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

Replit is an AI platform where users describe what they want in natural language, then build, launch and grow apps and websites in one place. Replit Agent is the LLM-powered agent that does the building.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ((SELECT id FROM factories WHERE slug = 'lovable'), 7.8, 7.8, 7.2, 8.4, 7.6, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

Lovable describes itself as an AI software engineer that lets anyone build for the web. Users describe what they want in chat, and Lovable builds and publishes websites and web apps, with credit-based pricing instead of per-seat pricing.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z'),
  ((SELECT id FROM factories WHERE slug = 'bolt-new'), 7.6, 7.6, 7, 8.4, 7.4, 'Draft score: pending hands-on review.', '**Draft score: pending hands-on review.**

Bolt is an AI-powered builder that creates websites and apps from prompts, with hosting and databases included. Usage is measured in tokens, which cover reading prompts, planning and writing code.

These scores are placeholders until the editor finishes a hands-on review.', '[]', '[]', 0, 1, '2026-11-18T00:00:00.000Z', '2026-11-18T00:00:00.000Z');
