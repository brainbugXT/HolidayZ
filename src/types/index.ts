export interface User {
  id: string;
  name: string;
  email: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  deadline?: string;
  createdAt: string;
  isActive: boolean;
}

export interface SavingsEntry {
  id: string;
  userId: string;
  goalId: string;
  amount: number;
  description?: string;
  date: string;
  createdAt: string;
  proofImageUrl?: string;
}

export interface SavingsGoalWithProgress extends SavingsGoal {
  totalSaved: number;
  progress: number; // percentage
  userContributions: {
    userId: string;
    userName: string;
    total: number;
  }[];
}
