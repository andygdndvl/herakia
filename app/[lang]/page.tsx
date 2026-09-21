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
import { TiaInlineCTA } from '@/components/home/TiaInlineCTA';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Personae />
        <WhatIsAnAgent />
        <TiaInlineCTA />
        <WhatWeHandle />
        <MeetTia />
        <GoogleReviews />
        <About />
        <HowItWorks />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
