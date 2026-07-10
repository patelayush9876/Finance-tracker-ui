import { useAuthStore } from "../../../store/useAuthStore";
import { DollarSign, IndianRupee, Euro } from "lucide-react";

export const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

export const getCurrencySymbol = () => {
  const currency = useAuthStore.getState().settings?.currency || "INR";
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  return "₹";
};

export const getCurrencyIcon = () => {
  const currency = useAuthStore.getState().settings?.currency || "INR";
  if (currency === "USD") return DollarSign;
  if (currency === "EUR") return Euro;
  return IndianRupee;
};

export const fmt = (n: number, compact = false) => {
  const currency = useAuthStore.getState().settings?.currency || "INR";
  const absVal = Math.abs(n);
  const locale = currency === "INR" ? "en-IN" : "en-US";
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(absVal);
  return n < 0 ? `-${formatted}` : formatted;
};

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const TOOLTIP_STYLE = {
  contentStyle: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    color: "var(--foreground)",
    fontSize: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
  },
  itemStyle: { color: "var(--foreground)" },
  labelStyle: { color: "var(--muted-foreground)", marginBottom: "4px" },
  cursor: { stroke: "var(--border)" },
};

export const formatMonthStr = (monthStr: string) => {
  try {
    const [year, month] = monthStr.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("en-IN", { month: "short" });
  } catch {
    return monthStr;
  }
};

