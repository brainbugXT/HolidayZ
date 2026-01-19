import type { ReactNode } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Tabs,
  Tab,
  Avatar,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Home as HomeIcon,
  BarChart as ChartBarIcon,
  AccountBalance as CurrencyDollarIcon,
  Logout as LogoutIcon,
  AccountCircle as UserCircleIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import { useThemeMode } from '../context/ThemeContext';

interface LayoutProps {
  children: ReactNode;
  currentPage: 'dashboard' | 'goals' | 'savings';
  onNavigate: (page: 'dashboard' | 'goals' | 'savings') => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { state, dispatch } = useApp();
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
  };

  const navigation = [
    { name: 'Dashboard', page: 'dashboard' as const, icon: <HomeIcon /> },
    { name: 'Savings Goals', page: 'goals' as const, icon: <ChartBarIcon /> },
    { name: 'My Savings', page: 'savings' as const, icon: <CurrencyDollarIcon /> },
  ];

  const currentTabIndex = navigation.findIndex(item => item.page === currentPage);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="h1" color="primary" fontWeight="bold" sx={{ mr: 4 }}>
            HolidayZ
          </Typography>

          {!isMobile && (
            <Tabs
              value={currentTabIndex}
              onChange={(_, newValue) => onNavigate(navigation[newValue].page)}
              sx={{ flexGrow: 1 }}
            >
              {navigation.map((item) => (
                <Tab
                  key={item.name}
                  label={item.name}
                  icon={item.icon}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          )}

          <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Dark Mode Toggle */}
            <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.400' }}>
                <UserCircleIcon />
              </Avatar>
              {!isMobile && (
                <Typography variant="body2" color="text.secondary">
                  {state.currentUser?.name}
                </Typography>
              )}
            </Box>
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              color="inherit"
              size={isMobile ? 'small' : 'medium'}
            >
              {!isMobile && 'Logout'}
            </Button>
          </Box>
        </Toolbar>

        {/* Mobile navigation */}
        {isMobile && (
          <Tabs
            value={currentTabIndex}
            onChange={(_, newValue) => onNavigate(navigation[newValue].page)}
            variant="fullWidth"
          >
            {navigation.map((item) => (
              <Tab
                key={item.name}
                icon={item.icon}
                aria-label={item.name}
              />
            ))}
          </Tabs>
        )}
      </AppBar>

      {/* Main content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
