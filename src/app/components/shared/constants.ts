import {
  BarChart2, Briefcase, Target, CreditCard, Shield,
  Zap, Home, Settings, TrendingUp
} from "lucide-react";

export const MONTHLY = [
  { month: "Jan", income: 82000, expenses: 51000, savings: 31000 },
  { month: "Feb", income: 82000, expenses: 48000, savings: 34000 },
  { month: "Mar", income: 91000, expenses: 56000, savings: 35000 },
  { month: "Apr", income: 87000, expenses: 52000, savings: 35000 },
  { month: "May", income: 94000, expenses: 58000, savings: 36000 },
  { month: "Jun", income: 98000, expenses: 61000, savings: 37000 },
  { month: "Jul", income: 102000, expenses: 59000, savings: 43000 },
  { month: "Aug", income: 96000, expenses: 63000, savings: 33000 },
  { month: "Sep", income: 108000, expenses: 65000, savings: 43000 },
  { month: "Oct", income: 112000, expenses: 62000, savings: 50000 },
  { month: "Nov", income: 106000, expenses: 71000, savings: 35000 },
  { month: "Dec", income: 124000, expenses: 82000, savings: 42000 },
];

export const TRANSACTIONS = [
  { id: 1, date: "2026-06-20", desc: "Salary — June 2026", cat: "Salary", amt: 85000, type: "income", acct: "HDFC Bank" },
  { id: 2, date: "2026-06-19", desc: "Zepto — Groceries", cat: "Groceries", amt: -2340, type: "expense", acct: "HDFC Bank" },
  { id: 3, date: "2026-06-18", desc: "Swiggy — Dinner", cat: "Food & Dining", amt: -680, type: "expense", acct: "ICICI Credit" },
  { id: 4, date: "2026-06-17", desc: "Amazon — Keyboard", cat: "Shopping", amt: -4999, type: "expense", acct: "ICICI Credit" },
  { id: 5, date: "2026-06-16", desc: "Freelance — UI Design", cat: "Freelance", amt: 15000, type: "income", acct: "HDFC Bank" },
  { id: 6, date: "2026-06-15", desc: "Netflix Subscription", cat: "Entertainment", amt: -799, type: "expense", acct: "HDFC Bank" },
  { id: 7, date: "2026-06-14", desc: "Ola Cabs — 12 rides", cat: "Transport", amt: -1200, type: "expense", acct: "Paytm" },
  { id: 8, date: "2026-06-13", desc: "Reliance Smart", cat: "Groceries", amt: -3100, type: "expense", acct: "HDFC Bank" },
  { id: 9, date: "2026-06-12", desc: "Dividend — HDFC Fund", cat: "Investments", amt: 2340, type: "income", acct: "Zerodha" },
  { id: 10, date: "2026-06-11", desc: "Electricity Bill", cat: "Utilities", amt: -1840, type: "expense", acct: "HDFC Bank" },
  { id: 11, date: "2026-06-10", desc: "Apollo Pharmacy", cat: "Healthcare", amt: -560, type: "expense", acct: "ICICI Credit" },
  { id: 12, date: "2026-06-09", desc: "Spotify Premium", cat: "Entertainment", amt: -199, type: "expense", acct: "HDFC Bank" },
];

export const INVESTMENTS = [
  { id: 1, name: "Nifty 50 Index Fund", type: "Mutual Fund", value: 285000, invested: 240000, gl: 45000, glp: 18.75, alloc: 28, color: "#10b981" },
  { id: 2, name: "Infosys Ltd", type: "Stock", value: 124500, invested: 98000, gl: 26500, glp: 27.04, alloc: 12, color: "#3b82f6" },
  { id: 3, name: "HDFC Fixed Deposit", type: "Fixed Deposit", value: 200000, invested: 186000, gl: 14000, glp: 7.53, alloc: 20, color: "#f59e0b" },
  { id: 4, name: "Digital Gold — Zerodha", type: "Gold", value: 98000, invested: 80000, gl: 18000, glp: 22.5, alloc: 10, color: "#eab308" },
  { id: 5, name: "Bitcoin", type: "Crypto", value: 156000, invested: 120000, gl: 36000, glp: 30.0, alloc: 15, color: "#f97316" },
  { id: 6, name: "Mirae Asset Large Cap", type: "Mutual Fund", value: 145000, invested: 130000, gl: 15000, glp: 11.54, alloc: 15, color: "#8b5cf6" },
];

