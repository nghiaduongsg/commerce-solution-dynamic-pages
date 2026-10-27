import { useEffect } from 'react';

const usePageAnnounce = (title: string) => {
  useEffect(() => {
    if (!title) return;

    document.title = title;
    // Announce via screen reader
    const announcer = document.getElementById('route-announcer');
    if (announcer) {
      announcer.textContent = '';
      setTimeout(() => {
        announcer.textContent = title;
      }, 100);
    }
  }, [title]);

  return null;
};

export default usePageAnnounce;
