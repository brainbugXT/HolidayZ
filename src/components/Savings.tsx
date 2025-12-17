import { useState } from 'react';
import { useApp, createEntry } from '../context/AppContext';
import { PlusIcon, PencilIcon, TrashIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function Savings() {
  const { state, dispatch } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    goalId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Get current user's entries only
  const userEntries = state.entries.filter(entry => entry.userId === state.currentUser?.id);

  const resetForm = () => {
    setFormData({
      goalId: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowCreateForm(false);
    setEditingEntry(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.goalId || !formData.amount || !state.currentUser) return;

    if (editingEntry) {
      // Update existing entry
      const entry = userEntries.find(e => e.id === editingEntry);
      if (entry) {
        const updatedEntry = {
          ...entry,
          goalId: formData.goalId,
          amount: parseFloat(formData.amount),
          description: formData.description || undefined,
          date: formData.date
        };
        dispatch({ type: 'UPDATE_ENTRY', payload: updatedEntry });
      }
    } else {
      // Create new entry
      const newEntry = createEntry(
        state.currentUser.id,
        formData.goalId,
        parseFloat(formData.amount),
        formData.description || undefined,
        formData.date
      );
      dispatch({ type: 'ADD_ENTRY', payload: newEntry });
    }
    
    resetForm();
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

  const handleDelete = (entryId: string) => {
    if (confirm('Are you sure you want to delete this savings entry?')) {
      dispatch({ type: 'DELETE_ENTRY', payload: entryId });
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Savings</h1>
          <p className="text-gray-600 mt-1">Track your personal contributions to family goals</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Contributed</p>
            <p className="text-2xl font-bold text-primary-600">${totalSaved.toFixed(2)}</p>
          </div>
          {state.goals.length > 0 && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Savings
            </button>
          )}
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingEntry ? 'Edit Savings Entry' : 'Add New Savings'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="goalId" className="block text-sm font-medium text-gray-700">
                Savings Goal *
              </label>
              <select
                id="goalId"
                value={formData.goalId}
                onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select a goal...</option>
                {state.goals.filter(g => g.isActive).map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Optional note about this savings..."
              />
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
                {editingEntry ? 'Update Entry' : 'Add Savings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* No Goals Message */}
      {state.goals.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No savings goals yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create a savings goal first, then you can start tracking your contributions.
          </p>
        </div>
      )}

      {/* Entries by Goal */}
      {Object.keys(entriesByGoal).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(entriesByGoal).map(([goalId, goalEntries]) => {
            const goalTotal = goalEntries.reduce((sum, entry) => sum + entry.amount, 0);
            return (
              <div key={goalId} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">{getGoalName(goalId)}</h2>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Your Total</p>
                    <p className="text-lg font-bold text-primary-600">${goalTotal.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {goalEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry) => (
                    <div key={entry.id} className="p-6 flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-semibold text-gray-900">
                            ${entry.amount.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                        {entry.description && (
                          <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(entry.id)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : state.goals.length > 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No savings entries yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start tracking your contributions by adding your first savings entry.
          </p>
        </div>
      )}
    </div>
  );
}
