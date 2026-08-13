import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { Personae } from '@/components/home/Personae';
import { WhatIsAnAgent } from '@/components/home/WhatIsAnAgent';
import { WhatWeHandle } from '@/components/home/WhatWeHandle';
import { About } from '@/components/home/About';
import { CTAFinal } from '@/components/home/CTAFinal';
import { MeetTia } from '@/components/home/MeetTia';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Personae />
        <MeetTia />
        <WhatIsAnAgent />
        <WhatWeHandle />
        <About />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
