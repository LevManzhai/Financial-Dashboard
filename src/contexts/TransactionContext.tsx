'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Transaction, TransactionFormData, FilterOptions, SummaryStats } from '@/types/financial';

// Global notification function
let globalNotificationFunction: ((notification: any) => void) | null = null;

export const setGlobalNotificationFunction = (fn: (notification: any) => void) => {
  globalNotificationFunction = fn;
};

interface TransactionState {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  filters: FilterOptions;
  summaryStats: SummaryStats;
}

type TransactionAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_FILTERS'; payload: FilterOptions }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'LOAD_TRANSACTIONS'; payload: Transaction[] };

// Apply filters to transactions
function applyFilters(transactions: Transaction[], filters: FilterOptions): Transaction[] {
  let filtered = transactions;

  // Filter by type
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(transaction => transaction.type === filters.type);
  }

  // Filter by category
  if (filters.category) {
    filtered = filtered.filter(transaction => transaction.category === filters.category);
  }

  // Filter by date range
  if (filters.dateFrom) {
    filtered = filtered.filter(transaction => transaction.date >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    filtered = filtered.filter(transaction => transaction.date <= filters.dateTo!);
  }

  // Sort transactions
  filtered.sort((a, b) => {
    let comparison = 0;
    
    switch (filters.sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
    }
    
    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
}

// Load initial state from localStorage - optimized for performance
const loadStateFromStorage = (): TransactionState => {
  if (typeof window === 'undefined') {
    return {
      transactions: [],
      filteredTransactions: [],
      filters: {
        category: '',
        type: 'all',
        dateFrom: '',
        dateTo: '',
        sortBy: 'date',
        sortOrder: 'desc'
      },
      summaryStats: {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        transactionCount: 0
      }
    };
  }

  try {
    const savedState = localStorage.getItem('financial-dashboard-transactions');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      // Use requestIdleCallback for heavy filtering operations
      const filteredTransactions = applyFilters(parsed.transactions, parsed.filters);
      return {
        ...parsed,
        filteredTransactions
      };
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }

  return {
    transactions: [],
    filteredTransactions: [],
    filters: {
      category: '',
      type: 'all',
      dateFrom: '',
      dateTo: '',
      sortBy: 'date',
      sortOrder: 'desc'
    },
    summaryStats: {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      transactionCount: 0
    }
  };
};

const initialState: TransactionState = loadStateFromStorage();

// Save state to localStorage
const saveStateToStorage = (state: TransactionState) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('financial-dashboard-transactions', JSON.stringify({
        transactions: state.transactions,
        filters: state.filters
      }));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  }
};

function transactionReducer(state: TransactionState, action: TransactionAction): TransactionState {
  switch (action.type) {
    case 'ADD_TRANSACTION': {
      const newTransactions = [...state.transactions, action.payload];
      const newState = {
        ...state,
        transactions: newTransactions,
        filteredTransactions: applyFilters(newTransactions, state.filters)
      };
      saveStateToStorage(newState);
      return newState;
    }
    case 'UPDATE_TRANSACTION': {
      const updatedTransactions = state.transactions.map(t =>
        t.id === action.payload.id ? action.payload : t
      );
      const newState = {
        ...state,
        transactions: updatedTransactions,
        filteredTransactions: applyFilters(updatedTransactions, state.filters)
      };
      saveStateToStorage(newState);
      return newState;
    }
    case 'DELETE_TRANSACTION': {
      const filteredTransactions = state.transactions.filter(t => t.id !== action.payload);
      const newState = {
        ...state,
        transactions: filteredTransactions,
        filteredTransactions: applyFilters(filteredTransactions, state.filters)
      };
      saveStateToStorage(newState);
      return newState;
    }
    case 'SET_FILTERS': {
      const newFilters = { ...state.filters, ...action.payload };
      const newState = {
        ...state,
        filters: newFilters,
        filteredTransactions: applyFilters(state.transactions, newFilters)
      };
      saveStateToStorage(newState);
      return newState;
    }
    case 'CLEAR_FILTERS': {
      const clearedFilters = {
        category: '',
        type: 'all',
        dateFrom: '',
        dateTo: '',
        sortBy: 'date',
        sortOrder: 'desc'
      };
      const newState = {
        ...state,
        filters: clearedFilters,
        filteredTransactions: state.transactions
      };
      saveStateToStorage(newState);
      return newState;
    }
    case 'LOAD_TRANSACTIONS': {
      const newTransactions = action.payload;
      const newState = {
        ...state,
        transactions: newTransactions,
        filteredTransactions: applyFilters(newTransactions, state.filters)
      };
      saveStateToStorage(newState);
      return newState;
    }
    default:
      return state;
  }
}


