import { create } from 'zustand';
import client from '../api/client';
import { useDashboardStore } from './useDashboardStore';

interface Expense {
  id: string;
  title: string;
  amount: number;
  description?: string;
  expenseDate: string;
  categoryId: string;
  category?: { id: string; name: string };
  creditCardId?: string;
  excludeFromAnalytics?: boolean;
  creditCard?: { id: string; name: string };
}

interface Income {
  id: string;
  title: string;
  amount: number;
  description?: string;
  incomeDate: string;
  categoryId: string;
  category?: { id: string; name: string };
}

interface Investment {
  id: string;
  name: string;
  type: string;
  amountInvested: number;
  currentValue: number;
  purchaseDate: string;
  notes?: string;
  symbol?: string;
  quantity?: number;
  gl?: number;
  glp?: number;
  alloc?: number;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  description?: string;
  progressPercentage?: number;
  remainingAmount?: number;
  estimatedCompletion?: string;
  suggestion?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  action: string;
  metadata?: any;
  createdAt: string;
}

interface FinanceState {
  expenses: Expense[];
  expensesTotal: number;
  expensesPage: number;
  expensesLimit: number;
  expensesTotalPages: number;
  incomes: Income[];
  incomesTotal: number;
  incomesPage: number;
  incomesLimit: number;
  incomesTotalPages: number;
  investments: Investment[];
  investmentsTotal: number;
  investmentsPage: number;
  investmentsLimit: number;
  investmentsTotalPages: number;
  goals: Goal[];
  expenseCategories: Category[];
  incomeCategories: Category[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  loading: boolean;
  error: string | null;

  fetchExpenses: (query?: any, append?: boolean) => Promise<any>;
  addExpense: (data: any) => Promise<Expense>;
  updateExpense: (id: string, data: any) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;

  fetchIncomes: (query?: any, append?: boolean) => Promise<any>;
  addIncome: (data: any) => Promise<Income>;
  updateIncome: (id: string, data: any) => Promise<Income>;
  deleteIncome: (id: string) => Promise<void>;

  fetchInvestments: (query?: any, append?: boolean) => Promise<any>;
  addInvestment: (data: any) => Promise<Investment>;
  updateInvestment: (id: string, data: any) => Promise<Investment>;
  deleteInvestment: (id: string) => Promise<void>;
  syncInvestments: () => Promise<void>;

  fetchGoals: () => Promise<Goal[]>;
  addGoal: (data: any) => Promise<Goal>;
  updateGoal: (id: string, data: any) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<void>;

  fetchExpenseCategories: () => Promise<Category[]>;
  addExpenseCategory: (name: string) => Promise<Category>;
  deleteExpenseCategory: (id: string) => Promise<void>;

  fetchIncomeCategories: () => Promise<Category[]>;
  addIncomeCategory: (name: string) => Promise<Category>;
  deleteIncomeCategory: (id: string) => Promise<void>;

  fetchNotifications: () => Promise<Notification[]>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  fetchActivityLogs: () => Promise<ActivityLog[]>;
}

const triggerDashboardRefresh = () => {
  // Invalidate dashboard and analytics metrics immediately after mutation
  const store = useDashboardStore.getState();

  store.fetchSummary().catch(console.error);
  store.fetchMonthlyAggregation().catch(console.error);
  store.fetchCategoryBreakdown().catch(console.error);
  store.fetchCashFlow().catch(console.error);
  store.fetchInvestmentAllocation().catch(console.error);
  store.fetchNetWorthHistory().catch(console.error);
  store.fetchSpendingTrends().catch(console.error);
  store.fetchIncomeTrends().catch(console.error);
  store.fetchTopCategories().catch(console.error);
  store.fetchSavingsAnalysis().catch(console.error);
  store.fetchInvestmentPerformance().catch(console.error);

  // Refresh credit cards dynamically to break circular dependencies
  import('./useCreditCardStore').then((m) => {
    m.useCreditCardStore.getState().fetchCards().catch(console.error);
  }).catch(() => {});
};

export const useFinanceStore = create<FinanceState>((set, get) => ({
  expenses: [],
  expensesTotal: 0,
  expensesPage: 1,
  expensesLimit: 20, // default limit to 20 for standard paginated operations
  expensesTotalPages: 1,
  incomes: [],
  incomesTotal: 0,
  incomesPage: 1,
  incomesLimit: 20,
  incomesTotalPages: 1,
  investments: [],
  investmentsTotal: 0,
  investmentsPage: 1,
  investmentsLimit: 20,
  investmentsTotalPages: 1,
  goals: [],
  expenseCategories: [],
  incomeCategories: [],
  notifications: [],
  activityLogs: [],
  loading: false,
  error: null,

  fetchExpenses: async (query, append = false) => {
    set({ loading: true, error: null });
    try {
      const response: any = await client.get('/expenses', { params: query });
      const newItems = response.items.map((item: any) => ({
        ...item,
        amount: Number(item.amount),
      }));
      set({
        expenses: append ? [...get().expenses, ...newItems] : newItems,
        expensesTotal: response.total,
        expensesPage: response.page,
        expensesLimit: response.limit,
        expensesTotalPages: response.totalPages,
        loading: false,
      });
      return response;
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addExpense: async (data) => {
    set({ loading: true, error: null });
    try {
      const expense: any = await client.post('/expenses', data);
      set({ loading: false });
      triggerDashboardRefresh();
      get().fetchExpenses();
      get().fetchNotifications();
      get().fetchActivityLogs();
      return expense;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add expense';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  updateExpense: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const expense: any = await client.patch(`/expenses/${id}`, data);
      set({ loading: false });
      triggerDashboardRefresh();
      get().fetchExpenses();
      get().fetchNotifications();
      get().fetchActivityLogs();
      return expense;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update expense';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  deleteExpense: async (id) => {
    set({ loading: true, error: null });
    try {
      await client.delete(`/expenses/${id}`);
      set({ loading: false });
      triggerDashboardRefresh();
      get().fetchExpenses();
      get().fetchNotifications();
      get().fetchActivityLogs();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete expense';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  fetchIncomes: async (query, append = false) => {
    set({ loading: true, error: null });
    try {
      const response: any = await client.get('/incomes', { params: query });
      const newItems = response.items.map((item: any) => ({
        ...item,
        amount: Number(item.amount),
      }));
      set({
        incomes: append ? [...get().incomes, ...newItems] : newItems,
        incomesTotal: response.total,
        incomesPage: response.page,
        incomesLimit: response.limit,
        incomesTotalPages: response.totalPages,
        loading: false,
      });
      return response;
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addIncome: async (data) => {
    set({ loading: true, error: null });
    try {
      const income: any = await client.post('/incomes', data);
      set({ loading: false });
      triggerDashboardRefresh();
      get().fetchIncomes();
      get().fetchNotifications();
      get().fetchActivityLogs();
      return income;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add income';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  updateIncome: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const income: any = await client.patch(`/incomes/${id}`, data);
      set({ loading: false });
      triggerDashboardRefresh();
      get().fetchIncomes();
      get().fetchNotifications();
      get().fetchActivityLogs();
      return income;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update income';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  deleteIncome: async (id) => {
    set({ loading: true, error: null });
    try {
      await client.delete(`/incomes/${id}`);
      set({ loading: false });
      triggerDashboardRefresh();
      get().fetchIncomes();
      get().fetchNotifications();
      get().fetchActivityLogs();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete income';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  fetchInvestments: async (query, append = false) => {
    set({ loading: true, error: null });
    try {
      const response: any = await client.get('/investments', { params: query });
      const items = response.items || [];
      const newItems = items.map((i: any) => {
        const amountInvested = Number(i.amountInvested);
        const currentValue = Number(i.currentValue);
        const gl = currentValue - amountInvested;
        const glp = amountInvested > 0 ? (gl / amountInvested) * 100 : 0;
        return {
          ...i,
          amountInvested,
          currentValue,
          gl,
          glp,
        };
      });

      const updatedInvestments = append ? [...get().investments, ...newItems] : newItems;

      // Calculate allocation percentages
      const totalVal = updatedInvestments.reduce((sum: number, inv: any) => sum + inv.currentValue, 0);
      const investmentsWithAlloc = updatedInvestments.map((inv: any) => ({
        ...inv,
        alloc: totalVal > 0 ? Math.round((inv.currentValue / totalVal) * 100) : 0,
      }));

      set({
        investments: investmentsWithAlloc,
        investmentsTotal: response.total,
        investmentsPage: response.page,
        investmentsLimit: response.limit,
        investmentsTotalPages: response.totalPages,
        loading: false,
      });
      return response;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return [];
    }
  },

  addInvestment: async (data) => {
    set({ loading: true, error: null });
    try {
      const item: any = await client.post('/investments', data);
      set({ loading: false });
      triggerDashboardRefresh();
      get().fetchInvestments();
      get().fetchNotifications();
      get().fetchActivityLogs();
      return item;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add investment';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  updateInvestment: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const item: any = await client.patch(`/investments/${id}`, data);
      set({ loading: false });
      triggerDashboardRefresh();
      get().fetchInvestments();
      get().fetchNotifications();
      get().fetchActivityLogs();
      return item;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update investment';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  deleteInvestment: async (id) => {
    set({ loading: true, error: null });
    try {
      await client.delete(`/investments/${id}`);
      set({ loading: false });
      triggerDashboardRefresh();
      get().fetchInvestments();
      get().fetchNotifications();
      get().fetchActivityLogs();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete investment';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  syncInvestments: async () => {
    set({ loading: true, error: null });
    try {
      await client.post('/investments/sync-prices');
      await get().fetchInvestments();
      triggerDashboardRefresh();
      set({ loading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to sync investment prices';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  fetchGoals: async () => {
    set({ loading: true, error: null });
    try {
      const items: any = await client.get('/goals');
      const goals = items.map((g: any) => ({
        ...g,
        targetAmount: Number(g.targetAmount),
        currentAmount: Number(g.currentAmount),
        progressPercentage: Number(g.progressPercentage),
        remainingAmount: Number(g.remainingAmount),
      }));
      set({ goals, loading: false });
      return goals;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return [];
    }
  },

  addGoal: async (data) => {
    set({ loading: true, error: null });
    try {
      const item: any = await client.post('/goals', data);
      set({ loading: false });
      triggerDashboardRefresh();
      get().fetchGoals();
      get().fetchNotifications();
      get().fetchActivityLogs();
      return item;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create goal';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  updateGoal: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const item: any = await client.patch(`/goals/${id}`, data);
      set({ loading: false });
      triggerDashboardRefresh();
      get().fetchGoals();
      get().fetchNotifications();
      get().fetchActivityLogs();
      return item;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update goal';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  deleteGoal: async (id) => {
    set({ loading: true, error: null });
    try {
      await client.delete(`/goals/${id}`);
      set({ loading: false });
      triggerDashboardRefresh();
      get().fetchGoals();
      get().fetchNotifications();
      get().fetchActivityLogs();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete goal';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  fetchExpenseCategories: async () => {
    try {
      const cats: any = await client.get('/expense-categories');
      set({ expenseCategories: cats });
      return cats;
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  addExpenseCategory: async (name) => {
    try {
      const cat: any = await client.post('/expense-categories', { name });
      get().fetchExpenseCategories();
      return cat;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create category');
    }
  },

  deleteExpenseCategory: async (id) => {
    try {
      await client.delete(`/expense-categories/${id}`);
      get().fetchExpenseCategories();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete category');
    }
  },

  fetchIncomeCategories: async () => {
    try {
      const cats: any = await client.get('/income-categories');
      set({ incomeCategories: cats });
      return cats;
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  addIncomeCategory: async (name) => {
    try {
      const cat: any = await client.post('/income-categories', { name });
      get().fetchIncomeCategories();
      return cat;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create category');
    }
  },

  deleteIncomeCategory: async (id) => {
    try {
      await client.delete(`/income-categories/${id}`);
      get().fetchIncomeCategories();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete category');
    }
  },

  fetchNotifications: async () => {
    try {
      const notifs: any = await client.get('/notifications');
      set({ notifications: notifs });
      return notifs;
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  markNotificationRead: async (id) => {
    try {
      await client.patch(`/notifications/${id}/read`);
      get().fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  },

  markAllNotificationsRead: async () => {
    try {
      await client.patch('/notifications/read-all');
      get().fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  },

  fetchActivityLogs: async () => {
    try {
      const logs: any = await client.get('/activity-logs');
      set({ activityLogs: logs });
      return logs;
    } catch (err) {
      console.error(err);
      return [];
    }
  },
}));
