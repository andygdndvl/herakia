/** Le « G » quadrichrome de Google, aux couleurs officielles de la marque. */
export function GoogleG({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={`shrink-0 ${className}`} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-3.1-.4-4.6H24v9.1h11.9c-.5 2.8-2 5.1-4.3 6.7v5.5h6.9c4.1-3.7 6.6-9.2 6.6-16.7z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.7 0 10.5-1.9 14-5.1l-6.9-5.5c-1.9 1.3-4.4 2.1-7.1 2.1-5.5 0-10.1-3.7-11.8-8.7H5v5.7C8.4 41.6 15.6 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M12.2 28.8c-.4-1.3-.7-2.7-.7-4.1s.2-2.8.7-4.1v-5.7H5c-1 2-1.6 4.2-1.6 6.6s.6 4.6 1.6 6.6l6.6-5v5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.9c3 0 5.7 1 7.8 3l6.2-6.1C34.5 4.4 29.7 2 24 2c-8.4 0-15.6 4.4-19 11.2l7.2 5.6c1.7-5 6.3-7.9 11.8-7.9z"
      />
    </svg>
  );
}
