import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Newspaper, Globe } from 'lucide-react';

// RockIcon Component
function RockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 1200 1200" 
      xmlns="http://www.w3.org/2000/svg"
      className="bg-gradient-to-r from-white to-white/60 text-transparent bg-clip-text"
      {...props}
    >
     <path d="m680.73 500.06-59.762-73.223 0.67188-268.25 21.434-7.3203 297.86 64.777 183.55 264.98-118.39 460.27-267.82 109.99-134.52-1.1992 137.84-149.14-120.24-266.04zm-341.23-245.18 212.35-72.48-0.67188 269.28 48.359 59.281-54.742 124.27 114.05 252.31-149.28 161.59-179.04-96.266-30.07-96.938-110.76-32.855-63.504-246.38 197.02-176.04zm-64.535-51.84-18.289 163.54-208.58 186.39 83.977 325.85 112.8 33.48 27.457 88.633 219.41 117.94 260.14 2.3516 313.01-128.57 135.12-525.2-217.44-313.92-343.54-74.711zm-121.9 771.89-115.56-29.543-37.512 89.23 23.039 61.895 114 20.711 52.871-65.23zm47.762-697.23-78.434-15.047-45.91 35.762 11.594 54.121 74.762 19.922 32.93-30.602z" fill="#fff" fillRule="evenodd"/>

    </svg>
  );
}

// Layout Components
function DesktopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hidden md:flex md:flex-row items-center justify-center w-full md:gap-16">
      <div className="md:w-[350px] md:flex md:justify-center">
        {children[0]}
      </div>
      <div className="md:w-[350px] md:flex md:justify-center">
        {children[1]}
      </div>
    </div>
  );
}

function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center w-full md:hidden">
      {children}
    </div>
  );
}

// Title Component
function Title() {
  return (
    <div>
    
      <h2 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-white to-white/60 text-transparent bg-clip-text text-center">
        Welcome to ROI
      </h2>
    </div>
  );
}

// IconCycle Component
const icons = [
  { component: RockIcon, name: 'Rock' },
  { component: Newspaper, name: 'Paper' },
  { component: Scissors, name: 'Scissors' },
  { component: Globe, name: 'Internet' }
];

function IconCycle({ currentIcon }: { currentIcon: number }) {
  return (
    <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
      {icons.map((Icon, index) => (
        <div
          key={Icon.name}
          className={`absolute transition-all duration-1000 ease-in-out ${
            index === currentIcon
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-50'
          }`}
        >
          <Icon.component
            className="w-64 h-64 stroke-1 "
            style={{
              filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'
            }}
          />
        </div>
      ))}
    </div>
  );
}

// UI Components
function StartButton() {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate('/')}
      className="px-12 py-6 text-2xl font-light tracking-wide
                border border-white/20 rounded-full 
                backdrop-blur-sm bg-white hover:bg-white/90 
                text-black
                transition-all duration-300 ease-in-out
                shadow-[0_0_15px_rgba(255,255,255,0.1)]
                hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]
                hover:scale-105
                animate-pulse-subtle"
    >
      Get Started
    </button>
  );
}

// Main Landing Page Component
export default function Landing() {
  const [currentIcon, setCurrentIcon] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pt-8">
      <div className="flex-1 flex flex-col items-center justify-center">
        <Title />
        <IconCycle currentIcon={currentIcon} />
        <StartButton />

      </div>
    </div>

  );
} 

// import { StartButton } from '@/components/landing/StartButton';
// import { Title } from '@/components/landing/Title';
// import { IconCycle } from '@/components/landing/IconCycle';

// export default function LandingPage() {
//   return (
//     <main className="min-h-screen flex flex-col items-center justify-start pt-12 md:justify-center md:pt-0">
//       <Title />
//       <IconCycle />
//       {/* <IconCycle / >currentIcon={0} /> */}
//       <StartButton />
//     </main>
//   );
// } 

    // <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
    //   <div className="flex flex-col items-center gap-16 w-full max-w-7xl px-6">
    //     <MobileLayout>
    //       <Title />
    //       <IconCycle currentIcon={currentIcon} />
    //     </MobileLayout>
    //     <DesktopLayout>
    //       <Title />
    //       <IconCycle currentIcon={currentIcon} />
    //     </DesktopLayout>
    //     <StartButton />
    //   </div>
    // </div>