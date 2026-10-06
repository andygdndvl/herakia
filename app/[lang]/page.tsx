import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { VideoPitch } from '@/components/home/VideoPitch';
import { Chantiers } from '@/components/home/Chantiers';
import { TrustedBy } from '@/components/home/TrustedBy';
import { Personae } from '@/components/home/Personae';
import { WhatIsAnAgent } from '@/components/home/WhatIsAnAgent';
import { WhatWeHandle } from '@/components/home/WhatWeHandle';
import { About } from '@/components/home/About';
import { GoogleReviews } from '@/components/home/GoogleReviews';
import { CTAFinal } from '@/components/home/CTAFinal';
import { MeetTia } from '@/components/home/MeetTia';

export default function HomePage() {
  return (
    <>
      <Navbar />
      {/* Rythme de la page : toute la page est sombre, le découpage vient de
          paliers de valeur portés par les sections elles-mêmes (`.tier-1` /
          `.tier-2`, cf. app/globals.css).
            Hero 0 · VideoPitch 0 · TrustedBy 1 · Chantiers 1 · Personae 1 · objet + métiers 0 ·
            MeetTia 1 · WhatWeHandle 0 · GoogleReviews 1 · About 0 ·
            CTAFinal 2
          Deux voisines ne partagent un niveau que lorsqu'elles forment un seul
          bloc de lecture (hero + film, logos + chantiers + personae, objet + métiers) : les
          trois logos, les trois cas qu'ils signent et les profils à qui ils
          parlent sont la même démonstration, filet après filet.
          La promesse (hero, niveau 0) est aussitôt suivie de ses preuves. */}
      <main>
        <Hero />
        <VideoPitch />
        <TrustedBy />
        <Chantiers />
        <Personae />
        <WhatIsAnAgent />
        <MeetTia />
        <WhatWeHandle />
        <GoogleReviews />
        <About />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
