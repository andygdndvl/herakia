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
import { DitherBand } from '@/components/layout/DitherBand';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Les quatre jointures sombre ↔ ivoire passent par une bande tramée
            (DitherBand) : une demi-teinte d'imprimeur dont les points
            grossissent jusqu'à l'aplat, au lieu d'un bord franc. Elle est dans
            le flux, donc elle fait aussi office de respiration. */}
        <Hero />
        <TrustedBy />
        <DitherBand to="light" />
        {/* Premier îlot clair. La règle de la page : clair = les gens, sombre =
            la machine. Personae parle des clients, il passe donc en ivoire, au
            même titre que les avis et « À propos » plus bas — mêmes jetons,
            même respiration, mêmes jointures. */}
        <div className="surface-light relative py-16 md:py-24">
          <Personae />
        </div>
        <DitherBand to="dark" />
        <WhatIsAnAgent />
        <MeetTia />
        <WhatWeHandle />
        <DitherBand to="light" />
        {/* Second îlot clair : les avis et « À propos » forment le chapitre
            ivoire du bas. Même dispositif, mêmes jointures tramées, et l'îlot
            ajoute sa propre respiration verticale à celle des deux sections. */}
        <div className="surface-light relative py-16 md:py-24">
          <GoogleReviews />
          <About />
        </div>
        <DitherBand to="dark" />
        <HowItWorks />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
