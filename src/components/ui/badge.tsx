import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "outline" | "accent";
}

export function Badge({ className, variant = "primary", children, ...props }: BadgeProps) {
  const variants = {
    primary: "bg-primary-soft text-primary font-semibold border-transparent",
    secondary: "bg-secondary-soft text-secondary font-semibold border-transparent",
    success: "bg-emerald-50 dark:bg-emerald-950/60 text-success font-semibold border-emerald-200 dark:border-emerald-800",
    warning: "bg-amber-50 dark:bg-amber-950/60 text-warning font-semibold border-amber-200 dark:border-amber-800",
    danger: "bg-rose-50 dark:bg-rose-950/60 text-danger font-semibold border-rose-200 dark:border-rose-800",
    info: "bg-sky-50 dark:bg-sky-950/60 text-info font-semibold border-sky-200 dark:border-sky-800",
    accent: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-semibold border-transparent",
    outline: "border border-border text-foreground bg-surface",
  };

  return (
    <div
      className={twMerge(
        clsx(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
