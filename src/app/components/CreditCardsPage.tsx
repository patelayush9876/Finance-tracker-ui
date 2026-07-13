import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CreditCard as CardIcon, Plus, DollarSign, Calendar, 
  Trash2, Edit3, ArrowUpRight, Check, AlertCircle, RefreshCw 
} from "lucide-react";
import { useCreditCardStore, CreditCard } from "../../store/useCreditCardStore";
import { useFinanceStore } from "../../store/useFinanceStore";
import { useAuthStore } from "../../store/useAuthStore";
import { cn, fmt, fmtDate, getCurrencySymbol, getCurrencyIcon } from "./shared/utils";
import { Badge } from "./shared/Badge";
import { Card as UICard } from "./shared/Card";
import { Btn } from "./shared/Btn";
import { Input } from "./shared/Input";
import { Modal } from "./shared/Modal";

// Gradients to assign to cards based on index
const CARD_GRADIENTS = [
  "from-slate-900 via-purple-900 to-indigo-900",
  "from-emerald-950 via-teal-900 to-cyan-800",
  "from-rose-950 via-red-900 to-orange-700",
  "from-blue-950 via-indigo-900 to-violet-800",
  "from-stone-900 via-neutral-800 to-zinc-900",
];

export default function CreditCardsPage() {
  const { cards, loading, addCard, updateCard, deleteCard, payBill } = useCreditCardStore();
  const { expenses } = useFinanceStore();
  const { user } = useAuthStore();
  const currencySymbol = getCurrencySymbol();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [billingDate, setBillingDate] = useState("");
  const [last4, setLast4] = useState("");
  const [network, setNetwork] = useState("VISA");

  const [editId, setEditId] = useState<string | null>(null);
  const [editNetwork, setEditNetwork] = useState("VISA");
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);

  // Derive active card
  const activeCard = cards.find(c => c.id === selectedCardId) || cards[0] || null;

  // If activeCard is selected but not matching state, set state
  React.useEffect(() => {
    if (cards.length > 0 && !selectedCardId) {
      setSelectedCardId(cards[0].id);
    }
  }, [cards, selectedCardId]);

  // Expenses for the selected card
  const cardExpenses = React.useMemo(() => {
    if (!activeCard) return [];
    return expenses.filter(exp => exp.creditCardId === activeCard.id);
  }, [expenses, activeCard]);

  const handleOpenAdd = () => {
    setName("");
    setLimit("");
    setDueDate("15");
    setBillingDate("25");
    setLast4("");
    setNetwork("VISA");
    setShowAddModal(true);
  };

  const handleSaveAdd = async () => {
    if (!name.trim() || !limit || !dueDate || !billingDate) return;
    try {
      const newCard = await addCard({
        name,
        limit: parseFloat(limit),
        dueDate: parseInt(dueDate),
        billingDate: parseInt(billingDate),
        last4: last4.trim() || undefined,
        network,
      });
      setShowAddModal(false);
      if (newCard) {
        setSelectedCardId(newCard.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEdit = (card: CreditCard) => {
    setEditId(card.id);
    setName(card.name);
    setLimit(String(card.limit));
    setDueDate(String(card.dueDate));
    setBillingDate(String(card.billingDate));
    setLast4(card.last4 || "");
    setEditNetwork(card.network || "VISA");
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editId || !name.trim() || !limit || !dueDate || !billingDate) return;
    try {
      await updateCard(editId, {
        name,
        limit: parseFloat(limit),
        dueDate: parseInt(dueDate),
        billingDate: parseInt(billingDate),
        last4: last4.trim() || undefined,
        network: editNetwork,
      });
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this credit card? Existing transactions will remain but will no longer be linked to this card.")) {
      try {
        await deleteCard(id);
        if (selectedCardId === id) {
          setSelectedCardId(cards[0]?.id || null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpenPay = (card: CreditCard) => {
    setPayAmount(String(card.outstandingBalance));
    setPayDate(new Date().toISOString().split("T")[0]);
    setShowPayModal(true);
  };

  const handlePayBill = async () => {
    if (!activeCard || !payAmount || parseFloat(payAmount) <= 0) return;
    try {
      await payBill(activeCard.id, {
        amount: parseFloat(payAmount),
        paymentDate: new Date(payDate).toISOString(),
      });
      setShowPayModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamic due status
  const getDueStatus = (card: CreditCard) => {
    if (card.outstandingBalance <= 0) {
      return { label: "No payment due", color: "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30" };
    }
    const today = new Date().getDate();
    const daysLeft = card.dueDate - today;

    if (daysLeft < 0) {
      return { label: `Due on ${card.dueDate}th`, color: "bg-amber-500/15 text-amber-500 border border-amber-500/30" };
    } else if (daysLeft <= 5) {
      return { label: `Due in ${daysLeft} days (${card.dueDate}th)`, color: "bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse" };
    } else {
      return { label: `Due in ${daysLeft} days (${card.dueDate}th)`, color: "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30" };
    }
  };

  const userFullName = user ? `${user.firstName} ${user.lastName || ""}`.trim() : "Card Holder";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Credit Cards</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage credit limits, track outstanding balances, and record bill payments</p>
        </div>
        <Btn onClick={handleOpenAdd} className="w-full sm:w-auto"><Plus size={15} />Add New Card</Btn>
      </div>

      {cards.length === 0 ? (
        <UICard className="p-8 text-center flex flex-col items-center justify-center border border-dashed border-border/80 min-h-[300px]">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
            <CardIcon size={24} className="text-emerald-500" />
          </div>
          <h3 className="font-bold text-foreground text-lg mb-1">No Credit Cards Registered</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-5">
            Add your credit cards to begin tracking balances, outstanding limits, and logging recurring card purchases.
          </p>
          <Btn onClick={handleOpenAdd}><Plus size={15} />Register Your First Card</Btn>
        </UICard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Cards List Carousel & Card Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Visual Cards Grid/Row */}
            <div className="flex overflow-x-auto gap-4 pb-4 px-1 -mx-1 scrollbar-thin scrollbar-thumb-border">
              {cards.map((card, idx) => {
                const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
                const active = card.id === selectedCardId;
                
                return (
                  <motion.div
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "relative w-72 h-44 rounded-2xl p-5 shrink-0 cursor-pointer overflow-hidden shadow-lg transition-all",
                      active 
                        ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background shadow-emerald-500/10" 
                        : "opacity-65 hover:opacity-90 shadow-black/10"
                    )}
                  >
                    {/* Background Gradients */}
                    <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
                    {/* Overlay Grid Pattern for Realism */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px]" />
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
                    
                    {/* Card Interface Content */}
                    <div className="relative h-full flex flex-col justify-between text-white z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-white/50">Credit Card</p>
                          <h4 className="font-extrabold text-sm tracking-tight text-white mt-0.5 truncate max-w-[160px]">{card.name}</h4>
                        </div>
                        <span className="font-black text-xs tracking-wider italic text-white/85 bg-white/10 px-2.5 py-1 rounded-lg">
                          {card.network || "VISA"}
                        </span>
                      </div>

                      {/* Chip & Masked Number */}
                      <div className="my-auto">
                        <div className="w-7 h-5 rounded bg-amber-400/80 mb-3 opacity-90 relative overflow-hidden">
                          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-black/20" />
                          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-black/20" />
                        </div>
                        <p className="font-mono text-base tracking-wider text-white/95">
                          •••• &nbsp; •••• &nbsp; •••• &nbsp; {card.last4 || "••••"}
                        </p>
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[8px] uppercase tracking-widest text-white/40">Card Holder</p>
                          <p className="text-[10px] font-semibold tracking-wide uppercase truncate max-w-[120px]">{userFullName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] uppercase tracking-widest text-white/40">Expires</p>
                          <p className="text-[10px] font-semibold">12/29</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Selected Card Analytics Detail */}
            {activeCard && (
              <UICard className="p-6 bg-gradient-to-br from-card to-card/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 flex gap-1">
                  <button onClick={() => handleOpenEdit(activeCard)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit Card"><Edit3 size={14} /></button>
                  <button onClick={() => handleDelete(activeCard.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors" title="Delete Card"><Trash2 size={14} /></button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/50">
                  <div>
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-2", getDueStatus(activeCard).color)}>
                      {getDueStatus(activeCard).label}
                    </span>
                    <h3 className="text-lg font-bold text-foreground tracking-tight">{activeCard.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Billing statement cycle day: {activeCard.billingDate}th</p>
                  </div>
                  {activeCard.outstandingBalance > 0 && (
                    <Btn className="self-start md:self-auto bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20" onClick={() => handleOpenPay(activeCard)}>
                      <ArrowUpRight size={14} />Pay Card Bill
                    </Btn>
                  )}
                </div>

                {/* Progress Visual */}
                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Outstanding Balance</p>
                      <p className="text-xl font-bold font-mono text-red-400 mt-1">{fmt(activeCard.outstandingBalance, false)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Available Credit</p>
                      <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{fmt(activeCard.availableLimit, false)}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Credit Limit</p>
                      <p className="text-xl font-bold font-mono text-foreground mt-1">{fmt(activeCard.limit, false)}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Credit Utilization</span>
                      <span className="font-semibold text-foreground">
                        {Math.round((activeCard.outstandingBalance / activeCard.limit) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          (activeCard.outstandingBalance / activeCard.limit) >= 0.8 
                            ? "bg-red-400" 
                            : (activeCard.outstandingBalance / activeCard.limit) >= 0.5 
                              ? "bg-amber-400" 
                              : "bg-emerald-500"
                        )}
                        style={{ width: `${Math.min(100, (activeCard.outstandingBalance / activeCard.limit) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </UICard>
            )}

          </div>

          {/* RIGHT: Selected Card Transactions */}
          <div className="lg:col-span-4 space-y-4">
            <UICard className="p-5 flex flex-col h-[400px]">
              <div className="pb-3 border-b border-border mb-3 flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm">Card Transactions</h3>
                <span className="text-xs text-muted-foreground font-normal">({cardExpenses.length})</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1 scrollbar-thin scrollbar-thumb-border">
                {cardExpenses.length > 0 ? (
                  cardExpenses.map(exp => (
                    <div key={exp.id} className="flex justify-between items-center p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-semibold text-foreground truncate">{exp.title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-muted-foreground">{fmtDate(exp.expenseDate)}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="text-[9px] font-medium text-emerald-500">{exp.category?.name || "Uncategorized"}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-red-400 font-mono">-{fmt(exp.amount)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-70">
                    <CardIcon size={24} className="text-muted-foreground mb-2" />
                    <p className="text-xs font-medium text-foreground">No card purchases logged</p>
                    <p className="text-[10px] text-muted-foreground max-w-[180px] mt-1">
                      Choose this card as the payment method when logging expenses under the main Expenses tab.
                    </p>
                  </div>
                )}
              </div>
            </UICard>
          </div>

        </div>
      )}

      {/* MODAL: Register New Credit Card */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Register Credit Card" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Card Preview Column */}
          <div className="flex flex-col items-center justify-center p-5 bg-muted/40 border border-border/50 rounded-2xl min-h-[220px]">
            {/* Visual Card */}
            <div className="relative w-full max-w-xs h-40 rounded-2xl p-5 overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white select-none">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px]" />
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="relative h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[8px] uppercase font-bold tracking-widest text-white/50">Credit Card</p>
                    <h4 className="font-extrabold text-xs tracking-tight text-white mt-0.5 truncate max-w-[140px]">
                      {name || "Card Name"}
                    </h4>
                  </div>
                  <span className="font-black text-xs tracking-wider italic text-white/85 bg-white/10 px-2 py-0.5 rounded-md shrink-0">
                    {network}
                  </span>
                </div>

                <div className="my-auto">
                  <div className="w-6 h-4 rounded bg-amber-400/80 mb-2 opacity-90 relative overflow-hidden">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-black/20" />
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-black/20" />
                  </div>
                  <p className="font-mono text-sm tracking-wider text-white/95">
                    •••• &nbsp; •••• &nbsp; •••• &nbsp; {last4 || "••••"}
                  </p>
                </div>

                <div className="flex justify-between items-end text-[10px]">
                  <div className="min-w-0">
                    <p className="text-[7px] uppercase tracking-widest text-white/40">Card Holder</p>
                    <p className="font-semibold uppercase tracking-wide truncate max-w-[110px]">{userFullName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[7px] uppercase tracking-widest text-white/40">Credit Limit</p>
                    <p className="font-semibold font-mono text-emerald-400">
                      {limit ? fmt(parseFloat(limit)) : fmt(0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Cycle Details Badge */}
            <div className="mt-4 flex gap-4 text-[10px] font-semibold text-muted-foreground bg-card border border-border/80 px-3 py-1.5 rounded-full">
              <span>Billing Cycle: <strong className="text-foreground">{billingDate || "—"}th</strong></span>
              <span className="w-px h-3 bg-border self-center" />
              <span>Due Date: <strong className="text-foreground">{dueDate || "—"}th</strong></span>
            </div>
          </div>

          {/* Form Column */}
          <div className="space-y-4">
            <Input label="Card Name" placeholder="e.g. HDFC Regalia, Chase Sapphire" value={name} onChange={e => setName(e.target.value)} />
            
            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-1">
                <Input label={`Limit (${currencySymbol})`} type="number" placeholder="0" value={limit} onChange={e => setLimit(e.target.value)} />
              </div>
              <div className="col-span-1">
                <Input label="Last 4" placeholder="4242" maxLength={4} value={last4} onChange={e => setLast4(e.target.value)} />
              </div>
              <div className="col-span-1 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Network</label>
                <select value={network} onChange={e => setNetwork(e.target.value)}
                  className="bg-input-background border border-border rounded-xl px-2 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 h-[40px]">
                  <option value="VISA">Visa</option>
                  <option value="MASTERCARD">Mastercard</option>
                  <option value="AMEX">Amex</option>
                  <option value="RUPAY">RuPay</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Billing Cycle Day</label>
                <select value={billingDate} onChange={e => setBillingDate(e.target.value)}
                  className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}th</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Payment Due Day</label>
                <select value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}th</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Btn variant="outline" className="flex-1 justify-center" onClick={() => setShowAddModal(false)}>Cancel</Btn>
              <Btn className="flex-1 justify-center" onClick={handleSaveAdd}><Check size={14} />Save Card</Btn>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL: Edit Credit Card */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Credit Card" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Card Preview Column */}
          <div className="flex flex-col items-center justify-center p-5 bg-muted/40 border border-border/50 rounded-2xl min-h-[220px]">
            {/* Visual Card */}
            <div className="relative w-full max-w-xs h-40 rounded-2xl p-5 overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white select-none">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px]" />
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="relative h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[8px] uppercase font-bold tracking-widest text-white/50">Credit Card</p>
                    <h4 className="font-extrabold text-xs tracking-tight text-white mt-0.5 truncate max-w-[140px]">
                      {name || "Card Name"}
                    </h4>
                  </div>
                  <span className="font-black text-xs tracking-wider italic text-white/85 bg-white/10 px-2 py-0.5 rounded-md shrink-0">
                    {editNetwork}
                  </span>
                </div>

                <div className="my-auto">
                  <div className="w-6 h-4 rounded bg-amber-400/80 mb-2 opacity-90 relative overflow-hidden">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-black/20" />
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-black/20" />
                  </div>
                  <p className="font-mono text-sm tracking-wider text-white/95">
                    •••• &nbsp; •••• &nbsp; •••• &nbsp; {last4 || "••••"}
                  </p>
                </div>

                <div className="flex justify-between items-end text-[10px]">
                  <div className="min-w-0">
                    <p className="text-[7px] uppercase tracking-widest text-white/40">Card Holder</p>
                    <p className="font-semibold uppercase tracking-wide truncate max-w-[110px]">{userFullName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[7px] uppercase tracking-widest text-white/40">Credit Limit</p>
                    <p className="font-semibold font-mono text-emerald-400">
                      {limit ? fmt(parseFloat(limit)) : fmt(0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Cycle Details Badge */}
            <div className="mt-4 flex gap-4 text-[10px] font-semibold text-muted-foreground bg-card border border-border/80 px-3 py-1.5 rounded-full">
              <span>Billing Cycle: <strong className="text-foreground">{billingDate || "—"}th</strong></span>
              <span className="w-px h-3 bg-border self-center" />
              <span>Due Date: <strong className="text-foreground">{dueDate || "—"}th</strong></span>
            </div>
          </div>

          {/* Form Column */}
          <div className="space-y-4">
            <Input label="Card Name" placeholder="e.g. HDFC Regalia" value={name} onChange={e => setName(e.target.value)} />
            
            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-1">
                <Input label={`Limit (${currencySymbol})`} type="number" value={limit} onChange={e => setLimit(e.target.value)} />
              </div>
              <div className="col-span-1">
                <Input label="Last 4" placeholder="4242" maxLength={4} value={last4} onChange={e => setLast4(e.target.value)} />
              </div>
              <div className="col-span-1 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Network</label>
                <select value={editNetwork} onChange={e => setEditNetwork(e.target.value)}
                  className="bg-input-background border border-border rounded-xl px-2 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 h-[40px]">
                  <option value="VISA">Visa</option>
                  <option value="MASTERCARD">Mastercard</option>
                  <option value="AMEX">Amex</option>
                  <option value="RUPAY">RuPay</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Billing Cycle Day</label>
                <select value={billingDate} onChange={e => setBillingDate(e.target.value)}
                  className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}th</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Payment Due Day</label>
                <select value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}th</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Btn variant="outline" className="flex-1 justify-center" onClick={() => setShowEditModal(false)}>Cancel</Btn>
              <Btn className="flex-1 justify-center" onClick={handleSaveEdit}><Check size={14} />Update Details</Btn>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL: Pay Card Bill */}
      {activeCard && (
        <Modal open={showPayModal} onClose={() => setShowPayModal(false)} title={`Pay Bill — ${activeCard.name}`}>
          <div className="space-y-4">
            <div className="p-3 bg-muted/40 border border-border/80 rounded-xl">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Outstanding Balance</p>
              <p className="text-lg font-bold font-mono text-red-400 mt-0.5">{fmt(activeCard.outstandingBalance)}</p>
            </div>

            <Input label={`Payment Amount (${currencySymbol})`} type="number" placeholder="Enter amount to pay" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
            
            <Input label="Payment Date" type="date" icon={Calendar} value={payDate} onChange={e => setPayDate(e.target.value)} />

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <AlertCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <strong>No double counting:</strong> Logging this payment will generate a bill payment transaction in your expenses list but will be marked as a transfer, automatically excluding it from your monthly spending analytics.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <Btn variant="outline" className="flex-1 justify-center" onClick={() => setShowPayModal(false)}>Cancel</Btn>
              <Btn className="flex-1 bg-emerald-500 hover:bg-emerald-600 justify-center" onClick={handlePayBill}>
                <Check size={14} />Record Payment
              </Btn>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
