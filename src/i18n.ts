/**
 * Estrutura centralizada de internacionalização.
 * O locale padrão é pt-BR. Para adicionar um novo idioma, implemente um objeto
 * com o mesmo formato de `M` e registre-o em `locales`.
 */
export type LocaleCode = "pt-BR";

export const M = {
  sistema: {
    sigla: "GovFlow",
    nome: "Plataforma Integrada de Gestão para Órgãos Públicos",
    orgao: "Prefeitura Municipal de Cidade Exemplo",
    orgaoCurto: "Prefeitura de Cidade Exemplo",
    versao: "v2.4.1",
    acesso: "Acesso restrito a servidores autorizados",
  },
  nav: {
    painel: "Painel",
    minhaArea: "Minha Área",
    comunicacao: "Comunicação",
    centralTI: "Central de Serviços de TI",
    patrimonio: "Patrimônio de TI",
    aprovacoes: "Aprovações Pendentes",
    projetos: "Projetos",
    tarefas: "Tarefas",
    demandas: "Demandas",
    fluxos: "Fluxos de Trabalho",
    equipes: "Equipes",
    calendario: "Calendário",
    documentos: "Documentos",
    indicadores: "Indicadores",
    riscos: "Riscos",
    relatorios: "Relatórios",
    organograma: "Organograma",
    administracao: "Administração",
    configuracoes: "Configurações",
  },
  grupos: {
    principal: "Principal",
    gestao: "Gestão",
    estrutura: "Estrutura",
    monitoramento: "Monitoramento",
    sistema: "Sistema",
  },
  acoes: {
    salvar: "Salvar",
    cancelar: "Cancelar",
    excluir: "Excluir",
    editar: "Editar",
    criar: "Criar",
    pesquisar: "Pesquisar",
    fechar: "Fechar",
    confirmar: "Confirmar",
    gerar: "Gerar",
    baixar: "Baixar",
    enviar: "Enviar",
    adicionar: "Adicionar",
    remover: "Remover",
    ver: "Ver",
    concluir: "Concluir",
    aprovar: "Aprovar",
    recusar: "Recusar",
    entrar: "Entrar",
    sair: "Sair",
    testar: "Testar Conexão",
    voltar: "Voltar",
    avancar: "Avançar",
    instalar: "Concluir Instalação",
    acessar: "Acessar o Sistema",
    novoProjeto: "Novo Projeto",
    novaTarefa: "Nova Tarefa",
    novaDemanda: "Nova Demanda",
    novoEvento: "Novo Evento",
    novoRisco: "Novo Risco",
    novoUsuario: "Novo Usuário",
    novaEtapa: "Nova Etapa",
    marcarLidas: "Marcar todas como lidas",
    refazerInstalacao: "Refazer Assistente de Instalação",
    exportarBackup: "Exportar backup dos dados",
    limpar: "Limpar filtros",
    hoje: "Hoje",
    verTodas: "Ver todas",
    aceitar: "Aceitar",
    iniciar: "Iniciar atendimento",
    pausar: "Colocar em aguardo",
    analisar: "Analisar",
    desbloquear: "Desbloquear",
    atribuir: "Atribuir",
  },
  rotulos: {
    status: "Status",
    prioridade: "Prioridade",
    responsavel: "Responsável",
    solicitante: "Solicitante",
    prazo: "Prazo",
    unidade: "Unidade Administrativa",
    equipe: "Equipe",
    projeto: "Projeto",
    orcamento: "Orçamento",
    progresso: "Progresso",
    descricao: "Descrição",
    nome: "Nome",
    tipo: "Tipo",
    categoria: "Categoria",
    versao: "Versão",
    atualizado: "Atualizado",
    dataHora: "Data/Hora",
    usuario: "Usuário",
    acao: "Ação",
    objeto: "Objeto",
    protocolo: "Protocolo",
    matricula: "Matrícula",
    cargo: "Cargo",
    lotacao: "Lotação",
    perfil: "Perfil de Acesso",
    ativo: "Ativo",
    suspenso: "Suspenso",
    saude: "Situação",
    tendencia: "Tendência",
    probabilidade: "Probabilidade",
    impacto: "Impacto",
    mitigacao: "Plano de Mitigação",
    sla: "SLA",
    etapas: "Etapas",
    instancias: "Instâncias em andamento",
    nenhumResultado: "Nenhum resultado encontrado",
    ajusteFiltros: "Ajuste a pesquisa ou os filtros para encontrar o que procura.",
    emAtraso: "Em atraso",
    venceHoje: "Vence hoje",
    dias: "dias",
    de: "de",
    resultados: "resultados",
    todos: "Todos",
    notificacoes: "Notificações",
    historico: "Histórico de Atividades",
    anexos: "Anexos",
    periodo: "Período",
    filtros: "Filtros",
  },
  avisos: {
    salvo: "Alterações salvas com sucesso.",
    criado: "Registro criado com sucesso.",
    movido: "Item movido com sucesso.",
    excluido: "Registro excluído.",
    download: "Download iniciado.",
    relatorioGerado: "Relatório gerado com sucesso.",
    conexaoOk: "Conexão estabelecida com sucesso.",
    instalado: "Instalação concluída com sucesso.",
    bemVindo: "Sessão iniciada. Bem-vindo(a)!",
    marcadasLidas: "Notificações marcadas como lidas.",
    erroObrigatorio: "Preencha os campos obrigatórios.",
  },
} as const;

export type Mensagens = typeof M;

/** Registro de locales disponíveis — novos idiomas entram aqui. */
export const locales: Record<LocaleCode, Mensagens> = {
  "pt-BR": M,
};

let localeAtual: LocaleCode = "pt-BR";

export const getLocale = (): LocaleCode => localeAtual;

export const setLocale = (novo: LocaleCode): void => {
  localeAtual = novo;
};

/** Resolve uma chave pontuada (ex.: "nav.painel") no locale atual. */
export function t(chave: string): string {
  const partes = chave.split(".");
  let atual: unknown = locales[localeAtual] as unknown;
  for (const p of partes) {
    if (atual && typeof atual === "object" && p in (atual as Record<string, unknown>)) {
      atual = (atual as Record<string, unknown>)[p];
    } else {
      return chave;
    }
  }
  return typeof atual === "string" ? atual : chave;
}
