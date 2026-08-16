import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";

interface AttentionPoint {
  id: string;
  type: "warning" | "danger" | "info";
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

interface AttentionPointsCardProps {
  items: AttentionPoint[];
}

export function AttentionPointsCard({ items }: AttentionPointsCardProps) {
  if (items.length === 0) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20">
        <CardContent className="flex items-center gap-3 p-5">
          <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Todos os dados em conformidade</p>
            <p className="text-xs text-muted-foreground">Não foram detectadas pendências de validação ou baixa participação na rede.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>Pontos de Atenção Pedagógica & Validações</span>
        </CardTitle>
        <Badge variant="warning">{items.length} pendências</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between rounded-lg border border-border bg-surface-subtle p-3.5 text-xs transition-colors hover:border-muted-foreground/30"
          >
            <div className="flex items-start gap-3">
              {item.type === "danger" ? (
                <ShieldAlert className="h-4 w-4 text-danger shrink-0 mt-0.5" />
              ) : item.type === "warning" ? (
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              ) : (
                <Clock className="h-4 w-4 text-info shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>

            {item.actionText && item.actionHref && (
              <a
                href={item.actionHref}
                className="text-xs font-semibold text-primary hover:underline shrink-0 ml-2"
              >
                {item.actionText} →
              </a>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
