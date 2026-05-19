-- Add LinkedIn queue flag to articles
-- Run in Neon SQL Editor: https://console.neon.tech

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS post_on_linkedin BOOLEAN NOT NULL DEFAULT false;
