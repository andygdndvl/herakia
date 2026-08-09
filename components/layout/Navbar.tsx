'use client';

import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Languages } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDict, useLang, localize } from '@/components/i18n/LangProvider';

export function Navbar() {
  const dict = useDict();
  const lang = useLang();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });

  const links = [
    { href: '/', label: dict.nav.home },
    { href: '/services', label: dict.nav.services },
    { href: '/#faq', label: dict.nav.faq },
  ];

  const otherLang = lang === 'fr' ? 'en' : 'fr';
  const switchHref = pathname.replace(/^\/(fr|en)(?=\/|$)/, `/${otherLang}`);

  return (
    <>
      <motion.header
        initial={{ y: prefersReducedMotion ? 0 : -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-border-subtle bg-bg-primary/80 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href={localize(lang, '/')} className="group relative flex items-center gap-2" aria-label="Herakia">
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-green-subtle">
              <span className="font-display text-lg font-bold text-green-primary">O</span>
              <motion.span
                className="absolute inset-0 rounded-lg bg-green-primary/20"
                animate={prefersReducedMotion ? {} : { opacity: [0, 0.5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-text-primary">
              Herakia
            </span>
          </Link>

          <ul className="hidden items-center gap-8 lg:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={localize(lang, link.href)}
                  className="group relative font-sans text-sm text-text-secondary transition-colors hover:text-text-primary"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-green-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-4 lg:flex">
            <Link
              href={switchHref}
              aria-label={dict.nav.switchAria}
              className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors hover:text-green-primary"
            >
              <Languages className="h-4 w-4" />
              {otherLang.toUpperCase()}
            </Link>
            <Button href={localize(lang, '/contact')} variant="primary" size="sm">
              {dict.nav.cta}
            </Button>
          </div>

          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? dict.nav.closeMenu : dict.nav.openMenu}
          >
            {mobileOpen ? (
              <X className="h-6 w-6 text-text-primary" />
            ) : (
              <Menu className="h-6 w-6 text-text-primary" />
            )}
          </button>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-border-subtle bg-bg-primary/95 backdrop-blur-xl lg:hidden"
            >
              <ul className="space-y-2 px-6 py-6">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={localize(lang, link.href)}
                      onClick={() => setMobileOpen(false)}
                      className="block py-2 font-sans text-text-secondary hover:text-green-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={switchHref}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-1.5 py-2 font-mono text-xs uppercase tracking-wider text-text-secondary hover:text-green-primary"
                  >
                    <Languages className="h-4 w-4" />
                    {dict.nav.switchTo}
                  </Link>
                </li>
                <li className="pt-4">
                  <Button href={localize(lang, '/contact')} variant="primary" size="md" className="w-full">
                    {dict.nav.cta}
                  </Button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
        {!prefersReducedMotion && (
          <motion.div
            className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-green-primary"
            style={{ scaleX: scrollYProgress }}
          />
        )}
      </motion.header>
    </>
  );
}
