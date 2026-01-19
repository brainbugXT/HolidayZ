import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import type { SavingsGoalWithProgress } from '../types';
import { calculateGoalHealth } from '../utils/stats';
import GoalForecastCard from './GoalForecastCard';

export default function GoalHealthDashboard() {
  const { state } = useApp();

  // Calculate goals with progress
  const goalsWithProgress: SavingsGoalWithProgress[] = state.goals.map(goal => {
    const goalEntries = state.entries.filter(entry => entry.goalId === goal.id);
    const totalSaved = goalEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const progress = goal.targetAmount > 0 ? (totalSaved / goal.targetAmount) * 100 : 0;
    
    const userContributions = state.users.map(user => {
      const userTotal = goalEntries
        .filter(entry => entry.userId === user.id)
        .reduce((sum, entry) => sum + entry.amount, 0);
      return {
        userId: user.id,
        userName: user.name,
        total: userTotal
      };
    }).filter(contrib => contrib.total > 0);

    return {
      ...goal,
      totalSaved,
      progress: Math.min(progress, 100),
      userContributions
    };
  });

  // Categorize goals by health
  const goalsByHealth = {
    complete: goalsWithProgress.filter(g => calculateGoalHealth(g, g.totalSaved) === 'complete'),
    onTrack: goalsWithProgress.filter(g => calculateGoalHealth(g, g.totalSaved) === 'on-track'),
    atRisk: goalsWithProgress.filter(g => calculateGoalHealth(g, g.totalSaved) === 'at-risk'),
    behind: goalsWithProgress.filter(g => calculateGoalHealth(g, g.totalSaved) === 'behind'),
  };

  const activeGoals = goalsWithProgress.filter(g => g.isActive && g.progress < 100);
  const needsAttention = [...goalsByHealth.atRisk, ...goalsByHealth.behind];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Goal Health Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and manage your savings goals health
        </Typography>
      </Box>

      {/* Summary Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        <Card sx={{ bgcolor: 'success.lighter', borderColor: 'success.main', borderWidth: 1, borderStyle: 'solid' }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {goalsByHealth.complete.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'success.lighter', borderColor: 'success.main', borderWidth: 1, borderStyle: 'solid' }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {goalsByHealth.onTrack.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              On Track
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'warning.lighter', borderColor: 'warning.main', borderWidth: 1, borderStyle: 'solid' }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {goalsByHealth.atRisk.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              At Risk
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'error.lighter', borderColor: 'error.main', borderWidth: 1, borderStyle: 'solid' }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <ErrorIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="error.main">
              {goalsByHealth.behind.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Behind
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Alerts for goals needing attention */}
      {needsAttention.length > 0 && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          <AlertTitle>⚠️ {needsAttention.length} Goal{needsAttention.length > 1 ? 's' : ''} Need Attention</AlertTitle>
          These goals are at risk or behind schedule. Review the forecasts below and consider increasing contributions.
        </Alert>
      )}

      {/* Goals Needing Attention */}
      {needsAttention.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="600" sx={{ mb: 2 }}>
            ⚠️ Priority Goals
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {needsAttention.map(goal => {
              const goalEntries = state.entries.filter(e => e.goalId === goal.id);
              return (
                <GoalForecastCard
                  key={goal.id}
                  goal={goal}
                  totalSaved={goal.totalSaved}
                  entries={goalEntries}
                />
              );
            })}
          </Box>
        </Box>
      )}

      {/* On Track Goals */}
      {goalsByHealth.onTrack.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="600" sx={{ mb: 2 }}>
            ✅ On Track Goals
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {goalsByHealth.onTrack.map(goal => {
              const goalEntries = state.entries.filter(e => e.goalId === goal.id);
              return (
                <GoalForecastCard
                  key={goal.id}
                  goal={goal}
                  totalSaved={goal.totalSaved}
                  entries={goalEntries}
                />
              );
            })}
          </Box>
        </Box>
      )}

      {/* Completed Goals */}
      {goalsByHealth.complete.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="600" sx={{ mb: 2 }}>
            🎉 Completed Goals
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            {goalsByHealth.complete.map(goal => (
              <Card key={goal.id} variant="outlined" sx={{ borderColor: 'success.main', borderWidth: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      {goal.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Target
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      R{goal.targetAmount.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Saved
                    </Typography>
                    <Typography variant="body2" fontWeight="600" color="success.main">
                      R{goal.totalSaved.toFixed(2)}
                    </Typography>
                  </Box>
                  {goal.totalSaved > goal.targetAmount && (
                    <Chip
                      label={`${((goal.totalSaved / goal.targetAmount - 1) * 100).toFixed(0)}% over target!`}
                      size="small"
                      color="success"
                      sx={{ mt: 2 }}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* No Active Goals */}
      {activeGoals.length === 0 && goalsByHealth.complete.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <TrendingUp sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" fontWeight="600" gutterBottom>
              No Active Goals
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create a savings goal to start tracking health and forecasts
            </Typography>
            <Button variant="contained" href="/goals">
              Create Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
