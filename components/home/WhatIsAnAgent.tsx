'use client';

import { useReveal } from '@/lib/anim';
import { ArrowRight } from 'lucide-react';
import { AgentObjectSection } from '@/components/agent-object/AgentObjectSection';
import { BenefitsScene, type Benefit } from '@/components/home/BenefitsScene';
import { Button } from '@/components/ui/Button';
import { useLang, localize } from '@/components/i18n/LangProvider';

const TEXT = {
  fr: {
    benefitsIntro: 'Concrètement, pour vous',
    benefits: [
      { preview: 'sent', title: 'Du temps rendu', desc: 'Des heures rendues à vos équipes, chaque semaine.' },
      { preview: 'calls', title: 'Vos équipes déchargées', desc: 'Le répétitif quitte leur assiette — place à ce qui compte.' },
      { preview: 'chat', title: 'Sans recruter', desc: 'De la capacité en plus, sans embaucher ni charges.' },
    ] as Benefit[],
    demoCta: 'Voir un agent en action',
  },
  en: {
    benefitsIntro: 'Concretely, for you',
    benefits: [
      { preview: 'sent', title: 'Time given back', desc: 'Hours returned to your teams, every week.' },
      { preview: 'calls', title: 'Teams offloaded', desc: 'The repetitive work leaves their plate — room for what matters.' },
      { preview: 'chat', title: 'No hiring needed', desc: 'Extra capacity, without recruiting or payroll.' },
    ] as Benefit[],
    demoCta: 'See an agent in action',
  },
} as const;

export function WhatIsAnAgent() {
  const lang = useLang();
  const t = TEXT[lang];
  const revealRef = useReveal<HTMLDivElement>({ stagger: 140 });
  return (
    <>
    <AgentObjectSection />
    <section className="relative overflow-hidden px-6 pb-32 lg:px-8">
      <div ref={revealRef} className="mx-auto max-w-6xl">
        {/* Bénéfices concrets pour le client : une scène, trois bénéfices */}
        <div data-reveal className="mt-16 border-t border-border-subtle pt-12">
          <BenefitsScene intro={t.benefitsIntro} benefits={t.benefits} />
        </div>

        {/* Renvoi vers la page démo */}
        <div
          data-reveal
          className="mt-12 flex justify-center"
        >
          <Button href={localize(lang, '/demo')} variant="primary" size="lg">
            {t.demoCta}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
    </>
  );
}
