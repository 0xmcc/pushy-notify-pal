import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';

export type TransactionConfirmationResult = {
  confirmed: boolean;
  gameAccount: any;
};

export function useRPSGameTransactions() {
  const connection = new Connection(clusterApiUrl('devnet'));

  const waitForTransactionConfirmation = async (
    program: any,
    signature: string,
    gamePda: PublicKey
  ): Promise<TransactionConfirmationResult> => {
    let timeoutCount = 0;
    const maxTimeout = 30;
    
    while (timeoutCount < maxTimeout) {
      const status = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
      
      if (status) {
        if (status.meta?.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(status.meta.err)}`);
        }
        
        if (status.blockTime && status.slot) {
          try {
            const gameAccount = await program?.account.game.fetch(gamePda);
            return { confirmed: true, gameAccount };
          } catch (e) {
            console.log('Game account not yet available, retrying...');
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      timeoutCount++;
    }
    
    throw new Error('Transaction confirmation timeout');
  };

  return {
    waitForTransactionConfirmation,
    connection
  };
} 