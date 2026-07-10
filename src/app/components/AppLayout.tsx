import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp, LogOut, Menu, X, Bell, ChevronRight,
  Sun, Moon, Home, CreditCard, Briefcase, Settings
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useFinanceStore } from "../../store/useFinanceStore";
import { cn, fmtDate } from "./shared/utils";
import { NAV_ITEMS } from "./shared/constants";
import { Page } from "./shared/types";


export default function AppLayout({ children, currentPage, onNavigate, darkMode, setDarkMode, onLogout }: {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (p: Page) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  onLogout: () => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const { user } = useAuthStore();
  const { notifications, markNotificationRead } = useFinanceStore();

  const unreadNotifs = notifications.filter(n => !n.isRead);
  const displayNotifs = notifications.slice(0, 5);

  const userInitials = user ? `${user.firstName[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "US";
  const userFullName = user ? `${user.firstName} ${user.lastName || ""}`.trim() : "User";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}>
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
            <TrendingUp size={15} className="text-white" />
          </div>
          {!collapsed && <span className="text-base font-bold text-sidebar-foreground" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>FinTrack</span>}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as Page)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                  active
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.label : undefined}
              >
                {active && (
                  <motion.div
                    layoutId="activeNavBG"
                    className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3 w-full">
                  <item.icon size={17} className={cn(active && "text-emerald-500")} />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="px-2 pb-4 border-t border-sidebar-border pt-3 space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors", collapsed && "justify-center")}
          >
            <ChevronRight size={15} className={cn("transition-transform", !collapsed && "rotate-180")} />
            {!collapsed && "Collapse"}
          </button>
          {!collapsed && user && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-sidebar-accent transition-colors cursor-pointer" onClick={onLogout}>
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white shrink-0">{userInitials}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">{userFullName}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
              </div>
              <LogOut size={13} className="text-sidebar-foreground/40 shrink-0" />
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-5 border-b border-sidebar-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><TrendingUp size={15} className="text-white" /></div>
                  <span className="font-bold text-sidebar-foreground">FinTrack</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-sidebar-accent"><X size={16} className="text-sidebar-foreground" /></button>
              </div>
              <nav className="flex-1 px-2 py-4 space-y-0.5">
                {NAV_ITEMS.map(item => {
                  const active = currentPage === item.id;
                  return (
                    <button key={item.id} onClick={() => { onNavigate(item.id as Page); setSidebarOpen(false); }}
                      className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative", active ? "text-emerald-500 font-semibold" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
                      <item.icon size={17} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-card/80 backdrop-blur-sm border-b border-border flex items-center px-4 gap-3 shrink-0">
          <button className="lg:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} className="text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-foreground capitalize">
              {NAV_ITEMS.find(n => n.id === currentPage)?.label ?? "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 rounded-lg hover:bg-muted transition-colors relative">
                <Bell size={17} className="text-foreground" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-2xl shadow-xl z-[9999] overflow-hidden origin-top-right"
                  >
                    <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                      <p className="font-semibold text-sm text-foreground">Notifications</p>
                      {unreadNotifs.length > 0 && (
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded-full font-bold">{unreadNotifs.length} new</span>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {displayNotifs.length > 0 ? (
                        displayNotifs.map((n) => (
                          <div key={n.id} onClick={() => { if (!n.isRead) markNotificationRead(n.id); }}
                            className={cn("flex items-start gap-3 px-4 py-3 hover:bg-muted transition-colors cursor-pointer border-b border-border last:border-0",
                              !n.isRead && "bg-emerald-500/5")}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/20">
                              <Bell size={13} className="text-emerald-500" />
                            </div>
                            <div className="flex-1">
                              <p className={cn("text-xs text-foreground", !n.isRead ? "font-semibold" : "font-medium")}>{n.title}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{n.message}</p>
                              <p className="text-[9px] text-muted-foreground/60 mt-1">{fmtDate(n.createdAt)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-muted-foreground">No notifications</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-muted transition-colors">
              {darkMode ? <Sun size={17} className="text-foreground" /> : <Moon size={17} className="text-foreground" />}
            </button>
            {user && (
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white cursor-pointer" title={userFullName}>
                {userInitials}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border flex z-30">
          {NAV_ITEMS.slice(0, 5).map(item => {
            const active = currentPage === item.id;
            return (
              <button key={item.id} onClick={() => onNavigate(item.id as Page)}
                className={cn("flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors", active ? "text-emerald-500" : "text-muted-foreground")}>
                <item.icon size={19} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
