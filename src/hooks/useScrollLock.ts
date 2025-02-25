import { useEffect } from 'react';

export const useScrollLock = (shouldLock: boolean) => {
  useEffect(() => {
    if (shouldLock) {
      // Add a class to body instead of inline styles
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    // Cleanup
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [shouldLock]);
}; 