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

import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const { data: matches, isLoading, refetch } = useHomeData();
  const { login, authenticated } = usePrivy();
  const { users, isLoading: leaderboardLoading } = useLeaderboard();

  const [showLoginDialog, setShowLoginDialog] = useState(false);
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

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="bg-gaming-card border-gaming-accent text-gaming-text-primary">
          <DialogHeader>
            <DialogTitle className="text-gaming-text-primary">Login Required</DialogTitle>
            <DialogDescription className="text-gaming-text-secondary">
              You need to be logged in to play a move.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button 
              onClick={() => {
                setShowLoginDialog(false);
                login();
              }}
              className="bg-gaming-accent hover:bg-gaming-accent/80 text-gaming-text-primary"
            >
              Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;