export const GOALS = [
  { id: 1, name: "Emergency Fund", target: 500000, current: 320000, deadline: "2026-12-31", cat: "Emergency", color: "#10b981" },
  { id: 2, name: "Europe Trip 2027", target: 250000, current: 87500, deadline: "2027-03-31", cat: "Travel", color: "#3b82f6" },
  { id: 3, name: "New MacBook Pro", target: 180000, current: 144000, deadline: "2026-09-30", cat: "Electronics", color: "#8b5cf6" },
  { id: 4, name: "Home Down Payment", target: 2000000, current: 680000, deadline: "2028-06-30", cat: "Housing", color: "#f59e0b" },
  { id: 5, name: "Wedding Fund", target: 1500000, current: 450000, deadline: "2027-12-31", cat: "Personal", color: "#ec4899" },
];

export const SPENDING_CATS = [
  { name: "Housing", amount: 18000, pct: 30, color: "#10b981" },
  { name: "Groceries", amount: 9000, pct: 15, color: "#3b82f6" },
  { name: "Food & Dining", amount: 7200, pct: 12, color: "#f59e0b" },
  { name: "Shopping", amount: 6000, pct: 10, color: "#8b5cf6" },
  { name: "Transport", amount: 4800, pct: 8, color: "#ec4899" },
  { name: "Utilities", amount: 4200, pct: 7, color: "#14b8a6" },
  { name: "Healthcare", amount: 3000, pct: 5, color: "#6366f1" },
  { name: "Entertainment", amount: 3600, pct: 6, color: "#f97316" },
  { name: "Others", amount: 4200, pct: 7, color: "#94a3b8" },
];

export const TESTIMONIALS = [
  { name: "Priya Sharma", role: "Software Engineer, Bangalore", av: "PS", rating: 5, color: "#10b981", text: "FinTrack transformed how I manage finances. The investment tracking helped me optimize my portfolio and increase returns by 23% this year. Simply incredible." },
  { name: "Rahul Mehta", role: "Product Manager, Mumbai", av: "RM", rating: 5, color: "#3b82f6", text: "The expense analytics are incredibly insightful. I identified unnecessary subscriptions costing ₹8,000/month that I didn't even know existed. Saved so much!" },
  { name: "Ananya Krishnan", role: "Chartered Accountant, Chennai", av: "AK", rating: 5, color: "#8b5cf6", text: "As a CA, I recommend FinTrack to all my clients. The goal-based savings and tax planning integration are simply unmatched in any tool I've seen." },
];

export const PRICING = [
  { name: "Starter", price: 0, period: "Forever free", desc: "Perfect for starting your financial journey", features: ["100 transactions/month", "3 financial goals", "Basic analytics", "2 bank accounts", "Email support"], cta: "Get Started Free", hot: false, color: "#64748b" },
  { name: "Pro", price: 499, period: "/month", desc: "For serious investors and finance enthusiasts", features: ["Unlimited transactions", "Unlimited goals", "Advanced analytics", "All investment types", "Priority support", "CSV & PDF export", "Custom categories"], cta: "Start 14-day Trial", hot: true, color: "#10b981" },
  { name: "Family", price: 999, period: "/month", desc: "Manage finances for your entire family", features: ["Everything in Pro", "Up to 5 members", "Shared goals & budgets", "Family spending insights", "Dedicated account manager", "API access"], cta: "Start Family Plan", hot: false, color: "#3b82f6" },
];

export const FEATURES = [
  { icon: BarChart2, title: "Smart Analytics", desc: "Visualize spending patterns, income trends, and net worth trajectory with interactive charts and AI-powered insights.", color: "#10b981" },
  { icon: Briefcase, title: "Investment Portfolio", desc: "Track stocks, mutual funds, FDs, gold, and crypto in one place. Real-time P&L with allocation analysis.", color: "#3b82f6" },
  { icon: Target, title: "Financial Goals", desc: "Set savings targets, track progress visually, and get personalized recommendations to reach your milestones faster.", color: "#8b5cf6" },
  { icon: CreditCard, title: "Expense Tracking", desc: "Auto-categorize expenses, set budgets per category, and get alerts when you're approaching your limits.", color: "#f59e0b" },
  { icon: Shield, title: "Bank-grade Security", desc: "256-bit AES encryption, 2FA, and read-only bank connections. Your data is never shared or sold.", color: "#ec4899" },
  { icon: Zap, title: "Instant Sync", desc: "Connect 50+ banks and wallets. Transactions sync automatically so your data is always fresh.", color: "#14b8a6" },
];

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "expenses", label: "Expenses", icon: CreditCard },
  { id: "income", label: "Income", icon: TrendingUp },
  { id: "investments", label: "Investments", icon: Briefcase },
  { id: "goals", label: "Goals", icon: Target },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "settings", label: "Settings", icon: Settings },
];

export const catColors: { [key: string]: string } = {
  Emergency: "#10b981",
  Travel: "#3b82f6",
  Electronics: "#8b5cf6",
  Housing: "#f59e0b",
  Vehicle: "#ec4899",
  Education: "#14b8a6",
  Personal: "#6366f1",
};
