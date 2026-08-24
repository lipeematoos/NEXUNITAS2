import { ReactNode, createContext, useContext, useMemo, useState } from "react";
import {
  AUDITORIA_SEED, Auditoria, DEMANDAS_SEED, DOCUMENTOS_SEED, Demanda, Documento, EQUIPES_SEED, Equipe,
  EVENTOS_SEED, EventoAgenda, FLUXOS_SEED, Fluxo, NOTIFICACOES_SEED, Notificacao, PERFIS_SEED, PerfilAcesso,
  PROJETOS_SEED, Projeto, RISCOS_SEED, Risco, TAREFAS_SEED, Tarefa, UNIDADES_SEED, USUARIOS_SEED, Unidade, Usuario,
} from "./data";

export interface ConfigSistema {
  orgao: { nome: string; cnpj: string; endereco: string; municipio: string; uf: string };
  regional: { idioma: string; fuso: string; moeda: string; formatoData: string };
  notificacoes: Record<string, boolean>;
  seguranca: Record<string, boolean>;
}

const CONFIG_INICIAL: ConfigSistema = {
  orgao: { nome: "Prefeitura Municipal de Cidade Exemplo", cnpj: "12.345.678/0001-90", endereco: "Praça Central, 100 — Centro", municipio: "Cidade Exemplo", uf: "SP" },
  regional: { idioma: "pt-BR", fuso: "America/Sao_Paulo", moeda: "BRL", formatoData: "DD/MM/YYYY" },
  notificacoes: { tarefasAtribuidas: true, prazosVencendo: true, aprovacoes: true, resumoDiario: false, demandasNovas: true },
  seguranca: { mfa: true, senhaForte: true, bloqueioTentativas: true, sessaoLimite: true },
};

interface Store {
  usuarios: Usuario[]; unidades: Unidade[]; equipes: Equipe[]; projetos: Projeto[]; tarefas: Tarefa[];
  demandas: Demanda[]; fluxos: Fluxo[]; documentos: Documento[]; riscos: Risco[]; notificacoes: Notificacao[];
  eventos: EventoAgenda[]; auditoria: Auditoria[]; perfis: PerfilAcesso[]; config: ConfigSistema;
  atual: Usuario;
  registrarAuditoria: (acao: string, objeto: string, detalhe: string) => void;
  moverTarefa: (id: string, status: string) => void;
  criarTarefa: (t: Omit<Tarefa, "id" | "criadaEm">) => void;
  criarDemanda: (d: Omit<Demanda, "id" | "protocolo" | "criadaEm" | "historico" | "status">) => void;
  mudarStatusDemanda: (id: string, status: string, detalhe: string) => void;
  criarProjeto: (p: Omit<Projeto, "id" | "codigo" | "progresso" | "executado" | "fases">) => void;
  atualizarFluxo: (id: string, patch: Partial<Fluxo>) => void;
  criarEvento: (e: Omit<EventoAgenda, "id">) => void;
  criarDocumento: (d: Omit<Documento, "id" | "atualizadoEm" | "versao">) => void;
  criarRisco: (r: Omit<Risco, "id">) => void;
  marcarNotificacoesLidas: () => void;
  toggleUsuario: (id: string) => void;
  setPerfis: (p: PerfilAcesso[]) => void;
  setConfig: (c: ConfigSistema) => void;
}

const Ctx = createContext<Store | null>(null);

export function useApp(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useApp fora do AppProvider");
  return s;
}

