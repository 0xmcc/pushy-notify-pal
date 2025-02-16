import { useUser } from '@/contexts/UserProvider';
import TokenReplenishmentTimer from '@/modules/token-timer';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface TokenTimerWrapperProps {
  children: React.ReactNode;
}

export const TokenTimerWrapper = ({ children }: TokenTimerWrapperProps) => {
  const { userStats } = useUser();
  const [showTimer, setShowTimer] = useState(false);
  const location = useLocation();
  const isTimerPage = location.pathname === '/token-timer';

  useEffect(() => {
    if (!userStats || isTimerPage) return;

    const hasNoTokens = userStats.off_chain_balance === 0;
    const hasNoMoves = userStats.rock_count === 0 && 
                      userStats.paper_count === 0 && 
                      userStats.scissors_count === 0;

    setShowTimer(hasNoTokens || hasNoMoves);
  }, [userStats, isTimerPage]);

  if (showTimer && !isTimerPage) {
    return <TokenReplenishmentTimer />;
  }

  return <>{children}</>;
}; 