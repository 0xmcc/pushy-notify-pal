'use client';

import { usePrivy } from '@privy-io/react-auth';
import GameHome from '@/components/home/GameHome';
import LandingPage from './(landing)/page';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserCheck } from '@/features/auth/hooks/useUserCheck';

export default function HomePage() {
  const { authenticated } = usePrivy();
  const navigate = useNavigate();
  const { isChecking, exists } = useUserCheck();

  useEffect(() => {
    // Only redirect if user is authenticated but doesn't exist in database
    if (authenticated && exists === false) {
      navigate('/signup');
    } else {
      navigate('/');
    }
  }, [authenticated, exists, navigate]);

  // Keep original behavior
  return true ? <GameHome /> : <LandingPage />;
}