-- URL Shortener: short_links table
-- Run once against the Neon PostgreSQL database

CREATE TABLE IF NOT EXISTS short_links (
  id            SERIAL PRIMARY KEY,
  short_code    VARCHAR(20)  UNIQUE NOT NULL,
  destination   TEXT         NOT NULL,
  title         VARCHAR(200),                        -- human label shown in admin
  is_active     BOOLEAN      DEFAULT true NOT NULL,
  clicks        INTEGER      DEFAULT 0   NOT NULL,
  last_clicked  TIMESTAMP,
  expires_at    TIMESTAMP,                           -- NULL = never expires
  utm_source    VARCHAR(100),
  utm_medium    VARCHAR(100),
  utm_campaign  VARCHAR(100),
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_short_links_code    ON short_links(short_code);
CREATE        INDEX IF NOT EXISTS idx_short_links_created ON short_links(created_at DESC);
