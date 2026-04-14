-- LinkedIn integration tables
-- Run in Neon SQL Editor: https://console.neon.tech

-- Store LinkedIn OAuth tokens
CREATE TABLE IF NOT EXISTS linkedin_tokens (
  id            SERIAL PRIMARY KEY,
  access_token  TEXT NOT NULL,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Track which articles have been shared to LinkedIn
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS linkedin_posted_at TIMESTAMPTZ;
