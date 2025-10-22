'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Transaction } from '@/types/financial';
import { useTransactions } from '@/contexts/TransactionContext';
import { useTheme } from '@/contexts/ThemeContext';
import TransactionForm from './TransactionForm';
import TransactionFilters from './TransactionFilters';

export default function TransactionsWidget() {
  const { state, addTransaction, updateTransaction, deleteTransaction, setFilters, clearFilters } = useTransactions();
  const { themeSettings } = useTheme();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Force re-render when theme settings change
  useEffect(() => {
    if (isClient) {
      // This will trigger a re-render when themeSettings change
    }
  }, [themeSettings, isClient]);

  // Mock data is now handled by Header component

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short'
    });
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

  const handleFormSubmit = (transactionData: any) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleFiltersChange = (filters: any) => {
    setFilters(filters);
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  if (!isClient) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 xs:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between mb-3 xs:mb-4 space-y-2 xs:space-y-0">
          <h3 className="text-base xs:text-lg font-semibold text-gray-900">Transactions</h3>
          <div className="flex items-center gap-1 xs:gap-2">
            {isClient && state.transactions.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete all transactions?')) {
                    // Clear all transactions
                    state.transactions.forEach(transaction => {
                      deleteTransaction(transaction.id);
                    });
                  }
                }}
                className="px-2 xs:px-3 py-1.5 xs:py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-xs xs:text-sm font-medium"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-1 xs:gap-2 px-2 xs:px-3 py-1.5 xs:py-2 text-white rounded-lg transition-colors text-xs xs:text-sm font-medium"
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
              <span className="hidden xs:inline">Add</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <TransactionFilters 
          filters={state.filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Transactions List */}
        <div className="mt-4">
          {state.filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions to display</p>
              <p className="text-sm mt-1">Add your first transaction or change filters</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2 pr-1 xs:pr-2">
              {state.filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 xs:p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-2 xs:space-x-3 min-w-0 flex-1">
                    <div className={`w-2 h-2 xs:w-3 xs:h-3 rounded-full flex-shrink-0 ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 text-sm xs:text-base truncate">{transaction.description}</div>
                      <div className="text-xs xs:text-sm text-gray-500 truncate">{transaction.category} • {formatDate(transaction.date)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 xs:space-x-2 flex-shrink-0">
                    <div className={`font-medium text-xs xs:text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <div className="flex items-center gap-0.5 xs:gap-1">
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
              ))}
            </div>
          )}
        </div>

        {/* Transaction Form Modal */}
        {isFormOpen && (
          <TransactionForm
            isOpen={isFormOpen}
            editingTransaction={editingTransaction}
            onSubmit={handleFormSubmit}
            onClose={handleCloseForm}
          />
        )}
    </div>
  );
}