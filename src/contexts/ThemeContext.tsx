'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ChartColors {
  income: string;
  expenses: string;
  balance: string;
  background: string;
  grid: string;
  text: string;
}

interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
}

interface ThemeContextType {
  chartColors: ChartColors;
  themeSettings: ThemeSettings;
  isDark: boolean;
  updateChartColors: (colors: Partial<ChartColors>) => void;
  updateThemeSettings: (settings: Partial<ThemeSettings>) => void;
  resetSettings: () => void;
}

const defaultChartColors: ChartColors = {
  income: '#10B981',
  expenses: '#EF4444',
  balance: '#3B82F6',
  background: '#FFFFFF',
  grid: '#F3F4F6',
  text: '#1F2937'
};

const defaultThemeSettings: ThemeSettings = {
  mode: 'system',
  primaryColor: '#3B82F6'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [chartColors, setChartColors] = useState<ChartColors>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chart-colors');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Error parsing chart colors:', error);
          return defaultChartColors;
        }
      }
    }
    return defaultChartColors;
  });
  
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme-settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Error parsing theme settings:', error);
          return defaultThemeSettings;
        }
      }
    }
    return defaultThemeSettings;
  });
  
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme-settings');
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          return settings.mode === 'dark' || 
            (settings.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        } catch (error) {
          console.error('Error parsing theme settings:', error);
          return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
      }
      // Default to system preference if no saved theme
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  const [isClient, setIsClient] = useState(() => typeof window !== 'undefined');

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Apply theme immediately on initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Determine dark theme
    const shouldBeDark = themeSettings.mode === 'dark' || 
      (themeSettings.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDark(shouldBeDark);
    
    // Apply dark class and CSS variables
    const root = document.documentElement;
    
    if (shouldBeDark) {
      root.classList.add('dark');
      root.style.setProperty('--bg-primary', '#1F2937');
      root.style.setProperty('--bg-secondary', '#374151');
      root.style.setProperty('--bg-tertiary', '#4B5563');
      root.style.setProperty('--text-primary', '#F9FAFB');
      root.style.setProperty('--text-secondary', '#D1D5DB');
      root.style.setProperty('--text-tertiary', '#9CA3AF');
      root.style.setProperty('--border-color', '#374151');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--bg-primary', '#FFFFFF');
      root.style.setProperty('--bg-secondary', '#F9FAFB');
      root.style.setProperty('--bg-tertiary', '#F3F4F6');
      root.style.setProperty('--text-primary', '#1F2937');
      root.style.setProperty('--text-secondary', '#6B7280');
      root.style.setProperty('--text-tertiary', '#9CA3AF');
      root.style.setProperty('--border-color', '#E5E7EB');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
    }

    // Apply chart colors
    root.style.setProperty('--chart-income', chartColors.income);
    root.style.setProperty('--chart-expenses', chartColors.expenses);
    root.style.setProperty('--chart-balance', chartColors.balance);
    root.style.setProperty('--chart-background', chartColors.background);
    root.style.setProperty('--chart-grid', chartColors.grid);
    root.style.setProperty('--chart-text', chartColors.text);
    root.style.setProperty('--primary-color', themeSettings.primaryColor);
    
    // Add primary color with 10% opacity
    const hex = themeSettings.primaryColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    root.style.setProperty('--primary-color-10', `rgba(${r}, ${g}, ${b}, 0.1)`);

    // Add loaded class
    setTimeout(() => {
      document.documentElement.classList.add('loaded');
    }, 100);

  }, [chartColors, themeSettings]);

  // Update theme when settings change
  useEffect(() => {
    if (!isClient) return;

    // Determine dark theme
    const shouldBeDark = themeSettings.mode === 'dark' || 
      (themeSettings.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDark(shouldBeDark);

    // Apply dark class and CSS variables
    const root = document.documentElement;
    
    if (shouldBeDark) {
      root.classList.add('dark');
      root.style.setProperty('--bg-primary', '#1F2937');
      root.style.setProperty('--bg-secondary', '#374151');
      root.style.setProperty('--bg-tertiary', '#4B5563');
      root.style.setProperty('--text-primary', '#F9FAFB');
      root.style.setProperty('--text-secondary', '#D1D5DB');
      root.style.setProperty('--text-tertiary', '#9CA3AF');
      root.style.setProperty('--border-color', '#374151');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--bg-primary', '#FFFFFF');
      root.style.setProperty('--bg-secondary', '#F9FAFB');
      root.style.setProperty('--bg-tertiary', '#F3F4F6');
      root.style.setProperty('--text-primary', '#1F2937');
      root.style.setProperty('--text-secondary', '#6B7280');
      root.style.setProperty('--text-tertiary', '#9CA3AF');
      root.style.setProperty('--border-color', '#E5E7EB');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
    }

    // Apply chart colors
    root.style.setProperty('--chart-income', chartColors.income);
    root.style.setProperty('--chart-expenses', chartColors.expenses);
    root.style.setProperty('--chart-balance', chartColors.balance);
    root.style.setProperty('--chart-background', chartColors.background);
    root.style.setProperty('--chart-grid', chartColors.grid);
    root.style.setProperty('--chart-text', chartColors.text);
    root.style.setProperty('--primary-color', themeSettings.primaryColor);
    
    // Add primary color with 10% opacity
    const hex = themeSettings.primaryColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    root.style.setProperty('--primary-color-10', `rgba(${r}, ${g}, ${b}, 0.1)`);

  }, [chartColors, themeSettings, isClient]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateChartColors = (colors: Partial<ChartColors>) => {
    const newColors = { ...chartColors, ...colors };
    setChartColors(newColors);
    localStorage.setItem('chart-colors', JSON.stringify(newColors));
  };

  const updateThemeSettings = (settings: Partial<ThemeSettings>) => {
    const newSettings = { ...themeSettings, ...settings };
    setThemeSettings(newSettings);
    localStorage.setItem('theme-settings', JSON.stringify(newSettings));
  };

  const resetSettings = () => {
    setChartColors(defaultChartColors);
    setThemeSettings(defaultThemeSettings);
    localStorage.removeItem('chart-colors');
    localStorage.removeItem('theme-settings');
  };

  return (
    <ThemeContext.Provider value={{
      chartColors,
      themeSettings,
      isDark,
      updateChartColors,
      updateThemeSettings,
      resetSettings
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
