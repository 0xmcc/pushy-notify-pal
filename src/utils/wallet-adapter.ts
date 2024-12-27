import { PublicKey, Transaction } from '@solana/web3.js';
import { Wallet } from '@privy-io/react-auth';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Buffer } from 'buffer';

// Convert Ethereum-style address to Solana address format
const convertToSolanaAddress = (ethAddress: string): string => {
  // Remove '0x' prefix if present
  const cleanAddress = ethAddress.replace('0x', '');
  // Convert to Buffer and encode as base58
  return Buffer.from(cleanAddress, 'hex').toString('base58');
};

export const createWalletAdapter = (wallet: Wallet): AnchorWallet => {
  console.log('Creating wallet adapter for address:', wallet.address);
  
  // Convert Ethereum address to Solana format
  const solanaAddress = convertToSolanaAddress(wallet.address);
  console.log('Converted to Solana address:', solanaAddress);

  return {
    publicKey: new PublicKey(solanaAddress),
    signTransaction: async (tx: Transaction) => {
      console.log('Signing transaction...');
      // Convert transaction to bytes for signing
      const serializedTx = tx.serialize({requireAllSignatures: false});
      const signature = await wallet.signMessage(serializedTx);
      console.log('Transaction signed');
      return tx;
    },
    signAllTransactions: async (txs: Transaction[]) => {
      console.log('Signing multiple transactions...');
      const signedTxs = await Promise.all(
        txs.map(async (tx) => {
          const serializedTx = tx.serialize({requireAllSignatures: false});
          await wallet.signMessage(serializedTx);
          return tx;
        })
      );
      console.log('All transactions signed');
      return signedTxs;
    }
  };
};