function calculateSummaryStats(transactions: Transaction[]): SummaryStats {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate balance including initial balance
  const initialBalance = 7000; // Starting balance
  const balance = initialBalance + totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    balance,
    transactionCount: transactions.length
  };
}

interface TransactionContextType {
  state: TransactionState;
  addTransaction: (transaction: TransactionFormData) => void;
  updateTransaction: (id: string, transaction: TransactionFormData) => void;
  deleteTransaction: (id: string) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  clearFilters: () => void;
  loadTransactions: (transactions: Transaction[]) => void;
  getSummaryStats: () => SummaryStats;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  const addTransaction = (transactionData: TransactionFormData) => {
    // Validate transaction data
    if (!transactionData.amount || transactionData.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    if (!transactionData.category || transactionData.category.trim() === '') {
      throw new Error('Category is required');
    }
    if (!transactionData.description || transactionData.description.trim() === '') {
      throw new Error('Description is required');
    }
    if (!transactionData.date) {
      throw new Error('Date is required');
    }
    if (!['income', 'expense'].includes(transactionData.type)) {
      throw new Error('Type must be either income or expense');
    }

    const newTransaction: Transaction = {
      ...transactionData,
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
    
    // Add notification
    if (globalNotificationFunction) {
      globalNotificationFunction({
        type: 'success',
        title: 'Transaction Added',
        message: `${transactionData.type === 'income' ? 'Income' : 'Expense'} of $${transactionData.amount} for ${transactionData.category} has been added.`
      });
    }
  };

  const updateTransaction = (id: string, transactionData: TransactionFormData) => {
    const existingTransaction = state.transactions.find(t => t.id === id);
    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }

    // Validate transaction data
    if (!transactionData.amount || transactionData.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    if (!transactionData.category || transactionData.category.trim() === '') {
      throw new Error('Category is required');
    }
    if (!transactionData.description || transactionData.description.trim() === '') {
      throw new Error('Description is required');
    }
    if (!transactionData.date) {
      throw new Error('Date is required');
    }
    if (!['income', 'expense'].includes(transactionData.type)) {
      throw new Error('Type must be either income or expense');
    }

    const updatedTransaction: Transaction = {
      ...transactionData,
      id,
      createdAt: existingTransaction.createdAt,
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
  };

  const deleteTransaction = (id: string) => {
    const transaction = state.transactions.find(t => t.id === id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    
    // Add notification
    if (transaction && globalNotificationFunction) {
      globalNotificationFunction({
        type: 'info',
        title: 'Transaction Deleted',
        message: `${transaction.type === 'income' ? 'Income' : 'Expense'} of $${transaction.amount} for ${transaction.category} has been deleted.`
      });
    }
  };

  const setFilters = (filters: Partial<FilterOptions>) => {
    dispatch({ type: 'SET_FILTERS', payload: { ...state.filters, ...filters } });
  };

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  const loadTransactions = (transactions: Transaction[]) => {
    dispatch({ type: 'LOAD_TRANSACTIONS', payload: transactions });
  };

  const getSummaryStats = (): SummaryStats => {
    return calculateSummaryStats(state.filteredTransactions);
  };

  return (
    <TransactionContext.Provider
      value={{
        state,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        setFilters,
        clearFilters,
        loadTransactions,
        getSummaryStats
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}
