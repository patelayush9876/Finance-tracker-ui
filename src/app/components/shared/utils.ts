export const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

export const fmt = (n: number, compact = false) =>
  compact
    ? n >= 100000
      ? `₹${(n / 100000).toFixed(1)}L`
      : n >= 1000
      ? `₹${(n / 1000).toFixed(0)}K`
      : `₹${n}`
    : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.abs(n));

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

