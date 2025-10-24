'use client';

import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { TransactionProvider, useTransactions } from '@/contexts/TransactionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { ArrowUpRight, ArrowDownLeft, Plus, Wallet, CreditCard, TrendingUp, TrendingDown, DollarSign, Calendar, PieChart, LayoutDashboard, ArrowLeft, ChevronDown, Bell, X, Check, Trash2 } from 'lucide-react';

function WalletContent() {
  const router = useRouter();
  const { state, getSummaryStats } = useTransactions();
  const { isDark, themeSettings } = useTheme();
  const { notifications, unreadCount, markAsRead, removeNotification, clearAllNotifications } = useNotifications();
  
  // Debug logs to check data structure
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analytics'>('overview');
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('month');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTimeframeDropdownOpen, setIsTimeframeDropdownOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const handleTimeframeChange = (newTimeframe: 'day' | 'week' | 'month' | 'year' | 'all') => {
    setTimeframe(newTimeframe);
    setIsTimeframeDropdownOpen(false);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Force re-render when theme settings change
  useEffect(() => {
    if (isClient) {
      // This will trigger a re-render when themeSettings change
    }
  }, [themeSettings, isClient]);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isTimeframeDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.timeframe-dropdown')) {
          setIsTimeframeDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTimeframeDropdownOpen]);

  // Removed unused stats calculation that was causing React error #418

  const formatCurrency = (amount: number | string | null | undefined | Record<string, unknown>): string => {
    try {
      // Handle object amounts (e.g., { value: 100 })
      if (typeof amount === 'object' && amount !== null) {
        if ('value' in amount) {
          amount = Number(amount.value);
        } else if ('amount' in amount) {
          amount = Number(amount.amount);
        } else {
          return '$0';
        }
      }
      
      if (!amount || isNaN(Number(amount))) return '$0';
      const result = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(Number(amount));
      return String(result);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return '$0';
    }
  };

  const formatDate = (dateInput: string | Date | null | undefined): string => {
    try {
      if (!dateInput) return '';
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return '';
      const result = date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      return String(result);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };


  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    
    switch (timeframe) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate = new Date(now);
        startDate.setDate(now.getDate() + mondayOffset);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      case 'all':
        // Cache sorting for 'all'
        return [...state.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      default:
        return state.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    // Optimized filtering - sort first, then filter
    const sortedTransactions = [...state.transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate < endDate;
    });
  }, [timeframe, state.transactions]);

  // Memoize category grouping
  const categoryStats = useMemo(() => {
    return filteredTransactions.reduce((acc, transaction) => {
      const getCategoryName = (cat: unknown): string => {
        if (!cat) return 'Unknown';
        if (typeof cat === 'string') return cat;
        if (typeof cat === 'object' && cat !== null) {
          const catObj = cat as Record<string, unknown>;
          const possibleName = catObj.name || catObj.type || catObj.category;
          return typeof possibleName === 'string' ? possibleName : 'Unknown';
        }
        return String(cat);
      };
      
      const category = getCategoryName(transaction.category);
      
      if (!acc[category]) {
        acc[category] = { income: 0, expenses: 0, count: 0 };
      }
      if (transaction.type === 'income') {
        acc[category].income += Number(transaction.amount) || 0;
      } else {
        acc[category].expenses += Number(transaction.amount) || 0;
      }
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { income: number; expenses: number; count: number }>);
  }, [filteredTransactions]);

  // Memoize recent transactions
  const recentTransactions = useMemo(() => {
    // For "All Time" and "Year" show all transactions, for other periods - first 10
    return (timeframe === 'all' || timeframe === 'year') ? filteredTransactions : filteredTransactions.slice(0, 10);
  }, [filteredTransactions, timeframe]);

  // Memoize period statistics
  const periodStats = useMemo(() => {
    return filteredTransactions.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        acc.totalIncome += Number(transaction.amount) || 0;
      } else {
        acc.totalExpenses += Number(transaction.amount) || 0;
      }
      acc.transactionCount += 1;
      return acc;
    }, { totalIncome: 0, totalExpenses: 0, transactionCount: 0 });
  }, [filteredTransactions]);

  const periodBalance = periodStats.totalIncome - periodStats.totalExpenses;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-[47px] xs:h-[55px] sm:h-[63px]">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
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
                <div className="h-4 w-px bg-gray-300"></div>
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center space-x-1 px-1.5 xs:px-2 py-1 xs:py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LayoutDashboard className="w-3 h-3 xs:w-4 xs:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden xs:inline">Dashboard</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2 xs:space-x-3">
                <div className="p-2 xs:p-3 rounded-lg bg-primary-light">
                  <Wallet className="w-5 h-5 xs:w-6 xs:h-6 text-primary" />
                </div>
                <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">Wallet</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4">
              {/* Timeframe Selector */}
              <div className="relative timeframe-dropdown">
                {/* Mobile Dropdown */}
                <div className="sm:hidden">
                  <button
                    onClick={() => setIsTimeframeDropdownOpen(!isTimeframeDropdownOpen)}
                    className="flex items-center space-x-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span>{timeframe === 'day' ? 'Day' : timeframe === 'week' ? 'Week' : timeframe === 'month' ? 'Month' : timeframe === 'year' ? 'Year' : 'All'}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  
                  {isTimeframeDropdownOpen && (
                    <div className="absolute top-full right-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        {[
                          { value: 'day', label: 'Day' },
                          { value: 'week', label: 'Week' },
                          { value: 'month', label: 'Month' },
                          { value: 'year', label: 'Year' },
                          { value: 'all', label: 'All' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleTimeframeChange(option.value as 'day' | 'week' | 'month' | 'year' | 'all')}
                            className={`w-full text-left px-2 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors ${
                              timeframe === option.value ? 'text-white bg-primary' : 'text-gray-700'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop Horizontal Selector */}
                <div className="hidden sm:flex bg-gray-50 rounded-lg p-1 border border-gray-200 shadow-sm">
                  <button
                    onClick={() => handleTimeframeChange('day')}
                    className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      timeframe === 'day'
                        ? 'text-white bg-primary shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => handleTimeframeChange('week')}
                    className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      timeframe === 'week'
                        ? 'text-white bg-primary shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => handleTimeframeChange('month')}
                    className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      timeframe === 'month'
                        ? 'text-white bg-primary shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => handleTimeframeChange('year')}
                    className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      timeframe === 'year'
                        ? 'text-white bg-primary shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Year
                  </button>
                  <button
                    onClick={() => handleTimeframeChange('all')}
                    className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      timeframe === 'all'
                        ? 'text-white bg-primary shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>
              
              {/* Notifications - Hidden on mobile, shown on desktop */}
              <div className="relative notification-dropdown flex items-center hidden lg:flex">
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
                    isDark 
                      ? 'bg-black border-gray-800' 
                      : 'bg-white border-gray-200'
                  }`}>
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
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className={`p-4 text-center text-sm ${
                          isDark 
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
                              isDark 
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
                                    isDark 
                                      ? 'text-gray-400' 
                                      : 'text-gray-900'
                                  }`}>{notification.title}</h4>
                                </div>
                                <p className={`text-sm mt-1 ${
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
                  </div>
                )}
              </div>
              
              <div className="text-right hidden xs:block">
                <p className="text-xs xs:text-sm text-gray-500">Total Balance</p>
                <p className={`text-lg xs:text-xl sm:text-2xl font-bold ${
                  isClient && periodBalance > 0 ? 'text-green-600' : isClient && periodBalance < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {isClient ? formatCurrency(periodBalance) : '$0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-6 sm:py-8">
        {/* Tabs */}
        <div className="mb-4 xs:mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 xs:space-x-6 sm:space-x-8 overflow-x-auto">
              {[
                { id: 'overview', name: 'Overview', icon: PieChart },
                { id: 'transactions', name: 'Transactions', icon: Calendar },
                { id: 'analytics', name: 'Analytics', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'transactions' | 'analytics')}
                  className={`flex items-center space-x-1 xs:space-x-2 py-2 px-1 border-b-2 font-medium text-xs xs:text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-primary border-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-3 h-3 xs:w-4 xs:h-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6">
              <div className="bg-white rounded-xl p-4 xs:p-6 xl:p-8 shadow-sm border border-gray-200 min-w-[272px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs xs:text-sm font-medium text-gray-600">
                      {timeframe === 'day' ? 'Day Income' : 
                       timeframe === 'week' ? 'Week Income' : 
                       timeframe === 'month' ? 'Month Income' :
                       timeframe === 'year' ? 'Year Income' :
                       'All Time Income'}
                    </p>
                    <p className="text-lg xs:text-xl sm:text-2xl font-bold text-green-600">
                      {isClient ? formatCurrency(periodStats.totalIncome) : '$0'}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full w-11 h-11 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 xs:p-6 xl:p-8 shadow-sm border border-gray-200 min-w-[272px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs xs:text-sm font-medium text-gray-600">
                      {timeframe === 'day' ? 'Day Expenses' : 
                       timeframe === 'week' ? 'Week Expenses' : 
                       timeframe === 'month' ? 'Month Expenses' :
                       timeframe === 'year' ? 'Year Expenses' :
                       'All Time Expenses'}
                    </p>
                    <p className="text-lg xs:text-xl sm:text-2xl font-bold text-red-600">
                      {isClient ? formatCurrency(periodStats.totalExpenses) : '$0'}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full w-11 h-11 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 xs:p-6 xl:p-8 shadow-sm border border-gray-200 min-w-[272px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs xs:text-sm font-medium text-gray-600">
                      {timeframe === 'day' ? 'Day Transactions' : 
                       timeframe === 'week' ? 'Week Transactions' : 
                       timeframe === 'month' ? 'Month Transactions' :
                       timeframe === 'year' ? 'Year Transactions' :
                       'All Time Transactions'}
                    </p>
                    <p className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">
                      {isClient ? periodStats.transactionCount : 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-full w-11 h-11 flex items-center justify-center bg-primary-light">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-xl p-4 xs:p-6 shadow-sm border border-gray-200">
              <h3 className="text-base xs:text-lg font-semibold text-gray-900 mb-3 xs:mb-4">Spending by Category</h3>
              <div className="space-y-2">
                {Object.entries(categoryStats)
                    .filter(([_, data]) => data.expenses > 0)
                    .sort(([_, a], [__, b]) => b.expenses - a.expenses)
                    .map(([category, data]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="font-medium text-gray-900">{String(category)}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-600">{formatCurrency(data.expenses)}</p>
                          <p className="text-xs text-gray-500">{data.count} transactions</p>
                        </div>
                      </div>
                    ))
                }
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Transactions - {timeframe === 'day' ? 'Day' : 
                                      timeframe === 'week' ? 'Week' : 
                                      timeframe === 'month' ? 'Month' :
                                      timeframe === 'year' ? 'Year' :
                                      'All Time'}
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => {
                  // Debug log to identify problematic transactions
                  console.log('Rendering transaction:', transaction);
                  
                  if (!transaction || typeof transaction !== 'object') {
                    console.error('Invalid transaction:', transaction);
                    return null;
                  }
                  
                  return (
                  <div key={transaction.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {(() => {
                            const cat = transaction.category;
                            if (!cat) return 'Unknown';
                            if (typeof cat === 'string') return cat;
                            if (typeof cat === 'object' && cat !== null) {
                              const catObj = cat as Record<string, unknown>;
                              const possibleName = catObj.name || catObj.type || catObj.category;
                              return typeof possibleName === 'string' ? possibleName : 'Unknown';
                            }
                            return String(cat);
                          })()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(() => {
                            const desc = transaction.description;
                            if (!desc) return '';
                            if (typeof desc === 'string') return desc;
                            if (typeof desc === 'object' && desc !== null) {
                              const descObj = desc as Record<string, unknown>;
                              const possibleText = descObj.text || descObj.description || descObj.name;
                              return typeof possibleText === 'string' ? possibleText : '';
                            }
                            return String(desc);
                          })()}
                        </p>
                        <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                  );
                })
              ) : (
                <div className="px-6 py-12 text-center">
                  <Wallet className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <p className="text-gray-500">No transactions found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <Suspense fallback={
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          }>
            <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income vs Expenses Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm text-gray-600">Income</span>
                    </div>
                    <span className="font-semibold text-green-600">{isClient ? formatCurrency(periodStats.totalIncome) : '$0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm text-gray-600">Expenses</span>
                    </div>
                    <span className="font-semibold text-red-600">{isClient ? formatCurrency(periodStats.totalExpenses) : '$0'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                      style={{ 
                        width: `${periodStats.totalIncome > 0 ? (periodStats.totalExpenses / periodStats.totalIncome) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Category Distribution */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Categories - {timeframe === 'day' ? 'Day' :
                                   timeframe === 'week' ? 'Week' :
                                   timeframe === 'month' ? 'Month' :
                                   timeframe === 'year' ? 'Year' :
                                   'All Time'}
                </h3>
                <div className="space-y-3">
                  {Object.entries(categoryStats)
                      .filter(([_, data]) => data.expenses > 0)
                      .sort(([_, a], [__, b]) => b.expenses - a.expenses)
                      .slice(0, 5)
                      .map(([category, data], index) => (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600">
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{String(category)}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(data.expenses)}</span>
                        </div>
                      ))
                  }
                </div>
              </div>
            </div>
          </div>
          </Suspense>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <TransactionProvider>
      <WalletContent />
    </TransactionProvider>
  );
}
