export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
const { pool } = require('../../../../lib/db');

export async function GET(req) {
  const reqUrl = new URL(req.url);
  const { searchParams } = reqUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  // Use the actual request origin so it always matches the domain being used
  const appUrl = reqUrl.origin;

  if (error) {
    return NextResponse.redirect(`${appUrl}/admin/articles?linkedin_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/admin/articles?linkedin_error=no_code`);
  }

  // Exchange code for access token
  let tokenData;
  try {
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
    tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('LinkedIn token exchange failed:', tokenData);
      const errMsg = tokenData.error_description || tokenData.error || JSON.stringify(tokenData);
      return NextResponse.redirect(`${appUrl}/admin/articles?linkedin_error=${encodeURIComponent(errMsg)}`);
    }
  } catch (e) {
    console.error('LinkedIn OAuth error:', e);
    return NextResponse.redirect(`${appUrl}/admin/articles?linkedin_error=network_error`);
  }

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null;

  // Upsert token (we only ever store one row)
  await pool.query(`
    INSERT INTO linkedin_tokens (id, access_token, expires_at, updated_at)
    VALUES (1, $1, $2, NOW())
    ON CONFLICT (id) DO UPDATE SET access_token=$1, expires_at=$2, updated_at=NOW()
  `, [tokenData.access_token, expiresAt]);

  return NextResponse.redirect(`${appUrl}/admin/articles?linkedin_connected=1`);
}
