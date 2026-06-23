import React, { useState } from "react";
import { Plus, Briefcase, Wallet, TrendingUp, Activity, Calendar, DollarSign, Edit2, Trash2, Check } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useFinanceStore } from "../../store/useFinanceStore";
import { useDashboardStore } from "../../store/useDashboardStore";
import { cn, fmt, fmtDate, TOOLTIP_STYLE, formatMonthStr } from "./shared/utils";
import { Badge } from "./shared/Badge";
import { Card } from "./shared/Card";
import { Btn } from "./shared/Btn";
import { Input } from "./shared/Input";
import { Modal } from "./shared/Modal";
import { StatCard } from "./shared/StatCard";
import { MONTHLY } from "./shared/constants";


const typeMapToUI: { [key: string]: string } = {
  MUTUAL_FUND: "Mutual Fund",
  STOCKS: "Stock",
  FIXED_DEPOSIT: "Fixed Deposit",
  GOLD: "Gold",
  CRYPTO: "Crypto",
  PPF: "PPF",
  NPS: "NPS",
};

export default function InvestmentsPage() {
  const [activeType, setActiveType] = useState("All");
  const types = ["All", "Mutual Fund", "Stock", "Fixed Deposit", "Gold", "Crypto", "PPF", "NPS"];
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Add states
  const [name, setName] = useState("");
  const [type, setType] = useState("MUTUAL_FUND");
  const [amountInvested, setAmountInvested] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  // Edit states
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("MUTUAL_FUND");
  const [editAmountInvested, setEditAmountInvested] = useState("");
  const [editCurrentValue, setEditCurrentValue] = useState("");
  const [editPurchaseDate, setEditPurchaseDate] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const { investments, addInvestment, updateInvestment, deleteInvestment } = useFinanceStore();
  const { netWorthHistory, investmentPerformance } = useDashboardStore();

  const totalValue = investments.reduce((s, i) => s + i.currentValue, 0);
  const totalInvested = investments.reduce((s, i) => s + i.amountInvested, 0);
  const totalGL = totalValue - totalInvested;
  const totalGLPercentage = totalInvested > 0 ? (totalGL / totalInvested) * 100 : 0;

  const perfData = netWorthHistory && netWorthHistory.length > 0
    ? netWorthHistory.map((h, idx) => ({
        month: formatMonthStr(h.month),
        portfolio: Number(h.investments),
        benchmark: Math.round(Number(h.investments) * (0.95 + idx * 0.01)),
      }))
    : [];

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1", "#f97316", "#94a3b8"];
  
  const displayInvestments = investments.map((inv, i) => ({
    ...inv,
    color: COLORS[i % COLORS.length]
  }));

  const filtered = activeType === "All"
    ? displayInvestments
    : displayInvestments.filter(i => (typeMapToUI[i.type] || i.type) === activeType);

  // Group by asset type for allocation chart
  const investmentsByType = investments.reduce((acc: any, inv) => {
    const typeLabel = typeMapToUI[inv.type] || inv.type;
    acc[typeLabel] = (acc[typeLabel] || 0) + inv.currentValue;
    return acc;
  }, {});

  const assetAllocation = Object.keys(investmentsByType).map((typeLabel, i) => ({
    name: typeLabel,
    value: investmentsByType[typeLabel],
    alloc: totalValue > 0 ? Math.round((investmentsByType[typeLabel] / totalValue) * 100) : 0,
    color: COLORS[i % COLORS.length]
  }));

  const handleOpenAdd = () => {
    setName("");
    setType("MUTUAL_FUND");
    setAmountInvested("");
    setCurrentValue("");
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setShowAddModal(true);
  };

  const handleOpenEdit = (inv: any) => {
    setEditId(inv.id);
    setEditName(inv.name);
    setEditType(inv.type);
    setEditAmountInvested(String(inv.amountInvested));
    setEditCurrentValue(String(inv.currentValue));
    setEditPurchaseDate(new Date(inv.purchaseDate).toISOString().split("T")[0]);
    setEditNotes(inv.notes || "");
  };

  const handleSaveAdd = async () => {
    if (!name.trim() || !amountInvested || !currentValue || !purchaseDate) return;
    try {
      await addInvestment({
        name,
        type,
        amountInvested: parseFloat(amountInvested),
        currentValue: parseFloat(currentValue),
        purchaseDate: new Date(purchaseDate).toISOString(),
        notes: notes || undefined,
      });
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editId || !editName.trim() || !editAmountInvested || !editCurrentValue || !editPurchaseDate) return;
    try {
      await updateInvestment(editId, {
        name: editName,
        type: editType,
        amountInvested: parseFloat(editAmountInvested),
        currentValue: parseFloat(editCurrentValue),
        purchaseDate: new Date(editPurchaseDate).toISOString(),
        notes: editNotes || undefined,
      });
      setEditId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this investment?")) {
      try {
        await deleteInvestment(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Investments</h2>
          <p className="text-sm text-muted-foreground">Manage your assets portfolio</p>
        </div>
        <Btn onClick={handleOpenAdd}><Plus size={15} />New Investment</Btn>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Portfolio Value" value={fmt(totalValue, true)} icon={Briefcase} color="#10b981" trend="Live" trendUp />
        <StatCard label="Total Invested" value={fmt(totalInvested, true)} icon={Wallet} color="#3b82f6" />
        <StatCard label="Total Gain/Loss" value={fmt(totalGL, true)} icon={TrendingUp} color="#8b5cf6" trend={`${totalGLPercentage.toFixed(1)}%`} trendUp={totalGL >= 0} />
        <StatCard 
          label="Annualized Return" 
          value={`${(investmentPerformance?.totalReturnPercentage ?? 0).toFixed(1)}%`} 
          icon={Activity} 
          color="#f59e0b" 
          trend={totalInvested > 0 ? ((investmentPerformance?.totalReturnPercentage ?? 0) >= 12.4 ? "Outperforming index" : "Underperforming index") : "vs 12.4% benchmark"} 
          trendUp={totalInvested > 0 ? (investmentPerformance?.totalReturnPercentage ?? 0) >= 12.4 : false} 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-bold text-foreground mb-4">Portfolio Performance vs Benchmark</h3>
          {perfData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={perfData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 100000).toFixed(1)}L`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [fmt(v), ""]} />
                <Line type="monotone" dataKey="portfolio" stroke="#10b981" strokeWidth={2.5} dot={false} name="My Portfolio" />
                <Line type="monotone" dataKey="benchmark" stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="5 5" name="Nifty 50" />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-20 text-center text-xs text-muted-foreground">No historical portfolio performance found</div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-foreground mb-4">Asset Allocation</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={assetAllocation.length > 0 ? assetAllocation : [{ name: "None", value: 1, color: "#94a3b8" }]} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value">
                {(assetAllocation.length > 0 ? assetAllocation : [{ name: "None", value: 1, color: "#94a3b8" }]).map((inv, i) => <Cell key={i} fill={inv.color} />)}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [fmt(v), ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2 max-h-36 overflow-y-auto">
            {assetAllocation.map((inv, idx) => (
              <div key={inv.name || idx} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: inv.color }} />
                <span className="text-xs text-muted-foreground flex-1 truncate">{inv.name}</span>
                <span className="text-xs font-medium" style={{ color: inv.color }}>{inv.alloc}%</span>
              </div>
            ))}
            {assetAllocation.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-4">No allocations</p>
            )}
          </div>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {types.map(t => (
          <button key={t} onClick={() => setActiveType(t)}
            className={cn("px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0",
              activeType === t ? "bg-emerald-500 text-white shadow-sm" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>
            {t}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Name", "Type", "Current Value", "Invested", "Gain/Loss", "Return", "Allocation", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const profit = inv.currentValue - inv.amountInvested;
                const profitPct = inv.amountInvested > 0 ? (profit / inv.amountInvested) * 100 : 0;
                return (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: inv.color }} />
                        <span className="text-sm font-medium text-foreground">{inv.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge color={inv.color}>{typeMapToUI[inv.type] || inv.type}</Badge></td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground tabular-nums font-mono">{fmt(inv.currentValue)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums font-mono">{fmt(inv.amountInvested)}</td>
                    <td className={cn("px-4 py-3 text-sm font-medium tabular-nums font-mono", profit >= 0 ? "text-emerald-500" : "text-red-400")}>
                      {profit >= 0 ? "+" : ""}{fmt(profit)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-sm font-semibold", profit >= 0 ? "text-emerald-500" : "text-red-400")}>
                        {profit >= 0 ? "+" : ""}{profitPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${inv.alloc}%`, background: inv.color }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{inv.alloc}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleOpenEdit(inv)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete(inv.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Briefcase size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No investments found</p>
            </div>
          )}
        </div>
      </Card>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="New Investment">
        <div className="space-y-4">
          <Input label="Investment Name" placeholder="e.g. Nifty 50 Index Fund" value={name} onChange={e => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Type</label>
              <select value={type} onChange={e => setType(e.target.value)}
                className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                {Object.keys(typeMapToUI).map(k => <option key={k} value={k}>{typeMapToUI[k]}</option>)}
              </select>
            </div>
            <Input label="Purchase Date" type="date" icon={Calendar} value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount Invested (₹)" type="number" placeholder="0.00" icon={DollarSign} value={amountInvested} onChange={e => setAmountInvested(e.target.value)} />
            <Input label="Current Value (₹)" type="number" placeholder="0.00" icon={TrendingUp} value={currentValue} onChange={e => setCurrentValue(e.target.value)} />
          </div>
          <Input label="Notes" placeholder="Optional notes..." value={notes} onChange={e => setNotes(e.target.value)} />
          <div className="flex gap-2 pt-1">
            <Btn variant="outline" className="flex-1 justify-center" onClick={() => setShowAddModal(false)}>Cancel</Btn>
            <Btn className="flex-1 justify-center" onClick={handleSaveAdd}><Check size={14} />Save</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={editId !== null} onClose={() => setEditId(null)} title="Edit Investment">
        <div className="space-y-4">
          <Input label="Investment Name" value={editName} onChange={e => setEditName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Type</label>
              <select value={editType} onChange={e => setEditType(e.target.value)}
                className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                {Object.keys(typeMapToUI).map(k => <option key={k} value={k}>{typeMapToUI[k]}</option>)}
              </select>
            </div>
            <Input label="Purchase Date" type="date" icon={Calendar} value={editPurchaseDate} onChange={e => setEditPurchaseDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount Invested (₹)" type="number" icon={DollarSign} value={editAmountInvested} onChange={e => setEditAmountInvested(e.target.value)} />
            <Input label="Current Value (₹)" type="number" icon={TrendingUp} value={editCurrentValue} onChange={e => setEditCurrentValue(e.target.value)} />
          </div>
          <Input label="Notes" value={editNotes} onChange={e => setEditNotes(e.target.value)} />
          <div className="flex gap-2 pt-1">
            <Btn variant="outline" className="flex-1 justify-center" onClick={() => setEditId(null)}>Cancel</Btn>
            <Btn className="flex-1 justify-center" onClick={handleSaveEdit}><Check size={14} />Update</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
