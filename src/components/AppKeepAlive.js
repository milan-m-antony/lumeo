
'use client';

import { useEffect } from 'react';

/**
 * A component that helps prevent the browser on mobile devices from discarding the page
 * when the user switches to another app (like the file gallery). This helps preserve
 * UI state, for example, the list of files selected for upload.
 */
const AppKeepAlive = () => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const handler = (event) => {
          event.preventDefault();
        };

        // The 'pagehide' event is fired when the browser is about to unload the page.
        // Calling preventDefault() can suggest to the browser to keep the page in its back/forward cache.
        window.addEventListener('pagehide', handler, { capture: true, once: true });

        // Clean up the listener after a short delay, as it's only needed once per hide.
        setTimeout(() => {
          window.removeEventListener('pagehide', handler, { capture: true });
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null; // This component does not render anything.
};

export default AppKeepAlive;
