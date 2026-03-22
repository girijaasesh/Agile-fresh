/**
 * URL Shortener — redirect handler
 *
 * GET /s/:code
 *  → 302 to destination_url (server-side, zero JS, instant)
 *  → 404 if code unknown / inactive / expired
 *
 * This is a Next.js Route Handler (not a page) so the redirect is
 * a pure HTTP response — no React, no client bundle, equivalent to
 * how lnkd.in/xxx works.
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
const { pool } = require('../../../lib/db');

export async function GET(_req, { params }) {
  const { code } = params;

  try {
    const { rows } = await pool.query(
      `SELECT id, destination, is_active, expires_at
         FROM short_links
        WHERE short_code = $1
        LIMIT 1`,
      [code]
    );

    if (rows.length === 0) {
      return NextResponse.redirect(new URL('/?sl=404', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'), { status: 302 });
    }

    const link = rows[0];

    // Inactive
    if (!link.is_active) {
      return NextResponse.redirect(new URL('/?sl=inactive', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'), { status: 302 });
    }

    // Expired
    if (link.expires_at && new Date() > new Date(link.expires_at)) {
      return NextResponse.redirect(new URL('/?sl=expired', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'), { status: 302 });
    }

    // Fire-and-forget click increment (don't await — keep redirect fast)
    pool.query(
      `UPDATE short_links SET clicks = clicks + 1, last_clicked = NOW() WHERE id = $1`,
      [link.id]
    ).catch(() => {});

    return NextResponse.redirect(link.destination, { status: 302 });

  } catch (err) {
    console.error('[shortlink] redirect error:', err);
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'), { status: 302 });
  }
}
