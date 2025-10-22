'use client';

import { FileText } from 'lucide-react';
import { useTransactions } from '@/contexts/TransactionContext';
import { useState, useEffect } from 'react';

export default function PayablesWidget() {
  const { state } = useTransactions();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Get only expenses
  const expenseTransactions = isClient ? state.filteredTransactions.filter(t => t.type === 'expense') : [];
  
  // Group by categories
  const groupedExpenses = expenseTransactions.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = { amount: 0, count: 0 };
    }
    acc[category].amount += transaction.amount;
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { amount: number; count: number }>);

  const payables = Object.entries(groupedExpenses).map(([category, data]) => ({
    id: category,
    description: category,
    amount: data.amount,
    type: 'expense' as const
  })).sort((a, b) => b.amount - a.amount);
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payables</h3>
      
        <div className="space-y-3">
          {!isClient ? (
            <div className="text-center py-8 text-gray-500">
              <p>Loading...</p>
            </div>
          ) : payables.length > 0 ? (
            payables.map((payable) => (
              <div key={payable.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-red-100 text-red-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{payable.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">
                    ${payable.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No expenses</p>
            </div>
          )}
        </div>
    </div>
  );
}
