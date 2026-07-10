import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Plus, DollarSign, Calendar, Edit2, Trash2, Check, CreditCard } from "lucide-react";
import { ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useFinanceStore } from "../../store/useFinanceStore";
import { useDashboardStore } from "../../store/useDashboardStore";
import { cn, fmt, fmtDate, TOOLTIP_STYLE, formatMonthStr, getCurrencySymbol, getCurrencyIcon } from "./shared/utils";
import { Badge } from "./shared/Badge";
import { Card } from "./shared/Card";
import { Btn } from "./shared/Btn";
import { Input } from "./shared/Input";
import { Modal } from "./shared/Modal";
import { MONTHLY } from "./shared/constants";


interface Expense {
  id: string;
  title: string;
  amount: number;
  description?: string;
  expenseDate: string;
  categoryId: string;
  category?: { id: string; name: string };
}

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // States for Add Modal
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);

  // States for Edit Modal
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editExpenseDate, setEditExpenseDate] = useState("");

  const { expenses, expenseCategories, addExpense, updateExpense, deleteExpense } = useFinanceStore();
  const { monthlyIncomeExpense } = useDashboardStore();
  const [timescale, setTimescale] = useState<"3M" | "6M" | "YTD">("6M");

  const chartData = monthlyIncomeExpense && monthlyIncomeExpense.length > 0
    ? monthlyIncomeExpense.map(m => ({
        month: formatMonthStr(m.month),
        rawMonth: m.month,
        expenses: Number(m.expense),
      }))
    : [];

  const filteredChartData = React.useMemo(() => {
    if (timescale === "3M") {
      return chartData.slice(-3);
    }
    if (timescale === "YTD") {
      const currentYear = new Date().getFullYear().toString();
      return chartData.filter(d => d.rawMonth.startsWith(currentYear));
    }
    return chartData;
  }, [chartData, timescale]);

  const cats = ["All", ...expenseCategories.map(c => c.name)];

  const filtered = expenses.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
                          (t.category && t.category.name.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = filterCat === "All" || (t.category && t.category.name === filterCat);
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filtered.reduce((s, t) => s + t.amount, 0);

  useEffect(() => {
    if (expenseCategories.length > 0 && !categoryId) {
      setCategoryId(expenseCategories[0].id);
    }
  }, [expenseCategories, categoryId]);

  const handleOpenAdd = () => {
    setTitle("");
    setAmount("");
    if (expenseCategories.length > 0) {
      setCategoryId(expenseCategories[0].id);
    }
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setShowAddModal(true);
  };

  const handleSaveAdd = async () => {
    if (!title.trim() || !amount || !categoryId || !expenseDate) return;
    try {
      await addExpense({
        title,
        amount: parseFloat(amount),
        categoryId,
        expenseDate: new Date(expenseDate).toISOString(),
      });
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditId(exp.id);
    setEditTitle(exp.title);
    setEditAmount(String(exp.amount));
    setEditCategoryId(exp.categoryId);
    setEditExpenseDate(new Date(exp.expenseDate).toISOString().split("T")[0]);
  };

  const handleSaveEdit = async () => {
    if (!editId || !editTitle.trim() || !editAmount || !editCategoryId || !editExpenseDate) return;
    try {
      await updateExpense(editId, {
        title: editTitle,
        amount: parseFloat(editAmount),
        categoryId: editCategoryId,
        expenseDate: new Date(editExpenseDate).toISOString(),
      });
      setEditId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search expenses…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl px-3 py-2.5 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
            {cats.map(c => <option key={c}>{c}</option>)}
          </select>
          <Btn onClick={handleOpenAdd}><Plus size={15} />Add Expense</Btn>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Expenses</p>
          <p className="text-xl font-bold text-red-400 font-mono">{fmt(totalExpenses, true)}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Transactions</p>
          <p className="text-xl font-bold text-foreground">{filtered.length}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Avg per day</p>
          <p className="text-xl font-bold text-foreground font-mono">{fmt(Math.round(totalExpenses / 30), true)}</p>
        </Card>
      </div>

      {/* Expense Chart */}
      <Card className="p-6 bg-gradient-to-br from-card to-card/65 border border-border/80 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-border/50">
          <div>
            <h3 className="font-bold text-foreground text-base tracking-tight">Monthly Expense Trend</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Historical monthly spending patterns</p>
          </div>
          
          {/* Timescale Selector */}
          <div className="flex bg-muted/60 border border-border/50 p-0.5 rounded-lg self-start sm:self-auto relative">
            {(["3M", "6M", "YTD"] as const).map(t => {
              const active = timescale === t;
              return (
                <button
                  key={t}
                  onClick={() => setTimescale(t)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all relative",
                    active ? "text-foreground font-extrabold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="expensesTimescaleBG"
                      className="absolute inset-0 bg-card rounded-md shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{t}</span>
                </button>
              );
            })}
          </div>
        </div>
        {filteredChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={filteredChartData} margin={{ top: 10, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="expenseSynthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d946ef" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" opacity={0.5} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v: number, name: string) => [fmt(v), name]} />
              
              {/* Neon Glow overlay Line */}
              <Line type="monotone" dataKey="expenses" stroke="#d946ef" strokeWidth={6} opacity={0.12} dot={false} activeDot={false} legendType="none" tooltipType="none" />
              
              {/* Main Area */}
              <Area type="monotone" dataKey="expenses" stroke="#d946ef" strokeWidth={2.5} fill="url(#expenseSynthGrad)" name="Expenses" dot={{ r: 3, stroke: "#d946ef", strokeWidth: 1.5, fill: "var(--card)" }} activeDot={{ r: 5, stroke: "#d946ef", strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="py-10 text-center text-xs text-muted-foreground">No historical expense data found</div>
        )}
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-foreground">All Expenses <span className="text-muted-foreground font-normal text-sm ml-1">({filtered.length})</span></h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Date", "Description", "Category", "Amount", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, idx) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: Math.min(idx * 0.02, 0.2) }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{fmtDate(t.expenseDate)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{t.title}</td>
                  <td className="px-4 py-3">
                    <Badge color="#3b82f6">{t.category?.name || "Uncategorized"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-red-400 font-mono">{fmt(t.amount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleOpenEdit(t)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit2 size={13} /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <CreditCard size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No expenses found</p>
            </div>
          )}
        </div>
      </Card>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Expense">
        <div className="space-y-4">
          <Input label="Description" placeholder="e.g. Zepto Groceries" value={title} onChange={e => setTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={`Amount (${getCurrencySymbol()})`} type="number" placeholder="0.00" icon={getCurrencyIcon()} value={amount} onChange={e => setAmount(e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <Input label="Date" type="date" icon={Calendar} value={expenseDate} onChange={e => setExpenseDate(e.target.value)} />
          <div className="flex gap-2 pt-1">
            <Btn variant="outline" className="flex-1 justify-center" onClick={() => setShowAddModal(false)}>Cancel</Btn>
            <Btn className="flex-1 justify-center" onClick={handleSaveAdd}><Check size={14} />Save Expense</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={editId !== null} onClose={() => setEditId(null)} title="Edit Expense">
        <div className="space-y-4">
          <Input label="Description" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={`Amount (${getCurrencySymbol()})`} type="number" icon={getCurrencyIcon()} value={editAmount} onChange={e => setEditAmount(e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select value={editCategoryId} onChange={e => setEditCategoryId(e.target.value)}
                className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <Input label="Date" type="date" icon={Calendar} value={editExpenseDate} onChange={e => setEditExpenseDate(e.target.value)} />
          <div className="flex gap-2 pt-1">
            <Btn variant="outline" className="flex-1 justify-center" onClick={() => setEditId(null)}>Cancel</Btn>
            <Btn className="flex-1 justify-center" onClick={handleSaveEdit}><Check size={14} />Update</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
