'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Load notifications from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        // Convert timestamp strings back to Date objects
        const notificationsWithDates = parsed.map((notif: any) => ({
          ...notif,
          timestamp: new Date(notif.timestamp)
        }));
        setNotifications(notificationsWithDates);
      } catch (error) {
        console.error('Error loading notifications from localStorage:', error);
      }
    } else {
      // Add some sample notifications on first visit
      const sampleNotifications: Notification[] = [
        {
          id: 'welcome-1',
          type: 'success',
          title: 'Welcome to Financial Dashboard!',
          message: 'Your financial dashboard is ready to use. Start by adding your first transaction.',
          timestamp: new Date(),
          read: false,
        },
        {
          id: 'welcome-2',
          type: 'info',
          title: 'Quick Tip',
          message: 'Use the search feature to quickly find specific transactions.',
          timestamp: new Date(Date.now() - 60000), // 1 minute ago
          read: false,
        },
        {
          id: 'welcome-3',
          type: 'info',
          title: 'Analytics Available',
          message: 'Check the Revenue page to see detailed analytics and charts.',
          timestamp: new Date(Date.now() - 120000), // 2 minutes ago
          read: true,
        }
      ];
      setNotifications(sampleNotifications);
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications, isClient]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
