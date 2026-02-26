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
  Avatar,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  TrendingUp,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import { generateYearInReview } from '../utils/stats';
import { getAvatarUrl, getUserInitials } from '../utils/avatar';

interface YearInReviewDialogProps {
  open: boolean;
  onClose: () => void;
  year?: number;
}

export default function YearInReviewDialog({ open, onClose, year }: YearInReviewDialogProps) {
  const { state } = useApp();
  const reviewYear = year || new Date().getFullYear();
  
  const review = generateYearInReview(reviewYear, state.entries, state.goals, state.users);

  if (!review) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Year in Review {reviewYear}</DialogTitle>
        <DialogContent>
          <Typography>No data available for {reviewYear}</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
              🎊 {reviewYear} Year in Review
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              Your family's savings journey
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 2 }}>
        {/* Main Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
          <Card sx={{ bgcolor: '#fff' }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <MoneyIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" sx={{ color: 'success.main' }}>
                {formatCurrency(review.totalSaved)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total Saved in {reviewYear}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: '#fff' }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <CheckIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" sx={{ color: 'primary.main' }}>
                {review.completedGoals}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Goals Completed
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Top Contributor */}
        {review.topContributor && (
          <Card sx={{ mb: 3, bgcolor: '#fff' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TrophyIcon sx={{ color: 'warning.main', fontSize: 32 }} />
                <Typography variant="h6" fontWeight="600" sx={{ color: '#1a1a1a' }}>
                  Top Contributor
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={getAvatarUrl(
                    review.topContributor.userName,
                    state.users.find(u => u.id === review.topContributor.userId)?.email || '',
                    64
                  )}
                  sx={{ width: 64, height: 64 }}
                >
                  {getUserInitials(review.topContributor.userName)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
                    {review.topContributor.userName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Contributed {formatCurrency(review.topContributor.total)}
                  </Typography>
                </Box>
                <Chip
                  icon={<TrophyIcon />}
                  label="#1"
                  color="warning"
                  sx={{ height: 40, '& .MuiChip-label': { fontSize: '1.1rem', fontWeight: 600 } }}
                />
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Biggest Contribution */}
        {review.biggestContribution && (
          <Card sx={{ mb: 3, bgcolor: '#fff' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <StarIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                <Typography variant="h6" fontWeight="600" sx={{ color: '#1a1a1a' }}>
                  Biggest Single Contribution
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: 'primary.main' }}>
                    {formatCurrency(review.biggestContribution.amount)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    by {review.biggestContribution.contributor}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    on {formatDate(review.biggestContribution.date)}
                  </Typography>
                </Box>
                <Chip label="🌟 Amazing!" color="primary" />
              </Box>
            </CardContent>
          </Card>
        )}

        <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.3)' }} />

        {/* Additional Stats */}
        <Card sx={{ bgcolor: '#fff' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#1a1a1a' }}>
              More Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Monthly Average
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight="600" sx={{ color: '#1a1a1a' }}>
                  {formatCurrency(review.monthlyAverage)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Total Contributions
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight="600" sx={{ color: '#1a1a1a' }}>
                  {review.totalContributions} entries
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Active Months
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight="600" sx={{ color: '#1a1a1a' }}>
                  {review.activeMonths} months
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Celebration Message */}
        <Box sx={{ mt: 3, p: 3, bgcolor: '#fff', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#1a1a1a' }}>
            🎉 Congratulations!
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Your family saved {formatCurrency(review.totalSaved)} in {reviewYear}.
            {review.completedGoals > 0 && ` You completed ${review.completedGoals} goal${review.completedGoals > 1 ? 's' : ''}!`}
            {' '}Keep up the amazing work in {reviewYear + 1}!
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
