import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { ReportsView } from './components/ReportsView';
import { BudgetsView } from './components/BudgetsView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { LoginView } from './components/LoginView';

const MainContent: React.FC = () => {
  const { activeTab } = useFinance();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-on-surface-variant font-mono animate-pulse">กำลังตรวจสอบสิทธิ์ผู้ใช้งาน...</p>
      </div>
    );
  }

  // If user is not signed in with Google, render the LoginView gate
  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body selection:bg-primary/30 selection:text-primary-fixed">
      {/* Top Fixed Header with Google Account Info */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 pt-16">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'transactions' && <TransactionsView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'budgets' && <BudgetsView />}
      </main>

      {/* Global Transaction Modal */}
      <AddTransactionModal />

      {/* Persistent Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <MainContent />
      </FinanceProvider>
    </AuthProvider>
  );
}
