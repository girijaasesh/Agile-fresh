import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  const isLoginPath = path === '/admin/login';
  const isAdminPath = path.startsWith('/admin');
  const token = request.cookies.get('admin_token');

  let nextAuthSession = null;
  try {
    nextAuthSession = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || 'agile-edge-secret-2026' });
  } catch (e) {
    // ignore session retrieval errors, continue with existing admin_token check.
  }

  const hasAuth = Boolean(token || nextAuthSession);

  if (isAdminPath && !isLoginPath && !hasAuth) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isLoginPath && hasAuth) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};