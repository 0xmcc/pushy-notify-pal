interface MainContentProps {
  children: React.ReactNode;
  showInstallPrompt: boolean;
  tokenBalance: number | null;
}

export const MainContent = ({ children, showInstallPrompt, tokenBalance }: MainContentProps) => (
  <div className="flex flex-col min-h-screen">
    <Header className="fixed top-0 left-0 right-0 z-50" />
    <TokenBalanceDisplay balance={tokenBalance} />
    <main className="flex-1 overflow-y-auto pt-20 pb-16">
      {children}
    </main>
    {!showInstallPrompt && <BottomNav className="fixed bottom-0 left-0 right-0 z-50" />}
  </div>
); 