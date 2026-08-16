import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  badgeText?: string;
  badgeVariant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "outline" | "accent";
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  badgeText,
  badgeVariant = "primary",
  backHref,
  backLabel,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 w-full">
      <div className="space-y-1">
        {backHref && (
          <div className="mb-1">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{backLabel || "Voltar"}</span>
            </Link>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {badgeText && <Badge variant={badgeVariant}>{badgeText}</Badge>}
        </div>
        {description && (
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
