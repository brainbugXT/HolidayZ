import type { ReactNode } from 'react';
import { useApp } from '../context/AppContext';
import { 
  HomeIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: ReactNode;
  currentPage: 'dashboard' | 'goals' | 'savings';
  onNavigate: (page: 'dashboard' | 'goals' | 'savings') => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { state, dispatch } = useApp();

  const handleLogout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
  };

  const navigation = [
    { name: 'Dashboard', page: 'dashboard' as const, icon: HomeIcon },
    { name: 'Savings Goals', page: 'goals' as const, icon: ChartBarIcon },
    { name: 'My Savings', page: 'savings' as const, icon: CurrencyDollarIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary-600">HolidayZ</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => onNavigate(item.page)}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        currentPage === item.page
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-gray-700">{state.currentUser?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => onNavigate(item.page)}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left ${
                    currentPage === item.page
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
}
