import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Jamais mis en cache : la requête doit atteindre la base à chaque passage.
export const dynamic = 'force-dynamic';

/**
 * Appelée chaque jour par la tâche planifiée Vercel (`vercel.json`). Une base Supabase gratuite
 * sans activité pendant une semaine est mise en pause et ne se relance pas seule : le formulaire
 * de contact et les récapitulatifs de Tia tombent alors en panne sans prévenir.
 */
export async function GET(request: Request) {
  // Si CRON_SECRET est défini sur Vercel, Vercel l'envoie en en-tête : on refuse les autres appels.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const submissions = await prisma.contactSubmission.count();
    return NextResponse.json({ ok: true, submissions });
  } catch (err) {
    console.error('[keepalive] Base injoignable :', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
