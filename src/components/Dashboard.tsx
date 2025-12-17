import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  BarChart as ChartBarIcon,
  AccountBalance as CurrencyDollarIcon,
  TrendingUp as ArrowTrendingUpIcon,
  People as UsersIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import type { SavingsGoalWithProgress } from '../types';

export default function Dashboard() {
  const { state } = useApp();

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
    } else if (daysLeft <= 60) {
      return { text: `${daysLeft} days left`, color: 'warning.main' };
    } else {
      return { text: `${daysLeft} days left`, color: 'text.secondary' };
    }
  };

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

  const totalSavedAllGoals = goalsWithProgress.reduce((sum, goal) => sum + goal.totalSaved, 0);
  const totalTargetAllGoals = state.goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = totalTargetAllGoals > 0 ? (totalSavedAllGoals / totalTargetAllGoals) * 100 : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Family Savings Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your family's savings progress
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ChartBarIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Active Goals
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {state.goals.filter(g => g.isActive).length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ArrowTrendingUpIcon sx={{ fontSize: 40, mr: 2, color: 'success.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Saved
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  ${totalSavedAllGoals.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CurrencyDollarIcon sx={{ fontSize: 40, mr: 2, color: 'warning.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Target
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  ${totalTargetAllGoals.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <UsersIcon sx={{ fontSize: 40, mr: 2, color: 'secondary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Overall Progress
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {overallProgress.toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Goals Overview */}
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" fontWeight="600" sx={{ mb: 3 }}>
            Savings Goals
          </Typography>
          
          {goalsWithProgress.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <ChartBarIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body1" fontWeight="500" gutterBottom>
                No savings goals
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get started by creating your first savings goal.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {goalsWithProgress.map((goal) => {
                const daysLeft = calculateDaysLeft(goal.deadline);
                const daysLeftDisplay = getDaysLeftDisplay(daysLeft);
                
                return (
                  <Card key={goal.id} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h6" component="h3">
                              {goal.name}
                            </Typography>
                            {daysLeftDisplay && (
                              <Chip
                                label={daysLeftDisplay.text}
                                size="small"
                                sx={{ 
                                  bgcolor: daysLeft !== null && daysLeft < 0 
                                    ? 'error.lighter' 
                                    : daysLeft !== null && daysLeft <= 60 
                                    ? 'warning.lighter' 
                                    : 'action.hover',
                                  color: daysLeftDisplay.color,
                                  fontWeight: 600
                                }}
                              />
                            )}
                          </Box>
                          {goal.description && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {goal.description}
                            </Typography>
                          )}
                          {goal.deadline && (
                            <Typography variant="body2" color="text.secondary">
                              Deadline: {new Date(goal.deadline).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ textAlign: 'right', ml: 2 }}>
                          <Typography variant="h6" fontWeight="bold">
                            ${goal.totalSaved.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {goal.progress.toFixed(1)}% complete
                          </Typography>
                        </Box>
                      </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(goal.progress, 100)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    {/* Family Contributions */}
                    {goal.userContributions.length > 0 && (
                      <Box>
                        <Typography variant="body2" fontWeight="500" color="text.secondary" sx={{ mb: 1 }}>
                          Family Contributions:
                        </Typography>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                              xs: 'repeat(2, 1fr)',
                              md: 'repeat(4, 1fr)',
                            },
                            gap: 1,
                          }}
                        >
                          {goal.userContributions.map((contrib) => (
                            <Chip
                              key={contrib.userId}
                              label={
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="caption" display="block">
                                    {contrib.userName}
                                  </Typography>
                                  <Typography variant="body2" fontWeight="500">
                                    ${contrib.total.toFixed(2)}
                                  </Typography>
                                </Box>
                              }
                              sx={{ height: 'auto', py: 1 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
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
