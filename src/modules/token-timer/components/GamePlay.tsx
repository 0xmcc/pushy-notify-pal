import { motion } from "framer-motion";
import GameChoice from "./GameChoice";

interface GamePlayProps {
  tokens: number;
  onChoice: (choice: "rock" | "paper" | "scissors") => void;
}

const GamePlay = ({ tokens, onChoice }: GamePlayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#252A3C] rounded-2xl p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#8B5CF6]" />
        <div>
          <h3 className="font-semibold">Your move</h3>
          <p className="text-sm text-gray-400">Choose wisely</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <GameChoice choice="rock" onClick={onChoice} disabled={tokens === 0} />
        <GameChoice choice="paper" onClick={onChoice} disabled={tokens === 0} />
        <GameChoice choice="scissors" onClick={onChoice} disabled={tokens === 0} />
      </div>
    </motion.div>
  );
};

export default GamePlay;