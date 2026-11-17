import { useEffect, useRef } from 'react';

export default function SurprisePage({ onReady, onNavigateToInvitation }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== iframeRef.current?.contentWindow
      ) {
        return;
      }

      if (event.data?.type === 'heaven-garden:ready') {
        onReady?.();
      } else if (event.data?.type === 'heaven-garden:navigate-invitation') {
        onNavigateToInvitation();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigateToInvitation, onReady]);

  return (
    <main className="relative z-10 h-screen w-screen overflow-hidden">
      <iframe
        ref={iframeRef}
        className="block h-full w-full border-0"
        src={`${import.meta.env.BASE_URL}heaven-garden.html`}
        title="Heaven Garden"
        allow="autoplay"
      />
    </main>
  );
}
