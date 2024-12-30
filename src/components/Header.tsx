import { cn } from "@/lib/utils";
import Logo from "./header/Logo";
import ProfileButton from "./header/ProfileButton";

interface HeaderProps {
  className?: string;
}

export const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn(
      "h-20 bg-gaming-background border-b border-gaming-card flex items-center justify-between px-4",
      className
    )}>
      <Logo />
      <ProfileButton />
    </header>
  );
};