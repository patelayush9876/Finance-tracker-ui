import React from "react";
import { TrendingUp, TrendingDown, Wallet, Activity, AlertCircle, Award } from "lucide-react";
import { BarChart, Bar, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useDashboardStore } from "../../store/useDashboardStore";
import { cn, fmt, TOOLTIP_STYLE, formatMonthStr } from "./shared/utils";
import { Card } from "./shared/Card";
import { StatCard } from "./shared/StatCard";
import { Badge } from "./shared/Badge";
import { MONTHLY, SPENDING_CATS } from "./shared/constants";


export default function AnalyticsPage() {
  const { savingsAnalysis, categoryBreakdown, summary, investmentPerformance } = useDashboardStore();

  const avgIncome = savingsAnalysis && savingsAnalysis.length > 0
    ? savingsAnalysis.reduce((sum, item) => sum + Number(item.income), 0) / savingsAnalysis.length
    : summary?.monthlyIncome || 99200;

  const avgExpense = savingsAnalysis && savingsAnalysis.length > 0
    ? savingsAnalysis.reduce((sum, item) => sum + Number(item.expense), 0) / savingsAnalysis.length
    : summary?.monthlyExpense || 60900;

  const annualSavings = Math.max(0, (avgIncome - avgExpense) * 12);
  const savingsRate = summary?.savingsRate ?? (avgIncome > 0 ? ((avgIncome - avgExpense) / avgIncome) * 100 : 38.7);

  const cashFlow = savingsAnalysis && savingsAnalysis.length > 0
    ? savingsAnalysis.map(m => ({
        month: formatMonthStr(m.month),
        income: Number(m.income),
        expenses: Number(m.expense),
        savings: Number(m.savings),
        net: Number(m.income) - Number(m.expense),
      }))
    : [];

  const areaChartData = savingsAnalysis && savingsAnalysis.length > 0
    ? savingsAnalysis.map(m => ({
        month: formatMonthStr(m.month),
        income: Number(m.income),
        expenses: Number(m.expense),
        savings: Number(m.savings),
      }))
    : [];

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1", "#f97316", "#94a3b8"];
  const displaySpendingCats = categoryBreakdown && categoryBreakdown.length > 0
    ? categoryBreakdown.map((c, i) => ({
        name: c.categoryName,
        amount: Number(c.amount),
        pct: Math.round(c.percentage),
        color: COLORS[i % COLORS.length]
      }))
    : [];

  const highestSpendingCat = displaySpendingCats[0];
  const totalInvestments = summary?.totalInvestments || 0;
  const returnPct = investmentPerformance?.totalReturnPercentage || 16.8;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Avg Monthly Income" value={fmt(avgIncome)} icon={TrendingUp} color="#10b981" trend="Live" trendUp />
        <StatCard label="Avg Monthly Expenses" value={fmt(avgExpense)} icon={TrendingDown} color="#3b82f6" trend="Live" trendUp={false} />
        <StatCard label="Annual Savings" value={fmt(annualSavings)} icon={Wallet} color="#8b5cf6" trend="Est." trendUp />
        <StatCard label="Savings Rate" value={`${savingsRate.toFixed(1)}%`} icon={Activity} color="#f59e0b" trend="Rate" trendUp />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-bold text-foreground mb-1">Cash Flow</h3>
          <p className="text-xs text-muted-foreground mb-4">Monthly net (income − expenses)</p>
          {cashFlow.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cashFlow} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [fmt(v), "Net"]} />
                <Bar dataKey="net" radius={[4, 4, 0, 0]} name="Net Cash Flow">
                  {cashFlow.map((entry, i) => <Cell key={i} fill={entry.net >= 0 ? "#10b981" : "#ef4444"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-16 text-center text-xs text-muted-foreground">No historical cash flow data found</div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-foreground mb-1">Savings Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Monthly savings over time</p>
          {areaChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={areaChartData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                <defs>
                  <linearGradient id="sv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [fmt(v), "Savings"]} />
                <Area type="monotone" dataKey="savings" stroke="#8b5cf6" fill="url(#sv)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-16 text-center text-xs text-muted-foreground">No historical savings trend found</div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-foreground mb-1">Category Spending</h3>
          <p className="text-xs text-muted-foreground mb-4">Breakdown of current month</p>
          {displaySpendingCats.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={displaySpendingCats} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 60 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [fmt(v), ""]} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {displaySpendingCats.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-16 text-center text-xs text-muted-foreground">No category spending recorded this month</div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-foreground mb-1">Income vs Expenses</h3>
          <p className="text-xs text-muted-foreground mb-4">Timeline comparison</p>
          {areaChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={areaChartData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [fmt(v), ""]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-16 text-center text-xs text-muted-foreground">No income or expense timeline comparison found</div>
          )}
        </Card>
      </div>

      {/* Insights */}
      <Card className="p-5">
        <h3 className="font-bold text-foreground mb-4">AI Insights</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { 
              icon: TrendingUp, 
              color: "#10b981", 
              title: "Savings Rate Analysis", 
              text: `You saved ${savingsRate.toFixed(0)}% of your income over the monitored period. Maintaining a rate above 30% is excellent for wealth creation.` 
            },
            { 
              icon: AlertCircle, 
              color: "#f59e0b", 
              title: "Budget Optimization", 
              text: highestSpendingCat 
                ? `${highestSpendingCat.name} is your highest spending category this month, costing ${fmt(highestSpendingCat.amount)}. Look for optimization here.`
                : "No expenses recorded this month yet. Add expenses to generate insights."
            },
            { 
              icon: Award, 
              color: "#8b5cf6", 
              title: "Portfolio Development", 
              text: totalInvestments > 0
                ? `Your portfolio value has reached ${fmt(totalInvestments)} with an average annualized growth rate of ${returnPct.toFixed(1)}%.`
                : "Add investments to begin tracking portfolio performance and receiving milestone updates."
            },
          ].map(ins => (
            <div key={ins.title} className="p-4 rounded-xl border border-border bg-muted/20">
              <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center" style={{ background: ins.color + "18" }}>
                <ins.icon size={15} style={{ color: ins.color }} />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">{ins.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{ins.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
