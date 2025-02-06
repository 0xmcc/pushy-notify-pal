interface TokenBalanceDisplayProps {
  balance: number | null;
}

export const TokenBalanceDisplay = ({ balance }: TokenBalanceDisplayProps) => (
  <div className="fixed top-20 right-4 z-40">
    <div className="token-balance-display bg-gaming-accent-primary px-3 py-1 rounded-full">
      <span className="token-balance-amount text-gaming-text-primary font-medium">
        {balance?.toFixed(2) ?? '0.00'}
      </span>
      <span className="token-balance-label text-gaming-text-secondary ml-1">
        tokens
      </span>
    </div>
  </div>
); 