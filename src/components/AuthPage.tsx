import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Container,
  Alert,
  Chip,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  GetApp as GetAppIcon,
  CheckCircle as CheckCircleIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useThemeMode } from '../context/ThemeContext';

export default function AuthPage() {
  const { state, dispatch } = useApp();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const { isInstallable, isInstalled, handleInstallClick } = usePWAInstall();
  const theme = useTheme();
  const { toggleTheme } = useThemeMode();
  const isDark = theme.palette.mode === 'dark';

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    // Automatically login when user is selected
    const user = state.users.find(u => u.id === userId);
    if (user) {
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
      }}
    >
      {/* Theme Toggle Button */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
        }}
      >
        <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
          <IconButton 
            onClick={toggleTheme}
            sx={{
              bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              color: isDark ? 'white' : 'inherit',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
              },
            }}
          >
            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {/* App Logo/Icon */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
              animation: 'fadeIn 0.6s ease-in',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-20px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Box
              sx={{
                width: { xs: 100, sm: 120 },
                height: { xs: 100, sm: 120 },
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 40px rgba(79, 70, 229, 0.3)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05) rotate(2deg)',
                  boxShadow: '0 15px 50px rgba(79, 70, 229, 0.4)',
                },
              }}
            >
              <img 
                src="/favicon.svg" 
                alt="HolidayZ Logo" 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  padding: '0px',
                }} 
              />
            </Box>
          </Box>

          <Typography 
            variant="h3" 
            component="h1" 
            fontWeight="bold" 
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            HolidayZ
          </Typography>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)',
              fontWeight: 500,
            }}
          >
            Family Savings Tracker
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 2,
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
            }}
          >
            Select your family member profile to continue
          </Typography>

          {/* PWA Install Prompt */}
          {isInstallable && (
            <Alert 
              severity="info" 
              sx={{ 
                mt: 3,
                animation: 'slideDown 0.5s ease-out',
                '@keyframes slideDown': {
                  from: { opacity: 0, transform: 'translateY(-10px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleInstallClick}
                  startIcon={<GetAppIcon />}
                  sx={{ fontWeight: 'bold' }}
                >
                  Install
                </Button>
              }
            >
              Install HolidayZ for quick access from your home screen!
            </Alert>
          )}

          {/* App Installed Badge */}
          {isInstalled && (
            <Chip
              icon={<CheckCircleIcon />}
              label="App Installed"
              color="success"
              sx={{ mt: 2 }}
            />
          )}
        </Box>

        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <FormControl fullWidth>
              <InputLabel id="user-select-label">Choose Family Member</InputLabel>
              <Select
                labelId="user-select-label"
                id="user-select"
                value={selectedUserId}
                label="Choose Family Member"
                onChange={(e) => handleUserSelect(e.target.value)}
              >
                {state.users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Install Button in Card */}
            {isInstallable && (
              <Button
                onClick={handleInstallClick}
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<GetAppIcon />}
                sx={{
                  mt: 3,
                  borderColor: '#4F46E5',
                  color: '#4F46E5',
                  '&:hover': {
                    borderColor: '#7C3AED',
                    backgroundColor: 'rgba(79, 70, 229, 0.04)',
                  },
                }}
              >
                Install App
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Help Text for Installation */}
        {isInstallable && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              display: 'block', 
              textAlign: 'center', 
              mt: 2,
              px: 2,
            }}
          >
            💡 Tip: Install the app for faster access and offline use. 
            Works on phones, tablets, and computers!
          </Typography>
        )}
      </Container>
    </Box>
  );
}
