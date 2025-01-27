import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';
import { isIOSSafari, isPWA } from '@/utils/browser';

export function useInstallPWA() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Only show for mobile iOS Safari users who haven't installed the PWA

    if (isMobile && !isPWA()) {
      console.log('useInstallPWA() LETS GO');
      setShowInstallPrompt(true);
    } else {
      console.log('useInstallPWA() NOT GO', isMobile, isIOSSafari(), isPWA());
      setShowInstallPrompt(false);
    }
  }, [isMobile]);

  return {
    showInstallPrompt,
    setShowInstallPrompt
  };
} 