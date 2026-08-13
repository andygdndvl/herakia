import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/auth';
import { locales, defaultLocale } from '@/dictionaries';

function detectLocale(request: NextRequest): string {
  const header = request.headers.get('accept-language');
  if (header) {
    const preferred = header
      .split(',')
      .map((part) => part.split(';')[0].trim().slice(0, 2).toLowerCase());
    for (const code of preferred) {
      if ((locales as readonly string[]).includes(code)) return code;
    }
  }
  return defaultLocale;
}

export default auth((request) => {
  const { pathname } = request.nextUrl;

  // API admin : protégée par NextAuth. Renvoie 401 (pas de redirection,
  // c'est une API, pas une page à afficher).
  if (pathname.startsWith('/api/admin')) {
    if (!request.auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Zone admin (pages) : protégée par NextAuth, jamais de préfixe de langue
  if (pathname.startsWith('/admin')) {
    if (!request.auth && pathname !== '/admin/login') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Sinon, ta logique i18n existante, inchangée
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon|logo|andy.jpg|sitemap.xml|robots.txt|.*\\..*).*)',
    '/api/admin/:path*',
  ],
};