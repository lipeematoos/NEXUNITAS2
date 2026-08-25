import { ReactNode, createContext, useContext, useMemo, useState } from "react";
import {
  ATIVOS_INCOMPLETOS_SEED, ATIVOS_SEED, AUDITORIA_SEED, Auditoria, Ativo, BASE_CONHECIMENTO_SEED, ArtigoBase,
  CANAIS_SEED, CHAMADOS_SEED, COBERTURAS_SEED, CoberturaAtendimento, COMUNICADOS_SEED, Chamado, Canal,
  CampanhaInventario, ComunicadoEnt, DEMANDAS_SEED, DOCUMENTOS_SEED, Demanda, Documento, DOMINIOS_SEED,
  DominioAtendimento, EQUIPES_SEED, Equipe, EVENTOS_LICENCA_SEED, EVENTOS_SEED, EventoAgenda, EventoLicenca,
  FLUXOS_SEED, Fluxo, FUNDOS_SEED, FundoMunicipal, GRUPOS_EXTRAS_SEED, GRUPOS_SUPORTE_SEED, GrupoSuporte,
  INVENTARIO_SEED, LICENCA_SEED, LICENCAS_SEED, LicencaSistema, LicencaSoftware, MENSAGENS_SEED, Manutencao,
  Mensagem, Movimentacao, NAV_PERMISSOES, NOTIFICACOES_SEED, Notificacao, PERFIS_SEED, PerfilAcesso, InfoBaixa,
  PROJETOS_SEED, Projeto, REGRAS_APROVACAO_SEED, REGRAS_OBSOLESCENCIA_SEED, REGRAS_ROTEAMENTO_SEED, REGRAS_SLA_SEED,
  RegraAprovacao, RegraRoteamento, RegraSLA, RISCOS_SEED, Risco, RESPONSAVEIS_GLOBAIS_SEED, ResponsavelGlobal,
  SERVICOS_EXTRAS_SEED, SERVICOS_SEED, Servico, SnapshotRelatorio, TAREFAS_SEED, Tarefa, TIPOS_UNIDADE_SEED,
  TipoUnidade, UNIDADES_GESTORAS_SEED, UNIDADES_SEED, USUARIOS_SEED, Unidade, UnidadeGestora, Usuario, temPermissaoPerfil,
} from "./data";
import {
  ATIVOS_SEGURANCA_SEED, CAMADAS_SEED, COFRE_LOG_SEED, COFRE_SEED, CONTROLES_SEED, CamadaSeguranca, CofreLog,
  ControleSeguranca, CredencialCofre, DominioMaturidade, INCIDENTES_SEG_SEED, IncidenteSeguranca, MATURIDADE_SEED,
  POLITICAS_SEG_SEED, PoliticaSeguranca, REVISAO_REGRAS_SEED, RevisaoRegraFirewall, VULNERABILIDADES_SEED,
  Vulnerabilidade, cifrar, decifrar,
} from "./seguranca-seed";

export interface ConfigSistema {
  orgao: { nome: string; cnpj: string; endereco: string; municipio: string; uf: string };
  regional: { idioma: string; fuso: string; moeda: string; formatoData: string };
  notificacoes: Record<string, boolean>;
  seguranca: Record<string, boolean>;
  marca: { produto: string; subtitulo: string; corPrimaria: string; corAcento: string };
  centralTI: { prefixo: string; expediente: string; grupoPadraoId: string };
  identidade: {
    nomeSistema: string; nomeCurto: string; sigla: string;
    brasaoDataUrl: string | null; logoDataUrl: string | null;
    usoBrasao: string[]; rodape: string; textoInstitucional: string; msgLogin: string;
  };
}

const CONFIG_INICIAL: ConfigSistema = {
  orgao: { nome: "Prefeitura Municipal de Cidade Exemplo", cnpj: "12.345.678/0001-90", endereco: "Praça Central, 100 — Centro", municipio: "Cidade Exemplo", uf: "SP" },
  regional: { idioma: "pt-BR", fuso: "America/Sao_Paulo", moeda: "BRL", formatoData: "DD/MM/YYYY" },
  notificacoes: { tarefasAtribuidas: true, prazosVencendo: true, aprovacoes: true, resumoDiario: false, demandasNovas: true },
  seguranca: { mfa: true, senhaForte: true, bloqueioTentativas: true, sessaoLimite: true },
  marca: { produto: "GovFlow", subtitulo: "Plataforma Integrada de Gestão para Órgãos Públicos", corPrimaria: "#0b2a20", corAcento: "#f2b70a" },
  centralTI: { prefixo: "TI-2026", expediente: "Segunda a sexta, das 8h às 18h", grupoPadraoId: "g1" },
  identidade: {
    nomeSistema: "GovFlow", nomeCurto: "GovFlow", sigla: "GF",
    brasaoDataUrl: null, logoDataUrl: null,
    usoBrasao: ["login", "menu", "relatorios"], rodape: "Uso exclusivo de servidores autorizados — atividade monitorada.",
    textoInstitucional: "Sistema Integrado de Gestão e Acompanhamento",
    msgLogin: "Acesso restrito a servidores autorizados. Toda atividade é registrada em auditoria.",
  },
};

interface DadosNovoChamado {
  titulo: string; descricao: string; tipo: "Incidente" | "Solicitação de Serviço";
  categoriaId: string; servicoId: string | null; prioridade: string; local: string;
  patrimonioId: string | null; tecnicoPreferencialId?: string | null;
}

export interface ResultadoRoteamento {
  grupoId: string; grupoNome: string; dominioNome: string; tecnicoId: string | null;
  regra: string; detalhe: string; passos: string[];
}

export interface PoliticaSenhaCfg {
  tamanhoMin: number; maiusculas: boolean; minusculas: boolean; numeros: boolean; especiais: boolean;
  historico: number; expiracaoDias: number; tentativas: number; bloqueioMin: number; obrigatoriaPrimeiroAcesso: boolean;
}

export interface TemplateRelatorio {
  id: string; nome: string; descricao: string; fonte: string; colunas: string[];
  agrupamento: string; layout: "Retrato" | "Paisagem"; formatos: string[]; ativo: boolean;
}
export interface RelatorioSalvo { id: string; nome: string; fonte: string; busca: string; criadoEm: string; }
export interface HistoricoRelatorio { id: string; relatorio: string; usuario: string; data: string; formato: string; filtros: string; registros: number; }

