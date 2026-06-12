import { useEffect, useState } from 'react';

const BUILT_VERSION = process.env.REACT_APP_VERSION;

export function useVersionCheck(intervalMs = 5 * 60 * 1000) {
  const [outdated, setOutdated] = useState(false);

  useEffect(() => {
    if (!BUILT_VERSION || BUILT_VERSION === 'dev') return;

    const check = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`);
        if (!res.ok) return;
        const { version } = await res.json();
        if (version !== BUILT_VERSION) setOutdated(true);
      } catch {
        // network blip — ignore
      }
    };

    check();
    const id = setInterval(check, intervalMs);
    const onFocus = () => check();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [intervalMs]);

  return outdated;
}
