import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ToastContainer } from './components/Toast';

// Modals
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { SetBudgetModal } from './components/modals/SetBudgetModal';
import { AddGoalModal } from './components/modals/AddGoalModal';
import { ContributeGoalModal } from './components/modals/ContributeGoalModal';
import { TransferMoneyModal } from './components/modals/TransferMoneyModal';
import { AddAccountModal } from './components/modals/AddAccountModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { TransactionsPage } from './pages/Transactions';
import { AccountsPage } from './pages/Accounts';
import { BudgetsPage } from './pages/Budgets';
import { SavingsGoalsPage } from './pages/SavingsGoals';
import { SubscriptionsPage } from './pages/Subscriptions';
import { AnalyticsPage } from './pages/Analytics';
import { FinancialToolsPage } from './pages/FinancialTools';
import { NetWorthPage } from './pages/NetWorth';
import { AIAssistantPage } from './pages/AIAssistant';
import { ReportsPage } from './pages/Reports';
import { NotificationsPage } from './pages/Notifications';
import { SettingsPage } from './pages/Settings';
import { SavingsGoal, Transaction } from './data/mockData';
import { LoginView } from './components/LoginView';

// Route Guard for Protected Dashboard and Inner Pages
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useFinance();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Route Guard for Login / Register Pages
const PublicAuthRoute: React.FC<{ initialMode: 'login' | 'register' }> = ({ initialMode }) => {
  const { isAuthenticated } = useFinance();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginView initialMode={initialMode} onSuccess={() => navigate('/dashboard')} />;
};

// Internal Authenticated Application Layout
const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal states
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);

  const [isSetBudgetOpen, setIsSetBudgetOpen] = useState(false);
  const [budgetCategoryToEdit, setBudgetCategoryToEdit] = useState<string | undefined>(undefined);

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isContributeGoalOpen, setIsContributeGoalOpen] = useState(false);
  const [goalToContribute, setGoalToContribute] = useState<SavingsGoal | null>(null);

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  // Handlers
  const handleOpenAddTransaction = () => {
    setTxToEdit(null);
    setIsAddTxOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setTxToEdit(tx);
    setIsAddTxOpen(true);
  };

  const handleOpenSetBudget = (category?: string) => {
    setBudgetCategoryToEdit(category);
    setIsSetBudgetOpen(true);
  };

  const handleOpenContributeGoal = (goal: SavingsGoal) => {
    setGoalToContribute(goal);
    setIsContributeGoalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Fixed/Collapsible Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 transition-all duration-300">
        {/* Topbar */}
        <Topbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAddTransaction={handleOpenAddTransaction}
          onOpenSetBudget={() => handleOpenSetBudget()}
          onOpenAddGoal={() => setIsAddGoalOpen(true)}
          onOpenTransfer={() => setIsTransferOpen(true)}
        />

        {/* Viewport Canvas Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route
              path="dashboard"
              element={
                <Dashboard
                  onOpenAddTransaction={handleOpenAddTransaction}
                  onOpenSetBudget={handleOpenSetBudget}
                  onOpenAddGoal={() => setIsAddGoalOpen(true)}
                  onOpenContributeGoal={handleOpenContributeGoal}
                  onEditTransaction={handleEditTransaction}
                  onOpenTransfer={() => setIsTransferOpen(true)}
                />
              }
            />
            <Route
              path="transactions"
              element={
                <TransactionsPage
                  onOpenAddTransaction={handleOpenAddTransaction}
                  onEditTransaction={handleEditTransaction}
                />
              }
            />
            <Route
              path="accounts"
              element={
                <AccountsPage
                  onOpenAddAccount={() => setIsAddAccountOpen(true)}
                  onOpenTransfer={() => setIsTransferOpen(true)}
                />
              }
            />
            <Route
              path="budgets"
              element={<BudgetsPage onOpenSetBudget={handleOpenSetBudget} />}
            />
            <Route
              path="goals"
              element={
                <SavingsGoalsPage
                  onOpenAddGoal={() => setIsAddGoalOpen(true)}
                  onOpenContributeGoal={handleOpenContributeGoal}
                />
              }
            />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="tools" element={<FinancialToolsPage />} />
            <Route path="calculators" element={<Navigate to="/tools" replace />} />
            <Route path="networth" element={<NetWorthPage />} />
            <Route path="assistant" element={<AIAssistantPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Modals & Dialogs */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => {
          setIsAddTxOpen(false);
          setTxToEdit(null);
        }}
        transactionToEdit={txToEdit}
      />

      <SetBudgetModal
        isOpen={isSetBudgetOpen}
        onClose={() => setIsSetBudgetOpen(false)}
        defaultCategory={budgetCategoryToEdit}
      />

      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
      />

      <ContributeGoalModal
        isOpen={isContributeGoalOpen}
        onClose={() => {
          setIsContributeGoalOpen(false);
          setGoalToContribute(null);
        }}
        goal={goalToContribute}
      />

      <TransferMoneyModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
      />

      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing / Cover Page at Root */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/cover" element={<LandingPage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<PublicAuthRoute initialMode="login" />} />
          <Route path="/register" element={<PublicAuthRoute initialMode="register" />} />

          {/* Authenticated Application Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          />
        </Routes>

        {/* Global Toast notifications */}
        <ToastContainer />
      </BrowserRouter>
    </FinanceProvider>
  );
}
