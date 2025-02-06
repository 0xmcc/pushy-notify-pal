import { useUser } from '@/contexts/UserProvider';

export const useTokenBalance = () => {
  const { userStats } = useUser();
  return { tokenBalance: userStats?.off_chain_balance ?? 0 };
}; 