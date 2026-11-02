import type { Metadata } from 'next';
import { MetierLanding } from '@/components/metiers/MetierLanding';
import { metierMetadata } from '@/lib/metiers';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  return metierMetadata('sante', params.lang);
}

export default function SantePage() {
  return <MetierLanding slug="sante" />;
}
