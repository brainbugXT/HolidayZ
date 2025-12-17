import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  MenuItem,
  Divider,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add as PlusIcon,
  Edit as PencilIcon,
  Delete as TrashIcon,
  AccountBalance as CurrencyDollarIcon,
  PhotoCamera as PhotoCameraIcon,
  Image as ImageIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useApp, createEntry } from '../context/AppContext';
import { entriesService } from '../firebase/firestore';
import { storageService } from '../firebase/storage';

export default function Savings() {
  const { state } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    goalId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Get current user's entries only
  const userEntries = state.entries.filter(entry => entry.userId === state.currentUser?.id);

  const resetForm = () => {
    setFormData({
      goalId: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedImage(null);
    setImagePreview(null);
    setShowCreateForm(false);
    setEditingEntry(null);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setSelectedImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleAddNewSavings = () => {
    // Get the most recent goal (by creation date)
    const latestGoal = state.goals
      .filter(g => g.isActive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    setFormData({
      goalId: latestGoal?.id || '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.goalId || !formData.amount || !state.currentUser) return;

    setIsUploading(true);
    try {
      let proofImageUrl: string | undefined;

      // Upload image if one was selected
      if (selectedImage) {
        // Generate temporary ID for new entries (will be replaced by Firestore)
        const tempId = editingEntry || `temp_${Date.now()}`;
        proofImageUrl = await storageService.uploadProofImage(selectedImage, tempId);
      }

      if (editingEntry) {
        // Update existing entry in Firestore
        const entry = userEntries.find(e => e.id === editingEntry);
        if (entry) {
          // Delete old image if we're uploading a new one
          if (selectedImage && entry.proofImageUrl) {
            await storageService.deleteProofImage(entry.proofImageUrl);
          }

          const updatedEntry = {
            ...entry,
            goalId: formData.goalId,
            amount: parseFloat(formData.amount),
            description: formData.description || undefined,
            date: formData.date,
            proofImageUrl: proofImageUrl || entry.proofImageUrl
          };
          await entriesService.update(editingEntry, updatedEntry);
          console.log('✅ Entry updated in Firestore');
        }
      } else {
        // Create new entry in Firestore
        const newEntry = createEntry(
          state.currentUser.id,
          formData.goalId,
          parseFloat(formData.amount),
          formData.description || undefined,
          formData.date
        );
        const { id, ...entryWithoutId } = newEntry;
        const entryData = proofImageUrl 
          ? { ...entryWithoutId, proofImageUrl }
          : entryWithoutId;
        await entriesService.add(entryData);
        console.log('✅ Entry added to Firestore');
      }
      
      resetForm();
    } catch (error: any) {
      console.error('Error saving entry:', error);
      const errorMessage = error?.code === 'unavailable' 
        ? 'Cannot connect to Firebase. Please check your internet connection and Firebase configuration.'
        : error?.code === 'permission-denied'
        ? 'Permission denied. Please check your Firestore security rules.'
        : `Failed to save entry: ${error?.message || 'Please check your Firebase setup and try again.'}`;
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (entryId: string) => {
    const entry = userEntries.find(e => e.id === entryId);
    if (entry) {
      setFormData({
        goalId: entry.goalId,
        amount: entry.amount.toString(),
        description: entry.description || '',
        date: entry.date
      });
      setEditingEntry(entryId);
      setShowCreateForm(true);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (confirm('Are you sure you want to delete this savings entry?')) {
      try {
        // Delete proof image if it exists
        const entry = userEntries.find(e => e.id === entryId);
        if (entry?.proofImageUrl) {
          await storageService.deleteProofImage(entry.proofImageUrl);
        }
        
        await entriesService.delete(entryId);
        console.log('✅ Entry deleted from Firestore');
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry. Please try again.');
      }
    }
  };

  const getGoalName = (goalId: string) => {
    const goal = state.goals.find(g => g.id === goalId);
    return goal ? goal.name : 'Unknown Goal';
  };

  // Group entries by goal
  const entriesByGoal = userEntries.reduce((acc, entry) => {
    if (!acc[entry.goalId]) {
      acc[entry.goalId] = [];
    }
    acc[entry.goalId].push(entry);
    return acc;
  }, {} as Record<string, typeof userEntries>);

  // Calculate totals
  const totalSaved = userEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            My Savings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your personal contributions to family goals
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              Total Contributed
            </Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              ${totalSaved.toFixed(2)}
            </Typography>
          </Box>
          {state.goals.length > 0 && (
            <Button
              variant="contained"
              startIcon={<PlusIcon />}
              onClick={handleAddNewSavings}
            >
              Add Savings
            </Button>
          )}
        </Box>
      </Box>

      {/* Create/Edit Form */}
      <Dialog open={showCreateForm} onClose={resetForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEntry ? 'Edit Savings Entry' : 'Add New Savings'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                select
                label="Savings Goal"
                value={formData.goalId}
                onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
                required
                fullWidth
              >
                {state.goals.filter(g => g.isActive).map((goal) => (
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
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional note about this savings..."
                fullWidth
              />

              <Divider sx={{ my: 1 }} />

              {/* Photo Upload Section */}
              <Box>
                <Typography variant="body2" fontWeight="500" gutterBottom>
                  Proof of Deposit (Optional)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Upload a photo of your deposit slip, bank transfer, or other proof
                </Typography>

                {imagePreview ? (
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px', 
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0'
                      }} 
                    />
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': { bgcolor: 'error.light', color: 'white' }
                      }}
                      size="small"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    fullWidth
                  >
                    Choose Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </Button>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetForm} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isUploading}>
              {isUploading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Uploading...
                </>
              ) : (
                editingEntry ? 'Update Entry' : 'Add Savings'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* No Goals Message */}
      {state.goals.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CurrencyDollarIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" fontWeight="500" gutterBottom>
              No savings goals yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a savings goal first, then you can start tracking your contributions.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Entries by Goal */}
      {Object.keys(entriesByGoal).length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {Object.entries(entriesByGoal).map(([goalId, goalEntries]) => {
            const goalTotal = goalEntries.reduce((sum, entry) => sum + entry.amount, 0);
            return (
              <Card key={goalId}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2" fontWeight="600">
                      {getGoalName(goalId)}
                    </Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">
                        Your Total
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        ${goalTotal.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {goalEntries
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((entry) => (
                      <Box key={entry.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" fontWeight="600">
                              ${entry.amount.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(entry.date).toLocaleDateString()}
                            </Typography>
                            {entry.proofImageUrl && (
                              <Chip
                                icon={<ImageIcon fontSize="small" />}
                                label="Proof"
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            )}
                          </Box>
                          {entry.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {entry.description}
                            </Typography>
                          )}
                          {entry.proofImageUrl && (
                            <Box sx={{ mt: 1 }}>
                              <img 
                                src={entry.proofImageUrl} 
                                alt="Proof of deposit" 
                                style={{ 
                                  maxWidth: '200px', 
                                  maxHeight: '150px', 
                                  borderRadius: '8px',
                                  border: '1px solid #e0e0e0',
                                  cursor: 'pointer',
                                  objectFit: 'cover'
                                }}
                                onClick={() => window.open(entry.proofImageUrl, '_blank')}
                              />
                            </Box>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex' }}>
                          <IconButton
                            onClick={() => handleEdit(entry.id)}
                            size="small"
                            color="default"
                          >
                            <PencilIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(entry.id)}
                            size="small"
                            color="error"
                          >
                            <TrashIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : state.goals.length > 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CurrencyDollarIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" fontWeight="500" gutterBottom>
              No savings entries yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start tracking your contributions by adding your first savings entry.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
