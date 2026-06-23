import React from "react";
import {
  Landmark, TrendingUp, CreditCard, Briefcase, Wallet,
  Activity, ArrowUpRight, ArrowDownRight, ChevronRight
} from "lucide-react";
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { useFinanceStore } from "../../store/useFinanceStore";
import { useDashboardStore } from "../../store/useDashboardStore";
import { cn, fmt, fmtDate, TOOLTIP_STYLE, formatMonthStr } from "./shared/utils";
import { Badge } from "./shared/Badge";
import { Card } from "./shared/Card";
import { StatCard } from "./shared/StatCard";
import { Page } from "./shared/types";
import { SPENDING_CATS, MONTHLY, INVESTMENTS } from "./shared/constants";


export default function DashboardPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { summary, monthlyIncomeExpense, categoryBreakdown } = useDashboardStore();
  const { investments, expenses, incomes, goals } = useFinanceStore();

  const netWorth = summary?.netWorth ?? 0;
  const monthlyIncome = summary?.monthlyIncome ?? 0;
  const monthlyExpenses = summary?.monthlyExpense ?? 0;
  const savingsRate = Math.round(summary?.savingsRate ?? 0);
  const totalInvestments = summary?.totalInvestments ?? 0;

  const totalInvested = investments.reduce((s, i) => s + (i.amountInvested ?? 0), 0);
  const totalGL = totalInvestments - totalInvested;
  const glp = totalInvested > 0 ? Math.round((totalGL / totalInvested) * 100) : 0;

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1", "#f97316", "#94a3b8"];
  
  const displaySpendingCats = categoryBreakdown && categoryBreakdown.length > 0
    ? categoryBreakdown.map((cat, i) => ({
        name: cat.categoryName,
        amount: Number(cat.amount),
        pct: Math.round(cat.percentage),
        color: COLORS[i % COLORS.length]
      }))
    : [];

  const areaChartData = monthlyIncomeExpense && monthlyIncomeExpense.length > 0
    ? monthlyIncomeExpense.map(m => ({
        month: formatMonthStr(m.month),
        income: Number(m.income),
        expenses: Number(m.expense),
      }))
    : [];

  const recentTransactions = [
    ...expenses.map(e => ({ id: e.id, desc: e.title, amt: -e.amount, cat: e.category?.name || 'Expense', date: e.expenseDate, type: 'expense' as const })),
    ...incomes.map(i => ({ id: i.id, desc: i.title, amt: i.amount, cat: i.category?.name || 'Income', date: i.incomeDate, type: 'income' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayInvestments = investments.length > 0
    ? investments.map((inv, i) => ({
        id: inv.id,
        name: inv.name,
        value: inv.currentValue,
        invested: inv.amountInvested,
        gl: inv.gl ?? 0,
        glp: inv.glp ?? 0,
        alloc: inv.alloc ?? 0,
        color: COLORS[i % COLORS.length]
      }))
    : [];

  return (
    <div className="space-y-5">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Net Worth" value={fmt(netWorth, true)} icon={Landmark} color="#10b981" trend="Live" trendUp sub="Total assets - liabilities" />
        <StatCard label="Monthly Income" value={fmt(monthlyIncome, true)} icon={TrendingUp} color="#3b82f6" trend="Actual" trendUp sub="This month" />
        <StatCard label="Monthly Expenses" value={fmt(monthlyExpenses, true)} icon={CreditCard} color="#f59e0b" trend="Actual" trendUp={false} sub="This month" />
        <StatCard label="Investments" value={fmt(totalInvestments, true)} icon={Briefcase} color="#8b5cf6" trend="Portfolio" trendUp sub="Total portfolio value" />
        <StatCard label="Savings Rate" value={`${savingsRate}%`} icon={Wallet} color="#14b8a6" trend="Rate" trendUp sub="This month" />
        <StatCard label="Total P&L" value={fmt(totalGL, true)} icon={Activity} color="#ec4899" trend={`${glp}%`} trendUp={totalGL >= 0} sub="Overall gain" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Income vs Expenses */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-foreground">Income vs Expenses</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Overview</p>
            </div>
            <Badge color="#10b981">Live</Badge>
          </div>
          {areaChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={areaChartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="di" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="de" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [fmt(v), ""]} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#di)" strokeWidth={2} name="Income" />
                <Area type="monotone" dataKey="expenses" stroke="#3b82f6" fill="url(#de)" strokeWidth={2} name="Expenses" />
                <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-20 text-center text-xs text-muted-foreground">No income or expense data found</div>
          )}
        </Card>

        {/* Spending Breakdown */}
        <Card className="p-5">
          <h3 className="font-bold text-foreground mb-1">Spending Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Current Month</p>
          {displaySpendingCats.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={displaySpendingCats.slice(0, 6)} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="amount">
                    {displaySpendingCats.slice(0, 6).map((cat, i) => <Cell key={i} fill={cat.color} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [fmt(v), ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2 max-h-36 overflow-y-auto">
                {displaySpendingCats.slice(0, 5).map(cat => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                    <span className="text-xs text-muted-foreground flex-1 truncate">{cat.name}</span>
                    <span className="text-xs font-medium text-foreground font-mono">{cat.pct}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-muted-foreground">No spending recorded this month</div>
          )}
        </Card>
      </div>

      {/* Transactions + Investment Overview */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Recent Transactions */}
        <Card className="lg:col-span-3 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-foreground">Recent Transactions</h3>
            <button onClick={() => onNavigate("expenses")} className="text-xs text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1">View all <ChevronRight size={12} /></button>
          </div>
          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {recentTransactions.slice(0, 6).map((t, idx) => (
              <div key={t.id || idx} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0",
                  t.type === "income" ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/10 text-red-400")}>
                  {t.type === "income" ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.desc}</p>
                  <p className="text-xs text-muted-foreground">{t.cat} · {fmtDate(t.date)}</p>
                </div>
                <span className={cn("text-sm font-semibold tabular-nums shrink-0 font-mono", t.type === "income" ? "text-emerald-500" : "text-foreground")}>
                  {t.type === "income" ? "+" : "-"}{fmt(Math.abs(t.amt), true)}
                </span>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div className="py-12 text-center text-xs text-muted-foreground">No recent transactions</div>
            )}
          </div>
        </Card>

        {/* Investment Overview */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-foreground">Portfolio</h3>
            <button onClick={() => onNavigate("investments")} className="text-xs text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1">Details <ChevronRight size={12} /></button>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {displayInvestments.slice(0, 5).map((inv, idx) => (
              <div key={inv.id || idx} className="flex items-center gap-3">
                <div className="w-2 h-8 rounded-full shrink-0" style={{ background: inv.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{inv.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${inv.alloc}%`, background: inv.color }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{inv.alloc}%</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-foreground font-mono">{fmt(inv.value, true)}</p>
                  <p className={cn("text-xs font-mono", inv.gl >= 0 ? "text-emerald-500" : "text-red-400")}>
                    {inv.gl >= 0 ? "+" : ""}{inv.glp.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
            {displayInvestments.length === 0 && (
              <div className="py-12 text-center text-xs text-muted-foreground">No investments added yet</div>
            )}
          </div>
        </Card>
      </div>

      {/* Goals Row */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-foreground">Financial Goals</h3>
          <button onClick={() => onNavigate("goals")} className="text-xs text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1">View all <ChevronRight size={12} /></button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {goals.slice(0, 3).map((g) => {
            const pct = Math.round(g.progressPercentage ?? 0);
            const color = g.progressPercentage && g.progressPercentage >= 100 ? "#10b981" : "#3b82f6";
            return (
              <div key={g.id} className="p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground truncate max-w-[150px]">{g.name}</p>
                  <Badge color={color}>{pct}%</Badge>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>{fmt(g.currentAmount, true)}</span>
                  <span>{fmt(g.targetAmount, true)}</span>
                </div>
              </div>
            );
          })}
          {goals.length === 0 && (
            <div className="col-span-3 py-6 text-center text-xs text-muted-foreground">No active goals</div>
          )}
        </div>
      </Card>
    </div>
  );
}
