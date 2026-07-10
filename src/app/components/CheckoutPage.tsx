import React, { useState } from "react";
import { CreditCard, Calendar, Lock, User, ArrowLeft, Check, Zap } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { Btn } from "./shared/Btn";
import { Card } from "./shared/Card";
import { Input } from "./shared/Input";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Page } from "./shared/types";

export default function CheckoutPage({ onNavigate, selectedPlan: initialPlan }: { onNavigate: (p: Page) => void; selectedPlan?: "Pro" | "Family" }) {
  const { updateSettings } = useAuthStore();
  const [plan, setPlan] = useState<"Pro" | "Family">(initialPlan || "Pro");
  
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);

  const price = plan === "Pro" ? 499 : 999;

  // Format card number to #### #### #### ####
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.slice(i, i + 4));
    }
    setCardNumber(parts.join(" "));
  };

  // Format expiry to MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    setCardCvv(value);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || cardNumber.replace(/\s/g, "").length !== 16) {
      toast.error("Please enter a valid 16-digit card number");
      return;
    }
    if (!cardName.trim()) {
      toast.error("Please enter the cardholder name");
      return;
    }
    if (!cardExpiry || cardExpiry.length !== 5) {
      toast.error("Please enter a valid expiry date (MM/YY)");
      return;
    }
    if (!cardCvv || cardCvv.length !== 3) {
      toast.error("Please enter a valid 3-digit CVV");
      return;
    }

    setLoading(true);
    try {
      // Simulate API payment gateway verification delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update DB setting for subscription plan
      await updateSettings({ subscriptionPlan: plan });
      
      // Confetti blast!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      toast.success(`Successfully upgraded to ${plan} Plan! Thank you for your support!`);
      
      // Redirect back to settings page
      setTimeout(() => {
        onNavigate("settings");
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate("settings")} className="p-2 rounded-xl bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Secure Checkout</h2>
          <p className="text-sm text-muted-foreground">Complete your upgrade securely</p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-6 items-start">
        {/* Checkout Form */}
        <div className="md:col-span-3 space-y-5">
          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-foreground mb-1">Select Subscription Plan</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "Pro", label: "Pro Plan", price: "₹499/mo", desc: "For advanced users" },
                { id: "Family", label: "Family Plan", price: "₹999/mo", desc: "For full family views" }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlan(p.id as any)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    plan === p.id 
                      ? "border-emerald-500 bg-emerald-500/10 shadow-sm" 
                      : "border-border hover:border-muted-foreground bg-card"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-foreground">{p.label}</span>
                    {plan === p.id && <Check size={14} className="text-emerald-500" />}
                  </div>
                  <p className="text-base font-bold text-foreground font-mono">{p.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <form onSubmit={handlePay} className="space-y-4">
              <h3 className="font-bold text-foreground mb-3">Card Information</h3>
              
              <Input
                label="Card Number"
                icon={CreditCard}
                placeholder="4111 2222 3333 4444"
                value={cardNumber}
                onChange={handleCardNumberChange}
                disabled={loading}
              />

              <Input
                label="Cardholder Name"
                icon={User}
                placeholder="Your name here"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                disabled={loading}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Expiration Date"
                  icon={Calendar}
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  disabled={loading}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">CVV</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={3}
                      value={cardCvv}
                      onChange={handleCvvChange}
                      onFocus={() => setIsFlipped(true)}
                      onBlur={() => setIsFlipped(false)}
                      disabled={loading}
                      className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 pl-9 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Btn type="submit" className="w-full justify-center" size="lg" loading={loading}>
                  Pay {plan === "Pro" ? "₹499" : "₹999"} & Upgrade
                </Btn>
              </div>
            </form>
          </Card>
        </div>

        {/* Visual Card Preview & Summary */}
        <div className="md:col-span-2 space-y-6">
          {/* Credit Card Graphic */}
          <div className="relative w-full h-48 [perspective:1000px]">
            <div className={`relative w-full h-full rounded-2xl transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}>
              {/* Card Front */}
              <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 p-5 text-white flex flex-col justify-between shadow-lg [backface-visibility:hidden]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-emerald-100/70">FinTrack Pro Card</p>
                    <Zap size={22} className="text-emerald-300 fill-emerald-300 mt-1" />
                  </div>
                  <span className="font-bold text-sm italic tracking-tight">VISA</span>
                </div>
                <div>
                  <p className="text-lg tracking-widest font-mono mb-3">{cardNumber || "•••• •••• •••• ••••"}</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[8px] uppercase text-emerald-100/50">Card Holder</p>
                      <p className="text-xs font-semibold uppercase tracking-wider truncate max-w-[150px]">{cardName || "Your Name"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] uppercase text-emerald-100/50">Expires</p>
                      <p className="text-xs font-semibold font-mono">{cardExpiry || "MM/YY"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Back */}
              <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-teal-800 to-emerald-950 shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)] py-5 flex flex-col justify-between">
                <div className="w-full h-10 bg-black/60 mt-1" />
                <div className="px-5">
                  <div className="flex justify-between items-center bg-white/10 rounded px-2 py-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-emerald-100/60 font-mono">AUTHORIZED SIGNATURE</span>
                    <span className="bg-white text-black px-2 py-0.5 rounded font-mono text-xs font-bold">{cardCvv || "•••"}</span>
                  </div>
                </div>
                <div className="px-5 text-right">
                  <p className="text-[7px] text-emerald-100/40">This card is property of FinTrack. Mock transaction simulator.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Features Summary Card */}
          <Card className="p-5 space-y-4">
            <h4 className="font-bold text-sm text-foreground">Order Summary</h4>
            <div className="flex justify-between text-xs py-1 border-b border-border/40">
              <span className="text-muted-foreground">{plan} Subscription</span>
              <span className="font-mono text-foreground">₹{price}.00</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-1">
              <span className="text-foreground">Total Due</span>
              <span className="font-mono text-emerald-500">₹{price}.00</span>
            </div>

            <div className="pt-2 space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Included Features:</p>
              <ul className="text-xs space-y-1.5 text-muted-foreground">
                <li className="flex items-center gap-2"><Check size={12} className="text-emerald-500" /> Unlimited transaction logs</li>
                <li className="flex items-center gap-2"><Check size={12} className="text-emerald-500" /> Unlimited savings targets</li>
                <li className="flex items-center gap-2"><Check size={12} className="text-emerald-500" /> Real-time automatic prices</li>
                <li className="flex items-center gap-2"><Check size={12} className="text-emerald-500" /> Priority in-app support</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
