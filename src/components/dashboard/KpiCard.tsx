import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  period?: string;
  trend?: {
    value: number;
    label?: string;
  };
  badgeText?: string;
  badgeVariant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "accent";
  icon?: React.ElementType;
  description?: string;
  status?: "normal" | "warning" | "attention" | "success";
}

export function KpiCard({
  title,
  value,
  unit,
  period,
  trend,
  badgeText,
  badgeVariant = "primary",
  icon: Icon,
  description,
  status = "normal",
}: KpiCardProps) {
  const statusBorders = {
    normal: "border-border",
    success: "border-emerald-300 dark:border-emerald-800",
    warning: "border-amber-300 dark:border-amber-800",
    attention: "border-rose-300 dark:border-rose-800",
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-200 hover:shadow-md ${statusBorders[status]}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                {title}
              </span>
              {description && (
                <span className="group relative cursor-help">
                  <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden w-48 rounded bg-foreground p-2 text-xs text-background shadow-lg group-hover:block z-30">
                    {description}
                  </span>
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
              {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
            </div>
          </div>

          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary shrink-0">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/50 text-xs">
          {period ? (
            <span className="text-muted-foreground">{period}</span>
          ) : (
            <span className="text-muted-foreground">Rede Municipal</span>
          )}

          {trend && (
            <div
              className={`flex items-center gap-0.5 font-medium ${
                trend.value > 0
                  ? "text-success"
                  : trend.value < 0
                  ? "text-danger"
                  : "text-muted-foreground"
              }`}
            >
              {trend.value > 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : trend.value < 0 ? (
                <ArrowDownRight className="h-3.5 w-3.5" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
              <span>{Math.abs(trend.value)}%</span>
              {trend.label && <span className="text-muted-foreground ml-1">{trend.label}</span>}
            </div>
          )}

          {badgeText && <Badge variant={badgeVariant}>{badgeText}</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
