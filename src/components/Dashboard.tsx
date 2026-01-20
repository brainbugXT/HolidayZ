import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  Tooltip,
  Button,
} from '@mui/material';
import {
  BarChart as ChartBarIcon,
  AccountBalance as CurrencyDollarIcon,
  TrendingUp as ArrowTrendingUpIcon,
  People as UsersIcon,
  EmojiEvents as TrophyIcon,
  Whatshot as FireIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  LightbulbOutlined as LightbulbIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { SavingsGoalWithProgress } from '../types';
import { getAvatarUrl, getUserInitials, getUserColor } from '../utils/avatar';
import { 
  calculateStreak, 
  calculateGoalHealth, 
  calculateBudgetRecommendation 
} from '../utils/stats';
import SavingsVelocityChart from './SavingsVelocityChart';
import PersonalStatsDialog from './PersonalStatsDialog';
import YearInReviewDialog from './YearInReviewDialog';

export default function Dashboard() {
  const { state } = useApp();
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [yearReviewOpen, setYearReviewOpen] = useState(false);

  const handleOpenStats = (userId?: string) => {
    setSelectedUserId(userId);
    setStatsDialogOpen(true);
  };

  const handleCloseStats = () => {
    setStatsDialogOpen(false);
    setSelectedUserId(undefined);
  };

  const handleOpenYearReview = () => {
    setYearReviewOpen(true);
  };

  const handleCloseYearReview = () => {
    setYearReviewOpen(false);
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Family Savings Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your family's savings progress
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={handleOpenYearReview}
          sx={{ minWidth: 140 }}
        >
          🎊 {new Date().getFullYear()} Review
        </Button>
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

      {/* Analytics Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="600">
            Analytics & Insights
          </Typography>
          <Button
            startIcon={<PersonIcon />}
            variant="outlined"
            size="small"
            onClick={() => handleOpenStats()}
          >
            My Stats
          </Button>
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
          {/* Velocity Chart */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TimelineIcon color="primary" />
                <Typography variant="h6" fontWeight="600">
                  Savings Velocity
                </Typography>
              </Box>
              <SavingsVelocityChart />
            </CardContent>
          </Card>

          {/* Family Stats */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <UsersIcon color="primary" />
                <Typography variant="h6" fontWeight="600">
                  Family Performance
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {state.users.map(user => {
                  const userEntries = state.entries.filter(e => e.userId === user.id);
                  const totalContributed = userEntries.reduce((sum, e) => sum + e.amount, 0);
                  const streak = calculateStreak(user.id, state.entries);
                  const isCurrentUser = state.currentUser?.id === user.id;

                  return (
                    <Box
                      key={user.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: isCurrentUser ? 'primary.lighter' : 'action.hover',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: isCurrentUser ? 'primary.light' : 'action.selected',
                          transform: 'translateX(4px)',
                        },
                      }}
                      onClick={() => handleOpenStats(user.id)}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <Avatar
                          src={getAvatarUrl(user.name, user.email, 40)}
                          alt={user.name}
                          sx={{
                            bgcolor: getUserColor(user.id),
                            width: 40,
                            height: 40,
                          }}
                        >
                          {getUserInitials(user.name)}
                        </Avatar>
                        {streak >= 2 && (
                          <Tooltip title={`${streak} month streak!`}>
                            <Box
                              sx={{
                                position: 'absolute',
                                top: -4,
                                right: -4,
                                bgcolor: 'error.main',
                                borderRadius: '50%',
                                width: 20,
                                height: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid white',
                              }}
                            >
                              <FireIcon sx={{ fontSize: 12, color: 'white' }} />
                            </Box>
                          </Tooltip>
                        )}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" fontWeight="600">
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {userEntries.length} contributions
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          R{totalContributed.toFixed(2)}
                        </Typography>
                        {streak >= 2 && (
                          <Chip
                            icon={<FireIcon />}
                            label={`${streak} months`}
                            size="small"
                            color="error"
                            sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
                          />
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Box>
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
                const health = calculateGoalHealth(goal, goal.totalSaved);
                const recommendation = calculateBudgetRecommendation(
                  goal,
                  goal.totalSaved,
                  state.users.length
                );
                
                // Health indicator config
                const healthConfig = {
                  'complete': { 
                    icon: <CheckCircleIcon />, 
                    color: 'success.main', 
                    label: 'Complete', 
                    bgcolor: 'success.lighter' 
                  },
                  'on-track': { 
                    icon: <CheckCircleIcon />, 
                    color: 'success.main', 
                    label: 'On Track', 
                    bgcolor: 'success.lighter' 
                  },
                  'at-risk': { 
                    icon: <WarningIcon />, 
                    color: 'warning.main', 
                    label: 'At Risk', 
                    bgcolor: 'warning.lighter' 
                  },
                  'behind': { 
                    icon: <ErrorIcon />, 
                    color: 'error.main', 
                    label: 'Behind', 
                    bgcolor: 'error.lighter' 
                  },
                };
                
                const healthInfo = healthConfig[health];
                
                return (
                  <Card key={goal.id} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                            <Typography variant="h6" component="h3">
                              {goal.name}
                            </Typography>
                            
                            {/* Health Indicator */}
                            <Tooltip title={`Goal status: ${healthInfo.label}`}>
                              <Chip
                                icon={healthInfo.icon}
                                label={healthInfo.label}
                                size="small"
                                sx={{ 
                                  bgcolor: healthInfo.bgcolor,
                                  color: healthInfo.color,
                                  fontWeight: 600,
                                  '& .MuiChip-icon': { color: healthInfo.color }
                                }}
                              />
                            </Tooltip>
                            
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
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: health === 'complete' ? 'success.main' :
                                    health === 'on-track' ? 'success.main' :
                                    health === 'at-risk' ? 'warning.main' : 'error.main'
                          }
                        }}
                      />
                    </Box>

                    {/* Budget Recommendation */}
                    {recommendation && health !== 'complete' && (
                      <Box 
                        sx={{ 
                          mb: 2, 
                          p: 1.5, 
                          bgcolor: 'info.lighter',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <LightbulbIcon sx={{ color: 'info.main', fontSize: 20 }} />
                        <Typography variant="body2" color="info.dark">
                          <strong>Budget tip:</strong> Save <strong>R{recommendation.perPerson}</strong> per person/month 
                          to reach this goal by the deadline ({recommendation.daysLeft} days left)
                        </Typography>
                      </Box>
                    )}

                    {/* Family Contributions */}
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
                          gap: 2,
                        }}
                      >
                        {(() => {
                          // Find the highest contribution amount (only among contributors)
                          const maxContribution = goal.userContributions.length > 0 
                            ? Math.max(...goal.userContributions.map(c => c.total))
                            : 0;
                          
                          // Show all users, including those who haven't contributed
                          return state.users.map((user) => {
                            const contribution = goal.userContributions.find(c => c.userId === user.id);
                            const total = contribution?.total || 0;
                            const isCurrentUser = user.id === state.currentUser?.id;
                            const isTopContributor = total === maxContribution && total > 0;
                            const hasContributed = total > 0;
                            const streak = calculateStreak(user.id, state.entries);
                            
                            return (
                              <Box
                                key={user.id}
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  p: 1.5,
                                  borderRadius: 2,
                                  bgcolor: hasContributed 
                                    ? (isCurrentUser ? 'primary.main' : 'action.hover')
                                    : 'transparent',
                                  border: hasContributed ? 'none' : '1px dashed',
                                  borderColor: 'divider',
                                  transition: 'all 0.2s ease',
                                  position: 'relative',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: hasContributed ? 2 : 1,
                                  }
                                }}
                              >
                                {/* Trophy badge for top contributor */}
                                {isTopContributor && (
                                  <Tooltip title="Top Contributor! 🏆">
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: -6,
                                        right: -6,
                                        width: 28,
                                        height: 28,
                                        bgcolor: '#FFD700',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: 2,
                                        zIndex: 1,
                                      }}
                                    >
                                      <TrophyIcon sx={{ fontSize: 16, color: '#000' }} />
                                    </Box>
                                  </Tooltip>
                                )}
                                
                                {/* Avatar */}
                                <Avatar
                                  src={getAvatarUrl(user.name, user.email, 64)}
                                  alt={user.name}
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    bgcolor: getUserColor(user.name),
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    opacity: hasContributed ? 1 : 0.6,
                                    border: isCurrentUser ? '3px solid' : 'none',
                                    borderColor: isCurrentUser ? 'primary.contrastText' : undefined,
                                  }}
                                >
                                  {getUserInitials(user.name)}
                                </Avatar>
                                
                                {/* Name */}
                                <Typography 
                                  variant="caption" 
                                  fontWeight="500"
                                  sx={{ 
                                    color: hasContributed
                                      ? (isCurrentUser ? 'primary.contrastText' : 'text.primary')
                                      : 'text.secondary',
                                    textAlign: 'center',
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {user.name.split(' ')[0]}
                                </Typography>
                                
                                {/* Amount */}
                                <Typography 
                                  variant="body2" 
                                  fontWeight="600"
                                  sx={{ 
                                    color: hasContributed
                                      ? (isCurrentUser ? 'primary.contrastText' : 'primary.main')
                                      : 'text.disabled',
                                    fontStyle: hasContributed ? 'normal' : 'italic',
                                  }}
                                >
                                  {hasContributed ? `$${total.toFixed(2)}` : 'Not yet'}
                                </Typography>
                                
                                {/* Streak badge at bottom */}
                                {streak >= 2 && (
                                  <Tooltip title={`${streak} month streak! Keep it up! 🔥`}>
                                    <Chip
                                      icon={<FireIcon />}
                                      label={streak}
                                      size="small"
                                      sx={{
                                        position: 'absolute',
                                        bottom: -8,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        height: 22,
                                        minWidth: 40,
                                        bgcolor: '#FF6B35',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '0.7rem',
                                        zIndex: 1,
                                        boxShadow: 2,
                                        '& .MuiChip-icon': { 
                                          color: 'white',
                                          fontSize: 14,
                                        },
                                        '& .MuiChip-label': {
                                          px: 0.75,
                                        }
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              </Box>
                            );
                          });
                        })()}
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

      {/* Personal Stats Dialog */}
      <PersonalStatsDialog
        open={statsDialogOpen}
        onClose={handleCloseStats}
        userId={selectedUserId}
      />

      {/* Year in Review Dialog */}
      <YearInReviewDialog
        open={yearReviewOpen}
        onClose={handleCloseYearReview}
      />
    </Box>
  );
}
