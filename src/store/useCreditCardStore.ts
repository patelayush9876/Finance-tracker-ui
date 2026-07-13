import { create } from 'zustand';
import client from '../api/client';
import { useFinanceStore } from './useFinanceStore';

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  dueDate: number;
  billingDate: number;
  last4?: string;
  network: string;
  outstandingBalance: number;
  availableLimit: number;
  expenses?: any[];
  createdAt: string;
}

interface CreditCardState {
  cards: CreditCard[];
  loading: boolean;
  error: string | null;

  fetchCards: () => Promise<CreditCard[]>;
  addCard: (data: any) => Promise<CreditCard>;
  updateCard: (id: string, data: any) => Promise<CreditCard>;
  deleteCard: (id: string) => Promise<void>;
  payBill: (id: string, data: { amount: number; paymentDate?: string }) => Promise<void>;
}

export const useCreditCardStore = create<CreditCardState>((set, get) => ({
  cards: [],
  loading: false,
  error: null,

  fetchCards: async () => {
    set({ loading: true, error: null });
    try {
      const response: any = await client.get('/credit-cards');
      set({ cards: response, loading: false });
      return response;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return [];
    }
  },

  addCard: async (data) => {
    set({ loading: true, error: null });
    try {
      const card: any = await client.post('/credit-cards', data);
      set({ loading: false });
      get().fetchCards();
      return card;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add card';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  updateCard: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const card: any = await client.patch(`/credit-cards/${id}`, data);
      set({ loading: false });
      get().fetchCards();
      return card;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update card';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  deleteCard: async (id) => {
    set({ loading: true, error: null });
    try {
      await client.delete(`/credit-cards/${id}`);
      set({ loading: false });
      get().fetchCards();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete card';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  payBill: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await client.post(`/credit-cards/${id}/pay-bill`, data);
      set({ loading: false });
      
      // Refresh credit cards
      get().fetchCards();
      
      // Refresh expenses & dashboard data in the finance store
      const financeStore = useFinanceStore.getState();
      financeStore.fetchExpenses();
      financeStore.fetchNotifications();
      financeStore.fetchActivityLogs();
      
      // Since paying a bill triggers a refresh on the dashboard in backend, we should trigger a refresh on frontend dashboard
      // We can do that by importing/triggering the dashboard refresh if needed or calling fetchExpenses which triggers the dashboard aggregation
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to make bill payment';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },
}));
