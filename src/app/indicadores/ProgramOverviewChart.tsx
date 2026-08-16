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

function KpiCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
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
  schoolRanking: { schoolName: string; avgScore: number }[];
  gradePerformance: { grade: string; avgScore: number }[];
};

const CLASSIFICATION_COLORS: Record<string, string> = {
  "Abaixo do Básico": "#dc2626",
  "Básico": "#f97316",
  "Proficiente": "#eab308",
  "Avançado": "#16a34a",
};

export function ObjectiveOverview({ data }: { data: ObjectiveOverview }) {
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
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard value={data.totalStudents} label="Alunos avaliados" />
        <KpiCard value={data.totalSchools} label="Escolas" />
        <KpiCard value={data.totalClasses} label="Turmas" />
        <KpiCard value={data.avgScoreOutOf10} label="Média geral (0-10)" />
        <KpiCard value={`${data.avgGlobalPercent}%`} label="Média global" />
        <KpiCard value={data.goalPercent / 10} label="Meta SPADEB" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-700">Distribuição dos níveis</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={classificationData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                {classificationData.map((d) => (
                  <Cell key={d.name} fill={CLASSIFICATION_COLORS[d.name]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-700">Acertos por disciplina</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis unit="%" domain={[0, 100]} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <ReferenceLine y={data.goalPercent} stroke="#dc2626" strokeDasharray="4 4" label={{ value: `Meta ${data.goalPercent}%`, fontSize: 11, position: "insideTopRight" }} />
              <Bar dataKey="value" name="% médio de acerto" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-slate-700">Desempenho por série (nota 0-10)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.gradePerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <ReferenceLine y={goalOutOf10} stroke="#dc2626" strokeDasharray="4 4" label={{ value: `Meta ${goalOutOf10}`, fontSize: 11, position: "insideTopRight" }} />
            <Bar dataKey="avgScore" name="Nota média" fill="#16a34a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-slate-700">Ranking de escolas (nota 0-10)</h3>
        <ResponsiveContainer width="100%" height={Math.max(240, data.schoolRanking.length * 28)}>
          <BarChart data={data.schoolRanking} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 10]} />
            <YAxis type="category" dataKey="schoolName" width={220} tick={{ fontSize: 11 }} />
            <Tooltip />
            <ReferenceLine x={goalOutOf10} stroke="#dc2626" strokeDasharray="4 4" />
            <Bar dataKey="avgScore" name="Nota média" fill="#2563eb" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
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

export function ReadingOverview({ data }: { data: ReadingOverview }) {
  const levelData = READING_LEVELS.map((l) => ({
    name: l.shortLabel,
    fullName: l.fullLabel,
    value: data.levelCounts[l.code] ?? 0,
    color: l.color,
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard value={data.totalStudents} label="Total de alunos" />
        <KpiCard value={data.totalSchools} label="Escolas" />
        <KpiCard value={data.totalClasses} label="Turmas" />
        <KpiCard value={data.participatedCount} label="Alunos com participação" />
        <KpiCard value={`${data.participationRate}%`} label="Participação geral" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-700">Distribuição dos perfis de fluência leitora</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={levelData} dataKey="value" nameKey="fullName" innerRadius={55} outerRadius={90}>
                {levelData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-700">Alunos por perfil</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={levelData} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={40} />
              <Tooltip />
              <Bar dataKey="value" name="Alunos" radius={[0, 4, 4, 0]}>
                {levelData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
