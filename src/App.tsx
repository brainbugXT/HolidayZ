import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AuthPage from './components/AuthPage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Goals from './components/Goals';
import Savings from './components/Savings';

function AppContent() {
  const { state } = useApp();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'goals' | 'savings'>('dashboard');

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
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
