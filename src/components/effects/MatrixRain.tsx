'use client';

import React, { useEffect, useRef } from 'react';

export const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setting the width and height of the canvas
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Setting up the letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZ';
    const letterArray = letters.split('');

    // Setting up the columns
    const fontSize = 14; // Increased font size
    const columns = canvas.width / fontSize;

    // Setting up the drops
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    // Setting up the draw function
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, .1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = letterArray[Math.floor(Math.random() * letterArray.length)];
        
        // Calculate gradient opacity based on vertical position
        const gradientOpacity = 1 - (drops[i] * fontSize / canvas.height);
        ctx.fillStyle = `rgba(0, 255, 0, ${Math.max(0.1, gradientOpacity)})`;
        
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        drops[i]++;
        if (drops[i] * fontSize > canvas.height && Math.random() > .98) { // Slowed down reset probability
          drops[i] = 0;
        }
      }
    };

    // Loop the animation with slower interval
    const interval = setInterval(draw, 50); // Increased interval for slower animation

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full absolute inset-0"
    />
  );
};