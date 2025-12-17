import { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AppProvider, useApp } from './context/AppContext';
import AuthPage from './components/AuthPage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Goals from './components/Goals';
import Savings from './components/Savings';
import FirebaseSetupWizard from './components/FirebaseSetupWizard';

// Declare build time constant
declare const __BUILD_TIME__: string;

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#16a34a',
    },
  },
});

// Log build info on app load
if (typeof __BUILD_TIME__ !== 'undefined') {
  console.log('%c🚀 HolidayZ Family Savings Tracker', 'color: #2563eb; font-size: 16px; font-weight: bold;');
  console.log('%c📦 Build Time:', 'color: #16a34a; font-weight: bold;', __BUILD_TIME__);
  console.log('%c💎 UI Framework:', 'color: #9333ea; font-weight: bold;', 'Material-UI (MUI) v7');
}

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
    <>
      <FirebaseSetupWizard />
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
