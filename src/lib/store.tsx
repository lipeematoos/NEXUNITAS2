import { ReactNode, createContext, useContext, useMemo, useState } from "react";
import {
  ATIVOS_SEED, AUDITORIA_SEED, Auditoria, Ativo, BASE_CONHECIMENTO_SEED, ArtigoBase, CANAIS_SEED, CHAMADOS_SEED,
  COMUNICADOS_SEED, Chamado, Canal, CampanhaInventario, ComunicadoEnt, DEMANDAS_SEED, DOCUMENTOS_SEED,
  Demanda, Documento, EQUIPES_SEED, Equipe, EVENTOS_SEED, EventoAgenda, FLUXOS_SEED, Fluxo,
  GRUPOS_SUPORTE_SEED, GrupoSuporte, INVENTARIO_SEED, LICENCAS_SEED, LicencaSoftware, MENSAGENS_SEED,
  Manutencao, Mensagem, Movimentacao, NAV_PERMISSOES, NOTIFICACOES_SEED, Notificacao, PERFIS_SEED,
  PerfilAcesso, PROJETOS_SEED, Projeto, REGRAS_APROVACAO_SEED, REGRAS_SLA_SEED, RegraAprovacao, RegraSLA,
  RISCOS_SEED, Risco, SERVICOS_SEED, Servico, TAREFAS_SEED, Tarefa, UNIDADES_SEED, USUARIOS_SEED,
  Unidade, Usuario, temPermissaoPerfil,
} from "./data";

export interface ConfigSistema {
  orgao: { nome: string; cnpj: string; endereco: string; municipio: string; uf: string };
  regional: { idioma: string; fuso: string; moeda: string; formatoData: string };
  notificacoes: Record<string, boolean>;
  seguranca: Record<string, boolean>;
  marca: { produto: string; subtitulo: string; corPrimaria: string; corAcento: string };
  centralTI: { prefixo: string; expediente: string };
}

const CONFIG_INICIAL: ConfigSistema = {
  orgao: { nome: "Prefeitura Municipal de Cidade Exemplo", cnpj: "12.345.678/0001-90", endereco: "Praça Central, 100 — Centro", municipio: "Cidade Exemplo", uf: "SP" },
  regional: { idioma: "pt-BR", fuso: "America/Sao_Paulo", moeda: "BRL", formatoData: "DD/MM/YYYY" },
  notificacoes: { tarefasAtribuidas: true, prazosVencendo: true, aprovacoes: true, resumoDiario: false, demandasNovas: true },
  seguranca: { mfa: true, senhaForte: true, bloqueioTentativas: true, sessaoLimite: true },
  marca: { produto: "GovFlow", subtitulo: "Plataforma Integrada de Gestão para Órgãos Públicos", corPrimaria: "#0b2a20", corAcento: "#f2b70a" },
  centralTI: { prefixo: "TI-2026", expediente: "Segunda a sexta, das 8h às 18h" },
};

interface DadosNovoChamado {
  titulo: string; descricao: string; tipo: "Incidente" | "Solicitação de Serviço";
  categoriaId: string; servicoId: string | null; prioridade: string; local: string; patrimonioId: string | null;
}

