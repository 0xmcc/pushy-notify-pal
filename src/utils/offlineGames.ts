import { Game } from "@/types/game";
import { mockGames } from "./gameUtils";

export const getOfflineGames = (stakeRange: [number, number]): Game[] => {
  console.log("Loading mock games only (offline mode)");
  return mockGames.filter(
    game => game.stake_amount >= stakeRange[0] && game.stake_amount <= stakeRange[1]
  );
};