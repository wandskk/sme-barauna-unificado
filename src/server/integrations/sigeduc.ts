// Cliente da API do SIGEduc/Educ21 — dados acadêmicos da rede municipal
// (escolas, servidores/professores, matrícula de alunos, notas, frequência).
// Swagger: https://api.educ21.com.br/swagger-ui/index.html
// Usado hoje só pelo script de importação (scripts/importSigeduc.ts); se um
// dia virar sync automático, este módulo é o ponto único a estender.

const BASE_URL = process.env.SIGEDUC_API_URL ?? "https://api.educ21.com.br";

function headers() {
  const apiKey = process.env.SIGEDUC_API_KEY;
  const clientId = process.env.SIGEDUC_CLIENT_ID;
  if (!apiKey || !clientId) {
    throw new Error("SIGEDUC_API_KEY / SIGEDUC_CLIENT_ID não configurados no .env");
  }
  return {
    "X-API-KEY": apiKey,
    "X-CLIENT-ID": clientId,
    accept: "application/json",
    "Content-Type": "application/json",
  };
}

export type SigeducEscola = { id: number; nome: string; codigo_inep: string };

export type SigeducServidor = {
  escola: string;
  nome: string;
  matricula: string;
  cpf: string;
  cargo: string;
  funo: string;
  disciplina: string;
  etapa_ensino: string;
  serie: string;
  turno: string;
  turma: string;
  codigo_inep_escola: string;
  status: string;
};

export type SigeducFrequenciaDia = {
  etapa_ensino: string;
  serie: string;
  turma: string;
  disciplina: string;
  data: string; // "YYYY-MM-DD"
  falta: number;
  quantidade_aula: number;
  abonada: boolean;
};

export type SigeducEstudanteFrequencia = {
  matricula: string;
  estudante: string;
  cpf: string | null;
  frequencias: SigeducFrequenciaDia[];
};

export type SigeducNota = { unidade: number; nota: number; descricao: string };

export type SigeducTurmaComponente = {
  escola: string;
  etapa_ensino: string;
  serie: string;
  turma: string; // código de turma (mesmo formato de consulta-servidor/estudante)
  disciplina: string;
  quantidade_notas: number;
  notas: SigeducNota[];
};

export type SigeducEstudanteNota = {
  matricula: string;
  estudante: string;
  cpf: string | null;
  turmas_componentes: SigeducTurmaComponente[];
};

export type SigeducEstudante = {
  id: number;
  nome: string;
  matricula: string;
  cpf: string;
  data_nascimento: string;
  ano: number;
  nome_turma_serie: string; // é o código de turma (ex.: "EFAIINT1B"), não um nome legível
  nomeEscola: string;
};

type Paginado<T> = {
  dados: T[];
  pagina: number;
  totalPaginas: number;
  totalElementos: number;
};

async function fetchJson<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers: headers() });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`SIGEduc ${path} -> ${res.status}: ${body.slice(0, 500)}`);
  }
  return res.json() as Promise<T>;
}

export async function listEscolas(): Promise<SigeducEscola[]> {
  return fetchJson<SigeducEscola[]>("/api/v1/consulta-escola", { method: "GET" });
}

/** Busca todos os servidores da rede, paginando automaticamente. */
export async function listAllServidores(): Promise<SigeducServidor[]> {
  const tamanho = 1000;
  let pagina = 0;
  const all: SigeducServidor[] = [];
  while (true) {
    const page = await fetchJson<Paginado<SigeducServidor>>(
      `/api/v1/consulta-servidor?pagina=${pagina}&tamanho=${tamanho}`,
      { method: "POST", body: JSON.stringify({}) }
    );
    all.push(...page.dados);
    if (pagina + 1 >= page.totalPaginas) break;
    pagina++;
  }
  return all;
}

/** Busca todos os alunos enturmados de um ano, paginando automaticamente (rede toda). */
export async function listAllEstudantesEnturmados(ano: number): Promise<SigeducEstudante[]> {
  const tamanho = 1000;
  let pagina = 0;
  const all: SigeducEstudante[] = [];
  while (true) {
    const page = await fetchJson<Paginado<SigeducEstudante>>(
      `/api/v1/consulta-estudante/enturmado?pagina=${pagina}&tamanho=${tamanho}`,
      { method: "POST", body: JSON.stringify({ ano }) }
    );
    all.push(...page.dados);
    if (pagina + 1 >= page.totalPaginas) break;
    pagina++;
  }
  return all;
}

/** Busca frequência de toda a rede num intervalo de datas, paginando automaticamente. */
export async function listAllFrequencias(dataInicio: string, dataFim: string): Promise<SigeducEstudanteFrequencia[]> {
  const tamanho = 1000;
  let pagina = 0;
  const all: SigeducEstudanteFrequencia[] = [];
  while (true) {
    const page = await fetchJson<Paginado<SigeducEstudanteFrequencia>>(
      `/api/v1/consulta-frequencia?data_inicio=${dataInicio}&data_fim=${dataFim}&pagina=${pagina}&tamanho=${tamanho}`,
      { method: "GET" }
    );
    all.push(...page.dados);
    if (pagina + 1 >= page.totalPaginas) break;
    pagina++;
  }
  return all;
}

/** Busca notas de toda a rede num ano, paginando automaticamente (pagina é por aluno). */
export async function listAllNotas(ano: number): Promise<SigeducEstudanteNota[]> {
  const tamanho = 1000;
  let pagina = 0;
  const all: SigeducEstudanteNota[] = [];
  while (true) {
    const page = await fetchJson<Paginado<SigeducEstudanteNota>>(
      `/api/v1/consulta-nota?ano=${ano}&pagina=${pagina}&tamanho=${tamanho}`,
      { method: "GET" }
    );
    all.push(...page.dados);
    if (pagina + 1 >= page.totalPaginas) break;
    pagina++;
  }
  return all;
}

export const PROFESSOR_CARGOS = new Set([
  "Outros",
  "PROFESSOR AUXILIAR",
  "PROFESSOR - CONVENIO",
  "PROFESSOR TEMPORARIO",
  "PROF PERM NIVEL - I",
  "PROF PERM NIVEL - II",
  "PROF PERM NIVEL - III",
  "PROF PERM NIVEL - IV",
  "PROF PERM NIVEL - V",
  "PROF PERM NIVEL - VI",
]);

export const COORDENADOR_CARGOS = new Set(["COORDENADOR", "COORDENADOR GERAL", "SUBCOORDENADOR"]);

export function mapTurno(turno: string | null): string {
  switch (turno) {
    case "MATUTINO":
      return "manha";
    case "VESPERTINO":
      return "tarde";
    case "INTEGRAL":
      return "integral";
    case "NOTURNO":
      return "noturno";
    default:
      return "manha";
  }
}

/** Heurística: o último caractere do código de turma costuma ser a letra da turma (ex.: "EFAIINT1B" -> "B"). */
export function turmaLetterFromCode(code: string): string {
  const last = code.trim().slice(-1).toUpperCase();
  return /^[A-Z]$/.test(last) ? last : code;
}

export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}
