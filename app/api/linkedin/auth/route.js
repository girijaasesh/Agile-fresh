import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  // Must be admin
  const cookieStore = cookies();
  const session = await getServerSession(authOptions);
  if (!cookieStore.get('admin_token') && !session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
  const scope = 'w_organization_social r_organization_social';
  const state = Math.random().toString(36).slice(2);

  // Save state in cookie for CSRF protection
  const response = Response.redirect(
    `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`
  );
  response.headers.set('Set-Cookie', `li_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`);
  return response;
}
