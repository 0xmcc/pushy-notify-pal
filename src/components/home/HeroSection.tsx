import { MatrixRain } from '@/components/effects/MatrixRain';
import { Swords } from 'lucide-react';

export const HeroSection = () => {
  return (
    <>
      {/* Full-width Matrix Rain */}
      <div className="relative w-full h-96 overflow-hidden bg-black">
        <MatrixRain />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
      </div>

      <div className="text-center mb-8 space-y-6 -mt-32 relative z-10">
        <Swords className="w-24 h-24 text-white mx-auto mb-4" />
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent animate-float">
          Rock Paper Scissors
        </h1>
        <p className="text-xl text-gaming-text-secondary max-w-2xl mx-auto px-8 whitespace-pre-line">
          With crypto
        </p>
      </div>
    </>
  );
};