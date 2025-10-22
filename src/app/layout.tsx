import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Financial Dashboard",
  description: "Personal finance management dashboard with income, expenses, and savings goals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme-settings');
                  let shouldBeDark = false;
                  
                  if (savedTheme) {
                    const settings = JSON.parse(savedTheme);
                    shouldBeDark = settings.mode === 'dark' || 
                      (settings.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  } else {
                    // Default to system preference if no saved theme
                    shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  }
                  
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  // Set default values
                  document.documentElement.style.setProperty('--chart-income', '#8B5CF6');
                  document.documentElement.style.setProperty('--chart-expenses', '#EC4899');
                  document.documentElement.style.setProperty('--chart-balance', '#7C3AED');
                  document.documentElement.style.setProperty('--chart-background', '#1F2937');
                  document.documentElement.style.setProperty('--chart-grid', '#374151');
                  document.documentElement.style.setProperty('--chart-text', '#F9FAFB');
                  document.documentElement.style.setProperty('--primary-color', '#3B82F6');
                  document.documentElement.style.setProperty('--accent-color', '#8B5CF6');
                  
                  // Override with saved colors if available
                  const savedColors = localStorage.getItem('chart-colors');
                  if (savedColors) {
                    const colors = JSON.parse(savedColors);
                    document.documentElement.style.setProperty('--chart-income', colors.income);
                    document.documentElement.style.setProperty('--chart-expenses', colors.expenses);
                    document.documentElement.style.setProperty('--chart-balance', colors.balance);
                    document.documentElement.style.setProperty('--chart-background', colors.background);
                    document.documentElement.style.setProperty('--chart-grid', colors.grid);
                    document.documentElement.style.setProperty('--chart-text', colors.text);
                  }
                  
                  // Override with saved theme if available
                  if (savedTheme) {
                    const settings = JSON.parse(savedTheme);
                    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
                    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
                  }
                  
                  // Add loaded class after theme is set
                  setTimeout(() => {
                    document.documentElement.classList.add('loaded');
                  }, 100);
                  
                  // Also add loaded class when page is fully loaded
                  if (document.readyState === 'complete') {
                    document.documentElement.classList.add('loaded');
                  } else {
                    window.addEventListener('load', () => {
                      document.documentElement.classList.add('loaded');
                    });
                  }
                } catch (e) {
                  // Ignore errors
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider>
            <TransactionProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </TransactionProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
