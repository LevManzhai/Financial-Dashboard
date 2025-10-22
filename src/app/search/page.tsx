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
  const { state, deleteTransaction, updateTransaction } = useTransactions();
  const { themeSettings } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
    
    // Get search query from URL
    const updateSearchFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('q');
      if (query) {
        setSearchTerm(query);
      }
    };
    
    updateSearchFromURL();
    
    // Listen for URL changes (back/forward navigation)
    window.addEventListener('popstate', updateSearchFromURL);
    
    return () => {
      window.removeEventListener('popstate', updateSearchFromURL);
    };
  }, []);

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
    if (!query || query.length < 2) return [];
    
    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();
    
    state.transactions.forEach(transaction => {
      // Category suggestions
      if (transaction.category.toLowerCase().includes(lowerQuery)) {
        suggestions.add(transaction.category);
      }
      // Description suggestions
      if (transaction.description.toLowerCase().includes(lowerQuery)) {
        suggestions.add(transaction.description);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  };

  const suggestions = useMemo(() => {
    return getSuggestions(searchTerm);
  }, [searchTerm, state.transactions]);

  // Advanced search with filtering
  const filteredTransactions = useMemo(() => {
    let filtered = state.filteredTransactions;

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(term) ||
        transaction.category.toLowerCase().includes(term) ||
        transaction.amount.toString().includes(term) ||
        transaction.date.includes(term)
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

    // Date filter
    if (selectedFilters.dateFrom) {
      filtered = filtered.filter(transaction => transaction.date >= selectedFilters.dateFrom);
    }
    if (selectedFilters.dateTo) {
      filtered = filtered.filter(transaction => transaction.date <= selectedFilters.dateTo);
    }

    // Amount filter
    if (selectedFilters.amountMin) {
      filtered = filtered.filter(transaction => transaction.amount >= parseFloat(selectedFilters.amountMin));
    }
    if (selectedFilters.amountMax) {
      filtered = filtered.filter(transaction => transaction.amount <= parseFloat(selectedFilters.amountMax));
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (selectedFilters.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
      }
      
      return selectedFilters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [state.filteredTransactions, searchTerm, selectedFilters]);

  // Search statistics
  const searchStats = useMemo(() => {
    if (!isClient || !filteredTransactions) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        count: 0
      };
    }
    
    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;
    
    return {
      totalIncome,
      totalExpenses,
      balance,
      count: filteredTransactions.length
    };
  }, [filteredTransactions, isClient]);

  // Unique categories for filter
  const categories = useMemo(() => {
    return Array.from(new Set(state.filteredTransactions.map(t => t.category))).sort();
  }, [state.filteredTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
      setSelectedTransactions(prev => prev.filter(t => t !== id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedTransactions.length} transactions?`)) {
      selectedTransactions.forEach(id => deleteTransaction(id));
      setSelectedTransactions([]);
    }
  };

  const handleSelectAll = () => {
    if (isClient && selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(t => t.id));
    }
  };

  const handleSelectTransaction = (id: string) => {
    setSelectedTransactions(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  const exportSelected = () => {
    const selectedData = filteredTransactions.filter(t => selectedTransactions.includes(t.id));
    const csv = [
      ['Date', 'Category', 'Description', 'Type', 'Amount'].join(','),
      ...selectedData.map(t => [
        t.date,
        t.category,
        t.description,
        t.type,
        t.amount
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFilters({
      type: 'all',
      category: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
    setSelectedTransactions([]);
  };

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
          <div className="flex items-center justify-between h-12 xs:h-14 sm:h-16 min-w-0">
            <div className="flex items-center space-x-1 xs:space-x-2 min-w-0 flex-1">
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
              <div className="flex items-center space-x-1 xs:space-x-2">
                <button
                  onClick={() => router.back()}
                  className="flex items-center space-x-1 xs:space-x-2 px-1.5 xs:px-2 py-1 xs:py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowDownLeft className="w-3 h-3 xs:w-4 xs:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden xs:inline">Back</span>
                </button>
                <div className="h-4 w-px bg-gray-300 hidden xs:block"></div>
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center space-x-1 xs:space-x-2 px-1.5 xs:px-2 py-1 xs:py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <DollarSign className="w-3 h-3 xs:w-4 xs:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden xs:inline">Dashboard</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2 xs:space-x-3 min-w-0">
                <div className="p-2 xs:p-3 rounded-lg flex-shrink-0 bg-primary-light">
                  <Search className="w-5 h-5 xs:w-6 xs:h-6 text-primary" />
                </div>
                <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 truncate">Search & Filter</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 xs:space-x-2 flex-shrink-0">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center space-x-1 xs:space-x-2 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg transition-colors text-white text-xs xs:text-sm"
                style={{
                  backgroundColor: 'var(--primary-color)',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  if (isClient && themeSettings.primaryColor) {
                    const hex = themeSettings.primaryColor.replace('#', '');
                    const r = parseInt(hex.substr(0, 2), 16);
                    const g = parseInt(hex.substr(2, 2), 16);
                    const b = parseInt(hex.substr(4, 2), 16);
                    e.currentTarget.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (isClient && themeSettings.primaryColor) {
                    e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                  }
                }}
              >
                <Filter className="w-3 h-3 xs:w-4 xs:h-4" />
                <span className="hidden xs:inline">Advanced Filters</span>
                <span className="xs:hidden">Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-2 xs:px-3 sm:px-4 lg:px-6 py-4 xs:py-6 sm:py-8 min-w-0">
        {/* Search Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Found Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {searchStats.count}
                </p>
              </div>
              <div className="p-3 rounded-full w-11 h-11 flex items-center justify-center bg-primary-light">
                <Search className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(searchStats.totalIncome)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full w-11 h-11 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(searchStats.totalExpenses)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full w-11 h-11 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Balance</p>
                <p className={`text-2xl font-bold ${
                  searchStats.balance > 0 ? 'text-green-600' : searchStats.balance < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {isClient ? formatCurrency(searchStats.balance) : '$0'}
                </p>
              </div>
              <div className="p-3 rounded-full w-11 h-11 flex items-center justify-center bg-primary-light">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>

          {/* Main Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions by description, category, amount, or date..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsUserTyping(true);
                }}
                onFocus={() => {
                  if (searchTerm.length >= 2) {
                    setIsUserTyping(true);
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setIsUserTyping(false);
                  setShowSuggestions(false);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
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
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Type</label>
                <select
                  value={selectedFilters.type}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-1.5 xs:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm min-w-0"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
                <select
                  value={selectedFilters.category}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-1.5 xs:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm min-w-0"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">From Date</label>
                <input
                  type="date"
                  value={selectedFilters.dateFrom}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full p-1.5 xs:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm min-w-0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">To Date</label>
                <input
                  type="date"
                  value={selectedFilters.dateTo}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full p-1.5 xs:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm min-w-0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Min Amount</label>
                <input
                  type="number"
                  placeholder="0"
                  value={selectedFilters.amountMin}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, amountMin: e.target.value }))}
                  className="w-full p-1.5 xs:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm min-w-0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Max Amount</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={selectedFilters.amountMax}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, amountMax: e.target.value }))}
                  className="w-full p-1.5 xs:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm min-w-0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Sort By</label>
                <select
                  value={selectedFilters.sortBy}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full p-1.5 xs:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm min-w-0"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="category">Category</option>
                  <option value="description">Description</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Order</label>
                <select
                  value={selectedFilters.sortOrder}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
                  className="w-full p-1.5 xs:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm min-w-0"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Search Results ({isClient ? filteredTransactions.length : 0})
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {isClient && selectedTransactions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs xs:text-sm text-gray-600">
                      {selectedTransactions.length} selected
                    </span>
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors font-medium"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                    <button
                      onClick={exportSelected}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-colors font-medium"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </button>
                  </div>
                )}
                {isClient && filteredTransactions.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors font-medium"
                  >
                    <Check className="w-3 h-3" />
                    <span>
                      {isClient && selectedTransactions.length === filteredTransactions.length ? 'Deselect All' : 'Select All'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {!isClient ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>Loading...</p>
              </div>
            ) : isClient && filteredTransactions.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <Search className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium text-gray-900 mb-2">No transactions found</p>
                <p className="text-sm text-gray-500">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="group pl-3 xs:pl-4 sm:pl-6 pr-3 xs:pr-4 sm:pr-6 py-3 xs:py-4 flex items-center justify-between hover:bg-gray-50 min-w-0">
                  <div className="flex items-center space-x-2 xs:space-x-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(transaction.id)}
                      onChange={() => handleSelectTransaction(transaction.id)}
                      className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-opacity flex-shrink-0 ${
                        selectedTransactions.includes(transaction.id) 
                          ? 'opacity-100' 
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                    />
                    <div className={`p-1.5 xs:p-2 rounded-full flex-shrink-0 ${
                      transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="w-3 h-3 xs:w-4 xs:h-4" />
                      ) : (
                        <ArrowDownLeft className="w-3 h-3 xs:w-4 xs:h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 xs:space-x-2">
                        <p className="font-medium text-gray-900 text-sm xs:text-base truncate">{transaction.category}</p>
                      </div>
                      <p className="text-xs xs:text-sm text-gray-500 truncate">{transaction.description}</p>
                      <div className="flex items-center space-x-2 xs:space-x-4 mt-1">
                        <p className="text-xs text-gray-400 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(transaction.date)}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center">
                          <Tag className="w-3 h-3 mr-1" />
                          {transaction.category}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 xs:space-x-2 flex-shrink-0">
                    <div className="text-right">
                      <p className={`font-semibold text-sm xs:text-base ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      <button
                        onClick={() => {/* TODO: Add edit functionality */}}
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
        </div>
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

