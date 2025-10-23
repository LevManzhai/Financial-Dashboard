# 💰 Financial Dashboard

A modern, responsive financial dashboard built with Next.js 14, featuring comprehensive transaction management, analytics, and customizable theming.

## 🚀 Live Demo

**👉 [View Live Demo](https://levmanzhai.github.io/Financial-Dashboard)**

## ✨ Features

### 📊 **Dashboard Overview**
- **Real-time Statistics**: Total income, expenses, balance, and transaction counts
- **Interactive Widgets**: Credit cards, wallet balance, payable accounts
- **Quick Actions**: Add transactions, view summaries, manage accounts

### 💳 **Transaction Management**
- **Complete CRUD Operations**: Create, read, update, and delete transactions
- **Advanced Filtering**: Filter by type, category, date range, and amount
- **Smart Search**: Real-time search with suggestions
- **Bulk Operations**: Select and manage multiple transactions
- **Export Functionality**: Download transaction data as CSV

### 📈 **Revenue Analytics**
- **Multiple Chart Types**: Line, bar, and area charts
- **Flexible Timeframes**: Day, week, month, year, and all-time views
- **Interactive Charts**: Hover effects, tooltips, and responsive design
- **Performance Metrics**: Revenue trends, expense analysis, profit calculations

### 🔍 **Search & Filter**
- **Advanced Search**: Full-text search across all transaction data
- **Smart Filters**: Category, type, date range, and amount filters
- **Quick Filters**: Predefined time periods (day, week, month, 6 months, year)
- **Search Suggestions**: Auto-complete and search history

### 🎨 **Customization**
- **Dynamic Theming**: Customizable primary colors
- **Dark/Light Mode**: Automatic theme switching
- **Responsive Design**: Optimized for all screen sizes
- **Personal Preferences**: Save and reset theme settings

### 📱 **Mobile-First Design**
- **Responsive Layout**: Adapts to all screen sizes
- **Touch-Friendly**: Optimized for mobile interactions
- **Progressive Web App**: Fast loading and offline capabilities

## 🛠️ Technologies Used

### **Frontend Framework**
- **Next.js 14**: React framework with App Router
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development

### **Styling & UI**
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons
- **Responsive Design**: Mobile-first approach

### **Data Visualization**
- **Recharts**: Modern charting library
- **Interactive Charts**: Line, bar, and area charts
- **Real-time Updates**: Dynamic data visualization

### **State Management**
- **React Context**: Global state management
- **Custom Hooks**: Reusable state logic
- **Local Storage**: Persistent user preferences

### **Performance Optimizations**
- **Lazy Loading**: Code splitting for faster initial load
- **Memoization**: Optimized re-renders with useMemo and useCallback
- **Skeleton Loading**: Better user experience during loading
- **Preloading**: Critical components preloaded in background


## 🎯 Key Features Breakdown

### **Dashboard Sections**

#### 🏠 **Main Dashboard**
- **Credit Card Widget**: Display card information and balance
- **Wallet Overview**: Total balance and quick stats
- **Payable Accounts**: Track outstanding payments
- **Transaction Summary**: Recent transactions and totals
- **Earnings Goals**: Progress tracking and targets
- **Receipts Management**: Digital receipt storage
- **Monthly Analytics**: Comprehensive financial charts

#### 💰 **Wallet Management**
- **Balance Tracking**: Real-time balance updates
- **Transaction History**: Complete transaction log
- **Analytics**: Spending patterns and trends
- **Time Period Filters**: Day, week, month, year views

#### 📊 **Revenue Analytics**
- **Interactive Charts**: Multiple chart types and timeframes
- **Performance Metrics**: Revenue, expenses, and profit analysis
- **Export Options**: Download charts and data
- **Custom Date Ranges**: Flexible time period selection

#### 🔍 **Search & Filter**
- **Global Search**: Search across all transactions
- **Advanced Filters**: Multiple filter combinations
- **Quick Actions**: Predefined filter sets
- **Export Results**: Download filtered data

#### ⚙️ **Settings & Customization**
- **Theme Customization**: Custom color schemes
- **User Preferences**: Personalized settings
- **Data Management**: Import/export functionality
- **Account Settings**: User profile management

## 🎨 Design System

### **Color Palette**
- **Primary Colors**: Customizable theme colors
- **Semantic Colors**: Success (green), error (red), warning (yellow)
- **Neutral Colors**: Grays for text and backgrounds
- **Accent Colors**: Highlighting and interactive elements

### **Typography**
- **Font Family**: System fonts for optimal performance
- **Font Sizes**: Responsive typography scale
- **Font Weights**: Multiple weights for hierarchy
- **Line Heights**: Optimized for readability

### **Components**
- **Buttons**: Multiple variants and sizes
- **Forms**: Accessible form components
- **Cards**: Consistent card layouts
- **Modals**: Overlay components
- **Navigation**: Responsive navigation patterns

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px - 1440px
- **Large Desktop**: 1440px+

### **Mobile Features**
- **Touch Gestures**: Swipe and tap interactions
- **Mobile Navigation**: Collapsible sidebar
- **Responsive Charts**: Optimized for small screens
- **Touch-Friendly**: Large tap targets

## 🔧 Development

### **Code Structure**
```
src/
├── app/                 # Next.js app directory
│   ├── page.tsx        # Main dashboard
│   ├── wallet/         # Wallet pages
│   ├── transactions/   # Transaction pages
│   ├── revenue/        # Revenue analytics
│   ├── search/         # Search functionality
│   └── settings/       # Settings page
├── components/         # Reusable components
│   ├── Header.tsx     # Navigation header
│   ├── Sidebar.tsx    # Navigation sidebar
│   └── widgets/       # Dashboard widgets
├── contexts/          # React contexts
│   ├── TransactionContext.tsx
│   └── ThemeContext.tsx
└── types/             # TypeScript definitions
```

### **Performance Optimizations**
- **Code Splitting**: Lazy loading of components
- **Memoization**: Optimized re-renders
- **Bundle Analysis**: Optimized bundle size
- **Caching**: Efficient data caching
- **Preloading**: Critical resource preloading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS
- **Recharts** - For the beautiful charts
- **Lucide** - For the icon library
- **React Community** - For the excellent ecosystem

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

---

**Made with ❤️ by the Financial Dashboard Team**