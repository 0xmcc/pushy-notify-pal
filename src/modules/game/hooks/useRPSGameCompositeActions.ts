import { useCallback } from 'react';
import { WalletType } from '../types';
import { validateGameAction, getWalletPublicKey, getWalletSigner } from '@/app/onchain/utils';
import { toast } from 'sonner';
import { useRPSCreateGame } from './useRPSCreateGame';
import { useRPSCommitMove } from './useRPSCommitMove';
import { TransactionInfo } from './useRPSGameActions';
import { useRPSGameTransactions } from './useRPSGameTransactions';
import { useRPSJoinGame } from './useRPSJoinGame';
import { PublicKey } from '@solana/web3.js';
import { useRPSRevealMove } from './useRPSRevealMove';
import { updateGameWithSalt, syncGameToSupabase } from './useSolanaGameStateSync';

export function useRPSGameCompositeActions(
  program: any,
  addTransaction: (info: TransactionInfo) => void,
  setGameState: (state: any) => void
) {
  const { createGame } = useRPSCreateGame(program, addTransaction, setGameState);
  const { commitMove } = useRPSCommitMove(program, addTransaction, setGameState);
  const { joinGame } = useRPSJoinGame(program, addTransaction, setGameState);
  const { waitForTransactionConfirmation } = useRPSGameTransactions();
  const { revealMove } = useRPSRevealMove(program, addTransaction, setGameState);

  const handleCreateGameAndCommit = async (
    wallet: WalletType,
    betAmount: string,
    selectedMove: string,
  ) => {
    const validation = validateGameAction(program, wallet);
    if (!validation.isValid) {
      toast.error(validation.error);
      return null;
    }

    try {
      const walletPubkey = getWalletPublicKey(wallet);
      const signer = getWalletSigner(wallet);
      
      // First create the game
      const result = await createGame(walletPubkey, betAmount, signer);
      if (!result) {
        throw new Error('Failed to create game');
      }

      // Wait for transaction confirmation
      const confirmation = await waitForTransactionConfirmation(program, result.tx, result.gamePda);
      if (!confirmation.confirmed) {
        throw new Error('Game creation transaction failed to confirm');
      }

      // Then commit the move
      const moveNumber = parseInt(selectedMove);
      const salt = crypto.getRandomValues(new Uint8Array(32));
      
      const commitResult = await commitMove(
        walletPubkey,
        result.gamePda,
        moveNumber,
        salt,
        signer
      );

      if (commitResult) {
        await syncGameToSupabase(
          commitResult.gameAccount,
          result.gamePda.toString(),
          {
            playerNumber: 1,
            moveNumber: selectedMove,
            salt,
            walletAddress: walletPubkey.toString()
          }
        );

        toast.success('Game created and move committed successfully!');
        return {
          gamePda: result.gamePda,
          moveNumber: selectedMove,
          salt,
          gameAccount: commitResult.gameAccount
        };
      }
      return null;
    } catch (error) {
      console.error('Error in create and commit:', error);
      toast.error('Failed to create game and commit move');
      throw error;
    }
  };

  const handleJoinGameAndCommit = async (
    wallet: WalletType,
    gamePublicKey: string,
    selectedMove: string,
  ) => {
    const validation = validateGameAction(program, wallet);
    if (!validation.isValid) {
      toast.error(validation.error);
      return null;
    }

    try {
      const walletPubkey = getWalletPublicKey(wallet);
      const signer = getWalletSigner(wallet);
      
      // First join the game
      const result = await joinGame(walletPubkey, gamePublicKey, signer);
      if (!result) {
        throw new Error('Failed to join game');
      }

      console.log('Join game result:', result);
      // Wait for transaction confirmation
      const confirmation = await waitForTransactionConfirmation(program, result, new PublicKey(gamePublicKey));
      if (!confirmation.confirmed) {
        throw new Error('Join game transaction failed to confirm');
      }

      // Then commit the move
      const moveNumber = parseInt(selectedMove);
      const salt = crypto.getRandomValues(new Uint8Array(32));
      
      const commitResult = await commitMove(
        walletPubkey,
        new PublicKey(gamePublicKey),
        moveNumber,
        salt,
        signer
      );

      if (!commitResult) {
        throw new Error('Failed to commit move');
      }

      await syncGameToSupabase(
        commitResult.gameAccount,
        gamePublicKey,
        {
          playerNumber: 2,
          moveNumber: selectedMove,
          salt,
          walletAddress: walletPubkey.toString()
        }
      );

      const gameAccount = await program.account.game.fetch(new PublicKey(gamePublicKey));
      const opponent = gameAccount.playerOne

      const [gameVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), new PublicKey(gamePublicKey).toBuffer()],
        program.programId
      );

      const [playerVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("player_vault"), walletPubkey.toBuffer()],
        program.programId
      );

      const [opponentVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("player_vault"), opponent.toBuffer()],
        program.programId
      );

      const revealResult = await revealMove(
        walletPubkey,
        gamePublicKey,
        moveNumber,
        salt,
        opponent,
        gameVaultPda,
        playerVaultPda,
        opponentVaultPda,
        signer
      );

      if (revealResult) {
        toast.success('Joined game, committed and revealed move successfully!');
        return {
          gamePda: new PublicKey(gamePublicKey),
          moveNumber: selectedMove,
          salt,
          gameAccount: revealResult.gameAccount
        };
      }
      return null;
    } catch (error) {
      console.error('Error in join, commit and reveal:', error);
      toast.error('Failed to join game, commit and reveal move');
      throw error;
    }
  };

  return {
    handleCreateGameAndCommit,
    handleJoinGameAndCommit
  };
} 