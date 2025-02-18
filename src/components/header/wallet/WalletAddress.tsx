import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface WalletAddressProps {
  address: string;
}

export const WalletAddress = ({ address }: WalletAddressProps) => {
  const [copied, setCopied] = useState(false);

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  return (
    <DropdownMenuItem 
      onClick={() => copyToClipboard(address)}
      className="gap-2 cursor-pointer"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      <span>{truncateAddress(address)}</span>
    </DropdownMenuItem>
  );
}; 