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
import { useUserCheck } from '@/features/auth/hooks/useUserCheck';
import { UserProvider } from '@/contexts/UserProvider';
import { useLocation } from 'react-router-dom';
import { TokenTimerWrapper } from '@/components/layout/TokenTimerWrapper';

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {  
  children: React.ReactNode;
}) {
  const { exists, user, isChecking } = useUserCheck();
  const { showInstallPrompt, setShowInstallPrompt } = useInstallPWA();
  const [showNav, setShowNav] = useState(true);
  const location = useLocation();
  const isInvitePath = location.pathname === '/invite' || location.pathname === '/video-background';
  const showPWAPrompt = showInstallPrompt && !isInvitePath && false;
  const showBottomNav = !isInvitePath && !showPWAPrompt;
  useEffect(() => {
    console.log('Layout - showNav:', showNav);
    console.log('Layout - showInstallPrompt:', showInstallPrompt);
    setShowNav(!!exists && !isInvitePath);
  }, [exists, isInvitePath]);

  // Handle body scroll when the PWA modal is open
  // useEffect(() => {
  //   const originalOverflow = document.body.style.overflow;
  //   document.body.style.overflow = showInstallPrompt ? 'hidden' : 'auto';
  //   return () => {
  //     document.body.style.overflow = originalOverflow;
  //   };
  // }, [showInstallPrompt]);

  return (
    <html lang="en" className={cn("h-full", showInstallPrompt)}>
      <body className={cn("h-full bg-gaming-background touch-manipulation", showInstallPrompt)}>
        {/* <PrivyProvider
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
        > */}
        <PrivyProvider
          appId="cm51rmjaz04s9ojzwfaopdnzd"
          config={{
            embeddedWallets: {
              createOnLogin: true,
              noPromptOnSignature: true,
            },
            solanaClusters: [
				{name: 'devnet', rpcUrl: 'https://api.devnet.solana.com'}
			],
            appearance: {
              walletChainType: 'solana-only',
              theme: 'dark',
              accentColor: '#3b82f6'
            }
          }}
        >
          <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <UserProvider>
                  <div className="flex flex-col min-h-screen">
                    {!isInvitePath && (
                      <Header className="sticky top-0 z-50" />
                    )}
                    {isChecking ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-gaming-text-secondary">Loading...</div>
                      </div>
                    ) : (
                      <TokenTimerWrapper>
                        <RPSProvider>
                          <main className="flex-1 overflow-y-auto">
                            {children}
                          </main>
                          {showBottomNav && (
                            <BottomNav className="sticky bottom-0 z-50" />
                          )}

                        </RPSProvider>
                      </TokenTimerWrapper>
                    )}
                  </div>
                  {showPWAPrompt && (
                    <div>
                      <InstallPWAModal open={showInstallPrompt} onOpenChange={setShowInstallPrompt} />
                      <div className="fixed inset-0 z-[100] bg-black">
                        <InstallationPage />
                        <InstallPWAModal open={showInstallPrompt} onOpenChange={setShowInstallPrompt} />
                      </div>
                    </div>
                  )}
                  <Toaster />
                  <Sonner />
                </UserProvider>
              </TooltipProvider>
          </QueryClientProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}