import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../app/api/auth/[...nextauth]/route';

export async function verifyAdminAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token');

  const session = await getServerSession(authOptions);

  if (!token && !session) {
    redirect('/admin/login');
  }
  return { token, session };
}
