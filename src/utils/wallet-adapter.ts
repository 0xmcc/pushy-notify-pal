import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { Wallet } from '@privy-io/react-auth';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';

const convertToSolanaAddress = (ethAddress: string): string => {
  const cleanAddress = ethAddress.replace('0x', '');
  const bytes = Buffer.from(cleanAddress, 'hex');
  return bs58.encode(bytes);
};

export const createWalletAdapter = (wallet: Wallet): AnchorWallet => {
  console.log('Creating wallet adapter for address:', wallet.address);
  
  const solanaAddress = convertToSolanaAddress(wallet.address);
  console.log('Converted to Solana address:', solanaAddress);

  return {
    publicKey: new PublicKey(solanaAddress),
    signTransaction: async <T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> => {
      console.log('Signing transaction...');
      const serializedTx = transaction.serialize({ requireAllSignatures: false });
      const signature = await wallet.signTransaction(serializedTx);
      console.log('Transaction signed');
      return transaction as T;
    },
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> => {
      console.log('Signing multiple transactions...');
      const signedTxs = await Promise.all(
        transactions.map(async (tx) => {
          const serializedTx = tx.serialize({ requireAllSignatures: false });
          await wallet.signTransaction(serializedTx);
          return tx;
        })
      );
      console.log('All transactions signed');
      return signedTxs;
    }
  };
};