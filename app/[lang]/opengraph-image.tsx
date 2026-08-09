import { ImageResponse } from 'next/og';
import { locales } from '@/dictionaries';
import { LOGO_MARK_PNG } from './og-logo';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const COPY = {
  fr: {
    alt: 'Herakia — Automatisation IA sur-mesure',
    eyebrow: 'Agence IA · France',
    line1: 'Automatisation IA',
    line2: 'sur-mesure.',
    sub: 'On règle vos tâches les plus chronophages.',
    footer: 'Diagnostic offert · sans engagement',
  },
  en: {
    alt: 'Herakia — Bespoke AI automation',
    eyebrow: 'AI agency · France',
    line1: 'AI automation,',
    line2: 'bespoke.',
    sub: 'We handle your most time-consuming tasks.',
    footer: 'Free assessment · no commitment',
  },
} as const;

export default function Image({ params }: { params: { lang: string } }) {
  const c = params.lang === 'en' ? COPY.en : COPY.fr;
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0a0a0a',
          padding: '80px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-220px',
            right: '-160px',
            width: '720px',
            height: '720px',
            borderRadius: '9999px',
            background: 'radial-gradient(circle, rgba(62,207,142,0.28), rgba(62,207,142,0))',
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_MARK_PNG} alt="" width={60} height={60} />
          <span
            style={{ color: '#f0f0f0', fontSize: '36px', fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            Herakia
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              color: '#3ecf8e',
              fontSize: '22px',
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: '26px',
            }}
          >
            {c.eyebrow}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                color: '#f0f0f0',
                fontSize: '84px',
                fontWeight: 800,
                lineHeight: 1.04,
                letterSpacing: '-0.03em',
              }}
            >
              {c.line1}
            </span>
            <span
              style={{
                color: '#3ecf8e',
                fontSize: '84px',
                fontWeight: 800,
                lineHeight: 1.04,
                letterSpacing: '-0.03em',
              }}
            >
              {c.line2}
            </span>
          </div>
          <span
            style={{ color: '#a0a0a0', fontSize: '34px', fontWeight: 400, marginTop: '28px' }}
          >
            {c.sub}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#666666', fontSize: '26px' }}>herakia.com</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '11px',
                height: '11px',
                borderRadius: '9999px',
                backgroundColor: '#3ecf8e',
                display: 'flex',
              }}
            />
            <span style={{ color: '#a0a0a0', fontSize: '22px' }}>{c.footer}</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
