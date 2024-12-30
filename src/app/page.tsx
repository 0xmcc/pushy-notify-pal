'use client';

import { usePrivy } from '@privy-io/react-auth';
import GameHome from '@/components/home/GameHome';
import LandingPage from './(landing)/page';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { authenticated } = usePrivy();
  const navigate = useNavigate();
  useEffect(() => {
    if (authenticated) {
      navigate('/');
    }
  }, [authenticated, navigate]);
  return true ?  <GameHome /> : <LandingPage />;
}