import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const NavigationTabs = () => {
  const location = useLocation();

  const tabs = [
    { name: 'Home', href: '/' },
    { name: 'Multiplayer', href: '/multiplayer' },
  ];

  return (
    <nav className="navigation-tabs flex space-x-1">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.href;
        return (
          <Link
            key={tab.name}
            to={tab.href}
            className={cn(
              'navigation-tab px-4 py-2 text-sm font-medium rounded-md transition-colors',
              'hover:text-gaming-text-primary hover:bg-gaming-card/50',
              isActive
                ? 'bg-gaming-card text-gaming-text-primary'
                : 'text-gaming-text-secondary'
            )}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}; 