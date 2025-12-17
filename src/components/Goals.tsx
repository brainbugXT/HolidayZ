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

export default function Goals() {
  const { state, dispatch } = useApp();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount) return;

    if (editingGoal) {
      // Update existing goal
      const goal = state.goals.find(g => g.id === editingGoal);
      if (goal) {
        const updatedGoal = {
          ...goal,
          name: formData.name,
          description: formData.description || undefined,
          targetAmount: parseFloat(formData.targetAmount),
          deadline: formData.deadline || undefined
        };
        dispatch({ type: 'UPDATE_GOAL', payload: updatedGoal });
      }
    } else {
      // Create new goal
      const newGoal = createGoal(
        formData.name,
        parseFloat(formData.targetAmount),
        formData.description || undefined,
        formData.deadline || undefined
      );
      dispatch({ type: 'ADD_GOAL', payload: newGoal });
    }
    
    resetForm();
  };

  const handleEdit = (goalId: string) => {
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

  const handleDelete = (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal? All associated savings entries will also be deleted.')) {
      dispatch({ type: 'DELETE_GOAL', payload: goalId });
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Savings Goals
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage your family's savings goals
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PlusIcon />}
          onClick={() => setShowCreateForm(true)}
        >
          New Goal
        </Button>
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
                return (
                  <Card key={goal.id} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h3" gutterBottom>
                            {goal.name}
                          </Typography>
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
