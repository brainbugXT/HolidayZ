import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeModeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import AuthPage from './components/AuthPage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Goals from './components/Goals';
import Savings from './components/Savings';
import GoalHealthDashboard from './components/GoalHealthDashboard';
import FirebaseSetupWizard from './components/FirebaseSetupWizard';
import QuickAddButton from './components/QuickAddButton';
import { envDebug } from './debug-env';

// Declare build time constant
declare const __BUILD_TIME__: string;

// Log build info on app load
if (typeof __BUILD_TIME__ !== 'undefined') {
  console.log('%c🚀 HolidayZ Family Savings Tracker', 'color: #2563eb; font-size: 16px; font-weight: bold;');
  console.log('%c📦 Build Time:', 'color: #16a34a; font-weight: bold;', __BUILD_TIME__);
  console.log('%c💎 UI Framework:', 'color: #9333ea; font-weight: bold;', 'Material-UI (MUI) v7');
  console.log('%c🔍 Firebase Config:', 'color: #f59e0b; font-weight: bold;', envDebug);
}

function AppContent() {
  const { state } = useApp();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'goals' | 'savings' | 'health'>('dashboard');

  if (!state.currentUser) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'goals':
        return <Goals />;
      case 'savings':
        return <Savings />;
      case 'health':
        return <GoalHealthDashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <FirebaseSetupWizard />
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
      <QuickAddButton />
    </>
  );
}

function App() {
  return (
    <ThemeModeProvider>
      <ToastProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ToastProvider>
    </ThemeModeProvider>
  );
}

export default App;
