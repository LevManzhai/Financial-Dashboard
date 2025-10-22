'use client';

import React from 'react';
import { Filter, X, Calendar, Tag, ArrowUpDown } from 'lucide-react';
import { FilterOptions } from '@/types/financial';

interface TransactionFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: Partial<FilterOptions>) => void;
  onClearFilters: () => void;
}

const categories = [
  'Food',
  'Transport', 
  'Entertainment',
  'Shopping',
  'Health',
  'Education',
  'Utilities',
  'Salary',
  'Freelance',
  'Investments',
  'Other'
];

export default function TransactionFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: TransactionFiltersProps) {
  // Add safety check for filters
  const safeFilters = filters || { type: 'all', category: '', dateFrom: '', dateTo: '' };
  
  const hasActiveFilters = 
    safeFilters.category || 
    safeFilters.type !== 'all' || 
    safeFilters.dateFrom || 
    safeFilters.dateTo;

  return (
    <div className="bg-white rounded-xl p-3 xs:p-4 shadow-sm border border-gray-200 mb-4 min-w-0 overflow-x-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 min-w-0">
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Type
          </label>
          <select
            value={safeFilters.type}
            onChange={(e) => onFiltersChange({ type: e.target.value as 'income' | 'expense' | 'all' })}
            className="w-full p-1.5 xs:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm min-w-0"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Category
          </label>
          <select
            value={safeFilters.category || ''}
            onChange={(e) => onFiltersChange({ category: e.target.value || undefined })}
            className="w-full p-1.5 xs:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm min-w-0"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            From Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={safeFilters.dateFrom || ''}
              onChange={(e) => onFiltersChange({ dateFrom: e.target.value || undefined })}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            To Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={safeFilters.dateTo || ''}
              onChange={(e) => onFiltersChange({ dateTo: e.target.value || undefined })}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <ArrowUpDown className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Sorting:</span>
          </div>
          
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 min-w-0 flex-1">
            <select
              value={safeFilters.sortBy}
              onChange={(e) => onFiltersChange({ sortBy: e.target.value as 'date' | 'amount' | 'category' })}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm min-w-0 flex-1"
            >
              <option value="date">By Date</option>
              <option value="amount">By Amount</option>
              <option value="category">By Category</option>
            </select>

            <select
              value={safeFilters.sortOrder}
              onChange={(e) => onFiltersChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm min-w-0 flex-1"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Period Filters */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">Quick Filters:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onClearFilters()}
            className="px-3 py-1 text-xs bg-gray-50 text-gray-900 rounded-full hover:bg-gray-100 transition-colors font-medium"
          >
            All Time
          </button>
          <button
            onClick={() => {
              const today = new Date();
              onFiltersChange({
                dateFrom: today.toISOString().split('T')[0],
                dateTo: today.toISOString().split('T')[0]
              });
            }}
            className="px-3 py-1 text-xs bg-blue-50 text-blue-900 rounded-full hover:bg-blue-100 transition-colors font-medium"
          >
            Day
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000); // 7 days including today
              onFiltersChange({
                dateFrom: weekAgo.toISOString().split('T')[0],
                dateTo: today.toISOString().split('T')[0]
              });
            }}
            className="px-3 py-1 text-xs bg-blue-50 text-blue-900 rounded-full hover:bg-blue-100 transition-colors font-medium"
          >
            Week
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
              onFiltersChange({
                dateFrom: monthStart.toISOString().split('T')[0],
                dateTo: today.toISOString().split('T')[0]
              });
            }}
            className="px-3 py-1 text-xs bg-blue-50 text-blue-900 rounded-full hover:bg-blue-100 transition-colors font-medium"
          >
            Month
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
              onFiltersChange({
                dateFrom: sixMonthsAgo.toISOString().split('T')[0],
                dateTo: today.toISOString().split('T')[0]
              });
            }}
            className="px-3 py-1 text-xs bg-blue-50 text-blue-900 rounded-full hover:bg-blue-100 transition-colors font-medium"
          >
            6 Months
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const yearStart = new Date(2025, 0, 1); // 2025 year for mock data
              onFiltersChange({
                dateFrom: yearStart.toISOString().split('T')[0],
                dateTo: today.toISOString().split('T')[0]
              });
            }}
            className="px-3 py-1 text-xs bg-blue-50 text-blue-900 rounded-full hover:bg-blue-100 transition-colors font-medium"
          >
            Year
          </button>
        </div>
      </div>
    </div>
  );
}
