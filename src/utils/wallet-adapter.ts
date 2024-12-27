import { PublicKey } from '@solana/web3.js';
import { Wallet } from '@privy-io/react-auth';

export const createWalletAdapter = (wallet: Wallet) => ({
  publicKey: new PublicKey(wallet.address),
  signTransaction: async (tx: any) => {
    const signedTx = await wallet.signTransaction(tx);
    return signedTx;
  },
  signAllTransactions: async (txs: any[]) => {
    const signedTxs = await Promise.all(txs.map(tx => wallet.signTransaction(tx)));
    return signedTxs.filter(Boolean);
  }
});