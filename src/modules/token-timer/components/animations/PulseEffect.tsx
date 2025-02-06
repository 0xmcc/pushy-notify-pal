import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PulseEffectProps {
  children: ReactNode;
}

const PulseEffect = ({ children }: PulseEffectProps) => {
  return (
    <motion.div
      animate={{ 
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }}
      className="relative w-full"
    >
      {children}
      <motion.div
        className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-32 rounded-full bg-[#8B5CF6] opacity-20 blur-xl"
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
  );
};

export default PulseEffect;