'use client';

import { useEffect, useRef, useState } from 'react';

export function AgentExplainer() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(560);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { __herakiaAgentH?: number } | null;
      if (d && typeof d.__herakiaAgentH === 'number' && d.__herakiaAgentH > 80) {
        setHeight(d.__herakiaAgentH);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  return (
    <div className="overflow-hidden rounded-3xl border border-border-subtle shadow-2xl">
      <iframe
        ref={ref}
        src="/herakia-agent-explicatif.html"
        title="Qu’est-ce qu’un agent IA ? — il perçoit, décide, agit"
        loading="lazy"
        scrolling="no"
        className="block w-full"
        style={{ height, border: 0 }}
      />
    </div>
  );
}
