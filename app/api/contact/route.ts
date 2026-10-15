import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  need?: string;
  message?: string;
  // Honeypot anti-spam : doit toujours rester vide (rempli uniquement par les bots).
  website?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  // Piège anti-spam : si le champ caché est rempli, on fait comme si tout allait bien.
  if (body.website && body.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim();
  const phone = (body.phone ?? '').trim();
  const company = (body.company ?? '').trim();
  const need = (body.need ?? '').trim();
  const message = (body.message ?? '').trim();

  if (!name || !email || !phone || !need || !message) {
    return NextResponse.json(
      { error: 'Nom, email, téléphone, service et message sont requis.' },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Email invalide.' }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: 'Message trop long.' }, { status: 400 });
  }

  // Deux voies indépendantes : la base (consultable dans l'admin) et l'e-mail. La demande est
  // reçue si l'une des deux aboutit : une base en pause (offre gratuite Supabase) ne doit plus
  // faire perdre de demande, comme entre fin août et le 15 octobre 2026.
  let submissionId: string | null = null;
  try {
    const submission = await prisma.contactSubmission.create({
      data: { name, email, phone, company: company || null, need, message },
    });
    submissionId = submission.id;
  } catch (err) {
    console.error('[contact] Échec écriture DB :', err);
  }

  const emailSent = await sendEmail({ name, email, phone, company, need, message });

  if (!submissionId && !emailSent) {
    return NextResponse.json(
      { error: 'Une erreur est survenue. Réessayez.' },
      { status: 500 },
    );
  }

  if (submissionId && emailSent) {
    try {
      await prisma.contactSubmission.update({
        where: { id: submissionId },
        data: { emailSent: true },
      });
    } catch (err) {
      console.error('[contact] Échec mise à jour emailSent :', err);
    }
  }

  return NextResponse.json({ ok: true });
}

/** Envoie la demande par e-mail via Resend. Renvoie `true` seulement si Resend l'a acceptée. */
async function sendEmail(c: {
  name: string;
  email: string;
  phone: string;
  company: string;
  need: string;
  message: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || 'contact@herakia.com';
  // Doit être un expéditeur sur un domaine vérifié chez Resend.
  // Avant vérification du domaine herakia.com, utiliser 'onboarding@resend.dev'.
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Herakia <onboarding@resend.dev>';

  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY manquante — email non envoyé.');
    return false;
  }

  const html = `
    <h2>Nouveau message — formulaire Herakia</h2>
    <p><strong>Nom :</strong> ${escapeHtml(c.name)}</p>
    <p><strong>Email :</strong> ${escapeHtml(c.email)}</p>
    <p><strong>Téléphone :</strong> ${escapeHtml(c.phone)}</p>
    <p><strong>Entreprise :</strong> ${c.company ? escapeHtml(c.company) : '—'}</p>
    <p><strong>Offre souhaitée :</strong> ${escapeHtml(c.need)}</p>
    <p><strong>Message :</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(c.message)}</p>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: c.email,
        subject: `Contact Herakia — ${c.name}${c.company ? ` (${c.company})` : ''}`,
        html,
      }),
    });
    if (res.ok) return true;
    console.error('[contact] Échec Resend :', res.status, await res.text());
  } catch (err) {
    console.error('[contact] Erreur réseau Resend :', err);
  }
  return false;
}
