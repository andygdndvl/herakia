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

  // 1. Persistance en DB d'abord — c'est la source de vérité.
  // Si ça échoue, on arrête là : pas la peine d'envoyer un email qu'on ne pourra pas retrouver.
  let submissionId: string;
  try {
    const submission = await prisma.contactSubmission.create({
      data: { name, email, phone, company: company || null, need, message },
    });
    submissionId = submission.id;
  } catch (err) {
    console.error('[contact] Échec écriture DB :', err);
    return NextResponse.json(
      { error: 'Une erreur est survenue. Réessayez.' },
      { status: 500 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || 'contact@herakia.com';
  // Doit être un expéditeur sur un domaine vérifié chez Resend.
  // Avant vérification du domaine herakia.com, utiliser 'onboarding@resend.dev'.
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Herakia <onboarding@resend.dev>';

  // 2. Envoi de l'email — best effort, ne bloque pas la réussite si ça échoue
  // (les données sont déjà en DB, consultables via l'admin).
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY manquante — email non envoyé, mais données enregistrées.');
    return NextResponse.json({ ok: true });
  }

  const html = `
    <h2>Nouveau message — formulaire Herakia</h2>
    <p><strong>Nom :</strong> ${escapeHtml(name)}</p>
    <p><strong>Email :</strong> ${escapeHtml(email)}</p>
    <p><strong>Téléphone :</strong> ${escapeHtml(phone)}</p>
    <p><strong>Entreprise :</strong> ${company ? escapeHtml(company) : '—'}</p>
    <p><strong>Service souhaité :</strong> ${escapeHtml(need)}</p>
    <p><strong>Message :</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
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
        reply_to: email,
        subject: `Contact Herakia — ${name}${company ? ` (${company})` : ''}`,
        html,
      }),
    });

    if (res.ok) {
      await prisma.contactSubmission.update({
        where: { id: submissionId },
        data: { emailSent: true },
      });
    } else {
      const detail = await res.text();
      console.error('[contact] Échec Resend :', res.status, detail);
    }
  } catch (err) {
    console.error('[contact] Erreur réseau Resend :', err);
  }

  // On répond ok même si l'email a échoué : les données sont sauvegardées.
  return NextResponse.json({ ok: true });
}