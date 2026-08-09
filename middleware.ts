import { NextResponse, type NextRequest } from 'next/server';
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Le chemin a-t-il déjà un préfixe de langue ?
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  // Sinon, redirige vers la langue détectée en conservant le chemin.
  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Exclut les fichiers statiques, l'API, les assets et les fichiers SEO racine.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon|logo|andy.jpg|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
};
