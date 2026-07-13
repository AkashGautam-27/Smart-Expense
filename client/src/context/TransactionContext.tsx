import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Transaction, Budget, CategoryBudgetStatus, OCRResult } from '../types';
import { useAuth } from './AuthContext';
import api from '../utils/api';

interface TransactionContextType {
  transactions: Transaction[];
  budgets: Budget[];
  isLoading: boolean;
  refreshAll: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'userId'>) => Promise<Transaction>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  saveBudget: (category: string, limit: number) => Promise<Budget>;
  scanReceipt: (base64Image: string, mimeType: string) => Promise<OCRResult>;
  budgetStatuses: CategoryBudgetStatus[];
  budgetAlerts: string[];
  clearAlerts: () => void;
  voiceFilter: { query: string; active: boolean; matchingIds: string[] | null; summary: string | null } | null;
  setVoiceFilter: (filter: { query: string; active: boolean; matchingIds: string[] | null; summary: string | null } | null) => void;
  clearVoiceFilter: () => void;
  parseVoiceCommand: (queryText: string) => Promise<any>;
  getAdvisorInsights: () => Promise<any>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Budget standard categories helper
export const STANDARD_CATEGORIES = [
  'Food',
  'Housing',
  'Entertainment',
  'Utilities',
  'Transportation',
  'Shopping',
];

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-emerald-500 text-emerald-500 border-emerald-500 dark:bg-emerald-950/40',
  Housing: 'bg-blue-500 text-blue-500 border-blue-500 dark:bg-blue-950/40',
  Entertainment: 'bg-indigo-500 text-indigo-500 border-indigo-500 dark:bg-indigo-950/40',
  Utilities: 'bg-amber-500 text-amber-500 border-amber-500 dark:bg-amber-950/40',
  Transportation: 'bg-rose-500 text-rose-500 border-rose-500 dark:bg-rose-950/40',
  Shopping: 'bg-purple-500 text-purple-500 border-purple-500 dark:bg-purple-950/40',
};

