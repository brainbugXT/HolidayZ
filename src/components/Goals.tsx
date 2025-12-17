import { useState } from 'react';
import { useApp, createGoal } from '../context/AppContext';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
          <p className="text-gray-600 mt-1">Create and manage your family's savings goals</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Goal
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Goal Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Family Vacation"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Optional description of the goal..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
                  Target Amount *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="targetAmount"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                  Target Date
                </label>
                <input
                  type="date"
                  id="deadline"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Goals</h2>
        </div>
        
        {state.goals.length === 0 ? (
          <div className="p-8 text-center">
            <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No goals yet</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first savings goal to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {state.goals.map((goal) => {
              const { totalSaved, progress } = calculateGoalProgress(goal.id, goal.targetAmount);
              return (
                <div key={goal.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{goal.name}</h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      )}
                      <div className="mt-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>${totalSaved.toFixed(2)} saved</span>
                          <span>${goal.targetAmount.toFixed(2)} target</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{progress.toFixed(1)}% complete</p>
                      </div>
                      {goal.deadline && (
                        <p className="text-sm text-gray-500 mt-2">
                          Target Date: {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(goal.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
