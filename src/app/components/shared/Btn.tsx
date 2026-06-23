import React from "react";
import { cn } from "./utils";

export interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Btn({ variant = "primary", size = "md", className, children, ...props }: BtnProps) {
  const base = "inline-flex items-center gap-2 font-medium rounded-xl transition-all duration-200 cursor-pointer select-none";
  const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5",
    secondary: "bg-secondary text-secondary-foreground hover:bg-accent border border-border",
    ghost: "hover:bg-muted text-foreground",
    danger: "bg-red-500 hover:bg-red-400 text-white",
    outline: "border border-border hover:bg-muted text-foreground",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
