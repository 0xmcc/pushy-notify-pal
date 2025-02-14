import { GameResultButton } from "./GameResultButton";

interface LoseResultProps {
  handleHideGame: () => Promise<void>;
}

export const LoseResult = ({ handleHideGame }: LoseResultProps) => {
  return (
    <div className="text-center space-y-3">
      <div className="h-8 flex items-center justify-center">
        <p className="text-gaming-danger text-xl font-bold animate-pulse">
          You lost!
        </p>
      </div>
      <GameResultButton 
        onClick={handleHideGame} 
        variant="hide" 
      />
    </div>
  );
};