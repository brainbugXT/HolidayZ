import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { User, SavingsGoal, SavingsEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';

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
  | { type: 'LOAD_DATA'; payload: AppState };

const initialState: AppState = {
  currentUser: null,
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
    case 'LOAD_DATA':
      return action.payload;
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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('holidayz-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: { ...initialState, ...parsedData } });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('holidayz-data', JSON.stringify({
      goals: state.goals,
      entries: state.entries,
      currentUser: state.currentUser
    }));
  }, [state.goals, state.entries, state.currentUser]);

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
