'use client';

import { PieChart, Pie, Cell } from 'recharts';
import { Goal } from '@/types/financial';
import { useTransactions } from '@/contexts/TransactionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Emergency Fund',
    target: 10000,
    current: 4500,
    deadline: 'Dec 2024'
  },
  {
    id: '2',
    title: 'Vacation',
    target: 5000,
    current: 2000,
    deadline: 'Jun 2024'
  }
];

export default function EarningsGoalsWidget() {
  const { getSummaryStats } = useTransactions();
  const { chartColors } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0, transactionCount: 0 });

  useEffect(() => {
    setIsClient(true);
    setStats(getSummaryStats());
  }, [getSummaryStats]);
  
  const totalEarnings = stats.totalIncome;
  const totalGoals = mockGoals.reduce((sum, goal) => sum + goal.current, 0);
  const goalProgress = totalEarnings > 0 ? (totalGoals / totalEarnings) * 100 : 0;

  const data = [
    { name: 'Earnings', value: Math.max(0, totalEarnings - totalGoals), color: isClient ? chartColors.balance : '#3B82F6' },
    { name: 'Goals', value: Math.min(totalGoals, totalEarnings), color: isClient ? chartColors.grid : '#E5E7EB' }
  ];
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings</h3>
      
      {/* Donut Chart */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <PieChart width={120} height={120}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                dataKey="value"
                startAngle={90}
                endAngle={450}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          
            {/* Center Text */}
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
              <p className="text-lg font-bold text-gray-900">
                {!isClient ? '$0' : `$${totalEarnings.toLocaleString()}`}
              </p>
              <p className="text-sm text-green-600 font-medium">
                {!isClient ? 'Loading...' : '+20%'}
              </p>
            </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: isClient ? chartColors.balance : '#3B82F6' }}></div>
            <span className="text-sm text-gray-600">Earnings</span>
          </div>
          {isClient && (
            <span className="text-sm text-gray-900 font-semibold">
              ${totalEarnings.toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: isClient ? chartColors.grid : '#E5E7EB' }}></div>
            <span className="text-sm text-gray-600">Goals</span>
          </div>
          {isClient && (
            <span className="text-sm text-gray-900 font-semibold">
              ${totalGoals.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
