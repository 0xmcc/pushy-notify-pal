import { NavigationMenu } from "@/components/ui/navigation-menu";
import { Logo } from "./header/Logo";
import { ProfileButton } from "./header/ProfileButton";
import { WalletBalance } from "./wallet/WalletBalance";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-full items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          <WalletBalance />
          <ProfileButton />
        </div>
      </div>
    </header>
  );
};