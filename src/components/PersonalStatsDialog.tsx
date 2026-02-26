import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp,
  EmojiEvents as TrophyIcon,
  Whatshot as FireIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import { calculateUserStats } from '../utils/stats';
import { getAvatarUrl, getUserInitials } from '../utils/avatar';

interface PersonalStatsDialogProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
}

export default function PersonalStatsDialog({ open, onClose, userId }: PersonalStatsDialogProps) {
  const { state } = useApp();
  
  // Use current user if no userId provided
  const targetUserId = userId || state.currentUser?.id;
  const user = state.users.find(u => u.id === targetUserId);
  
  if (!user) return null;

  const stats = calculateUserStats(user.id, state.entries, state.goals);
  const favoriteGoal = stats.favoriteGoal;
  
  // Calculate ranking
  const allUserStats = state.users.map(u => ({
    userId: u.id,
    total: calculateUserStats(u.id, state.entries, state.goals).totalContributed,
  }));
  allUserStats.sort((a, b) => b.total - a.total);
  const userRank = allUserStats.findIndex(u => u.userId === user.id) + 1;
  
  // Calculate participation rate
  const participationRate = state.goals.length > 0
    ? (new Set(state.entries.filter(e => e.userId === user.id).map(e => e.goalId)).size / state.goals.length) * 100
    : 0;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={getAvatarUrl(user.name, user.email, 64)}
            alt={user.name}
            sx={{ width: 64, height: 64, fontSize: '1.5rem', fontWeight: 600 }}
          >
            {getUserInitials(user.name)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" fontWeight="bold">
              {user.name}'s Stats
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Personal savings performance
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'grey.500',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 2 }}>
        {/* Key Metrics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          <Card variant="outlined" sx={{ bgcolor: 'primary.lighter', borderColor: 'primary.main' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <MoneyIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold" color="primary">
                ${stats.totalContributed.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Saved
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ bgcolor: 'success.lighter', borderColor: 'success.main' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <TrendingUp sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold" color="success.main">
                ${stats.avgMonthly.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Monthly Avg
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ bgcolor: 'warning.lighter', borderColor: 'warning.main' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <FireIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold" color="warning.main">
                {stats.streak}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Month Streak
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ bgcolor: 'secondary.lighter', borderColor: 'secondary.main' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <TrophyIcon sx={{ fontSize: 32, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold" color="secondary.main">
                #{userRank}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Family Rank
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Additional Stats */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              Contribution Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Contributions
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {stats.totalContributions} entries
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Largest Single Contribution
                  </Typography>
                  <Typography variant="body2" fontWeight="600" color="primary">
                    ${stats.largestContribution.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Goal Participation
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {participationRate.toFixed(0)}% ({new Set(state.entries.filter(e => e.userId === user.id).map(e => e.goalId)).size}/{state.goals.length} goals)
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={participationRate} 
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Favorite Goal */}
        {favoriteGoal && (
          <Card variant="outlined" sx={{ bgcolor: 'info.lighter' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StarIcon sx={{ color: 'info.main' }} />
                <Typography variant="subtitle2" fontWeight="600">
                  Favorite Goal
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {favoriteGoal.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${favoriteGoal.count} contributions`}
                  size="small"
                  color="info"
                />
                <Chip 
                  label={`$${favoriteGoal.total.toFixed(2)} total`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
            Achievements
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {stats.totalContributed >= 1000 && (
              <Chip 
                icon={<TrophyIcon />}
                label="$1,000 Club"
                color="warning"
                size="small"
              />
            )}
            {stats.totalContributed >= 5000 && (
              <Chip 
                icon={<TrophyIcon />}
                label="$5,000 Club"
                color="warning"
                size="small"
              />
            )}
            {stats.totalContributed >= 10000 && (
              <Chip 
                icon={<TrophyIcon />}
                label="$10,000 Club"
                color="error"
                size="small"
              />
            )}
            {stats.streak >= 2 && (
              <Chip 
                icon={<FireIcon />}
                label="2-Month Streak"
                color="error"
                size="small"
              />
            )}
            {stats.streak >= 6 && (
              <Chip 
                icon={<FireIcon />}
                label="Half-Year Warrior"
                color="error"
                size="small"
              />
            )}
            {stats.totalContributions >= 10 && (
              <Chip 
                icon={<CalendarIcon />}
                label="Consistent Saver"
                color="success"
                size="small"
              />
            )}
            {userRank === 1 && (
              <Chip 
                icon={<TrophyIcon />}
                label="Top Contributor"
                color="primary"
                size="small"
              />
            )}
            {participationRate === 100 && state.goals.length > 0 && (
              <Chip 
                icon={<StarIcon />}
                label="All Goals Supporter"
                color="secondary"
                size="small"
              />
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
