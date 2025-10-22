export interface Transaction {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFormData {
  category: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}

export interface FilterOptions {
  category?: string;
  type?: 'income' | 'expense' | 'all';
  dateFrom?: string;
  dateTo?: string;
  sortBy: 'date' | 'amount' | 'category';
  sortOrder: 'asc' | 'desc';
}

export interface SummaryStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

export interface Category {
  id: string;
  name: string;
  amount: number;
  color: string;
  icon: string;
}

export interface MonthlyEarning {
  month: string;
  amount: number;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
}

export interface CreditCard {
  number: string;
  holder: string;
  expiry: string;
  type: 'visa' | 'mastercard';
}

export interface Wallet {
  balance: number;
  income: number;
  expenses: number;
}
