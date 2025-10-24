'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Search, 
  Settings, 
  User,
  Bell,
  X,
  Check,
  Trash2
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

export default function Sidebar({ isMobileMenuOpen = false, onCloseMobileMenu }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { themeSettings } = useTheme();
  const { notifications, unreadCount, markAsRead, removeNotification, clearAllNotifications } = useNotifications();
  const [isDark, setIsDark] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const checkDark = () => {
      if (themeSettings.mode === 'dark') return true;
      if (themeSettings.mode === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    setIsDark(checkDark());

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setIsDark(checkDark());
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeSettings.mode]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isNotificationOpen && !target.closest('.notification-dropdown')) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  const getCurrentPage = () => {
    if (pathname === '/') return 'Dashboard';
    const pageName = pathname.slice(1).replace('/', '');
    const pathMap: { [key: string]: string } = {
      'wallet': 'Wallet',
      'transactions': 'Transactions',
      'revenue': 'Revenue',
      'search': 'Search',
      'settings': 'Settings'
    };
    return pathMap[pageName] || 'Dashboard';
  };

  const activeItem = getCurrentPage();

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
    if (item.path) {
      router.push(item.path);
    }
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  return (
    <div className={`
      w-64 bg-white border-r border-gray-200 h-screen flex flex-col
      ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto' : 'hidden lg:flex'}
    `} style={{ overflow: 'visible' }}>
      {/* User Profile */}
      <div className="h-12 xs:h-14 sm:h-16 flex items-center px-4 xs:px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 w-full">
          <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-full flex items-center justify-center bg-primary">
            <User className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
          </div>
          <div>
            <h3 className={`font-semibold text-sm xs:text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>Lev Manzhai</h3>
            <p className={`text-xs xs:text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Web Developer</p>
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
                      ? 'text-white bg-primary hover:bg-primary'
                      : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 xs:w-5 xs:h-5" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.label}</span>
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
                      ? 'text-white bg-primary hover:bg-primary'
                      : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 xs:w-5 xs:h-5" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Notifications - Only visible on mobile */}
      <div className="lg:hidden px-4 py-2 border-t border-gray-200">
        <div className="relative notification-dropdown">
          <button 
            ref={notificationButtonRef}
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
              isNotificationOpen 
                ? 'text-gray-900 bg-primary' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Bell className="h-4 w-4" />
              <span className="text-sm font-medium">Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Notification Dropdown */}
          {isClient && isNotificationOpen && createPortal(
            <div 
              className={`fixed w-80 border rounded-lg shadow-lg z-[9999] ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}
              style={{
                top: notificationButtonRef.current ? 
                  notificationButtonRef.current.getBoundingClientRect().top - 8 : 100,
                left: notificationButtonRef.current ? 
                  Math.max(16, notificationButtonRef.current.getBoundingClientRect().left) : 16,
                transform: 'translateY(-100%)'
              }}
            >
              <div className={`p-4 border-b ${
                isDark 
                  ? 'bg-gray-800/90 border-gray-800' 
                  : 'bg-gray-50/90 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${
                    isDark 
                      ? 'text-white' 
                      : 'text-gray-900'
                  }`}>Notifications</h3>
                  <div className="flex items-center space-x-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className={`text-xs flex items-center space-x-1 ${
                          isDark 
                            ? 'text-gray-400 hover:text-gray-300' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear All</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className={`p-4 text-center text-sm ${
                    isDark 
                      ? 'bg-gray-800 text-gray-400' 
                      : 'bg-white text-gray-500'
                  }`}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b last:border-b-0 hover:transition-colors ${
                        isDark 
                          ? `border-gray-700 hover:bg-gray-700 ${!notification.read ? 'bg-blue-900/20' : 'bg-gray-800'}`
                          : `border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : 'bg-white'}`
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              notification.type === 'success' ? 'bg-green-500' :
                              notification.type === 'error' ? 'bg-red-500' :
                              notification.type === 'warning' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}></div>
                            <h4 className={`font-medium text-sm ${
                              isDark 
                                ? 'text-gray-400' 
                                : 'text-gray-900'
                            }`}>{notification.title}</h4>
                          </div>
                          <p className={`text-xs mt-1 ${
                            isDark 
                              ? 'text-gray-500' 
                              : 'text-gray-600'
                          }`}>{notification.message}</p>
                          <p className={`text-xs mt-1 ${
                            isDark 
                              ? 'text-gray-600' 
                              : 'text-gray-400'
                          }`}>
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className={`p-1 transition-colors ${
                                isDark 
                                  ? 'text-gray-500 hover:text-blue-400' 
                                  : 'text-gray-400 hover:text-blue-600'
                              }`}
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className={`p-1 transition-colors ${
                              isDark 
                                ? 'text-gray-500 hover:text-red-400' 
                                : 'text-gray-400 hover:text-red-600'
                            }`}
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </div>
  );
}