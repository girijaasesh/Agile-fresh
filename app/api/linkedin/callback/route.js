export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
const { pool } = require('../../../../lib/db');

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/admin/articles?linkedin_error=${encodeURIComponent(error)}`
    );
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || !tokenData.access_token) {
    console.error('LinkedIn token exchange failed:', tokenData);
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/admin/articles?linkedin_error=token_exchange_failed`
    );
  }

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null;

  // Upsert token (we only ever store one)
  await pool.query(`
    INSERT INTO linkedin_tokens (id, access_token, expires_at, updated_at)
    VALUES (1, $1, $2, NOW())
    ON CONFLICT (id) DO UPDATE SET access_token=$1, expires_at=$2, updated_at=NOW()
  `, [tokenData.access_token, expiresAt]);

  return Response.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/admin/articles?linkedin_connected=1`
  );
}
