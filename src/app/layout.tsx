'use client';

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from '@privy-io/react-auth';
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { useEffect, useState } from 'react';
import { RPSProvider } from '@/providers/RPSProvider';
import { InstallationPage } from '@/components/pwa/installation-page2';
import { InstallPWAModal } from "@/components/home/InstallPWAModal";
import { useInstallPWA } from '@/hooks/useInstallPWA';
import { cn } from '@/lib/utils';
import TokenReplenishmentTimer from '@/modules/token-timer';
import { useUserCheck } from '@/features/auth/hooks/useUserCheck';
//import { useTokenBalance } from '@/hooks/useTokenBalance';
import { UserProvider } from '@/contexts/UserProvider';

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {  
  children: React.ReactNode;
}) {
  const { exists, user, isChecking } = useUserCheck();
  const { showInstallPrompt, setShowInstallPrompt } = useInstallPWA();
  const [showNav, setShowNav] = useState(false);
  //const { tokenBalance } = useTokenBalance();

  useEffect(() => {
//    console.log('Layout - exists:', exists, 'user:', user);
    console.log('Layout - showNav:', showNav);
    console.log('Layout - showInstallPrompt:', showInstallPrompt);
//    console.log('Layout - tokenBalance:', tokenBalance);
    setShowNav(!!exists);
  }, [exists]);

  // Handle body scroll when the PWA modal is open
  useEffect(() => {
    document.body.style.overflow = showInstallPrompt ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showInstallPrompt]);

  return (
    <html lang="en" className={cn("h-full", showInstallPrompt && "overflow-hidden")}>
      <body className={cn("flex flex-col min-h-full", showInstallPrompt && "overflow-hidden")}>
        <PrivyProvider
          appId="cm51rmjaz04s9ojzwfaopdnzd"
          config={{
            embeddedWallets: {
              createOnLogin: 'off',
              noPromptOnSignature: true,
            },
            solanaClusters: [{name: 'devnet', rpcUrl: 'https://api.devnet.solana.com'}],
            appearance: {
              walletChainType: 'solana-only',
              theme: 'dark',
              accentColor: '#3b82f6'
            }
          }}
        >
          <QueryClientProvider client={queryClient}>
            <RPSProvider>
              <TooltipProvider>
                <UserProvider>
                  <div className="flex flex-col min-h-full">
                    {isChecking ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-gaming-text-secondary">Loading...</div>
                      </div>
                    ) : exists && user && (tokenBalance === 0 || tokenBalance === null) ? (
                      <TokenReplenishmentTimer />
                    ) : (
                      <>
                        <Header className="fixed top-0 left-0 right-0 z-50" />
                        {/* <div className="fixed top-20 right-4 z-40">
                          <div className="token-balance-display bg-gaming-accent-primary px-3 py-1 rounded-full">
                            <span className="token-balance-amount text-gaming-text-primary font-medium">
                              {tokenBalance?.toFixed(2) ?? '0.00'}
                            </span>
                            <span className="token-balance-label text-gaming-text-secondary ml-1">
                              tokens
                            </span>
                          </div>
                        </div> */}
                        <main className="flex-1 overflow-y-auto pt-20 pb-16">
                          {children}
                        </main>
                        {!showInstallPrompt && <BottomNav className="fixed bottom-0 left-0 right-0 z-50" />}
                      </>
                    )}
                  </div>
                  {/* <InstallPWAModal open={showInstallPrompt} onOpenChange={setShowInstallPrompt} />
                  {(showInstallPrompt) && (
                    <div className="fixed inset-0 z-[100] bg-black">
                      <InstallationPage />
                      <InstallPWAModal open={showInstallPrompt} onOpenChange={setShowInstallPrompt} />
                    </div>
                  )} */}
                  <Toaster />
                  <Sonner />
                </UserProvider>
              </TooltipProvider>
            </RPSProvider>
          </QueryClientProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}