import { Game } from '@/types/game';
import { GameCard } from '@/components/multiplayer/GameCard';

interface FeaturedGameSectionProps {
  game: Game | null;
  onPlayMove: (gameId: string, move: string) => Promise<void>;
}

export const FeaturedGameSection = ({ game, onPlayMove }: FeaturedGameSectionProps) => {
  if (!game) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6 text-gaming-text-primary text-center">Your move</h2>
      <GameCard game={game} onPlayMove={onPlayMove} />
    </div>
  );
};