import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  subtle?: boolean;
}

export function Card({ className, subtle, children, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "rounded-xl border border-border bg-surface text-foreground shadow-sm transition-all duration-200",
          subtle && "bg-surface-subtle border-transparent shadow-none",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx("flex flex-col space-y-1.5 p-5 pb-3", className))} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={twMerge(clsx("text-lg font-semibold leading-none tracking-tight text-foreground", className))} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={twMerge(clsx("text-sm text-muted-foreground", className))} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx("p-5 pt-0", className))} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx("flex items-center p-5 pt-0", className))} {...props}>
      {children}
    </div>
  );
}
