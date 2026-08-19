import { LogoutButton } from './logout-button';
import { SubmissionsTable } from './submissions-table';
import { CallsTable } from './calls-table';
import { prisma } from '@/lib/prisma';
import { ContactSubmission } from '@prisma/client';

// Sans ça, Next.js n'a aucun signal de "donnée dynamique" sur cette page
// (pas de cookies()/headers() appelés ici) et la fige en statique au build :
// les demandes reçues après le déploiement n'apparaissaient jamais.
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [submissions, calls] = await Promise.all([
    prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tiaCall.findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const formatted = submissions.map((s: ContactSubmission) => ({
    id: s.id,
    date: s.createdAt.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
    name: s.name,
    email: s.email,
    phone: s.phone,
    company: s.company,
    need: s.need,
    message: s.message,
    read: s.read,
    emailSent: s.emailSent,
    processed: s.processed,
  }));

  const formattedCalls = calls.map((c) => ({
    id: c.id,
    conversationId: c.conversationId,
    date: c.createdAt.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
    durationSecs: c.durationSecs,
    callSuccessful: c.callSuccessful,
    summary: c.summary,
    transcript: c.transcript as unknown as { role: 'agent' | 'user'; message: string | null }[],
    read: c.read,
    processed: c.processed,
  }));

  return (
    <div className="min-h-screen bg-text-primary px-4 py-8 font-sans text-bg-primary sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-semibold text-bg-primary">
              Messages reçus
            </h1>
            <p className="mt-1 font-mono text-sm text-bg-primary/50">
              {submissions.length} message{submissions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <LogoutButton />
        </div>

        {formatted.length === 0 ? (
          <div className="rounded-lg border border-dashed border-bg-primary/15 bg-white p-12 text-center text-sm text-bg-primary/50">
            Aucun message pour l&apos;instant.
          </div>
        ) : (
          <SubmissionsTable submissions={formatted} />
        )}

        <div className="mb-6 mt-12 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-semibold text-bg-primary">
              Appels avec Tia
            </h1>
            <p className="mt-1 font-mono text-sm text-bg-primary/50">
              {calls.length} appel{calls.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {formattedCalls.length === 0 ? (
          <div className="rounded-lg border border-dashed border-bg-primary/15 bg-white p-12 text-center text-sm text-bg-primary/50">
            Aucun appel pour l&apos;instant.
          </div>
        ) : (
          <CallsTable calls={formattedCalls} />
        )}
      </div>
    </div>
  );
}