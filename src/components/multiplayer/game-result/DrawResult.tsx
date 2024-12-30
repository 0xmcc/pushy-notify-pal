interface DrawResultProps {
  isUserInGame: boolean;
}

export const DrawResult = ({ isUserInGame }: DrawResultProps) => {
  return (
    <div className="text-center">
      <p className="text-gaming-accent text-xl font-bold animate-pulse">
        Draw!
      </p>
      {isUserInGame && (
        <p className="text-gaming-text-secondary mt-2">
          Stakes have been returned to your off-chain balance
        </p>
      )}
    </div>
  );
};