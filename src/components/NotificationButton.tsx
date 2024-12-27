import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BellRing } from 'lucide-react';

const NotificationButton = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success("Notifications enabled!");
      } else if (result === 'denied') {
        toast.error("Notifications blocked");
      }
    } catch (error) {
      toast.error("Error requesting permission");
      console.error('Error requesting notification permission:', error);
    }
  };

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