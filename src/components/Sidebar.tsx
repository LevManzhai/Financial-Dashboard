'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Search, 
  Settings, 
  User
} from 'lucide-react';
import { useTransactions } from '@/contexts/TransactionContext';
import { useTheme } from '@/contexts/ThemeContext';

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

export default function Sidebar({ isMobileMenuOpen = false, onCloseMobileMenu }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { themeSettings, isClient } = useTheme();
  // Get current active item based on pathname
  const getCurrentPage = () => {
    if (pathname === '/') return 'Dashboard';
    const pageName = pathname.slice(1);
    // Map path to menu item id
    const pathMap: { [key: string]: string } = {
      'wallet': 'Wallet',
      'transactions': 'Transactions', 
      'revenue': 'Revenue',
      'search': 'Search',
      'settings': 'Settings'
    };
    return pathMap[pageName] || pageName;
  };

  const [activeItem, setActiveItem] = useState(getCurrentPage());

  // Update active item when pathname changes
  useEffect(() => {
    const currentPage = getCurrentPage();
    setActiveItem(currentPage);
  }, [pathname]);

  const menuItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { id: 'Wallet', icon: Wallet, label: 'Wallet', path: '/wallet' },
    { id: 'Transactions', icon: CreditCard, label: 'Transactions', path: '/transactions' },
    { id: 'Revenue', icon: TrendingUp, label: 'Revenue analytics', path: '/revenue' },
    { id: 'Search', icon: Search, label: 'Search', path: '/search' },
  ];

  const bottomItems = [
    { id: 'Settings', icon: Settings, label: 'Setting', path: '/settings' },
  ];

  const handleItemClick = (item: { id: string; path?: string }) => {
    setActiveItem(item.id);
    if (item.path) {
      router.push(item.path);
    }
    // Close mobile menu after navigation
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  return (
    <div className={`
      w-64 bg-white border-r border-gray-200 h-screen flex flex-col
      ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto' : 'hidden lg:flex'}
    `}>
      {/* User Profile */}
      <div className="p-4 xs:p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-color)' }}>
            <User className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm xs:text-base">Lev Manzhai</h3>
            <p className="text-xs xs:text-sm text-gray-500">Web Developer</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 xs:p-4">
        <ul className="space-y-1 xs:space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center space-x-3 px-2 xs:px-3 py-2 rounded-lg transition-colors text-sm xs:text-base ${
                    activeItem === item.id
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={activeItem === item.id ? { backgroundColor: 'var(--primary-color)' } : {}}
                >
                  <Icon className="w-4 h-4 xs:w-5 xs:h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Separator */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Bottom Menu */}
        <ul className="space-y-1 xs:space-y-2">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button 
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center space-x-3 px-2 xs:px-3 py-2 rounded-lg transition-colors text-sm xs:text-base ${
                    activeItem === item.id
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={activeItem === item.id ? { backgroundColor: 'var(--primary-color)' } : {}}
                >
                  <Icon className="w-4 h-4 xs:w-5 xs:h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
