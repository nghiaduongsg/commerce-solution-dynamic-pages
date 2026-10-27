import { useEffect, useState } from 'react';

let script = document.getElementById('irm-theme') as HTMLScriptElement | null;
export const useExternalScript = (url) => {
  const [state, setState] = useState(url ? 'loading' : 'idle');

  useEffect(() => {
    if (!url) {
      setState('idle');
      return;
    }

    const handleScript = (e) => {
      setState(e.type === 'load' ? 'ready' : 'error');
    };

    if (!script) {
      script = document.createElement('script');
      script.type = 'application/javascript';
      script.src = url;
      script.async = false;
      script.id = 'irm-theme';
      document.body.appendChild(script);
      // script.addEventListener('load', handleScript);
      // script.addEventListener('error', handleScript);
    } else {
      window.getAssets = undefined;
      window.getExternalAssets = undefined;
      window.getTheme = undefined;
      try {
        document.body.removeChild(script);
        const timeout = setTimeout(() => {
          script = document.createElement('script');
          script.type = 'application/javascript';
          script.src = url;
          script.async = false;
          script.id = 'irm-theme';
          script?.removeEventListener('load', handleScript);
          script?.removeEventListener('error', handleScript);
          document.body.appendChild(script);
          if (timeout) {
            clearTimeout(timeout);
          }
        }, 100);
      } catch {
        alert('could not apply theme');
      }
    }

    script.addEventListener('load', handleScript);
    script.addEventListener('error', handleScript);

    return () => {
      script?.removeEventListener('load', handleScript);
      script?.removeEventListener('error', handleScript);
    };
  }, [url]);

  return state;
};
