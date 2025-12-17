import { useApp } from '../context/AppContext';
import type { SavingsGoalWithProgress } from '../types';
import { ChartBarIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, UsersIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
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

  const totalSavedAllGoals = goalsWithProgress.reduce((sum, goal) => sum + goal.totalSaved, 0);
  const totalTargetAllGoals = state.goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = totalTargetAllGoals > 0 ? (totalSavedAllGoals / totalTargetAllGoals) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Family Savings Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your family's savings progress</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Goals</p>
              <p className="text-2xl font-bold text-gray-900">{state.goals.filter(g => g.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Saved</p>
              <p className="text-2xl font-bold text-gray-900">${totalSavedAllGoals.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Target</p>
              <p className="text-2xl font-bold text-gray-900">${totalTargetAllGoals.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-900">{overallProgress.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Overview */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Savings Goals</h2>
        </div>
        
        {goalsWithProgress.length === 0 ? (
          <div className="p-8 text-center">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No savings goals</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first savings goal.</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {goalsWithProgress.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{goal.name}</h3>
                    {goal.description && (
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    )}
                    {goal.deadline && (
                      <p className="text-sm text-gray-500">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ${goal.totalSaved.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">{goal.progress.toFixed(1)}% complete</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  ></div>
                </div>

                {/* Family Contributions */}
                {goal.userContributions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Family Contributions:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {goal.userContributions.map((contrib) => (
                        <div key={contrib.userId} className="bg-gray-50 rounded p-2 text-center">
                          <p className="text-xs text-gray-600">{contrib.userName}</p>
                          <p className="text-sm font-medium text-gray-900">${contrib.total.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
