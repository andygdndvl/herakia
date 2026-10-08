'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { useDict, useLang, localize } from '@/components/i18n/LangProvider';
import { Logo } from '@/components/ui/Logo';
import { ManageCookiesButton } from '@/components/layout/CookieConsent';

export function Footer() {
  const dict = useDict();
  const lang = useLang();
  const year = 2026;

  const product = [
    { name: dict.footer.linkServices, href: '/services' },
    { name: dict.footer.linkMethod, href: '/#process' },
    { name: dict.footer.linkOffres, href: '/offres' },
    { name: dict.footer.linkFaq, href: '/#faq' },
  ];
  const contact = [
    { name: dict.footer.linkStart, href: '/contact', external: false },
    {
      name: 'contact@herakia.com',
      href: 'mailto:contact@herakia.com',
      external: true,
    },
  ];
  const legal = [
    { name: dict.footer.linkLegalNotice, href: '/mentions-legales' },
    { name: dict.footer.linkPrivacy, href: '/confidentialite' },
    { name: dict.footer.linkTerms, href: '/cgu' },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-border-subtle bg-bg-secondary">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-primary/60 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href={localize(lang, '/')} className="flex items-center" aria-label="Herakia">
              <Logo className="h-8 w-auto" />
            </Link>
            <p className="mt-6 max-w-md font-sans text-sm leading-relaxed text-text-secondary">
              {dict.footer.tagline}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="mailto:contact@herakia.com"
                aria-label={dict.footer.emailAria}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition-all hover:border-green-primary/40 hover:text-green-primary"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-text-primary">
              {dict.footer.colProduct}
            </h3>
            <ul className="mt-6 space-y-3">
              {product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={localize(lang, item.href)}
                    className="font-sans text-sm text-text-secondary transition-colors hover:text-green-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-text-primary">
              {dict.footer.colContact}
            </h3>
            <ul className="mt-6 space-y-3">
              {contact.map((item) => (
                <li key={item.name}>
                  {item.external ? (
                    <a
                      href={item.href}
                      className="font-sans text-sm text-text-secondary transition-colors hover:text-green-primary"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      href={localize(lang, item.href)}
                      className="font-sans text-sm text-text-secondary transition-colors hover:text-green-primary"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-text-primary">
              {dict.footer.colLegal}
            </h3>
            <ul className="mt-6 space-y-3">
              {legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={localize(lang, item.href)}
                    className="font-sans text-sm text-text-secondary transition-colors hover:text-green-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <ManageCookiesButton variant="footer" />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border-subtle pt-8 sm:flex-row">
          <p className="font-mono text-xs text-text-muted">
            © {year} Herakia. {dict.footer.rights}
          </p>
          <p className="font-mono text-xs text-text-muted">{dict.footer.slogan}</p>
        </div>
      </div>
    </footer>
  );
}
