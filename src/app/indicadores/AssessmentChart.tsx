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

type ObjectiveRow = {
  schoolName: string;
  studentCount: number;
  avgPercentage: number;
  abaixoDoBasico: number;
  proficiente: number;
  avancado: number;
};

type ReadingRow = { schoolName: string; studentCount: number } & Record<string, number | string>;

export function ObjectiveScoreChart({ rows }: { rows: ObjectiveRow[] }) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h3 className="mb-2 text-sm font-medium text-slate-700">Percentual médio de acertos por escola</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="schoolName" tick={{ fontSize: 12 }} />
            <YAxis unit="%" />
            <Tooltip formatter={(v: number) => `${v}%`} />
            <Bar dataKey="avgPercentage" name="Média (%)" fill="#16a34a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-slate-700">Classificação por escola</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="schoolName" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="abaixoDoBasico" name="Abaixo do Básico" stackId="c" fill="#dc2626" />
            <Bar dataKey="proficiente" name="Proficiente" stackId="c" fill="#2563eb" />
            <Bar dataKey="avancado" name="Avançado" stackId="c" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ReadingLevelChart({ rows }: { rows: ReadingRow[] }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-slate-700">Distribuição do nível de leitura por escola</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="schoolName" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          {READING_LEVELS.map((level) => (
            <Bar key={level.code} dataKey={level.code} name={level.shortLabel} stackId="r" fill={level.color} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
