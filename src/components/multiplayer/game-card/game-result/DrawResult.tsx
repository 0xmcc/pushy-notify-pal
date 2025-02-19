import { GameResultButton } from "./GameResultButton";

interface DrawResultProps {
  handleHideGame: () => Promise<void>;
}

export const DrawResult = ({ handleHideGame }: DrawResultProps) => {
  return (
    <div className="text-center space-y-3">
      <div className="relative h-8">
        <p className="absolute left-1/2 -translate-x-1/2 text-gaming-primary text-xl font-bold animate-pulse">
          Draw!
        </p>
      </div>
      <GameResultButton 
        onClick={handleHideGame} 
        variant="hide" 
      />
    </div>
  );
};