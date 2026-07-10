import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useFinanceStore } from "../store/useFinanceStore";
import { useDashboardStore } from "../store/useDashboardStore";
import { Sun, Moon } from "lucide-react";
import { cn } from "./components/shared/utils";
import { Page } from "./components/shared/types";
import { Toaster } from "sonner";


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
import CheckoutPage from "./components/CheckoutPage";

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [darkMode, setDarkMode] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<"Pro" | "Family" | null>(null);

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

  const handleGetStarted = () => {
    setSelectedPlan(null);
    setPage("auth");
  };
  const handleLogin = () => {
    setSelectedPlan(null);
    setPage("auth");
  };
  const handleAuth = () => {
    if (selectedPlan) {
      setPage("checkout");
    } else {
      setPage("dashboard");
    }
  };
  const handleBack = () => setPage("landing");
  
  const handleSelectPlan = (plan: "Pro" | "Family") => {
    setSelectedPlan(plan);
    if (isAuthenticated) {
      setPage("checkout");
    } else {
      setPage("auth");
    }
  };
  
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
          <LandingPage onGetStarted={handleGetStarted} onLogin={handleLogin} onSelectPlan={handleSelectPlan} />
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
      case "settings": return <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} onNavigate={navigate} onSelectPlan={setSelectedPlan} />;
      case "checkout": return <CheckoutPage onNavigate={navigate} selectedPlan={selectedPlan || undefined} />;
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
      <Toaster richColors position="top-right" theme={darkMode ? "dark" : "light"} />
    </div>
  );
}