export function TransactionProvider({ children }: { children: ReactNode }) {
  const { authState } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [budgetAlerts, setBudgetAlerts] = useState<string[]>([]);
  const [voiceFilter, setVoiceFilter] = useState<{ query: string; active: boolean; matchingIds: string[] | null; summary: string | null } | null>(null);

  const refreshAll = async () => {
    if (!authState.user) return;
    setIsLoading(true);
    try {
      const [txRes, bRes] = await Promise.all([
        api.get('/api/transactions'),
        api.get('/api/budgets'),
      ]);

      setTransactions(txRes.data);
      setBudgets(bRes.data);
    } catch (e) {
      console.error('Failed to refresh financial tracker data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Keep transactions in sync with active authentication
  useEffect(() => {
    if (authState.user) {
      refreshAll();
    } else {
      setTransactions([]);
      setBudgets([]);
      setBudgetAlerts([]);
    }
  }, [authState.user]);

  const addTransaction = async (txData: Omit<Transaction, 'id' | 'userId'>) => {
    try {
      const res = await api.post('/api/transactions', txData);
      const newTx = res.data;
      setTransactions(prev => [newTx, ...prev]);

      // Dynamic check for newly added transactions against category budget triggers
      checkTransactionAllocations(newTx, 'add');

      return newTx;
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || e.message || 'Transaction creation failed.';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateTransaction = async (id: string, txData: Partial<Transaction>) => {
    try {
      const res = await api.put(`/api/transactions/${id}`, txData);
      const updatedTx = res.data;
      setTransactions(prev => prev.map(t => (t.id === id ? updatedTx : t)));

      refreshAll(); // Reload fully to preserve accuracy and run limit warning comparisons

      return updatedTx;
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || e.message || 'Transaction modification failed';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await api.delete(`/api/transactions/${id}`);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || e.message || 'Transaction deletion failed';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const saveBudget = async (category: string, limit: number) => {
    try {
      const res = await api.post('/api/budgets', { category, limit });
      const newBudget = res.data;
      setBudgets(prev => {
        const index = prev.findIndex(b => b.category === category);
        if (index !== -1) {
          const next = [...prev];
          next[index] = newBudget;
          return next;
        }
        return [...prev, newBudget];
      });

      return newBudget;
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || e.message || 'Budget update failed.';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const scanReceipt = async (base64Image: string, mimeType: string): Promise<OCRResult> => {
    try {
      const res = await api.post('/api/ai/scan-receipt', { base64Image, mimeType });
      return res.data.data as OCRResult;
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || e.message || 'Receipt analysis failed';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearAlerts = () => {
    setBudgetAlerts([]);
  };

  const clearVoiceFilter = () => {
    setVoiceFilter(null);
  };

  const parseVoiceCommand = async (queryText: string): Promise<any> => {
    try {
      const res = await api.post('/api/ai/parse-voice-command', { query: queryText, transactions });
      return res.data.data;
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || e.message || 'Voice interpretation failed';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getAdvisorInsights = async (): Promise<any> => {
    try {
      const res = await api.post('/api/ai/insights-advisor', { transactions, budgets, budgetStatuses });
      return res.data.data;
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || e.message || 'Failed to fetch insights';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Compute Spent vs Budgets status for standard categories in the CURRENT MONTH
  const budgetStatuses: CategoryBudgetStatus[] = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed

    // Calculate spend per category for expenses in this month
    const monthlyExpenses = transactions.filter(t => {
      if (t.type !== 'expense') return false;
      const txDate = new Date(t.date + 'T00:00:00');
      return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
    });

    const categorySums = monthlyExpenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return STANDARD_CATEGORIES.map(category => {
      const bObj = budgets.find(b => b.category === category);
      const limit = bObj ? bObj.limit : 0;
      const spent = categorySums[category] || 0;
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;

      let color = 'green';
      if (percentage >= 100) {
        color = 'red';
      } else if (percentage >= 80) {
        color = 'yellow';
      }

      return {
        category,
        limit,
        spent: parseFloat(spent.toFixed(2)),
        percentage: parseFloat(percentage.toFixed(1)),
        color,
      };
    });
  }, [transactions, budgets]);

  // Check state to trigger toast notifications when thresholds are newly breached
  const checkTransactionAllocations = (tx: Transaction, triggerType: 'add' | 'update') => {
    if (tx.type !== 'expense') return;

    // Calculate current month's spent for this category
    const category = tx.category;
    const bObj = budgets.find(b => b.category === category);
    if (!bObj || bObj.limit <= 0) return;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const categoryMothExpenses = transactions.filter(t => {
      if (t.type !== 'expense' || t.category !== category) return false;
      const txDate = new Date(t.date + 'T00:00:00');
      return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
    });

    // Sum up + the new transaction amount
    const alreadySpent = categoryMothExpenses.reduce((sum, t) => sum + t.amount, 0);
    const totalSpent = alreadySpent + tx.amount;
    const ratio = totalSpent / bObj.limit;

    if (ratio >= 1.0) {
      setBudgetAlerts(prev => [
        ...prev,
        `⚠️ Over Limit! You have spent ₹${totalSpent.toFixed(2)} on "${category}" which is ${((ratio) * 100).toFixed(0)}% of your monthly ₹${bObj.limit} budget limit.`
      ]);
    } else if (ratio >= 0.8) {
      setBudgetAlerts(prev => [
        ...prev,
        `🚨 High Consumption Warning! You have spent ₹${totalSpent.toFixed(2)} on "${category}", utilizing over ${((ratio) * 100).toFixed(0)}% of your monthly ₹${bObj.limit} limit.`
      ]);
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        budgets,
        isLoading,
        refreshAll,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        saveBudget,
        scanReceipt,
        budgetStatuses,
        budgetAlerts,
        clearAlerts,
        voiceFilter,
        setVoiceFilter,
        clearVoiceFilter,
        parseVoiceCommand,
        getAdvisorInsights,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be active inside a TransactionProvider');
  }
  return context;
}
