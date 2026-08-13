import { LogoutButton } from '@/app/admin/logout-button';
import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
  type Submission = Awaited<ReturnType<typeof prisma.contactSubmission.findMany>>[number];

  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Messages reçus</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {submissions.length} message{submissions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <LogoutButton />
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-12 text-center text-sm text-neutral-500">
            Aucun message pour l&apos;instant.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Entreprise</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {submissions.map((s: Submission) => (
                  <tr key={s.id} className={s.read ? '' : 'bg-blue-50/40'}>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-600">
                      {s.createdAt.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-900">{s.name}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      <a href={`mailto:${s.email}`} className="hover:underline">
                        {s.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{s.company ?? '—'}</td>
                    <td className="max-w-xs px-4 py-3 text-neutral-600">
                      <p className="line-clamp-2 whitespace-pre-wrap">{s.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.emailSent
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {s.emailSent ? 'Email envoyé' : 'Email non envoyé'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}