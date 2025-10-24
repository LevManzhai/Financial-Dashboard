'use client';

import { Search, Bell, Database, X, Menu, Check, Trash2, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useTransactions, setGlobalNotificationFunction } from '@/contexts/TransactionContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  title?: string;
}

export default function Header({ isMobileMenuOpen = false, onToggleMobileMenu, title = 'Dashboard' }: HeaderProps) {
  const router = useRouter();
  const { state, loadTransactions, deleteTransaction } = useTransactions();
  const { notifications, unreadCount, markAsRead, removeNotification, clearAllNotifications, addNotification } = useNotifications();
  const { themeSettings } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check dark theme
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkTheme(isDark);
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Force re-render when theme settings change
  useEffect(() => {
    if (isClient) {
      // This will trigger a re-render when themeSettings change
    }
  }, [themeSettings, isClient]);


  useEffect(() => {
    setGlobalNotificationFunction((notif) => {
      const type = notif.type as 'success' | 'info' | 'warning' | 'error';
      addNotification({ ...notif, title: type.charAt(0).toUpperCase() + type.slice(1), type });
    });
  }, [addNotification]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileSearchOpen && !target.closest('.mobile-search-overlay')) {
        setIsMobileSearchOpen(false);
      }
    };

    if (isMobileSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileSearchOpen]);

  const handleLoadMockData = () => {
    if (state.transactions.length > 0) {
      if (confirm('This will replace all existing transactions with mock data. Continue?')) {
        // Clear existing transactions first
        state.transactions.forEach(transaction => {
          deleteTransaction(transaction.id);
        });
        // Load mock data immediately
        loadTransactions(mockTransactions);
      }
    } else {
      // Load mock data directly
      loadTransactions(mockTransactions);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      // Store search term in localStorage and navigate to search page
      localStorage.setItem('searchQuery', searchTerm.trim());
      router.push('/search');
      setIsMobileSearchOpen(false);
    }
  };

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    if (!isMobileSearchOpen) {
      setTimeout(() => {
        const searchInput = document.querySelector('.mobile-search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  };

  const getSuggestions = (query: string) => {
    if (!query || query.length < 2) return [];
    
    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();
    
    state.transactions.forEach(transaction => {
      if (transaction.category.toLowerCase().includes(lowerQuery)) {
        suggestions.add(transaction.category);
      }
      
      if (transaction.description.toLowerCase().includes(lowerQuery)) {
        suggestions.add(transaction.description);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  };

  const suggestions = getSuggestions(searchTerm);

  useEffect(() => {
    setShowSuggestions(searchTerm.length >= 2);
  }, [searchTerm]);

  // Mock data - July to November 2025
  const mockTransactions = [
    // July 2025 - Start with salary first
    {
      id: 'new-mock-1',
      category: 'Salary',
      description: 'July salary',
      amount: 2500,
      date: '2025-07-01',
      type: 'income' as const,
      createdAt: '2025-07-01T09:00:00Z',
      updatedAt: '2025-07-01T09:00:00Z'
    },
    {
      id: 'new-mock-2',
      category: 'Food',
      description: 'Grocery shopping',
      amount: 180,
      date: '2025-07-02',
      type: 'expense' as const,
      createdAt: '2025-07-02T10:00:00Z',
      updatedAt: '2025-07-02T10:00:00Z'
    },
    {
      id: 'new-mock-3',
      category: 'Transport',
      description: 'Gas and public transport',
      amount: 120,
      date: '2025-07-03',
      type: 'expense' as const,
      createdAt: '2025-07-03T08:00:00Z',
      updatedAt: '2025-07-03T08:00:00Z'
    },
    {
      id: 'new-mock-4',
      category: 'Health',
      description: 'Health insurance',
      amount: 280,
      date: '2025-07-04',
      type: 'expense' as const,
      createdAt: '2025-07-04T12:00:00Z',
      updatedAt: '2025-07-04T12:00:00Z'
    },
    {
      id: 'new-mock-5',
      category: 'Entertainment',
      description: 'Movies and dining out',
      amount: 95,
      date: '2025-07-05',
      type: 'expense' as const,
      createdAt: '2025-07-05T19:00:00Z',
      updatedAt: '2025-07-05T19:00:00Z'
    },
    {
      id: 'new-mock-6',
      category: 'Utilities',
      description: 'Electricity and internet',
      amount: 145,
      date: '2025-07-06',
      type: 'expense' as const,
      createdAt: '2025-07-06T14:00:00Z',
      updatedAt: '2025-07-06T14:00:00Z'
    },
    {
      id: 'new-mock-7',
      category: 'Shopping',
      description: 'Summer clothes',
      amount: 220,
      date: '2025-07-07',
      type: 'expense' as const,
      createdAt: '2025-07-07T16:00:00Z',
      updatedAt: '2025-07-07T16:00:00Z'
    },
    // August 2025
    {
      id: 'new-mock-8',
      category: 'Salary',
      description: 'August salary',
      amount: 2500,
      date: '2025-08-01',
      type: 'income' as const,
      createdAt: '2025-08-01T09:00:00Z',
      updatedAt: '2025-08-01T09:00:00Z'
    },
    {
      id: 'new-mock-9',
      category: 'Food',
      description: 'Grocery shopping',
      amount: 165,
      date: '2025-08-03',
      type: 'expense' as const,
      createdAt: '2025-08-03T10:00:00Z',
      updatedAt: '2025-08-03T10:00:00Z'
    },
    {
      id: 'new-mock-10',
      category: 'Transport',
      description: 'Gas and public transport',
      amount: 135,
      date: '2025-08-08',
      type: 'expense' as const,
      createdAt: '2025-08-08T08:00:00Z',
      updatedAt: '2025-08-08T08:00:00Z'
    },
    {
      id: 'new-mock-11',
      category: 'Health',
      description: 'Health insurance',
      amount: 280,
      date: '2025-08-15',
      type: 'expense' as const,
      createdAt: '2025-08-15T12:00:00Z',
      updatedAt: '2025-08-15T12:00:00Z'
    },
    {
      id: 'new-mock-12',
      category: 'Entertainment',
      description: 'Concert tickets',
      amount: 150,
      date: '2025-08-22',
      type: 'expense' as const,
      createdAt: '2025-08-22T20:00:00Z',
      updatedAt: '2025-08-22T20:00:00Z'
    },
    {
      id: 'new-mock-13',
      category: 'Utilities',
      description: 'Electricity and internet',
      amount: 155,
      date: '2025-08-20',
      type: 'expense' as const,
      createdAt: '2025-08-20T14:00:00Z',
      updatedAt: '2025-08-20T14:00:00Z'
    },
    {
      id: 'new-mock-14',
      category: 'Shopping',
      description: 'Electronics',
      amount: 320,
      date: '2025-08-28',
      type: 'expense' as const,
      createdAt: '2025-08-28T15:00:00Z',
      updatedAt: '2025-08-28T15:00:00Z'
    },
    // September 2025
    {
      id: 'new-mock-15',
      category: 'Salary',
      description: 'September salary',
      amount: 2500,
      date: '2025-09-01',
      type: 'income' as const,
      createdAt: '2025-09-01T09:00:00Z',
      updatedAt: '2025-09-01T09:00:00Z'
    },
    {
      id: 'new-mock-16',
      category: 'Food',
      description: 'Grocery shopping',
      amount: 195,
      date: '2025-09-05',
      type: 'expense' as const,
      createdAt: '2025-09-05T10:00:00Z',
      updatedAt: '2025-09-05T10:00:00Z'
    },
    {
      id: 'new-mock-17',
      category: 'Transport',
      description: 'Gas and public transport',
      amount: 110,
      date: '2025-09-12',
      type: 'expense' as const,
      createdAt: '2025-09-12T08:00:00Z',
      updatedAt: '2025-09-12T08:00:00Z'
    },
    {
      id: 'new-mock-18',
      category: 'Health',
      description: 'Health insurance',
      amount: 280,
      date: '2025-09-15',
      type: 'expense' as const,
      createdAt: '2025-09-15T12:00:00Z',
      updatedAt: '2025-09-15T12:00:00Z'
    },
    {
      id: 'new-mock-19',
      category: 'Entertainment',
      description: 'Weekend trip',
      amount: 280,
      date: '2025-09-20',
      type: 'expense' as const,
      createdAt: '2025-09-20T18:00:00Z',
      updatedAt: '2025-09-20T18:00:00Z'
    },
    {
      id: 'new-mock-20',
      category: 'Utilities',
      description: 'Electricity and internet',
      amount: 140,
      date: '2025-09-20',
      type: 'expense' as const,
      createdAt: '2025-09-20T14:00:00Z',
      updatedAt: '2025-09-20T14:00:00Z'
    },
    {
      id: 'new-mock-21',
      category: 'Shopping',
      description: 'Fall clothing',
      amount: 180,
      date: '2025-09-25',
      type: 'expense' as const,
      createdAt: '2025-09-25T16:00:00Z',
      updatedAt: '2025-09-25T16:00:00Z'
    },
    // October 2025
    {
      id: 'new-mock-22',
      category: 'Salary',
      description: 'October salary',
      amount: 2500,
      date: '2025-10-01',
      type: 'income' as const,
      createdAt: '2025-10-01T09:00:00Z',
      updatedAt: '2025-10-01T09:00:00Z'
    },
    {
      id: 'new-mock-23',
      category: 'Food',
      description: 'Grocery shopping',
      amount: 170,
      date: '2025-10-03',
      type: 'expense' as const,
      createdAt: '2025-10-03T10:00:00Z',
      updatedAt: '2025-10-03T10:00:00Z'
    },
    {
      id: 'new-mock-24',
      category: 'Transport',
      description: 'Gas and public transport',
      amount: 125,
      date: '2025-10-08',
      type: 'expense' as const,
      createdAt: '2025-10-08T08:00:00Z',
      updatedAt: '2025-10-08T08:00:00Z'
    },
    {
      id: 'new-mock-25',
      category: 'Health',
      description: 'Health insurance',
      amount: 280,
      date: '2025-10-15',
      type: 'expense' as const,
      createdAt: '2025-10-15T12:00:00Z',
      updatedAt: '2025-10-15T12:00:00Z'
    },
    {
      id: 'new-mock-26',
      category: 'Entertainment',
      description: 'Halloween party',
      amount: 85,
      date: '2025-10-31',
      type: 'expense' as const,
      createdAt: '2025-10-31T20:00:00Z',
      updatedAt: '2025-10-31T20:00:00Z'
    },
    {
      id: 'new-mock-27',
      category: 'Utilities',
      description: 'Electricity and internet',
      amount: 160,
      date: '2025-10-20',
      type: 'expense' as const,
      createdAt: '2025-10-20T14:00:00Z',
      updatedAt: '2025-10-20T14:00:00Z'
    },
    {
      id: 'new-mock-28',
      category: 'Shopping',
      description: 'Home supplies',
      amount: 120,
      date: '2025-10-25',
      type: 'expense' as const,
      createdAt: '2025-10-25T15:00:00Z',
      updatedAt: '2025-10-25T15:00:00Z'
    },
    // November 2025
    {
      id: 'new-mock-29',
      category: 'Salary',
      description: 'November salary',
      amount: 2500,
      date: '2025-11-01',
      type: 'income' as const,
      createdAt: '2025-11-01T09:00:00Z',
      updatedAt: '2025-11-01T09:00:00Z'
    },
    {
      id: 'new-mock-30',
      category: 'Food',
      description: 'Grocery shopping',
      amount: 200,
      date: '2025-11-05',
      type: 'expense' as const,
      createdAt: '2025-11-05T10:00:00Z',
      updatedAt: '2025-11-05T10:00:00Z'
    },
    {
      id: 'new-mock-31',
      category: 'Transport',
      description: 'Gas and public transport',
      amount: 140,
      date: '2025-11-12',
      type: 'expense' as const,
      createdAt: '2025-11-12T08:00:00Z',
      updatedAt: '2025-11-12T08:00:00Z'
    },
    {
      id: 'new-mock-32',
      category: 'Health',
      description: 'Health insurance',
      amount: 280,
      date: '2025-11-15',
      type: 'expense' as const,
      createdAt: '2025-11-15T12:00:00Z',
      updatedAt: '2025-11-15T12:00:00Z'
    },
    {
      id: 'new-mock-33',
      category: 'Entertainment',
      description: 'Thanksgiving dinner',
      amount: 120,
      date: '2025-11-28',
      type: 'expense' as const,
      createdAt: '2025-11-28T18:00:00Z',
      updatedAt: '2025-11-28T18:00:00Z'
    },
    {
      id: 'new-mock-34',
      category: 'Utilities',
      description: 'Electricity and internet',
      amount: 150,
      date: '2025-11-20',
      type: 'expense' as const,
      createdAt: '2025-11-20T14:00:00Z',
      updatedAt: '2025-11-20T14:00:00Z'
    },
    {
      id: 'new-mock-35',
      category: 'Shopping',
      description: 'Black Friday shopping',
      amount: 350,
      date: '2025-11-29',
      type: 'expense' as const,
      createdAt: '2025-11-29T10:00:00Z',
      updatedAt: '2025-11-29T10:00:00Z'
    }
  ];

  return (
    <header className="w-full h-[47px] xs:h-[55px] sm:h-[64px] bg-white shadow-sm border-b border-gray-200 px-2 xs:px-3 sm:px-4 lg:px-6 flex items-center justify-between">
      <div className="flex items-center justify-between w-full">
        {/* Left - Navigation Buttons, Title and Mobile Menu */}
        <div className="flex items-center space-x-2 xs:space-x-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          
          {/* Navigation Menu */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-1 px-1.5 xs:px-2 py-1 xs:py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-3 h-3 xs:w-4 xs:h-4 lg:w-5 lg:h-5" />
              <span className="hidden xs:inline">Back</span>
            </button>
            {title !== 'Dashboard' && (
              <>
                <div className="h-4 w-px bg-gray-300"></div>
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center space-x-1 px-1.5 xs:px-2 py-1 xs:py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LayoutDashboard className="w-3 h-3 xs:w-4 xs:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden xs:inline">Dashboard</span>
                </button>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2 xs:space-x-3">
            {title === 'Search Transactions' && (
              <div className="p-2 xs:p-3 rounded-lg bg-primary-light">
                <Search className="w-5 h-5 xs:w-6 xs:h-6 text-primary" />
              </div>
            )}
            {title === 'Dashboard' && (
              <div className="p-2 xs:p-3 rounded-lg bg-primary-light">
                <LayoutDashboard className="w-5 h-5 xs:w-6 xs:h-6 text-primary" />
              </div>
            )}
            <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
          </div>
        </div>

        {/* Center - Search Bar (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-sm mx-8">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onBlur={(e) => {
                if (!e.relatedTarget || !e.relatedTarget.closest('.suggestion-item')) {
                  setShowSuggestions(false);
                }
              }}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchTerm(suggestion);
                      setShowSuggestions(false);
                      // Store search term and navigate to search page
                      localStorage.setItem('searchQuery', suggestion.trim());
                      router.push('/search');
                    }}
                    className="suggestion-item w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <span>{suggestion}</span>
                    </div>
                  </button>
                ))}
          </div>
            )}
          </form>
        </div>

        {/* Right - Icons and Actions */}
        <div className="flex items-center space-x-2 xs:space-x-4">
          {/* Mobile Search Button */}
          <button 
            onClick={handleMobileSearchToggle}
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Load Mock Data Button - Visible on all screens */}
          {isClient && (
            <button
              onClick={handleLoadMockData}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-xs font-medium text-primary border border-primary"
            >
              <Database className="h-3 w-3" />
              <span className="hidden lg:inline">Load Mock Data</span>
            </button>
          )}

          {/* Notifications */}
          <div className="relative notification-dropdown">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors relative"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className={`absolute right-0 top-full mt-2 w-80 border rounded-lg shadow-lg z-50 ${
                isDarkTheme 
                  ? 'bg-black border-gray-800' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`p-4 border-b ${
                  isDarkTheme 
                    ? 'bg-gray-800/90 border-gray-800' 
                    : 'bg-gray-50/90 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${
                      isDarkTheme 
                        ? 'text-white' 
                        : 'text-gray-900'
                    }`}>Notifications</h3>
                    <div className="flex items-center space-x-2">
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className={`text-xs flex items-center space-x-1 ${
                            isDarkTheme 
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
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className={`p-4 text-center text-sm ${
                      isDarkTheme 
                        ? 'bg-gray-900 text-gray-400' 
                        : 'bg-white text-gray-500'
                    }`}>
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b hover:transition-colors ${
                          isDarkTheme 
                            ? `border-gray-900 hover:bg-gray-700 ${!notification.read ? 'bg-blue-900/20' : 'bg-gray-700'}`
                            : `border-gray-100 hover:bg-gray-100 ${!notification.read ? 'bg-blue-50' : 'bg-gray-100'}`
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
                                isDarkTheme 
                                  ? 'text-gray-400' 
                                  : 'text-gray-900'
                              }`}>{notification.title}</h4>
                            </div>
                            <p className={`text-sm mt-1 ${
                              isDarkTheme 
                                ? 'text-gray-500' 
                                : 'text-gray-600'
                            }`}>{notification.message}</p>
                            <p className={`text-xs mt-1 ${
                              isDarkTheme 
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
                                  isDarkTheme 
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
                                isDarkTheme 
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
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="mobile-search-overlay md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-16">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md mx-4">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Search Transactions</h3>
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={mobileSearchInputRef}
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowSuggestions(searchTerm.length >= 2)}
                    onBlur={(e) => {
                      if (!e.relatedTarget || !e.relatedTarget.closest('.suggestion-item')) {
                        setShowSuggestions(false);
                      }
                    }}
                    className="mobile-search-input w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  {/* Search Suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchTerm(suggestion);
                            setShowSuggestions(false);
                            // Store search term and navigate to search page
                            localStorage.setItem('searchQuery', suggestion.trim());
                            router.push('/search');
                            setIsMobileSearchOpen(false);
                          }}
                          className="suggestion-item w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-2">
                            <Search className="w-4 h-4 text-gray-400" />
                            <span>{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Search Button */}
                <button
                  type="submit"
                  disabled={!searchTerm.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium bg-primary"
                >
                  <Search className="h-3 w-3" />
                  <span>Search</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-4 pb-4 border-t border-gray-200">
          <div className="pt-4 space-y-3">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(searchTerm.length >= 2)}
                onBlur={(e) => {
                  if (!e.relatedTarget || !e.relatedTarget.closest('.suggestion-item')) {
                    setShowSuggestions(false);
                  }
                }}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchTerm(suggestion);
                          setShowSuggestions(false);
                          // Store search term and navigate to search page
                          localStorage.setItem('searchQuery', suggestion.trim());
                          router.push('/search');
                        }}
                      className="suggestion-item w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>
            
            {/* Mobile Load Mock Data */}
            {isClient && (
              <button
                onClick={handleLoadMockData}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
              >
                <Database className="h-4 w-4" />
                Load Mock Data
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
