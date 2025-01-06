import { createContext, useContext, useEffect, useState } from 'react';
import { 
  Connection, 
  PublicKey, 
  SystemProgram, 
  Transaction, 
  TransactionInstruction 
} from '@solana/web3.js';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';

// Simple Move enum for MVP
enum Move {
    Rock = 0,
    Paper = 1,
    Scissors = 2
}

const PROGRAM_ID = '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin';
class GameClient {
    constructor(
        readonly connection: Connection,
        readonly wallet: PublicKey,
        readonly programId = new PublicKey(PROGRAM_ID)
    ) {}

    async initializePlayer(): Promise<string> {
        // Find PDAs for player account and vault
        const [playerPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("player"),
                this.wallet.toBuffer()
            ],
            this.programId
        );

        const [vaultPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("vault"),
                this.wallet.toBuffer()
            ],
            this.programId
        );

        // Create instruction
        const ix = new TransactionInstruction({
            programId: this.programId,
            keys: [
                { pubkey: this.wallet, isSigner: true, isWritable: true },
                { pubkey: playerPDA, isSigner: false, isWritable: true },
                { pubkey: vaultPDA, isSigner: false, isWritable: true },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            ],
            data: Buffer.from([110,201,169,254,204,246,166,156]) // createPlayer discriminator
        });

        // Create and send transaction
        const tx = new Transaction().add(ix);
        const { blockhash } = await this.connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = this.wallet;
        
        return tx;
    }

    async createGame(betAmount: number): Promise<string> {
        const timestamp = Math.floor(Date.now() / 1000);
        
        // Create game instruction
        const ix = new TransactionInstruction({
            programId: this.programId,
            keys: [
                { pubkey: this.wallet, isSigner: true, isWritable: true },
                { pubkey: await this.deriveGameAccount(timestamp), isSigner: false, isWritable: true },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            ],
            data: Buffer.concat([
                Buffer.from([178,185,167,97,39,32,141,39]), // createGame discriminator
                Buffer.from(new BigInt64Array([BigInt(timestamp)]).buffer), // timestamp
                Buffer.from(new BigUint64Array([BigInt(betAmount)]).buffer) // betAmount
            ])
        });

        // Create and send transaction
        const tx = new Transaction().add(ix);
        const { blockhash } = await this.connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = this.wallet;
        
        return tx;
    }

    private async deriveGameAccount(timestamp: number): Promise<PublicKey> {
        const [gamePDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("game"),
                this.wallet.toBuffer(),
                Buffer.from(timestamp.toString())
            ],
            this.programId
        );
        return gamePDA;
    }
}

// Context type
interface RPSContextType {
    client: GameClient | null;
    connection: Connection | null;
    connected: boolean;
}

// Create context
const RPSContext = createContext<RPSContextType>({
    client: null,
    connection: null,
    connected: false
});

// Hook to use RPS context
export function useRPS() {
    return useContext(RPSContext);
}

// Provider component
export function RPSProvider({ children }: { children: React.ReactNode }) {
    const { ready, authenticated } = usePrivy();
    const { wallets } = useSolanaWallets();
    const [client, setClient] = useState<GameClient | null>(null);
    const [connection, setConnection] = useState<Connection | null>(null);

    useEffect(() => {
        // Initialize connection
        const conn = new Connection('https://api.devnet.solana.com', 'confirmed');
        setConnection(conn);
    }, []);

    useEffect(() => {
        if (!ready || !authenticated || !connection || wallets.length === 0) {
            setClient(null);
            return;
        }

        // Create new client when wallet is connected
        const wallet = new PublicKey(wallets[0].address);
        const newClient = new GameClient(connection, wallet);
        setClient(newClient);
    }, [ready, authenticated, connection, wallets]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createGame = async (betAmount: number) => {
        if (!client || !wallets[0]) {
            throw new Error('Wallet not connected');
        }

        setLoading(true);
        setError(null);

        try {
            const tx = await client.createGame(betAmount);
            const signature = await wallets[0].sendTransaction!(tx, connection);
            await connection?.confirmTransaction(signature);
            return signature;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create game';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const initializePlayer = async () => {
        if (!client || !wallets[0]) {
            throw new Error('Wallet not connected');
        }

        setLoading(true);
        setError(null);

        try {
            const tx = await client.initializePlayer();
            const signature = await wallets[0].sendTransaction!(tx, connection);
            await connection?.confirmTransaction(signature);
            return signature;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to initialize player';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    const contextValue = {
        client,
        connection,
        connected: authenticated && !!client,
        createGame,
        initializePlayer,
        loading,
        error
    };

    return (
        <RPSContext.Provider value={contextValue}>
            {children}
        </RPSContext.Provider>
    );
}