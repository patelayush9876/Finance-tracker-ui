import React from "react";
import { cn } from "./utils";

export function Card({ children, className, glassmorphism }: { children: React.ReactNode; className?: string; glassmorphism?: boolean }) {
  return (
    <div className={cn(
      "rounded-2xl border border-border",
      glassmorphism ? "bg-white/60 dark:bg-white/5 backdrop-blur-xl" : "bg-card",
      "shadow-sm",
      className
    )}>
      {children}
    </div>
  );
}
