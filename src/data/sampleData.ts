import { Transaction } from '@/types/financial';

export const sampleTransactions: Transaction[] = [
  {
    id: 'txn-1',
    type: 'income',
    amount: 5000,
    category: 'Salary',
    description: 'Monthly salary payment',
    date: '2024-10-01',
    createdAt: '2024-10-01T00:00:00.000Z',
    updatedAt: '2024-10-01T00:00:00.000Z'
  },
  {
    id: 'txn-2',
    type: 'income',
    amount: 500,
    category: 'Freelance',
    description: 'Web development project',
    date: '2024-10-05',
    createdAt: '2024-10-05T00:00:00.000Z',
    updatedAt: '2024-10-05T00:00:00.000Z'
  },
  {
    id: 'txn-3',
    type: 'expense',
    amount: 1200,
    category: 'Rent',
    description: 'Monthly apartment rent',
    date: '2024-10-01',
    createdAt: '2024-10-01T00:00:00.000Z',
    updatedAt: '2024-10-01T00:00:00.000Z'
  },
  {
    id: 'txn-4',
    type: 'expense',
    amount: 300,
    category: 'Groceries',
    description: 'Weekly grocery shopping',
    date: '2024-10-03',
    createdAt: '2024-10-03T00:00:00.000Z',
    updatedAt: '2024-10-03T00:00:00.000Z'
  },
  {
    id: 'txn-5',
    type: 'expense',
    amount: 150,
    category: 'Transportation',
    description: 'Gas and public transport',
    date: '2024-10-04',
    createdAt: '2024-10-04T00:00:00.000Z',
    updatedAt: '2024-10-04T00:00:00.000Z'
  },
  {
    id: 'txn-6',
    type: 'expense',
    amount: 200,
    category: 'Entertainment',
    description: 'Movie tickets and dinner',
    date: '2024-10-06',
    createdAt: '2024-10-06T00:00:00.000Z',
    updatedAt: '2024-10-06T00:00:00.000Z'
  },
  {
    id: 'txn-7',
    type: 'income',
    amount: 300,
    category: 'Investment',
    description: 'Dividend from stocks',
    date: '2024-10-10',
    createdAt: '2024-10-10T00:00:00.000Z',
    updatedAt: '2024-10-10T00:00:00.000Z'
  },
  {
    id: 'txn-8',
    type: 'expense',
    amount: 80,
    category: 'Utilities',
    description: 'Electricity and water bill',
    date: '2024-10-08',
    createdAt: '2024-10-08T00:00:00.000Z',
    updatedAt: '2024-10-08T00:00:00.000Z'
  },
  {
    id: 'txn-9',
    type: 'expense',
    amount: 120,
    category: 'Healthcare',
    description: 'Doctor visit and medication',
    date: '2024-10-12',
    createdAt: '2024-10-12T00:00:00.000Z',
    updatedAt: '2024-10-12T00:00:00.000Z'
  },
  {
    id: 'txn-10',
    type: 'income',
    amount: 200,
    category: 'Freelance',
    description: 'Logo design project',
    date: '2024-10-15',
    createdAt: '2024-10-15T00:00:00.000Z',
    updatedAt: '2024-10-15T00:00:00.000Z'
  }
];

export const sampleChartData = [
  { name: 'Jan', income: 4500, expenses: 3200, balance: 1300 },
  { name: 'Feb', income: 4800, expenses: 2800, balance: 2000 },
  { name: 'Mar', income: 5200, expenses: 3100, balance: 2100 },
  { name: 'Apr', income: 4600, expenses: 2900, balance: 1700 },
  { name: 'May', income: 5100, expenses: 3300, balance: 1800 },
  { name: 'Jun', income: 4900, expenses: 2700, balance: 2200 },
  { name: 'Jul', income: 5300, expenses: 3000, balance: 2300 },
  { name: 'Aug', income: 4800, expenses: 3200, balance: 1600 },
  { name: 'Sep', income: 5000, expenses: 2800, balance: 2200 },
  { name: 'Oct', income: 5500, expenses: 2150, balance: 3350 }
];
