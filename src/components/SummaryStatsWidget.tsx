'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react';
import { SummaryStats } from '@/types/financial';

interface SummaryStatsWidgetProps {
  stats: SummaryStats;
  period?: string;
}

export default function SummaryStatsWidget({ stats, period = 'All Time' }: SummaryStatsWidgetProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBalanceBgColor = (balance: number) => {
    if (balance > 0) return 'bg-green-50 border-green-200';
    if (balance < 0) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="bg-white rounded-xl p-4 xs:p-6 xl:p-8 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
        <span className="text-sm text-gray-500">{period}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Income */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-green-100 rounded-full w-11 h-11 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">INCOME</span>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(stats.totalIncome)}
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-red-100 rounded-full w-11 h-11 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs text-red-600 font-medium">EXPENSES</span>
          </div>
          <p className="text-2xl font-bold text-red-700">
            {formatCurrency(stats.totalExpenses)}
          </p>
        </div>
      </div>

      {/* Balance */}
      <div className={`rounded-lg p-4 border ${getBalanceBgColor(stats.balance)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-3 rounded-full w-11 h-11 flex items-center justify-center ${
              stats.balance > 0 ? 'bg-green-100' : stats.balance < 0 ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <Wallet className={`w-5 h-5 ${
                stats.balance > 0 ? 'text-green-600' : stats.balance < 0 ? 'text-red-600' : 'text-gray-600'
              }`} />
            </div>
            <span className="text-sm font-medium text-gray-700">BALANCE</span>
          </div>
          <span className="text-xs text-gray-500">
            {stats.transactionCount} transactions
          </span>
        </div>
        <p className={`text-3xl font-bold ${getBalanceColor(stats.balance)}`}>
          {formatCurrency(stats.balance)}
        </p>
        {stats.balance !== 0 && (
          <p className={`text-sm mt-1 ${
            stats.balance > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {stats.balance > 0 ? 'Positive Balance' : 'Negative Balance'}
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Average Income:</span>
          <span className="font-medium">
            {stats.transactionCount > 0 
              ? formatCurrency(stats.totalIncome / Math.max(1, stats.transactionCount))
              : formatCurrency(0)
            }
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>Average Expense:</span>
          <span className="font-medium">
            {stats.transactionCount > 0 
              ? formatCurrency(stats.totalExpenses / Math.max(1, stats.transactionCount))
              : formatCurrency(0)
            }
          </span>
        </div>
      </div>
    </div>
  );
}
