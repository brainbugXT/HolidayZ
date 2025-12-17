import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Alert } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { migrateLocalStorageToFirestore } from '../firebase/firestore';

export default function MigrationHelper() {
  const [open, setOpen] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Check if there's localStorage data to migrate
  const hasLocalData = () => {
    const savedData = localStorage.getItem('holidayz-data');
    if (!savedData) return false;
    
    try {
      const data = JSON.parse(savedData);
      return (data.goals && data.goals.length > 0) || (data.entries && data.entries.length > 0);
    } catch {
      return false;
    }
  };

  const handleMigrate = async () => {
    setMigrating(true);
    setResult(null);

    try {
      await migrateLocalStorageToFirestore();
      setResult({
        success: true,
        message: '✅ Migration completed successfully! Your data is now in Firestore and will sync across all devices.'
      });
      
      // Wait 2 seconds then close
      setTimeout(() => {
        setOpen(false);
        setResult(null);
      }, 3000);
    } catch (error) {
      console.error('Migration error:', error);
      setResult({
        success: false,
        message: `❌ Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setMigrating(false);
    }
  };

  // Don't show the button if there's no local data
  if (!hasLocalData()) {
    return null;
  }

  return (
    <>
      <Button
        variant="outlined"
        color="info"
        startIcon={<CloudUploadIcon />}
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Migrate Local Data to Cloud
      </Button>

      <Dialog open={open} onClose={() => !migrating && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Migrate Data to Firestore</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              We detected savings data on this device. Would you like to migrate it to Firestore?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This will:
            </Typography>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Upload your goals and entries to the cloud</li>
              <li>Make them accessible from all devices</li>
              <li>Enable real-time sync across devices</li>
              <li>Keep a backup of your local data</li>
            </ul>
          </Box>

          {result && (
            <Alert severity={result.success ? 'success' : 'error'} sx={{ mt: 2 }}>
              {result.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={migrating}>
            Cancel
          </Button>
          <Button 
            onClick={handleMigrate} 
            variant="contained" 
            color="primary"
            disabled={migrating}
          >
            {migrating ? 'Migrating...' : 'Migrate Data'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
