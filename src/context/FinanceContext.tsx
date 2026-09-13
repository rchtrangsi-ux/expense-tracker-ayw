import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { ACCOUNTS, CATEGORIES, INITIAL_BUDGETS, INITIAL_GOALS, INITIAL_TRANSACTIONS } from '../data/initialData';
import { AccountInfo, ActiveTab, CategoryBudget, CategoryId, CategoryInfo, SavingsGoal, Transaction } from '../types';

interface FinanceContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  transactions: Transaction[];
  categories: CategoryInfo[];
  accounts: AccountInfo[];
  budgets: CategoryBudget[];
  goals: SavingsGoal[];
  isAddTxModalOpen: boolean;
  setIsAddTxModalOpen: (open: boolean) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'status'>) => void;
  deleteTransaction: (id: string) => void;
  editTransaction: (id: string, updated: Partial<Transaction>) => void;
  addAccount: (acc: Omit<AccountInfo, 'id'> & { id?: string }) => void;
  editAccount: (id: string, updated: Partial<AccountInfo>) => void;
  deleteAccount: (id: string) => void;
  updateBudget: (categoryId: CategoryId, allocated: number) => void;
  addBudget: (budget: CategoryBudget) => void;
  depositToGoal: (goalId: string, amount: number) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  deleteGoal: (goalId: string) => void;
  exportCsv: () => void;
  resetToDefaults: () => void;
  resetToZero: () => void;
  stats: {
    netWorth: number;
    monthIncome: number;
    monthExpense: number;
    savingsRate: number;
    netSurplus: number;
    budgetTotal: number;
    budgetSpent: number;
    budgetRemaining: number;
  };
  isSyncing: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  // Derive per-user storage key prefix
  const userStorageKey = useMemo(() => {
    return user ? `obsidian_ledger_${user.uid}` : 'obsidian_ledger_guest';
  }, [user]);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return INITIAL_TRANSACTIONS;
  });

  const [accounts, setAccounts] = useState<AccountInfo[]>(() => {
    return ACCOUNTS;
  });

  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => {
    return INITIAL_BUDGETS;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    return INITIAL_GOALS;
  });

  // Load user-specific data from Firestore (or user-scoped LocalStorage as fast cache)
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    setHasLoadedInitialData(false);

    const loadUserData = async () => {
      setIsSyncing(true);
      try {
        // 1. First check local user-scoped storage for instant load
        const cachedTx = localStorage.getItem(`${userStorageKey}_tx`);
        const cachedAcc = localStorage.getItem(`${userStorageKey}_acc`);
        const cachedBud = localStorage.getItem(`${userStorageKey}_bud`);
        const cachedGoals = localStorage.getItem(`${userStorageKey}_goals`);

        if (cachedTx && isMounted) setTransactions(JSON.parse(cachedTx));
        if (cachedAcc && isMounted) setAccounts(JSON.parse(cachedAcc));
        if (cachedBud && isMounted) setBudgets(JSON.parse(cachedBud));
        if (cachedGoals && isMounted) setGoals(JSON.parse(cachedGoals));

        // 2. Fetch from Firestore for cloud persistence
        const userDocRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userDocRef);

        if (snapshot.exists() && isMounted) {
          const data = snapshot.data();
          if (data.transactions) setTransactions(data.transactions);
          if (data.accounts) setAccounts(data.accounts);
          if (data.budgets) setBudgets(data.budgets);
          if (data.goals) setGoals(data.goals);
        } else if (!cachedTx && isMounted) {
          // Brand new user: initialize clean starting data
          setTransactions([]);
          setAccounts(ACCOUNTS.map((a) => ({ ...a, balance: 0 })));
          setBudgets(INITIAL_BUDGETS.map((b) => ({ ...b, allocated: 0, spent: 0 })));
          setGoals(INITIAL_GOALS.map((g) => ({ ...g, currentAmount: 0 })));
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      } finally {
        if (isMounted) {
          setIsSyncing(false);
          setHasLoadedInitialData(true);
        }
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [user, userStorageKey]);

  // Sync back changes to Firestore and user-scoped LocalStorage
  useEffect(() => {
    if (!user || !hasLoadedInitialData) return;

    // Cache locally immediately
    try {
      localStorage.setItem(`${userStorageKey}_tx`, JSON.stringify(transactions));
      localStorage.setItem(`${userStorageKey}_acc`, JSON.stringify(accounts));
      localStorage.setItem(`${userStorageKey}_bud`, JSON.stringify(budgets));
      localStorage.setItem(`${userStorageKey}_goals`, JSON.stringify(goals));
    } catch (e) {
      console.error('Local cache error:', e);
    }

    // Debounced write to Firestore
    const timeout = setTimeout(async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(
          userDocRef,
          {
            transactions,
            accounts,
            budgets,
            goals,
            userEmail: user.email,
            userName: user.displayName,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Error saving data to Firestore:', err);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [user, userStorageKey, hasLoadedInitialData, transactions, accounts, budgets, goals]);

  // Compute live stats accurately
  const stats = useMemo(() => {
    let monthIncome = 0;
    let monthExpense = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        monthIncome += tx.amount;
      } else if (tx.type === 'expense') {
        monthExpense += tx.amount;
      }
    });

    const netSurplus = monthIncome - monthExpense;
    const savingsRate = monthIncome > 0 ? Math.max(0, Math.round((netSurplus / monthIncome) * 100)) : 0;
    const netWorth = accounts.reduce((acc, curr) => acc + curr.balance, 0);

    const budgetTotal = budgets.reduce((acc, curr) => acc + curr.allocated, 0);
    const budgetSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
    const budgetRemaining = Math.max(0, budgetTotal - budgetSpent);

    return {
      netWorth,
      monthIncome,
      monthExpense,
      savingsRate,
      netSurplus,
      budgetTotal,
      budgetSpent,
      budgetRemaining,
    };
  }, [transactions, accounts, budgets]);

  const addTransaction = (txData: Omit<Transaction, 'id' | 'status'>) => {
    const cat = CATEGORIES.find((c) => c.id === txData.categoryId);
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      categoryName: cat ? cat.name : 'อื่นๆ',
      status: 'completed',
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update account balances
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (newTx.type === 'income' && acc.id === newTx.accountId) {
          return { ...acc, balance: acc.balance + newTx.amount };
        }
        if (newTx.type === 'expense' && acc.id === newTx.accountId) {
          return { ...acc, balance: acc.balance - newTx.amount };
        }
        if (newTx.type === 'transfer') {
          if (acc.id === newTx.accountId) {
            return { ...acc, balance: acc.balance - newTx.amount };
          }
          if (acc.id === newTx.destinationAccountId) {
            return { ...acc, balance: acc.balance + newTx.amount };
          }
        }
        return acc;
      })
    );

    // If it's an expense, update matching category budget spent
    if (newTx.type === 'expense') {
      setBudgets((prevBudgets) =>
        prevBudgets.map((b) => {
          if (b.categoryId === newTx.categoryId) {
            return { ...b, spent: b.spent + newTx.amount };
          }
          return b;
        })
      );
    }
  };

  const deleteTransaction = (id: string) => {
    const targetTx = transactions.find((t) => t.id === id);
    if (targetTx) {
      // Revert account balances
      setAccounts((prevAccounts) =>
        prevAccounts.map((acc) => {
          if (targetTx.type === 'income' && acc.id === targetTx.accountId) {
            return { ...acc, balance: acc.balance - targetTx.amount };
          }
          if (targetTx.type === 'expense' && acc.id === targetTx.accountId) {
            return { ...acc, balance: acc.balance + targetTx.amount };
          }
          if (targetTx.type === 'transfer') {
            if (acc.id === targetTx.accountId) {
              return { ...acc, balance: acc.balance + targetTx.amount };
            }
            if (acc.id === targetTx.destinationAccountId) {
              return { ...acc, balance: acc.balance - targetTx.amount };
            }
          }
          return acc;
        })
      );

      // Revert budget spent
      if (targetTx.type === 'expense') {
        setBudgets((prevBudgets) =>
          prevBudgets.map((b) => {
            if (b.categoryId === targetTx.categoryId) {
              return { ...b, spent: Math.max(0, b.spent - targetTx.amount) };
            }
            return b;
          })
        );
      }
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const editTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, ...updated };
        }
        return t;
      })
    );
  };

  const addAccount = (newAccData: Omit<AccountInfo, 'id'> & { id?: string }) => {
    const newAcc: AccountInfo = {
      ...newAccData,
      id: newAccData.id || `acc-${Date.now()}`,
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const editAccount = (id: string, updated: Partial<AccountInfo>) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
  };

  const updateBudget = (categoryId: CategoryId, allocated: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.categoryId === categoryId ? { ...b, allocated } : b))
    );
  };

  const addBudget = (budget: CategoryBudget) => {
    setBudgets((prev) => {
      const exists = prev.some((b) => b.categoryId === budget.categoryId);
      if (exists) {
        return prev.map((b) => (b.categoryId === budget.categoryId ? budget : b));
      }
      return [...prev, budget];
    });
  };

  const depositToGoal = (goalId: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newCurrent = Math.min(g.targetAmount, g.currentAmount + amount);
          return { ...g, currentAmount: newCurrent };
        }
        return g;
      })
    );
  };

  const addGoal = (newGoalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...newGoalData,
      id: `goal-${Date.now()}`,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const deleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const exportCsv = () => {
    const headers = ['ID', 'Date', 'Time', 'Type', 'Category', 'Account', 'Amount', 'Note', 'SubNote'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.time,
      t.type,
      `"${t.categoryName || t.categoryId}"`,
      t.accountId,
      t.type === 'expense' ? -t.amount : t.amount,
      `"${t.note.replace(/"/g, '""')}"`,
      `"${(t.subNote || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `obsidian-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetToZero = () => {
    try {
      localStorage.removeItem(`${userStorageKey}_tx`);
      localStorage.removeItem(`${userStorageKey}_acc`);
      localStorage.removeItem(`${userStorageKey}_bud`);
      localStorage.removeItem(`${userStorageKey}_goals`);
    } catch (e) {
      console.error(e);
    }
    setTransactions([]);
    setAccounts(ACCOUNTS.map((a) => ({ ...a, balance: 0 })));
    setBudgets(INITIAL_BUDGETS.map((b) => ({ ...b, allocated: 0, spent: 0 })));
    setGoals(INITIAL_GOALS.map((g) => ({ ...g, currentAmount: 0 })));
  };

  const resetToDefaults = () => {
    resetToZero();
  };

  return (
    <FinanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        transactions,
        categories: CATEGORIES,
        accounts,
        addAccount,
        editAccount,
        deleteAccount,
        budgets,
        goals,
        isAddTxModalOpen,
        setIsAddTxModalOpen,
        addTransaction,
        deleteTransaction,
        editTransaction,
        updateBudget,
        addBudget,
        depositToGoal,
        addGoal,
        deleteGoal,
        exportCsv,
        resetToDefaults,
        resetToZero,
        stats,
        isSyncing,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
