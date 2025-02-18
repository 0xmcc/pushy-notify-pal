import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GameLocked from "./components/GameLocked";
import GamePlay from "./components/GamePlay";
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/effects/MatrixRain';
//import userstats from user provider
import { useUser } from '@/contexts/UserProvider';
import { updateReplenishTimers, type ReplenishmentTimers } from '@/services/replenishmentService';

const GameModule = () => {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState(0);
  const [showTimer, setShowTimer] = useState(true);
  const [showMatrixBg, setShowMatrixBg] = useState(true);
  const { userStats } = useUser();
  const [replenishmentTimers, setReplenishmentTimers] = useState<ReplenishmentTimers | null>(null);

  const refreshReplenishmentTimers = async () => {
    console.log("refreshReplenishmentTimers", userStats?.did, userStats);
    if (userStats?.did) {
      try {
        console.log("updating timers");
        const timers = await updateReplenishTimers(userStats.did);
        console.log("timers updated!", timers);
        setReplenishmentTimers(timers);
      } catch (error) {
        console.error('Failed to update replenishment timers:', error);
      }
    }
  };

  // Initial load of replenishment timers
  useEffect(() => {
    refreshReplenishmentTimers();
  }, [userStats?.did]);

  const handleChoice = (choice: "rock" | "paper" | "scissors") => {
    if (tokens > 0) {
      setTokens((prev) => prev - 1);
      if (tokens === 1) {
        setShowTimer(true);
      }
    }
  };

  const handleTimerComplete = () => {
    console.log("handleTimerComplete");
  };



  const getNextReplenishTime = (replenishmentTimers: ReplenishmentTimers | null) => {
    console.log("getNextReplenishTime", replenishmentTimers);
    if (userStats?.off_chain_balance === 0) return replenishmentTimers?.next_replenish.off_chain_balance
    if (!replenishmentTimers) return null;
    const times = [
      replenishmentTimers.next_replenish.rock,
      replenishmentTimers.next_replenish.paper,
      replenishmentTimers.next_replenish.scissors
    ].filter(time => time !== null) as number[];

    return times.length > 0 ? Math.min(...times) : null;
  };


  return (
    <div className="min-h-screen bg-black text-gaming-text-primary relative overflow-hidden">


      {showMatrixBg && (
        <>
          <div className="fixed inset-0 z-0">
            <MatrixRain />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.1),rgba(139,92,246,0.05))] pointer-events-none z-10" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-20 z-10" />
        </>
      )}

      <div className={`relative ${showMatrixBg ? 'z-20' : ''} p-6 flex flex-col items-center border-0`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-between items-center mb-8">
          {/* <button
            onClick={() => setShowMatrixBg(prev => !prev)}
            className="z-30 px-3 py-1 rounded-full bg-gaming-accent/20 text-gaming-text-secondary hover:bg-gaming-accent/30 text-sm border-0"
          >
            {showMatrixBg ? 'Hide Matrix' : 'Show Matrix'}
          </button> */}
{/*         
            <span className="text-sm text-gaming-text-secondary">
              Tokens: {tokens}
            </span> */}
          </div>

          <div className="space-y-8">

            {showTimer ? (
              <GameLocked 
                onTimerComplete={handleTimerComplete} 
                replenishmentTimers={replenishmentTimers}
                userStats={userStats}
                onRefresh={refreshReplenishmentTimers}
                nextReplenishTime={getNextReplenishTime(replenishmentTimers)}
              />
            ) : (
              <GamePlay tokens={userStats?.rock_count ?? 0} onChoice={handleChoice} />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GameModule;