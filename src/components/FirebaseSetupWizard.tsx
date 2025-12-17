import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  AlertTitle,
  Box,
  Typography,
  Link,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Cloud as CloudIcon,
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { checkFirebaseConnection } from '../firebase/connectionCheck';

export default function FirebaseSetupWizard() {
  const [open, setOpen] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setChecking(true);
    const result = await checkFirebaseConnection();
    
    if (!result.isConnected) {
      setNeedsSetup(result.needsSetup);
      setError(result.error || 'Unknown error');
      setOpen(true);
    }
    
    setChecking(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (checking) {
    return null;
  }

  const steps = [
    'Create Firebase Project',
    'Enable Firestore',
    'Configure App',
    'Test Connection'
  ];

  return (
    <Dialog 
      open={open} 
      onClose={() => setOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CloudIcon color="primary" />
        Firebase Setup Required
        <IconButton
          sx={{ ml: 'auto' }}
          onClick={() => setOpen(false)}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Cross-Device Sync Not Configured</AlertTitle>
          {error}
        </Alert>

        {needsSetup ? (
          <>
            <Typography variant="body1" gutterBottom>
              To enable cross-device synchronization, you need to set up Firebase Firestore. This takes about 10 minutes.
            </Typography>

            <Box sx={{ my: 3 }}>
              <Stepper activeStep={-1} orientation="vertical">
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                📖 Quick Setup Guide
              </Typography>
              <Typography variant="body2" paragraph>
                Follow the step-by-step instructions in <code>FIREBASE_QUICKSTART.md</code>
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Show'} Quick Instructions
              </Button>
            </Paper>

            <Collapse in={showDetails}>
              <Paper sx={{ p: 2, bgcolor: 'info.50', border: 1, borderColor: 'info.main' }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  Quick Setup Steps:
                </Typography>
                <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  <li>
                    <Typography variant="body2">
                      Create Firebase project:{' '}
                      <Link href="https://console.firebase.google.com/" target="_blank" rel="noopener">
                        Firebase Console
                      </Link>
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Enable Firestore Database (production mode)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Set security rules (see FIREBASE_QUICKSTART.md)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Get Firebase config (Project Settings → Your apps → Web)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', bgcolor: 'grey.100', p: 1, borderRadius: 1, mt: 1 }}>
                      cp .env.example .env.local
                      <IconButton 
                        size="small" 
                        sx={{ ml: 1 }}
                        onClick={() => copyToClipboard('cp .env.example .env.local')}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Then edit <code>.env.local</code> with your Firebase credentials
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Restart dev server: <code>npm run dev</code>
                    </Typography>
                  </li>
                </ol>
              </Paper>
            </Collapse>

            <Alert severity="info" sx={{ mt: 2 }}>
              <AlertTitle>Why Firebase?</AlertTitle>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                <li>✅ All devices see the same data</li>
                <li>✅ Real-time synchronization</li>
                <li>✅ Cloud backup (never lose data)</li>
                <li>✅ Free forever (for your usage)</li>
              </ul>
            </Alert>
          </>
        ) : (
          <Alert severity="error">
            <AlertTitle>Connection Error</AlertTitle>
            <Typography variant="body2" paragraph>
              {error}
            </Typography>
            <Typography variant="body2">
              Check the browser console for more details, or see <code>FIREBASE_SETUP.md</code> for troubleshooting.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setOpen(false)}>
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          href="https://console.firebase.google.com/"
          target="_blank"
          rel="noopener"
        >
          Open Firebase Console
        </Button>
        <Button
          variant="outlined"
          onClick={checkConnection}
        >
          Retry Connection
        </Button>
      </DialogActions>
    </Dialog>
  );
}