let seq = 1000;
const nid = (p: string) => `${p}${++seq}`;

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState(USUARIOS_SEED);
  const [projetos, setProjetos] = useState(PROJETOS_SEED);
  const [tarefas, setTarefas] = useState(TAREFAS_SEED);
  const [demandas, setDemandas] = useState(DEMANDAS_SEED);
  const [fluxos, setFluxos] = useState(FLUXOS_SEED);
  const [documentos, setDocumentos] = useState(DOCUMENTOS_SEED);
  const [riscos, setRiscos] = useState(RISCOS_SEED);
  const [notificacoes, setNotificacoes] = useState(NOTIFICACOES_SEED);
  const [eventos, setEventos] = useState(EVENTOS_SEED);
  const [auditoria, setAuditoria] = useState(AUDITORIA_SEED);
  const [perfis, setPerfis] = useState(PERFIS_SEED);
  const [config, setConfig] = useState(CONFIG_INICIAL);

  const atual = usuarios[0];

  const registrarAuditoria = (acao: string, objeto: string, detalhe: string) => {
    setAuditoria((a) => [
      { id: nid("a"), dataHora: new Date().toISOString(), usuario: atual.nome, acao, objeto, detalhe, ip: "10.0.4.21" },
      ...a,
    ]);
  };

  const store: Store = useMemo(() => ({
    usuarios, unidades: UNIDADES_SEED, equipes: EQUIPES_SEED, projetos, tarefas, demandas, fluxos,
    documentos, riscos, notificacoes, eventos, auditoria, perfis, config, atual,
    registrarAuditoria,
    moverTarefa: (id, status) => {
      setTarefas((ts) => ts.map((t) => (t.id === id ? { ...t, status, bloqueioMotivo: status === "Bloqueado" ? t.bloqueioMotivo : undefined } : t)));
      registrarAuditoria("Movimentação de tarefa", `Tarefa ${id.toUpperCase()}`, `Status alterado para ${status}`);
    },
    criarTarefa: (t) => {
      setTarefas((ts) => [{ ...t, id: nid("t"), criadaEm: new Date().toISOString() }, ...ts]);
      registrarAuditoria("Criação de tarefa", t.titulo, `Atribuída a ${usuarios.find((u) => u.id === t.responsavelId)?.nome ?? "—"}`);
    },
    criarDemanda: (d) => {
      const protocolo = `DEM-2026-0${345 + Math.floor(Math.random() * 50)}`;
      setDemandas((ds) => [{
        ...d, id: nid("d"), protocolo, status: "Nova", criadaEm: new Date().toISOString(),
        historico: [{ data: new Date().toISOString(), usuario: atual.nome, acao: "Demanda aberta", detalhe: "Solicitação registrada no SIGA." }],
      }, ...ds]);
      registrarAuditoria("Abertura de demanda", protocolo, `${d.tipo} — ${usuarios.find((u) => u.id === d.solicitanteId)?.nome ?? ""}`);
    },
    mudarStatusDemanda: (id, status, detalhe) => {
      setDemandas((ds) => ds.map((d) => d.id === id ? {
        ...d, status,
        historico: [...d.historico, { data: new Date().toISOString(), usuario: atual.nome, acao: `Status alterado para ${status}`, detalhe }],
      } : d));
      registrarAuditoria("Atualização de demanda", demandas.find((d) => d.id === id)?.protocolo ?? id, `Status: ${status}`);
    },
    criarProjeto: (p) => {
      setProjetos((ps) => [{
        ...p, id: nid("p"), codigo: `PRJ-2026-0${10 + ps.length}`, progresso: 0, executado: 0,
        fases: [{ nome: "Iniciação", feita: false }, { nome: "Planejamento", feita: false }, { nome: "Execução", feita: false }],
      }, ...ps]);
      registrarAuditoria("Criação de projeto", p.nome, `Responsável: ${usuarios.find((u) => u.id === p.responsavelId)?.nome ?? ""}`);
    },
    atualizarFluxo: (id, patch) => {
      setFluxos((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));
      registrarAuditoria("Edição de fluxo de trabalho", fluxos.find((f) => f.id === id)?.nome ?? id, "Estrutura do fluxo atualizada");
    },
    criarEvento: (e) => {
      setEventos((ev) => [...ev, { ...e, id: nid("ev") }]);
      registrarAuditoria("Criação de evento", e.titulo, `Agenda de ${e.data}`);
    },
    criarDocumento: (d) => {
      setDocumentos((ds) => [{ ...d, id: nid("doc"), atualizadoEm: new Date().toISOString(), versao: "1.0" }, ...ds]);
      registrarAuditoria("Envio de documento", d.nome, `Categoria: ${d.categoria}`);
    },
    criarRisco: (r) => {
      setRiscos((rs) => [{ ...r, id: nid("r") }, ...rs]);
      registrarAuditoria("Registro de risco", r.titulo, `Probabilidade ${r.probabilidade} × Impacto ${r.impacto}`);
    },
    marcarNotificacoesLidas: () => setNotificacoes((ns) => ns.map((n) => ({ ...n, lida: true }))),
    toggleUsuario: (id) => {
      setUsuarios((us) => us.map((u) => (u.id === id ? { ...u, ativo: !u.ativo } : u)));
      const u = usuarios.find((x) => x.id === id);
      registrarAuditoria("Alteração de usuário", u?.nome ?? id, u?.ativo ? "Conta suspensa" : "Conta reativada");
    },
    setPerfis,
    setConfig,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [usuarios, projetos, tarefas, demandas, fluxos, documentos, riscos, notificacoes, eventos, auditoria, perfis, config]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
