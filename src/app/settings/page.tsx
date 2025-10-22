'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TransactionProvider } from '@/contexts/TransactionContext';
import { useTheme } from '@/contexts/ThemeContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Settings, Palette, Moon, Sun, Monitor, Save, RotateCcw, Eye, BarChart3, PieChart, TrendingUp, TrendingDown, DollarSign, Calendar, Tag, ArrowDownLeft, Check } from 'lucide-react';

function SettingsContent() {
  const router = useRouter();
  const { chartColors, themeSettings, updateChartColors, updateThemeSettings, resetSettings } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const colorPresets = [
    {
      name: 'Default',
      colors: {
        income: '#10B981',
        expenses: '#EF4444',
        balance: '#3B82F6',
        background: '#FFFFFF',
        grid: '#F3F4F6',
        text: '#1F2937'
      }
    },
    {
      name: 'Ocean',
      colors: {
        income: '#06B6D4',
        expenses: '#EF4444',
        balance: '#0EA5E9',
        background: '#F0F9FF',
        grid: '#E0F2FE',
        text: '#0C4A6E'
      }
    },
    {
      name: 'Forest',
      colors: {
        income: '#059669',
        expenses: '#DC2626',
        balance: '#16A34A',
        background: '#F0FDF4',
        grid: '#DCFCE7',
        text: '#14532D'
      }
    },
    {
      name: 'Sunset',
      colors: {
        income: '#F59E0B',
        expenses: '#EF4444',
        balance: '#F97316',
        background: '#FFFBEB',
        grid: '#FEF3C7',
        text: '#92400E'
      }
    },
    {
      name: 'Purple',
      colors: {
        income: '#8B5CF6',
        expenses: '#EC4899',
        balance: '#7C3AED',
        background: '#FAF5FF',
        grid: '#F3E8FF',
        text: '#581C87'
      }
    },
    {
      name: 'Dark',
      colors: {
        income: '#10B981',
        expenses: '#EF4444',
        balance: '#3B82F6',
        background: '#1F2937',
        grid: '#374151',
        text: '#F9FAFB'
      }
    }
  ];

  const themePresets = [
    { name: 'Light', mode: 'light' as const, icon: Sun },
    { name: 'Dark', mode: 'dark' as const, icon: Moon },
    { name: 'System', mode: 'system' as const, icon: Monitor }
  ];

  const primaryColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];


  useEffect(() => {
    setIsClient(true);
    
    // Determine current selected preset on load
    const currentPreset = colorPresets.find(preset => 
      preset.colors.income === chartColors.income &&
      preset.colors.expenses === chartColors.expenses &&
      preset.colors.balance === chartColors.balance &&
      preset.colors.background === chartColors.background &&
      preset.colors.grid === chartColors.grid &&
      preset.colors.text === chartColors.text
    );
    
    if (currentPreset) {
      setSelectedPreset(currentPreset.name);
    }
  }, [chartColors]);


  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetSettings = () => {
    resetSettings();
    setSelectedPreset('Default'); // Set Default on reset
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    updateChartColors(preset.colors);
    setSelectedPreset(preset.name);
  };

  const updateChartColor = (key: keyof typeof chartColors, color: string) => {
    updateChartColors({ [key]: color });
    setSelectedPreset(null); // Reset selected preset when changing custom colors
  };

  const updateThemeSetting = (key: keyof typeof themeSettings, value: string) => {
    updateThemeSettings({ [key]: value });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-12 xs:h-14 sm:h-16 min-w-0">
            <div className="flex items-center space-x-1 xs:space-x-2 min-w-0 flex-1">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Navigation Menu */}
              <div className="flex items-center space-x-1 xs:space-x-2">
                <button
                  onClick={() => router.back()}
                  className="flex items-center space-x-1 xs:space-x-2 px-1.5 xs:px-2 py-1 xs:py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowDownLeft className="w-3 h-3 xs:w-4 xs:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden xs:inline">Back</span>
                </button>
                <div className="h-4 w-px bg-gray-300 hidden xs:block"></div>
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center space-x-1 xs:space-x-2 px-1.5 xs:px-2 py-1 xs:py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <DollarSign className="w-3 h-3 xs:w-4 xs:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden xs:inline">Dashboard</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2 xs:space-x-3 min-w-0">
                <div className="p-2 xs:p-3 rounded-lg flex-shrink-0 flex items-center justify-center bg-primary-light">
                  <Settings className="w-5 h-5 xs:w-6 xs:h-6 text-primary" />
                </div>
                <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 truncate">Settings</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 xs:space-x-2 flex-shrink-0">
              <button
                onClick={handleResetSettings}
                className="flex items-center px-2 xs:px-3 py-1.5 xs:py-2 lg:px-3 lg:py-2 text-white rounded-lg transition-colors text-xs xs:text-sm lg:text-sm"
                style={{ 
                  backgroundColor: 'var(--primary-color)',
                  color: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <RotateCcw className="w-3 h-3 xs:w-4 xs:h-4 lg:w-5 lg:h-5" />
                <span className="hidden xs:inline">Reset</span>
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex items-center px-2 xs:px-3 py-1.5 xs:py-2 lg:px-3 lg:py-2 text-white rounded-lg transition-colors text-xs xs:text-sm lg:text-sm"
                style={{ 
                  backgroundColor: 'var(--primary-color)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Save className="w-3 h-3 xs:w-4 xs:h-4 lg:w-5 lg:h-5" />
                <span className="hidden xs:inline">{saved ? 'Saved!' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart Colors */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-6">
              <Palette className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chart Colors
              </h3>
            </div>

            {/* Color Presets */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">
                Color Presets
              </h4>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyColorPreset(preset)}
                    className={`p-2 xs:p-3 border rounded-lg transition-colors text-left h-14 xs:h-16 flex flex-col justify-center ${
                      selectedPreset === preset.name
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1 xs:space-x-2">
                        <div className="w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full" style={{ backgroundColor: preset.colors.income }}></div>
                        <div className="w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full" style={{ backgroundColor: preset.colors.expenses }}></div>
                        <div className="w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full" style={{ backgroundColor: preset.colors.balance }}></div>
                      </div>
                      {selectedPreset === preset.name && (
                        <Check className="w-3 h-3 xs:w-4 xs:h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <p className="text-xs xs:text-sm font-medium text-gray-900 dark:text-white">
                      {preset.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Custom Colors
              </h4>
              
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                <div>
                  <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-2">Income Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={chartColors.income}
                      onChange={(e) => updateChartColor('income', e.target.value)}
                      className="w-6 h-6 xs:w-8 xs:h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-xs xs:text-sm text-gray-600">{isClient ? chartColors.income : '#10B981'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-2">Expenses Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={chartColors.expenses}
                      onChange={(e) => updateChartColor('expenses', e.target.value)}
                      className="w-6 h-6 xs:w-8 xs:h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-xs xs:text-sm text-gray-600">{isClient ? chartColors.expenses : '#EF4444'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-2">Balance Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={chartColors.balance}
                      onChange={(e) => updateChartColor('balance', e.target.value)}
                      className="w-6 h-6 xs:w-8 xs:h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-xs xs:text-sm text-gray-600">{isClient ? chartColors.balance : '#3B82F6'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-2">Background Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={chartColors.background}
                      onChange={(e) => updateChartColor('background', e.target.value)}
                      className="w-6 h-6 xs:w-8 xs:h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-xs xs:text-sm text-gray-600">{isClient ? chartColors.background : '#FFFFFF'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-6">
              <Eye className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Theme Settings</h3>
            </div>

            {/* Theme Mode */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Theme Mode</h4>
              <div className="grid grid-cols-3 gap-3">
                {themePresets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => updateThemeSetting('mode', preset.mode)}
                      className={`p-3 border rounded-lg transition-colors ${
                        isClient && themeSettings.mode === preset.mode
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-2" />
                      <p className="text-sm font-medium">{preset.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Color */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Primary Color</h4>
              <div className="flex flex-wrap gap-2">
                {primaryColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateThemeSetting('primaryColor', color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      isClient && themeSettings.primaryColor === color
                        ? 'border-gray-900 scale-110'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="color"
                  value={isClient ? themeSettings.primaryColor : '#3B82F6'}
                  onChange={(e) => updateThemeSetting('primaryColor', e.target.value)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{isClient ? themeSettings.primaryColor : '#3B82F6'}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sample Chart Colors */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Chart Colors Preview</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Income</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">+$2,500</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Expenses</span>
                  </div>
                  <span className="text-sm font-semibold text-red-600">-$1,200</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Balance</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">+$1,300</span>
                </div>
              </div>
            </div>

            {/* Sample Theme Colors */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Theme Colors Preview</h4>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-blue-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Primary Button</span>
                  </div>
                  <button className="px-4 py-2 rounded text-white text-sm font-medium bg-blue-500 hover:bg-blue-600">
                    Click Me
                  </button>
                </div>
              </div>
            </div>

            {/* Theme Mode Preview */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Theme Mode Preview</h4>
              <div className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  {isClient && themeSettings.mode === 'light' && <Sun className="w-4 h-4 text-yellow-500" />}
                  {isClient && themeSettings.mode === 'dark' && <Moon className="w-4 h-4 text-blue-500" />}
                  {isClient && themeSettings.mode === 'system' && <Monitor className="w-4 h-4 text-gray-500" />}
                  {!isClient && <Monitor className="w-4 h-4 text-gray-500" />}
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {isClient ? themeSettings.mode : 'system'} Mode
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {isClient ? (
                    themeSettings.mode === 'system' 
                      ? 'Follows your system preference'
                      : `Uses ${themeSettings.mode} theme`
                  ) : (
                    'Follows your system preference'
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <TransactionProvider>
      <SettingsContent />
    </TransactionProvider>
  );
}
