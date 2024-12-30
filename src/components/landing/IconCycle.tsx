'use client';

import React, { useEffect, useState } from 'react';
import { Scissors, Newspaper, CircleDot, Globe } from 'lucide-react';

export const icons = [
  { component: CircleDot, name: 'Rock' },
  { component: Newspaper, name: 'Paper' },
  { component: Scissors, name: 'Scissors' },
  { component: Globe, name: 'Internet' }
];

export function IconCycle() {
  const [currentIcon, setCurrentIcon] = useState(0);

  useEffect(() => {
    // Immediately trigger first change
    setCurrentIcon((current) => (current + 1) % icons.length);

    // Set up the interval
    const intervalId = setInterval(() => {
      setCurrentIcon((current) => (current + 1) % icons.length);
    }, 2000);

    // Clean up
    return () => clearInterval(intervalId);
  }, []);

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
            className="w-64 h-64 stroke-1"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'
            }}
          />
        </div>
      ))}
    </div>
  );
}