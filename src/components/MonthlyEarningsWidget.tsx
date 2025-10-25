'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, ChevronDown } from 'lucide-react';
import { useTransactions } from '@/contexts/TransactionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Transaction, YearlyData, DailyData, WeeklyData, MonthlyData } from '@/types/financial';
import { useState, useEffect, useMemo, useCallback } from 'react';



export default function MonthlyEarningsWidget() {
  const { state } = useTransactions();
  const { chartColors, isDark } = useTheme();
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('day');
  const [isClient, setIsClient] = useState(false);
  const [isTimeframeDropdownOpen, setIsTimeframeDropdownOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isTimeframeDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.timeframe-dropdown')) {
          setIsTimeframeDropdownOpen(false);
        }
      }
    };

    if (isTimeframeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTimeframeDropdownOpen]);

  const handleTimeframeChange = (newTimeframe: 'day' | 'week' | 'month' | 'year' | 'all') => {
    if (newTimeframe !== timeframe) {
      setTimeframe(newTimeframe);
    }
    setIsTimeframeDropdownOpen(false);
  };

  const getKeyPoints = (data: { date: string; amount: number }[]) => {
    if (data.length <= 10) return data;
    
    const step = Math.ceil(data.length / 10);
    return data.filter((_, index) => index % step === 0 || index === data.length - 1);
  };
  
  const getDailyData = useCallback((): DailyData[] => {
    const dailyMap = new Map<string, { income: number; expenses: number }>();
    
    
    const july1Salary = state.filteredTransactions.find(t => t.date === '2025-07-01' && t.type === 'income');
    
    state.filteredTransactions.forEach((transaction: Transaction) => {
      const date = new Date(transaction.date);
      const dayKey = date.toISOString().split('T')[0];
      
      if (!dailyMap.has(dayKey)) {
        dailyMap.set(dayKey, { income: 0, expenses: 0 });
      }
      
      const dayData = dailyMap.get(dayKey)!;
      if (transaction.type === 'income') {
        dayData.income += transaction.amount;
      } else {
        dayData.expenses += transaction.amount;
      }
    });
    
    const sortedData = Array.from(dailyMap.entries())
      .map(([key, data]) => {
        const date = new Date(key);
        return {
          day: `${date.getDate()}.${date.getMonth() + 1}`,
          income: data.income,
          expenses: data.expenses,
          balance: data.income - data.expenses
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.day.split('.').reverse().join('-'));
        const dateB = new Date(b.day.split('.').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-60);

    let cumulativeBalance = 0;
    const result = sortedData.map(item => {
      cumulativeBalance += item.balance;
      return {
        ...item,
        balance: cumulativeBalance
      };
    });
    
    
    const july1InResult = result.find(item => item.day === '1.7');
    
    return result;
  }, [state.filteredTransactions]);
  
  const getWeeklyData = useCallback((): WeeklyData[] => {
    const weeklyMap = new Map<string, { income: number; expenses: number }>();
    
    state.filteredTransactions.forEach((transaction: Transaction) => {
      const date = new Date(transaction.date);
      const dayOfWeek = date.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() + mondayOffset);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, { income: 0, expenses: 0 });
      }
      
      const weekData = weeklyMap.get(weekKey)!;
      if (transaction.type === 'income') {
        weekData.income += transaction.amount;
      } else {
        weekData.expenses += transaction.amount;
      }
    });
    
    const weeks = [];
    const today = new Date();
    const currentWeekStart = new Date(today);
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    currentWeekStart.setDate(today.getDate() + mondayOffset);
    currentWeekStart.setHours(0, 0, 0, 0);
    
    for (let i = 7; i >= 0; i--) {
      const weekDate = new Date(currentWeekStart);
      weekDate.setDate(currentWeekStart.getDate() - (i * 7));
      const weekKey = weekDate.toISOString().split('T')[0];
      
      const weekData = weeklyMap.get(weekKey) || { income: 0, expenses: 0 };
      const weekEnd = new Date(weekDate);
      weekEnd.setDate(weekDate.getDate() + 6);
      
      weeks.push({
        week: `${weekDate.getDate()}.${weekDate.getMonth() + 1}`,
        income: weekData.income,
        expenses: weekData.expenses,
        balance: weekData.income - weekData.expenses
      });
    }
    
    let cumulativeBalance = 0;
    return weeks.map(item => {
      cumulativeBalance += item.balance;
      return {
        ...item,
        balance: cumulativeBalance
      };
    });
  }, [state.filteredTransactions]);

  const getMonthlyData = useCallback((): MonthlyData[] => {
    const monthlyMap = new Map<string, { income: number; expenses: number }>();
    
    state.filteredTransactions.forEach((transaction: Transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expenses: 0 });
      }
      
      const monthData = monthlyMap.get(monthKey)!;
      if (transaction.type === 'income') {
        monthData.income += transaction.amount;
      } else {
        monthData.expenses += transaction.amount;
      }
    });
    
    return Array.from(monthlyMap.entries())
      .map(([key, data]) => {
        const date = new Date(key + '-01');
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          monthKey: key,
          income: data.income,
          expenses: data.expenses,
          balance: data.income - data.expenses
        };
      })
      .sort((a, b) => {
        return a.monthKey.localeCompare(b.monthKey);
      });

    let cumulativeBalance = 0;
    return monthlyData.map(item => {
      cumulativeBalance += item.balance;
      return {
        ...item,
        balance: cumulativeBalance
      };
    });
  }, [state.filteredTransactions]);

  const getYearlyData = useCallback((): YearlyData[] => {
    const yearlyMap = new Map<string, { income: number; expenses: number }>();
    
    state.filteredTransactions.forEach((transaction: Transaction) => {
      const date = new Date(transaction.date);
      const yearKey = `${date.getFullYear()}`;
      
      if (!yearlyMap.has(yearKey)) {
        yearlyMap.set(yearKey, { income: 0, expenses: 0 });
      }
      
      const data = yearlyMap.get(yearKey)!;
      if (transaction.type === 'income') {
        data.income += transaction.amount;
      } else {
        data.expenses += transaction.amount;
      }
    });
    
    const sortedData = Array.from(yearlyMap.entries())
      .map(([key, data]) => ({
        year: key,
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses
      }))
      .sort((a, b) => a.year.localeCompare(b.year))
      .slice(-10);

    const result = sortedData.map(item => ({
      ...item,
      balance: item.balance
    }));
    
    return result;
  }, [state.filteredTransactions]);

  const dailyData = useMemo(() => getDailyData(), [getDailyData]);
  const weeklyData = useMemo(() => getWeeklyData(), [getWeeklyData]);
  const monthlyData = useMemo(() => getMonthlyData(), [getMonthlyData]);
  const yearlyData = useMemo(() => getYearlyData(), [getYearlyData]);
  
  const currentData = useMemo(() => {
    return timeframe === 'day' ? dailyData : 
           timeframe === 'week' ? weeklyData : 
           timeframe === 'month' ? monthlyData : 
           timeframe === 'year' ? yearlyData : 
           dailyData;
  }, [timeframe, dailyData, weeklyData, monthlyData, yearlyData]);
  
  const safeCurrentData = Array.isArray(currentData) ? currentData : [];
  const currentPeriod = safeCurrentData[safeCurrentData.length - 1];
  const maxIncome = safeCurrentData.length > 0 ? Math.max(...safeCurrentData.map(d => d.income || 0)) : 0;
  const maxIncomePeriod = safeCurrentData.find(d => d.income === maxIncome);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      <div className="bg-white rounded-xl p-4 xs:p-6 shadow-sm border border-gray-200">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between mb-3 xs:mb-4 space-y-2 xs:space-y-0">
        <h3 className="text-base xs:text-lg font-semibold text-gray-900">
          <span className="block xs:inline">Financial Chart</span>
          {isClient && timeframe === 'day' && safeCurrentData.length > 0 && (
            <span className="text-xs xs:text-sm text-gray-500 ml-0 xs:ml-2 block xs:inline">
              (last {Math.min(safeCurrentData.length, 30)} days)
            </span>
          )}
        </h3>
        <div className="flex flex-col xs:flex-row xs:items-center space-y-2 xs:space-y-0 xs:space-x-1 sm:space-x-2 min-w-0">
          {/* Timeframe Selector */}
          <div className="relative timeframe-dropdown">
            {/* Mobile Dropdown */}
            <div className="sm:hidden">
              <button
                onClick={() => setIsTimeframeDropdownOpen(!isTimeframeDropdownOpen)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>{timeframe === 'day' ? 'Days' : timeframe === 'week' ? 'Weeks' : timeframe === 'month' ? 'Months' : timeframe === 'year' ? 'Year' : 'All Time'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {isTimeframeDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    {[
                      { value: 'day', label: 'Days' },
                      { value: 'week', label: 'Weeks' },
                      { value: 'month', label: 'Months' },
                      { value: 'year', label: 'Year' },
                      { value: 'all', label: 'All Time' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleTimeframeChange(option.value as 'day' | 'week' | 'month' | 'year' | 'all')}
                        className={`w-full text-left px-2 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors ${
                          timeframe === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Horizontal Selector */}
            <div className="hidden sm:flex bg-white border border-gray-300 rounded-lg p-1 shadow-sm w-fit mx-auto">
              <button
                onClick={() => handleTimeframeChange('day')}
                className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  timeframe === 'day'
                    ? 'text-white bg-primary shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Days
              </button>
              <button
                onClick={() => handleTimeframeChange('week')}
                className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  timeframe === 'week'
                      ? 'text-white bg-primary shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Weeks
              </button>
              <button
                onClick={() => handleTimeframeChange('month')}
                className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  timeframe === 'month'
                      ? 'text-white bg-primary shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Months
              </button>
              <button
                onClick={() => handleTimeframeChange('year')}
                className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  timeframe === 'year'
                      ? 'text-white bg-primary shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Year
              </button>
              <button
                onClick={() => handleTimeframeChange('all')}
                className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  timeframe === 'all'
                      ? 'text-white bg-primary shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                All Time
              </button>
            </div>
          </div>
          
          {/* Chart Type Link */}
          <div className="flex items-center space-x-1 text-green-600">
            <BarChart3 className="w-3 h-3 xs:w-4 xs:h-4" />
            <span className="text-xs xs:text-sm font-medium">Chart</span>
          </div>
        </div>
      </div>

            {/* Current Period Stats */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-900">
                {isClient && currentPeriod ? formatCurrency(currentPeriod.income) : '$0'}
              </p>
              <p className="text-sm text-gray-500">
                {isClient && currentPeriod ? 
                  `${currentPeriod.balance > 0 ? 'Positive' : 'Negative'} balance for ${timeframe === 'day' ? 'day' : timeframe === 'week' ? 'week' : timeframe === 'month' ? 'month' : timeframe === 'year' ? 'year' : 'all time'}` : 
                  'Loading...'
                }
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {isClient && currentPeriod ? 
                  `Showing ${safeCurrentData.length} ${timeframe === 'day' ? 'days' : timeframe === 'week' ? 'weeks' : timeframe === 'month' ? 'months' : timeframe === 'year' ? 'years' : 'periods'} • Income: ${formatCurrency(currentPeriod.income || 0)} • Expenses: ${formatCurrency(currentPeriod.expenses || 0)}` : 
                  'Please wait'
                }
              </p>
        </div>

      {/* Binance-style Chart */}
      <div className="h-64 sm:h-80 md:h-96 lg:h-[32rem] xl:h-[40rem] mb-4 max-w-4xl mx-auto">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={isClient ? safeCurrentData : []} 
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey={timeframe === 'day' ? 'day' : timeframe === 'week' ? 'week' : timeframe === 'month' ? 'month' : timeframe === 'year' ? 'year' : 'day'}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              tickFormatter={(value) => `$${value}`}
              domain={['dataMin - 100', 'dataMax + 100']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                color: '#1F2937',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                fontSize: '12px'
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value), 
                name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Balance'
              ]}
              labelStyle={{ 
                color: '#6B7280', 
                fontSize: '11px' 
              }}
              cursor={{ stroke: '#6B7280', strokeWidth: 1, strokeDasharray: '2 2' }}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke={isClient ? chartColors.income : '#10B981'}
              strokeWidth={3}
              dot={timeframe === 'day' ? {
                fill: '#ffffff', 
                strokeWidth: 2, 
                r: 3, 
                stroke: isClient ? chartColors.income : '#10B981'
              } : { 
                fill: '#ffffff', 
                strokeWidth: 2, 
                r: 4, 
                stroke: isClient ? chartColors.income : '#10B981'
              }}
              activeDot={{ 
                r: 8, 
                stroke: isClient ? chartColors.income : '#10B981', 
                strokeWidth: 4, 
                fill: '#ffffff'
              }}
              connectNulls={false}
              animationDuration={300}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke={isClient ? chartColors.expenses : '#EF4444'}
              strokeWidth={3}
              dot={timeframe === 'day' ? {
                fill: '#ffffff', 
                strokeWidth: 2, 
                r: 3, 
                stroke: isClient ? chartColors.expenses : '#EF4444'
              } : { 
                fill: '#ffffff', 
                strokeWidth: 2, 
                r: 4, 
                stroke: isClient ? chartColors.expenses : '#EF4444'
              }}
              activeDot={{ 
                r: 8, 
                stroke: isClient ? chartColors.expenses : '#EF4444', 
                strokeWidth: 4, 
                fill: '#ffffff'
              }}
              connectNulls={false}
              animationDuration={300}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke={isClient ? chartColors.balance : '#3B82F6'}
              strokeWidth={3}
              dot={timeframe === 'day' ? {
                fill: '#ffffff', 
                strokeWidth: 2, 
                r: 3, 
                stroke: isClient ? chartColors.balance : '#3B82F6'
              } : { 
                fill: '#ffffff', 
                strokeWidth: 2, 
                r: 4, 
                stroke: isClient ? chartColors.balance : '#3B82F6'
              }}
              activeDot={{ 
                r: 8, 
                stroke: isClient ? chartColors.balance : '#3B82F6', 
                strokeWidth: 4, 
                fill: '#ffffff'
              }}
              connectNulls={false}
              animationDuration={300}
            />
            <ReferenceLine y={0} stroke={isClient ? chartColors.text : '#6B7280'} strokeDasharray="1 1" strokeOpacity={0.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Statistics under main container */}
      <div className="flex flex-row justify-between items-center pt-3 border-t border-gray-200 w-full">
          <div className="flex items-center space-x-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isClient ? `Peak ${timeframe === 'day' ? 'day' : timeframe === 'week' ? 'period' : 'month'}` : 'Loading...'}
            </span>
            <span className="text-sm text-gray-600 font-semibold ml-2">
              {isClient && maxIncomePeriod ? (
                timeframe === 'day' ? (maxIncomePeriod as DailyData).day : 
                timeframe === 'week' ? (maxIncomePeriod as WeeklyData).week : 
                (maxIncomePeriod as MonthlyData).month
              ) : 'N/A'}
            </span>
            <span className="text-xs text-gray-500 ml-1">
              {isClient && maxIncomePeriod ? formatCurrency(maxIncomePeriod.income) : ''}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-blue-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isClient ? (timeframe === 'day' ? 'Days' : timeframe === 'week' ? 'Weeks' : 'Months') : 'Loading...'}
            </span>
            <span className="text-sm text-gray-600 font-semibold ml-2">
              {isClient ? currentData.length : '-'}
            </span>
            <span className="text-xs text-gray-500 ml-1">
              tracked
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
