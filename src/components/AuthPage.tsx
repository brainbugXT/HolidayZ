import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AuthPage() {
  const { state, dispatch } = useApp();
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const handleLogin = () => {
    const user = state.users.find(u => u.id === selectedUserId);
    if (user) {
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-bold text-gray-900">
            HolidayZ
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Family Savings Tracker
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Select your family member profile to continue
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">
              Choose Family Member
            </label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a family member...</option>
              {state.users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleLogin}
            disabled={!selectedUserId}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
