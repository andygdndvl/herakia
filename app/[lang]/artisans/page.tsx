import type { Metadata } from 'next';
import { MetierLanding } from '@/components/metiers/MetierLanding';
import { metierMetadata } from '@/lib/metiers';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  return metierMetadata('artisans', params.lang);
}

export default function ArtisansPage() {
  return <MetierLanding slug="artisans" />;
}
