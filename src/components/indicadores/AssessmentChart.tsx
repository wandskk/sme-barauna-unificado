"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { READING_LEVELS } from "@/core/assessments/readingLevels";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type ObjectiveRow = {
  label: string;
  studentCount: number;
  avgPercentage: number;
  abaixoDoBasico: number;
  basico: number;
  proficiente: number;
  avancado: number;
};

type ReadingRow = { label: string; studentCount: number } & Record<string, number | string>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function ObjectiveScoreChart({ rows, groupNoun }: { rows: ObjectiveRow[]; groupNoun: "escola" | "turma" }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title={`Comparação de acertos por ${groupNoun}`}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "currentColor" }} />
            <YAxis unit="%" tick={{ fill: "currentColor" }} />
            <Tooltip
              formatter={(v: number) => `${v}%`}
              contentStyle={{
                backgroundColor: "hsl(var(--surface))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="avgPercentage" name="Média (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title={`Classificação por ${groupNoun}`}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "currentColor" }} />
            <YAxis allowDecimals={false} tick={{ fill: "currentColor" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--surface))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="abaixoDoBasico" name="Abaixo do Básico" stackId="c" fill="#ef4444" />
            <Bar dataKey="basico" name="Básico" stackId="c" fill="#f59e0b" />
            <Bar dataKey="proficiente" name="Proficiente" stackId="c" fill="#3b82f6" />
            <Bar dataKey="avancado" name="Avançado" stackId="c" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </Section>
    </div>
  );
}

export function ReadingLevelChart({ rows, groupNoun }: { rows: ReadingRow[]; groupNoun: "escola" | "turma" }) {
  return (
    <Section title={`Distribuição do nível de leitura por ${groupNoun}`}>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "currentColor" }} />
          <YAxis allowDecimals={false} tick={{ fill: "currentColor" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--surface))",
              borderColor: "hsl(var(--border))",
              color: "hsl(var(--foreground))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          {READING_LEVELS.map((level) => (
            <Bar key={level.code} dataKey={level.code} name={level.shortLabel} stackId="r" fill={level.color} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Section>
  );
}
