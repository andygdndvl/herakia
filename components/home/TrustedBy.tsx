'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { clientLogos as logos } from '@/components/home/clientLogos';
import { useScrollProgress } from '@/lib/anim';

const REPEAT = 4;

export function TrustedBy() {
  const lang = useLang();
  const label = lang === 'en' ? 'Trusted by' : 'Ils nous ont fait confiance';
  const trackRef = useRef<HTMLDivElement>(null);

  // Le bandeau avance d'une répétition pendant que la section traverse l'écran
  const sectionRef = useScrollProgress<HTMLElement>(
    (p) => {
      if (trackRef.current) trackRef.current.style.transform = `translate3d(${-(100 / REPEAT) * p}%, 0, 0)`;
    },
    { enter: 'bottom top', leave: 'top bottom', sync: true },
  );

  return (
    // Palier 1 : le bandeau de logos ouvre le premier cran de valeur et le
    // partage avec Personae — les deux se lisent comme un seul bloc.
    <section ref={sectionRef} className="tier-1 relative border-y border-border-subtle py-12" aria-label={label}>
      <p className="mb-8 text-center font-mono text-xs uppercase tracking-widest text-text-muted">{label}</p>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div ref={trackRef} className="flex w-max items-center gap-20 will-change-transform">
          {Array.from({ length: REPEAT }).flatMap((_, r) =>
            logos.map((logo) => (
              <div
                key={`${r}-${logo.name}`}
                className="flex h-16 w-36 shrink-0 items-center justify-center md:h-20 md:w-44"
                aria-hidden={r > 0}
              >
                <Image
                  src={logo.src}
                  alt={r === 0 ? logo.name : ''}
                  width={logo.width}
                  height={logo.height}
                  className="h-full w-full object-contain opacity-80 brightness-0 invert"
                  style={{ transform: `scale(${logo.scale})` }}
                />
              </div>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
