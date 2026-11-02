import type { Metadata } from 'next';
import { MetierLanding } from '@/components/metiers/MetierLanding';
import { metierMetadata } from '@/lib/metiers';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  return metierMetadata('comptables', params.lang);
}

export default function ComptablesPage() {
  return <MetierLanding slug="comptables" />;
}
