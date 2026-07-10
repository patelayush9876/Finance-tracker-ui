import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Mail, Lock, User, Globe, Building2, CreditCard, TrendingUp, Wallet, Plus, Check, Moon, Sun } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useFinanceStore } from "../../store/useFinanceStore";
import { useDashboardStore } from "../../store/useDashboardStore";
import { cn, fmt } from "./shared/utils";
import { Card } from "./shared/Card";
import { Btn } from "./shared/Btn";
import { Input } from "./shared/Input";
import { Badge } from "./shared/Badge";
import { toast } from "sonner";
import { Page } from "./shared/types";

export default function SettingsPage({ darkMode, setDarkMode, onNavigate, onSelectPlan }: { darkMode: boolean; setDarkMode: (v: boolean) => void; onNavigate?: (p: Page) => void; onSelectPlan?: (plan: "Pro" | "Family") => void }) {
  const [activeTab, setActiveTab] = useState("profile");
  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
    { id: "notifications", label: "Notifications" },
    { id: "appearance", label: "Appearance" },
    { id: "accounts", label: "Accounts" },
    { id: "billing", label: "Billing & Plans" },
  ];

  const { user, updateProfile, updateSettings } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [currency, setCurrency] = useState(user?.settings?.currency || "INR");
  const [notifEnabled, setNotifEnabled] = useState(user?.settings?.notificationsEnabled ?? true);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName || "");
      setUsername(user.username || "");
      if (user.settings) {
        setCurrency(user.settings.currency);
        setNotifEnabled(user.settings.notificationsEnabled);
      }
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ firstName, lastName, username });
      await updateSettings({ currency });
      alert("Profile and currency settings updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    }
  };

  const handleToggleNotifications = async () => {
    try {
      const nextVal = !notifEnabled;
      await updateSettings({ notificationsEnabled: nextVal });
      setNotifEnabled(nextVal);
    } catch (err: any) {
      alert(err.message || "Failed to update notifications setting");
    }
  };

  const handleSaveTheme = async (themeMode: string) => {
    try {
      setDarkMode(themeMode === "dark");
      await updateSettings({ theme: themeMode });
    } catch (err: any) {
      console.error(err);
    }
  };

  const userInitials = user ? `${user.firstName[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "US";
  const userFullName = user ? `${user.firstName} ${user.lastName || ""}`.trim() : "User";

  return (
    <div className="max-w-3xl space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl overflow-x-auto relative">
        {tabs.map(t => {
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn("px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all relative",
                active ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground")}
            >
              {active && (
                <motion.div
                  layoutId="settingsActiveTabBG"
                  className="absolute inset-0 bg-card rounded-lg shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "profile" && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-2xl font-bold text-white">{userInitials}</div>
            </div>
            <div>
              <p className="font-bold text-foreground">{userFullName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-emerald-500 mt-0.5">FinTrack Account Active</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <Input label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
            <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <Input label="Email address (Read-only)" type="email" icon={Mail} value={user?.email || ""} className="opacity-75 pointer-events-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)}
              className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 w-48">
              <option value="INR">₹ Indian Rupee (INR)</option>
              <option value="USD">$ US Dollar (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
            </select>
          </div>
          <Btn onClick={handleSaveProfile}><Check size={14} />Save Changes</Btn>
        </Card>
      )}

      {activeTab === "security" && (
        <Card className="p-6 space-y-5">
          <h3 className="font-bold text-foreground">Security Settings</h3>
          <div className="p-4 rounded-xl border border-yellow-500/25 bg-yellow-500/10 text-xs text-yellow-600 dark:text-yellow-400">
            For security reasons, password resets can only be performed via the Forgot Password request flow at the authentication page.
          </div>
          <div className="space-y-4 opacity-50 pointer-events-none">
            <Input label="Current Password" type="password" icon={Lock} placeholder="••••••••" />
            <Input label="New Password" type="password" icon={Lock} placeholder="Min. 8 characters" />
          </div>
          <Btn className="opacity-50 pointer-events-none"><Lock size={14} />Update Password</Btn>
        </Card>
      )}

      {activeTab === "notifications" && (
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-foreground">Notification Preferences</h3>
          <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div>
              <p className="text-sm font-medium text-foreground">App Notifications</p>
              <p className="text-xs text-muted-foreground">Receive goal completion achievements and system alerts</p>
            </div>
            <button onClick={handleToggleNotifications}
              className={cn("w-10 h-5.5 rounded-full relative transition-all", notifEnabled ? "bg-emerald-500" : "bg-muted")} style={{ width: "40px", height: "22px" }}>
              <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all", notifEnabled ? "left-5" : "left-0.5")} />
            </button>
          </div>
        </Card>
      )}

      {activeTab === "appearance" && (
        <Card className="p-6 space-y-5">
          <h3 className="font-bold text-foreground">Appearance</h3>
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Theme</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "light", label: "Light", icon: Sun },
                { id: "dark", label: "Dark", icon: Moon },
              ].map(t => {
                const active = t.id === "dark" ? darkMode : !darkMode;
                return (
                  <button key={t.id} onClick={() => handleSaveTheme(t.id)}
                    className={cn("p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                      active ? "border-emerald-500 bg-emerald-500/10" : "border-border hover:border-muted-foreground")}>
                    <t.icon size={20} className={cn(active ? "text-emerald-500" : "text-muted-foreground")} />
                    <span className="text-xs font-medium text-foreground">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {activeTab === "accounts" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">Connected Accounts</h3>
            <Btn size="sm" className="opacity-50 pointer-events-none"><Plus size={14} />Link Account</Btn>
          </div>
          {[
            { name: "HDFC Bank — Savings", num: "••• 4521", type: "Bank", balance: 184500, color: "#3b82f6", icon: Building2 },
            { name: "ICICI Credit Card", num: "••• 8832", type: "Credit", balance: -12500, color: "#f59e0b", icon: CreditCard },
            { name: "Zerodha Demat", num: "••• ZD91", type: "Investments", balance: 1008500, color: "#10b981", icon: TrendingUp },
            { name: "Paytm Wallet", num: "••• 7263", type: "Wallet", balance: 3200, color: "#8b5cf6", icon: Wallet },
          ].map(acc => (
            <div key={acc.name} className="flex items-center gap-3 p-3.5 rounded-xl border border-border hover:bg-muted/30 transition-colors">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: acc.color + "18" }}>
                <acc.icon size={17} style={{ color: acc.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{acc.name}</p>
                <p className="text-xs text-muted-foreground">{acc.type} · {acc.num}</p>
              </div>
              <div className="text-right">
                <p className={cn("text-sm font-semibold", acc.balance < 0 ? "text-red-400" : "text-foreground")} style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {acc.balance < 0 ? "-" : ""}{fmt(Math.abs(acc.balance), true)}
                </p>
              </div>
            </div>
          ))}
        </Card>
      )}


      {activeTab === "billing" && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div>
              <h3 className="font-bold text-foreground">Plan & Billing</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Manage your workspace subscription</p>
            </div>
            <Badge color={user?.settings?.subscriptionPlan === "Starter" || !user?.settings?.subscriptionPlan ? "gray" : "emerald"} className="px-2.5 py-1 text-xs">
              {user?.settings?.subscriptionPlan || "Starter"} Plan
            </Badge>
          </div>

          {(!user?.settings?.subscriptionPlan || user?.settings?.subscriptionPlan === "Starter") ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-card border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="font-bold text-sm text-foreground">Starter Plan (Free)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Basic expense tracking up to 100 transactions/month.</p>
                </div>
                <Btn variant="outline" className="opacity-60 cursor-default pointer-events-none" size="sm">Current Plan</Btn>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <Card className="p-4 flex flex-col justify-between border border-border hover:border-emerald-500/50 transition-colors">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-foreground">Pro Plan</span>
                      <span className="text-xs font-semibold text-emerald-500 font-mono">₹499/mo</span>
                    </div>
                    <p className="text-xs text-muted-foreground">For serious investors and finance enthusiasts. Real-time automatic prices, PDF exports, and unlimited targets.</p>
                  </div>
                  <Btn 
                    className="w-full justify-center mt-4" 
                    size="sm"
                    onClick={() => {
                      onSelectPlan?.("Pro");
                      onNavigate?.("checkout");
                    }}
                  >
                    Upgrade to Pro
                  </Btn>
                </Card>

                <Card className="p-4 flex flex-col justify-between border border-border hover:border-blue-500/50 transition-colors">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-foreground">Family Plan</span>
                      <span className="text-xs font-semibold text-blue-500 font-mono">₹999/mo</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Manage finances for your entire family. Shared goals & budgets, family insights, and dedicated manager.</p>
                  </div>
                  <Btn 
                    className="w-full justify-center mt-4" 
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onSelectPlan?.("Family");
                      onNavigate?.("checkout");
                    }}
                  >
                    Upgrade to Family
                  </Btn>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="text-emerald-500" size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">Premium benefits active!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">You are subscribed to the <span className="font-bold text-emerald-500">{user?.settings?.subscriptionPlan}</span> Plan. Enjoy live price syncs, unlimited goals, and more.</p>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-mono text-foreground">Visa ending in 4444</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Next Billing Date</span>
                  <span className="font-mono text-foreground">August 10, 2026</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Monthly Charge</span>
                  <span className="font-mono text-foreground">₹{user?.settings?.subscriptionPlan === "Pro" ? "499" : "999"}.00</span>
                </div>
              </div>

              <div className="flex justify-start pt-2">
                <Btn 
                  variant="ghost" 
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-400 text-xs" 
                  size="sm"
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to cancel your premium subscription?")) {
                      try {
                        await updateSettings({ subscriptionPlan: "Starter" });
                        toast.success("Subscription cancelled successfully. Downgraded to Starter.");
                      } catch (err: any) {
                        toast.error(err.message || "Failed to cancel subscription");
                      }
                    }
                  }}
                >
                  Cancel Subscription
                </Btn>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
