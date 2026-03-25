import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // ── Admin route protection ─────────────────────────────────────────────────
  const isAdminPath = path.startsWith('/admin');
  const isAdminLogin = path === '/admin/login';

  if (isAdminPath) {
    const adminToken = request.cookies.get('admin_token');
    let nextAuthSession = null;
    try {
      nextAuthSession = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET || 'agile-edge-secret-2026',
      });
    } catch {
      // ignore
    }

    const hasAuth = Boolean(adminToken || nextAuthSession);

    if (!isAdminLogin && !hasAuth) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (isAdminLogin && hasAuth) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
