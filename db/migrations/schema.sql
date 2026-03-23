-- AgileEdge full schema
-- Run this in Neon SQL Editor: https://console.neon.tech

CREATE TABLE IF NOT EXISTS certifications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  code             TEXT NOT NULL UNIQUE,
  price            NUMERIC(10,2) NOT NULL DEFAULT 0,
  early_bird_price NUMERIC(10,2),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
  session_date     DATE NOT NULL,
  format           TEXT NOT NULL,
  timezone         TEXT NOT NULL DEFAULT 'EST',
  max_seats        INTEGER NOT NULL DEFAULT 20,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registrations (
  id               BIGSERIAL PRIMARY KEY,
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT,
  company          TEXT,
  job_title        TEXT,
  country          TEXT,
  session_id       UUID REFERENCES sessions(id) ON DELETE SET NULL,
  coupon_code      TEXT,
  amount_paid      NUMERIC(10,2),
  currency         TEXT NOT NULL DEFAULT 'USD',
  payment_status   TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_id TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
  id               BIGSERIAL PRIMARY KEY,
  code             TEXT NOT NULL UNIQUE,
  discount_type    TEXT NOT NULL DEFAULT 'percent',  -- 'percent' or 'fixed'
  discount_value   NUMERIC(10,2) NOT NULL,
  max_uses         INTEGER,
  used_count       INTEGER NOT NULL DEFAULT 0,
  expires_at       TIMESTAMPTZ,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS short_links (
  id               BIGSERIAL PRIMARY KEY,
  code             TEXT NOT NULL UNIQUE,
  target_url       TEXT NOT NULL,
  clicks           INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quick_links (
  id               BIGSERIAL PRIMARY KEY,
  code             TEXT NOT NULL UNIQUE,
  target_url       TEXT NOT NULL,
  label            TEXT,
  clicks           INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed certifications data
INSERT INTO certifications (id, title, code, price, early_bird_price) VALUES
  (gen_random_uuid(), 'SAFe Agilist',                'SA',   995,  795),
  (gen_random_uuid(), 'SAFe Scrum Master',           'SSM',  895,  695),
  (gen_random_uuid(), 'SAFe Advanced Scrum Master',  'SASM', 1095, 895),
  (gen_random_uuid(), 'SAFe Product Owner/PM',       'POPM', 995,  795),
  (gen_random_uuid(), 'SAFe DevOps',                 'SDP',  995,  795),
  (gen_random_uuid(), 'SAFe Release Train Engineer', 'RTE',  1295, 1095),
  (gen_random_uuid(), 'SAFe Program Consultant',     'SPC',  3995, 3495)
ON CONFLICT (code) DO NOTHING;
