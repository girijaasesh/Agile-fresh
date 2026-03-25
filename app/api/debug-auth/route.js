import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const nextauthUrl = process.env.NEXTAUTH_URL || '(not set)';
  const googleClientId = process.env.GOOGLE_CLIENT_ID || '(not set)';
  const hasSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET);
  const hasNextauthSecret = Boolean(process.env.NEXTAUTH_SECRET);

  // The exact redirect URI NextAuth will send to Google
  const callbackUrl = `${nextauthUrl}/api/auth/callback/google`;

  return NextResponse.json({
    nextauth_url: nextauthUrl,
    google_callback_uri: callbackUrl,
    google_client_id: googleClientId.slice(0, 20) + '...',
    has_google_secret: hasSecret,
    has_nextauth_secret: hasNextauthSecret,
    request_host: request.headers.get('host'),
    message: 'Add google_callback_uri to Google Console → Authorized redirect URIs',
  });
}
