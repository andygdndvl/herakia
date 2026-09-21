import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { TrustedBy } from '@/components/home/TrustedBy';
import { Personae } from '@/components/home/Personae';
import { WhatIsAnAgent } from '@/components/home/WhatIsAnAgent';
import { WhatWeHandle } from '@/components/home/WhatWeHandle';
import { About } from '@/components/home/About';
import { GoogleReviews } from '@/components/home/GoogleReviews';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CTAFinal } from '@/components/home/CTAFinal';
import { MeetTia } from '@/components/home/MeetTia';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Personae />
        <WhatIsAnAgent />
        <MeetTia />
        <WhatWeHandle />
        {/* Îlot clair : les avis et « À propos » forment un chapitre ivoire au
            milieu de la page sombre. La bascule est un changement net de fond
            — pas de dégradé, pas de filet horizontal (cf. e4c64dd) — et l'îlot
            ajoute sa propre respiration verticale à celle des deux sections. */}
        <div className="surface-light relative py-16 md:py-24">
          <GoogleReviews />
          <About />
        </div>
        <HowItWorks />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
