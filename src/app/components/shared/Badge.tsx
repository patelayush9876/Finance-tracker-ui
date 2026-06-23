import React from "react";
import { cn } from "./utils";

export function Badge({ children, color = "#10b981", className }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", className)}
      style={{ background: color + "22", color: color }}
    >
      {children}
    </span>
  );
}
