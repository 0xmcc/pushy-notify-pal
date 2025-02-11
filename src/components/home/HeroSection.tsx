import { Swords } from 'lucide-react';

export const HeroSection = () => {
  return (
    <div className="relative z-10">
      <div className="text-center mb-8 space-y-6 pt-8">
        <Swords className="w-24 h-24 md:w-48 md:h-48 text-white mx-auto mb-4" />
        {/* <h1 className="text-5xl md:text-6xl  font-bold bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent animate-float">
          Rock Paper Scissors on Internet
        </h1> */}
       <p className="text-xl md:text-3xl text-gaming-text-secondary max-w-2xl mx-auto px-8 whitespace-pre-line font-bold">
          Rock Paper Scissors for Crypto
        </p>
      </div>
    </div>
  );
};