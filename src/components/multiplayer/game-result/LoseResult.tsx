import { GameResultButton } from "./GameResultButton";

interface LoseResultProps {
  handleHideGame: () => Promise<void>;
}

export const LoseResult = ({ handleHideGame }: LoseResultProps) => {
  return (
    <div className="text-center space-y-3">
      <p className="text-gaming-danger text-xl font-bold animate-pulse">
        You lost!
      </p>
      <GameResultButton 
        onClick={handleHideGame} 
        variant="hide" 
      />
    </div>
  );
};