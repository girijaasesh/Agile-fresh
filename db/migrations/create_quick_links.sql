-- Quick Links table for marketing campaign URLs
CREATE TABLE IF NOT EXISTS quick_links (
  id SERIAL PRIMARY KEY,
  short_code VARCHAR(50) UNIQUE NOT NULL,
  cert_id VARCHAR(50),
  session_id INTEGER,
  coupon_code VARCHAR(50),
  campaign_name VARCHAR(100),
  campaign_source VARCHAR(100),
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_clicked TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_quick_links_short_code ON quick_links(short_code);
CREATE INDEX IF NOT EXISTS idx_quick_links_created_at ON quick_links(created_at DESC);
