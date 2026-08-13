import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MeetTia } from '@/components/home/MeetTia';
import { AgentDemos } from '@/components/home/AgentDemos';
import { InlineCTA } from '@/components/home/InlineCTA';
import { CTAFinal } from '@/components/home/CTAFinal';

export default function AgentsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32">
        <MeetTia />
        <InlineCTA variant="demo" />
        <AgentDemos />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}