'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Fragment, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { wordChild, wordStagger } from '@/lib/animations';
import { useDict, useLang, localize } from '@/components/i18n/LangProvider';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

function ParticleField({ disabled }: { disabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = 0;
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 60;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    const init = () => {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.5 + 0.2,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(62, 207, 142, ${p.alpha})`;
        ctx.shadowColor = 'rgba(62, 207, 142, 0.5)';
        ctx.shadowBlur = 6;
        ctx.fill();
      });

      ctx.shadowBlur = 0;

      // connecter les particules proches
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(62, 207, 142, ${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    init();
    draw();

    const handleResize = () => {
      resize();
      init();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [disabled]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const dict = useDict();
  const lang = useLang();
  const titleLine1 = dict.hero.titleLine1;
  const titleLine2 = dict.hero.titleLine2;
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Fond : se déplace vers le bas → apparaît plus lent que le scroll (profondeur)
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 220]);
  // Blob : vitesse intermédiaire
  const yBlob = useTransform(scrollYProgress, [0, 1], [0, 110]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-32 pb-20 lg:px-8"
    >
      {/* Couche fond — étendue vers le bas pour absorber le déplacement parallax */}
      <motion.div
        style={prefersReducedMotion ? undefined : { y: yBg }}
        className="pointer-events-none absolute inset-x-0 top-0 -bottom-[220px]"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-grid-pattern bg-grid-md opacity-50" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-bg-primary/40 to-bg-primary" />
        <ParticleField disabled={!!prefersReducedMotion} />
      </motion.div>

      {/* Blob — vitesse intermédiaire */}
      <motion.div
        style={prefersReducedMotion ? undefined : { y: yBlob }}
        className="absolute left-1/2 top-1/2 -z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-primary/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Badge pulse>{dict.hero.badge}</Badge>
        </motion.div>

        <motion.h1
          variants={wordStagger}
          initial="hidden"
          animate="visible"
          className="mt-8 font-display text-5xl font-bold leading-[1.05] tracking-tight text-text-primary md:text-6xl lg:text-7xl xl:text-8xl text-balance"
        >
          <span className="block">
            {titleLine1.map((word, i) => (
              <Fragment key={`l1-${i}`}>
                <motion.span variants={wordChild} className="inline-block">
                  {word}
                </motion.span>
                {' '}
              </Fragment>
            ))}
          </span>
          <span className="block">
            {titleLine2.map((word, i) => (
              <Fragment key={`l2-${i}`}>
                <motion.span
                  variants={wordChild}
                  className={`inline-block ${i === titleLine2.length - 1 ? 'text-green-primary' : ''}`}
                >
                  {word}
                </motion.span>
                {i < titleLine2.length - 1 && ' '}
              </Fragment>
            ))}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 max-w-2xl font-sans text-lg leading-relaxed text-text-secondary md:text-xl text-balance"
        >
          {dict.hero.subtitleBody}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button href={localize(lang, '/contact')} variant="primary" size="lg">
            {dict.hero.ctaPrimary}
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button href={localize(lang, '/services')} variant="secondary" size="lg">
            {dict.hero.ctaSecondary}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="mt-16 flex items-center justify-center gap-6 font-mono text-xs uppercase tracking-wider text-text-muted"
        >
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-green-primary" /> {dict.hero.chip1}
          </span>
          <span className="hidden h-px w-12 bg-border-subtle sm:block" />
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-green-primary" /> {dict.hero.chip2}
          </span>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={() => {
          document.getElementById('personae')?.scrollIntoView({ behavior: 'smooth' });
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: prefersReducedMotion ? 0 : [0, 8, 0] }}
        transition={{
          opacity: { duration: 0.6, delay: 1.8 },
          y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted hover:text-green-primary"
        aria-label={dict.hero.scrollAria}
      >
        <ChevronDown className="h-6 w-6" />
      </motion.button>
    </section>
  );
}
