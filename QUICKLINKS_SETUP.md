# Quick Links Setup Guide

## Database Setup

To use the marketing quick links feature, you need to create the `quick_links` table in your PostgreSQL database.

### Option 1: Using psql (Recommended)

```bash
psql -U your_username -d your_database -f db/migrations/create_quick_links.sql
```

### Option 2: Manual SQL

Connect to your database and run:

```sql
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

CREATE INDEX IF NOT EXISTS idx_quick_links_short_code ON quick_links(short_code);
CREATE INDEX IF NOT EXISTS idx_quick_links_created_at ON quick_links(created_at DESC);
```

## Usage

1. **Access Admin Panel**: Go to `/admin/quicklinks`
2. **Create a Quick Link**:
   - Select a certification
   - (Optional) Select a specific session
   - (Optional) Add a coupon code to auto-apply
   - Enter campaign name and source (for tracking)
   - Click "Create Link"
3. **Share the Link**: Copy the generated short link (e.g., `/q/ABC123`)

## Features

- **Short URLs**: `/q/ABC123` format for easy sharing on social media, email, etc.
- **Auto-filled Registration**: When users click the link:
  - Certification is pre-selected
  - Coupon code is auto-applied (if included)
  - Data populates the registration form
- **Click Tracking**: Admin can see how many times each link was clicked
- **Campaign Tracking**: UTM parameters (utm_source, utm_campaign) for analytics integration

## Environment Variables

Make sure you have `NEXT_PUBLIC_SITE_URL` set in your `.env.local`:

```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

If not set, quick links will default to `http://localhost:3000/q/[code]`

## API Endpoints

### Create Quick Link
```
POST /api/quicklink/create
{
  "certId": "sa",
  "sessionId": 1,
  "couponCode": "HALF50",
  "campaignName": "Q2 Marketing",
  "campaignSource": "LinkedIn"
}
```

### Resolve Quick Link
```
GET /api/quicklink/[code]
```
Returns the redirect URL and link metadata, increments click counter.
