export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
const { pool } = require('../../../../lib/db');

export async function GET() {
  const cookieStore = cookies();
  const session = await getServerSession(authOptions);
  if (!cookieStore.get('admin_token') && !session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await pool.query('SELECT access_token, expires_at FROM linkedin_tokens WHERE id=1');
  if (result.rows.length === 0) {
    return Response.json({ connected: false });
  }

  const { expires_at } = result.rows[0];
  const expired = expires_at && new Date(expires_at) < new Date();
  return Response.json({ connected: !expired, expires_at });
}
