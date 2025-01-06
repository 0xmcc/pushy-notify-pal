import { GameResultButton } from "./GameResultButton";

interface DrawResultProps {
  handleHideGame: () => Promise<void>;
}

export const DrawResult = ({ handleHideGame }: DrawResultProps) => {
  return (
    <div className="text-center space-y-3">
      <p className="text-gaming-primary text-xl font-bold animate-pulse">
        Draw!
      </p>
      <GameResultButton 
        onClick={handleHideGame} 
        variant="hide" 
      />
    </div>
  );
};