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
  // Determine active item based on current pathname
  const getActiveItem = () => {
    if (pathname === '/' || pathname === '/Financial-Dashboard/' || pathname === '/Financial-Dashboard') {
      return 'Dashboard';
    } else if (pathname === '/wallet' || pathname === '/Financial-Dashboard/wallet') {
      return 'Wallet';
    } else if (pathname === '/transactions' || pathname === '/Financial-Dashboard/transactions') {
      return 'Transactions';
    } else if (pathname === '/revenue' || pathname === '/Financial-Dashboard/revenue') {
      return 'Revenue';
    } else if (pathname === '/search' || pathname === '/Financial-Dashboard/search') {
      return 'Search';
    } else if (pathname === '/settings' || pathname === '/Financial-Dashboard/settings') {
      return 'Settings';
    }
    return 'Dashboard';
  };

  const activeItem = getActiveItem();

  const menuItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/Financial-Dashboard/' },
    { id: 'Wallet', icon: Wallet, label: 'Wallet', path: '/Financial-Dashboard/wallet' },
    { id: 'Transactions', icon: CreditCard, label: 'Transactions', path: '/Financial-Dashboard/transactions' },
    { id: 'Revenue', icon: TrendingUp, label: 'Revenue analytics', path: '/Financial-Dashboard/revenue' },
    { id: 'Search', icon: Search, label: 'Search', path: '/Financial-Dashboard/search' },
  ];

  const bottomItems = [
    { id: 'Settings', icon: Settings, label: 'Setting', path: '/Financial-Dashboard/settings' },
  ];

  const handleItemClick = (item: any) => {
    if (item.path) {
      window.location.href = item.path;
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
