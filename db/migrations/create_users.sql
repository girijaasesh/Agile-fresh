-- Users table for authentication
-- Run this in Neon SQL Editor: https://console.neon.tech

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT,                              -- NULL for Google/OAuth users
  auth_provider TEXT NOT NULL DEFAULT 'local',     -- 'local' | 'google'
  image         TEXT,                              -- profile picture URL (Google)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
