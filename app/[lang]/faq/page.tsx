import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FAQ } from '@/components/home/FAQ';
import { CTAFinal } from '@/components/home/CTAFinal';

export default function FAQPage() {
  return (
    <>
        <Navbar />
        <main className="min-h-screen pt-20">
        <FAQ />
        <CTAFinal />  
        </main>
        <Footer />
    </>
  );
}