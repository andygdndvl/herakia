import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { HeroScene } from '@/components/home/HeroScene';
import { MeetTia } from '@/components/home/MeetTia';
import { ProductShowcase } from '@/components/home/ProductShowcase';
import { Personae } from '@/components/home/Personae';
import { WhatWeHandle } from '@/components/home/WhatWeHandle';
import { Services } from '@/components/home/Services';
import { WhatIsAnAgent } from '@/components/home/WhatIsAnAgent';
import { AgentDemos } from '@/components/home/AgentDemos';
import { InlineCTA } from '@/components/home/InlineCTA';
import { EmotionalAfter } from '@/components/home/EmotionalAfter';
import { Stats } from '@/components/home/Stats';
import { About } from '@/components/home/About';
import { TechStack } from '@/components/home/TechStack';
import { FAQ } from '@/components/home/FAQ';
import { CTAFinal } from '@/components/home/CTAFinal';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HeroScene />
        <MeetTia />
        <Personae />
        <WhatIsAnAgent />
        <InlineCTA variant="scoping" />
        <WhatWeHandle />
        <AgentDemos />
        <InlineCTA variant="demo" />
        <Services />
        <ProductShowcase />
        <InlineCTA variant="build" />
        <EmotionalAfter />
        <Stats />
        <About />
        <TechStack />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
