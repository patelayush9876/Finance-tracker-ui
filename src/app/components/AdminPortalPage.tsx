import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, CreditCard, Briefcase, Shield, Trash2, ArrowRightLeft, Star, AlertCircle, ShieldCheck } from "lucide-react";
import client from "../../api/client";
import { cn, fmt, fmtDate } from "./shared/utils";
import { Card } from "./shared/Card";
import { StatCard } from "./shared/StatCard";
import { Badge } from "./shared/Badge";
import { Btn } from "./shared/Btn";
import { toast } from "sonner";

interface UserAdminRecord {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  username: string | null;
  isEmailVerified: boolean;
  role: string;
  settings?: {
    subscriptionPlan: string;
  } | null;
  createdAt: string;
  _count?: {
    expenses: number;
    incomes: number;
    investments: number;
    goals: number;
  };
}

interface AdminStats {
  totalUsers: number;
  subscriptions: {
    Free: number;
    Pro: number;
    Family: number;
  };
  totalTransactions: number;
  totalAssetValue: number;
}

export default function AdminPortalPage() {
  const [users, setUsers] = useState<UserAdminRecord[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        client.get("/admin/users"),
        client.get("/admin/stats"),
      ]);
      setUsers(usersData as any);
      setStats(statsData as any);
    } catch (err: any) {
      toast.error("Failed to load administration data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      setActionId(userId);
      await client.patch(`/admin/users/${userId}/role`, { role: nextRole });
      toast.success(`User role updated to ${nextRole}`);
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this user account and all their financial data?")) {
      return;
    }
    try {
      setActionId(userId);
      await client.delete(`/admin/users/${userId}`);
      toast.success("User account deleted successfully");
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setActionId(null);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Loading Administration Panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Admin Control Panel</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage user roles, subscriptions, active entries, and global statistics</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Registered Users" value={stats.totalUsers.toString()} icon={Users} color="#10b981" trend={`${stats.subscriptions.Pro + stats.subscriptions.Family} Premium`} trendUp />
          <StatCard label="Total Cash Flows" value={stats.totalTransactions.toString()} icon={CreditCard} color="#3b82f6" trend="Incomes + Expenses" trendUp />
          <StatCard label="Managed Assets" value={fmt(stats.totalAssetValue)} icon={Briefcase} color="#8b5cf6" trend="Investments Portfolio" trendUp />
          <StatCard label="Plans Mix" value={`${stats.subscriptions.Pro} Pro / ${stats.subscriptions.Family} Fam`} icon={Star} color="#f59e0b" trend={`${stats.subscriptions.Free} Free tiers`} trendUp />
        </div>
      )}

      {/* Users Management */}
      <Card className="overflow-hidden bg-gradient-to-br from-card to-card/65 border border-border/80 shadow-md">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground text-base tracking-tight">System Users</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Total accounts: {users.length}</p>
          </div>
          <Badge color="purple">Global Accounts</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Joined", "User Profile", "System Role", "Subscription", "Data Entries", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {users.map((u, idx) => {
                const isSystemAdmin = u.role === "ADMIN";
                const plan = u.settings?.subscriptionPlan || "Free";
                const isPerforming = actionId === u.id;
                
                return (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: Math.min(idx * 0.02, 0.2) }}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    {/* Joined Date */}
                    <td className="px-5 py-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {fmtDate(u.createdAt)}
                    </td>

                    {/* Profile */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase shrink-0",
                          isSystemAdmin ? "bg-purple-600 shadow-md shadow-purple-500/20" : "bg-emerald-500"
                        )}>
                          {u.firstName[0] || "U"}{u.lastName?.[0] || ""}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{u.firstName} {u.lastName || ""}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isSystemAdmin ? (
                          <Badge color="purple" className="flex items-center gap-1">
                            <Shield size={10} /> Admin
                          </Badge>
                        ) : (
                          <Badge color="emerald">User</Badge>
                        )}
                      </div>
                    </td>

                    {/* Subscription */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Badge color={plan === "Family" ? "emerald" : plan === "Pro" ? "blue" : "neutral"}>
                        {plan}
                      </Badge>
                    </td>

                    {/* Data Entries */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-4">
                        <span>Flows: <strong className="text-foreground font-mono">{(u._count?.expenses || 0) + (u._count?.incomes || 0)}</strong></span>
                        <span>Invests: <strong className="text-foreground font-mono">{u._count?.investments || 0}</strong></span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleRole(u.id, u.role)}
                          disabled={isPerforming}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card text-[11px] font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                          title="Toggle Admin/User Role"
                        >
                          <ArrowRightLeft size={11} /> Switch Role
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={isPerforming}
                          className="p-2 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-colors disabled:opacity-50"
                          title="Delete Account"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
