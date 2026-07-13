import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Plus, DollarSign, Calendar, Edit2, Trash2, Check, CreditCard, AlertCircle } from "lucide-react";
import { ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useFinanceStore } from "../../store/useFinanceStore";
import { useDashboardStore } from "../../store/useDashboardStore";
import { useCreditCardStore } from "../../store/useCreditCardStore";
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
  creditCardId?: string;
  excludeFromAnalytics?: boolean;
  creditCard?: { id: string; name: string };
}

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  // States for Add Modal
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [creditCardId, setCreditCardId] = useState("");
  const [excludeFromAnalytics, setExcludeFromAnalytics] = useState(false);

  // States for Edit Modal
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editExpenseDate, setEditExpenseDate] = useState("");
  const [editCreditCardId, setEditCreditCardId] = useState("");
  const [editExcludeFromAnalytics, setEditExcludeFromAnalytics] = useState(false);

  const { expenses, expensesPage, expensesTotalPages, fetchExpenses, expenseCategories, addExpense, updateExpense, deleteExpense, loading } = useFinanceStore();
  const { monthlyIncomeExpense } = useDashboardStore();
  const { cards } = useCreditCardStore();
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

  const getMonthOptions = () => {
    const options = [{ label: "All Months", value: "All" }];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const label = date.toLocaleString("default", { month: "long", year: "numeric" });
      options.push({ label, value: `${y}-${m}` });
      date.setMonth(date.getMonth() - 1);
    }
    return options;
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load expenses from API based on active query filters
  useEffect(() => {
    const matchedCategory = expenseCategories.find(c => c.name === filterCat);
    const categoryId = matchedCategory ? matchedCategory.id : undefined;

    let startDate: string | undefined;
    let endDate: string | undefined;
    if (monthFilter !== "All") {
      const [year, month] = monthFilter.split("-");
      startDate = new Date(Number(year), Number(month) - 1, 1).toISOString();
      endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999).toISOString();
    }

    fetchExpenses({
      page: 1,
      limit: 20,
      search: debouncedSearch.trim() || undefined,
      categoryId,
      startDate,
      endDate,
    });
  }, [debouncedSearch, filterCat, monthFilter, fetchExpenses, expenseCategories]);

  const handleLoadMore = () => {
    if (expensesPage < expensesTotalPages) {
      const matchedCategory = expenseCategories.find(c => c.name === filterCat);
      const categoryId = matchedCategory ? matchedCategory.id : undefined;

      let startDate: string | undefined;
      let endDate: string | undefined;
      if (monthFilter !== "All") {
        const [year, month] = monthFilter.split("-");
        startDate = new Date(Number(year), Number(month) - 1, 1).toISOString();
        endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999).toISOString();
      }

      fetchExpenses({
        page: expensesPage + 1,
        limit: 20,
        search: debouncedSearch.trim() || undefined,
        categoryId,
        startDate,
        endDate,
      }, true); // true = append mode
    }
  };

  // Infinite Scroll Trigger
  useEffect(() => {
    if (expensesPage >= expensesTotalPages || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [expensesPage, expensesTotalPages, loading, handleLoadMore]);

  const filtered = expenses;
  const totalExpenses = filtered.reduce((s, t) => s + t.amount, 0);

  useEffect(() => {
    if (expenseCategories.length > 0 && !categoryId) {
      setCategoryId(expenseCategories[0].id);
    }
  }, [expenseCategories, categoryId]);

  // Auto-exclude credit card bill payments from analytics
  useEffect(() => {
    const selectedCatName = expenseCategories.find(c => c.id === categoryId)?.name || "";
    if (selectedCatName.toLowerCase().includes("credit card bill")) {
      setExcludeFromAnalytics(true);
    }
  }, [categoryId, expenseCategories]);

  useEffect(() => {
    const selectedCatName = expenseCategories.find(c => c.id === editCategoryId)?.name || "";
    if (selectedCatName.toLowerCase().includes("credit card bill")) {
      setEditExcludeFromAnalytics(true);
    }
  }, [editCategoryId, expenseCategories]);

  const handleOpenAdd = () => {
    setTitle("");
    setAmount("");
    if (expenseCategories.length > 0) {
      setCategoryId(expenseCategories[0].id);
    }
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setCreditCardId("");
    setExcludeFromAnalytics(false);
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
        creditCardId: creditCardId ? creditCardId : undefined,
        excludeFromAnalytics,
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
    setEditCreditCardId(exp.creditCardId || "");
    setEditExcludeFromAnalytics(exp.excludeFromAnalytics || false);
  };

  const handleSaveEdit = async () => {
    if (!editId || !editTitle.trim() || !editAmount || !editCategoryId || !editExpenseDate) return;
    try {
      await updateExpense(editId, {
        title: editTitle,
        amount: parseFloat(editAmount),
        categoryId: editCategoryId,
        expenseDate: new Date(editExpenseDate).toISOString(),
        creditCardId: editCreditCardId ? editCreditCardId : null,
        excludeFromAnalytics: editExcludeFromAnalytics,
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
          <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
            {getMonthOptions().map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
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
                {["Date", "Description", "Category", "Method", "Amount", ""].map(h => (
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
                  <td className="px-4 py-3">
                    {t.excludeFromAnalytics ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full" title="Excluded from analytics to prevent double-counting">
                        <AlertCircle size={10} /> Transfer
                      </span>
                    ) : t.creditCard ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                        <CreditCard size={10} /> {t.creditCard.name}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">Cash/Bank</span>
                    )}
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
          {expensesPage < expensesTotalPages && (
            <div ref={sentinelRef} className="p-4 border-t border-border flex justify-center bg-card text-xs text-muted-foreground font-semibold">
              {loading ? "Loading older transactions..." : "Scroll down to load more"}
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
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" icon={Calendar} value={expenseDate} onChange={e => setExpenseDate(e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Payment Method</label>
              <select value={creditCardId} onChange={e => setCreditCardId(e.target.value)}
                className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                <option value="">Cash / Bank Account</option>
                {cards.map(card => (
                  <option key={card.id} value={card.id}>💳 {card.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 p-1.5">
            <input 
              type="checkbox" 
              id="excludeFromAnalyticsAdd"
              checked={excludeFromAnalytics} 
              onChange={e => setExcludeFromAnalytics(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded border-border"
            />
            <label htmlFor="excludeFromAnalyticsAdd" className="text-xs font-semibold text-foreground cursor-pointer select-none">
              Exclude from Analytics (Transfers / Credit Card Bills)
            </label>
          </div>
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
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" icon={Calendar} value={editExpenseDate} onChange={e => setEditExpenseDate(e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Payment Method</label>
              <select value={editCreditCardId} onChange={e => setEditCreditCardId(e.target.value)}
                className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                <option value="">Cash / Bank Account</option>
                {cards.map(card => (
                  <option key={card.id} value={card.id}>💳 {card.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 p-1.5">
            <input 
              type="checkbox" 
              id="excludeFromAnalyticsEdit"
              checked={editExcludeFromAnalytics} 
              onChange={e => setEditExcludeFromAnalytics(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded border-border"
            />
            <label htmlFor="excludeFromAnalyticsEdit" className="text-xs font-semibold text-foreground cursor-pointer select-none">
              Exclude from Analytics (Transfers / Credit Card Bills)
            </label>
          </div>
          <div className="flex gap-2 pt-1">
            <Btn variant="outline" className="flex-1 justify-center" onClick={() => setEditId(null)}>Cancel</Btn>
            <Btn className="flex-1 justify-center" onClick={handleSaveEdit}><Check size={14} />Update</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
