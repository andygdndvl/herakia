'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/components/i18n/LangProvider';

const GA_ID = 'G-B1VYENR8Q6';
const STORAGE_KEY = 'herakia-cookie-consent';
const RESET_EVENT = 'herakia:cookie-consent-reset';
// 13 mois : durée de vie maximale recommandée par la CNIL pour un cookie de mesure d'audience.
const COOKIE_MAX_AGE_SECONDS = 34_128_000;
// 6 mois : au-delà, la CNIL recommande de redemander le choix (accord comme refus).
const CHOICE_MAX_AGE_MS = 182 * 24 * 60 * 60 * 1000;

type Choice = 'granted' | 'denied';

const copy = {
  fr: {
    label: 'Consentement aux cookies',
    text: 'Nous utilisons Google Analytics pour mesurer l’audience du site. Aucun cookie de mesure n’est déposé sans votre accord.',
    more: 'En savoir plus',
    refuse: 'Refuser',
    accept: 'Accepter',
    manage: 'Modifier mon choix',
    manageFooter: 'Gérer les cookies',
  },
  en: {
    label: 'Cookie consent',
    text: 'We use Google Analytics to measure the site’s audience. No measurement cookie is set without your consent.',
    more: 'Learn more',
    refuse: 'Decline',
    accept: 'Accept',
    manage: 'Change my choice',
    manageFooter: 'Manage cookies',
  },
} as const;

function readChoice(): Choice | null {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (stored?.choice !== 'granted' && stored?.choice !== 'denied') return null;
    if (typeof stored.at !== 'number' || Date.now() - stored.at > CHOICE_MAX_AGE_MS) return null;
    return stored.choice;
  } catch {
    return null;
  }
}

function writeChoice(choice: Choice | null) {
  try {
    if (choice) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, at: Date.now() }));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Stockage indisponible (navigation privée) : le choix vaut pour la page en cours.
  }
}

// Coupe la mesure et efface les cookies Google Analytics déjà déposés.
function disableAnalytics() {
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true;
  const domain = window.location.hostname.replace(/^www\./, '');
  document.cookie.split(';').forEach((entry) => {
    const name = entry.split('=')[0].trim();
    if (!name.startsWith('_ga')) return;
    document.cookie = `${name}=; Max-Age=0; path=/`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`;
  });
}

/**
 * Bandeau de consentement : Google Analytics n'est chargé qu'après un « Accepter ».
 * Le choix est mémorisé dans le navigateur et se modifie depuis la politique de confidentialité.
 */
export function CookieConsent() {
  const { lang } = useI18n();
  const t = copy[lang];
  const [choice, setChoice] = useState<Choice | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setChoice(readChoice());
    setReady(true);
    const reset = () => {
      writeChoice(null);
      disableAnalytics();
      setChoice(null);
    };
    window.addEventListener(RESET_EVENT, reset);
    return () => window.removeEventListener(RESET_EVENT, reset);
  }, []);

  const decide = (next: Choice) => {
    writeChoice(next);
    if (next === 'denied') disableAnalytics();
    else (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = false;
    setChoice(next);
  };

  return (
    <>
      {choice === 'granted' && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="google-tag-gtag" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { cookie_expires: ${COOKIE_MAX_AGE_SECONDS} });
            `}
          </Script>
        </>
      )}

      {ready && choice === null && (
        <div
          role="region"
          aria-label={t.label}
          className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-2xl flex-col gap-4 rounded-2xl border border-border-strong bg-bg-elevated p-5 shadow-2xl sm:flex-row sm:items-center sm:gap-6"
        >
          <p className="font-sans text-sm leading-relaxed text-text-secondary">
            {t.text}{' '}
            <Link
              href={`/${lang}/confidentialite`}
              className="text-green-primary underline-offset-4 hover:underline"
            >
              {t.more}
            </Link>
          </p>
          <div className="flex shrink-0 gap-3">
            <Button variant="secondary" size="sm" onClick={() => decide('denied')}>
              {t.refuse}
            </Button>
            <Button variant="primary" size="sm" onClick={() => decide('granted')}>
              {t.accept}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

/** Rouvre le bandeau pour changer d'avis (politique de confidentialité et pied de page). */
export function ManageCookiesButton({ variant = 'inline' }: { variant?: 'inline' | 'footer' }) {
  const { lang } = useI18n();
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(RESET_EVENT))}
      className={
        variant === 'footer'
          ? 'font-sans text-sm text-text-secondary transition-colors hover:text-green-primary'
          : 'text-green-primary underline-offset-4 hover:underline'
      }
    >
      {variant === 'footer' ? copy[lang].manageFooter : copy[lang].manage}
    </button>
  );
}
