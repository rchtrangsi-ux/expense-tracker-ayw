export type TransactionType = 'expense' | 'income' | 'transfer';

export type CategoryId =
  | 'food'
  | 'commute'
  | 'shopping'
  | 'utilities'
  | 'salary'
  | 'freelance'
  | 'invest'
  | 'other';

export type AccountId = 'scb' | 'ktc' | 'kbank' | 'cash' | 'innovestx' | string;

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  icon: string;
  defaultType: TransactionType;
  color: string;
}

export interface AccountInfo {
  id: AccountId;
  name: string;
  subname: string;
  type: 'savings' | 'credit' | 'cash' | 'investment' | 'wallet';
  balance: number;
  icon: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: CategoryId;
  categoryName?: string;
  accountId: AccountId;
  destinationAccountId?: AccountId;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  note: string;
  subNote?: string;
  status: 'completed' | 'pending';
}

export interface CategoryBudget {
  categoryId: CategoryId;
  name: string;
  icon: string;
  allocated: number;
  spent: number;
  alertThreshold: number; // e.g. 0.8 or 0.9
  isFixed?: boolean;
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  category: string;
  currentAmount: number;
  targetAmount: number;
  targetDate?: string;
  priority: 'highest' | 'high' | 'medium' | 'pleasure';
  priorityLabel: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

export type ActiveTab = 'dashboard' | 'transactions' | 'reports' | 'budgets';
