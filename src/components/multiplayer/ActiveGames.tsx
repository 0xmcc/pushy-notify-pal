'use client';
import { ErrorAlert } from "./ErrorAlert";
import { GamesList } from "./GamesList";
import { useGames } from "@/hooks/useGames";

interface ActiveGamesProps {
  stakeRange: [number, number];
  onPlayMove: (gameId: string, move: string) => Promise<void>;
}

export const ActiveGames = ({ stakeRange, onPlayMove }: ActiveGamesProps) => {
  const { games, isLoading, error, isOffline } = useGames(stakeRange);
  if (isLoading) 
    return <div className="text-center py-4 text-gaming-text-secondary">Loading games...</div>;
  
  if (error) 
    return <ErrorAlert message={error} />;
  
  return <GamesList games={games} isOffline={isOffline} onPlayMove={onPlayMove} />;
};



//  const { user, authenticated } = usePrivy();
// import { usePrivy } from "@privy-io/react-auth";
// import { playGameMove } from "@/utils/gameUtils";
// import { toast } from "sonner";
//   const handlePlayMove = async (gameId: string, move: string) => {
//     if (!authenticated) {
//       toast.error("Please sign in to play");
//       return;
//     }

//     if (isOffline) {
//       toast.error("Cannot play moves while offline");
//       return;
//     }

//     if (user?.id) {
//       try {
//         console.log("Playing move:", { gameId, move, userId: user.id });
//         await playGameMove(gameId, move, user.id);
// // /        toast.success("Move played successfully!");
//       } catch (err) {
//         console.error("Error playing move:", err);
//         toast.error("Failed to play move. Please try again.");
//       }
//     }
//   };