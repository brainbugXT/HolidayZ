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
} from '@mui/material';
import { useApp } from '../context/AppContext';

export default function AuthPage() {
  const { state, dispatch } = useApp();
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const handleLogin = () => {
    const user = state.users.find(u => u.id === selectedUserId);
    if (user) {
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
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
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Family Savings Tracker
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Select your family member profile to continue
          </Typography>
        </Box>

        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="user-select-label">Choose Family Member</InputLabel>
              <Select
                labelId="user-select-label"
                id="user-select"
                value={selectedUserId}
                label="Choose Family Member"
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                {state.users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              onClick={handleLogin}
              disabled={!selectedUserId}
              variant="contained"
              fullWidth
              size="large"
            >
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
