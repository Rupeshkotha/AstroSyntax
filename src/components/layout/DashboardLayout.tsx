import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  LightBulbIcon,
  CalendarIcon,
  BookOpenIcon,
  UserCircleIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  path: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
}

const navigation: NavItem[] = [
  { name: 'Overview', path: '/dashboard', icon: HomeIcon },
  { name: 'Hackathons', path: '/hackathons', icon: CalendarIcon },
  { name: 'Team Hub', path: '/teams', icon: UserGroupIcon },
  { name: 'Idea Generator', path: '/ideagenerator', icon: LightBulbIcon },
  { name: 'Community Hub', path: '/dashboard/community', icon: ChatBubbleLeftRightIcon },
  { name: 'Discussions', path: '/discussions', icon: ChartBarIcon },
  { name: 'Messages', path: '/messages', icon: InboxIcon },
  { name: 'Resources', path: '/resources', icon: BookOpenIcon },
  { name: 'Profile', path: '/profile', icon: UserCircleIcon },
];

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-surface/80 backdrop-blur-xl border-r border-white/10">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-white/10">
            <Link to="/" className="text-2xl font-bold gradient-text">
              HackHub
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary'
                      : 'text-text-secondary hover:bg-white/5 hover:text-text'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 flex flex-col items-center">
        <main className="flex-1 w-full max-w-7xl px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;