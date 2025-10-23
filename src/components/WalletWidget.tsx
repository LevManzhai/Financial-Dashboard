'use client';

import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useTransactions } from '@/contexts/TransactionContext';
import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import React from 'react';

export default function WalletWidget() {
  const { getSummaryStats } = useTransactions();
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setStats(getSummaryStats());
  }, [getSummaryStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet</h3>
      
      <div className="mb-6 relative">
        {/* Real content with fade-in */}
        <div className={`transition-opacity duration-300 ease-in-out ${isClient ? 'opacity-100' : 'opacity-0'} absolute top-0 left-0 w-full`}>
          <p className={`text-3xl font-bold ${stats.balance > 0 ? 'text-green-600' : stats.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(stats.balance)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.balance > 0 ? 'Positive balance' : stats.balance < 0 ? 'Negative balance' : 'Zero balance'}
          </p>
        </div>
        
        {/* Skeleton with fade-out */}
        <div className={`transition-opacity duration-300 ease-in-out ${isClient ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-3xl font-bold text-gray-300">$0</p>
          <p className="text-sm text-gray-300 mt-1">Zero balance</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-gray-600">Income</span>
          </div>
          <span className="font-semibold text-green-600">
            {isClient ? formatCurrency(stats.totalIncome) : '$0'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <span className="text-gray-600">Expenses</span>
          </div>
          <span className="font-semibold text-red-600">
            {isClient ? formatCurrency(stats.totalExpenses) : '$0'}
          </span>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Transactions</span>
          </div>
          <span className="font-semibold text-gray-900">
            {isClient ? stats.transactionCount : 0}
          </span>
        </div>
      </div>
    </div>
  );
}
