'use client';

import { useHomeData } from './useHomeData';
import { HeroSection } from './HeroSection';
import { FeaturedGameSection } from './FeaturedGameSection';
import { MatrixRain } from '@/components/effects/MatrixRain';
import { usePrivy } from '@privy-io/react-auth';
import { usePlayMove } from "@/hooks/usePlayMove";
import { useState, useEffect } from 'react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { HowToPlayModal } from './HowToPlayModal';
import { InstallPWAModal } from './InstallPWAModal';
import { useInstallPWA } from '@/hooks/useInstallPWA';
import { InstallationPage } from '@/components/pwa/installation-page2';
import { UserGameCard } from '@/components/multiplayer/game-card/UserGameCard';
import { useScrollLock } from '@/hooks/useScrollLock';


const HomePage = () => {
  useScrollLock(true); // Always locked for home page
  const { data: matches, isLoading, refetch } = useHomeData();
  const { authenticated } = usePrivy();
  const { showInstallPrompt, setShowInstallPrompt } = useInstallPWA();

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(!showInstallPrompt); // Show by default

  const handlePlayMove = usePlayMove();

  // Get the first active game as featured game
  const featuredGame = matches?.[0];

  const onPlayMove = async (gameId: string, move: string) => {
    if (!authenticated) {
      setShowLoginDialog(true);
      return;
    }
    await handlePlayMove(gameId, move);
    // Refetch to get updated game state
   // await refetch();
  };


  // useEffect(() => {
  //   // Disable scrolling
  //   document.body.style.overflow = 'hidden';

  //   // Re-enable scrolling when component unmounts
  //   return () => {
  //     document.body.style.overflow = '';
  //   };
  // }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-gaming-text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Matrix Rain Background */}
      <div className="fixed inset-0 z-0">
        <MatrixRain />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
      </div>

      {/* Gradient and Grid Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.1),rgba(139,92,246,0.05))] pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-20 z-10" />
      
      {/* Content */}
      <div className="relative">
        <div className="container mx-auto px-4 md:flex md:items-center md:gap-8 md:min-h-[calc(100vh-80px)]">
          <div className="md:w-1/2">
            <HeroSection />
          </div>
          
          <div className="md:w-1/2 space-y-8 mt-16 md:mt-0">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Your Move</h2>
            <div className="flex justify-center items-center">
              {authenticated ? (
                <UserGameCard />
              ) : (
                <FeaturedGameSection 
                  game={featuredGame} 
                  onPlayMove={onPlayMove} 
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog} 
      />
{/*         
      {showInstallPrompt && (
        <div className="fixed inset-0 z-50 bg-black">
          <InstallationPage />
        </div>
      )}       */}
      {/* <HowToPlayModal 
        open={showHowToPlay} 
        onOpenChange={setShowHowToPlay} 
      /> */}
      {/* <InstallPWAModal 
        open={showInstallPrompt} 
        onOpenChange={setShowInstallPrompt} 
      /> */}
   
    </div>
  );
};

export default HomePage;