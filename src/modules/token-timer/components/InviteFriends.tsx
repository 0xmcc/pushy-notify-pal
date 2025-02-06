import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle } from "lucide-react";

interface InviteFriendsProps {
  onInviteSent?: () => void;
}

const InviteFriends = ({ onInviteSent }: InviteFriendsProps) => {
  const { toast } = useToast();

  const handleInvite = () => {
    // Create the SMS message
    const message = "Hey! Want to play Rock Paper Scissors with me? Check it out: https://roi-game.vercel.app/";
    
    // Create the SMS link
    const smsLink = `sms:&body=${encodeURIComponent(message)}`;
    
    // Check if the device supports SMS links
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Open SMS app
      window.location.href = smsLink;
      // toast({
      //   title: "Opening messages...",
      //   description: "Send the invite to your friend!",
      // });
    } else {
      // Copy link to clipboard for desktop users
      navigator.clipboard.writeText("https://roi-game.vercel.app/").then(() => {
        toast({
          title: "Link copied!",
          description: "Share the link with your friend to play together.",
        });
      }).catch(() => {
        toast({
          title: "Couldn't copy link",
          description: "Please manually copy: https://roi-game.vercel.app/",
          variant: "destructive"
        });
      });
    }
    
    onInviteSent?.();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="mb-12 w-full bg-white text-[#1A1F2C] rounded-full py-4 px-6 font-medium flex items-center justify-center gap-2 shadow-lg"
      onClick={handleInvite}
    >
      <MessageCircle className="w-5 h-5" />
      Challenge Friend
    </motion.button>
  );
};

export default InviteFriends;