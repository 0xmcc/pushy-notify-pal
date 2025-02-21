import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { Wallet } from '@privy-io/react-auth';
import { AnchorWallet } from '@solana/wallet-adapter-react';

// Extend the Privy Wallet type to include Solana-specific methods
interface SolanaWallet extends Wallet {
  signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>;
  signAllTransactions: (transactions: (Transaction | VersionedTransaction)[]) => Promise<(Transaction | VersionedTransaction)[]>;
}

export const createWalletAdapter = (wallet: Wallet): AnchorWallet => {
  console.log('Creating wallet adapter for address:', wallet.address);
  
  const solanaWallet = wallet as SolanaWallet;
  
  return {
    publicKey: new PublicKey(wallet.address),
    signTransaction: async <T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> => {
      console.log('Signing transaction...');
      return await solanaWallet.signTransaction(transaction) as T;
    },
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> => {
      console.log('Signing multiple transactions...');
      return await solanaWallet.signAllTransactions(transactions) as T[];
    }
  };
};