export interface Store {
  usuarios: Usuario[]; unidades: Unidade[]; equipes: Equipe[]; projetos: Projeto[]; tarefas: Tarefa[];
  demandas: Demanda[]; fluxos: Fluxo[]; documentos: Documento[]; riscos: Risco[]; notificacoes: Notificacao[];
  eventos: EventoAgenda[]; auditoria: Auditoria[]; perfis: PerfilAcesso[]; config: ConfigSistema;
  canais: Canal[]; mensagens: Mensagem[]; comunicados: ComunicadoEnt[];
  chamados: Chamado[]; gruposSuporte: GrupoSuporte[]; servicos: Servico[]; regrasAprovacao: RegraAprovacao[]; regrasSLA: RegraSLA[];
  ativos: Ativo[]; inventario: CampanhaInventario[]; licencas: LicencaSoftware[]; baseConhecimento: ArtigoBase[];
  dominios: DominioAtendimento[]; gestoras: UnidadeGestora[]; fundos: FundoMunicipal[]; tiposUnidade: TipoUnidade[];
  coberturas: CoberturaAtendimento[]; regrasRoteamento: RegraRoteamento[]; responsaveisGlobais: ResponsavelGlobal[];
  regrasObsolescencia: { categoria: string; anos: number }[];
  licenca: LicencaSistema; eventosLicenca: EventoLicenca[]; snapshots: SnapshotRelatorio[];
  modoRestrito: boolean;
  // Segurança da Informação
  camadas: CamadaSeguranca[]; controles: ControleSeguranca[]; incidentesSeguranca: IncidenteSeguranca[];
  vulnerabilidades: Vulnerabilidade[]; politicasSeguranca: PoliticaSeguranca[]; cofre: CredencialCofre[];
  cofreLog: CofreLog[]; revisoesRegras: RevisaoRegraFirewall[]; maturidade: DominioMaturidade[];
  politicaSenha: PoliticaSenhaCfg;
  // Relatórios
  templatesRelatorio: TemplateRelatorio[]; relatoriosSalvos: RelatorioSalvo[]; historicoRelatorios: HistoricoRelatorio[];
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
  atualizarUnidade: (id: string, patch: Partial<Unidade>) => void;
  moverUnidade: (id: string, novoPaiId: string) => boolean;
  // Comunicação
  enviarMensagem: (canalId: string, texto: string, autorId?: string, anexos?: { nome: string; tamanho: string }[]) => void;
  reagirMensagem: (msgId: string, emoji: string, userId: string) => void;
  fixarMensagem: (msgId: string) => void;
  criarCanal: (c: Omit<Canal, "id">) => void;
  publicarComunicado: (c: Omit<ComunicadoEnt, "id" | "publicadaEm" | "lidoPor">) => void;
  marcarComunicadoLido: (id: string, userId: string) => void;
  // Central de serviços e roteamento
  abrirChamado: (d: DadosNovoChamado) => Chamado;
  mudarStatusChamado: (id: string, status: string, detalhe: string) => void;
  atribuirChamado: (id: string, tecnicoId: string | null, grupoId: string | null) => void;
  comentarChamado: (id: string, texto: string, tipo: "resposta" | "interna") => void;
  decidirAprovacao: (chamadoId: string, etapaId: string, decisao: "Aprovado" | "Rejeitado" | "Ajuste solicitado", comentario: string) => void;
  converterChamadoEmIncidente: (chamadoId: string, dados: { titulo: string; severidade: string; categoria: string }) => IncidenteSeguranca | null;
  setRegrasAprovacao: (r: RegraAprovacao[]) => void;
  setServicos: (s: Servico[]) => void;
  setRegrasSLA: (s: RegraSLA[]) => void;
  criarArtigoBase: (a: Omit<ArtigoBase, "id" | "atualizadoEm">) => void;
  simularRoteamento: (unidadeId: string, servicoId: string | null, categoriaId: string) => ResultadoRoteamento;
  setGruposSuporte: (g: GrupoSuporte[]) => void;
  setDominios: (d: DominioAtendimento[]) => void;
  setCoberturas: (c: CoberturaAtendimento[]) => void;
  setRegrasRoteamento: (r: RegraRoteamento[]) => void;
  setResponsaveisGlobais: (r: ResponsavelGlobal[]) => void;
  setUnidadeAtendimento: (unidadeId: string, patch: Partial<Unidade>) => void;
  setTiposUnidade: (t: TipoUnidade[]) => void;
  // Patrimônio
  movimentarAtivo: (ativoId: string, m: Omit<Movimentacao, "data" | "usuario">) => void;
  registrarManutencao: (ativoId: string, m: Omit<Manutencao, "id">) => void;
  alterarStatusAtivo: (ativoId: string, status: string) => void;
  baixarAtivo: (ativoId: string, info: Omit<InfoBaixa, "usuario">) => void;
  setResultadoInventario: (campanhaId: string, patrimonioId: string, resultado: string, obs?: string) => void;
  setRegrasObsolescencia: (r: { categoria: string; anos: number }[]) => void;
  salvarSnapshot: (nome: string, filtros: string, total: number) => SnapshotRelatorio;
  // Segurança da Informação — ações
  criarIncidente: (i: Omit<IncidenteSeguranca, "id" | "numero" | "status">) => IncidenteSeguranca;
  mudarStatusIncidente: (id: string, status: string, detalhe: string) => void;
  mudarStatusVulnerabilidade: (id: string, status: string) => void;
  aceitarPolitica: (id: string) => void;
  setStatusControle: (id: string, status: string) => void;
  adicionarCamada: (nome: string, tipo: string) => void;
  toggleCamada: (id: string) => void;
  decidirRevisaoRegra: (regraId: string, decisao: RevisaoRegraFirewall["decisao"], justificativa: string) => void;
  revelarCredencial: (id: string) => string;
  criarCredencial: (c: Omit<CredencialCofre, "id" | "criadoEm" | "rotacionadaEm" | "segredoCifrado">, segredo: string) => void;
  rotacionarCredencial: (id: string, novoSegredo: string) => void;
  setMaturidade: (m: DominioMaturidade[]) => void;
  setPoliticaSenha: (p: PoliticaSenhaCfg) => void;
  alterarSenhaAdmin: (atual: string, nova: string) => string | null;
  redefinirSenhaUsuario: (id: string) => string;
  // Equipes
  criarEquipe: (e: Omit<Equipe, "id">) => void;
  atualizarEquipe: (id: string, patch: Partial<Equipe>) => void;
  adicionarMembroEquipe: (equipeId: string, userId: string, papel: string) => void;
  removerMembroEquipe: (equipeId: string, userId: string) => void;
  // Relatórios
  registrarGeracao: (relatorio: string, formato: string, filtros: string, registros: number) => void;
  salvarRelatorioFiltro: (nome: string, fonte: string, busca: string) => void;
  excluirRelatorioSalvo: (id: string) => void;
  salvarTemplateRelatorio: (t: Omit<TemplateRelatorio, "id">) => void;
  toggleTemplateRelatorio: (id: string) => void;
  // Licenciamento e configuração
  validarLicenca: (origem: string) => void;
  importarLicenca: (texto: string) => boolean;
  setLicencaStatus: (status: LicencaSistema["status"]) => void;
  exportarConfiguracao: () => unknown;
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
type CampoData = { [k in "data"]: string };
const dtAgora = (): CampoData => ({ ["data"]: agoraISO() });

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState(USUARIOS_SEED);
  const [unidades, setUnidades] = useState(UNIDADES_SEED);
  const [equipes, setEquipes] = useState(EQUIPES_SEED);
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
  const [servicos, setServicos] = useState<Servico[]>(() => [...SERVICOS_SEED, ...SERVICOS_EXTRAS_SEED]);
  const [regrasAprovacao, setRegrasAprovacao] = useState(REGRAS_APROVACAO_SEED);
  const [regrasSLA, setRegrasSLA] = useState(REGRAS_SLA_SEED);
  const [ativos, setAtivos] = useState<Ativo[]>(() => [...ATIVOS_SEED, ...ATIVOS_INCOMPLETOS_SEED, ...ATIVOS_SEGURANCA_SEED]);
  const [baseConhecimento, setBaseConhecimento] = useState(BASE_CONHECIMENTO_SEED);
  const [inventario, setInventario] = useState<CampanhaInventario[]>(() =>
    INVENTARIO_SEED.map((c) => ({
      ...c,
      itens: c.itens.map((i) => ({ ...i, resultado: i.resultado === "Localizado" ? "Confirmado" : i.resultado })),
      historico: [],
    }))
  );
  const [gruposSuporte, setGruposSuporte] = useState<GrupoSuporte[]>(() => [
    ...GRUPOS_SUPORTE_SEED.map((g) => ({
      dominioId: "dom1", sigla: g.nome.slice(0, 3).toUpperCase(), horario: "Segunda a sexta, das 8h às 18h",
      estrategiaAtribuicao: "Menor número de chamados ativos" as const, permiteAtribAuto: true,
      permiteSelecaoTecnico: "Opcional" as const, ...g,
    })),
    ...GRUPOS_EXTRAS_SEED,
  ]);
  const [dominios, setDominios] = useState(DOMINIOS_SEED);
  const [coberturas, setCoberturas] = useState(COBERTURAS_SEED);
  const [regrasRoteamento, setRegrasRoteamento] = useState(REGRAS_ROTEAMENTO_SEED);
  const [responsaveisGlobais, setResponsaveisGlobais] = useState(RESPONSAVEIS_GLOBAIS_SEED);
  const [tiposUnidade, setTiposUnidade] = useState(TIPOS_UNIDADE_SEED);
  const [regrasObsolescencia, setRegrasObsolescencia] = useState(REGRAS_OBSOLESCENCIA_SEED);
  const [licenca, setLicenca] = useState(LICENCA_SEED);
  const [eventosLicenca, setEventosLicenca] = useState(EVENTOS_LICENCA_SEED);
  const [snapshots, setSnapshots] = useState<SnapshotRelatorio[]>([]);
  // Segurança
  const [camadas, setCamadas] = useState(CAMADAS_SEED);
  const [controles, setControles] = useState(CONTROLES_SEED);
  const [incidentesSeguranca, setIncidentesSeguranca] = useState(INCIDENTES_SEG_SEED);
  const [vulnerabilidades, setVulnerabilidades] = useState(VULNERABILIDADES_SEED);
  const [politicasSeguranca, setPoliticasSeguranca] = useState(POLITICAS_SEG_SEED);
  const [cofre, setCofre] = useState(COFRE_SEED);
  const [cofreLog, setCofreLog] = useState(COFRE_LOG_SEED);
  const [revisoesRegras, setRevisoesRegras] = useState(REVISAO_REGRAS_SEED);
  const [maturidade, setMaturidade] = useState(MATURIDADE_SEED);
  const [politicaSenha, setPoliticaSenha] = useState<PoliticaSenhaCfg>({
    tamanhoMin: 8, maiusculas: true, minusculas: true, numeros: true, especiais: true,
    historico: 5, expiracaoDias: 90, tentativas: 5, bloqueioMin: 30, obrigatoriaPrimeiroAcesso: true,
  });
  // Relatórios
  const [templatesRelatorio, setTemplatesRelatorio] = useState<TemplateRelatorio[]>([
    { id: "tpl1", nome: "Relatório Geral de Equipamentos", descricao: "Inventário completo de tecnologia com pertencimento e localização.", fonte: "ativos", colunas: ["patrimonio", "equipamento", "categoria", "secretaria", "localizacao", "responsavel", "status"], agrupamento: "categoria", layout: "Paisagem", formatos: ["PDF", "XLSX", "CSV"], ativo: true },
    { id: "tpl2", nome: "Chamados do Mês", descricao: "Movimento da Central de Serviços com SLA e grupos.", fonte: "chamados", colunas: ["numero", "titulo", "tipo", "prioridade", "status", "grupo", "prazo"], agrupamento: "status", layout: "Retrato", formatos: ["PDF", "CSV"], ativo: true },
    { id: "tpl3", nome: "Incidentes de Segurança", descricao: "Registro de incidentes com severidade e situação.", fonte: "incidentes", colunas: ["numero", "titulo", "severidade", "status", "unidade", "responsavel"], agrupamento: "severidade", layout: "Retrato", formatos: ["PDF", "CSV"], ativo: true },
  ]);
  const [relatoriosSalvos, setRelatoriosSalvos] = useState<RelatorioSalvo[]>([
    { id: "rs1", nome: "Chamados da SEAD — últimos registros", fonte: "chamados", busca: "SEAD", criadoEm: isoAgoraMenos() },
  ]);
  const [historicoRelatorios, setHistoricoRelatorios] = useState<HistoricoRelatorio[]>([]);
  const [perfilSimulado, setPerfilSimulado] = useState("Administrador do Sistema");

