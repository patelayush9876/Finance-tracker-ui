import React, { useState } from "react";
import { Plus, DollarSign, Calendar, Wallet, Check, Edit2, Trash2, Target } from "lucide-react";
import { useFinanceStore } from "../../store/useFinanceStore";
import { cn, fmt, fmtDate, getCurrencySymbol, getCurrencyIcon } from "./shared/utils";
import { Badge } from "./shared/Badge";
import { Card } from "./shared/Card";
import { Btn } from "./shared/Btn";
import { Input } from "./shared/Input";
import { Modal } from "./shared/Modal";
import { catColors } from "./shared/constants";
import { toast } from "sonner";


export default function GoalsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [savingAdd, setSavingAdd] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Add states
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [category, setCategory] = useState("Emergency");
  const [initialAmount, setInitialAmount] = useState("");
  const [description, setDescription] = useState("");

  // Edit states
  const [editName, setEditName] = useState("");
  const [editTargetAmount, setEditTargetAmount] = useState("");
  const [editTargetDate, setEditTargetDate] = useState("");
  const [editCategory, setEditCategory] = useState("Emergency");
  const [editCurrentAmount, setEditCurrentAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { goals, addGoal, updateGoal, deleteGoal } = useFinanceStore();

  const handleOpenAdd = () => {
    setName("");
    setTargetAmount("");
    setTargetDate(new Date().toISOString().split("T")[0]);
    setCategory("Emergency");
    setInitialAmount("");
    setDescription("");
    setShowAdd(true);
  };

  const handleOpenEdit = (g: any) => {
    let cat = "Personal";
    let desc = "";
    try {
      const parsed = JSON.parse(g.description || "");
      cat = parsed.category || "Personal";
      desc = parsed.desc || "";
    } catch {
      desc = g.description || "";
    }

    setEditId(g.id);
    setEditName(g.name);
    setEditTargetAmount(String(g.targetAmount));
    setEditTargetDate(new Date(g.targetDate).toISOString().split("T")[0]);
    setEditCategory(cat);
    setEditCurrentAmount(String(g.currentAmount));
    setEditDescription(desc);
  };

  const handleSaveAdd = async () => {
    if (!name.trim() || !targetAmount || !targetDate) return;
    setSavingAdd(true);
    try {
      await addGoal({
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(initialAmount || "0"),
        targetDate: new Date(targetDate).toISOString(),
        description: JSON.stringify({ category, desc: description }),
      });
      toast.success("Financial goal created successfully!");
      setShowAdd(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create goal");
    } finally {
      setSavingAdd(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editId || !editName.trim() || !editTargetAmount || !editTargetDate) return;
    setSavingEdit(true);
    try {
      await updateGoal(editId, {
        name: editName,
        targetAmount: parseFloat(editTargetAmount),
        currentAmount: parseFloat(editCurrentAmount || "0"),
        targetDate: new Date(editTargetDate).toISOString(),
        description: JSON.stringify({ category: editCategory, desc: editDescription }),
      });
      toast.success("Goal updated successfully!");
      setEditId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update goal");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await deleteGoal(id);
        toast.success("Goal deleted successfully!");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete goal");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Financial Goals</h2>
          <p className="text-sm text-muted-foreground">Track your savings milestones</p>
        </div>
        <Btn onClick={handleOpenAdd}><Plus size={15} />New Goal</Btn>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Active Goals</p>
          <p className="text-2xl font-bold text-foreground">{goals.length}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Target</p>
          <p className="text-xl font-bold text-foreground font-mono">{fmt(goals.reduce((s, g) => s + g.targetAmount, 0), true)}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Saved So Far</p>
          <p className="text-xl font-bold text-emerald-500 font-mono">{fmt(goals.reduce((s, g) => s + g.currentAmount, 0), true)}</p>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {goals.map(g => {
          const pct = Math.min(100, Math.round(g.progressPercentage ?? 0));
          const remaining = Math.max(0, g.targetAmount - g.currentAmount);
          const daysLeft = Math.round((new Date(g.targetDate).getTime() - Date.now()) / 86400000);

          let cat = "Personal";
          let desc = "";
          try {
            const parsed = JSON.parse(g.description || "");
            cat = parsed.category || "Personal";
            desc = parsed.desc || "";
          } catch {
            desc = g.description || "";
          }

          const color = catColors[cat] || "#6366f1";

          return (
            <Card key={g.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-foreground">{g.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat} · Due {fmtDate(g.targetDate)}</p>
                  {desc && <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1">{desc}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge color={color}>{pct}% done</Badge>
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => handleOpenEdit(g)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><Edit2 size={13} /></button>
                    <button onClick={() => handleDelete(g.id)} className="p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>

              {/* Circular progress indicator */}
              <div className="flex items-center gap-4 mb-4">
                <svg width="56" height="56" className="shrink-0">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="var(--muted)" strokeWidth="5" />
                  <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 28 28)"
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                  />
                  <text x="28" y="33" textAnchor="middle" fontSize="11" fontWeight="600" fill={color}>{pct}%</text>
                </svg>
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Saved</span>
                    <span>Target</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-sm font-bold text-foreground">{fmt(g.currentAmount, true)}</span>
                    <span className="text-sm font-bold text-foreground">{fmt(g.targetAmount, true)}</span>
                  </div>
                </div>
              </div>

              <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Still need {fmt(remaining, true)}</span>
                <span>{daysLeft > 0 ? `${daysLeft} days left` : "Overdue"}</span>
              </div>

              {pct < 100 && g.suggestion && (
                <div className="mt-3 p-2.5 bg-muted/50 rounded-lg">
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    {g.suggestion.replace(/\$/g, getCurrencySymbol())}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
        {goals.length === 0 && (
          <div className="col-span-2 py-16 text-center bg-card border border-border rounded-2xl">
            <Target size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No goals tracked yet</p>
          </div>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create New Goal">
        <div className="space-y-4">
          <Input label="Goal Name" placeholder="e.g. Europe Trip 2027" value={name} onChange={e => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={`Target Amount (${getCurrencySymbol()})`} type="number" icon={getCurrencyIcon()} placeholder="250000" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
            <Input label="Target Date" type="date" icon={Calendar} value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                {Object.keys(catColors).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input label={`Initial Amount (${getCurrencySymbol()})`} type="number" icon={Wallet} placeholder="0" value={initialAmount} onChange={e => setInitialAmount(e.target.value)} />
          </div>
          <Input label="Description" placeholder="Notes or descriptions..." value={description} onChange={e => setDescription(e.target.value)} />
          <div className="flex gap-2 pt-1">
            <Btn variant="outline" className="flex-1 justify-center" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn className="flex-1 justify-center" loading={savingAdd} onClick={handleSaveAdd}><Check size={14} />Create Goal</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={editId !== null} onClose={() => setEditId(null)} title="Edit Financial Goal">
        <div className="space-y-4">
          <Input label="Goal Name" value={editName} onChange={e => setEditName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={`Target Amount (${getCurrencySymbol()})`} type="number" icon={getCurrencyIcon()} value={editTargetAmount} onChange={e => setEditTargetAmount(e.target.value)} />
            <Input label="Target Date" type="date" icon={Calendar} value={editTargetDate} onChange={e => setEditTargetDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select value={editCategory} onChange={e => setEditCategory(e.target.value)}
                className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                {Object.keys(catColors).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input label={`Current Amount Saved (${getCurrencySymbol()})`} type="number" icon={Wallet} value={editCurrentAmount} onChange={e => setEditCurrentAmount(e.target.value)} />
          </div>
          <Input label="Description" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
          <div className="flex gap-2 pt-1">
            <Btn variant="outline" className="flex-1 justify-center" onClick={() => setEditId(null)}>Cancel</Btn>
            <Btn className="flex-1 justify-center" loading={savingEdit} onClick={handleSaveEdit}><Check size={14} />Update Goal</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
