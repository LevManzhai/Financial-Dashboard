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
  const { getSummaryStats } = useTransactions();
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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