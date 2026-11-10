import { useEffect, useRef, useState } from 'react';

const SCRIPT = 'https://accounts.google.com/gsi/client';

// Bouton « Continuer avec Google » (Google Identity Services).
// Il ne s'affiche que si le serveur fournit un identifiant client Google (GOOGLE_CLIENT_ID).
export default function GoogleButton({ clientId, lang, onCredential }) {
  const holder = useRef(null);
  const [ready, setReady] = useState(Boolean(window.google?.accounts?.id));

  useEffect(() => {
    if (ready) return undefined;
    let script = document.querySelector(`script[src="${SCRIPT}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = SCRIPT;
      script.async = true;
      document.head.appendChild(script);
    }
    const onLoad = () => setReady(true);
    script.addEventListener('load', onLoad);
    return () => script.removeEventListener('load', onLoad);
  }, [ready]);

  useEffect(() => {
    if (!ready || !holder.current) return;
    window.google.accounts.id.initialize({ client_id: clientId, callback: (response) => onCredential(response.credential) });
    window.google.accounts.id.renderButton(holder.current, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: lang, width: 320 });
  }, [ready, clientId, lang, onCredential]);

  return <div className="google-button" ref={holder} />;
}
