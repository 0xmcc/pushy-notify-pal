const K_FACTOR = 32; // Standard K-factor used in ELO calculations

export const calculateEloChange = (winnerRating: number, loserRating: number): number => {
  // Calculate expected score for winner using ELO formula
  const expectedScore = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  
  // Calculate rating change
  const ratingChange = Math.round(K_FACTOR * (1 - expectedScore));
  
  return ratingChange;
};