import { motion } from "framer-motion";

type Choice = "rock" | "paper" | "scissors";

interface GameChoiceProps {
  choice: Choice;
  onClick: (choice: Choice) => void;
  disabled?: boolean;
}

const GameChoice = ({ choice, onClick, disabled }: GameChoiceProps) => {
  const emojis = {
    rock: "🪨",
    paper: "📄",
    scissors: "✂️",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-2 ${
        disabled ? "opacity-50" : "hover:bg-[#2C324A]"
      } bg-[#1E2235] transition-colors duration-200 p-4`}
      onClick={() => !disabled && onClick(choice)}
      disabled={disabled}
    >
      <span className="text-2xl">{emojis[choice]}</span>
      <span className="text-sm text-gray-400 capitalize">{choice}</span>
    </motion.button>
  );
};

export default GameChoice;