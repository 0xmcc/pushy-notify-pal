// export type WalletType = {
//   type: 'test';
//   publicKey: PublicKey;
//   keypair: Keypair;
// } | {
//   type: 'real';
//   address: string;
// };

export type TransactionInfo = {
  type: 'create_game' | 'join_game' | 'commit_move' | 'reveal_move';
  signature: string;
  timestamp: number;
  gameAccount?: string;
}; 