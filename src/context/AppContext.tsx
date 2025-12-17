import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import type { User, SavingsGoal, SavingsEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { goalsService, entriesService } from '../firebase/firestore';

interface AppState {
  currentUser: User | null;
  users: User[];
  goals: SavingsGoal[];
  entries: SavingsEntry[];
}

type AppAction =
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'ADD_GOAL'; payload: SavingsGoal }
  | { type: 'UPDATE_GOAL'; payload: SavingsGoal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_ENTRY'; payload: SavingsEntry }
  | { type: 'UPDATE_ENTRY'; payload: SavingsEntry }
  | { type: 'DELETE_ENTRY'; payload: string }
  | { type: 'LOAD_GOALS'; payload: SavingsGoal[] }
  | { type: 'LOAD_ENTRIES'; payload: SavingsEntry[] }
  | { type: 'LOAD_DATA'; payload: AppState };

// Load user from localStorage synchronously during initialization
const getInitialUser = (): User | null => {
  try {
    const savedUser = localStorage.getItem('holidayz-current-user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
  } catch (error) {
    console.error('Error loading saved user:', error);
  }
  return null;
};

const initialState: AppState = {
  currentUser: getInitialUser(),
  users: [
    { id: '1', name: 'Kenith De Beer', email: 'kenith.debeer@gmail.com' },
    { id: '2', name: 'Lee de Beer', email: 'leeanne.debeer@gmail.com' },
    { id: '3', name: 'Alissa-Lee de Beer', email: 'Lissydebeerx@gmail.com' },
    { id: '4', name: 'Triston de Beer', email: 'triston.debeer@gmail.com' },
  ],
  goals: [],
  entries: []
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(goal =>
          goal.id === action.payload.id ? action.payload : goal
        )
      };
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(goal => goal.id !== action.payload),
        entries: state.entries.filter(entry => entry.goalId !== action.payload)
      };
    case 'ADD_ENTRY':
      return { ...state, entries: [...state.entries, action.payload] };
    case 'UPDATE_ENTRY':
      return {
        ...state,
        entries: state.entries.map(entry =>
          entry.id === action.payload.id ? action.payload : entry
        )
      };
    case 'DELETE_ENTRY':
      return {
        ...state,
        entries: state.entries.filter(entry => entry.id !== action.payload)
      };
    case 'LOAD_GOALS':
      return { ...state, goals: action.payload };
    case 'LOAD_ENTRIES':
      return { ...state, entries: action.payload };
    case 'LOAD_DATA':
      // Preserve currentUser when loading data from Firestore
      return { ...action.payload, currentUser: state.currentUser };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Save currentUser to localStorage whenever it changes
  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem('holidayz-current-user', JSON.stringify(state.currentUser));
    } else {
      localStorage.removeItem('holidayz-current-user');
    }
  }, [state.currentUser]);

  // Subscribe to Firestore goals in real-time
  useEffect(() => {
    console.log('📡 Subscribing to goals from Firestore...');
    const unsubscribe = goalsService.subscribe((goals) => {
      console.log(`✅ Received ${goals.length} goals from Firestore`);
      dispatch({ type: 'LOAD_GOALS', payload: goals });
    });

    return () => {
      console.log('🔌 Unsubscribing from goals');
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to Firestore entries in real-time
  useEffect(() => {
    console.log('📡 Subscribing to entries from Firestore...');
    const unsubscribe = entriesService.subscribe((entries) => {
      console.log(`✅ Received ${entries.length} entries from Firestore`);
      dispatch({ type: 'LOAD_ENTRIES', payload: entries });
      setIsLoading(false);
    });

    return () => {
      console.log('🔌 Unsubscribing from entries');
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Show loading indicator while fetching initial data
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '2rem' }}>📦</div>
        <div>Loading family savings data...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Helper functions
export function createGoal(name: string, targetAmount: number, description?: string, deadline?: string): SavingsGoal {
  return {
    id: uuidv4(),
    name,
    description,
    targetAmount,
    deadline,
    createdAt: new Date().toISOString(),
    isActive: true
  };
}

export function createEntry(userId: string, goalId: string, amount: number, description?: string, date?: string): SavingsEntry {
  return {
    id: uuidv4(),
    userId,
    goalId,
    amount,
    description,
    date: date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };
}
