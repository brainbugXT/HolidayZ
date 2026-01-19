import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  CalendarMonth as CalendarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import type { SavingsGoal, SavingsEntry } from '../types';
import { forecastCompletion } from '../utils/stats';

interface GoalForecastCardProps {
  goal: SavingsGoal;
  totalSaved: number;
  entries: SavingsEntry[];
}

export default function GoalForecastCard({ goal, totalSaved, entries }: GoalForecastCardProps) {
  const forecast = forecastCompletion(goal, totalSaved, entries);
  
  if (!forecast) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TrendingUp color="primary" />
            <Typography variant="h6" fontWeight="600">
              {goal.name}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Not enough data to forecast. Add more contributions to see predictions.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { estimatedCompletion, daysToCompletion, isOnTrack, monthlyRate, confidence } = forecast;
  
  const progress = (totalSaved / goal.targetAmount) * 100;
  const daysLeft = goal.deadline 
    ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const getConfidenceColor = () => {
    if (confidence === 'high') return 'success';
    if (confidence === 'medium') return 'warning';
    return 'error';
  };

  const getStatusIcon = () => {
    if (progress >= 100) return <CheckCircleIcon sx={{ color: 'success.main' }} />;
    if (!isOnTrack) return <WarningIcon sx={{ color: 'error.main' }} />;
    return <TrendingUp sx={{ color: 'success.main' }} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card variant="outlined" sx={{ 
      borderColor: progress >= 100 ? 'success.main' : !isOnTrack ? 'error.main' : 'divider',
      borderWidth: progress >= 100 || !isOnTrack ? 2 : 1,
    }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            {getStatusIcon()}
            <Typography variant="h6" fontWeight="600">
              {goal.name}
            </Typography>
          </Box>
          <Chip
            label={confidence.toUpperCase()}
            size="small"
            color={getConfidenceColor()}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" fontWeight="600">
              R{totalSaved.toFixed(2)} / R{goal.targetAmount.toFixed(2)}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(progress, 100)} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                bgcolor: progress >= 100 ? 'success.main' : !isOnTrack ? 'error.main' : 'primary.main',
              }
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {progress.toFixed(1)}% complete
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Forecast Details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Monthly Rate */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SpeedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Current Monthly Rate
              </Typography>
              <Typography variant="body1" fontWeight="600">
                R{monthlyRate.toFixed(2)}/month
              </Typography>
            </Box>
          </Box>

          {/* Estimated Completion */}
          {estimatedCompletion && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CalendarIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Estimated Completion
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {formatDate(estimatedCompletion)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {daysToCompletion > 0 ? `in ${daysToCompletion} days` : 'Goal reached!'}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Target Deadline Comparison */}
          {goal.deadline && daysLeft !== null && progress < 100 && (
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: isOnTrack ? 'success.lighter' : 'error.lighter',
            }}>
              <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>
                {isOnTrack ? '✅ On Track' : '⚠️ Behind Schedule'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isOnTrack 
                  ? `You're projected to complete this goal ${daysToCompletion < daysLeft ? Math.abs(daysLeft - daysToCompletion) + ' days early' : 'on time'}.`
                  : `At current rate, you'll finish ${daysToCompletion - daysLeft} days after the deadline. Consider increasing contributions.`
                }
              </Typography>
            </Box>
          )}

          {/* Recommendation */}
          {!isOnTrack && goal.deadline && daysLeft !== null && daysLeft > 0 && (
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: 'info.lighter',
              border: '1px solid',
              borderColor: 'info.main',
            }}>
              <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5, color: 'info.dark' }}>
                💡 Recommended Action
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Increase monthly contributions to R{((goal.targetAmount - totalSaved) / (daysLeft / 30)).toFixed(2)} to meet your deadline.
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
