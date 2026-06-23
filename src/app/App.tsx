import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useFinanceStore } from "../store/useFinanceStore";
import { useDashboardStore } from "../store/useDashboardStore";
import { Sun, Moon } from "lucide-react";
import { cn } from "./components/shared/utils";
import { Page } from "./components/shared/types";


// Page Components
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import AppLayout from "./components/AppLayout";
import DashboardPage from "./components/DashboardPage";
import ExpensesPage from "./components/ExpensesPage";
import IncomePage from "./components/IncomePage";
import InvestmentsPage from "./components/InvestmentsPage";
import GoalsPage from "./components/GoalsPage";
import AnalyticsPage from "./components/AnalyticsPage";
import SettingsPage from "./components/SettingsPage";

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [darkMode, setDarkMode] = useState(true);

  const { isAuthenticated, getMe, logout, loading: authLoading } = useAuthStore();
  const { 
    fetchExpenseCategories, 
    fetchIncomeCategories, 
    fetchExpenses, 
    fetchIncomes, 
    fetchGoals, 
    fetchInvestments,
    fetchNotifications,
    fetchActivityLogs
  } = useFinanceStore();
  
  const { fetchAllDashboardData } = useDashboardStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Check auth session on boot
  useEffect(() => {
    getMe().then((usr) => {
      if (usr) {
        setPage("dashboard");
        if (usr.settings?.theme) {
          setDarkMode(usr.settings.theme === "dark");
        }
      }
    });
  }, [getMe]);

  // Fetch all user finance data once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchExpenseCategories();
      fetchIncomeCategories();
      fetchExpenses();
      fetchIncomes();
      fetchGoals();
      fetchInvestments();
      fetchNotifications();
      fetchActivityLogs();
      fetchAllDashboardData();
    }
  }, [
    isAuthenticated,
    fetchExpenseCategories,
    fetchIncomeCategories,
    fetchExpenses,
    fetchIncomes,
    fetchGoals,
    fetchInvestments,
    fetchNotifications,
    fetchActivityLogs,
    fetchAllDashboardData
  ]);

  const handleGetStarted = () => setPage("auth");
  const handleLogin = () => setPage("auth");
  const handleAuth = () => { setPage("dashboard"); };
  const handleBack = () => setPage("landing");
  
  const handleLogout = async () => {
    await logout();
    setPage("landing");
  };
  
  const navigate = (p: Page) => setPage(p);

  // Initial Boot Session Loader
  if (authLoading && !isAuthenticated) {
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center bg-background", darkMode ? "dark" : "")}>
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Syncing session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (page === "auth") return (
      <div className={darkMode ? "dark" : ""}>
        <AuthPage onBack={handleBack} onAuth={handleAuth} />
      </div>
    );
    return (
      <div className={darkMode ? "dark" : ""}>
        <div className="relative">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="fixed top-4 right-4 z-50 p-2 rounded-xl bg-card border border-border shadow-md hover:bg-muted transition-colors"
          >
            {darkMode ? <Sun size={16} className="text-foreground" /> : <Moon size={16} className="text-foreground" />}
          </button>
          <LandingPage onGetStarted={handleGetStarted} onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  const pageContent = () => {
    switch (page) {
      case "dashboard": return <DashboardPage onNavigate={navigate} />;
      case "expenses": return <ExpensesPage />;
      case "income": return <IncomePage />;
      case "investments": return <InvestmentsPage />;
      case "goals": return <GoalsPage />;
      case "analytics": return <AnalyticsPage />;
      case "settings": return <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />;
      default: return <DashboardPage onNavigate={navigate} />;
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <AppLayout
        currentPage={page}
        onNavigate={navigate}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
      >
        {pageContent()}
      </AppLayout>
    </div>
  );
}
