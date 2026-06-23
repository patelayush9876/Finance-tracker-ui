import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "./utils";
import { Card } from "./Card";

export function StatCard({ label, value, sub, icon: Icon, color, trend, trendUp }: { label: string; value: string; sub?: string; icon: React.ElementType; color: string; trend?: string; trendUp?: boolean }) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl" style={{ background: color + "18" }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trend && (
          <span className={cn("flex items-center gap-0.5 text-xs font-medium", trendUp ? "text-emerald-500" : "text-red-400")}>
            {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground tracking-tight" style={{ fontFamily: "JetBrains Mono, monospace" }}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </Card>
  );
}
