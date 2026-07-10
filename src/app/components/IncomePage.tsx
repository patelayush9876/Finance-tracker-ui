import React, { useState, useEffect } from "react";
import { TrendingUp, Landmark, Zap, Activity, ArrowUpRight, Plus, DollarSign, Calendar, Edit2, Trash2, Check } from "lucide-react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useFinanceStore } from "../../store/useFinanceStore";
import { useDashboardStore } from "../../store/useDashboardStore";
import { cn, fmt, fmtDate, TOOLTIP_STYLE, formatMonthStr, getCurrencySymbol, getCurrencyIcon } from "./shared/utils";
import { Badge } from "./shared/Badge";
import { Card } from "./shared/Card";
import { Btn } from "./shared/Btn";
import { Input } from "./shared/Input";
import { Modal } from "./shared/Modal";
import { StatCard } from "./shared/StatCard";
import { MONTHLY } from "./shared/constants";


interface Income {
  id: string;
  title: string;
  amount: number;
  description?: string;
  incomeDate: string;
  categoryId: string;
  category?: { id: string; name: string };
}

export default function IncomePage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // States for Add Modal
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split("T")[0]);

  // States for Edit Modal
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editIncomeDate, setEditIncomeDate] = useState("");

  const { incomes, incomeCategories, addIncome, updateIncome, deleteIncome } = useFinanceStore();
  const { monthlyIncomeExpense } = useDashboardStore();

  const chartData = monthlyIncomeExpense && monthlyIncomeExpense.length > 0
    ? monthlyIncomeExpense.map(m => ({
        month: formatMonthStr(m.month),
        income: Number(m.income),
      }))
    : [];

  const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);

  const incomesByCategory = incomes.reduce((acc: any, inc) => {
    const name = inc.category?.name || "Other";
    acc[name] = (acc[name] || 0) + inc.amount;
    return acc;
  }, {});

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];
  const displayIncomeCats = Object.keys(incomesByCategory).map((name, i) => ({
    name,
    amount: incomesByCategory[name],
    pct: totalIncome > 0 ? Math.round((incomesByCategory[name] / totalIncome) * 100) : 0,
    color: COLORS[i % COLORS.length]
  }));

  // Auto-select category
  useEffect(() => {
    if (incomeCategories.length > 0 && !categoryId) {
      setCategoryId(incomeCategories[0].id);
    }
  }, [incomeCategories, categoryId]);

  const handleOpenAdd = () => {
    setTitle("");
    setAmount("");
    if (incomeCategories.length > 0) {
      setCategoryId(incomeCategories[0].id);
    }
    setIncomeDate(new Date().toISOString().split("T")[0]);
    setShowAddModal(true);
  };

  const handleSaveAdd = async () => {
    if (!title.trim() || !amount || !categoryId || !incomeDate) return;
    try {
      await addIncome({
        title,
        amount: parseFloat(amount),
        categoryId,
        incomeDate: new Date(incomeDate).toISOString(),
      });
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEdit = (inc: Income) => {
    setEditId(inc.id);
    setEditTitle(inc.title);
    setEditAmount(String(inc.amount));
    setEditCategoryId(inc.categoryId);
    setEditIncomeDate(new Date(inc.incomeDate).toISOString().split("T")[0]);
  };

  const handleSaveEdit = async () => {
    if (!editId || !editTitle.trim() || !editAmount || !editCategoryId || !editIncomeDate) return;
    try {
      await updateIncome(editId, {
        title: editTitle,
        amount: parseFloat(editAmount),
        categoryId: editCategoryId,
        incomeDate: new Date(editIncomeDate).toISOString(),
      });
      setEditId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this income?")) {
      try {
        await deleteIncome(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Income" value={fmt(totalIncome, true)} icon={TrendingUp} color="#10b981" trend="Live" trendUp />
        <StatCard label="Salary Source" value={fmt(incomesByCategory["Salary"] || 0, true)} icon={Landmark} color="#3b82f6" />
        <StatCard label="Freelance Source" value={fmt(incomesByCategory["Freelance"] || 0, true)} icon={Zap} color="#8b5cf6" />
        <StatCard label="Other Source" value={fmt(totalIncome - (incomesByCategory["Salary"] || 0) - (incomesByCategory["Freelance"] || 0), true)} icon={Activity} color="#f59e0b" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-bold text-foreground mb-4">Monthly Income Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [fmt(v), "Income"]} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#inc)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-20 text-center text-xs text-muted-foreground">No historical income data found</div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-foreground mb-4">Income Sources</h3>
          {displayIncomeCats.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={displayIncomeCats} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="amount">
                    {displayIncomeCats.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number, name: string) => [fmt(v), name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5 mt-3 max-h-36 overflow-y-auto">
                {displayIncomeCats.map(c => (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                    <span className="text-xs text-muted-foreground flex-1 truncate">{c.name}</span>
                    <span className="text-xs font-semibold text-foreground font-mono">{fmt(c.amount, true)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-xs text-muted-foreground">No income sources found</div>
          )}
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground">Income Transactions <span className="text-muted-foreground font-normal text-sm ml-1">({incomes.length})</span></h3>
          <Btn size="sm" onClick={handleOpenAdd}><Plus size={14} />Add Income</Btn>
        </div>
        <div className="divide-y divide-border/50">
          {incomes.map(t => (
            <div key={t.id} className="flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                <ArrowUpRight size={15} className="text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.category?.name || "Uncategorized"} · {fmtDate(t.incomeDate)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-emerald-500 text-sm font-mono">+{fmt(t.amount)}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenEdit(t)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
          {incomes.length === 0 && (
            <div className="py-16 text-center text-xs text-muted-foreground">
              No incomes found
            </div>
          )}
        </div>
      </Card>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Income">
        <div className="space-y-4">
          <Input label="Description" placeholder="e.g. Salary June" value={title} onChange={e => setTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={`Amount (${getCurrencySymbol()})`} type="number" placeholder="0.00" icon={getCurrencyIcon()} value={amount} onChange={e => setAmount(e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                {incomeCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <Input label="Date" type="date" icon={Calendar} value={incomeDate} onChange={e => setIncomeDate(e.target.value)} />
          <div className="flex gap-2 pt-1">
            <Btn variant="outline" className="flex-1 justify-center" onClick={() => setShowAddModal(false)}>Cancel</Btn>
            <Btn className="flex-1 justify-center" onClick={handleSaveAdd}><Check size={14} />Save Income</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={editId !== null} onClose={() => setEditId(null)} title="Edit Income">
        <div className="space-y-4">
          <Input label="Description" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={`Amount (${getCurrencySymbol()})`} type="number" icon={getCurrencyIcon()} value={editAmount} onChange={e => setEditAmount(e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select value={editCategoryId} onChange={e => setEditCategoryId(e.target.value)}
                className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                {incomeCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <Input label="Date" type="date" icon={Calendar} value={editIncomeDate} onChange={e => setEditIncomeDate(e.target.value)} />
          <div className="flex gap-2 pt-1">
            <Btn variant="outline" className="flex-1 justify-center" onClick={() => setEditId(null)}>Cancel</Btn>
            <Btn className="flex-1 justify-center" onClick={handleSaveEdit}><Check size={14} />Update</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
