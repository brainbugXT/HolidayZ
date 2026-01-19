import { useState } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Box,
  Typography,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useApp, createEntry } from '../context/AppContext';
import { entriesService } from '../firebase/firestore';

export default function QuickAddButton() {
  const { state } = useApp();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    goalId: '',
    amount: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get active goals
  const activeGoals = state.goals.filter(g => g.isActive);
  
  // Pre-select the most recent goal
  const latestGoal = activeGoals
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const handleOpen = () => {
    setFormData({
      goalId: latestGoal?.id || '',
      amount: '',
      description: '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ goalId: '', amount: '', description: '' });
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.goalId || !formData.amount || !state.currentUser) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newEntry = createEntry(
        state.currentUser.id,
        formData.goalId,
        parseFloat(formData.amount),
        formData.description || undefined,
        new Date().toISOString().split('T')[0]
      );
      
      const { id, ...entryWithoutId } = newEntry;
      await entriesService.add(entryWithoutId);
      
      console.log('✅ Quick entry added to Firestore');
      handleClose();
      
      // Show success feedback (you can add a toast notification here)
    } catch (error: any) {
      console.error('Error adding entry:', error);
      const errorMessage = error?.code === 'unavailable' 
        ? 'Cannot connect to Firebase. Please check your internet connection.'
        : error?.code === 'permission-denied'
        ? 'Permission denied. Please check your Firestore security rules.'
        : `Failed to save: ${error?.message || 'Please try again.'}`;
      alert(errorMessage);
      setIsSubmitting(false);
    }
  };

  if (!state.currentUser || activeGoals.length === 0) {
    return null; // Don't show if not logged in or no active goals
  }

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="quick add"
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 12px 32px rgba(79, 70, 229, 0.5)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <AddIcon />
      </Fab>

      {/* Quick Add Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Quick Add Savings
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Add a contribution in seconds!
              </Typography>
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                select
                label="Goal"
                value={formData.goalId}
                onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
                required
                fullWidth
              >
                {activeGoals.map((goal) => (
                  <MenuItem key={goal.id} value={goal.id}>
                    {goal.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">R</InputAdornment>,
                }}
                inputProps={{
                  min: 0,
                  step: 0.01,
                }}
              />

              <TextField
                label="Description (Optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                placeholder="e.g., Weekly savings"
                multiline
                rows={2}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isSubmitting || !formData.goalId || !formData.amount}
            >
              {isSubmitting ? 'Adding...' : 'Add Savings'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