  const atual = usuarios[0];
  const modoRestrito = ["Expirada", "Revogada", "Suspensa"].includes(licenca.status);

  const registrarAuditoria = (acao: string, objeto: string, detalhe: string) => {
    setAuditoria((a) => [
      { id: nid("a"), dataHora: agoraISO(), usuario: atual.nome, acao, objeto, detalhe, ip: "10.0.4.21" },
      ...a,
    ]);
  };

  const registrarEventoLicenca = (evento: string, status: string, origem: string, detalhe: string) => {
    setEventosLicenca((es) => [{ id: nid("evl"), ...dtAgora(), evento, status, origem, detalhe }, ...es]);
  };

  const logCofre = (credencial: string, acao: string) => {
    setCofreLog((l) => [{ id: nid("cl"), usuario: atual.nome, ...dtAgora(), credencial, acao, ip: "10.0.4.21" }, ...l]);
  };

  const store: Store = useMemo(() => {
    const unDe = (id: string | null | undefined) => unidades.find((u) => u.id === id);
    const grupoDe = (id: string | null | undefined) => gruposSuporte.find((g) => g.id === id);
    const ancestrais = (unidadeId: string): string[] => {
      const lista: string[] = [];
      let cur = unDe(unidadeId);
      while (cur?.parentId) { lista.push(cur.parentId); cur = unDe(cur.parentId); }
      return lista;
    };
    const descendentes = (unidadeId: string): string[] => {
      const filhos = unidades.filter((u) => u.parentId === unidadeId).map((u) => u.id);
      return filhos.concat(...filhos.map(descendentes));
    };

    /* ============ Motor de roteamento ============ */
    const resolverRoteamento = (unidadeId: string, servicoId: string | null, categoriaId: string): ResultadoRoteamento => {
      const passos: string[] = [];
      const fim = (grupoId: string, regra: string, detalhe: string, tecnicoId: string | null = null): ResultadoRoteamento => {
        const g = grupoDe(grupoId);
        const dom = dominios.find((d) => d.id === g?.dominioId);
        return { grupoId, grupoNome: g?.nome ?? "—", dominioNome: dom?.nome ?? "—", tecnicoId, regra, detalhe, passos };
      };

      passos.push("1. Responsável global por serviço");
      if (servicoId) {
        const rg = responsaveisGlobais.find((r) => r.ativo && r.servicoId === servicoId);
        if (rg) {
          const tec = usuarios.find((u) => u.id === rg.tecnicoId);
          passos.push(`✓ Regra global do serviço “${servicos.find((s) => s.id === servicoId)?.nome}” → ${tec?.nome ?? "técnico"} (${rg.cobertura}).`);
          return fim(rg.grupoId, "Responsável Global por Serviço", `Serviço: ${servicos.find((s) => s.id === servicoId)?.nome ?? "—"} · Cobertura: ${rg.cobertura} · Técnico: ${tec?.nome ?? "—"}`, rg.tecnicoId);
        }
        passos.push("— Nenhum responsável global configurado para o serviço.");
      } else {
        passos.push("— Chamado sem serviço de catálogo.");
      }

      passos.push("2. Regras de roteamento (ordem de prioridade)");
      const regras = [...regrasRoteamento].filter((r) => r.ativa).sort((a, b) => a.prioridade - b.prioridade);
      for (const r of regras) {
        let match = false;
        if (r.condicaoTipo === "Serviço") match = r.condicaoValor === servicoId;
        else if (r.condicaoTipo === "Categoria") match = r.condicaoValor === categoriaId;
        else if (r.condicaoTipo === "Unidade Administrativa") match = r.condicaoValor === unidadeId || ancestrais(unidadeId).includes(r.condicaoValor);
        else if (r.condicaoTipo === "Unidade + Categoria") {
          match = r.condicaoValor === categoriaId && r.condicaoExtra != null && (r.condicaoExtra === unidadeId || ancestrais(unidadeId).includes(r.condicaoExtra));
        }
        if (match) {
          passos.push(`✓ Regra “${r.nome}” (prioridade ${r.prioridade}) aplicada.`);
          return fim(r.grupoId, `Regra de roteamento: ${r.nome}`, `Prioridade ${r.prioridade} · Grupo: ${grupoDe(r.grupoId)?.nome ?? r.grupoId}`);
        }
        passos.push(`— “${r.nome}”: condição não atendida.`);
      }

      passos.push("3. Equipe própria da unidade e cobertura na hierarquia");
      let cur = unDe(unidadeId);
      let nivel = 0;
      while (cur) {
        if (nivel === 0 && cur.temEquipePropria && cur.grupoPrincipalId) {
          passos.push(`✓ ${cur.sigla} possui equipe própria de TI (${grupoDe(cur.grupoPrincipalId)?.nome}).`);
          return fim(cur.grupoPrincipalId, `Equipe própria de TI — ${cur.sigla}`, `Domínio: ${dominios.find((d) => d.id === cur?.dominioId)?.nome ?? "—"} · Configuração da unidade ${cur.sigla}`);
        }
        const cob = coberturas
          .filter((c) => c.ativa && c.unidadeId === cur!.id && (nivel === 0 || c.incluirSubordinadas))
          .sort((a, b) => a.prioridade - b.prioridade)[0];
        if (cob) {
          passos.push(`✓ Cobertura: ${grupoDe(cob.grupoId)?.nome} atende ${cur.sigla}${nivel > 0 ? " (herdada da unidade superior)" : ""}.`);
          return fim(cob.grupoId, `Cobertura de atendimento — ${cur.sigla}`, `${grupoDe(cob.grupoId)?.nome} · ${nivel > 0 ? "Herdada (unidades subordinadas)" : "Regra direta"}`);
        }
        passos.push(`— ${cur.sigla}: sem cobertura nesta regra.`);
        cur = unDe(cur.parentId);
        nivel++;
      }

      passos.push("4. Equipe padrão da organização");
      const padrao = config.centralTI.grupoPadraoId;
      passos.push(`✓ Nenhuma regra específica encontrada — usando ${grupoDe(padrao)?.nome ?? "grupo padrão"} (TI Corporativa).`);
      return fim(padrao, "Equipe padrão da organização", "Configuração do sistema: grupo padrão para unidades sem cobertura específica.");
    };

    const aplicarEstrategia = (grupoId: string, servicoSel: Servico | null, preferencial: string | null): string | null => {
      if (preferencial) return preferencial;
      if (servicoSel?.selecaoTecnico === "Obrigatório" && servicoSel.tecnicoPreferencialId) return servicoSel.tecnicoPreferencialId;
      const g = grupoDe(grupoId);
      if (!g || !g.permiteAtribAuto) return null;
      const estr = g.estrategiaAtribuicao ?? "Manual";
      if (estr === "Manual") return null;
      if (estr === "Técnico padrão do serviço" && servicoSel?.tecnicoPreferencialId) return servicoSel.tecnicoPreferencialId;
      if (estr === "Técnico padrão do serviço") return null;
      const abertosPor = (id: string) => chamados.filter((c) => c.tecnicoId === id && !["Fechado", "Resolvido", "Cancelado", "Rejeitado"].includes(c.status)).length;
      return [...g.membroIds].sort((a, b) => abertosPor(a) - abertosPor(b))[0] ?? null;
    };

    return {
      usuarios, unidades, equipes, projetos, tarefas, demandas, fluxos,
      documentos, riscos, notificacoes, eventos, auditoria, perfis, config,
      canais, mensagens, comunicados, chamados, gruposSuporte, servicos,
      regrasAprovacao, regrasSLA, ativos, inventario, licencas: LICENCAS_SEED, baseConhecimento,
      dominios, gestoras: UNIDADES_GESTORAS_SEED, fundos: FUNDOS_SEED, tiposUnidade,
      coberturas, regrasRoteamento, responsaveisGlobais, regrasObsolescencia,
      licenca, eventosLicenca, snapshots, modoRestrito,
      camadas, controles, incidentesSeguranca, vulnerabilidades, politicasSeguranca, cofre, cofreLog,
      revisoesRegras, maturidade, politicaSenha,
      templatesRelatorio, relatoriosSalvos, historicoRelatorios,
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
          historico: [{ ...dtAgora(), usuario: atual.nome, acao: "Demanda aberta", detalhe: "Solicitação registrada no sistema." }],
        }, ...ds]);
        registrarAuditoria("Abertura de demanda", protocolo, `${d.tipo} — ${usuarios.find((u) => u.id === d.solicitanteId)?.nome ?? ""}`);
      },
      mudarStatusDemanda: (id, status, detalhe) => {
        setDemandas((ds) => ds.map((d) => d.id === id ? {
          ...d, status,
          historico: [...d.historico, { ...dtAgora(), usuario: atual.nome, acao: `Status alterado para ${status}`, detalhe }],
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
        registrarAuditoria("Criação de unidade administrativa", u.nome, `Tipo: ${u.tipo} · Unidade superior: ${unDe(u.parentId)?.nome ?? "—"}`);
      },
      removerUnidade: (id) => {
        const u = unidades.find((x) => x.id === id);
        setUnidades((us) => us.filter((x) => x.id !== id && x.parentId !== id));
        registrarAuditoria("Exclusão de unidade administrativa", u?.nome ?? id, "Unidade e subordinadas removidas");
      },
      atualizarUnidade: (id, patch) => {
        const antes = unDe(id);
        setUnidades((us) => us.map((u) => (u.id === id ? { ...u, ...patch } : u)));
        const mudancas = Object.keys(patch).map((k) => {
          if (k === "responsavelId") return `Responsável: ${antes?.responsavelId ? usuarios.find((x) => x.id === antes.responsavelId)?.nome : "—"} → ${usuarios.find((x) => x.id === patch.responsavelId)?.nome ?? "—"}`;
          if (k === "ativa") return patch.ativa ? "Unidade reativada" : "Unidade desativada";
          if (k === "nome") return `Nome: ${antes?.nome} → ${patch.nome}`;
          return k;
        }).join("; ");
        registrarAuditoria("Alteração de unidade administrativa", antes?.nome ?? id, mudancas);
      },
      moverUnidade: (id, novoPaiId) => {
        if (id === novoPaiId) return false;
        if (descendentes(id).includes(novoPaiId)) return false; // referência circular
        if (!unDe(novoPaiId)) return false;
        const u = unDe(id);
        const paiAnterior = unDe(u?.parentId);
        const novoPai = unDe(novoPaiId);
        setUnidades((us) => us.map((x) => (x.id === id ? { ...x, parentId: novoPaiId } : x)));
        registrarAuditoria("Alteração de vínculo hierárquico", u?.nome ?? id, `${paiAnterior?.nome ?? "—"} → ${novoPai?.nome ?? "—"} · estrutura anterior preservada em auditoria`);
        return true;
      },

      /* ---------- Comunicação ---------- */
      enviarMensagem: (canalId, texto, autorId, anexos) => {
        setMensagens((ms) => [...ms, { id: nid("m"), canalId, autorId: autorId ?? atual.id, texto, ...dtAgora(), reacoes: {}, anexos }]);
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

      /* ---------- Central de serviços + roteamento ---------- */
      simularRoteamento: resolverRoteamento,
      abrirChamado: (d) => {
        const servico = d.servicoId ? servicos.find((s) => s.id === d.servicoId) ?? null : null;
        const regra = servico?.regraAprovacaoId ? regrasAprovacao.find((r) => r.id === servico.regraAprovacaoId && r.ativo) ?? null : null;
        const requerAprovacao = !!(servico?.requerAprovacao && regra && regra.etapas.length > 0);
        const proxNum = chamados.reduce((mx, c) => Math.max(mx, Number(c.numero.split("-").pop()) || 0), 0) + 1;
        const numero = `${config.centralTI.prefixo}-${String(proxNum).padStart(6, "0")}`;
        const sla = regrasSLA.find((r) => r.prioridade === d.prioridade);
        const prazo = new Date();
        prazo.setHours(prazo.getHours() + (sla?.resolucaoHoras ?? 24));

        const rota = resolverRoteamento(atual.unidadeId, d.servicoId, d.categoriaId);
        const tecnicoId = requerAprovacao ? null : aplicarEstrategia(rota.grupoId, servico, d.tecnicoPreferencialId ?? null);
        const nomeTec = usuarios.find((u) => u.id === tecnicoId)?.nome;

        const novo: Chamado = {
          id: nid("ch"), numero, titulo: d.titulo, descricao: d.descricao, tipo: d.tipo,
          solicitanteId: atual.id, unidadeId: atual.unidadeId, local: d.local,
          categoriaId: d.categoriaId, servicoId: d.servicoId, prioridade: d.prioridade,
          status: requerAprovacao ? "Aguardando Aprovação" : tecnicoId ? "Atribuído" : "Em Triagem",
          tecnicoId, grupoId: rota.grupoId,
          patrimonioId: d.patrimonioId, criadoEm: agoraISO(), prazoResolucao: prazo.toISOString(),
          tecnicoPreferencialId: d.tecnicoPreferencialId ?? null,
          roteamento: [{
            ...dtAgora(), regra: rota.regra,
            detalhe: rota.detalhe, dominio: rota.dominioNome, grupo: rota.grupoNome,
            tecnico: nomeTec, automatico: !d.tecnicoPreferencialId,
          }],
          aprovacoes: requerAprovacao && regra
            ? regra.etapas.map((e) => ({ etapaId: e.id, etapaNome: e.nome, status: "Pendente" as const, aprovadorNome: e.tipoAprovador === "Grupo" ? `Grupo ${e.aprovador}` : e.aprovador }))
            : [],
          historico: [
            { ...dtAgora(), usuario: atual.nome, acao: "Chamado aberto", detalhe: `${d.tipo} registrado no Portal de Serviços.` },
            { ...dtAgora(), usuario: "sistema", acao: "Chamado direcionado automaticamente", detalhe: `Roteamento aplicado: ${rota.regra} · Grupo: ${rota.grupoNome} · Domínio: ${rota.dominioNome}${nomeTec ? ` · Técnico: ${nomeTec}` : ""}` },
            ...(requerAprovacao ? [{ ...dtAgora(), usuario: "sistema", acao: "Enviado para aprovação", detalhe: `Regra: ${regra!.nome} · Etapa 1 — ${regra!.etapas[0].nome}.` }] : []),
          ],
          comentarios: [],
        };
        setChamados((cs) => [novo, ...cs]);
        registrarAuditoria("Abertura de chamado", numero, `${d.titulo} · Grupo: ${rota.grupoNome} (${rota.regra})`);
        return novo;
      },
      mudarStatusChamado: (id, status, detalhe) => {
        setChamados((cs) => cs.map((c) => c.id === id ? {
          ...c, status,
          historico: [...c.historico, { ...dtAgora(), usuario: atual.nome, acao: `Status alterado para ${status}`, detalhe }],
        } : c));
        registrarAuditoria("Atualização de chamado", chamados.find((c) => c.id === id)?.numero ?? id, `Status: ${status}`);
      },
      atribuirChamado: (id, tecnicoId, grupoId) => {
        const tec = usuarios.find((u) => u.id === tecnicoId);
        const gru = grupoDe(grupoId ?? "");
        setChamados((cs) => cs.map((c) => c.id === id ? {
          ...c, tecnicoId, grupoId, status: tecnicoId ? "Atribuído" : c.status,
          roteamento: [...(c.roteamento ?? []), { ...dtAgora(), regra: "Atribuição manual", detalhe: `Grupo: ${gru?.nome ?? "—"} · Técnico: ${tec?.nome ?? "Não atribuído"}`, dominio: gru ? (dominios.find((dd) => dd.id === gru.dominioId)?.nome ?? "—") : "—", grupo: gru?.nome ?? "—", tecnico: tec?.nome, automatico: false }],
          historico: [...c.historico, { ...dtAgora(), usuario: atual.nome, acao: "Chamado atribuído", detalhe: `Grupo: ${gru?.nome ?? "—"} · Técnico: ${tec?.nome ?? "Não atribuído"}` }],
        } : c));
        registrarAuditoria("Atribuição de chamado", chamados.find((c) => c.id === id)?.numero ?? id, `Técnico: ${tec?.nome ?? "—"}`);
      },
      comentarChamado: (id, texto, tipo) => {
        setChamados((cs) => cs.map((c) => c.id === id ? {
          ...c, comentarios: [...c.comentarios, { id: nid("cc"), autorId: atual.id, texto, ...dtAgora(), tipo }],
        } : c));
      },
      decidirAprovacao: (chamadoId, etapaId, decisao, comentario) => {
        const ch = chamados.find((c) => c.id === chamadoId);
        if (!ch) return;
        const aprovacoes = ch.aprovacoes.map((a) => a.etapaId === etapaId
          ? { ...a, status: decisao, aprovadorNome: atual.nome, ...dtAgora(), comentario: comentario || undefined }
          : a);
        const rejeitada = decisao === "Rejeitado";
        const todasAprovadas = aprovacoes.every((a) => a.status === "Aprovado");
        const novaEtapaPendente = !rejeitada && !todasAprovadas
          ? aprovacoes.filter((a) => a.status === "Pendente").map((a) => a.etapaNome)
          : [];
        const novoStatus = rejeitada ? "Rejeitado" : decisao === "Ajuste solicitado" ? "Aguardando Usuário" : todasAprovadas ? "Aprovado" : "Aguardando Aprovação";
        const servico = ch.servicoId ? servicos.find((s) => s.id === ch.servicoId) : null;
        const rota = todasAprovadas && novoStatus === "Aprovado" ? resolverRoteamento(ch.unidadeId, ch.servicoId, ch.categoriaId) : null;
        const tecnicoLiberado = rota ? aplicarEstrategia(rota.grupoId, servico ?? null, ch.tecnicoPreferencialId ?? null) : null;
        setChamados((cs) => cs.map((c) => c.id === chamadoId ? {
          ...c, aprovacoes, status: novoStatus,
          grupoId: rota ? rota.grupoId : c.grupoId,
          tecnicoId: tecnicoLiberado ?? c.tecnicoId,
          historico: [...c.historico, {
            ...dtAgora(), usuario: atual.nome, acao: `Etapa ${decisao === "Aprovado" ? "aprovada" : decisao}`,
            detalhe: comentario || (todasAprovadas ? "Todas as etapas aprovadas — liberado para execução." : novaEtapaPendente[0] ? `Próxima etapa: ${novaEtapaPendente[0]}.` : ""),
          }, ...(rota ? [{ ...dtAgora(), usuario: "sistema", acao: "Encaminhado ao grupo de atendimento", detalhe: `Roteamento: ${rota.regra} · Grupo: ${rota.grupoNome}${tecnicoLiberado ? ` · Técnico: ${usuarios.find((u) => u.id === tecnicoLiberado)?.nome}` : ""}` }] : [])],
        } : c));
        registrarAuditoria(
          decisao === "Aprovado" ? "Aprovação de solicitação" : decisao === "Rejeitado" ? "Rejeição de solicitação" : "Ajuste solicitado",
          ch.numero, `Etapa: ${ch.aprovacoes.find((a) => a.etapaId === etapaId)?.etapaNome ?? ""}`
        );
      },
      converterChamadoEmIncidente: (chamadoId, dados) => {
        const ch = chamados.find((c) => c.id === chamadoId);
        if (!ch) return null;
        const proxNum = incidentesSeguranca.reduce((mx, i) => Math.max(mx, Number(i.numero.split("-").pop()) || 0), 0) + 1;
        const numero = `SEG-2026-${String(proxNum).padStart(6, "0")}`;
        const novo: IncidenteSeguranca = {
          id: nid("iseg"), numero, titulo: dados.titulo, descricao: `Convertido do chamado ${ch.numero}: ${ch.descricao}`,
          ...dtAgora(), hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          unidadeId: ch.unidadeId, ativoId: ch.patrimonioId ?? undefined, severidade: dados.severidade as IncidenteSeguranca["severidade"],
          impacto: "Avaliação em andamento.", status: "Aberto", responsavelId: atual.id,
          evidencias: [`Chamado de origem: ${ch.numero}`], acoesImediatas: "Registro convertido para tratamento pela equipe de segurança.",
          chamadoOrigem: ch.numero,
        };
        setIncidentesSeguranca((is) => [novo, ...is]);
        setChamados((cs) => cs.map((c) => c.id === chamadoId ? {
          ...c,
          historico: [...c.historico, { ...dtAgora(), usuario: atual.nome, acao: "Convertido em incidente de segurança", detalhe: `Vínculo criado com ${numero} — os registros permanecem relacionados.` }],
        } : c));
        registrarAuditoria("Conversão de chamado em incidente", numero, `Origem: ${ch.numero} · Categoria: ${dados.categoria}`);
        return novo;
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
      setGruposSuporte: (g) => {
        setGruposSuporte(g);
        registrarAuditoria("Alteração em grupo de atendimento", "Central de Serviços", "Configuração de grupos atualizada");
      },
      setDominios: (dd) => {
        setDominios(dd);
        registrarAuditoria("Alteração em domínio de atendimento", "Central de Serviços", "Domínios de TI atualizados");
      },
      setCoberturas: (c) => {
        setCoberturas(c);
        registrarAuditoria("Alteração em cobertura de atendimento", "Motor de roteamento", "Cobertura grupo × unidade atualizada");
      },
      setRegrasRoteamento: (r) => {
        setRegrasRoteamento(r);
        registrarAuditoria("Alteração em regra de roteamento", "Motor de roteamento", "Regras de direcionamento atualizadas");
      },
      setResponsaveisGlobais: (r) => {
        setResponsaveisGlobais(r);
        registrarAuditoria("Alteração de responsável global", "Motor de roteamento", "Responsáveis globais por serviço atualizados");
      },
      setUnidadeAtendimento: (unidadeId, patch) => {
        setUnidades((us) => us.map((u) => (u.id === unidadeId ? { ...u, ...patch } : u)));
        const u = unDe(unidadeId);
        registrarAuditoria("Configuração de atendimento de TI", u?.nome ?? unidadeId, "Parâmetros de atendimento da unidade atualizados");
      },
      setTiposUnidade: (t) => setTiposUnidade(t),

      /* ---------- Patrimônio ---------- */
      movimentarAtivo: (ativoId, m) => {
        setAtivos((as) => as.map((a) => a.id === ativoId ? {
          ...a, movimentacoes: [...a.movimentacoes, { ...m, ...dtAgora(), usuario: atual.nome }],
        } : a));
        const a = ativos.find((x) => x.id === ativoId);
        registrarAuditoria("Movimentação de patrimônio", `Patrimônio ${a?.patrimonio ?? ativoId}`, `${m.origem} → ${m.destino} (localização alterada; pertencimento preservado)`);
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
      baixarAtivo: (ativoId, info) => {
        setAtivos((as) => as.map((a) => a.id === ativoId ? {
          ...a, status: "Baixado", baixa: { ...info, usuario: atual.nome },
          movimentacoes: [...a.movimentacoes, {
            origem: `${a.predio} — ${a.sala || "local atual"}`, destino: info.destino || "Baixa patrimonial",
            responsavelAnterior: usuarios.find((u) => u.id === a.responsavelId)?.nome ?? "Estoque",
            novoResponsavel: "Baixa patrimonial", ...dtAgora(), usuario: atual.nome,
            motivo: `Baixa: ${info.motivo} (${info.documento || "sem documento"})`,
          }],
        } : a));
        const a = ativos.find((x) => x.id === ativoId);
        registrarAuditoria("Baixa patrimonial", `Patrimônio ${a?.patrimonio ?? ativoId}`, `Motivo: ${info.motivo} · Processo: ${info.processo || "—"} · registro preservado`);
      },
      setResultadoInventario: (campanhaId, patrimonioId, resultado, obs) => {
        setInventario((invs) => invs.map((c) => c.id === campanhaId ? {
          ...c,
          itens: c.itens.map((i) => (i.patrimonioId === patrimonioId ? { ...i, resultado } : i)),
          historico: [...(c.historico ?? []), { patrimonioId, resultado, usuario: atual.nome, ...dtAgora(), obs }],
        } : c));
      },
      setRegrasObsolescencia: (r) => {
        setRegrasObsolescencia(r);
        registrarAuditoria("Alteração em regra de obsolescência", "Patrimônio de TI", "Critérios de idade por categoria atualizados");
      },
      salvarSnapshot: (nome, filtros, total) => {
        const hash = hashSimples(`${nome}|${filtros}|${total}|${agoraISO()}`);
        const snap: SnapshotRelatorio = { id: nid("snap"), nome, ...dtAgora(), filtros, total, usuario: atual.nome, hash };
        setSnapshots((s) => [snap, ...s]);
        registrarAuditoria("Snapshot de relatório oficial", nome, `${total} registros · hash ${hash}`);
        return snap;
      },

      /* ---------- Segurança da Informação ---------- */
      criarIncidente: (i) => {
        const proxNum = incidentesSeguranca.reduce((mx, x) => Math.max(mx, Number(x.numero.split("-").pop()) || 0), 0) + 1;
        const numero = `SEG-2026-${String(proxNum).padStart(6, "0")}`;
        const novo: IncidenteSeguranca = { ...i, id: nid("iseg"), numero, status: "Aberto" };
        setIncidentesSeguranca((is) => [novo, ...is]);
        registrarAuditoria("Abertura de incidente de segurança", numero, `${i.titulo} · Severidade: ${i.severidade}`);
        return novo;
      },
      mudarStatusIncidente: (id, status, detalhe) => {
        setIncidentesSeguranca((is) => is.map((i) => i.id === id ? { ...i, status: status as IncidenteSeguranca["status"], encerramento: status === "Fechado" ? agoraISO() : i.encerramento } : i));
        const i = incidentesSeguranca.find((x) => x.id === id);
        registrarAuditoria("Atualização de incidente de segurança", i?.numero ?? id, `Status: ${status}${detalhe ? ` · ${detalhe}` : ""}`);
      },
      mudarStatusVulnerabilidade: (id, status) => {
        setVulnerabilidades((vs) => vs.map((v) => v.id === id ? { ...v, status: status as Vulnerabilidade["status"] } : v));
        const v = vulnerabilidades.find((x) => x.id === id);
        registrarAuditoria("Atualização de vulnerabilidade", v?.titulo ?? id, `Status: ${status}`);
      },
      aceitarPolitica: (id) => {
        setPoliticasSeguranca((ps) => ps.map((p) => p.id === id && !p.lidoPor.includes(atual.id) ? { ...p, lidoPor: [...p.lidoPor, atual.id] } : p));
        const p = politicasSeguranca.find((x) => x.id === id);
        registrarAuditoria("Aceite de política de segurança", `${p?.titulo ?? id} (v${p?.versao ?? "—"})`, "Registro de ciência do servidor");
      },
      setStatusControle: (id, status) => {
        setControles((cs) => cs.map((c) => c.id === id ? { ...c, status: status as ControleSeguranca["status"], ultimaRevisao: agoraISO().slice(0, 10) } : c));
        const c = controles.find((x) => x.id === id);
        registrarAuditoria("Alteração de controle de segurança", c?.nome ?? id, `Status: ${status}`);
      },
      adicionarCamada: (nome, tipo) => {
        setCamadas((cs) => [...cs, { id: nid("cam"), nome, codigo: nome.slice(0, 3).toUpperCase(), ordem: cs.length + 1, descricao: "Camada personalizada criada pelo administrador.", tipo, status: "Em implantação" }]);
        registrarAuditoria("Criação de camada de segurança", nome, `Tipo: ${tipo}`);
      },
      toggleCamada: (id) => {
        setCamadas((cs) => cs.map((c) => c.id === id ? { ...c, status: c.status === "Ativa" ? "Inativa" : "Ativa" } : c));
      },
      decidirRevisaoRegra: (regraId, decisao, justificativa) => {
        setRevisoesRegras((rs) => rs.map((r) => r.regraId === regraId && r.decisao === null
          ? { ...r, decisao, revisor: atual.nome, data: agoraISO().slice(0, 10), justificativa }
          : r));
        registrarAuditoria("Revisão de regra de firewall", `Regra ${regraId.toUpperCase()}`, `Decisão: ${decisao}`);
      },
      revelarCredencial: (id) => {
        const c = cofre.find((x) => x.id === id);
        if (!c) return "";
        logCofre(c.nome, "Credencial visualizada");
        return decifrar(c.segredoCifrado);
      },
      criarCredencial: (c, segredo) => {
        setCofre((cs) => [{ ...c, id: nid("cr"), segredoCifrado: cifrar(segredo), criadoEm: agoraISO().slice(0, 10), rotacionadaEm: agoraISO().slice(0, 10) }, ...cs]);
        logCofre(c.nome, "Credencial criada");
        registrarAuditoria("Criação de credencial no cofre", c.nome, "Segredo armazenado cifrado — valor não registrado em auditoria");
      },
      rotacionarCredencial: (id, novoSegredo) => {
        setCofre((cs) => cs.map((c) => c.id === id ? { ...c, segredoCifrado: cifrar(novoSegredo), rotacionadaEm: agoraISO().slice(0, 10) } : c));
        const c = cofre.find((x) => x.id === id);
        logCofre(c?.nome ?? id, "Credencial rotacionada");
        registrarAuditoria("Rotação de credencial", c?.nome ?? id, "Segredo substituído — valor não registrado em auditoria");
      },
      setMaturidade: (m) => {
        setMaturidade(m);
        registrarAuditoria("Atualização da avaliação de maturidade", "Modelo interno de maturidade", "Níveis revisados pelo gestor de segurança");
      },
      setPoliticaSenha: (p) => {
        setPoliticaSenha(p);
        registrarAuditoria("Alteração da política de senhas", "Segurança", `Mínimo ${p.tamanhoMin} caracteres · expiração ${p.expiracaoDias} dias · bloqueio após ${p.tentativas} tentativas`);
      },
      alterarSenhaAdmin: (senhaAtual, nova) => {
        if (senhaAtual !== "GovFlow@2026") return "A senha atual informada não confere.";
        const falhas: string[] = [];
        if (nova.length < politicaSenha.tamanhoMin) falhas.push(`mínimo de ${politicaSenha.tamanhoMin} caracteres`);
        if (politicaSenha.maiusculas && !/[A-Z]/.test(nova)) falhas.push("letra maiúscula");
        if (politicaSenha.minusculas && !/[a-z]/.test(nova)) falhas.push("letra minúscula");
        if (politicaSenha.numeros && !/[0-9]/.test(nova)) falhas.push("número");
        if (politicaSenha.especiais && !/[^A-Za-z0-9]/.test(nova)) falhas.push("caractere especial");
        if (falhas.length > 0) return `A nova senha não atende à política: ${falhas.join(", ")}.`;
        setUsuarios((us) => us.map((u) => u.id === atual.id ? { ...u, ultimaTrocaSenha: agoraISO() } : u));
        registrarAuditoria("Alteração de senha", `Usuário ${atual.usuario}`, "Senha alterada pelo próprio usuário — valor nunca armazenado em texto claro");
        return null;
      },
      redefinirSenhaUsuario: (id) => {
        const temporaria = `Gf-${Math.random().toString(36).slice(2, 6)}${Math.floor(Math.random() * 900 + 100)}!`;
        setUsuarios((us) => us.map((u) => u.id === id ? { ...u, trocarSenha: true } : u));
        const u = usuarios.find((x) => x.id === id);
        registrarAuditoria("Redefinição de senha", u?.nome ?? id, "Senha temporária gerada — alteração obrigatória no próximo acesso (valor não registrado)");
        return temporaria;
      },

      /* ---------- Equipes ---------- */
      criarEquipe: (e) => {
        setEquipes((es) => [...es, { ...e, id: nid("eq"), ativa: true }]);
        registrarAuditoria("Criação de equipe", e.nome, `Tipo: ${e.tipo ?? "—"} · Responsável: ${usuarios.find((u) => u.id === e.liderId)?.nome ?? "—"}`);
      },
      atualizarEquipe: (id, patch) => {
        setEquipes((es) => es.map((e) => (e.id === id ? { ...e, ...patch } : e)));
        const e = equipes.find((x) => x.id === id);
        registrarAuditoria("Alteração de equipe", e?.nome ?? id, "Dados da equipe atualizados");
      },
      adicionarMembroEquipe: (equipeId, userId, papel) => {
        setEquipes((es) => es.map((e) => e.id === equipeId && !e.membroIds.includes(userId)
          ? { ...e, membroIds: [...e.membroIds, userId], papeis: { ...(e.papeis ?? {}), [userId]: papel } }
          : e));
        const e = equipes.find((x) => x.id === equipeId);
        const u = usuarios.find((x) => x.id === userId);
        registrarAuditoria("Adição de colaborador em equipe", `${u?.nome ?? userId} → ${e?.nome ?? equipeId}`, `Papel: ${papel}`);
      },
      removerMembroEquipe: (equipeId, userId) => {
        setEquipes((es) => es.map((e) => e.id === equipeId
          ? { ...e, membroIds: e.membroIds.filter((m) => m !== userId), papeis: Object.fromEntries(Object.entries(e.papeis ?? {}).filter(([k]) => k !== userId)) }
          : e));
        const e = equipes.find((x) => x.id === equipeId);
        const u = usuarios.find((x) => x.id === userId);
        registrarAuditoria("Remoção de colaborador de equipe", `${u?.nome ?? userId} ← ${e?.nome ?? equipeId}`, "Vínculo encerrado");
      },

      /* ---------- Relatórios ---------- */
      registrarGeracao: (relatorio, formato, filtros, registros) => {
        setHistoricoRelatorios((h) => [{ id: nid("hr"), relatorio, usuario: atual.nome, ...dtAgora(), formato, filtros, registros }, ...h]);
      },
      salvarRelatorioFiltro: (nome, fonte, busca) => {
        setRelatoriosSalvos((r) => [...r, { id: nid("rs"), nome, fonte, busca, criadoEm: agoraISO() }]);
      },
      excluirRelatorioSalvo: (id) => {
        setRelatoriosSalvos((r) => r.filter((x) => x.id !== id));
      },
      salvarTemplateRelatorio: (t) => {
        setTemplatesRelatorio((ts) => [...ts, { ...t, id: nid("tpl") }]);
        registrarAuditoria("Criação de modelo de relatório", t.nome, `Fonte: ${t.fonte} · ${t.colunas.length} colunas`);
      },
      toggleTemplateRelatorio: (id) => {
        setTemplatesRelatorio((ts) => ts.map((t) => (t.id === id ? { ...t, ativo: !t.ativo } : t)));
      },

      /* ---------- Licenciamento ---------- */
      validarLicenca: (origem) => {
        setLicenca((l) => ({ ...l, ultimaValidacao: agoraISO(), status: l.status === "Ativa" || l.status === "Período de Tolerância" ? "Ativa" : l.status }));
        registrarEventoLicenca("Validação de licença", licenca.status, origem, "Assinatura verificada localmente com a chave pública embutida.");
        registrarAuditoria("Validação de licença", licenca.instalacaoId, `Origem: ${origem}`);
      },
      importarLicenca: (texto) => {
        const valida = texto.includes("GF-LIC") && texto.includes(licenca.instalacaoId);
        if (valida) {
          setLicenca((l) => ({ ...l, status: "Ativa", ultimaValidacao: agoraISO() }));
          registrarEventoLicenca("Substituição de licença", "Ativa", "Arquivo govflow-license.lic", "Assinatura válida — licença reativada.");
          registrarAuditoria("Importação de licença", licenca.instalacaoId, "Arquivo assinado importado e validado localmente");
        } else {
          registrarEventoLicenca("Validação com falha", licenca.status, "Arquivo govflow-license.lic", "Assinatura inválida ou identificador de instalação divergente.");
          registrarAuditoria("Falha na validação de licença", licenca.instalacaoId, "Arquivo rejeitado — assinatura inválida");
        }
        return valida;
      },
      setLicencaStatus: (status) => {
        setLicenca((l) => ({ ...l, status }));
        registrarEventoLicenca(
          status === "Expirada" ? "Expiração de licença" : status === "Revogada" ? "Revogação de licença" : status === "Suspensa" ? "Suspensão de licença" : "Reativação de licença",
          status, "Servidor de licenciamento", status === "Ativa" ? "Licença reativada — modo restrito desativado." : "Política de modo restrito aplicada (dados preservados)."
        );
        registrarAuditoria("Alteração de status de licença", licenca.instalacaoId, `Novo status: ${status}`);
      },
      exportarConfiguracao: () => ({
        produto: config.marca.produto, versao: 1, exportadoEm: agoraISO(),
        orgao: config.orgao, regional: config.regional, identidade: { ...config.identidade, brasaoDataUrl: config.identidade.brasaoDataUrl ? "(arquivo em volume persistente)" : null },
        tiposUnidade, unidades, gestoras: UNIDADES_GESTORAS_SEED, fundos: FUNDOS_SEED,
        dominios, gruposSuporte, coberturas, regrasRoteamento, responsaveisGlobais,
        servicos, regrasAprovacao, regrasSLA, perfis, regrasObsolescencia, templatesRelatorio, politicaSenha,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
    };
  }, [usuarios, unidades, equipes, projetos, tarefas, demandas, fluxos, documentos, riscos, notificacoes, eventos, auditoria, perfis, config, canais, mensagens, comunicados, chamados, servicos, gruposSuporte, dominios, coberturas, regrasRoteamento, responsaveisGlobais, tiposUnidade, regrasAprovacao, regrasSLA, ativos, inventario, licenca, eventosLicenca, snapshots, camadas, controles, incidentesSeguranca, vulnerabilidades, politicasSeguranca, cofre, cofreLog, revisoesRegras, maturidade, politicaSenha, templatesRelatorio, relatoriosSalvos, historicoRelatorios, perfilSimulado]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

function hashSimples(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, "0").toUpperCase();
}

function isoAgoraMenos() {
  const d = new Date();
  d.setDate(d.getDate() - 3);
  return d.toISOString();
}
