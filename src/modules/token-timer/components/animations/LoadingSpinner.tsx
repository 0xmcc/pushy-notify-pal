import { motion } from "framer-motion";

const LoadingSpinner = () => {
  return (
    <motion.div 
      className="w-full flex flex-col items-center justify-center space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-16 h-16 border-4 border-[#8B5CF6] border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <p className="text-[#8B5CF6] text-sm font-medium">
        Waiting for friend to join...
      </p>
    </motion.div>
  );
};

export default LoadingSpinner;