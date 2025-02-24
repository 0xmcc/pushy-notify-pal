import { getExplorerUrl } from '../utils';

interface Transaction {
  type: string;
  signature: string;
  timestamp: number;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  return (
    <div className="mt-6 p-4 border border-gray-700 rounded-lg">
      <h4 className="text-xl font-semibold mb-4">Transaction History</h4>
      <div className="space-y-2">
        {transactions.map((tx, index) => (
          <div key={index} className="p-2 bg-gray-700 rounded">
            <div className="flex justify-between items-center">
              <span className="capitalize">{tx.type.replace('_', ' ')}</span>
              <a 
                href={getExplorerUrl('tx', tx.signature)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                {tx.signature.slice(0, 4)}...{tx.signature.slice(-4)}
              </a>
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {new Date(tx.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="text-gray-400 text-center p-4">
            No transactions yet
          </div>
        )}
      </div>
    </div>
  );
}; 