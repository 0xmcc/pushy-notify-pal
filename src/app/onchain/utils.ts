import { PublicKey, Keypair, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletType } from './types';

export const getWalletDisplayName = (type: 'real' | 'test') => {
  switch (type) {
    case 'test':
      return 'Test Wallet';
    default:
      return 'Your Wallet';
  }
};

export const getShortAddress = (wallet: WalletType | null) => {
  if (!wallet) return 'Not Connected';
  const address = wallet.type === 'test' ? 
    wallet.publicKey.toBase58() : 
    wallet.address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const getExplorerUrl = (type: 'tx' | 'address', value: string) => {
  return `https://explorer.solana.com/${type}/${value}?cluster=devnet`;
};

export const getWalletPublicKey = (wallet: WalletType): PublicKey => {
  if (wallet.type === 'test') {
    return wallet.publicKey;
  }
  return new PublicKey(wallet.address);
};

export const getWalletSigner = (wallet: WalletType): Keypair | undefined => {
  if (wallet.type === 'test') {
    return wallet.keypair;
  }
  return undefined;
};

export const validateGameAction = (
  program: any,
  wallet: WalletType | null,
  gamePublicKey?: string
): { isValid: boolean; error?: string } => {
  if (!program) return { isValid: false, error: 'Program not initialized' };
  if (!wallet) return { isValid: false, error: 'Wallet not connected' };
  if (gamePublicKey && !gamePublicKey) return { isValid: false, error: 'Game public key required' };
  return { isValid: true };
};

export const checkBalance = async (wallet: WalletType | null, connection: Connection | null): Promise<number> => {
  if (!wallet || !connection) return 0;
  try {
    const pubkey = getWalletPublicKey(wallet);
    const balance = await connection.getBalance(pubkey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error checking balance:', error);
    return 0;
  }
};

export const checkWalletBalances = async (
  connection: Connection | null,
  testWallet: WalletType | null,
  realWallet: WalletType | null
): Promise<{ test: number; real: number }> => {
  if (!connection) return { test: 0, real: 0 };

  const [testBalance, realBalance] = await Promise.all([
    checkBalance(testWallet, connection),
    checkBalance(realWallet, connection)
  ]);

  return {
    test: testBalance,
    real: realBalance
  };
}; 