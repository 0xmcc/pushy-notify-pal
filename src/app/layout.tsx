'use client';

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from '@privy-io/react-auth';
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { RPSProvider } from '@/providers/RPSProvider';

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated } = usePrivy();
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    setShowNav(authenticated);
  }, [authenticated]);

  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-full">
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
              <div className="flex flex-col min-h-full">
                {true && <Header className="fixed top-0 left-0 right-0 z-50" />}
                <main className="flex-1 overflow-y-auto pt-20 pb-16">
                  {children}
                </main>
                {true && <BottomNav className="fixed bottom-0 left-0 right-0 z-50" />}
              </div>
              <Toaster />
              <Sonner />
            </TooltipProvider>
            </RPSProvider>
          </QueryClientProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}