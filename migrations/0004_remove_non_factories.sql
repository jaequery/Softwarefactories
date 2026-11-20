-- Remove the six listings that are not software factories: interactive coding tools you drive
-- turn by turn (Claude Code, OpenAI Codex, Cursor) and prompt-to-app builders (Replit Agent,
-- Lovable, Bolt.new). Deletes by slug only, so any rows the owner added through /admin are untouched.
-- Reviews go first; this does not rely on ON DELETE CASCADE.
DELETE FROM reviews WHERE factory_id IN (
  SELECT id FROM factories WHERE slug IN ('claude-code', 'openai-codex', 'cursor', 'replit-agent', 'lovable', 'bolt-new')
);
DELETE FROM factories WHERE slug IN ('claude-code', 'openai-codex', 'cursor', 'replit-agent', 'lovable', 'bolt-new');
