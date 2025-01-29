'use client';

import { useHomeData } from './useHomeData';
import { HeroSection } from './HeroSection';
import { FeaturedGameSection } from './FeaturedGameSection';
import { LeaderboardList } from '@/components/leaderboard/LeaderboardList';
import { MatrixRain } from '@/components/effects/MatrixRain';
import { usePrivy } from '@privy-io/react-auth';
import { usePlayMove } from "@/hooks/usePlayMove";
import { useState } from 'react';
import { useLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { HowToPlayModal } from './HowToPlayModal';
import { InstallPWAModal } from './InstallPWAModal';
import { useInstallPWA } from '@/hooks/useInstallPWA';
import { InstallationInstructions } from './InstallationInstructions';

const HomePage = () => {
  const { data: matches, isLoading, refetch } = useHomeData();
  const { authenticated } = usePrivy();
  const { users, isLoading: leaderboardLoading } = useLeaderboard();
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
      <div className="relative z-20">
        <HeroSection />

        <div className="container mx-auto px-4 space-y-16 pb-16">
          <FeaturedGameSection 
            game={featuredGame} 
            onPlayMove={onPlayMove} 
          />
          <LeaderboardList users={users} />
        </div>
      </div>

      {/* Modals */}
      <LoginDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog} 
      />
      <HowToPlayModal 
        open={showHowToPlay} 
        onOpenChange={setShowHowToPlay} 
      />
      <InstallPWAModal 
        open={showInstallPrompt} 
        onOpenChange={setShowInstallPrompt} 
      />
      {showInstallPrompt && (
        <InstallationInstructions onClose={() => setShowInstallPrompt(false)} />
      )}
    </div>
  );
};

export default HomePage;