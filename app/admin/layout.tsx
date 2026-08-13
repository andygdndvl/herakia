// Ignore missing type declarations for CSS side-effect import
// @ts-ignore
import '../globals.css';
import { SessionProvider } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-bg-primary font-sans text-text-primary">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}