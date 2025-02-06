import { useEffect } from 'react';
import TokenReplenishmentTimer from '@/modules/token-timer/index';
import { useRouter } from 'next/router';

const TokenTimerPage = () => {
  const router = useRouter();

  useEffect(() => {
    document.body.classList.add('hide-navigation');
    
    return () => {
      document.body.classList.remove('hide-navigation');
    };
  }, []);

  return <TokenReplenishmentTimer />;
};

export default TokenTimerPage; 