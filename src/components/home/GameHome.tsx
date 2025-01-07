'use client';

import { useHomeData } from './useHomeData';
import { HeroSection } from './HeroSection';
import { FeaturedGameSection } from './FeaturedGameSection';
import { LeaderboardList } from '@/components/leaderboard/LeaderboardList';
import { MatrixRain } from '@/components/effects/MatrixRain';

const HomePage = () => {
  const { isLoading, leaderboardUsers, featuredGame } = useHomeData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-gaming-text-primary">Loading...</div>
      </div>
    );
  }

  const handlePlayMove = async (gameId: string, move: string) => {
    console.log('Move played:', gameId, move);
  };

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

        <div className="container mx-auto px-4 space-y-0 pb-16">
          <FeaturedGameSection game={featuredGame} onPlayMove={handlePlayMove} />
          <LeaderboardList users={leaderboardUsers} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;