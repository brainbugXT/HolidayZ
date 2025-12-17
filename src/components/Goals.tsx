import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  LinearProgress,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as PlusIcon,
  Edit as PencilIcon,
  Delete as TrashIcon,
} from '@mui/icons-material';
import { useApp, createGoal } from '../context/AppContext';
import { goalsService } from '../firebase/firestore';

export default function Goals() {
  const { state } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    deadline: ''
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', targetAmount: '', deadline: '' });
    setShowCreateForm(false);
    setEditingGoal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only Kenith (user id '1') can create or edit goals
    if (state.currentUser?.id !== '1') {
      alert('Only Kenith can create or edit savings goals.');
      return;
    }

    if (!formData.name || !formData.targetAmount) return;

    try {
      if (editingGoal) {
        // Update existing goal in Firestore
        const goal = state.goals.find(g => g.id === editingGoal);
        if (goal) {
          const updatedGoal = {
            ...goal,
            name: formData.name,
            description: formData.description || undefined,
            targetAmount: parseFloat(formData.targetAmount),
            deadline: formData.deadline || undefined
          };
          await goalsService.update(editingGoal, updatedGoal);
          console.log('✅ Goal updated in Firestore');
        }
      } else {
        // Create new goal in Firestore
        const newGoal = createGoal(
          formData.name,
          parseFloat(formData.targetAmount),
          formData.description || undefined,
          formData.deadline || undefined
        );
        const { id, ...goalWithoutId } = newGoal;
        await goalsService.add(goalWithoutId);
        console.log('✅ Goal added to Firestore');
      }
      
      resetForm();
    } catch (error: any) {
      console.error('Error saving goal:', error);
      const errorMessage = error?.code === 'unavailable' 
        ? 'Cannot connect to Firebase. Please check your internet connection and Firebase configuration.'
        : error?.code === 'permission-denied'
        ? 'Permission denied. Please check your Firestore security rules.'
        : `Failed to save goal: ${error?.message || 'Please check your Firebase setup and try again.'}`;
      alert(errorMessage);
    }
  };

  const handleEdit = (goalId: string) => {
    // Only Kenith (user id '1') can edit goals
    if (state.currentUser?.id !== '1') {
      alert('Only Kenith can edit savings goals.');
      return;
    }

    const goal = state.goals.find(g => g.id === goalId);
    if (goal) {
      setFormData({
        name: goal.name,
        description: goal.description || '',
        targetAmount: goal.targetAmount.toString(),
        deadline: goal.deadline || ''
      });
      setEditingGoal(goalId);
      setShowCreateForm(true);
    }
  };

  const handleDelete = async (goalId: string) => {
    // Only Kenith (user id '1') can delete goals
    if (state.currentUser?.id !== '1') {
      alert('Only Kenith can delete savings goals.');
      return;
    }

    if (confirm('Are you sure you want to delete this goal? All associated savings entries will also be deleted.')) {
      try {
        await goalsService.delete(goalId);
        console.log('✅ Goal deleted from Firestore');
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Failed to delete goal. Please try again.');
      }
    }
  };

  const calculateGoalProgress = (goalId: string, targetAmount: number) => {
    const goalEntries = state.entries.filter(entry => entry.goalId === goalId);
    const totalSaved = goalEntries.reduce((sum, entry) => sum + entry.amount, 0);
    return {
      totalSaved,
      progress: targetAmount > 0 ? (totalSaved / targetAmount) * 100 : 0
    };
  };

  const calculateDaysLeft = (deadline: string | undefined) => {
    if (!deadline) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(deadline);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getDaysLeftDisplay = (daysLeft: number | null) => {
    if (daysLeft === null) return null;
    
    if (daysLeft < 0) {
      return { text: `${Math.abs(daysLeft)} days overdue`, color: 'error.main' };
    } else if (daysLeft === 0) {
      return { text: 'Due today!', color: 'warning.main' };
    } else if (daysLeft === 1) {
      return { text: '1 day left', color: 'warning.main' };
    } else if (daysLeft <= 7) {
      return { text: `${daysLeft} days left`, color: 'warning.main' };
    } else if (daysLeft <= 30) {
      return { text: `${daysLeft} days left`, color: 'info.main' };
    } else {
      return { text: `${daysLeft} days left`, color: 'text.secondary' };
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Savings Goals
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {state.currentUser?.id === '1' 
              ? 'Create and manage your family\'s savings goals'
              : 'View your family\'s savings goals'}
          </Typography>
        </Box>
        {state.currentUser?.id === '1' && (
          <Button
            variant="contained"
            startIcon={<PlusIcon />}
            onClick={() => setShowCreateForm(true)}
          >
            New Goal
          </Button>
        )}
      </Box>

      {/* Create/Edit Form */}
      <Dialog open={showCreateForm} onClose={resetForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingGoal ? 'Edit Goal' : 'Create New Goal'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Goal Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Family Vacation"
                required
                fullWidth
              />

              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description of the goal..."
                multiline
                rows={3}
                fullWidth
              />

              <TextField
                label="Target Amount"
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                placeholder="0.00"
                required
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{
                  min: 0,
                  step: 0.01,
                }}
              />

              <TextField
                label="Target Date"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editingGoal ? 'Update Goal' : 'Create Goal'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Goals List */}
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" fontWeight="600" sx={{ mb: 3 }}>
            All Goals
          </Typography>
          
          {state.goals.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <PlusIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body1" fontWeight="500" gutterBottom>
                No goals yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first savings goal to get started.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {state.goals.map((goal) => {
                const { totalSaved, progress } = calculateGoalProgress(goal.id, goal.targetAmount);
                const daysLeft = calculateDaysLeft(goal.deadline);
                const daysLeftDisplay = getDaysLeftDisplay(daysLeft);
                
                return (
                  <Card key={goal.id} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" component="h3">
                              {goal.name}
                            </Typography>
                            {daysLeftDisplay && (
                              <Typography 
                                variant="body2" 
                                fontWeight="600"
                                sx={{ 
                                  color: daysLeftDisplay.color,
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                  bgcolor: daysLeft !== null && daysLeft < 0 
                                    ? 'error.lighter' 
                                    : daysLeft !== null && daysLeft <= 7 
                                    ? 'warning.lighter' 
                                    : 'action.hover'
                                }}
                              >
                                {daysLeftDisplay.text}
                              </Typography>
                            )}
                          </Box>
                          {goal.description && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {goal.description}
                            </Typography>
                          )}
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                ${totalSaved.toFixed(2)} saved
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ${goal.targetAmount.toFixed(2)} target
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(progress, 100)}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {progress.toFixed(1)}% complete
                            </Typography>
                          </Box>
                          {goal.deadline && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                              Target Date: {new Date(goal.deadline).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                        {state.currentUser?.id === '1' && (
                          <Box sx={{ display: 'flex', ml: 2 }}>
                            <IconButton
                              onClick={() => handleEdit(goal.id)}
                              size="small"
                              color="default"
                            >
                              <PencilIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(goal.id)}
                              size="small"
                              color="error"
                            >
                              <TrashIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
