'use client';

import { useState, useEffect, useMemo } from 'react';
import { TransactionProvider, useTransactions } from '@/contexts/TransactionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, PieChart, LineChart, Activity, Target, Zap, ChevronDown, Briefcase, Heart, Utensils, Car, ShoppingBag, Gamepad2, Home, CreditCard, Wifi, Coffee, BookOpen, Music, Camera, Plane } from 'lucide-react';
import { Transaction } from '@/types/financial';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend } from 'recharts';
// Note: Mock data is handled by Header component

function RevenueContent() {
  const { state, loadTransactions } = useTransactions();
  const { isDark, themeSettings } = useTheme();
  const { chartColors } = useTheme();
  const [isClient, setIsClient] = useState(false);

  // Note: Mock data loading is handled by Header component
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('month');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTimeframeDropdownOpen, setIsTimeframeDropdownOpen] = useState(false);
  const [isChartTypeDropdownOpen, setIsChartTypeDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [iconBgColor, setIconBgColor] = useState('rgba(59, 130, 246, 0.1)');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && themeSettings.primaryColor) {
      const hex = themeSettings.primaryColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      setIconBgColor(`rgba(${r}, ${g}, ${b}, 0.1)`);
    }
  }, [themeSettings.primaryColor, isClient]); 

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isTimeframeDropdownOpen && !target.closest('.timeframe-dropdown')) {
        setIsTimeframeDropdownOpen(false);
      }
      if (isChartTypeDropdownOpen && !target.closest('.chart-type-dropdown')) {
        setIsChartTypeDropdownOpen(false);
      }
      if (isDateDropdownOpen && !target.closest('.date-dropdown')) {
        setIsDateDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTimeframeDropdownOpen, isChartTypeDropdownOpen, isDateDropdownOpen]);

  // Filter transactions by selected period
  const getFilteredTransactions = () => {
    
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'day':
        startDate = new Date(selectedDate);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate = new Date(now);
        startDate.setDate(now.getDate() + mondayOffset);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
        return state.filteredTransactions;
      default:
        return state.filteredTransactions;
    }
    
    return state.filteredTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate;
    });
  };

  const filteredTransactions = useMemo(() => getFilteredTransactions(), [isClient, timeframe, selectedDate, state.transactions]);

  // Group by periods for charts
  const getChartData = () => {
    // If no transactions, return empty data
    if (filteredTransactions.length === 0) {
      return [];
    }

    const periodMap = new Map<string, { income: number; expenses: number; balance: number }>();

    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      let periodKey: string;

      switch (timeframe) {
        case 'day':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'week':
          const dayOfWeek = date.getDay();
          const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() + mondayOffset);
          weekStart.setHours(0, 0, 0, 0);
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          periodKey = date.toISOString().split('T')[0];
      }

      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, { income: 0, expenses: 0, balance: 0 });
      }

      const periodData = periodMap.get(periodKey)!;
      if (transaction.type === 'income') {
        periodData.income += transaction.amount;
      } else {
        periodData.expenses += transaction.amount;
      }
      periodData.balance = periodData.income - periodData.expenses;
    });

    const sortedData = Array.from(periodMap.entries())
      .map(([key, data]) => {
        const date = new Date(key);
        let label: string;

        switch (timeframe) {
          case 'day':
            label = `${date.getDate()}.${date.getMonth() + 1}`;
            break;
          case 'week':
            label = `${date.getDate()}.${date.getMonth() + 1}`;
            break;
          case 'month':
            label = date.toLocaleDateString('en-US', { month: 'short' });
            break;
          case 'year':
            label = date.toLocaleDateString('en-US', { month: 'short' });
            break;
          default:
            label = `${date.getDate()}.${date.getMonth() + 1}`;
        }

        return {
          period: label,
          date: date, // Сохраняем исходную дату для сортировки
          income: data.income,
          expenses: data.expenses,
          balance: data.balance,
          net: data.income - data.expenses
        };
      })
      .sort((a, b) => {
        return a.date.getTime() - b.date.getTime();
      });

    // Добавляем кумулятивный баланс
    let cumulativeBalance = 0;
    return sortedData.map(item => {
      cumulativeBalance += item.net;
      return {
        ...item,
        net: cumulativeBalance // Заменяем на кумулятивный баланс
      };
    });
  };

  const chartData = getChartData();
  
  // Debug: log data
  console.log('Revenue Analytics - filteredTransactions:', filteredTransactions.length);
  console.log('Revenue Analytics - chartData:', chartData.length);
  console.log('Revenue Analytics - isClient:', isClient);

  // Statistics by categories
  const categoryStats = filteredTransactions.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = { income: 0, expenses: 0, count: 0 };
    }
    if (transaction.type === 'income') {
      acc[category].income += transaction.amount;
    } else {
      acc[category].expenses += transaction.amount;
    }
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { income: number; expenses: number; count: number }>);

  // Data for pie chart
  const pieData = Object.entries(categoryStats)
    .map(([category, data]) => ({
      name: category,
      value: data.income + data.expenses,
      income: data.income,
      expenses: data.expenses
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const COLORS = isClient ? [chartColors.balance, chartColors.expenses, chartColors.income, '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'] : ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  // General statistics
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  const transactionCount = filteredTransactions.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    const categoryIcons: { [key: string]: any } = {
      'Salary': Briefcase,
      'Health': Heart,
      'Food': Utensils,
      'Transport': Car,
      'Shopping': ShoppingBag,
      'Entertainment': Gamepad2,
      'Utilities': Wifi,
      'Rent': Home,
      'Insurance': CreditCard,
      'Coffee': Coffee,
      'Education': BookOpen,
      'Music': Music,
      'Photography': Camera,
      'Travel': Plane,
    };
    
    return categoryIcons[category] || DollarSign;
  };

  // Get color for category
  const getCategoryColor = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      'Salary': 'bg-green-100 text-green-600',
      'Health': 'bg-red-100 text-red-600',
      'Food': 'bg-orange-100 text-orange-600',
      'Transport': 'bg-blue-100 text-blue-600',
      'Shopping': 'bg-purple-100 text-purple-600',
      'Entertainment': 'bg-pink-100 text-pink-600',
      'Utilities': 'bg-yellow-100 text-yellow-600',
      'Rent': 'bg-indigo-100 text-indigo-600',
      'Insurance': 'bg-cyan-100 text-cyan-600',
      'Coffee': 'bg-amber-100 text-amber-600',
      'Education': 'bg-emerald-100 text-emerald-600',
      'Music': 'bg-violet-100 text-violet-600',
      'Photography': 'bg-rose-100 text-rose-600',
      'Travel': 'bg-sky-100 text-sky-600',
    };
    
    return categoryColors[category] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-12 xs:h-14 sm:h-16 min-w-0">
            <div className="flex items-center space-x-1 xs:space-x-2 min-w-0 flex-1">
              {/* Navigation Menu */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex items-center space-x-1 px-1.5 xs:px-2 py-1 xs:py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowDownLeft className="w-3 h-3 xs:w-4 xs:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden xs:inline">Back</span>
                </button>
                <div className="h-4 w-px bg-gray-300 hidden xs:block"></div>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex items-center space-x-1 px-1.5 xs:px-2 py-1 xs:py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <DollarSign className="w-3 h-3 xs:w-4 xs:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden xs:inline">Dashboard</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-1 xs:space-x-2 min-w-0">
                <div 
                  className="p-2 xs:p-3 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: iconBgColor }}
                >
                  <TrendingUp 
                    className="w-5 h-5 xs:w-6 xs:h-6" 
                    style={{ color: 'var(--primary-color)' }}
                  />
                </div>
                <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 truncate">Revenue Analytics</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
              {/* Timeframe Selector */}
              <div className="relative timeframe-dropdown">
                {/* Mobile Dropdown - Hidden on medium screens and up */}
                <div className="md:hidden">
                  <button
                    onClick={() => setIsTimeframeDropdownOpen(!isTimeframeDropdownOpen)}
                    className="flex items-center space-x-1 px-1.5 py-1 bg-gray-50 border border-gray-200 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors min-w-0"
                  >
                    <span className="truncate">{timeframe === 'day' ? 'Day' : timeframe === 'week' ? 'Week' : timeframe === 'month' ? 'Month' : timeframe === 'year' ? 'Year' : 'All'} • {chartType === 'line' ? 'Line' : chartType === 'bar' ? 'Bar' : 'Area'}</span>
                    <ChevronDown className="w-2.5 h-2.5 flex-shrink-0" />
                  </button>
                  
                  {isTimeframeDropdownOpen && (
                    <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        {/* Timeframe Section */}
                        <div className="px-3 py-1 border-b border-gray-100">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Timeframe</div>
                        </div>
                        {[
                          { value: 'day', label: 'Day' },
                          { value: 'week', label: 'Week' },
                          { value: 'month', label: 'Month' },
                          { value: 'year', label: 'Year' },
                          { value: 'all', label: 'All' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setTimeframe(option.value as any);
                              setIsTimeframeDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors ${
                              timeframe === option.value ? 'text-white' : 'text-gray-700'
                            }`}
                            style={timeframe === option.value ? { 
                              backgroundColor: 'var(--primary-color)',
                              color: '#ffffff'
                            } : {}}
                          >
                            {option.label}
                          </button>
                        ))}
                        
                        {/* Chart Type Section */}
                        <div className="px-3 py-1 border-t border-gray-100 mt-1">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chart Type</div>
                        </div>
                        {[
                          { value: 'line', label: 'Line' },
                          { value: 'bar', label: 'Bar' },
                          { value: 'area', label: 'Area' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setChartType(option.value as any);
                              setIsTimeframeDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors ${
                              chartType === option.value ? 'text-white' : 'text-gray-700'
                            }`}
                            style={chartType === option.value ? { 
                              backgroundColor: 'var(--primary-color)',
                              color: '#ffffff'
                            } : {}}
                          >
                            {option.label}
                          </button>
                        ))}
                        
                    {/* Date Input for Day */}
                    {timeframe === 'day' && (
                      <div className="px-3 py-2 border-t border-gray-100">
                        <div className="flex items-center space-x-2 px-2 py-1 bg-gray-50 rounded-md">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <label className="text-xs font-medium text-gray-600">Date:</label>
                        </div>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1"
                        />
                      </div>
                    )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Large Screen Selector - Show on lg screens */}
                <div className="hidden lg:flex bg-gray-50 rounded-lg p-1 border border-gray-200 shadow-sm">
                  <button
                    onClick={() => setTimeframe('day')}
                    className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      timeframe === 'day'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    style={timeframe === 'day' ? { 
                      backgroundColor: 'var(--primary-color)',
                      color: '#ffffff'
                    } : {}}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setTimeframe('week')}
                    className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      timeframe === 'week'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    style={timeframe === 'week' ? { 
                      backgroundColor: 'var(--primary-color)',
                      color: '#ffffff'
                    } : {}}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setTimeframe('month')}
                    className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      timeframe === 'month'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    style={timeframe === 'month' ? { 
                      backgroundColor: 'var(--primary-color)',
                      color: '#ffffff'
                    } : {}}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setTimeframe('year')}
                    className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      timeframe === 'year'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    style={timeframe === 'year' ? { 
                      backgroundColor: 'var(--primary-color)',
                      color: '#ffffff'
                    } : {}}
                  >
                    Year
                  </button>
                  <button
                    onClick={() => setTimeframe('all')}
                    className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      timeframe === 'all'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    style={timeframe === 'all' ? { 
                      backgroundColor: 'var(--primary-color)',
                      color: '#ffffff'
                    } : {}}
                  >
                    All
                  </button>
                </div>
              </div>

              {/* Medium Screen Selectors - Show on md to lg screens */}
              <div className="hidden md:flex lg:hidden items-center space-x-2">
                {/* Timeframe Selector */}
                <div className="bg-gray-50 rounded-lg p-1 border border-gray-200 shadow-sm">
                <button
                  onClick={() => setTimeframe('day')}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    timeframe === 'day'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={timeframe === 'day' ? { 
                    backgroundColor: 'var(--primary-color)',
                    color: '#ffffff'
                  } : {}}
                >
                  Day
                </button>
                <button
                  onClick={() => setTimeframe('week')}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    timeframe === 'week'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={timeframe === 'week' ? { 
                    backgroundColor: 'var(--primary-color)',
                    color: '#ffffff'
                  } : {}}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeframe('month')}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    timeframe === 'month'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={timeframe === 'month' ? { 
                    backgroundColor: 'var(--primary-color)',
                    color: '#ffffff'
                  } : {}}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeframe('year')}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    timeframe === 'year'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={timeframe === 'year' ? { 
                    backgroundColor: 'var(--primary-color)',
                    color: '#ffffff'
                  } : {}}
                >
                  Year
                </button>
                <button
                  onClick={() => setTimeframe('all')}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    timeframe === 'all'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={timeframe === 'all' ? { 
                    backgroundColor: 'var(--primary-color)',
                    color: '#ffffff'
                  } : {}}
                  >
                    All
                  </button>
                </div>
                
                {/* Chart Type Selector */}
                <div className="bg-gray-50 rounded-lg p-1 border border-gray-200 shadow-sm">
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      chartType === 'line'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    style={chartType === 'line' ? { 
                      backgroundColor: 'var(--primary-color)',
                      color: '#ffffff'
                    } : {}}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      chartType === 'bar'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    style={chartType === 'bar' ? { 
                      backgroundColor: 'var(--primary-color)',
                      color: '#ffffff'
                    } : {}}
                  >
                    Bar
                  </button>
                  <button
                    onClick={() => setChartType('area')}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      chartType === 'area'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    style={chartType === 'area' ? { 
                      backgroundColor: 'var(--primary-color)',
                      color: '#ffffff'
                    } : {}}
                  >
                    Area
                </button>
                </div>
              </div>
              
              {/* Date Selector - показываем только для Day */}
              {timeframe === 'day' && (
                <>
                  {/* Large Screen Date - Show on lg screens */}
                  <div className="flex items-center space-x-2 min-w-0 hidden lg:flex">
                    <div className="flex items-center space-x-2 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                        Date:
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-1 py-0.5 text-xs border-0 bg-transparent text-gray-900 focus:ring-0 focus:outline-none min-w-0"
                      />
                    </div>
                  </div>

                  {/* Medium Screen Date Dropdown - Show on md to lg screens */}
                  <div className="relative date-dropdown hidden md:flex lg:hidden">
                    <button
                      onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                      className="flex items-center space-x-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Date</span>
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>
                    
                    {isDateDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="p-3">
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Select Date:
                          </label>
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                              setSelectedDate(e.target.value);
                              setIsDateDropdownOpen(false);
                            }}
                            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {/* Chart Type Selector */}
              <div className="relative chart-type-dropdown">
                {/* Mobile Dropdown - Hidden, now combined with timeframe */}
                <div className="hidden">
                  <button
                    onClick={() => setIsChartTypeDropdownOpen(!isChartTypeDropdownOpen)}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors min-w-0"
                  >
                    <span>{chartType === 'line' ? 'Line' : chartType === 'bar' ? 'Bar' : 'Area'}</span>
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>
                  
                  {isChartTypeDropdownOpen && (
                    <div className="absolute top-full right-0 mt-1 w-18 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <div className="py-1">
                        {[
                          { value: 'line', label: 'Line' },
                          { value: 'bar', label: 'Bar' },
                          { value: 'area', label: 'Area' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setChartType(option.value as any);
                              setIsChartTypeDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2 py-1 text-xs font-medium hover:bg-gray-50 transition-colors ${
                              chartType === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Large Screen Selector - Show on lg screens */}
                <div className="hidden lg:flex bg-gray-50 rounded-lg p-1 border border-gray-200 shadow-sm">
                <button
                  onClick={() => setChartType('line')}
                    className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    chartType === 'line'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    style={chartType === 'line' ? { 
                      backgroundColor: 'var(--primary-color)',
                      color: '#ffffff'
                    } : {}}
                  >
                    Line
                  </button>
                <button
                  onClick={() => setChartType('bar')}
                    className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    chartType === 'bar'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={chartType === 'bar' ? { 
                    backgroundColor: 'var(--primary-color)',
                    color: '#ffffff'
                  } : {}}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartType('area')}
                    className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    chartType === 'area'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={chartType === 'area' ? { 
                    backgroundColor: 'var(--primary-color)',
                    color: '#ffffff'
                  } : {}}
                >
                  Area
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 lg:px-6 xl:px-8 py-4 xs:py-6 sm:py-8 min-w-0 overflow-x-hidden">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 xl:gap-8 mb-4 xs:mb-6 sm:mb-8 min-w-0">
          <div className="bg-white rounded-xl p-4 xs:p-6 xl:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-lg xs:text-xl sm:text-2xl font-bold text-green-600">
                  {isClient ? formatCurrency(totalIncome) : '$0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {timeframe === 'day' ? (selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate) : 
                   timeframe === 'week' ? 'This week' : 
                   timeframe === 'month' ? 'This month' : 
                   timeframe === 'year' ? 'This year' : 'All time'}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full w-11 h-11 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 xs:p-6 xl:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-lg xs:text-xl sm:text-2xl font-bold text-red-600">
                  {isClient ? formatCurrency(totalExpenses) : '$0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {timeframe === 'day' ? (selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate) : 
                   timeframe === 'week' ? 'This week' : 
                   timeframe === 'month' ? 'This month' : 
                   timeframe === 'year' ? 'This year' : 'All time'}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full w-11 h-11 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 xs:p-6 xl:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-gray-600">Net Profit</p>
                <p className={`text-lg xs:text-xl sm:text-2xl font-bold ${
                  balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {isClient ? formatCurrency(balance) : '$0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {balance > 0 ? 'Positive' : balance < 0 ? 'Negative' : 'Neutral'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full w-11 h-11 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 xs:p-6 xl:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">
                  {transactionCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {timeframe === 'day' ? (selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate) : 
                   timeframe === 'week' ? 'This week' : 
                   timeframe === 'month' ? 'This month' : 
                   timeframe === 'year' ? 'This year' : 'All time'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full w-11 h-11 flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-6 lg:gap-8 xl:gap-12">
          {/* Main Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 xl:p-8 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Revenue & Expenses Trend</h3>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Analytics</span>
                </div>
              </div>

              <div className="h-80 flex justify-center">
                <div className="h-80 w-full max-w-md">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                      <RechartsLineChart data={chartData.length > 0 ? chartData : [{ period: 'No Data', income: 0, expenses: 0, balance: 0, net: 0 }]} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isClient ? chartColors.grid : '#f0f0f0'} />
                        <XAxis 
                          dataKey="period" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#1F2937',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                          }}
                          formatter={(value: number, name: string) => [
                            formatCurrency(value),
                            name === 'income' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Net Profit'
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="income"
                          stroke={isClient ? chartColors.income : '#10B981'}
                          strokeWidth={3}
                          dot={{ 
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
                        />
                        <Line
                          type="monotone"
                          dataKey="expenses"
                          stroke={isClient ? chartColors.expenses : '#EF4444'}
                          strokeWidth={3}
                          dot={{ 
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
                        />
                        <Line
                          type="monotone"
                          dataKey="net"
                          stroke={isClient ? chartColors.balance : '#3B82F6'}
                          strokeWidth={3}
                          dot={{ 
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
                        />
                      </RechartsLineChart>
                    ) : chartType === 'bar' ? (
                      <BarChart data={chartData.length > 0 ? chartData : [{ period: 'No Data', income: 0, expenses: 0, balance: 0, net: 0 }]} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isClient ? chartColors.grid : '#f0f0f0'} />
                        <XAxis 
                          dataKey="period" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#1F2937',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                          }}
                          formatter={(value: number, name: string) => [
                            formatCurrency(value),
                            name === 'income' ? 'Revenue' : 'Expenses'
                          ]}
                        />
                        <Bar dataKey="income" fill={isClient ? chartColors.income : '#10B981'} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" fill={isClient ? chartColors.expenses : '#EF4444'} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <AreaChart data={chartData.length > 0 ? chartData : [{ period: 'No Data', income: 0, expenses: 0, balance: 0, net: 0 }]} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isClient ? chartColors.income : '#10B981'} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={isClient ? chartColors.income : '#10B981'} stopOpacity={0.05}/>
                          </linearGradient>
                          <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isClient ? chartColors.expenses : '#EF4444'} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={isClient ? chartColors.expenses : '#EF4444'} stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isClient ? chartColors.grid : '#f0f0f0'} />
                        <XAxis 
                          dataKey="period" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#1F2937',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                          }}
                          formatter={(value: number, name: string) => [
                            formatCurrency(value),
                            name === 'income' ? 'Revenue' : 'Expenses'
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="income"
                          stackId="1"
                          stroke={isClient ? chartColors.income : '#10B981'}
                          fill="url(#incomeGradient)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="expenses"
                          stackId="2"
                          stroke={isClient ? chartColors.expenses : '#EF4444'}
                          fill="url(#expensesGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Category Breakdown */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
              <div className="h-64 flex justify-center">
                <div className="h-64 w-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData.length > 0 ? pieData : [{ name: 'No Data', value: 0, color: '#E5E7EB' }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#ffffff',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Total']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                {pieData.slice(0, 5).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {isClient ? formatCurrency(item.value) : '$0'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Categories */}
            <div className="bg-white rounded-xl p-6 xl:p-8 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
              <div className="space-y-3">
                {Object.entries(categoryStats)
                  .sort(([_, a], [__, b]) => (b.income + b.expenses) - (a.income + a.expenses))
                  .slice(0, 6)
                  .map(([category, data], index) => {
                    const IconComponent = getCategoryIcon(category);
                    const colorClasses = getCategoryColor(category);
                    
                    return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{category}</p>
                          <p className="text-xs text-gray-500">
                            {data.count} transactions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {isClient ? formatCurrency(Math.abs(data.income - data.expenses)) : '$0'}
                        </p>
                        <div className="flex items-center space-x-2 text-xs">
                          {data.income > 0 && (
                            <span className="text-green-600">+{isClient ? formatCurrency(data.income) : '$0'}</span>
                          )}
                          {data.expenses > 0 && (
                            <span className="text-red-600">-{isClient ? formatCurrency(data.expenses) : '$0'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RevenuePage() {
  return (
    <TransactionProvider>
      <RevenueContent />
    </TransactionProvider>
  );
}
