'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TransactionProvider, useTransactions } from '@/contexts/TransactionContext';
import { useTheme } from '@/contexts/ThemeContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Search, Filter, Calendar, DollarSign, Tag, ArrowUpRight, ArrowDownLeft, Edit, Trash2, Download, Upload, X, Check, Clock, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Transaction } from '@/types/financial';

function SearchContent() {
  const router = useRouter();
  const { state, deleteTransaction, updateTransaction, isLoading } = useTransactions();
  const { themeSettings } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    category: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Get search query from localStorage
    const query = localStorage.getItem('searchQuery');
    if (query) {
      setSearchTerm(query);
      // Clear the stored query after reading it
      localStorage.removeItem('searchQuery');
    }
  }, []);

  useEffect(() => {
    const checkDark = () => {
      if (themeSettings.mode === 'dark') return true;
      if (themeSettings.mode === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    
    setIsDark(checkDark());
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themeSettings.mode === 'system') {
        setIsDark(mediaQuery.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeSettings.mode]);

  // Update showSuggestions based on searchTerm - but only if user is actively typing
  useEffect(() => {
    if (isUserTyping && searchTerm.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm, isUserTyping]);


  // Get search suggestions
  const getSuggestions = (query: string) => {
    if (!query || query.length < 2 || !isClient || !state?.transactions) return [];
    
    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();
    
    state.transactions.forEach(transaction => {
      // Category suggestions
      if (transaction.category.toLowerCase().includes(lowerQuery)) {
        suggestions.add(transaction.category);
      }
      // Description suggestions
      if (transaction.description.toLowerCase().includes(lowerQuery)) {
        const words = transaction.description.split(' ');
        words.forEach(word => {
          if (word.toLowerCase().includes(lowerQuery) && word.length > 2) {
            suggestions.add(word);
          }
        });
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  };

  const suggestions = useMemo(() => getSuggestions(searchTerm), [searchTerm, state?.transactions, isClient]);

  // Filter transactions based on search term and filters
  const filteredTransactions = useMemo(() => {
    if (!isClient || !state?.transactions) return [];
    
    let filtered = state.transactions;
    
    // Text search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.category.toLowerCase().includes(searchLower) ||
        transaction.amount.toString().includes(searchTerm)
      );
    }
    
    // Type filter
    if (selectedFilters.type !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === selectedFilters.type);
    }
    
    // Category filter
    if (selectedFilters.category) {
      filtered = filtered.filter(transaction => transaction.category === selectedFilters.category);
    }
    
    // Date filters
    if (selectedFilters.dateFrom) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) >= new Date(selectedFilters.dateFrom)
      );
    }
    
    if (selectedFilters.dateTo) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) <= new Date(selectedFilters.dateTo)
      );
    }
    
    // Amount filters
    if (selectedFilters.amountMin) {
      filtered = filtered.filter(transaction => 
        transaction.amount >= parseFloat(selectedFilters.amountMin)
      );
    }
    
    if (selectedFilters.amountMax) {
      filtered = filtered.filter(transaction => 
        transaction.amount <= parseFloat(selectedFilters.amountMax)
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (selectedFilters.sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }
      
      if (selectedFilters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [searchTerm, selectedFilters, state?.transactions, isClient]);

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    if (!isClient || !state?.transactions) return [];
    return Array.from(new Set(state.transactions.map(t => t.category))).sort();
  }, [state?.transactions, isClient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsUserTyping(true);
  };

  const handleInputBlur = () => {
    setIsUserTyping(false);
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setIsUserTyping(false);
    setShowSuggestions(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectTransaction = (id: string) => {
    setSelectedTransactions(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(t => t.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTransactions.length === 0) return;
    
    try {
      for (const id of selectedTransactions) {
        await deleteTransaction(id);
      }
      setSelectedTransactions([]);
    } catch (error) {
      console.error('Error deleting transactions:', error);
    }
  };

  const handleExportSelected = () => {
    if (selectedTransactions.length === 0) return;
    
    const selectedData = filteredTransactions.filter(t => selectedTransactions.includes(t.id));
    const csvContent = [
      ['Date', 'Description', 'Category', 'Type', 'Amount'],
      ...selectedData.map(t => [
        t.date,
        t.description,
        t.category,
        t.type,
        t.amount.toString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? ArrowUpRight : ArrowDownLeft;
  };

  const getTransactionColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  if (!isClient) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={handleCloseMobileMenu} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header isMobileMenuOpen={isMobileMenuOpen} onToggleMobileMenu={handleToggleMobileMenu} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={handleCloseMobileMenu} />

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleCloseMobileMenu}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header isMobileMenuOpen={isMobileMenuOpen} onToggleMobileMenu={handleToggleMobileMenu} />

        {/* Search Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Search Header */}
            <div className="mb-6">
              <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Search Transactions</h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Find and filter your financial transactions</p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions, categories, amounts..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={() => setIsUserTyping(true)}
                  onBlur={handleInputBlur}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                    isDark 
                      ? 'bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' 
                      : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                
                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto ${
                    isDark 
                      ? 'bg-gray-800 border border-gray-600' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full text-left px-4 py-2 text-sm border-b last:border-b-0 ${
                          isDark 
                            ? 'hover:bg-gray-700 text-gray-200 border-gray-600' 
                            : 'hover:bg-gray-50 text-gray-700 border-gray-100'
                        }`}
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
            </div>

            {/* Advanced Filters */}
            <div className="mb-6">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center space-x-2 transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Advanced Filters</span>
              </button>
              
              {showAdvancedFilters && (
                <div className={`mt-4 p-4 rounded-lg ${
                  isDark 
                    ? 'bg-gray-800 border border-gray-600' 
                    : 'bg-gray-50'
                }`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Type Filter */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>Type</label>
                      <select
                        value={selectedFilters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark 
                            ? 'bg-gray-700 border border-gray-600 text-white' 
                            : 'bg-white border border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="all">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>Category</label>
                      <select
                        value={selectedFilters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark 
                            ? 'bg-gray-700 border border-gray-600 text-white' 
                            : 'bg-white border border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date From */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>From Date</label>
                      <input
                        type="date"
                        value={selectedFilters.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark 
                            ? 'bg-gray-700 border border-gray-600 text-white' 
                            : 'bg-white border border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Date To */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>To Date</label>
                      <input
                        type="date"
                        value={selectedFilters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark 
                            ? 'bg-gray-700 border border-gray-600 text-white' 
                            : 'bg-white border border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Amount Min */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>Min Amount</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={selectedFilters.amountMin}
                        onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark 
                            ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>

                    {/* Amount Max */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>Max Amount</label>
                      <input
                        type="number"
                        placeholder="1000"
                        value={selectedFilters.amountMax}
                        onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark 
                            ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>Sort By</label>
                      <select
                        value={selectedFilters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark 
                            ? 'bg-gray-700 border border-gray-600 text-white' 
                            : 'bg-white border border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="date">Date</option>
                        <option value="amount">Amount</option>
                        <option value="description">Description</option>
                        <option value="category">Category</option>
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>Order</label>
                      <select
                        value={selectedFilters.sortOrder}
                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark 
                            ? 'bg-gray-700 border border-gray-600 text-white' 
                            : 'bg-white border border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
                </h2>
                
                {filteredTransactions.length > 0 && (
                  <label className="flex items-center space-x-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.length === filteredTransactions.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Select All</span>
                  </label>
                )}
              </div>

              {selectedTransactions.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedTransactions.length} selected
                  </span>
                  <button
                    onClick={handleExportSelected}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms or filters' : 'Start by adding some transactions or adjusting your filters'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((transaction) => {
                  const Icon = getTransactionIcon(transaction.type);
                  const colorClass = getTransactionColor(transaction.type);
                  
                  return (
                    <div
                      key={transaction.id}
                      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${
                        selectedTransactions.includes(transaction.id) ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.includes(transaction.id)}
                            onChange={() => handleSelectTransaction(transaction.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          
                          <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                            <Icon className={`h-4 w-4 ${colorClass}`} />
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Tag className="h-3 w-3" />
                                <span>{transaction.category}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(transaction.date)}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`font-semibold ${colorClass}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <TransactionProvider>
      <SearchContent />
    </TransactionProvider>
  );
}