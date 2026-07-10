import React from "react";
import { cn } from "./utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ElementType;
}

export function Input({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  value,
  onChange,
  className,
  ...props
} : InputProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <div className="relative">
        {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={cn(
            "w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all",
            Icon && "pl-9",
            props.disabled && "opacity-50 cursor-not-allowed"
          )}
          {...props}
        />
      </div>
    </div>
  );
}
