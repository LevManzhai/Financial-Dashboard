'use client';

import { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { TransactionProvider, useTransactions } from '@/contexts/TransactionContext';

// Lazy load all heavy components for faster initial load
const CreditCardWidget = lazy(() => import('@/components/CreditCardWidget'));
const WalletWidget = lazy(() => import('@/components/WalletWidget'));
const PayableAccountsWidget = lazy(() => import('@/components/PayableAccountsWidget'));
const TransactionsWidget = lazy(() => import('@/components/TransactionsWidget'));
const EarningsGoalsWidget = lazy(() => import('@/components/EarningsGoalsWidget'));
const ReceiptsWidget = lazy(() => import('@/components/ReceiptsWidget'));
const PayablesWidget = lazy(() => import('@/components/PayablesWidget'));
const SummaryStatsWidget = lazy(() => import('@/components/SummaryStatsWidget'));
const MonthlyEarningsWidget = lazy(() => import('@/components/MonthlyEarningsWidget'));

// Skeleton loading component
function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 xs:p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { getSummaryStats, loadTransactions, state } = useTransactions();
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load mock data automatically on first visit
  useEffect(() => {
    if (isClient && state.transactions.length === 0) {
      // Import mock data from Header component
      const mockTransactions = [
        // Initial balance - July 2025
        {
          id: 'new-mock-0',
          category: 'Initial Balance',
          description: 'Starting balance',
          amount: 7000,
          date: '2025-07-01',
          type: 'income' as const,
          createdAt: '2025-07-01T00:00:00Z',
          updatedAt: '2025-07-01T00:00:00Z'
        },
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
      
      loadTransactions(mockTransactions);
    }
  }, [isClient, state.transactions.length, loadTransactions]);

  // Memoize summary stats calculation
  const summaryStats = useMemo(() => {
    if (!isClient) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        transactionCount: 0
      };
    }
    return getSummaryStats();
  }, [getSummaryStats, isClient]);

  // Memoize mobile menu handlers
  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleToggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  useEffect(() => {
    // Set client immediately for faster rendering
    setIsClient(true);
    
    // Preload critical components after initial render
    const preloadComponents = () => {
      // Preload the most important widgets
      import('@/components/CreditCardWidget');
      import('@/components/WalletWidget');
      import('@/components/TransactionsWidget');
    };
    
    // Use requestIdleCallback for preloading
    if (window.requestIdleCallback) {
      window.requestIdleCallback(preloadComponents);
    } else {
      setTimeout(preloadComponents, 100);
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50" style={{ contain: 'layout style' }}>
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
        <Header 
          isMobileMenuOpen={isMobileMenuOpen} 
          onToggleMobileMenu={handleToggleMobileMenu} 
        />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 xs:p-4 sm:p-6 min-w-0">
          {/* Top Row */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 mb-4 xs:mb-6 items-center min-w-0">
            <Suspense fallback={<SkeletonCard />}>
              <CreditCardWidget />
            </Suspense>
            <Suspense fallback={<SkeletonCard />}>
              <WalletWidget />
            </Suspense>
            <Suspense fallback={<SkeletonCard />}>
              <PayableAccountsWidget />
            </Suspense>
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4 sm:gap-6 mb-4 xs:mb-6 min-w-0">
            <Suspense fallback={<SkeletonCard />}>
              <TransactionsWidget />
            </Suspense>
            <Suspense fallback={<SkeletonCard />}>
              <MonthlyEarningsWidget />
            </Suspense>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 mb-4 xs:mb-6 min-w-0">
            <Suspense fallback={<SkeletonCard />}>
              <EarningsGoalsWidget />
            </Suspense>
            <Suspense fallback={<SkeletonCard />}>
              <ReceiptsWidget />
            </Suspense>
            <Suspense fallback={<SkeletonCard />}>
              <PayablesWidget />
            </Suspense>
          </div>

          {/* Summary Stats Row - Moved to bottom */}
          {isClient && (
            <Suspense fallback={<SkeletonCard />}>
              <SummaryStatsWidget stats={summaryStats} />
            </Suspense>
          )}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <TransactionProvider>
      <DashboardContent />
    </TransactionProvider>
  );
}