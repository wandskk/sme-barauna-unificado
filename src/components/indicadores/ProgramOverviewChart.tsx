"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { READING_LEVELS } from "@/core/assessments/readingLevels";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function KpiItem({ value, label }: { value: string | number; label: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

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

type ObjectiveOverview = {
  totalStudents: number;
  totalSchools: number;
  totalClasses: number;
  avgScoreOutOf10: number;
  avgGlobalPercent: number;
  goalPercent: number;
  subjectAverages: { portugues: number; matematica: number };
  classification: { abaixoDoBasico: number; basico: number; proficiente: number; avancado: number };
  groupRanking: { label: string; avgScore: number }[];
  gradePerformance: { grade: string; avgScore: number }[];
};

const CLASSIFICATION_COLORS: Record<string, string> = {
  "Abaixo do Básico": "#ef4444",
  "Básico": "#f59e0b",
  "Proficiente": "#3b82f6",
  "Avançado": "#10b981",
};

export function ObjectiveOverview({ data, groupNoun }: { data: ObjectiveOverview; groupNoun: "escola" | "turma" }) {
  const classificationData = [
    { name: "Abaixo do Básico", value: data.classification.abaixoDoBasico },
    { name: "Básico", value: data.classification.basico },
    { name: "Proficiente", value: data.classification.proficiente },
    { name: "Avançado", value: data.classification.avancado },
  ];
  const subjectData = [
    { name: "Português", value: data.subjectAverages.portugues },
    { name: "Matemática", value: data.subjectAverages.matematica },
  ];
  const goalOutOf10 = data.goalPercent / 10;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiItem value={data.totalStudents} label="Alunos avaliados" />
        {groupNoun === "escola" && <KpiItem value={data.totalSchools} label="Escolas" />}
        <KpiItem value={data.totalClasses} label="Turmas" />
        <KpiItem value={data.avgScoreOutOf10} label="Média geral (0-10)" />
        <KpiItem value={`${data.avgGlobalPercent}%`} label="Média global" />
        <KpiItem value={data.goalPercent / 10} label="Meta SPADEB" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Distribuição dos níveis de desempenho">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={classificationData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                {classificationData.map((d) => (
                  <Cell key={d.name} fill={CLASSIFICATION_COLORS[d.name]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--surface))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Acertos médios por disciplina">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "currentColor" }} />
              <YAxis unit="%" domain={[0, 100]} tick={{ fill: "currentColor" }} />
              <Tooltip
                formatter={(v: number) => `${v}%`}
                contentStyle={{
                  backgroundColor: "hsl(var(--surface))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                  borderRadius: "8px",
                }}
              />
              <ReferenceLine y={data.goalPercent} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `Meta ${data.goalPercent}%`, fontSize: 11, position: "insideTopRight", fill: "currentColor" }} />
              <Bar dataKey="value" name="% médio de acerto" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      <Section title="Desempenho por série (nota 0-10)">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.gradePerformance}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="grade" tick={{ fontSize: 12, fill: "currentColor" }} />
            <YAxis domain={[0, 10]} tick={{ fill: "currentColor" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--surface))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
                borderRadius: "8px",
              }}
            />
            <ReferenceLine y={goalOutOf10} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `Meta ${goalOutOf10}`, fontSize: 11, position: "insideTopRight", fill: "currentColor" }} />
            <Bar dataKey="avgScore" name="Nota média" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title={`Acompanhamento por ${groupNoun === "escola" ? "escola" : "turma"} (nota 0-10)`}>
        <ResponsiveContainer width="100%" height={Math.max(240, data.groupRanking.length * 28)}>
          <BarChart data={data.groupRanking} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis type="number" domain={[0, 10]} tick={{ fill: "currentColor" }} />
            <YAxis type="category" dataKey="label" width={220} tick={{ fontSize: 11, fill: "currentColor" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--surface))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
                borderRadius: "8px",
              }}
            />
            <ReferenceLine x={goalOutOf10} stroke="#ef4444" strokeDasharray="4 4" />
            <Bar dataKey="avgScore" name="Nota média" fill="#2563eb" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Section>
    </div>
  );
}

type ReadingOverview = {
  totalStudents: number;
  totalSchools: number;
  totalClasses: number;
  participatedCount: number;
  participationRate: number;
  levelCounts: Record<string, number>;
};

export function ReadingOverview({ data, groupNoun }: { data: ReadingOverview; groupNoun: "escola" | "turma" }) {
  const levelData = READING_LEVELS.map((l) => ({
    name: l.shortLabel,
    fullName: l.fullLabel,
    value: data.levelCounts[l.code] ?? 0,
    color: l.color,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiItem value={data.totalStudents} label="Total de alunos" />
        {groupNoun === "escola" && <KpiItem value={data.totalSchools} label="Escolas" />}
        <KpiItem value={data.totalClasses} label="Turmas" />
        <KpiItem value={data.participatedCount} label="Alunos com participação" />
        <KpiItem value={`${data.participationRate}%`} label="Participação geral" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Distribuição dos perfis de fluência leitora">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={levelData} dataKey="value" nameKey="fullName" innerRadius={55} outerRadius={90}>
                {levelData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--surface))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Alunos por perfil">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={levelData} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: "currentColor" }} />
              <YAxis type="category" dataKey="name" width={40} tick={{ fill: "currentColor" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--surface))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" name="Alunos" radius={[0, 4, 4, 0]}>
                {levelData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>
    </div>
  );
}
