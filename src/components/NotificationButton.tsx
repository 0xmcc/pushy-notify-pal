import { Button } from "@/components/ui/button";
import { BellRing } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationButton = () => {
  const { permission, requestPermission } = useNotifications();

  if (permission === 'granted') {
    return (
      <Button 
        disabled 
        className="w-full h-12 bg-gaming-success hover:bg-gaming-success/90 cursor-default flex items-center justify-center gap-2"
      >
        <BellRing className="w-5 h-5" />
        <span>Notifications Enabled</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={requestPermission}
      className="w-full h-12 bg-gradient-to-r from-gaming-primary to-gaming-secondary hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2"
    >
      <BellRing className="w-5 h-5" />
      <span>Enable Notifications</span>
    </Button>
  );
};

export default NotificationButton;