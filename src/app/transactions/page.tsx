'use client';

import { useState, useEffect, useMemo } from 'react';
import { TransactionProvider, useTransactions } from '@/contexts/TransactionContext';
import { useTheme } from '@/contexts/ThemeContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { ArrowUpRight, ArrowDownLeft, Plus, Edit, Trash2, Search, Filter, Download, Upload, Calendar, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { Transaction } from '@/types/financial';
import TransactionForm from '@/components/TransactionForm';
import TransactionFilters from '@/components/TransactionFilters';

function TransactionsContent() {
  const { state, addTransaction, updateTransaction, deleteTransaction, setFilters, clearFilters, loadTransactions } = useTransactions();
  const { themeSettings } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Force re-render when theme settings change
  useEffect(() => {
    if (isClient) {
      // This will trigger a re-render when themeSettings change
    }
  }, [themeSettings, isClient]);


  // Search filtering - use state.filteredTransactions which already includes filters
  const filteredBySearch = state.filteredTransactions.filter(transaction =>
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

  const handleFormSubmit = (formData: Partial<Transaction>) => {
    if (editingTransaction) {
      updateTransaction({
        ...editingTransaction,
        ...formData,
        updatedAt: new Date().toISOString()
      });
    } else {
      addTransaction({
        ...formData,
        id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
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
        <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-12 xs:h-14 sm:h-16">
            <div className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4">
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
                  onClick={() => window.location.href = '/'}
                  className="flex items-center space-x-1 xs:space-x-2 px-1.5 xs:px-2 py-1 xs:py-1.5 lg:px-3 lg:py-2 text-xs xs:text-sm lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowDownLeft className="w-3 h-3 xs:w-4 xs:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden xs:inline">Back</span>
                </button>
                <div className="h-4 xs:h-6 w-px bg-gray-300"></div>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex items-center space-x-1 xs:space-x-2 px-1.5 xs:px-2 py-1 xs:py-1.5 lg:px-3 lg:py-2 text-xs xs:text-sm lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <DollarSign className="w-3 h-3 xs:w-4 xs:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden xs:inline">Dashboard</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2 xs:space-x-3">
                <div className="p-2 xs:p-3 rounded-lg" style={{ backgroundColor: 'var(--primary-color-10)' }}>
                  <BarChart3 className="w-5 h-5 xs:w-6 xs:h-6" style={{ color: 'var(--primary-color)' }} />
                </div>
                <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">Transactions</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 xs:space-x-4">
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-1 xs:gap-2 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-white rounded-lg transition-colors text-xs xs:text-sm font-medium"
          style={{
            backgroundColor: 'var(--primary-color)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-color)';
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-color)';
            e.currentTarget.style.opacity = '1';
          }}
              >
                <Plus className="w-3 h-3 xs:w-4 xs:h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 lg:px-6 py-4 xs:py-6 sm:py-8 min-w-0 overflow-x-hidden">
        {/* Stats Cards */}
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
              <div className="p-2 bg-green-100 rounded-full w-10 h-10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
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
              <div className="p-2 bg-red-100 rounded-full w-10 h-10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 xs:p-6 xl:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-gray-600">Balance</p>
                <p className={`text-lg xs:text-xl sm:text-2xl font-bold ${
                  isClient && balance > 0 ? 'text-green-600' : isClient && balance < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {isClient ? formatCurrency(balance) : '$0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {isClient && balance > 0 ? 'Positive' : isClient && balance < 0 ? 'Negative' : 'Neutral'}
                </p>
              </div>
              <div className="p-2 rounded-full w-10 h-10 flex items-center justify-center" style={{ backgroundColor: 'var(--primary-color-10)' }}>
                <DollarSign className="w-4 h-4" style={{ color: 'var(--primary-color)' }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 xs:p-6 xl:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">
                  {!isClient ? '0' : filteredBySearch.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  All time
                </p>
              </div>
              <div className="p-2 rounded-full w-10 h-10 flex items-center justify-center" style={{ backgroundColor: 'var(--primary-color-10)' }}>
                <BarChart3 className="w-4 h-4" style={{ color: 'var(--primary-color)' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Search & Filters</h3>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 xs:w-6 xs:h-6" style={{ color: 'var(--primary-color)' }} />
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
                filters={state.filters}
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
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white rounded-lg transition-colors"
          style={{
            backgroundColor: 'var(--primary-color)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-color)';
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-color)';
            e.currentTarget.style.opacity = '1';
          }}
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
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: '#10B981'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#10B981';
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#10B981';
                    e.currentTarget.style.opacity = '1';
                  }}
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
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: '#6B7280',
                    color: '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4B5563';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#6B7280';
                  }}
                >
                  <Filter className="w-4 h-4" />
                  <span>Clear Filters</span>
                </button>
              </div>
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

