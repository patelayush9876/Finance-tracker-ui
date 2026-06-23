import { create } from 'zustand';
import client from '../api/client';

interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  totalInvestments: number;
  netWorth: number;
  savingsRate: number;
  incomeTrend?: string;
  expenseTrend?: string;
  netWorthTrend?: string;
  investmentsTrend?: string;
}

interface DashboardState {
  summary: DashboardSummary | null;
  monthlyIncomeExpense: any[];
  categoryBreakdown: any[];
  cashFlow: any[];
  investmentAllocation: any[];
  netWorthHistory: any[];
  spendingTrends: any | null;
  incomeTrends: any | null;
  topCategories: any[];
  savingsAnalysis: any[];
  investmentPerformance: any | null;
  loading: boolean;
  error: string | null;

  fetchSummary: () => Promise<void>;
  fetchMonthlyAggregation: () => Promise<void>;
  fetchCategoryBreakdown: () => Promise<void>;
  fetchCashFlow: () => Promise<void>;
  fetchInvestmentAllocation: () => Promise<void>;
  fetchNetWorthHistory: () => Promise<void>;
  fetchSpendingTrends: () => Promise<void>;
  fetchIncomeTrends: () => Promise<void>;
  fetchTopCategories: () => Promise<void>;
  fetchSavingsAnalysis: () => Promise<void>;
  fetchInvestmentPerformance: () => Promise<void>;
  fetchAllDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  summary: null,
  monthlyIncomeExpense: [],
  categoryBreakdown: [],
  cashFlow: [],
  investmentAllocation: [],
  netWorthHistory: [],
  spendingTrends: null,
  incomeTrends: null,
  topCategories: [],
  savingsAnalysis: [],
  investmentPerformance: null,
  loading: false,
  error: null,

  fetchSummary: async () => {
    try {
      const summary: any = await client.get('/dashboard/summary');
      set({ summary });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchMonthlyAggregation: async () => {
    try {
      const monthlyIncomeExpense: any = await client.get('/dashboard/monthly-income-expense');
      set({ monthlyIncomeExpense });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchCategoryBreakdown: async () => {
    try {
      const categoryBreakdown: any = await client.get('/dashboard/category-breakdown');
      set({ categoryBreakdown });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchCashFlow: async () => {
    try {
      const cashFlow: any = await client.get('/dashboard/cash-flow');
      set({ cashFlow });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchInvestmentAllocation: async () => {
    try {
      const investmentAllocation: any = await client.get('/dashboard/investment-allocation');
      set({ investmentAllocation });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchNetWorthHistory: async () => {
    try {
      const netWorthHistory: any = await client.get('/dashboard/net-worth-history');
      set({ netWorthHistory });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchSpendingTrends: async () => {
    try {
      const spendingTrends: any = await client.get('/analytics/spending-trends');
      set({ spendingTrends });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchIncomeTrends: async () => {
    try {
      const incomeTrends: any = await client.get('/analytics/income-trends');
      set({ incomeTrends });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchTopCategories: async () => {
    try {
      const topCategories: any = await client.get('/analytics/top-categories');
      set({ topCategories });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchSavingsAnalysis: async () => {
    try {
      const savingsAnalysis: any = await client.get('/analytics/savings-analysis');
      set({ savingsAnalysis });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchInvestmentPerformance: async () => {
    try {
      const investmentPerformance: any = await client.get('/analytics/investment-performance');
      set({ investmentPerformance });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchAllDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().fetchSummary(),
        get().fetchMonthlyAggregation(),
        get().fetchCategoryBreakdown(),
        get().fetchCashFlow(),
        get().fetchInvestmentAllocation(),
        get().fetchNetWorthHistory(),
        get().fetchSpendingTrends(),
        get().fetchIncomeTrends(),
        get().fetchTopCategories(),
        get().fetchSavingsAnalysis(),
        get().fetchInvestmentPerformance(),
      ]);
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
}));
export default useDashboardStore;
