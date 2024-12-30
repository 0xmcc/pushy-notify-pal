import { Trophy } from 'lucide-react';
import { LeaderboardItem } from './LeaderboardItem';

interface LeaderboardUser {
  did: string;
  display_name: string | null;
  avatar_url: string | null;
  rating: number;
}

interface LeaderboardListProps {
  users: LeaderboardUser[];
}

export const LeaderboardList = ({ users }: LeaderboardListProps) => {
  return (
    <div className="gaming-card backdrop-blur-sm bg-gaming-card/80 border-gaming-accent/50 shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(139,92,246,0.2)] group">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-2 rounded-lg bg-gaming-accent/20 group-hover:bg-gaming-accent/30 transition-colors">
          <Trophy className="w-8 h-8 text-gaming-warning" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gaming-warning to-gaming-primary bg-clip-text text-transparent">
          Rankings
        </h2>
      </div>
      <div className="space-y-4">
        {users.map((player, index) => (
          <LeaderboardItem key={player.did} player={player} index={index} />
        ))}
      </div>
    </div>
  );
};