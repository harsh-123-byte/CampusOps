import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer";

    const variants = {
      primary:
        "bg-blue-600 hover:bg-blue-700 text-white shadow-xs focus-visible:ring-blue-500 border border-blue-700/20",
      secondary:
        "bg-slate-900 hover:bg-slate-800 text-white shadow-xs focus-visible:ring-slate-800 border border-slate-950/30",
      outline:
        "border border-slate-200/90 bg-white hover:bg-slate-50/80 text-slate-700 shadow-2xs focus-visible:ring-slate-400 hover:border-slate-300",
      danger:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus-visible:ring-rose-500 border border-rose-700/20",
      ghost:
        "bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 focus-visible:ring-slate-400",
      success:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus-visible:ring-emerald-500 border border-emerald-700/20",
    };

    const sizes = {
      sm: "h-8 px-2.5 text-xs gap-1.5",
      md: "h-9 px-3.5 text-xs sm:text-sm gap-2",
      lg: "h-10 px-4 text-sm gap-2",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
