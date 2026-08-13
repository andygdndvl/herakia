'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { Sunrise, Coffee, Sun, Moon, type LucideIcon } from 'lucide-react';
import { useLang } from '@/components/i18n/LangProvider';

interface Scene {
  icon: LucideIcon;
  time: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

const IMAGES = ['/after-1.png', '/after-2.png', '/after-3.png', '/after-4.png'];
const ICONS = [Sunrise, Coffee, Sun, Moon];

const TEXT = {
  fr: {
    eyebrow: 'L’après',
    titleLead: 'À quoi ressemble une ',
    titleAccent: 'semaine',
    titleTail: ' avec Herakia.',
    subtitle:
      "Pas des chiffres, des scènes. Voici ce que vivent concrètement les équipes qu'on accompagne, une fois les agents en place.",
    boxTitle: 'C’est ça, le vrai ROI.',
    boxBody: 'Les chiffres viennent ensuite. Mais c’est cette semaine-là qui change tout.',
    scenes: [
      { time: 'Lundi · 9h00', title: 'Vous ouvrez votre boîte mail.', description: 'Les 47 emails à trier hier soir ont déjà été traités. Vos équipes ne se réveillent plus en pensant à la pile en attente. Elles peuvent enfin penser au prochain trimestre.', imageAlt: 'Bureau lumineux le matin, lumière tamisée' },
      { time: 'Mardi · 11h30', title: 'Vos commerciaux prennent un café.', description: "Pendant qu'ils discutent stratégie, 38 relances personnalisées partent toutes seules et 22 nouveaux leads sont qualifiés en arrière-plan. Aucune notification ne les interrompt.", imageAlt: 'Pause café en équipe' },
      { time: 'Jeudi · 14h00', title: 'Comité de direction.', description: 'Vous présentez des KPIs à jour, des chiffres fiables, des courbes qui montent. Plus personne ne dit « je vous envoie ça plus tard ». Le tableau de bord existe vraiment.', imageAlt: 'Tableau blanc et notes, salle de réunion' },
      { time: 'Vendredi · 18h30', title: 'Vous fermez votre laptop.', description: 'Pas de mail « juste un dernier truc » en arrivant chez vous. Pas de pile de relances pour lundi. Le week-end commence vraiment, et lundi commencera bien.', imageAlt: 'Bureau rangé en fin de journée' },
    ],
  },
  en: {
    eyebrow: 'The after',
    titleLead: 'What a ',
    titleAccent: 'week',
    titleTail: ' with Herakia looks like.',
    subtitle:
      'Not numbers, scenes. Here is what the teams we work with actually experience, once the agents are in place.',
    boxTitle: 'That’s the real ROI.',
    boxBody: 'The numbers come later. But it’s that week that changes everything.',
    scenes: [
      { time: 'Monday · 9:00', title: 'You open your inbox.', description: 'The 47 emails to sort last night have already been handled. Your teams no longer wake up thinking about the backlog. They can finally think about next quarter.', imageAlt: 'Bright office in the morning, soft light' },
      { time: 'Tuesday · 11:30', title: 'Your sales reps grab a coffee.', description: 'While they talk strategy, 38 personalised follow-ups go out on their own and 22 new leads are qualified in the background. No notification interrupts them.', imageAlt: 'Team coffee break' },
      { time: 'Thursday · 14:00', title: 'Leadership meeting.', description: 'You present up-to-date KPIs, reliable figures, curves trending up. No one says “I’ll send that over later”. The dashboard actually exists.', imageAlt: 'Whiteboard and notes, meeting room' },
      { time: 'Friday · 18:30', title: 'You close your laptop.', description: 'No “just one last thing” email when you get home. No pile of follow-ups for Monday. The weekend really begins, and Monday will start well.', imageAlt: 'Tidy desk at the end of the day' },
    ],
  },
} as const;

export function EmotionalAfter() {
  const prefersReducedMotion = useReducedMotion();
  const t = TEXT[useLang()];
  const scenes: Scene[] = t.scenes.map((s, i) => ({ ...s, icon: ICONS[i], imageSrc: IMAGES[i] }));

  return (
    <section className="relative overflow-hidden border-y border-border-subtle bg-bg-secondary/40 px-6 py-32 lg:px-8">
      <div
        className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-primary/5 blur-[140px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="block font-mono text-xs uppercase tracking-widest text-green-primary">
            {t.eyebrow}
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl lg:text-6xl text-balance">
            {t.titleLead}
            <span className="text-green-primary">{t.titleAccent}</span>
            {t.titleTail}
          </h2>
          <p className="mt-6 font-sans text-lg leading-relaxed text-text-secondary md:text-xl">
            {t.subtitle}
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {scenes.map((scene, idx) => {
            const Icon = scene.icon;
            return (
              <motion.article
                key={scene.time}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-primary/40 backdrop-blur-md transition-all duration-300 hover:border-border-green"
              >
                <div className="grid md:grid-cols-[40%_1fr]">
                  <div className="relative aspect-[4/3] md:aspect-auto md:h-full">
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                      <Image
                        src={scene.imageSrc}
                        alt={scene.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 40vw"
                        className="object-cover saturate-[0.6]"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-bg-primary/40 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-bg-primary/80"
                        aria-hidden="true"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-green-primary/20 via-transparent to-transparent mix-blend-soft-light"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div className="relative flex flex-col justify-center p-6 md:p-8">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-green bg-green-subtle">
                        <Icon className="h-4 w-4 text-green-primary" />
                      </span>
                      <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
                        {scene.time}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-xl font-bold leading-tight text-text-primary md:text-2xl text-balance">
                      {scene.title}
                    </h3>

                    <p className="mt-3 font-sans text-sm leading-relaxed text-text-secondary md:text-base">
                      {scene.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto mt-12 max-w-2xl rounded-2xl border border-border-green bg-green-subtle px-6 py-5 text-center"
        >
          <p className="font-display text-lg font-semibold text-text-primary md:text-xl">
            {t.boxTitle}
          </p>
          <p className="mt-1 font-sans text-sm text-text-secondary md:text-base">{t.boxBody}</p>
        </motion.div>
      </div>
    </section>
  );
}