interface Store {
  usuarios: Usuario[]; unidades: Unidade[]; equipes: Equipe[]; projetos: Projeto[]; tarefas: Tarefa[];
  demandas: Demanda[]; fluxos: Fluxo[]; documentos: Documento[]; riscos: Risco[]; notificacoes: Notificacao[];
  eventos: EventoAgenda[]; auditoria: Auditoria[]; perfis: PerfilAcesso[]; config: ConfigSistema;
  canais: Canal[]; mensagens: Mensagem[]; comunicados: ComunicadoEnt[];
  chamados: Chamado[]; gruposSuporte: GrupoSuporte[]; servicos: Servico[]; regrasAprovacao: RegraAprovacao[]; regrasSLA: RegraSLA[];
  ativos: Ativo[]; inventario: CampanhaInventario[]; licencas: LicencaSoftware[]; baseConhecimento: ArtigoBase[];
  atual: Usuario; perfilSimulado: string;
  setPerfilSimulado: (p: string) => void;
  temPermissao: (chave: string) => boolean;
  temPermissaoMenu: (view: string) => boolean;
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
  criarUnidade: (u: Omit<Unidade, "id">) => void;
  removerUnidade: (id: string) => void;
  // Comunicação
  enviarMensagem: (canalId: string, texto: string, autorId?: string, anexos?: { nome: string; tamanho: string }[]) => void;
  reagirMensagem: (msgId: string, emoji: string, userId: string) => void;
  fixarMensagem: (msgId: string) => void;
  criarCanal: (c: Omit<Canal, "id">) => void;
  publicarComunicado: (c: Omit<ComunicadoEnt, "id" | "publicadaEm" | "lidoPor">) => void;
  marcarComunicadoLido: (id: string, userId: string) => void;
  // Central de serviços
  abrirChamado: (d: DadosNovoChamado) => Chamado;
  mudarStatusChamado: (id: string, status: string, detalhe: string) => void;
  atribuirChamado: (id: string, tecnicoId: string | null, grupoId: string | null) => void;
  comentarChamado: (id: string, texto: string, tipo: "resposta" | "interna") => void;
  decidirAprovacao: (chamadoId: string, etapaId: string, decisao: "Aprovado" | "Rejeitado" | "Ajuste solicitado", comentario: string) => void;
  setRegrasAprovacao: (r: RegraAprovacao[]) => void;
  setServicos: (s: Servico[]) => void;
  setRegrasSLA: (s: RegraSLA[]) => void;
  criarArtigoBase: (a: Omit<ArtigoBase, "id" | "atualizadoEm">) => void;
  // Patrimônio
  movimentarAtivo: (ativoId: string, m: Omit<Movimentacao, "data" | "usuario">) => void;
  registrarManutencao: (ativoId: string, m: Omit<Manutencao, "id">) => void;
  alterarStatusAtivo: (ativoId: string, status: string) => void;
  setResultadoInventario: (campanhaId: string, patrimonioId: string, resultado: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function useApp(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useApp fora do AppProvider");
  return s;
}

let seq = 1000;
const nid = (p: string) => `${p}${++seq}`;
const agoraISO = () => new Date().toISOString();

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState(USUARIOS_SEED);
  const [unidades, setUnidades] = useState(UNIDADES_SEED);
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
  const [canais, setCanais] = useState(CANAIS_SEED);
  const [mensagens, setMensagens] = useState(MENSAGENS_SEED);
  const [comunicados, setComunicados] = useState(COMUNICADOS_SEED);
  const [chamados, setChamados] = useState(CHAMADOS_SEED);
  const [servicos, setServicos] = useState(SERVICOS_SEED);
  const [regrasAprovacao, setRegrasAprovacao] = useState(REGRAS_APROVACAO_SEED);
  const [regrasSLA, setRegrasSLA] = useState(REGRAS_SLA_SEED);
  const [ativos, setAtivos] = useState(ATIVOS_SEED);
  const [baseConhecimento, setBaseConhecimento] = useState(BASE_CONHECIMENTO_SEED);
  const [inventario, setInventario] = useState(INVENTARIO_SEED);
  const [perfilSimulado, setPerfilSimulado] = useState("Administrador do Sistema");

  const atual = usuarios[0];

  const registrarAuditoria = (acao: string, objeto: string, detalhe: string) => {
    setAuditoria((a) => [
      { id: nid("a"), dataHora: agoraISO(), usuario: atual.nome, acao, objeto, detalhe, ip: "10.0.4.21" },
      ...a,
    ]);
  };

  const store: Store = useMemo(() => ({
    usuarios, unidades, equipes: EQUIPES_SEED, projetos, tarefas, demandas, fluxos,
    documentos, riscos, notificacoes, eventos, auditoria, perfis, config,
    canais, mensagens, comunicados, chamados, gruposSuporte: GRUPOS_SUPORTE_SEED, servicos,
    regrasAprovacao, regrasSLA, ativos, inventario, licencas: LICENCAS_SEED, baseConhecimento: BASE_CONHECIMENTO_SEED,
    atual, perfilSimulado,
    setPerfilSimulado,
    temPermissao: (chave) => temPermissaoPerfil(perfilSimulado, chave),
    temPermissaoMenu: (view) => temPermissaoPerfil(perfilSimulado, NAV_PERMISSOES[view] ?? "organization.view"),
    registrarAuditoria,
    moverTarefa: (id, status) => {
      setTarefas((ts) => ts.map((t) => (t.id === id ? { ...t, status, bloqueioMotivo: status === "Bloqueado" ? t.bloqueioMotivo : undefined } : t)));
      registrarAuditoria("Movimentação de tarefa", `Tarefa ${id.toUpperCase()}`, `Status alterado para ${status}`);
    },
    criarTarefa: (t) => {
      setTarefas((ts) => [{ ...t, id: nid("t"), criadaEm: agoraISO() }, ...ts]);
      registrarAuditoria("Criação de tarefa", t.titulo, `Atribuída a ${usuarios.find((u) => u.id === t.responsavelId)?.nome ?? "—"}`);
    },
    criarDemanda: (d) => {
      const protocolo = `DEM-2026-0${345 + Math.floor(Math.random() * 50)}`;
      setDemandas((ds) => [{
        ...d, id: nid("d"), protocolo, status: "Nova", criadaEm: agoraISO(),
        historico: [{ data: agoraISO(), usuario: atual.nome, acao: "Demanda aberta", detalhe: "Solicitação registrada no sistema." }],
      }, ...ds]);
      registrarAuditoria("Abertura de demanda", protocolo, `${d.tipo} — ${usuarios.find((u) => u.id === d.solicitanteId)?.nome ?? ""}`);
    },
    mudarStatusDemanda: (id, status, detalhe) => {
      setDemandas((ds) => ds.map((d) => d.id === id ? {
        ...d, status,
        historico: [...d.historico, { data: agoraISO(), usuario: atual.nome, acao: `Status alterado para ${status}`, detalhe }],
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
      setDocumentos((ds) => [{ ...d, id: nid("doc"), atualizadoEm: agoraISO(), versao: "1.0" }, ...ds]);
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
    criarUnidade: (u) => {
      setUnidades((us) => [...us, { ...u, id: nid("un") }]);
      registrarAuditoria("Criação de unidade administrativa", u.nome, `Tipo: ${u.tipo}`);
    },
    removerUnidade: (id) => {
      const u = unidades.find((x) => x.id === id);
      setUnidades((us) => us.filter((x) => x.id !== id && x.parentId !== id));
      registrarAuditoria("Exclusão de unidade administrativa", u?.nome ?? id, "Unidade e subordinadas removidas");
    },

    /* ---------- Comunicação ---------- */
    enviarMensagem: (canalId, texto, autorId, anexos) => {
      setMensagens((ms) => [...ms, { id: nid("m"), canalId, autorId: autorId ?? atual.id, texto, data: agoraISO(), reacoes: {}, anexos }]);
    },
    reagirMensagem: (msgId, emoji, userId) => {
      setMensagens((ms) => ms.map((m) => {
        if (m.id !== msgId) return m;
        const atualReacao = m.reacoes[emoji] ?? [];
        const nova = atualReacao.includes(userId) ? atualReacao.filter((u) => u !== userId) : [...atualReacao, userId];
        return { ...m, reacoes: { ...m.reacoes, [emoji]: nova } };
      }));
    },
    fixarMensagem: (msgId) => {
      setMensagens((ms) => ms.map((m) => (m.id === msgId ? { ...m, fixada: !m.fixada } : m)));
    },
    criarCanal: (c) => {
      setCanais((cs) => [...cs, { ...c, id: nid("c") }]);
      registrarAuditoria("Criação de canal", `#${c.nome}`, `Visibilidade: ${c.visibilidade}`);
    },
    publicarComunicado: (c) => {
      setComunicados((cs) => [{ ...c, id: nid("co"), publicadaEm: agoraISO(), lidoPor: [atual.id] }, ...cs]);
      registrarAuditoria("Publicação de comunicado", c.titulo, `Público-alvo: ${c.alvo}`);
    },
    marcarComunicadoLido: (id, userId) => {
      setComunicados((cs) => cs.map((c) => (c.id === id && !c.lidoPor.includes(userId) ? { ...c, lidoPor: [...c.lidoPor, userId] } : c)));
    },

    /* ---------- Central de serviços ---------- */
    abrirChamado: (d) => {
      const servico = d.servicoId ? servicos.find((s) => s.id === d.servicoId) ?? null : null;
      const regra = servico?.regraAprovacaoId ? regrasAprovacao.find((r) => r.id === servico.regraAprovacaoId && r.ativo) ?? null : null;
      const requerAprovacao = !!(servico?.requerAprovacao && regra && regra.etapas.length > 0);
      const proxNum = chamados.reduce((mx, c) => Math.max(mx, Number(c.numero.split("-").pop()) || 0), 0) + 1;
      const numero = `${config.centralTI.prefixo}-${String(proxNum).padStart(6, "0")}`;
      const sla = regrasSLA.find((r) => r.prioridade === d.prioridade);
      const prazo = new Date();
      prazo.setHours(prazo.getHours() + (sla?.resolucaoHoras ?? 24));
      const novo: Chamado = {
        id: nid("ch"), numero, titulo: d.titulo, descricao: d.descricao, tipo: d.tipo,
        solicitanteId: atual.id, unidadeId: atual.unidadeId, local: d.local,
        categoriaId: d.categoriaId, servicoId: d.servicoId, prioridade: d.prioridade,
        status: requerAprovacao ? "Aguardando Aprovação" : "Em Triagem",
        tecnicoId: null, grupoId: requerAprovacao ? null : servico?.grupoId ?? null,
        patrimonioId: d.patrimonioId, criadoEm: agoraISO(), prazoResolucao: prazo.toISOString(),
        aprovacoes: requerAprovacao && regra
          ? regra.etapas.map((e) => ({ etapaId: e.id, etapaNome: e.nome, status: "Pendente" as const, aprovadorNome: e.tipoAprovador === "Grupo" ? `Grupo ${e.aprovador}` : e.aprovador }))
          : [],
        historico: [
          { data: agoraISO(), usuario: atual.nome, acao: "Chamado aberto", detalhe: `${d.tipo} registrado no Portal de Serviços.` },
          ...(requerAprovacao ? [{ data: agoraISO(), usuario: "sistema", acao: "Enviado para aprovação", detalhe: `Regra: ${regra!.nome} · Etapa 1 — ${regra!.etapas[0].nome}.` }] : []),
        ],
        comentarios: [],
      };
      setChamados((cs) => [novo, ...cs]);
      registrarAuditoria("Abertura de chamado", numero, d.titulo);
      return novo;
    },
    mudarStatusChamado: (id, status, detalhe) => {
      setChamados((cs) => cs.map((c) => c.id === id ? {
        ...c, status,
        historico: [...c.historico, { data: agoraISO(), usuario: atual.nome, acao: `Status alterado para ${status}`, detalhe }],
      } : c));
      registrarAuditoria("Atualização de chamado", chamados.find((c) => c.id === id)?.numero ?? id, `Status: ${status}`);
    },
    atribuirChamado: (id, tecnicoId, grupoId) => {
      const tec = usuarios.find((u) => u.id === tecnicoId);
      const gru = GRUPOS_SUPORTE_SEED.find((g) => g.id === grupoId);
      setChamados((cs) => cs.map((c) => c.id === id ? {
        ...c, tecnicoId, grupoId, status: tecnicoId ? "Atribuído" : c.status,
        historico: [...c.historico, { data: agoraISO(), usuario: atual.nome, acao: "Chamado atribuído", detalhe: `Grupo: ${gru?.nome ?? "—"} · Técnico: ${tec?.nome ?? "Não atribuído"}` }],
      } : c));
      registrarAuditoria("Atribuição de chamado", chamados.find((c) => c.id === id)?.numero ?? id, `Técnico: ${tec?.nome ?? "—"}`);
    },
    comentarChamado: (id, texto, tipo) => {
      setChamados((cs) => cs.map((c) => c.id === id ? {
        ...c, comentarios: [...c.comentarios, { id: nid("cc"), autorId: atual.id, texto, data: agoraISO(), tipo }],
      } : c));
    },
    decidirAprovacao: (chamadoId, etapaId, decisao, comentario) => {
      const ch = chamados.find((c) => c.id === chamadoId);
      if (!ch) return;
      const aprovacoes = ch.aprovacoes.map((a) => a.etapaId === etapaId
        ? { ...a, status: decisao, aprovadorNome: atual.nome, data: agoraISO(), comentario: comentario || undefined }
        : a);
      const rejeitada = decisao === "Rejeitado";
      const todasAprovadas = aprovacoes.every((a) => a.status === "Aprovado");
      const novaEtapaPendente = !rejeitada && !todasAprovadas
        ? aprovacoes.filter((a) => a.status === "Pendente").map((a) => a.etapaNome)
        : [];
      const novoStatus = rejeitada ? "Rejeitado" : decisao === "Ajuste solicitado" ? "Aguardando Usuário" : todasAprovadas ? "Aprovado" : "Aguardando Aprovação";
      const servico = ch.servicoId ? servicos.find((s) => s.id === ch.servicoId) : null;
      setChamados((cs) => cs.map((c) => c.id === chamadoId ? {
        ...c, aprovacoes, status: novoStatus,
        grupoId: todasAprovadas && novoStatus === "Aprovado" ? (servico?.grupoId ?? c.grupoId) : c.grupoId,
        historico: [...c.historico, {
          data: agoraISO(), usuario: atual.nome, acao: `Etapa ${decisao === "Aprovado" ? "aprovada" : decisao}`,
          detalhe: comentario || (todasAprovadas ? "Todas as etapas aprovadas — liberado para execução." : novaEtapaPendente[0] ? `Próxima etapa: ${novaEtapaPendente[0]}.` : ""),
        }],
      } : c));
      registrarAuditoria(
        decisao === "Aprovado" ? "Aprovação de solicitação" : decisao === "Rejeitado" ? "Rejeição de solicitação" : "Ajuste solicitado",
        ch.numero, `Etapa: ${ch.aprovacoes.find((a) => a.etapaId === etapaId)?.etapaNome ?? ""}`
      );
    },
    setRegrasAprovacao: (r) => {
      setRegrasAprovacao(r);
      registrarAuditoria("Alteração em regra de aprovação", "Motor de aprovações", "Configuração atualizada pelo administrador");
    },
    setServicos,
    setRegrasSLA,
    criarArtigoBase: (a) => {
      setBaseConhecimento((bs) => [{ ...a, id: nid("kb"), atualizadoEm: agoraISO() }, ...bs]);
      registrarAuditoria("Publicação de artigo", a.titulo, `Base de Conhecimento · ${a.categoria}`);
    },

    /* ---------- Patrimônio ---------- */
    movimentarAtivo: (ativoId, m) => {
      setAtivos((as) => as.map((a) => a.id === ativoId ? {
        ...a, movimentacoes: [...a.movimentacoes, { ...m, data: agoraISO(), usuario: atual.nome }],
      } : a));
      const a = ativos.find((x) => x.id === ativoId);
      registrarAuditoria("Movimentação de patrimônio", `Patrimônio ${a?.patrimonio ?? ativoId}`, `${m.origem} → ${m.destino}`);
    },
    registrarManutencao: (ativoId, m) => {
      setAtivos((as) => as.map((a) => a.id === ativoId ? { ...a, manutencoes: [...a.manutencoes, { ...m, id: nid("mn") }] } : a));
      const a = ativos.find((x) => x.id === ativoId);
      registrarAuditoria("Registro de manutenção", `Patrimônio ${a?.patrimonio ?? ativoId}`, `${m.tipo} — ${m.descricao}`);
    },
    alterarStatusAtivo: (ativoId, status) => {
      setAtivos((as) => as.map((a) => (a.id === ativoId ? { ...a, status } : a)));
      const a = ativos.find((x) => x.id === ativoId);
      registrarAuditoria("Alteração de status de patrimônio", `Patrimônio ${a?.patrimonio ?? ativoId}`, `Novo status: ${status}`);
    },
    setResultadoInventario: (campanhaId, patrimonioId, resultado) => {
      setInventario((invs) => invs.map((c) => c.id === campanhaId ? {
        ...c, itens: c.itens.map((i) => (i.patrimonioId === patrimonioId ? { ...i, resultado: resultado as never } : i)),
      } : c));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [usuarios, unidades, projetos, tarefas, demandas, fluxos, documentos, riscos, notificacoes, eventos, auditoria, perfis, config, canais, mensagens, comunicados, chamados, servicos, regrasAprovacao, regrasSLA, ativos, inventario, perfilSimulado]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
