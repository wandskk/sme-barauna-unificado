import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 min-h-[40px] touch-target";

    const variants = {
      primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-hover shadow-sm",
      secondary: "bg-secondary text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm",
      outline: "border border-border bg-surface text-foreground hover:bg-surface-subtle",
      ghost: "text-foreground hover:bg-surface-subtle",
      danger: "bg-danger text-white hover:opacity-90 active:opacity-100 shadow-sm",
      success: "bg-success text-white hover:opacity-90 active:opacity-100 shadow-sm",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs min-h-[36px]",
      md: "h-10 px-4 text-sm min-h-[40px]",
      lg: "h-12 px-6 text-base min-h-[48px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
