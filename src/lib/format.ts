/** Formatação pt-BR: datas (America/Sao_Paulo), números, moeda. */

export const FUSO = "America/Sao_Paulo";

export const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
export const MESES_CURTO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export const DIAS_SEMANA = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
export const DIAS_CURTO = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const paraDate = (v: string | Date): Date => (typeof v === "string" ? new Date(v) : v);

export function fmtData(v: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit", year: "numeric" }).format(paraDate(v));
}

export function fmtDataHora(v: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(paraDate(v));
}

export function fmtHora(v: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, hour: "2-digit", minute: "2-digit" }).format(paraDate(v));
}

export function fmtDataLonga(v: Date): string {
  const s = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(v);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function fmtNum(n: number, casas = 0): string {
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(n);
}

/** Moeda configurável — padrão Real brasileiro (BRL). */
export function fmtMoeda(n: number, moeda = "BRL"): string {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda }).format(n);
  } catch {
    return `R$ ${fmtNum(n, 2)}`;
  }
}

export function fmtPct(n: number, casas = 0): string {
  return `${fmtNum(n, casas)}%`;
}

export function iniciais(nome: string): string {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

/** Diferença em dias (calendário) entre hoje e a data; negativo = vencido. */
export function diasAte(v: string | Date): number {
  const d = paraDate(v);
  const hoje = new Date();
  const a = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function tempoRel(v: string | Date): string {
  const diff = Date.now() - paraDate(v).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `há ${d} dia${d > 1 ? "s" : ""}`;
  return fmtData(v);
}

/** ISO relativo a hoje (n dias; negativo = passado). */
export function isoRel(n: number, h = 9, m = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export function isoData(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDias(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function mesmaData(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function saudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
