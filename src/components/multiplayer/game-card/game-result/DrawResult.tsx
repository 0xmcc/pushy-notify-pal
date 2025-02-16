import { GameResultButton } from "./GameResultButton";

interface DrawResultProps {
  handleHideGame: () => Promise<void>;
}

export const DrawResult = ({ handleHideGame }: DrawResultProps) => {
  return (
    <div className="text-center space-y-3">
      <div className="h-8 flex items-center justify-center">
        <div className="w-[298px] flex items-center justify-center">
          <p className="text-gaming-primary text-xl font-bold animate-pulse">
            Draw!
          </p>
        </div>
      </div>
      <GameResultButton 
        onClick={handleHideGame} 
        variant="hide" 
      />
    </div>
  );
};