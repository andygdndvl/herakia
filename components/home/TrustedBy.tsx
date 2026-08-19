'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLang } from '@/components/i18n/LangProvider';

const logos = [
  { name: 'IPSSI', src: '/logos/ipssi.png', width: 592, height: 158, scale: 0.85 },
  { name: 'Jean Louis David', src: '/logos/jean-louis-david.png', width: 1913, height: 228, scale: 1.15 },
  { name: 'Privilux Riviera', src: '/logos/privilux-riviera.png', width: 788, height: 567, scale: 1 },
];

export function TrustedBy() {
  const lang = useLang();
  const label = lang === 'en' ? 'Trusted by' : 'Ils nous ont fait confiance';

  return (
    <section
      className="relative border-y border-border-subtle bg-bg-secondary/30 py-12"
      aria-label={label}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="mb-8 text-center font-mono text-xs uppercase tracking-widest text-text-muted">
          {label}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-20 gap-y-8">
          {logos.map((logo, idx) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="flex h-16 w-36 items-center justify-center md:h-20 md:w-44"
            >
              <Image
                src={logo.src}
                alt={logo.name}
                width={logo.width}
                height={logo.height}
                className="h-full w-full object-contain opacity-80 brightness-0 invert"
                style={{ transform: `scale(${logo.scale})` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
