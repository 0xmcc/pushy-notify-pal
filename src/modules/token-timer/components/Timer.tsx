import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TimerProps {
  targetTime: number;
  onComplete: () => void;
}

const calculateTimeLeftInSeconds = (targetTime: number): number => {
  const now = Date.now();
  return Math.max(0, Math.floor((targetTime - now) / 1000));
};

const Timer = ({ targetTime, onComplete }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeftInSeconds(targetTime));

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeftInSeconds(targetTime);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft === 0) {
        onComplete();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime, timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="text-center relative">
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="relative"
      >
        <div className="text-2xl font-bold text-white">

        {/* <div className="text-3xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent"> */}
          New tokens in {formattedTime}
        </div>
        <motion.div
          className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[#8B5CF6] opacity-20 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.15, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </motion.div>
      {/* <p className="text-sm text-gray-400 mt-2">until next game</p> */}
      {/* <p className="text-sm text-gray-400 mt-2">until next game</p> */}
      {/* <p className="text-sm text-gray-400 mt-2">until next game</p> */}
    </div>
  );
};
export default Timer;