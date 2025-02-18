import { motion } from "framer-motion";
import { Lock, Trophy, Rocket } from "lucide-react";
import Timer from "./Timer";
import InviteFriends from "./InviteFriends";
import LoadingSpinner from "./animations/LoadingSpinner";
import PulseEffect from "./animations/PulseEffect";
import { ReplenishmentTimers } from "@/services/replenishmentService";
import { UserStats, useUser } from '@/contexts/UserProvider';

interface GameLockedProps {
  onTimerComplete: () => void;
  replenishmentTimers: ReplenishmentTimers | null;
  userStats: UserStats | null;
  onRefresh: () => Promise<void>;
  nextReplenishTime: number | null;
}

const GameLocked = ({ onTimerComplete, replenishmentTimers, onRefresh, nextReplenishTime }: GameLockedProps) => {
  const { userStats } = useUser();

  if (!replenishmentTimers || !userStats) return null;

  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="flex flex-col items-center space-y-6 bg-gaming-card/0 rounded-2xl p-8 shadow-xl border border-gaming-accent/30"
    >
      <h2 className="text-2xl font-bold bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent">
        Play Again
      </h2>

      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, -5, 5, -5, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="relative"
      >
        <Lock className="w-16 h-16 text-gaming-primary" />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -top-2 -right-2"
        >
          <Trophy className="w-6 h-6 text-gaming-secondary" />
        </motion.div>
      </motion.div>

      {nextReplenishTime && (
        <Timer 
          targetTime={nextReplenishTime} 
          onComplete={async () => {
            await onRefresh();
            onTimerComplete();
          }} 
        />
      )}

      <div className="flex items-center justify-center w-full my-4">
        <div className="flex-grow border-t border-gaming-accent/30"></div>
        <span className="mx-4 text-gaming-text-secondary bg-gaming-card px-2">OR</span>
        <div className="flex-grow border-t border-gaming-accent/30"></div>
      </div>

      <div className="text-3xl font-bold bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent"> 
        Skip the wait
      </div>

      <PulseEffect>
        <InviteFriends />
      </PulseEffect>

      {/* <LoadingSpinner /> */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-gaming-text-secondary text-center"
      >
        <span className="flex items-center gap-2 justify-center">
          <Rocket className="w-4 h-4 text-gaming-secondary" />
          Or wait for the timer to get more tokens!
        </span>
      </motion.div>
    </motion.div>
  );
};

export default GameLocked;