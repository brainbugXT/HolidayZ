import type { SavingsEntry, User, SavingsGoal } from '../types';

/**
 * Calculate user's contribution streak in months
 */
export function calculateStreak(userId: string, entries: SavingsEntry[]): number {
  const userEntries = entries
    .filter(entry => entry.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (userEntries.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  let checkDate = new Date(today.getFullYear(), today.getMonth(), 1);

  while (true) {
    const monthStart = new Date(checkDate.getFullYear(), checkDate.getMonth(), 1);
    const monthEnd = new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0);

    const hasContribution = userEntries.some(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    if (hasContribution) {
      streak++;
      // Move to previous month
      checkDate = new Date(checkDate.getFullYear(), checkDate.getMonth() - 1, 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate user's personal statistics
 */
export function calculateUserStats(userId: string, entries: SavingsEntry[], goals: SavingsGoal[]): {
  totalContributed: number;
  avgMonthly: number;
  favoriteGoal: { name: string; count: number; total: number } | null;
  streak: number;
  totalContributions: number;
  largestContribution: number;
} {
  const userEntries = entries.filter(entry => entry.userId === userId);
  
  const totalContributed = userEntries.reduce((sum, entry) => sum + entry.amount, 0);
  
  // Calculate average monthly contribution
  const months = new Set(userEntries.map(entry => {
    const date = new Date(entry.date);
    return `${date.getFullYear()}-${date.getMonth()}`;
  })).size;
  
  const avgMonthly = months > 0 ? totalContributed / months : 0;
  
  // Find favorite goal (most contributions)
  const goalContributions = new Map<string, { count: number; total: number; goalName: string }>();
  
  userEntries.forEach(entry => {
    const goal = goals.find(g => g.id === entry.goalId);
    if (goal) {
      const existing = goalContributions.get(entry.goalId) || { count: 0, total: 0, goalName: goal.name };
      goalContributions.set(entry.goalId, {
        count: existing.count + 1,
        total: existing.total + entry.amount,
        goalName: goal.name,
      });
    }
  });
  
  let favoriteGoal: { name: string; count: number; total: number } | null = null;
  let maxCount = 0;
  
  goalContributions.forEach((value) => {
    if (value.count > maxCount) {
      maxCount = value.count;
      favoriteGoal = { name: value.goalName, count: value.count, total: value.total };
    }
  });
  
  // Calculate streak
  const streak = calculateStreak(userId, entries);
  
  // Get total number of contributions
  const totalContributions = userEntries.length;
  
  // Find largest single contribution
  const largestContribution = userEntries.length > 0
    ? Math.max(...userEntries.map(e => e.amount))
    : 0;
  
  return {
    totalContributed,
    avgMonthly,
    favoriteGoal,
    streak,
    totalContributions,
    largestContribution,
  };
}

/**
 * Calculate goal health status
 */
export function calculateGoalHealth(
  goal: SavingsGoal,
  totalSaved: number
): 'on-track' | 'at-risk' | 'behind' | 'complete' {
  if (!goal.deadline) return 'on-track';
  
  const progress = goal.targetAmount > 0 ? (totalSaved / goal.targetAmount) * 100 : 0;
  
  if (progress >= 100) return 'complete';
  
  const today = new Date();
  const deadline = new Date(goal.deadline);
  const createdDate = new Date(goal.createdAt);
  
  const totalDays = deadline.getTime() - createdDate.getTime();
  const elapsedDays = today.getTime() - createdDate.getTime();
  const timeProgress = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0;
  
  // If we're ahead of schedule
  if (progress >= timeProgress) return 'on-track';
  
  // If we're slightly behind (within 15%)
  if (progress >= timeProgress - 15) return 'at-risk';
  
  // Significantly behind
  return 'behind';
}

/**
 * Calculate monthly savings velocity
 */
export function calculateSavingsVelocity(entries: SavingsEntry[], months: number = 6) {
  const monthlyData: { month: string; total: number }[] = [];
  const today = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const monthTotal = entries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === date.getFullYear() &&
               entryDate.getMonth() === date.getMonth();
      })
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    monthlyData.push({ month: monthName, total: monthTotal });
  }
  
  return monthlyData;
}

/**
 * Calculate budget recommendation to reach goal on time
 */
export function calculateBudgetRecommendation(
  goal: SavingsGoal,
  totalSaved: number,
  familySize: number
): { monthly: number; perPerson: number; daysLeft: number } | null {
  if (!goal.deadline) return null;
  
  const remaining = goal.targetAmount - totalSaved;
  if (remaining <= 0) return null;
  
  const today = new Date();
  const deadline = new Date(goal.deadline);
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysLeft <= 0) return null;
  
  const monthsLeft = daysLeft / 30;
  const monthly = remaining / monthsLeft;
  const perPerson = monthly / familySize;
  
  return {
    monthly: Math.ceil(monthly),
    perPerson: Math.ceil(perPerson),
    daysLeft,
  };
}

/**
 * Forecast goal completion date based on recent savings rate
 */
export function forecastCompletion(
  goal: SavingsGoal,
  totalSaved: number,
  entries: SavingsEntry[]
): {
  estimatedCompletion: string;
  daysToCompletion: number;
  isOnTrack: boolean;
  monthlyRate: number;
  confidence: 'high' | 'medium' | 'low';
} | null {
  const remaining = goal.targetAmount - totalSaved;
  if (remaining <= 0) return null;
  
  // Calculate average daily savings rate from last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const recentEntries = entries.filter(entry => new Date(entry.date) >= ninetyDaysAgo);
  
  if (recentEntries.length === 0) return null;
  
  const recentTotal = recentEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const dailyRate = recentTotal / 90;
  const monthlyRate = dailyRate * 30;
  
  if (dailyRate <= 0) return null;
  
  const daysToComplete = Math.ceil(remaining / dailyRate);
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysToComplete);
  
  // Determine if on track
  let isOnTrack = true;
  if (goal.deadline) {
    const deadlineDate = new Date(goal.deadline);
    isOnTrack = completionDate <= deadlineDate;
  }
  
  // Determine confidence level based on data points and consistency
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (recentEntries.length >= 10) {
    confidence = 'high';
  } else if (recentEntries.length < 5) {
    confidence = 'low';
  }
  
  return {
    estimatedCompletion: completionDate.toISOString().split('T')[0],
    daysToCompletion: daysToComplete,
    isOnTrack,
    monthlyRate,
    confidence,
  };
}

/**
 * Generate year in review statistics
 */
export function generateYearInReview(
  year: number,
  entries: SavingsEntry[],
  goals: SavingsGoal[],
  users: User[]
) {
  const yearEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getFullYear() === year;
  });
  
  const totalSaved = yearEntries.reduce((sum, entry) => sum + entry.amount, 0);
  
  // Count completed goals
  const completedGoals = goals.filter(goal => {
    const goalEntries = entries.filter(e => e.goalId === goal.id);
    const goalTotal = goalEntries.reduce((sum, e) => sum + e.amount, 0);
    return goalTotal >= goal.targetAmount;
  }).length;
  
  // Find top contributor
  const userContributions = users.map(user => {
    const userTotal = yearEntries
      .filter(entry => entry.userId === user.id)
      .reduce((sum, entry) => sum + entry.amount, 0);
    return { userId: user.id, userName: user.name, total: userTotal };
  });
  
  const topContributor = userContributions.reduce((max, user) => 
    user.total > max.total ? user : max
  , userContributions[0]);
  
  // Find biggest contribution
  const biggestContribution = yearEntries.length > 0
    ? yearEntries.reduce((max, entry) => entry.amount > max.amount ? entry : max)
    : null;
  
  const biggestContributor = biggestContribution
    ? users.find(u => u.id === biggestContribution.userId)
    : null;
  
  // Calculate monthly average
  const monthsWithContributions = new Set(yearEntries.map(entry => {
    const date = new Date(entry.date);
    return date.getMonth();
  })).size;
  
  const monthlyAverage = monthsWithContributions > 0 ? totalSaved / monthsWithContributions : 0;
  
  return {
    year,
    totalSaved,
    completedGoals,
    topContributor,
    biggestContribution: biggestContribution ? {
      amount: biggestContribution.amount,
      contributor: biggestContributor?.name || 'Unknown',
      date: biggestContribution.date,
    } : null,
    monthlyAverage,
    totalContributions: yearEntries.length,
    activeMonths: monthsWithContributions,
  };
}
