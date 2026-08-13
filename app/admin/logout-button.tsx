'use client';

import { signOut } from 'next-auth/react';

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/admin/login' })}
      className="rounded-md border border-bg-primary/15 px-3 py-1.5 font-sans text-sm text-bg-primary/70 transition hover:bg-white hover:text-bg-primary"
    >
      Se déconnecter
    </button>
  );
}