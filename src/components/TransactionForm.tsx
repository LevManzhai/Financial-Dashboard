'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Edit } from 'lucide-react';
import { TransactionFormData, Transaction } from '@/types/financial';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: TransactionFormData) => void;
  editingTransaction?: Transaction | null;
  title?: string;
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

export default function TransactionForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingTransaction,
  title = 'Add Transaction'
}: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    category: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'expense'
  });

  const [errors, setErrors] = useState<Partial<TransactionFormData>>({});

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        category: editingTransaction.category,
        description: editingTransaction.description,
        amount: editingTransaction.amount,
        date: editingTransaction.date,
        type: editingTransaction.type
      });
    } else {
      setFormData({
        category: '',
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
      });
    }
    setErrors({});
  }, [editingTransaction, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<TransactionFormData> = {};

    if (!formData.category.trim()) {
      newErrors.category = 'Select category';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Enter description';
    }
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.date) {
      newErrors.date = 'Select date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof TransactionFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {editingTransaction ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Transaction Type
          </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleInputChange('type', 'expense')}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  formData.type === 'expense'
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('type', 'income')}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  formData.type === 'income'
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                errors.category ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter transaction description"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`w-full pl-8 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                errors.date ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                formData.type === 'income'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {editingTransaction ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
