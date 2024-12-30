import React from 'react';
//import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
export function StartButton() {
//  const navigate = useNavigate();
    const { login } = usePrivy();
    return (
        <button 
            onClick={login}
        className="px-12 py-6 text-2xl font-light tracking-wide
                    border border-white/20 rounded-full 
                    backdrop-blur-sm bg-white/5 hover:bg-white/10 
                    transition-all duration-300 ease-in-out
                    shadow-[0_0_15px_rgba(255,255,255,0.1)]
                    hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]
                    hover:scale-105"
        >
        START
        </button>
    );
}