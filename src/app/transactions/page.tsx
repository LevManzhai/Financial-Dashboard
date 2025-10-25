'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TransactionProvider, useTransactions } from '@/contexts/TransactionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { ArrowUpRight, ArrowDownLeft, Plus, Edit, Trash2, Search, Filter, Download, Upload, Calendar, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Bell, X, Check, ArrowLeft, LayoutDashboard, Menu } from 'lucide-react';
import { Transaction, TransactionFormData } from '@/types/financial';
import TransactionForm from '@/components/TransactionForm';
import TransactionFilters from '@/components/TransactionFilters';
import { Suspense } from 'react';

function TransactionsContent() {
  const router = useRouter();
  const { state, addTransaction, updateTransaction, deleteTransaction, setFilters, clearFilters, loadTransactions, isLoading } = useTransactions();
  const { themeSettings } = useTheme();
  const { notifications, unreadCount, markAsRead, removeNotification, clearAllNotifications } = useNotifications();
  
  // Debug theme
  useEffect(() => {
    console.log('Current theme:', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    console.log('themeSettings:', themeSettings);
    console.log('isDark:', themeSettings?.mode === 'dark');
  }, [themeSettings]);
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    setIsMounted(true);
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


  // Search filtering - use state.filteredTransactions which already includes filters
  const filteredBySearch = (state?.filteredTransactions || []).filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleFormSubmit = (formData: TransactionFormData) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, formData);
    } else {
      addTransaction(formData);
    }
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  // Statistics - memoized for performance
  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const income = filteredBySearch.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredBySearch.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses
    };
  }, [filteredBySearch]);

  // Group by categories - memoized for performance
  const categoryStats = useMemo(() => {
    return filteredBySearch.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = { income: 0, expenses: 0, count: 0 };
      }
      if (transaction.type === 'income') {
        acc[category].income += transaction.amount;
      } else {
        acc[category].expenses += transaction.amount;
      }
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { income: number; expenses: number; count: number }>);
  }, [filteredBySearch]);

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
        <div className="w-full px-2 xs:px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-[47px] xs:h-[55px] sm:h-[63px]">
            <div className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden w-9 h-9 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-1 flex items-center justify-center"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              {/* Navigation Menu */}
              <div className="flex items-center mr-1">
                <button
                  onClick={() => router.back()}
                  className="flex items-center space-x-1 xs:space-x-2 px-1.5 xs:px-2 py-1 xs:py-1.5 lg:px-3 lg:py-2 text-xs xs:text-sm lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3 xs:w-4 xs:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden xs:inline">Back</span>
                </button>
                <div className="h-4 xs:h-6 w-px bg-gray-300 mx-1"></div>
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center space-x-1 xs:space-x-2 px-1.5 xs:px-2 py-1 xs:py-1.5 lg:px-3 lg:py-2 text-xs xs:text-sm lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LayoutDashboard className="w-3 h-3 xs:w-4 xs:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden xs:inline">Dashboard</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2 xs:space-x-3">
                <div className="p-2 xs:p-3 rounded-lg bg-primary-light">
                  <BarChart3 className="w-5 h-5 xs:w-6 xs:h-6 text-primary" />
                </div>
                <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">Transactions</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 xs:space-x-4">
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-1 xs:gap-2 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-white rounded-lg transition-colors text-xs xs:text-sm font-medium bg-primary"
              >
                <Plus className="w-3 h-3 xs:w-4 xs:h-4" />
                <span>Add</span>
              </button>
              
      {/* Notifications - Hidden on mobile, shown on desktop */}
      <div className="relative notification-dropdown hidden min-[900px]:flex items-center">
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
        </div>
      </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 xs:p-4 sm:p-6 min-w-0">
        {/* Stats Cards */}
        {isLoading ? (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 xl:gap-8 mb-4 xs:mb-6 sm:mb-8 min-w-0">
      <SkeletonBox />
      <SkeletonBox />
      <SkeletonBox />
      <SkeletonBox />
    </div>
  ) : (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 xl:gap-8 mb-4 xs:mb-6 sm:mb-8 min-w-0">
      <div className="bg-white rounded-xl p-4 xs:p-6 xl:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-lg xs:text-xl sm:text-2xl font-bold text-green-600">
                  {isClient ? formatCurrency(totalIncome) : '$0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  All time
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full w-11 h-11 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 xs:p-6 xl:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-lg xs:text-xl sm:text-2xl font-bold text-red-600">
                  {isClient ? formatCurrency(totalExpenses) : '$0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  All time
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full w-11 h-11 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>

          <Suspense fallback={<SkeletonBox />}>
            <div className="bg-white rounded-xl p-4 xs:p-6 xl:p-8 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs xs:text-sm font-medium text-gray-600">Balance</p>
                  <p className={`text-lg xs:text-xl sm:text-2xl font-bold ${
                    isMounted && balance > 0 ? 'text-green-600' : isMounted && balance < 0 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {isMounted ? formatCurrency(balance) : '$0'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isMounted && balance > 0 ? 'Positive' : isMounted && balance < 0 ? 'Negative' : 'Neutral'}
                  </p>
                </div>
                <div className="p-3 rounded-full w-11 h-11 flex items-center justify-center bg-primary-light">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
          </Suspense>

          <div className="bg-white rounded-xl p-4 xs:p-6 xl:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">
                  {isClient ? filteredBySearch.length : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  All time
                </p>
              </div>
              <div className="p-3 rounded-full w-11 h-11 flex items-center justify-center bg-primary-light">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
  )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Search & Filters</h3>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 xs:w-6 xs:h-6 text-primary" />
                  <span className="text-sm text-gray-600">Filters</span>
                </div>
              </div>
              
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              {/* Filters */}
              <TransactionFilters
                filters={state?.filters || {}}
                onFiltersChange={(filters) => setFilters(filters)}
                onClearFilters={clearFilters}
              />
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-w-0">
              <div className="px-3 xs:px-4 sm:px-6 py-3 xs:py-4 border-b border-gray-200">
                <h3 className="text-base xs:text-lg font-semibold text-gray-900">
                  Transactions ({filteredBySearch.length})
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {!isClient ? (
                  <div className="px-3 xs:px-4 sm:px-6 py-6 xs:py-8 text-center text-gray-500">
                    <p>Loading...</p>
                  </div>
                ) : filteredBySearch.length === 0 ? (
                  <div className="px-3 xs:px-4 sm:px-6 py-6 xs:py-8 text-center text-gray-500">
                    <p>No transactions found.</p>
                    <p className="text-xs xs:text-sm">Try adjusting your filters or add a new transaction.</p>
                  </div>
                ) : (
                  filteredBySearch.map((transaction) => (
                    <div key={transaction.id} className="px-3 xs:px-4 sm:px-6 py-3 xs:py-4 flex items-center justify-between hover:bg-gray-50 min-w-0">
                      <div className="flex items-center space-x-2 xs:space-x-3 min-w-0 flex-1">
                        <div className={`p-1.5 xs:p-2 rounded-full flex-shrink-0 ${
                          transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className="w-3 h-3 xs:w-4 xs:h-4" />
                          ) : (
                            <ArrowDownLeft className="w-3 h-3 xs:w-4 xs:h-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm xs:text-base truncate">{transaction.category}</p>
                          <p className="text-xs xs:text-sm text-gray-500 truncate">{transaction.description}</p>
                          <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 xs:space-x-2 flex-shrink-0">
                        <div className="text-right">
                          <p className={`font-semibold text-xs xs:text-sm ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-0.5">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="p-1 xs:p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3 xs:w-4 xs:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-1 xs:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 xs:w-4 xs:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Category Breakdown */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-3">
                {Object.entries(categoryStats)
                  .sort(([_, a], [__, b]) => (b.income + b.expenses) - (a.income + a.expenses))
                  .slice(0, 8)
                  .map(([category, data]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">{category}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(data.income + data.expenses)}
                        </p>
                        <p className="text-xs text-gray-500">{data.count} transactions</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white rounded-lg transition-colors bg-primary"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Transaction</span>
                </button>
                
                <button
                  onClick={() => {
                    const data = filteredBySearch.map(t => ({
                      Date: t.date,
                      Category: t.category,
                      Description: t.description,
                      Type: t.type,
                      Amount: t.amount
                    }));
                    const csv = [
                      Object.keys(data[0] || {}).join(','),
                      ...data.map(row => Object.values(row).join(','))
                    ].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'transactions.csv';
                    a.click();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white rounded-lg transition-colors bg-emerald-500 hover:opacity-80"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
                
                <button
                  onClick={() => {
                    if (confirm('Clear all filters?')) {
                      clearFilters();
                      setSearchTerm('');
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white rounded-lg transition-colors bg-gray-500 hover:bg-gray-600"
                >
                  <Filter className="w-4 h-4" />
                  <span>Clear Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        editingTransaction={editingTransaction}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      />
        </main>
      </div>
    </div>
  );
}

function SkeletonBox() {
  return (
    <div className="bg-white rounded-xl p-4 xs:p-6 xl:p-8 shadow-sm border border-gray-200 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="p-3 bg-gray-200 rounded-full w-11 h-11"></div>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <TransactionProvider>
      <TransactionsContent />
    </TransactionProvider>
  );
}

