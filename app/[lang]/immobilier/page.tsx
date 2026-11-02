import type { Metadata } from 'next';
import { MetierLanding } from '@/components/metiers/MetierLanding';
import { metierMetadata } from '@/lib/metiers';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  return metierMetadata('immobilier', params.lang);
}

export default function ImmobilierPage() {
  return <MetierLanding slug="immobilier" />;
}
