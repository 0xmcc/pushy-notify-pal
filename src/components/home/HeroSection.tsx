import { MatrixRain } from '@/components/effects/MatrixRain';
import { Swords } from 'lucide-react';

export const HeroSection = () => {
  return (
    <>
      {/* Full-width Matrix Rain with fixed positioning */}
      <div className="fixed inset-0 w-full h-screen overflow-hidden bg-black -z-10">
        <MatrixRain />
      </div>

      {/* Remove the gradient overlay since we want the matrix effect to show through */}
      <div className="text-center mb-8 space-y-6 pt-8 relative z-10">
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