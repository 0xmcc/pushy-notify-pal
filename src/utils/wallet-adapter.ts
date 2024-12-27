import { PublicKey } from '@solana/web3.js';
import { Wallet } from '@privy-io/react-auth';
import { AnchorWallet } from '@solana/wallet-adapter-react';

export const createWalletAdapter = (wallet: Wallet): AnchorWallet => {
  console.log('Creating wallet adapter for address:', wallet.address);
  
  return {
    publicKey: new PublicKey(wallet.address),
    signTransaction: async (tx: any) => {
      console.log('Signing transaction...');
      const signedTx = await wallet.signMessage(tx);
      console.log('Transaction signed');
      return signedTx;
    },
    signAllTransactions: async (txs: any[]) => {
      console.log('Signing multiple transactions...');
      const signedTxs = await Promise.all(txs.map(tx => wallet.signMessage(tx)));
      console.log('All transactions signed');
      return signedTxs.filter(Boolean);
    }
  };
};