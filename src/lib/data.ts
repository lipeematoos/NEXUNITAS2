import { isoRel, isoData } from "./format";

/* ===================== Configurações de domínio (rótulos pt-BR) ===================== */

export type Tom = "cinza" | "azul" | "ciano" | "verde" | "pinho" | "ambar" | "amarelo" | "vermelho";

export const TOM_CSS: Record<Tom, { bg: string; fg: string }> = {
  cinza: { bg: "#e4e8e0", fg: "#4d5c53" },
  azul: { bg: "#dce9f5", fg: "#1b5583" },
  ciano: { bg: "#d9ecef", fg: "#0c5f76" },
  verde: { bg: "#dcefe3", fg: "#17603f" },
  pinho: { bg: "#cfe7d8", fg: "#0e4a2f" },
  ambar: { bg: "#f9e7cd", fg: "#8f5409" },
  amarelo: { bg: "#fbf0c6", fg: "#7a5a00" },
  vermelho: { bg: "#f6ddd5", fg: "#96331e" },
};

export const PRIORIDADES: { label: string; tom: Tom; hex: string; peso: number }[] = [
  { label: "Baixa", tom: "cinza", hex: "#8a9a8f", peso: 1 },
  { label: "Normal", tom: "azul", hex: "#20659f", peso: 2 },
  { label: "Média", tom: "ciano", hex: "#0e7490", peso: 3 },
  { label: "Alta", tom: "ambar", hex: "#b4690e", peso: 4 },
  { label: "Urgente", tom: "vermelho", hex: "#b3402a", peso: 5 },
  { label: "Crítica", tom: "vermelho", hex: "#7d1f0e", peso: 6 },
];

export const STATUS_TAREFA: { label: string; tom: Tom; hex: string }[] = [
  { label: "A Fazer", tom: "cinza", hex: "#8a9a8f" },
  { label: "Em Andamento", tom: "azul", hex: "#20659f" },
  { label: "Aguardando", tom: "ambar", hex: "#b4690e" },
  { label: "Bloqueado", tom: "vermelho", hex: "#b3402a" },
  { label: "Em Revisão", tom: "ciano", hex: "#0e7490" },
  { label: "Concluído", tom: "verde", hex: "#1e7a54" },
];

export const STATUS_DEMANDA: { label: string; tom: Tom }[] = [
  { label: "Nova", tom: "azul" },
  { label: "Em Análise", tom: "ciano" },
  { label: "Aceita", tom: "verde" },
  { label: "Em Atendimento", tom: "amarelo" },
  { label: "Aguardando", tom: "ambar" },
  { label: "Concluída", tom: "pinho" },
  { label: "Recusada", tom: "vermelho" },
  { label: "Cancelada", tom: "cinza" },
];

export const STATUS_PROJETO: { label: string; tom: Tom; hex: string }[] = [
  { label: "Planejamento", tom: "cinza", hex: "#8a9a8f" },
  { label: "Em Andamento", tom: "azul", hex: "#20659f" },
  { label: "Em Atenção", tom: "ambar", hex: "#b4690e" },
  { label: "Atrasado", tom: "vermelho", hex: "#b3402a" },
  { label: "Suspenso", tom: "ciano", hex: "#0e7490" },
  { label: "Concluído", tom: "verde", hex: "#1e7a54" },
  { label: "Cancelado", tom: "cinza", hex: "#8a9a8f" },
];

export const SAUDE_PROJETO = ["Saudável", "Em atenção", "Crítico"] as const;
export const TIPOS_DEMANDA = [
  "Solicitação de Acesso ao Sistema",
  "Solicitação de Equipamento",
  "Instalação de Ponto de Rede",
  "Criação de Usuário",
  "Manutenção de Computador",
  "Solicitação de Relatório",
];

/* ===================== Tipos ===================== */

export interface Usuario {
  id: string; nome: string; usuario: string; matricula: string; cargo: string;
  unidadeId: string; email: string; ramal: string;
  perfil: "Administrador" | "Gerente de Projeto" | "Responsável pela Equipe" | "Responsável pela Unidade" | "Visualizador";
  ativo: boolean;
  trocarSenha?: boolean;
  ultimaTrocaSenha?: string;
}
export interface Unidade {
  id: string; nome: string; sigla: string;
  tipo: string;
  parentId: string | null; responsavelId?: string; ramal?: string;
  gestoraId?: string; fundoId?: string; endereco?: string; telefone?: string;
  temEquipePropria?: boolean; dominioId?: string; grupoPrincipalId?: string;
  aplicarAtendimentoSubordinadas?: boolean; slaPadrao?: string; grupoEscalonamentoId?: string;
  ativa?: boolean;
}
export interface Equipe {
  id: string; nome: string; unidadeId: string; liderId: string; membroIds: string[]; especialidades: string[];
  sigla?: string; descricao?: string; tipo?: string; liderSubstitutoId?: string;
  papeis?: Record<string, string>; ativa?: boolean;
}
export const TIPOS_EQUIPE = ["Administrativa", "Projeto", "TI", "Suporte", "Infraestrutura", "Sistemas", "Comissão", "Temporária", "Outro"];
export const PAPEIS_EQUIPE = ["Responsável", "Coordenador", "Técnico", "Analista", "Membro", "Apoio"];
export interface Projeto {
  id: string; codigo: string; nome: string; descricao: string; unidadeId: string;
  responsavelId: string; equipeId: string; status: string; prioridade: string;
  inicio: string; prazo: string; progresso: number; saude: (typeof SAUDE_PROJETO)[number];
  orcamento: number; executado: number; fases: { nome: string; feita: boolean }[];
}
export interface Tarefa {
  id: string; titulo: string; descricao: string; projetoId: string | null; status: string;
  prioridade: string; responsavelId: string; prazo: string; etiquetas: string[];
  checklist: { feita: number; total: number }; bloqueioMotivo?: string; criadaEm: string;
}
export interface HistoricoItem { data: string; usuario: string; acao: string; detalhe: string; }
export interface Demanda {
  id: string; protocolo: string; tipo: string; descricao: string; solicitanteId: string;
  unidadeId: string; responsavelId: string | null; status: string; prioridade: string;
  prazo: string; criadaEm: string; historico: HistoricoItem[];
}
export interface EtapaFluxo { id: string; nome: string; papel: string; slaHoras: number; }
export interface Fluxo { id: string; nome: string; descricao: string; ativo: boolean; etapas: EtapaFluxo[]; instancias: number; }
export interface Documento {
  id: string; nome: string; categoria: string; tipoArquivo: "PDF" | "DOCX" | "XLSX" | "PPTX";
  versao: string; status: "Em vigor" | "Em revisão" | "Aprovado" | "Obsoleto";
  atualizadoEm: string; responsavelId: string; tamanho: string;
}
export interface Risco {
  id: string; titulo: string; descricao: string; categoria: "Tecnológico" | "Operacional" | "Financeiro" | "Conformidade" | "Segurança";
  probabilidade: number; impacto: number; tendencia: "Subindo" | "Estável" | "Diminuindo";
  nivel: "Crítico" | "Monitorando" | "Mitigado"; mitigacao: string; responsavelId: string; projetoId: string | null;
}
export interface Notificacao { id: string; titulo: string; detalhe: string; lida: boolean; data: string; tom: Tom; }
export interface EventoAgenda { id: string; titulo: string; data: string; hora: string; tipo: "Reunião" | "Prazo" | "Entrega" | "Treinamento" | "Comitê"; }
export interface Auditoria { id: string; dataHora: string; usuario: string; acao: string; objeto: string; detalhe: string; ip: string; }
export interface PerfilAcesso { nome: string; descricao: string; matriz: Record<string, boolean[]>; }

/* ===================== Estrutura administrativa ===================== */

export const UNIDADES_SEED: Unidade[] = [
  { id: "un0", nome: "Prefeitura Municipal de Cidade Exemplo", sigla: "PMCE", tipo: "Órgão", parentId: null, ramal: "6000" },
  { id: "un1", nome: "Secretaria Municipal de Administração", sigla: "SEAD", tipo: "Secretaria", parentId: "un0", responsavelId: "u2", ramal: "6100" },
  { id: "un2", nome: "Secretaria Municipal de Fazenda", sigla: "SEFAZ", tipo: "Secretaria", parentId: "un0", responsavelId: "u9", ramal: "6200" },
  { id: "un3", nome: "Secretaria Municipal de Educação", sigla: "SEMED", tipo: "Secretaria", parentId: "un0", responsavelId: "u10", ramal: "6300", gestoraId: "ug3", fundoId: "fm2", temEquipePropria: true, dominioId: "dom3", grupoPrincipalId: "g9", aplicarAtendimentoSubordinadas: true, endereco: "Rua das Escolas, 45", telefone: "(11) 4002-6300" },
  { id: "un4", nome: "Secretaria Municipal de Saúde", sigla: "SESAU", tipo: "Secretaria", parentId: "un0", responsavelId: "u11", ramal: "6400", gestoraId: "ug2", fundoId: "fm1", temEquipePropria: true, dominioId: "dom2", grupoPrincipalId: "g7", aplicarAtendimentoSubordinadas: true, endereco: "Av. da Saúde, 200", telefone: "(11) 4002-6400" },
  { id: "un5", nome: "Secretaria Municipal de Turismo", sigla: "SETUR", tipo: "Secretaria", parentId: "un0", responsavelId: "u12", ramal: "6500" },
  { id: "un6", nome: "Secretaria Municipal de Obras", sigla: "SEOB", tipo: "Secretaria", parentId: "un0", responsavelId: "u13", ramal: "6600" },
  { id: "un11", nome: "Departamento de Tecnologia da Informação", sigla: "DTI", tipo: "Departamento", parentId: "un1", responsavelId: "u2", ramal: "6110" },
  { id: "un12", nome: "Departamento de Recursos Humanos", sigla: "DRH", tipo: "Departamento", parentId: "un1", responsavelId: "u7", ramal: "6120" },
  { id: "un13", nome: "Departamento de Compras", sigla: "DCOMP", tipo: "Departamento", parentId: "un1", responsavelId: "u8", ramal: "6130" },
  { id: "un14", nome: "Departamento de Patrimônio", sigla: "DPAT", tipo: "Departamento", parentId: "un1", responsavelId: "u9", ramal: "6140" },
  { id: "un111", nome: "Divisão de Infraestrutura", sigla: "DINFRA", tipo: "Divisão", parentId: "un11", responsavelId: "u4", ramal: "6112" },
  { id: "un112", nome: "Divisão de Sistemas", sigla: "DSIS", tipo: "Divisão", parentId: "un11", responsavelId: "u1", ramal: "6114" },
  { id: "un113", nome: "Setor de Suporte ao Usuário", sigla: "SUP", tipo: "Setor", parentId: "un11", responsavelId: "u5", ramal: "6116" },
];

export const USUARIOS_SEED: Usuario[] = [
  { id: "u1", nome: "Ana Beatriz Rocha", usuario: "ana.rocha", matricula: "2019-0045", cargo: "Analista de Sistemas — Gerente de Projetos", unidadeId: "un112", email: "ana.rocha@cidadeexemplo.gov.br", ramal: "6114", perfil: "Gerente de Projeto", ativo: true },
  { id: "u2", nome: "Carlos Eduardo Menezes", usuario: "carlos.menezes", matricula: "2011-0212", cargo: "Diretor de Departamento", unidadeId: "un11", email: "carlos.menezes@cidadeexemplo.gov.br", ramal: "6110", perfil: "Administrador", ativo: true },
  { id: "u3", nome: "Juliana Freitas Almeida", usuario: "juliana.freitas", matricula: "2020-0118", cargo: "Técnica em Redes", unidadeId: "un111", email: "juliana.freitas@cidadeexemplo.gov.br", ramal: "6112", perfil: "Responsável pela Equipe", ativo: true },
  { id: "u4", nome: "Rafael Duarte Pinto", usuario: "rafael.duarte", matricula: "2015-0077", cargo: "Analista de Infraestrutura", unidadeId: "un111", email: "rafael.duarte@cidadeexemplo.gov.br", ramal: "6113", perfil: "Responsável pela Equipe", ativo: true },
  { id: "u5", nome: "Mariana Lopes Siqueira", usuario: "mariana.lopes", matricula: "2021-0164", cargo: "Técnica de Suporte", unidadeId: "un113", email: "mariana.lopes@cidadeexemplo.gov.br", ramal: "6116", perfil: "Responsável pela Equipe", ativo: true },
  { id: "u6", nome: "Eduardo Sá Barreto", usuario: "eduardo.sa", matricula: "2018-0091", cargo: "Desenvolvedor de Sistemas", unidadeId: "un112", email: "eduardo.sa@cidadeexemplo.gov.br", ramal: "6115", perfil: "Visualizador", ativo: true },
  { id: "u7", nome: "Patrícia Nunes Castro", usuario: "patricia.nunes", matricula: "2013-0056", cargo: "Diretora de Recursos Humanos", unidadeId: "un12", email: "patricia.nunes@cidadeexemplo.gov.br", ramal: "6120", perfil: "Responsável pela Unidade", ativo: true },
  { id: "u8", nome: "Tiago Almeida Braga", usuario: "tiago.braga", matricula: "2016-0103", cargo: "Diretor de Compras", unidadeId: "un13", email: "tiago.braga@cidadeexemplo.gov.br", ramal: "6130", perfil: "Responsável pela Unidade", ativo: true },
  { id: "u9", nome: "Fernanda Castro Lima", usuario: "fernanda.lima", matricula: "2012-0034", cargo: "Secretária Municipal de Fazenda", unidadeId: "un2", email: "fernanda.lima@cidadeexemplo.gov.br", ramal: "6200", perfil: "Responsável pela Unidade", ativo: true },
  { id: "u10", nome: "João Pereira Neto", usuario: "joao.pereira", matricula: "2014-0061", cargo: "Secretário Municipal de Educação", unidadeId: "un3", email: "joao.pereira@cidadeexemplo.gov.br", ramal: "6300", perfil: "Responsável pela Unidade", ativo: true },
  { id: "u11", nome: "Luciana Prado Teixeira", usuario: "luciana.prado", matricula: "2010-0023", cargo: "Secretária Municipal de Saúde", unidadeId: "un4", email: "luciana.prado@cidadeexemplo.gov.br", ramal: "6400", perfil: "Responsável pela Unidade", ativo: false },
  { id: "u12", nome: "Marcos Vinícius Sales", usuario: "marcos.sales", matricula: "2017-0089", cargo: "Secretário Municipal de Turismo", unidadeId: "un5", email: "marcos.sales@cidadeexemplo.gov.br", ramal: "6500", perfil: "Visualizador", ativo: true },
  { id: "u13", nome: "Renata Barbosa Farias", usuario: "renata.farias", matricula: "2015-0070", cargo: "Secretária Municipal de Obras", unidadeId: "un6", email: "renata.farias@cidadeexemplo.gov.br", ramal: "6600", perfil: "Responsável pela Unidade", ativo: true },
];

export const EQUIPES_SEED: Equipe[] = [
  { id: "eq1", nome: "Equipe de Infraestrutura", unidadeId: "un111", liderId: "u4", membroIds: ["u4", "u3"], especialidades: ["Servidores", "Virtualização", "Datacenter"] },
  { id: "eq2", nome: "Equipe de Suporte", unidadeId: "un113", liderId: "u5", membroIds: ["u5"], especialidades: ["Atendimento N1/N2", "Microinformática"] },
  { id: "eq3", nome: "Equipe de Sistemas", unidadeId: "un112", liderId: "u1", membroIds: ["u1", "u6"], especialidades: ["Desenvolvimento", "Integrações", "Banco de Dados"] },
  { id: "eq4", nome: "Equipe de Redes", unidadeId: "un111", liderId: "u3", membroIds: ["u3", "u4"], especialidades: ["Cabeamento", "Firewall", "Wi-Fi"] },
];

/* ===================== Projetos ===================== */

export const PROJETOS_SEED: Projeto[] = [
  { id: "p1", codigo: "PRJ-2026-001", nome: "Modernização do Datacenter", descricao: "Substituição dos servidores legados, ampliação da capacidade de armazenamento e implantação de redundância elétrica no datacenter municipal.", unidadeId: "un111", responsavelId: "u4", equipeId: "eq1", status: "Em Andamento", prioridade: "Alta", inicio: isoRel(-120), prazo: isoData(75), progresso: 58, saude: "Em atenção", orcamento: 1850000, executado: 1020000, fases: [{ nome: "Diagnóstico", feita: true }, { nome: "Aquisição", feita: true }, { nome: "Instalação", feita: false }, { nome: "Migração", feita: false }, { nome: "Homologação", feita: false }] },
  { id: "p2", codigo: "PRJ-2026-002", nome: "Implantação do Portal de Serviços", descricao: "Portal cidadão com protocolo digital, agendamentos e acompanhamento de demandas das secretarias.", unidadeId: "un112", responsavelId: "u1", equipeId: "eq3", status: "Em Andamento", prioridade: "Crítica", inicio: isoRel(-90), prazo: isoData(40), progresso: 72, saude: "Saudável", orcamento: 640000, executado: 410000, fases: [{ nome: "Levantamento", feita: true }, { nome: "Prototipação", feita: true }, { nome: "Desenvolvimento", feita: true }, { nome: "Integrações", feita: false }, { nome: "Publicação", feita: false }] },
  { id: "p3", codigo: "PRJ-2025-014", nome: "Modernização da Infraestrutura de Rede", descricao: "Atualização do parque de switches, anéis ópticos entre prédios públicos e cobertura Wi-Fi nas unidades de atendimento.", unidadeId: "un111", responsavelId: "u3", equipeId: "eq4", status: "Atrasado", prioridade: "Alta", inicio: isoRel(-200), prazo: isoData(-12), progresso: 64, saude: "Crítico", orcamento: 980000, executado: 760000, fases: [{ nome: "Projeto executivo", feita: true }, { nome: "Cabeamento óptico", feita: true }, { nome: "Troca de switches", feita: false }, { nome: "Wi-Fi público", feita: false }] },
  { id: "p4", codigo: "PRJ-2026-005", nome: "Implantação do Sistema de Atendimento Interno", descricao: "Sistema de help desk interno com base de conhecimento, SLA por prioridade e pesquisa de satisfação.", unidadeId: "un113", responsavelId: "u5", equipeId: "eq2", status: "Em Atenção", prioridade: "Média", inicio: isoRel(-45), prazo: isoData(25), progresso: 41, saude: "Em atenção", orcamento: 220000, executado: 96000, fases: [{ nome: "Parametrização", feita: true }, { nome: "Migração de chamados", feita: false }, { nome: "Treinamento", feita: false }] },
  { id: "p5", codigo: "PRJ-2026-007", nome: "Migração para Nuvem Governamental", descricao: "Estudo e migração gradual dos sistemas municipais para a nuvem governamental, com plano de contingência.", unidadeId: "un112", responsavelId: "u1", equipeId: "eq3", status: "Planejamento", prioridade: "Média", inicio: isoRel(-10), prazo: isoData(180), progresso: 12, saude: "Saudável", orcamento: 1200000, executado: 48000, fases: [{ nome: "Estudo de viabilidade", feita: false }, { nome: "Prova de conceito", feita: false }, { nome: "Migração", feita: false }] },
  { id: "p6", codigo: "PRJ-2025-019", nome: "Atualização do Parque Computacional", descricao: "Aquisição e padronização de 450 estações de trabalho para as secretarias, com imagem corporativa.", unidadeId: "un113", responsavelId: "u5", equipeId: "eq2", status: "Suspenso", prioridade: "Normal", inicio: isoRel(-160), prazo: isoData(60), progresso: 35, saude: "Em atenção", orcamento: 1500000, executado: 520000, fases: [{ nome: "Licitação", feita: true }, { nome: "Entrega lote 1", feita: true }, { nome: "Entrega lote 2", feita: false }] },
  { id: "p7", codigo: "PRJ-2025-008", nome: "Portal da Transparência 2.0", descricao: "Nova versão do portal com dados abertos, painéis de execução orçamentária e acessibilidade nível AA.", unidadeId: "un112", responsavelId: "u6", equipeId: "eq3", status: "Concluído", prioridade: "Alta", inicio: isoRel(-300), prazo: isoData(-40), progresso: 100, saude: "Saudável", orcamento: 310000, executado: 298000, fases: [{ nome: "Desenvolvimento", feita: true }, { nome: "Auditoria de acessibilidade", feita: true }, { nome: "Publicação", feita: true }] },
  { id: "p8", codigo: "PRJ-2026-009", nome: "Rede de Dados das Unidades de Saúde", descricao: "Conectividade dedicada para 14 unidades básicas de saúde, com redundância 4G/5G.", unidadeId: "un111", responsavelId: "u4", equipeId: "eq4", status: "Em Andamento", prioridade: "Urgente", inicio: isoRel(-60), prazo: isoData(55), progresso: 47, saude: "Saudável", orcamento: 720000, executado: 305000, fases: [{ nome: "Vistoria das unidades", feita: true }, { nome: "Instalação de enlaces", feita: false }, { nome: "Monitoramento", feita: false }] },
];

/* ===================== Tarefas ===================== */

export const TAREFAS_SEED: Tarefa[] = [
  { id: "t1", titulo: "Homologar cluster de virtualização", descricao: "Validar o novo cluster e executar testes de failover com os sistemas críticos.", projetoId: "p1", status: "Em Andamento", prioridade: "Alta", responsavelId: "u1", prazo: isoRel(3, 17), etiquetas: ["Datacenter"], checklist: { feita: 3, total: 5 }, criadaEm: isoRel(-6) },
  { id: "t2", titulo: "Integrar protocolo digital ao Portal", descricao: "Integração via API REST com o módulo de protocolo, incluindo retorno de andamento.", projetoId: "p2", status: "Em Andamento", prioridade: "Crítica", responsavelId: "u1", prazo: isoRel(5, 12), etiquetas: ["API", "Portal"], checklist: { feita: 6, total: 8 }, criadaEm: isoRel(-12) },
  { id: "t3", titulo: "Revisar plano de contingência do datacenter", descricao: "Atualizar procedimentos de RTO/RPO e contatos de emergência.", projetoId: "p1", status: "Em Revisão", prioridade: "Média", responsavelId: "u1", prazo: isoRel(1, 18), etiquetas: ["Documentação"], checklist: { feita: 4, total: 4 }, criadaEm: isoRel(-9) },
  { id: "t4", titulo: "Levantar requisitos do módulo de agendamento", descricao: "Reuniões com SEMED e SESAU para desenho do fluxo de agendamento online.", projetoId: "p2", status: "Aguardando", prioridade: "Alta", responsavelId: "u1", prazo: isoRel(7), etiquetas: ["Requisitos"], checklist: { feita: 1, total: 4 }, criadaEm: isoRel(-4) },
  { id: "t5", titulo: "Mapear serviços para o Portal de Serviços", descricao: "Inventariar os 40 serviços prioritários das secretarias com prazos e documentos.", projetoId: "p2", status: "Concluído", prioridade: "Alta", responsavelId: "u1", prazo: isoRel(-2), etiquetas: ["Portal"], checklist: { feita: 5, total: 5 }, criadaEm: isoRel(-20) },
  { id: "t6", titulo: "Aprovar especificação de switches do lote 2", descricao: "Análise técnica das propostas recebidas na licitação.", projetoId: "p3", status: "Bloqueado", prioridade: "Urgente", responsavelId: "u1", prazo: isoRel(-1, 12), etiquetas: ["Licitação"], checklist: { feita: 0, total: 3 }, bloqueioMotivo: "Aguardando parecer jurídico do processo licitatório", criadaEm: isoRel(-15) },
  { id: "t7", titulo: "Atualizar inventário de ativos de TI", descricao: "Conciliação patrimonial com o DPAT das estações e periféricos.", projetoId: null, status: "A Fazer", prioridade: "Normal", responsavelId: "u1", prazo: isoRel(12), etiquetas: ["Patrimônio"], checklist: { feita: 0, total: 6 }, criadaEm: isoRel(-3) },
  { id: "t8", titulo: "Preparar apresentação do Comitê de Governança", descricao: "Consolidar indicadores do trimestre para o comitê executivo.", projetoId: null, status: "Em Andamento", prioridade: "Alta", responsavelId: "u1", prazo: isoRel(2, 9), etiquetas: ["Governança"], checklist: { feita: 2, total: 5 }, criadaEm: isoRel(-5) },
  { id: "t9", titulo: "Configurar ambiente de homologação da nuvem", descricao: "Provisionar contas, redes e políticas na nuvem governamental (PoC).", projetoId: "p5", status: "A Fazer", prioridade: "Média", responsavelId: "u1", prazo: isoRel(15), etiquetas: ["Nuvem"], checklist: { feita: 0, total: 7 }, criadaEm: isoRel(-2) },
  { id: "t10", titulo: "Substituição de nobreak do rack 3", descricao: "Troca preventiva do nobreak com alerta de bateria.", projetoId: "p1", status: "Concluído", prioridade: "Urgente", responsavelId: "u4", prazo: isoRel(-3), etiquetas: ["Datacenter"], checklist: { feita: 3, total: 3 }, criadaEm: isoRel(-8) },
  { id: "t11", titulo: "Fusão de fibra entre Prefeitura e Almoxarifado", descricao: "Recomposição do anel óptico rompido em obra na Av. Central.", projetoId: "p3", status: "Em Andamento", prioridade: "Crítica", responsavelId: "u3", prazo: isoRel(0, 16), etiquetas: ["Redes"], checklist: { feita: 2, total: 4 }, criadaEm: isoRel(-4) },
  { id: "t12", titulo: "Instalar pontos de rede na nova recepção", descricao: "8 pontos de rede certificados na reforma da recepção central.", projetoId: null, status: "Aguardando", prioridade: "Normal", responsavelId: "u4", prazo: isoRel(9), etiquetas: ["Redes"], checklist: { feita: 1, total: 8 }, criadaEm: isoRel(-7) },
  { id: "t13", titulo: "Atualizar imagem corporativa das estações", descricao: "Nova imagem com Windows 11 e pacote de escritório homologado.", projetoId: "p6", status: "Bloqueado", prioridade: "Média", responsavelId: "u5", prazo: isoRel(6), etiquetas: ["Microinformática"], checklist: { feita: 2, total: 6 }, bloqueioMotivo: "Lote 2 da aquisição suspenso pelo Departamento de Compras", criadaEm: isoRel(-18) },
  { id: "t14", titulo: "Revisar política de senhas dos sistemas", descricao: "Adequação à norma de segurança com MFA para perfis administrativos.", projetoId: null, status: "Em Revisão", prioridade: "Alta", responsavelId: "u2", prazo: isoRel(4), etiquetas: ["Segurança"], checklist: { feita: 5, total: 5 }, criadaEm: isoRel(-11) },
  { id: "t15", titulo: "Migrar chamados históricos do help desk", descricao: "Importação de 12.400 chamados com saneamento de categorias.", projetoId: "p4", status: "Em Andamento", prioridade: "Normal", responsavelId: "u5", prazo: isoRel(8), etiquetas: ["Help Desk"], checklist: { feita: 4, total: 9 }, criadaEm: isoRel(-14) },
  { id: "t16", titulo: "Enlace 5G da UBS Jardim das Flores", descricao: "Instalação e teste de redundância do enlace da unidade.", projetoId: "p8", status: "Concluído", prioridade: "Alta", responsavelId: "u4", prazo: isoRel(-6), etiquetas: ["Saúde"], checklist: { feita: 4, total: 4 }, criadaEm: isoRel(-16) },
  { id: "t17", titulo: "Testes de carga do Portal de Serviços", descricao: "Simular 2.000 usuários simultâneos nos fluxos críticos.", projetoId: "p2", status: "A Fazer", prioridade: "Urgente", responsavelId: "u6", prazo: isoRel(6, 10), etiquetas: ["Performance"], checklist: { feita: 0, total: 5 }, criadaEm: isoRel(-1) },
  { id: "t18", titulo: "Backlog de manutenção preventiva — outubro", descricao: "Limpeza e verificação de 30 estações nas secretarias.", projetoId: null, status: "A Fazer", prioridade: "Baixa", responsavelId: "u5", prazo: isoRel(20), etiquetas: ["Manutenção"], checklist: { feita: 0, total: 30 }, criadaEm: isoRel(-2) },
];

/* ===================== Demandas ===================== */

const hist = (items: [number, string, string, string][]): HistoricoItem[] =>
  items.map(([d, u, a, de]) => ({ data: isoRel(d, 10), usuario: u, acao: a, detalhe: de }));

export const DEMANDAS_SEED: Demanda[] = [
  { id: "d1", protocolo: "DEM-2026-0341", tipo: "Solicitação de Acesso ao Sistema", descricao: "Acesso de consulta ao sistema de folha para nova servidora da chefia de gabinete.", solicitanteId: "u7", unidadeId: "un12", responsavelId: "u1", status: "Em Análise", prioridade: "Média", prazo: isoRel(2, 17), criadaEm: isoRel(-1, 8, 42), historico: hist([[-1, "Patrícia Nunes Castro", "Demanda aberta", "Solicitação registrada via Portal Interno."], [0, "Ana Beatriz Rocha", "Encaminhada para análise", "Verificação de perfil e necessidade de acesso."]]) },
  { id: "d2", protocolo: "DEM-2026-0338", tipo: "Manutenção de Computador", descricao: "Estação da sala de empenhos apresenta lentidão e travamentos ao emitir relatórios.", solicitanteId: "u9", unidadeId: "un2", responsavelId: "u5", status: "Em Atendimento", prioridade: "Alta", prazo: isoRel(1, 12), criadaEm: isoRel(-2, 14, 10), historico: hist([[-2, "Fernanda Castro Lima", "Demanda aberta", "Chamado registrado pelo ramal 6204."], [-1, "Mariana Lopes Siqueira", "Atendimento iniciado", "Diagnóstico remoto; agendada visita técnica."]]) },
  { id: "d3", protocolo: "DEM-2026-0335", tipo: "Criação de Usuário", descricao: "Criar usuários para 6 professores temporários no sistema educacional.", solicitanteId: "u10", unidadeId: "un3", responsavelId: "u1", status: "Aceita", prioridade: "Normal", prazo: isoRel(4), criadaEm: isoRel(-3, 9, 15), historico: hist([[-3, "João Pereira Neto", "Demanda aberta", "Lista de servidores anexada."], [-2, "Ana Beatriz Rocha", "Demanda aceita", "Cadastro em lote programado."]]) },
  { id: "d4", protocolo: "DEM-2026-0332", tipo: "Instalação de Ponto de Rede", descricao: "2 pontos de rede na sala de vacinação reformada da UBS Centro.", solicitanteId: "u11", unidadeId: "un4", responsavelId: "u4", status: "Aguardando", prioridade: "Média", prazo: isoRel(6), criadaEm: isoRel(-5), historico: hist([[-5, "Luciana Prado Teixeira", "Demanda aberta", ""], [-3, "Rafael Duarte Pinto", "Colocada em aguardo", "Aguardando liberação da sala pela engenharia."]]) },
  { id: "d5", protocolo: "DEM-2026-0329", tipo: "Solicitação de Relatório", descricao: "Relatório mensal de consumo de link de internet por secretaria (setembro).", solicitanteId: "u8", unidadeId: "un13", responsavelId: "u1", status: "Concluída", prioridade: "Normal", prazo: isoRel(-1), criadaEm: isoRel(-8), historico: hist([[-8, "Tiago Almeida Braga", "Demanda aberta", ""], [-6, "Ana Beatriz Rocha", "Atendimento iniciado", ""], [-1, "Ana Beatriz Rocha", "Demanda concluída", "Relatório enviado por e-mail (PDF e XLSX)."]]) },
  { id: "d6", protocolo: "DEM-2026-0327", tipo: "Solicitação de Equipamento", descricao: "Notebook para o setor de fiscalização de obras em deslocamento.", solicitanteId: "u13", unidadeId: "un6", responsavelId: null, status: "Nova", prioridade: "Alta", prazo: isoRel(5), criadaEm: isoRel(0, 8, 5), historico: hist([[0, "Renata Barbosa Farias", "Demanda aberta", "Solicitação registrada no balcão do DTI."]]) },
  { id: "d7", protocolo: "DEM-2026-0322", tipo: "Solicitação de Acesso ao Sistema", descricao: "Acesso administrativo ao Portal da Transparência para atualização de dados.", solicitanteId: "u9", unidadeId: "un2", responsavelId: "u1", status: "Em Análise", prioridade: "Alta", prazo: isoRel(1, 10), criadaEm: isoRel(-1, 16, 20), historico: hist([[-1, "Fernanda Castro Lima", "Demanda aberta", ""], [0, "Ana Beatriz Rocha", "Encaminhada para análise", "Validação com o gestor do portal."]]) },
  { id: "d8", protocolo: "DEM-2026-0318", tipo: "Manutenção de Computador", descricao: "Impressora do protocolo central atolando papel com frequência.", solicitanteId: "u8", unidadeId: "un13", responsavelId: "u5", status: "Concluída", prioridade: "Baixa", prazo: isoRel(-3), criadaEm: isoRel(-10), historico: hist([[-10, "Tiago Almeida Braga", "Demanda aberta", ""], [-9, "Mariana Lopes Siqueira", "Atendimento iniciado", ""], [-3, "Mariana Lopes Siqueira", "Demanda concluída", "Rolos de tração substituídos."]]) },
  { id: "d9", protocolo: "DEM-2026-0311", tipo: "Criação de Usuário", descricao: "Conta de e-mail institucional para estagiário do gabinete.", solicitanteId: "u12", unidadeId: "un5", responsavelId: null, status: "Recusada", prioridade: "Baixa", prazo: isoRel(-5), criadaEm: isoRel(-12), historico: hist([[-12, "Marcos Vinícius Sales", "Demanda aberta", ""], [-11, "Carlos Eduardo Menezes", "Demanda recusada", "Política de TI não prevê e-mail para estágio inferior a 6 meses."]]) },
  { id: "d10", protocolo: "DEM-2026-0305", tipo: "Instalação de Ponto de Rede", descricao: "Ponto de rede no quiosque de informação turística da rodoviária.", solicitanteId: "u12", unidadeId: "un5", responsavelId: null, status: "Cancelada", prioridade: "Normal", prazo: isoRel(-8), criadaEm: isoRel(-20), historico: hist([[-20, "Marcos Vinícius Sales", "Demanda aberta", ""], [-15, "Marcos Vinícius Sales", "Demanda cancelada", "Quiosque será relocado; nova solicitação será aberta."]]) },
  { id: "d11", protocolo: "DEM-2026-0344", tipo: "Solicitação de Relatório", descricao: "Painel de indicadores de atendimento das UBS para audiência pública.", solicitanteId: "u11", unidadeId: "un4", responsavelId: "u1", status: "Nova", prioridade: "Urgente", prazo: isoRel(2, 9), criadaEm: isoRel(0, 7, 50), historico: hist([[0, "Luciana Prado Teixeira", "Demanda aberta", "Audiência pública confirmada para a próxima semana."]]) },
  { id: "d12", protocolo: "DEM-2026-0300", tipo: "Solicitação de Equipamento", descricao: "Projetor e tela para a sala de treinamento da SEAD.", solicitanteId: "u7", unidadeId: "un12", responsavelId: "u5", status: "Em Atendimento", prioridade: "Normal", prazo: isoRel(7), criadaEm: isoRel(-6), historico: hist([[-6, "Patrícia Nunes Castro", "Demanda aberta", ""], [-4, "Mariana Lopes Siqueira", "Atendimento iniciado", "Cotação com 3 fornecedores em andamento."]]) },
];

/* ===================== Fluxos de trabalho ===================== */

export const FLUXOS_SEED: Fluxo[] = [
  { id: "f1", nome: "Atendimento de Demanda de TI", descricao: "Fluxo padrão de triagem, atendimento e encerramento das demandas de tecnologia.", ativo: true, instancias: 14, etapas: [ { id: "f1e1", nome: "Nova", papel: "Solicitante", slaHoras: 0 }, { id: "f1e2", nome: "Triagem", papel: "Responsável pela Equipe", slaHoras: 8 }, { id: "f1e3", nome: "Em Análise", papel: "Gerente de Projeto", slaHoras: 24 }, { id: "f1e4", nome: "Em Atendimento", papel: "Técnico Executor", slaHoras: 72 }, { id: "f1e5", nome: "Concluída", papel: "Solicitante", slaHoras: 24 } ] },
  { id: "f2", nome: "Solicitação de Compras de TI", descricao: "Aquisições de bens e serviços de tecnologia com parecer técnico e aprovação orçamentária.", ativo: true, instancias: 6, etapas: [ { id: "f2e1", nome: "Registro do Pedido", papel: "Unidade Solicitante", slaHoras: 0 }, { id: "f2e2", nome: "Parecer Técnico", papel: "DTI", slaHoras: 48 }, { id: "f2e3", nome: "Reserva Orçamentária", papel: "SEFAZ", slaHoras: 72 }, { id: "f2e4", nome: "Licitação / Compra", papel: "Departamento de Compras", slaHoras: 480 }, { id: "f2e5", nome: "Recebimento", papel: "Departamento de Patrimônio", slaHoras: 120 } ] },
  { id: "f3", nome: "Homologação de Sistemas", descricao: "Ambientes, testes e aprovação para implantação de novas versões em produção.", ativo: true, instancias: 3, etapas: [ { id: "f3e1", nome: "Registro da Versão", papel: "Equipe de Sistemas", slaHoras: 0 }, { id: "f3e2", nome: "Testes de Homologação", papel: "Gerente de Projeto", slaHoras: 120 }, { id: "f3e3", nome: "Aprovação", papel: "Responsável pela Unidade", slaHoras: 48 }, { id: "f3e4", nome: "Implantação", papel: "Equipe de Infraestrutura", slaHoras: 24 } ] },
  { id: "f4", nome: "Gestão de Contratos de TI", descricao: "Fiscalização, medições e renovações dos contratos de tecnologia vigentes.", ativo: false, instancias: 0, etapas: [ { id: "f4e1", nome: "Medição Mensal", papel: "Fiscal do Contrato", slaHoras: 120 }, { id: "f4e2", nome: "Ateste", papel: "Responsável pela Unidade", slaHoras: 72 }, { id: "f4e3", nome: "Pagamento", papel: "SEFAZ", slaHoras: 240 } ] },
];

/* ===================== Documentos, riscos, notificações, agenda, auditoria ===================== */

export const DOCUMENTOS_SEED: Documento[] = [
  { id: "doc1", nome: "Política de Segurança da Informação", categoria: "Política", tipoArquivo: "PDF", versao: "3.2", status: "Em vigor", atualizadoEm: isoRel(-30), responsavelId: "u2", tamanho: "1,4 MB" },
  { id: "doc2", nome: "Manual do Portal de Serviços", categoria: "Manual", tipoArquivo: "PDF", versao: "1.0", status: "Em revisão", atualizadoEm: isoRel(-4), responsavelId: "u1", tamanho: "6,8 MB" },
  { id: "doc3", nome: "Plano de Continuidade de Negócios — TI", categoria: "Plano", tipoArquivo: "DOCX", versao: "2.1", status: "Em vigor", atualizadoEm: isoRel(-75), responsavelId: "u2", tamanho: "2,2 MB" },
  { id: "doc4", nome: "Norma de Uso de Correio Eletrônico", categoria: "Norma", tipoArquivo: "PDF", versao: "1.3", status: "Em vigor", atualizadoEm: isoRel(-140), responsavelId: "u2", tamanho: "480 KB" },
  { id: "doc5", nome: "Ata do Comitê de Governança de TI — Agosto", categoria: "Ata", tipoArquivo: "PDF", versao: "—", status: "Aprovado", atualizadoEm: isoRel(-12), responsavelId: "u1", tamanho: "310 KB" },
  { id: "doc6", nome: "Inventário de Ativos de TI — 2026", categoria: "Inventário", tipoArquivo: "XLSX", versao: "4.0", status: "Em revisão", atualizadoEm: isoRel(-2), responsavelId: "u5", tamanho: "3,1 MB" },
  { id: "doc7", nome: "Termo de Confidencialidade — Modelo", categoria: "Termo", tipoArquivo: "DOCX", versao: "2.0", status: "Em vigor", atualizadoEm: isoRel(-200), responsavelId: "u7", tamanho: "120 KB" },
  { id: "doc8", nome: "Guia de Identidade Digital do Município", categoria: "Guia", tipoArquivo: "PPTX", versao: "1.1", status: "Obsoleto", atualizadoEm: isoRel(-400), responsavelId: "u12", tamanho: "18,5 MB" },
];

export const RISCOS_SEED: Risco[] = [
  { id: "r1", titulo: "Interrupção do link principal de internet", descricao: "Queda do circuito de 2 Gbps que atende o paço municipal e secretarias.", categoria: "Tecnológico", probabilidade: 3, impacto: 5, tendencia: "Estável", nivel: "Crítico", mitigacao: "Contratação de link redundante com operadora distinta e failover automático.", responsavelId: "u3", projetoId: "p3" },
  { id: "r2", titulo: "Perda de dados por falha de backup", descricao: "Falha silenciosa nas rotinas de backup dos sistemas de arrecadação.", categoria: "Tecnológico", probabilidade: 2, impacto: 5, tendencia: "Diminuindo", nivel: "Monitorando", mitigacao: "Implantação de verificação automática de integridade e cópia em nuvem.", responsavelId: "u4", projetoId: "p1" },
  { id: "r3", titulo: "Atraso na licitação de switches", descricao: "Recursos administrativos podem postergar a aquisição do lote 2.", categoria: "Financeiro", probabilidade: 4, impacto: 3, tendencia: "Subindo", nivel: "Crítico", mitigacao: "Acompanhamento jurídico semanal e plano alternativo de locação.", responsavelId: "u8", projetoId: "p3" },
  { id: "r4", titulo: "Indisponibilidade de pessoal-chave", descricao: "Equipe enxuta com dependência de dois servidores especialistas em redes.", categoria: "Operacional", probabilidade: 3, impacto: 3, tendencia: "Estável", nivel: "Monitorando", mitigacao: "Programa de pareamento técnico e documentação de procedimentos.", responsavelId: "u2", projetoId: null },
  { id: "r5", titulo: "Não conformidade com a LGPD", descricao: "Sistemas legados tratam dados pessoais sem registro de operações.", categoria: "Conformidade", probabilidade: 3, impacto: 4, tendencia: "Diminuindo", nivel: "Monitorando", mitigacao: "Inventário de dados pessoais e adequação gradual dos sistemas legados.", responsavelId: "u2", projetoId: null },
  { id: "r6", titulo: "Estouro do orçamento do datacenter", descricao: "Variação cambial nos componentes importados de armazenamento.", categoria: "Financeiro", probabilidade: 2, impacto: 3, tendencia: "Estável", nivel: "Mitigado", mitigacao: "Contratos com preço fixado em reais e reserva de contingência de 10%.", responsavelId: "u9", projetoId: "p1" },
  { id: "r7", titulo: "Ataque de ransomware à rede municipal", descricao: "Ciframento de servidores e estações por grupo criminoso.", categoria: "Tecnológico", probabilidade: 2, impacto: 5, tendencia: "Subindo", nivel: "Crítico", mitigacao: "EDR em todas as estações, backups imutáveis e campanha de conscientização.", responsavelId: "u2", projetoId: null },
  { id: "r8", titulo: "Baixa adesão ao novo help desk", descricao: "Servidores continuando a acionar o suporte por telefone/WhatsApp.", categoria: "Operacional", probabilidade: 4, impacto: 2, tendencia: "Estável", nivel: "Mitigado", mitigacao: "Treinamentos por secretaria e comunicação interna com canais oficiais.", responsavelId: "u5", projetoId: "p4" },
];

export const NOTIFICACOES_SEED: Notificacao[] = [
  { id: "n1", titulo: "Tarefa atribuída", detalhe: "“Integrar protocolo digital ao Portal” está com prazo em 5 dias.", lida: false, data: isoRel(0, 8, 12), tom: "azul" },
  { id: "n2", titulo: "Demanda aguardando análise", detalhe: "DEM-2026-0341 — Solicitação de Acesso ao Sistema (DRH).", lida: false, data: isoRel(0, 7, 55), tom: "ciano" },
  { id: "n3", titulo: "Prazo vencido", detalhe: "“Aprovar especificação de switches do lote 2” está em atraso.", lida: false, data: isoRel(-1, 18, 30), tom: "vermelho" },
  { id: "n4", titulo: "Aprovação pendente", detalhe: "Manual do Portal de Serviços (v1.0) aguarda sua revisão.", lida: false, data: isoRel(-1, 16, 4), tom: "ambar" },
  { id: "n5", titulo: "Tarefa concluída", detalhe: "Eduardo Sá concluiu “Mapear serviços para o Portal de Serviços”.", lida: true, data: isoRel(-2, 11, 22), tom: "verde" },
  { id: "n6", titulo: "Reunião do Comitê de Governança", detalhe: "Confirmada para a próxima quinta-feira às 10h, sala 3.", lida: true, data: isoRel(-3, 9, 40), tom: "cinza" },
];

export const EVENTOS_SEED: EventoAgenda[] = [
  { id: "ev1", titulo: "Comitê de Governança de TI", data: isoData(2), hora: "10:00", tipo: "Comitê" },
  { id: "ev2", titulo: "Daily — Equipe de Sistemas", data: isoData(0), hora: "09:15", tipo: "Reunião" },
  { id: "ev3", titulo: "Daily — Equipe de Sistemas", data: isoData(1), hora: "09:15", tipo: "Reunião" },
  { id: "ev4", titulo: "Entrega: Integração do Protocolo", data: isoData(5), hora: "12:00", tipo: "Entrega" },
  { id: "ev5", titulo: "Treinamento do Help Desk — SEMED", data: isoData(6), hora: "14:00", tipo: "Treinamento" },
  { id: "ev6", titulo: "Vistoria UBS Jardim Europa", data: isoData(4), hora: "09:00", tipo: "Reunião" },
  { id: "ev7", titulo: "Apresentação do Portal à Imprensa", data: isoData(11), hora: "11:00", tipo: "Comitê" },
  { id: "ev8", titulo: "Revisão do Plano de Contingência", data: isoData(1), hora: "18:00", tipo: "Prazo" },
  { id: "ev9", titulo: "Janela de manutenção do datacenter", data: isoData(8), hora: "22:00", tipo: "Entrega" },
  { id: "ev10", titulo: "Prazo: Audiência pública SESAU", data: isoData(2), hora: "09:00", tipo: "Prazo" },
];

export const AUDITORIA_SEED: Auditoria[] = [
  { id: "a1", dataHora: isoRel(0, 8, 12), usuario: "Ana Beatriz Rocha", acao: "Movimentação de tarefa", objeto: "Tarefa t2", detalhe: "Status alterado para Em Andamento", ip: "10.0.4.21" },
  { id: "a2", dataHora: isoRel(0, 7, 55), usuario: "Luciana Prado Teixeira", acao: "Abertura de demanda", objeto: "DEM-2026-0344", detalhe: "Solicitação de Relatório — SESAU", ip: "10.0.9.14" },
  { id: "a3", dataHora: isoRel(0, 7, 41), usuario: "sistema", acao: "Backup automático", objeto: "Base de dados", detalhe: "Backup diário concluído (42,1 GB) em 18 min", ip: "127.0.0.1" },
  { id: "a4", dataHora: isoRel(-1, 17, 26), usuario: "Mariana Lopes Siqueira", acao: "Atualização de demanda", objeto: "DEM-2026-0338", detalhe: "Visita técnica agendada", ip: "10.0.4.33" },
  { id: "a5", dataHora: isoRel(-1, 16, 4), usuario: "Ana Beatriz Rocha", acao: "Envio de documento", objeto: "Manual do Portal de Serviços", detalhe: "Versão 1.0 enviada para revisão", ip: "10.0.4.21" },
  { id: "a6", dataHora: isoRel(-1, 14, 52), usuario: "Carlos Eduardo Menezes", acao: "Alteração de perfil de acesso", objeto: "Usuário eduardo.sa", detalhe: "Perfil alterado para Visualizador", ip: "10.0.4.10" },
  { id: "a7", dataHora: isoRel(-1, 11, 8), usuario: "Rafael Duarte Pinto", acao: "Movimentação de tarefa", objeto: "Tarefa t11", detalhe: "Status alterado para Em Andamento", ip: "10.0.4.29" },
  { id: "a8", dataHora: isoRel(-2, 15, 33), usuario: "Ana Beatriz Rocha", acao: "Criação de projeto", objeto: "PRJ-2026-009", detalhe: "Rede de Dados das Unidades de Saúde", ip: "10.0.4.21" },
  { id: "a9", dataHora: isoRel(-2, 10, 2), usuario: "sistema", acao: "Tentativa de acesso", objeto: "Usuário luciana.prado", detalhe: "Conta suspensa — acesso negado (3 tentativas)", ip: "10.0.9.14" },
  { id: "a10", dataHora: isoRel(-3, 16, 45), usuario: "Tiago Almeida Braga", acao: "Aprovação de ata", objeto: "Ata do Comitê — Agosto", detalhe: "Documento aprovado e publicado", ip: "10.0.5.8" },
];

export const MODULOS_PERMISSAO = [
  "Painel e Indicadores", "Projetos", "Tarefas", "Demandas", "Fluxos de Trabalho",
  "Equipes e Organograma", "Documentos", "Riscos", "Relatórios", "Administração",
];
export const ACOES_PERMISSAO = ["Visualizar", "Criar / Editar", "Aprovar", "Administrar"];

const linha = (v: number): boolean[] => ACOES_PERMISSAO.map((_, i) => i < v);

export const PERFIS_SEED: PerfilAcesso[] = [
  { nome: "Administrador", descricao: "Acesso total ao sistema, incluindo Administração e Configurações.", matriz: Object.fromEntries(MODULOS_PERMISSAO.map((m) => [m, linha(4)])) },
  { nome: "Gerente de Projeto", descricao: "Gerencia projetos, tarefas, demandas e documentos sob sua responsabilidade.", matriz: Object.fromEntries(MODULOS_PERMISSAO.map((m) => [m, m === "Administração" ? linha(1) : linha(3)])) },
  { nome: "Responsável pela Equipe", descricao: "Coordena as tarefas da equipe e atende demandas operacionais.", matriz: Object.fromEntries(MODULOS_PERMISSAO.map((m) => [m, ["Administração", "Riscos"].includes(m) ? linha(1) : linha(2)])) },
  { nome: "Responsável pela Unidade", descricao: "Acompanha indicadores e aprova entregas da sua unidade administrativa.", matriz: Object.fromEntries(MODULOS_PERMISSAO.map((m) => [m, ["Administração"].includes(m) ? linha(0) : ["Relatórios", "Painel e Indicadores"].includes(m) ? linha(3) : linha(2)])) },
  { nome: "Visualizador", descricao: "Consulta painéis, projetos e documentos, sem permissão de edição.", matriz: Object.fromEntries(MODULOS_PERMISSAO.map((m) => [m, linha(1)])) },
];

/* ===================== Séries para gráficos ===================== */

export const SERIE_MENSAL = [
  { mes: "jan", planejado: 16, entregue: 13, demandas: 48 },
  { mes: "fev", planejado: 18, entregue: 17, demandas: 52 },
  { mes: "mar", planejado: 20, entregue: 18, demandas: 61 },
  { mes: "abr", planejado: 17, entregue: 19, demandas: 55 },
  { mes: "mai", planejado: 22, entregue: 20, demandas: 66 },
  { mes: "jun", planejado: 24, entregue: 21, demandas: 71 },
  { mes: "jul", planejado: 21, entregue: 23, demandas: 58 },
  { mes: "ago", planejado: 25, entregue: 22, demandas: 74 },
  { mes: "set", planejado: 26, entregue: 26, demandas: 80 },
  { mes: "out", planejado: 24, entregue: 27, demandas: 69 },
  { mes: "nov", planejado: 28, entregue: 25, demandas: 77 },
  { mes: "dez", planejado: 23, entregue: 24, demandas: 63 },
];

export const DEMANDAS_POR_UNIDADE = [
  { sigla: "SEAD", abertas: 42, concluidas: 38 },
  { sigla: "SEFAZ", abertas: 31, concluidas: 29 },
  { sigla: "SEMED", abertas: 36, concluidas: 27 },
  { sigla: "SESAU", abertas: 44, concluidas: 36 },
  { sigla: "SETUR", abertas: 12, concluidas: 11 },
  { sigla: "SEOB", abertas: 23, concluidas: 18 },
];

export const SLA_POR_EQUIPE = [
  { equipe: "Infraestrutura", sla: 91 },
  { equipe: "Suporte", sla: 96 },
  { equipe: "Sistemas", sla: 88 },
  { equipe: "Redes", sla: 93 },
];

export const RELATORIOS_MODELOS = [
  { id: "rp1", nome: "Execução Orçamentária por Projeto", descricao: "Orçado × executado com projeção de consumo até o fim do exercício.", categoria: "Financeiro" },
  { id: "rp2", nome: "Produtividade por Equipe", descricao: "Tarefas concluídas, tempo médio e carga de trabalho por equipe do DTI.", categoria: "Desempenho" },
  { id: "rp3", nome: "SLA de Demandas por Secretaria", descricao: "Percentual de demandas atendidas dentro do prazo por unidade solicitante.", categoria: "Atendimento" },
  { id: "rp4", nome: "Matriz de Riscos Críticos", descricao: "Riscos com nível crítico, tendências e planos de mitigação vigentes.", categoria: "Governança" },
  { id: "rp5", nome: "Entregas do Trimestre", descricao: "Consolidado de entregas de projetos por secretaria no período.", categoria: "Desempenho" },
  { id: "rp6", nome: "Inventário e Patrimônio de TI", descricao: "Ativos por unidade, estado de conservação e valor contábil.", categoria: "Patrimônio" },
];

export const COMUNICADOS = [
  "Janela de manutenção do datacenter confirmada para sexta-feira, das 22h às 2h — sistemas indisponíveis.",
  "Novo fluxo de homologação de sistemas em vigor a partir da próxima segunda-feira.",
  "Audiência pública da SESAU: painéis de indicadores devem estar consolidados até quinta-feira.",
  "Campanha de conscientização em segurança da informação: responda ao questionário obrigatório.",
];

/* ===================== RBAC — perfis e permissões ===================== */

export interface Permissao { chave: string; rotulo: string; }

export const PERMISSOES: Permissao[] = [
  { chave: "organization.view", rotulo: "Visualizar organização" },
  { chave: "organization.manage", rotulo: "Gerenciar organização" },
  { chave: "administrativeUnit.manage", rotulo: "Gerenciar unidades administrativas" },
  { chave: "user.manage", rotulo: "Gerenciar usuários" },
  { chave: "team.manage", rotulo: "Gerenciar equipes" },
  { chave: "project.view", rotulo: "Visualizar projetos e tarefas" },
  { chave: "project.create", rotulo: "Criar projetos" },
  { chave: "task.manage", rotulo: "Gerenciar tarefas" },
  { chave: "comunicacao.view", rotulo: "Comunicação interna" },
  { chave: "ticket.create", rotulo: "Abrir chamados" },
  { chave: "ticket.manage", rotulo: "Gerenciar central de serviços" },
  { chave: "ticket.approve", rotulo: "Aprovar solicitações" },
  { chave: "asset.view", rotulo: "Visualizar patrimônio de TI" },
  { chave: "asset.manage", rotulo: "Gerenciar patrimônio de TI" },
  { chave: "workflow.manage", rotulo: "Gerenciar fluxos de trabalho" },
  { chave: "report.view", rotulo: "Visualizar relatórios e indicadores" },
  { chave: "audit.view", rotulo: "Visualizar auditoria" },
  { chave: "system.configure", rotulo: "Configurar o sistema" },
];

export const PERFIS_RBAC: Record<string, string[]> = {
  "Super Administrador": ["*"],
  "Administrador do Sistema": ["*"],
  "Secretário": ["organization.view", "comunicacao.view", "project.view", "ticket.create", "ticket.approve", "report.view", "report.generate", "report.export", "asset.view", "indicadores", "organizationChart.view", "team.edit", "password.change"],
  "Diretor": ["organization.view", "comunicacao.view", "project.view", "ticket.create", "ticket.approve", "report.view", "report.generate", "report.export", "asset.view", "organizationChart.view", "team.edit", "password.change"],
  "Coordenador": ["organization.view", "comunicacao.view", "project.view", "ticket.create", "ticket.approve", "report.view", "report.generate", "report.export", "asset.view", "organizationChart.view", "team.edit", "password.change"],
  "Gestor": ["organization.view", "comunicacao.view", "project.view", "project.create", "task.manage", "ticket.create", "ticket.approve", "report.view", "report.generate", "report.export", "asset.view", "workflow.manage", "team.create", "team.edit", "team.members.manage", "organizationChart.view", "password.change"],
  "Gerente de Projeto": ["organization.view", "comunicacao.view", "project.view", "project.create", "task.manage", "ticket.create", "report.view", "report.generate", "report.export", "asset.view", "workflow.manage", "team.edit", "team.members.manage", "organizationChart.view", "password.change"],
  "Líder de Equipe": ["organization.view", "comunicacao.view", "project.view", "task.manage", "ticket.create", "ticket.manage", "asset.view", "report.view", "report.generate", "team.members.manage", "organizationChart.view", "password.change"],
  "Técnico de TI": ["organization.view", "comunicacao.view", "project.view", "ticket.create", "ticket.manage", "asset.view", "asset.manage", "report.view", "report.generate", "security.incident.create", "password.change"],
  "Servidor": ["organization.view", "comunicacao.view", "project.view", "ticket.create", "asset.view", "password.change"],
  "Visualizador": ["organization.view", "comunicacao.view", "project.view", "asset.view", "report.view", "password.change"],
  "Gestor de Segurança da Informação": [
    "organization.view", "comunicacao.view", "project.view", "asset.view", "report.view", "report.generate", "report.export",
    "security.dashboard.view", "security.topology.view", "security.topology.manage", "security.firewall.view", "security.firewall.manage",
    "security.network.view", "security.network.manage", "security.incident.create", "security.incident.manage",
    "security.vulnerability.manage", "security.backup.view", "security.policy.manage", "security.credential.view",
    "security.credential.manage", "security.audit.view", "passwordPolicy.manage", "password.reset", "organizationChart.view",
  ],
  "Analista de Segurança": [
    "organization.view", "comunicacao.view", "project.view", "report.view", "report.generate",
    "security.dashboard.view", "security.topology.view", "security.firewall.view", "security.network.view",
    "security.incident.create", "security.incident.manage", "security.vulnerability.manage", "security.backup.view",
    "security.policy.manage", "security.credential.view", "security.audit.view", "password.change",
  ],
  "Auditor de Segurança": [
    "organization.view", "report.view", "report.generate", "report.export", "asset.view",
    "security.dashboard.view", "security.topology.view", "security.firewall.view", "security.network.view",
    "security.backup.view", "security.audit.view",
  ],
  "Administrador de Infraestrutura": [
    "organization.view", "comunicacao.view", "project.view", "ticket.create", "ticket.manage", "asset.view", "asset.manage",
    "report.view", "report.generate", "security.dashboard.view", "security.topology.view", "security.topology.manage",
    "security.firewall.view", "security.firewall.manage", "security.network.view", "security.network.manage",
    "security.backup.view", "security.incident.create", "organizationChart.view", "password.change",
  ],
};

export function temPermissaoPerfil(perfil: string, chave: string): boolean {
  const lista = PERFIS_RBAC[perfil];
  if (!lista) return false;
  return lista.includes("*") || lista.includes(chave);
}

/** Permissão mínima exigida por item de menu. */
export const NAV_PERMISSOES: Record<string, string> = {
  painel: "organization.view", "minha-area": "organization.view", comunicacao: "comunicacao.view",
  "central-ti": "ticket.create", patrimonio: "asset.view", projetos: "project.view",
  tarefas: "project.view", demandas: "project.view", fluxos: "project.view", equipes: "organization.view",
  organograma: "organization.view", calendario: "organization.view", documentos: "organization.view",
  indicadores: "report.view", riscos: "report.view", relatorios: "report.view",
  administracao: "system.configure", configuracoes: "system.configure",
  seguranca: "security.dashboard.view", monitoramento: "report.view",
};

/* ===================== Comunicação interna ===================== */

export interface Canal {
  id: string; nome: string; descricao: string;
  visibilidade: "Público" | "Restrito" | "Privado";
  membros: string[]; direto?: boolean;
}
export interface AnexoMsg { nome: string; tamanho: string; }
export interface Mensagem {
  id: string; canalId: string; autorId: string; texto: string; data: string;
  reacoes: Record<string, string[]>; fixada?: boolean; anexos?: AnexoMsg[];
}
export interface ComunicadoEnt {
  id: string; titulo: string; mensagem: string; autorId: string;
  alvo: string; prioridade: "Normal" | "Importante" | "Urgente";
  publicadaEm: string; expiraEm: string; lidoPor: string[];
}

export const CANAIS_SEED: Canal[] = [
  { id: "c1", nome: "geral", descricao: "Comunicação geral da Prefeitura", visibilidade: "Público", membros: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10", "u12", "u13"] },
  { id: "c2", nome: "avisos", descricao: "Comunicados oficiais da administração", visibilidade: "Restrito", membros: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10", "u12", "u13"] },
  { id: "c3", nome: "ti", descricao: "Assuntos do Departamento de TI", visibilidade: "Público", membros: ["u1", "u2", "u3", "u4", "u5", "u6"] },
  { id: "c4", nome: "infraestrutura", descricao: "Canal automático — Equipe de Infraestrutura", visibilidade: "Privado", membros: ["u4", "u3", "u2"] },
  { id: "c5", nome: "sistemas", descricao: "Canal automático — Equipe de Sistemas", visibilidade: "Privado", membros: ["u1", "u6", "u2"] },
  { id: "c6", nome: "projeto-portal-cidadao", descricao: "Canal automático — Projeto Portal de Serviços", visibilidade: "Restrito", membros: ["u1", "u6", "u2", "u5"] },
  { id: "dm1", nome: "Conversa com Carlos Eduardo Menezes", descricao: "Mensagem direta", visibilidade: "Privado", membros: ["u1", "u2"], direto: true },
  { id: "dm2", nome: "Conversa com Mariana Lopes Siqueira", descricao: "Mensagem direta", visibilidade: "Privado", membros: ["u1", "u5"], direto: true },
];

export const MENSAGENS_SEED: Mensagem[] = [
  { id: "m1", canalId: "c1", autorId: "u2", texto: "Bom dia a todos! Lembro que a janela de manutenção do datacenter será sexta-feira, das 22h às 2h. Sistemas de arrecadação ficarão indisponíveis.", data: isoRel(-1, 8, 32), reacoes: { "👍": ["u1", "u3", "u7"], "✅": ["u5"] }, fixada: true },
  { id: "m2", canalId: "c1", autorId: "u7", texto: "Obrigada pelo aviso, Carlos. O RH vai programar o fechamento da folha antes da janela.", data: isoRel(-1, 8, 47), reacoes: { "👍": ["u2"] } },
  { id: "m3", canalId: "c1", autorId: "u9", texto: "A SEFAZ precisa do relatório de consumo de link até quinta. @Ana Beatriz Rocha consegue adiantar?", data: isoRel(0, 7, 58), reacoes: {} },
  { id: "m4", canalId: "c1", autorId: "u1", texto: "Consigo sim, Fernanda. Entrego amanhã no fim do dia com o detalhamento por secretaria.", data: isoRel(0, 8, 5), reacoes: { "🙏": ["u9"] } },
  { id: "m5", canalId: "c3", autorId: "u2", texto: "Pessoal, o novo fluxo de homologação de sistemas entra em vigor segunda. Leiam a documentação no módulo de Documentos.", data: isoRel(-1, 14, 12), reacoes: { "✅": ["u1", "u3", "u4", "u5"] }, fixada: true },
  { id: "m6", canalId: "c3", autorId: "u4", texto: "Cluster de virtualização homologado com sucesso. Testes de failover passaram em 4 min.", data: isoRel(0, 9, 24), reacoes: { "🎉": ["u1", "u2", "u3"], "👍": ["u5", "u6"] } },
  { id: "m7", canalId: "c3", autorId: "u3", texto: "Rompimento de fibra na Av. Central em recomposição. Previsão de normalização às 16h. Acompanhem pelo chamado TI-2026-000005.", data: isoRel(0, 10, 3), reacoes: { "👀": ["u2", "u4"] } },
  { id: "m8", canalId: "c4", autorId: "u4", texto: "Nobreak do rack 3 substituído. Próxima preventiva dos racks 1 e 2 agendada para a janela de sexta.", data: isoRel(-1, 16, 40), reacoes: { "👍": ["u3"] } },
  { id: "m9", canalId: "c5", autorId: "u1", texto: "Integração do protocolo digital com o Portal concluída em homologação. Deploy em produção depende do comitê.", data: isoRel(0, 9, 41), reacoes: { "🎉": ["u6", "u2"] } },
  { id: "m10", canalId: "c6", autorId: "u6", texto: "Protótipo da área de agendamentos pronto para revisão. Marquem a review com a SEMED e a SESAU.", data: isoRel(-1, 15, 18), reacoes: {} },
  { id: "m11", canalId: "dm1", autorId: "u2", texto: "Ana, consegue revisar a política de senhas antes do comitê de quinta?", data: isoRel(0, 8, 20), reacoes: {} },
  { id: "m12", canalId: "dm1", autorId: "u1", texto: "Já revisei e ajustei o item de MFA. Te envio a versão final ainda hoje.", data: isoRel(0, 8, 26), reacoes: { "👍": ["u2"] } },
  { id: "m13", canalId: "dm2", autorId: "u5", texto: "Ana, o lote 2 da aquisição de estações continua suspenso. Sigo com a imagem corporativa?", data: isoRel(0, 9, 2), reacoes: {} },
];

export const COMUNICADOS_SEED: ComunicadoEnt[] = [
  { id: "co1", titulo: "Janela de manutenção do datacenter", mensagem: "Nesta sexta-feira, das 22h às 2h, o datacenter municipal passará por manutenção preventiva. Sistemas de arrecadação, folha e protocolo ficarão indisponíveis. Programem-se.", autorId: "u2", alvo: "Toda a organização", prioridade: "Importante", publicadaEm: isoRel(-1, 9, 0), expiraEm: isoData(3), lidoPor: ["u1", "u3", "u4", "u5", "u6", "u7", "u9"] },
  { id: "co2", titulo: "Campanha de conscientização em segurança", mensagem: "Todos os servidores devem responder ao questionário obrigatório de segurança da informação até o fim do mês. O link está disponível no Portal Interno.", autorId: "u2", alvo: "Toda a organização", prioridade: "Normal", publicadaEm: isoRel(-4, 10, 30), expiraEm: isoData(16), lidoPor: ["u1", "u3", "u5", "u7"] },
  { id: "co3", titulo: "Novo fluxo de homologação de sistemas", mensagem: "A partir de segunda-feira, toda versão de sistema deverá passar pelo fluxo formal de homologação, com testes registrados e aprovação do gestor da área.", autorId: "u1", alvo: "Departamento de Tecnologia da Informação", prioridade: "Normal", publicadaEm: isoRel(-2, 11, 15), expiraEm: isoData(9), lidoPor: ["u2", "u3", "u4", "u5", "u6"] },
  { id: "co4", titulo: "Instabilidade no link de internet", mensagem: "Identificamos instabilidade no circuito principal. O failover foi acionado e a operadora já está atuando. Priorizem serviços críticos.", autorId: "u3", alvo: "Secretaria Municipal de Administração", prioridade: "Urgente", publicadaEm: isoRel(0, 10, 12), expiraEm: isoData(1), lidoPor: ["u1", "u4", "u5"] },
];

/* ===================== Central de Serviços de TI ===================== */

export const STATUS_CHAMADO: { label: string; tom: Tom; hex: string }[] = [
  { label: "Aberto", tom: "azul", hex: "#20659f" },
  { label: "Aguardando Aprovação", tom: "ambar", hex: "#b4690e" },
  { label: "Aprovado", tom: "verde", hex: "#1e7a54" },
  { label: "Rejeitado", tom: "vermelho", hex: "#b3402a" },
  { label: "Em Triagem", tom: "ciano", hex: "#0e7490" },
  { label: "Atribuído", tom: "azul", hex: "#1b5583" },
  { label: "Em Atendimento", tom: "amarelo", hex: "#7a5a00" },
  { label: "Aguardando Usuário", tom: "ambar", hex: "#8f5409" },
  { label: "Aguardando Terceiro", tom: "ambar", hex: "#8f5409" },
  { label: "Aguardando Peça", tom: "ambar", hex: "#8f5409" },
  { label: "Resolvido", tom: "pinho", hex: "#0e4a2f" },
  { label: "Fechado", tom: "cinza", hex: "#4d5c53" },
  { label: "Cancelado", tom: "cinza", hex: "#4d5c53" },
];

export const TIPO_CHAMADO = ["Incidente", "Solicitação de Serviço"] as const;

export interface CategoriaPortal { id: string; nome: string; icone: string; descricao: string; }

export const CATEGORIAS_PORTAL: CategoriaPortal[] = [
  { id: "cat1", nome: "Computador e Notebook", icone: "monitor", descricao: "Problemas e solicitações de estações de trabalho" },
  { id: "cat2", nome: "Impressoras", icone: "impressora", descricao: "Instalação, atolamento, toner e drivers" },
  { id: "cat3", nome: "Internet e Rede", icone: "rede", descricao: " Lentidão, queda de conexão e pontos de rede" },
  { id: "cat4", nome: "Usuários e Senhas", icone: "usuario", descricao: "Criação de contas e redefinição de senhas" },
  { id: "cat5", nome: "Sistemas", icone: "sistema", descricao: "Acesso e problemas nos sistemas municipais" },
  { id: "cat6", nome: "Wi-Fi", icone: "wifi", descricao: "Cobertura, credenciais e acesso de visitantes" },
  { id: "cat7", nome: "Telefonia", icone: "fone", descricao: "Ramais, telefones IP e linhas externas" },
  { id: "cat8", nome: "Instalação de Software", icone: "caixa", descricao: "Softwares homologados e licenças" },
  { id: "cat9", nome: "Acesso a Sistemas", icone: "cadeado", descricao: "Perfis, privilégios e autorizações" },
  { id: "cat10", nome: "Equipamentos", icone: "cpu", descricao: "Solicitação e troca de equipamentos" },
  { id: "cat11", nome: "Periféricos", icone: "periferico", descricao: "Teclados, mouses, webcams e monitores" },
  { id: "cat12", nome: "Arquivos e Pastas", icone: "pasta", descricao: "Pastas de rede, permissões e recuperação" },
  { id: "cat13", nome: "Outros", icone: "info", descricao: "Demais atendimentos de TI" },
];

export interface GrupoSuporte {
  id: string; nome: string; membroIds: string[];
  dominioId?: string; sigla?: string; gestorId?: string; horario?: string;
  estrategiaAtribuicao?: "Manual" | "Round Robin" | "Menor número de chamados ativos" | "Técnico padrão do serviço";
  permiteAtribAuto?: boolean; permiteSelecaoTecnico?: "Não" | "Opcional" | "Obrigatório" | "Somente Gestores";
  categoriasAtendidas?: string[];
}
export const GRUPOS_SUPORTE_SEED: GrupoSuporte[] = [
  { id: "g1", nome: "Suporte Técnico", membroIds: ["u5"] },
  { id: "g2", nome: "Infraestrutura", membroIds: ["u4"] },
  { id: "g3", nome: "Redes", membroIds: ["u3"] },
  { id: "g4", nome: "Sistemas", membroIds: ["u1", "u6"] },
  { id: "g5", nome: "Segurança da Informação", membroIds: ["u2"] },
  { id: "g6", nome: "Telefonia", membroIds: ["u5"] },
];

export interface RegraSLA { prioridade: string; primeiraRespostaMin: number; resolucaoHoras: number; }
export const REGRAS_SLA_SEED: RegraSLA[] = [
  { prioridade: "Crítica", primeiraRespostaMin: 15, resolucaoHoras: 2 },
  { prioridade: "Urgente", primeiraRespostaMin: 30, resolucaoHoras: 4 },
  { prioridade: "Alta", primeiraRespostaMin: 60, resolucaoHoras: 8 },
  { prioridade: "Normal", primeiraRespostaMin: 240, resolucaoHoras: 24 },
  { prioridade: "Baixa", primeiraRespostaMin: 480, resolucaoHoras: 48 },
];

export interface EtapaAprovacao {
  id: string; nome: string;
  tipoAprovador: "Usuário específico" | "Gestor da unidade" | "Gestor da secretaria" | "Perfil" | "Grupo";
  aprovador: string; obrigatoria: boolean; paralelo: boolean; prazoHoras: number;
}
export interface RegraAprovacao {
  id: string; nome: string; servicoId: string | null; condicoes: string;
  ativo: boolean; etapas: EtapaAprovacao[];
}

export const REGRAS_APROVACAO_SEED: RegraAprovacao[] = [
  {
    id: "ra1", nome: "Cadastro de Novo Usuário", servicoId: "sv1",
    condicoes: "Serviço: Cadastro de Novo Usuário · todas as secretarias", ativo: true,
    etapas: [
      { id: "ra1e1", nome: "Gestor da Secretaria de Administração", tipoAprovador: "Gestor da secretaria", aprovador: "Secretaria Municipal de Administração", obrigatoria: true, paralelo: false, prazoHoras: 24 },
      { id: "ra1e2", nome: "Encaminhamento à TI", tipoAprovador: "Grupo", aprovador: "Sistemas", obrigatoria: true, paralelo: false, prazoHoras: 8 },
    ],
  },
  {
    id: "ra2", nome: "Solicitação de Software", servicoId: "sv4",
    condicoes: "Serviço: Instalar Software · licença paga ou fora do padrão", ativo: true,
    etapas: [
      { id: "ra2e1", nome: "Chefia Imediata", tipoAprovador: "Gestor da unidade", aprovador: "Unidade do solicitante", obrigatoria: false, paralelo: false, prazoHoras: 24 },
      { id: "ra2e2", nome: "Validação da TI", tipoAprovador: "Grupo", aprovador: "Sistemas", obrigatoria: true, paralelo: false, prazoHoras: 48 },
      { id: "ra2e3", nome: "Segurança da Informação", tipoAprovador: "Perfil", aprovador: "Administrador", obrigatoria: true, paralelo: true, prazoHoras: 48 },
    ],
  },
  {
    id: "ra3", nome: "Acesso Privilegiado", servicoId: "sv3",
    condicoes: "Serviço: Solicitar Acesso · perfil administrativo ou de gestão", ativo: true,
    etapas: [
      { id: "ra3e1", nome: "Gestor da Secretaria", tipoAprovador: "Gestor da secretaria", aprovador: "Secretaria do solicitante", obrigatoria: true, paralelo: false, prazoHoras: 24 },
      { id: "ra3e2", nome: "Responsável pelo Sistema", tipoAprovador: "Usuário específico", aprovador: "Ana Beatriz Rocha", obrigatoria: true, paralelo: true, prazoHoras: 24 },
      { id: "ra3e3", nome: "Segurança da Informação", tipoAprovador: "Perfil", aprovador: "Administrador", obrigatoria: true, paralelo: false, prazoHoras: 48 },
    ],
  },
];

export interface Servico {
  id: string; nome: string; categoriaId: string; grupoId: string; descricao: string;
  requerAprovacao: boolean; regraAprovacaoId: string | null; prioridadePadrao: string;
  selecaoTecnico?: "Não" | "Opcional" | "Obrigatório" | "Somente Gestores";
  tecnicoPreferencialId?: string | null;
}
export const SERVICOS_SEED: Servico[] = [
  { id: "sv1", nome: "Criar Usuário", categoriaId: "cat4", grupoId: "g4", descricao: "Cadastro de novo servidor nos sistemas municipais, com perfil inicial padrão.", requerAprovacao: true, regraAprovacaoId: "ra1", prioridadePadrao: "Normal" },
  { id: "sv2", nome: "Redefinir Senha", categoriaId: "cat4", grupoId: "g1", descricao: "Redefinição de senha de acesso aos sistemas e estações.", requerAprovacao: false, regraAprovacaoId: null, prioridadePadrao: "Normal" },
  { id: "sv3", nome: "Solicitar Acesso", categoriaId: "cat9", grupoId: "g4", descricao: "Concessão de acesso a sistemas, módulos e perfis específicos.", requerAprovacao: true, regraAprovacaoId: "ra3", prioridadePadrao: "Alta" },
  { id: "sv4", nome: "Instalar Software", categoriaId: "cat8", grupoId: "g1", descricao: "Instalação de software homologado na estação de trabalho.", requerAprovacao: true, regraAprovacaoId: "ra2", prioridadePadrao: "Normal" },
  { id: "sv5", nome: "Solicitar Equipamento", categoriaId: "cat10", grupoId: "g1", descricao: "Fornecimento de equipamento novo ou substituição de estação.", requerAprovacao: true, regraAprovacaoId: null, prioridadePadrao: "Normal" },
  { id: "sv6", nome: "Criar Pasta de Rede", categoriaId: "cat12", grupoId: "g2", descricao: "Criação de pasta compartilhada com permissões por equipe.", requerAprovacao: false, regraAprovacaoId: null, prioridadePadrao: "Baixa" },
  { id: "sv7", nome: "Criar E-mail", categoriaId: "cat4", grupoId: "g4", descricao: "Criação de caixa de e-mail institucional.", requerAprovacao: false, regraAprovacaoId: null, prioridadePadrao: "Normal" },
  { id: "sv8", nome: "Instalar Impressora", categoriaId: "cat2", grupoId: "g1", descricao: "Instalação e configuração de impressora na rede.", requerAprovacao: false, regraAprovacaoId: null, prioridadePadrao: "Normal" },
  { id: "sv9", nome: "Criar Ponto de Rede", categoriaId: "cat3", grupoId: "g3", descricao: "Instalação e certificação de ponto de rede cabeada.", requerAprovacao: false, regraAprovacaoId: null, prioridadePadrao: "Normal" },
  { id: "sv10", nome: "Solicitar Wi-Fi", categoriaId: "cat6", grupoId: "g3", descricao: "Credencial de acesso à rede Wi-Fi corporativa ou de visitantes.", requerAprovacao: false, regraAprovacaoId: null, prioridadePadrao: "Baixa" },
];

export interface ComentarioChamado { id: string; autorId: string; texto: string; data: string; tipo: "resposta" | "interna"; }
export interface DecisaoAprovacao {
  etapaId: string; etapaNome: string; status: "Pendente" | "Aprovado" | "Rejeitado" | "Ajuste solicitado";
  aprovadorNome: string; data?: string; comentario?: string;
}
export interface Chamado {
  id: string; numero: string; titulo: string; descricao: string;
  tipo: (typeof TIPO_CHAMADO)[number]; solicitanteId: string; unidadeId: string; local: string;
  categoriaId: string; servicoId: string | null; prioridade: string; status: string;
  tecnicoId: string | null; grupoId: string | null; patrimonioId: string | null;
  criadoEm: string; prazoResolucao: string;
  aprovacoes: DecisaoAprovacao[]; historico: HistoricoItem[]; comentarios: ComentarioChamado[];
  roteamento?: RegistroRoteamento[]; tecnicoPreferencialId?: string | null;
}
export interface RegistroRoteamento {
  data: string; regra: string; detalhe: string; dominio: string; grupo: string;
  tecnico?: string; automatico: boolean;
}

export const CHAMADOS_SEED: Chamado[] = [
  {
    id: "ch14", numero: "TI-2026-000014", titulo: "Cadastro de novo usuário — servidora da Secretaria de Turismo",
    descricao: "Nova servidora nomeada para o setor de eventos. Necessário usuário nos sistemas de protocolo e e-mail institucional.",
    tipo: "Solicitação de Serviço", solicitanteId: "u12", unidadeId: "un5", local: "Sala 12 — SETUR",
    categoriaId: "cat4", servicoId: "sv1", prioridade: "Normal", status: "Aguardando Aprovação",
    tecnicoId: null, grupoId: null, patrimonioId: null, criadoEm: isoRel(0, 8, 42),
    prazoResolucao: isoRel(1, 8, 42),
    aprovacoes: [
      { etapaId: "ra1e1", etapaNome: "Gestor da Secretaria de Administração", status: "Pendente", aprovadorNome: "Carlos Eduardo Menezes" },
      { etapaId: "ra1e2", etapaNome: "Encaminhamento à TI", status: "Pendente", aprovadorNome: "Grupo Sistemas" },
    ],
    historico: [
      { data: isoRel(0, 8, 42), usuario: "Marcos Vinícius Sales", acao: "Chamado aberto", detalhe: "Cadastro de Novo Usuário solicitado pelo Portal de Serviços." },
      { data: isoRel(0, 8, 42), usuario: "sistema", acao: "Enviado para aprovação", detalhe: "Regra: Cadastro de Novo Usuário · Etapa 1 — Gestor da Secretaria de Administração." },
    ],
    comentarios: [{ id: "cc14a", autorId: "u12", texto: "A servidora inicia na próxima segunda-feira. Seria possível priorizar?", data: isoRel(0, 8, 44), tipo: "resposta" }],
  },
  {
    id: "ch13", numero: "TI-2026-000013", titulo: "Computador não liga — sala de empenhos",
    descricao: "Estação da sala de empenhos não liga. Led acende e desliga em seguida. Relatórios de empenho parados.",
    tipo: "Incidente", solicitanteId: "u9", unidadeId: "un2", local: "Sala 18 — SEFAZ",
    categoriaId: "cat1", servicoId: null, prioridade: "Crítica", status: "Em Atendimento",
    tecnicoId: "u5", grupoId: "g1", patrimonioId: "at1", criadoEm: isoRel(0, 7, 15),
    prazoResolucao: isoRel(0, 9, 15),
    aprovacoes: [],
    historico: [
      { data: isoRel(0, 7, 15), usuario: "Fernanda Castro Lima", acao: "Chamado aberto", detalhe: "Incidente registrado pelo Portal de Serviços." },
      { data: isoRel(0, 7, 21), usuario: "sistema", acao: "Atribuído automaticamente", detalhe: "Grupo: Suporte Técnico · Técnica: Mariana Lopes Siqueira." },
      { data: isoRel(0, 7, 26), usuario: "Mariana Lopes Siqueira", acao: "Atendimento iniciado", detalhe: "Diagnóstico remoto; provável falha na fonte. Visita técnica agendada." },
    ],
    comentarios: [
      { id: "cc13a", autorId: "u5", texto: "Bom dia! Já estou a caminho da SEFAZ com uma fonte reserva.", data: isoRel(0, 7, 27), tipo: "resposta" },
      { id: "cc13b", autorId: "u5", texto: "Fonte com capacitor estufado confirmado. Se a placa estiver danificada, acionar o at2 como reserva.", data: isoRel(0, 7, 58), tipo: "interna" },
    ],
  },
  {
    id: "ch12", numero: "TI-2026-000012", titulo: "Instalação do software de geoprocessamento",
    descricao: "Instalar QGIS com plugins de cartografia na estação do setor de mapeamento.",
    tipo: "Solicitação de Serviço", solicitanteId: "u13", unidadeId: "un6", local: "Sala 31 — SEOB",
    categoriaId: "cat8", servicoId: "sv4", prioridade: "Normal", status: "Atribuído",
    tecnicoId: "u6", grupoId: "g4", patrimonioId: null, criadoEm: isoRel(-1, 10, 5),
    prazoResolucao: isoRel(0, 10, 5),
    aprovacoes: [
      { etapaId: "ra2e1", etapaNome: "Chefia Imediata", status: "Aprovado", aprovadorNome: "Renata Barbosa Farias", data: isoRel(-1, 11, 20), comentario: "Aprovado — uso em projeto de mapeamento de obras." },
      { etapaId: "ra2e2", etapaNome: "Validação da TI", status: "Aprovado", aprovadorNome: "Eduardo Sá Barreto", data: isoRel(-1, 14, 2), comentario: "Software homologado, licença GPL." },
      { etapaId: "ra2e3", etapaNome: "Segurança da Informação", status: "Aprovado", aprovadorNome: "Carlos Eduardo Menezes", data: isoRel(-1, 15, 30), comentario: "Sem restrições." },
    ],
    historico: [
      { data: isoRel(-1, 10, 5), usuario: "Renata Barbosa Farias", acao: "Chamado aberto", detalhe: "Instalar Software via catálogo." },
      { data: isoRel(-1, 15, 30), usuario: "sistema", acao: "Aprovações concluídas", detalhe: "3 de 3 etapas aprovadas. Chamado liberado para execução." },
      { data: isoRel(-1, 15, 31), usuario: "sistema", acao: "Atribuído automaticamente", detalhe: "Grupo: Sistemas · Técnico: Eduardo Sá Barreto." },
    ],
    comentarios: [],
  },
  {
    id: "ch11", numero: "TI-2026-000011", titulo: "Wi-Fi lento na recepção da Educação",
    descricao: "Rede corporativa muito lenta na recepção. Atendimento ao público prejudicado nos cadastros online.",
    tipo: "Incidente", solicitanteId: "u10", unidadeId: "un3", local: "Recepção — SEMED",
    categoriaId: "cat6", servicoId: null, prioridade: "Alta", status: "Em Triagem",
    tecnicoId: null, grupoId: "g3", patrimonioId: null, criadoEm: isoRel(0, 6, 50),
    prazoResolucao: isoRel(0, 14, 50),
    aprovacoes: [],
    historico: [{ data: isoRel(0, 6, 50), usuario: "João Pereira Neto", acao: "Chamado aberto", detalhe: "Incidente registrado via Portal de Serviços." }],
    comentarios: [],
  },
  {
    id: "ch10", numero: "TI-2026-000010", titulo: "Redefinição de senha do sistema de folha",
    descricao: "Esqueci a senha após o bloqueio por tentativas. Solicito redefinição.",
    tipo: "Solicitação de Serviço", solicitanteId: "u7", unidadeId: "un12", local: "Sala 22 — DRH",
    categoriaId: "cat4", servicoId: "sv2", prioridade: "Normal", status: "Resolvido",
    tecnicoId: "u5", grupoId: "g1", patrimonioId: null, criadoEm: isoRel(0, 7, 40),
    prazoResolucao: isoRel(1, 7, 40),
    aprovacoes: [],
    historico: [
      { data: isoRel(0, 7, 40), usuario: "Patrícia Nunes Castro", acao: "Chamado aberto", detalhe: "Redefinir Senha via catálogo." },
      { data: isoRel(0, 7, 47), usuario: "Mariana Lopes Siqueira", acao: "Chamado resolvido", detalhe: "Senha redefinida com expiração no primeiro acesso." },
    ],
    comentarios: [{ id: "cc10a", autorId: "u5", texto: "Senha redefinida. No primeiro acesso o sistema pedirá uma nova senha.", data: isoRel(0, 7, 47), tipo: "resposta" }],
  },
  {
    id: "ch9", numero: "TI-2026-000009", titulo: "Instalação de ponto de rede — sala de vacinação",
    descricao: "Dois pontos de rede na sala de vacinação reformada da UBS Centro.",
    tipo: "Solicitação de Serviço", solicitanteId: "u11", unidadeId: "un4", local: "UBS Centro — Sala de Vacinação",
    categoriaId: "cat3", servicoId: "sv9", prioridade: "Normal", status: "Aguardando Peça",
    tecnicoId: "u4", grupoId: "g3", patrimonioId: null, criadoEm: isoRel(-3, 9, 10),
    prazoResolucao: isoRel(2, 9, 10),
    aprovacoes: [],
    historico: [
      { data: isoRel(-3, 9, 10), usuario: "Luciana Prado Teixeira", acao: "Chamado aberto", detalhe: "Criar Ponto de Rede via catálogo." },
      { data: isoRel(-2, 10, 0), usuario: "Rafael Duarte Pinto", acao: "Atendimento iniciado", detalhe: "Vistoria realizada; cabeamento aprovado." },
      { data: isoRel(-1, 9, 30), usuario: "Rafael Duarte Pinto", acao: "Status alterado para Aguardando Peça", detalhe: "Keystones e espelhos em falta no almoxarifado. Compra emergencial solicitada." },
    ],
    comentarios: [{ id: "cc9a", autorId: "u4", texto: "Material solicitado ao almoxarifado. Previsão de chegada em 2 dias úteis.", data: isoRel(-1, 9, 31), tipo: "resposta" }],
  },
  {
    id: "ch8", numero: "TI-2026-000008", titulo: "Impressora atolando papel — protocolo central",
    descricao: "Impressora do protocolo atolando papel em toda impressão dupla.",
    tipo: "Incidente", solicitanteId: "u8", unidadeId: "un13", local: "Guichê 2 — DCOMP",
    categoriaId: "cat2", servicoId: null, prioridade: "Alta", status: "Aguardando Usuário",
    tecnicoId: "u5", grupoId: "g1", patrimonioId: "at7", criadoEm: isoRel(-2, 13, 45),
    prazoResolucao: isoRel(-1, 13, 45),
    aprovacoes: [],
    historico: [
      { data: isoRel(-2, 13, 45), usuario: "Tiago Almeida Braga", acao: "Chamado aberto", detalhe: "Incidente registrado via Portal de Serviços." },
      { data: isoRel(-2, 14, 20), usuario: "Mariana Lopes Siqueira", acao: "Atendimento iniciado", detalhe: "Rolos de tração substituídos." },
      { data: isoRel(-1, 8, 10), usuario: "Mariana Lopes Siqueira", acao: "Status alterado para Aguardando Usuário", detalhe: "Aguardando teste do solicitante com papel novo." },
    ],
    comentarios: [{ id: "cc8a", autorId: "u5", texto: "Troquei os rolos de tração. Pode testar com um papel novo, por favor?", data: isoRel(-1, 8, 10), tipo: "resposta" }],
  },
  {
    id: "ch7", numero: "TI-2026-000007", titulo: "Acesso administrativo ao Portal da Transparência",
    descricao: "Perfil de edição para atualização dos dados de execução orçamentária.",
    tipo: "Solicitação de Serviço", solicitanteId: "u9", unidadeId: "un2", local: "Sala 15 — SEFAZ",
    categoriaId: "cat9", servicoId: "sv3", prioridade: "Alta", status: "Aguardando Aprovação",
    tecnicoId: null, grupoId: null, patrimonioId: null, criadoEm: isoRel(-1, 16, 20),
    prazoResolucao: isoRel(0, 16, 20),
    aprovacoes: [
      { etapaId: "ra3e1", etapaNome: "Gestor da Secretaria", status: "Aprovado", aprovadorNome: "Fernanda Castro Lima", data: isoRel(-1, 17, 5), comentario: "Acesso necessário para a audiência pública." },
      { etapaId: "ra3e2", etapaNome: "Responsável pelo Sistema", status: "Pendente", aprovadorNome: "Ana Beatriz Rocha" },
      { etapaId: "ra3e3", etapaNome: "Segurança da Informação", status: "Pendente", aprovadorNome: "Carlos Eduardo Menezes" },
    ],
    historico: [
      { data: isoRel(-1, 16, 20), usuario: "Fernanda Castro Lima", acao: "Chamado aberto", detalhe: "Solicitar Acesso via catálogo." },
      { data: isoRel(-1, 17, 5), usuario: "Fernanda Castro Lima", acao: "Etapa 1 aprovada", detalhe: "Gestor da Secretaria — aprovação registrada." },
    ],
    comentarios: [],
  },
  {
    id: "ch6", numero: "TI-2026-000006", titulo: "Queda do link principal de internet",
    descricao: "Link de 2 Gbps sem comunicação com a operadora desde as 9h40.",
    tipo: "Incidente", solicitanteId: "u2", unidadeId: "un11", local: "Datacenter — Rack 1",
    categoriaId: "cat3", servicoId: null, prioridade: "Crítica", status: "Fechado",
    tecnicoId: "u3", grupoId: "g3", patrimonioId: null, criadoEm: isoRel(-6, 9, 45),
    prazoResolucao: isoRel(-6, 11, 45),
    aprovacoes: [],
    historico: [
      { data: isoRel(-6, 9, 45), usuario: "Carlos Eduardo Menezes", acao: "Chamado aberto", detalhe: "Incidente crítico — failover acionado automaticamente." },
      { data: isoRel(-6, 10, 30), usuario: "Juliana Freitas Almeida", acao: "Chamado resolvido", detalhe: "Falha na OLT da operadora. Circuito normalizado." },
      { data: isoRel(-5, 9, 0), usuario: "Carlos Eduardo Menezes", acao: "Chamado fechado", detalhe: "Confirmada estabilidade por 24h." },
    ],
    comentarios: [],
  },
  {
    id: "ch5", numero: "TI-2026-000005", titulo: "Rompimento de fibra — anel óptico Av. Central",
    descricao: "Anel óptico rompido por obra na Av. Central. Enlace da Prefeitura com o Almoxarifado em contingência.",
    tipo: "Incidente", solicitanteId: "u4", unidadeId: "un11", local: "Av. Central — Trecho 4",
    categoriaId: "cat3", servicoId: null, prioridade: "Crítica", status: "Em Atendimento",
    tecnicoId: "u3", grupoId: "g3", patrimonioId: null, criadoEm: isoRel(0, 8, 55),
    prazoResolucao: isoRel(0, 16, 55),
    aprovacoes: [],
    historico: [
      { data: isoRel(0, 8, 55), usuario: "Rafael Duarte Pinto", acao: "Chamado aberto", detalhe: "Rompimento identificado pelo monitoramento." },
      { data: isoRel(0, 9, 30), usuario: "Juliana Freitas Almeida", acao: "Atendimento iniciado", detalhe: "Equipe de fusão em deslocamento." },
    ],
    comentarios: [{ id: "cc5a", autorId: "u3", texto: "Fusão em andamento, 6 de 12 fibras recompostas.", data: isoRel(0, 10, 20), tipo: "resposta" }],
  },
  {
    id: "ch4", numero: "TI-2026-000004", titulo: "Criar pasta de rede para a comissão de licitação",
    descricao: "Pasta compartilhada com acesso restrito aos membros da comissão.",
    tipo: "Solicitação de Serviço", solicitanteId: "u8", unidadeId: "un13", local: "DCOMP",
    categoriaId: "cat12", servicoId: "sv6", prioridade: "Baixa", status: "Fechado",
    tecnicoId: "u4", grupoId: "g2", patrimonioId: null, criadoEm: isoRel(-9, 11, 0),
    prazoResolucao: isoRel(-7, 11, 0),
    aprovacoes: [],
    historico: [
      { data: isoRel(-9, 11, 0), usuario: "Tiago Almeida Braga", acao: "Chamado aberto", detalhe: "Criar Pasta de Rede via catálogo." },
      { data: isoRel(-8, 9, 40), usuario: "Rafael Duarte Pinto", acao: "Chamado resolvido", detalhe: "Pasta criada com permissões por grupo AD." },
    ],
    comentarios: [],
  },
  {
    id: "ch3", numero: "TI-2026-000003", titulo: "Telefone IP sem tom de discagem — gabinete",
    descricao: "Aparelho registra na central mas não completa chamadas externas.",
    tipo: "Incidente", solicitanteId: "u7", unidadeId: "un12", local: "Gabinete — Ramal 6121",
    categoriaId: "cat7", servicoId: null, prioridade: "Urgente", status: "Resolvido",
    tecnicoId: "u5", grupoId: "g6", patrimonioId: null, criadoEm: isoRel(-4, 10, 30),
    prazoResolucao: isoRel(-4, 14, 30),
    aprovacoes: [],
    historico: [
      { data: isoRel(-4, 10, 30), usuario: "Patrícia Nunes Castro", acao: "Chamado aberto", detalhe: "Incidente de telefonia." },
      { data: isoRel(-4, 11, 50), usuario: "Mariana Lopes Siqueira", acao: "Chamado resolvido", detalhe: "Rota de saída corrigida na central telefônica." },
    ],
    comentarios: [],
  },
  {
    id: "ch2", numero: "TI-2026-000002", titulo: "Solicitação de notebook para fiscalização de obras",
    descricao: "Notebook com bateria de longa duração para uso em campo.",
    tipo: "Solicitação de Serviço", solicitanteId: "u13", unidadeId: "un6", local: "SEOB — Fiscalização",
    categoriaId: "cat10", servicoId: "sv5", prioridade: "Alta", status: "Aguardando Aprovação",
    tecnicoId: null, grupoId: null, patrimonioId: null, criadoEm: isoRel(0, 8, 5),
    prazoResolucao: isoRel(1, 8, 5),
    aprovacoes: [
      { etapaId: "ra1e1", etapaNome: "Gestor da Secretaria de Administração", status: "Pendente", aprovadorNome: "Carlos Eduardo Menezes" },
    ],
    historico: [
      { data: isoRel(0, 8, 5), usuario: "Renata Barbosa Farias", acao: "Chamado aberto", detalhe: "Solicitar Equipamento via catálogo." },
      { data: isoRel(0, 8, 5), usuario: "sistema", acao: "Enviado para aprovação", detalhe: "Verificação de disponibilidade de estoque pela Administração." },
    ],
    comentarios: [],
  },
  {
    id: "ch1", numero: "TI-2026-000001", titulo: "Erro ao emitir certidão negativa no sistema tributário",
    descricao: "Mensagem de erro 500 ao gerar certidão para pessoa jurídica.",
    tipo: "Incidente", solicitanteId: "u9", unidadeId: "un2", local: "Atendimento — SEFAZ",
    categoriaId: "cat5", servicoId: null, prioridade: "Urgente", status: "Cancelado",
    tecnicoId: "u6", grupoId: "g4", patrimonioId: null, criadoEm: isoRel(-12, 9, 20),
    prazoResolucao: isoRel(-12, 13, 20),
    aprovacoes: [],
    historico: [
      { data: isoRel(-12, 9, 20), usuario: "Fernanda Castro Lima", acao: "Chamado aberto", detalhe: "Incidente no sistema tributário." },
      { data: isoRel(-12, 10, 0), usuario: "Eduardo Sá Barreto", acao: "Chamado cancelado", detalhe: "Duplicado do chamado anterior — erro já corrigido em produção." },
    ],
    comentarios: [],
  },
];

/* ===================== Patrimônio de TI ===================== */

export const STATUS_ATIVO: { label: string; tom: Tom; hex: string }[] = [
  { label: "Cadastrado", tom: "cinza", hex: "#8a9a8f" },
  { label: "Em Estoque", tom: "azul", hex: "#20659f" },
  { label: "Em Preparação", tom: "ciano", hex: "#0e7490" },
  { label: "Em Uso", tom: "verde", hex: "#1e7a54" },
  { label: "Emprestado", tom: "ambar", hex: "#b4690e" },
  { label: "Em Manutenção", tom: "ambar", hex: "#8f5409" },
  { label: "Aguardando Manutenção", tom: "ambar", hex: "#8f5409" },
  { label: "Reserva", tom: "pinho", hex: "#0e4a2f" },
  { label: "Obsoleto", tom: "vermelho", hex: "#96331e" },
  { label: "Inservível", tom: "vermelho", hex: "#96331e" },
  { label: "Não Localizado", tom: "vermelho", hex: "#7d1f0e" },
  { label: "Baixado", tom: "cinza", hex: "#4d5c53" },
];

export const CATEGORIAS_ATIVO = [
  "Desktop", "Notebook", "Monitor", "Impressora", "Switch", "Roteador", "Access Point", "Servidor",
  "Nobreak", "Smartphone", "Tablet", "Telefone IP", "Scanner", "Storage", "Firewall", "Periférico",
  "Projetor", "Câmera", "DVR", "NVR", "Rack", "Equipamento de Videomonitoramento", "Equipamento de Telecomunicação", "Outro Equipamento de TI",
];

export const MOTIVOS_BAIXA = ["Inservível", "Alienação", "Doação", "Perda", "Furto", "Descarte", "Substituição", "Outro"];

export const RESULTADOS_INVENTARIO = [
  "Confirmado", "Não Localizado", "Localização Divergente", "Responsável Divergente",
  "Dados Divergentes", "Equipamento Adicional Encontrado", "Em Manutenção", "Baixado",
];

/** Critérios de obsolescência por categoria — configuráveis pelo administrador. */
export const REGRAS_OBSOLESCENCIA_SEED: { categoria: string; anos: number }[] = [
  { categoria: "Desktop", anos: 6 }, { categoria: "Notebook", anos: 5 }, { categoria: "Switch", anos: 8 },
  { categoria: "Impressora", anos: 6 }, { categoria: "Servidor", anos: 10 }, { categoria: "Monitor", anos: 8 },
  { categoria: "Storage", anos: 7 }, { categoria: "Nobreak", anos: 6 }, { categoria: "_padrao", anos: 6 },
];

/** Campos obrigatórios por categoria para considerar o cadastro completo. */
export const CAMPOS_OBRIGATORIOS: Record<string, { chave: string; rotulo: string }[]> = {
  _padrao: [
    { chave: "patrimonio", rotulo: "Número de Patrimônio" }, { chave: "serie", rotulo: "Número de Série" },
    { chave: "fabricante", rotulo: "Fabricante" }, { chave: "modelo", rotulo: "Modelo" },
  ],
  Desktop: [
    { chave: "patrimonio", rotulo: "Número de Patrimônio" }, { chave: "serie", rotulo: "Número de Série" },
    { chave: "fabricante", rotulo: "Fabricante" }, { chave: "modelo", rotulo: "Modelo" },
    { chave: "responsavel", rotulo: "Responsável" }, { chave: "localizacao", rotulo: "Localização" },
  ],
  Switch: [
    { chave: "patrimonio", rotulo: "Número de Patrimônio" }, { chave: "serie", rotulo: "Número de Série" },
    { chave: "fabricante", rotulo: "Fabricante" }, { chave: "modelo", rotulo: "Modelo" },
    { chave: "ipGerencia", rotulo: "IP de Gerenciamento" },
  ],
  Servidor: [
    { chave: "patrimonio", rotulo: "Número de Patrimônio" }, { chave: "serie", rotulo: "Número de Série" },
    { chave: "fabricante", rotulo: "Fabricante" }, { chave: "modelo", rotulo: "Modelo" },
    { chave: "ipGerencia", rotulo: "Endereço de rede" }, { chave: "responsavel", rotulo: "Responsável" },
  ],
};

export function camposFaltantes(a: Ativo): string[] {
  const req = CAMPOS_OBRIGATORIOS[a.categoria] ?? CAMPOS_OBRIGATORIOS._padrao;
  const faltam: string[] = [];
  for (const c of req) {
    if (c.chave === "patrimonio" && !a.patrimonio) faltam.push(c.rotulo);
    else if (c.chave === "serie" && !a.serie) faltam.push(c.rotulo);
    else if (c.chave === "fabricante" && !a.fabricante) faltam.push(c.rotulo);
    else if (c.chave === "modelo" && !a.modelo) faltam.push(c.rotulo);
    else if (c.chave === "responsavel" && !a.responsavelId) faltam.push(c.rotulo);
    else if (c.chave === "localizacao" && !a.sala) faltam.push(c.rotulo);
    else if (c.chave === "ipGerencia" && !a.rede?.ipv4 && !(a.campos.ipGerencia ?? a.campos.ipRede)) faltam.push(c.rotulo);
    else if (c.chave === "responsavel" && !a.responsavelId) faltam.push(c.rotulo);
  }
  return faltam;
}

/** Pertencimento patrimonial explícito (demonstração de propriedade × localização distintas). */
export const PERTENCIMENTO_EXPLICITO: Record<string, Pertencimento> = {
  at1: { orgaoId: "un0", gestoraId: "ug1", fundoId: null, secretariaId: "un1", departamentoId: "un11", centroCusto: "CC-0110", responsavelPatrimonialId: "u2" },
  at2: { orgaoId: "un0", gestoraId: "ug1", fundoId: null, secretariaId: "un1", departamentoId: "un11", centroCusto: "CC-0110", responsavelPatrimonialId: "u2" },
  at12: { orgaoId: "un0", gestoraId: "ug1", fundoId: null, secretariaId: "un1", departamentoId: "un11", centroCusto: "CC-0110", responsavelPatrimonialId: "u5" },
  at13: { orgaoId: "un0", gestoraId: "ug1", fundoId: null, secretariaId: "un1", departamentoId: "un11", centroCusto: "CC-0110", responsavelPatrimonialId: null },
};

/** Campos técnicos dinâmicos por categoria (configuráveis pelo administrador). */
export const CAMPOS_DINAMICOS: Record<string, { chave: string; rotulo: string }[]> = {
  Desktop: [{ chave: "cpu", rotulo: "CPU" }, { chave: "ram", rotulo: "RAM" }, { chave: "storage", rotulo: "Storage" }, { chave: "gpu", rotulo: "GPU" }, { chave: "so", rotulo: "Sistema Operacional" }],
  Notebook: [{ chave: "cpu", rotulo: "CPU" }, { chave: "ram", rotulo: "RAM" }, { chave: "storage", rotulo: "Storage" }, { chave: "gpu", rotulo: "GPU" }, { chave: "so", rotulo: "Sistema Operacional" }],
  Servidor: [{ chave: "cpu", rotulo: "CPU" }, { chave: "ram", rotulo: "RAM" }, { chave: "storage", rotulo: "Storage" }, { chave: "hypervisor", rotulo: "Hypervisor" }, { chave: "servicos", rotulo: "Serviços" }, { chave: "so", rotulo: "Sistema Operacional" }],
  Switch: [{ chave: "portas", rotulo: "Nº de Portas" }, { chave: "gerenciavel", rotulo: "Gerenciável" }, { chave: "vlans", rotulo: "VLANs" }, { chave: "firmware", rotulo: "Firmware" }, { chave: "ipGerencia", rotulo: "IP de Gerenciamento" }],
  Impressora: [{ chave: "ipRede", rotulo: "IP de Rede" }, { chave: "tipoImp", rotulo: "Tipo" }, { chave: "toner", rotulo: "Toner" }, { chave: "contador", rotulo: "Contador de Páginas" }],
  Nobreak: [{ chave: "potencia", rotulo: "Potência" }, { chave: "bateria", rotulo: "Modelo da Bateria" }, { chave: "trocaBateria", rotulo: "Troca da Bateria" }],
  Storage: [{ chave: "capacidade", rotulo: "Capacidade" }, { chave: "raid", rotulo: "Nível RAID" }, { chave: "discos", rotulo: "Discos" }],
  Firewall: [{ chave: "firmware", rotulo: "Firmware" }, { chave: "licenca", rotulo: "Licença UTM" }, { chave: "portas", rotulo: "Portas WAN/LAN" }],
  "Access Point": [{ chave: "padrao", rotulo: "Padrão Wi-Fi" }, { chave: "ssid", rotulo: "SSIDs" }, { chave: "ipGerencia", rotulo: "IP de Gerenciamento" }],
};

export interface InfoRede {
  hostname: string; ipv4: string; ipv6: string; mac: string; tipoEnd: "DHCP" | "Estático";
  vlan: string; subrede: string; gateway: string; dns1: string; dns2: string;
  dominio: string; ou: string; ingressado: boolean; ultimaSync: string; statusDominio: string;
}
export interface HistoricoIP { ipv4: string; hostname: string; mac: string; vlan: string; detectadoEm: string; origem: "Manual" | "DHCP" | "Active Directory" | "Varredura de rede" | "Agente" | "Importação"; }
export interface Movimentacao { origem: string; destino: string; responsavelAnterior: string; novoResponsavel: string; data: string; usuario: string; motivo: string; }
export interface Manutencao { id: string; tecnicoId: string; data: string; tipo: "Preventiva" | "Corretiva"; descricao: string; diagnostico: string; solucao: string; pecas: string; custo: number; chamadoId: string | null; tempoMin: number; }

export interface Pertencimento {
  orgaoId: string; gestoraId: string; fundoId: string | null;
  secretariaId: string; departamentoId: string | null;
  centroCusto: string | null; responsavelPatrimonialId: string | null;
}
export interface InfoBaixa {
  motivo: string; data: string; documento: string; processo: string;
  destino: string; obs: string; usuario: string;
}
export interface Ativo {
  id: string; patrimonio: string; codigoInterno: string; serie: string; categoria: string;
  fabricante: string; modelo: string; aquisicao: string; valor: number; notaFiscal: string;
  fornecedor: string; garantiaFim: string; status: string; obs: string;
  unidadeId: string; responsavelId: string | null; predio: string; sala: string;
  campos: Record<string, string>; rede: InfoRede | null;
  historicoIP: HistoricoIP[]; movimentacoes: Movimentacao[]; manutencoes: Manutencao[];
  pertencimento?: Pertencimento; baixa?: InfoBaixa | null;
  localizacaoFisica?: { andar?: string; endereco?: string; complemento?: string };
  dataCadastro?: string; processoCompra?: string; fonteRecurso?: string; subcategoria?: string;
}

const ipHist = (rows: [string, string, string, string, number, HistoricoIP["origem"]][]): HistoricoIP[] =>
  rows.map(([ipv4, hostname, mac, vlan, d, origem]) => ({ ipv4, hostname, mac, vlan, detectadoEm: isoRel(d, 6), origem }));

export const ATIVOS_SEED: Ativo[] = [
  {
    id: "at1", patrimonio: "000458", codigoInterno: "DTI-D-023", serie: "BR7KQ458", categoria: "Desktop",
    fabricante: "Dell", modelo: "OptiPlex 7090", aquisicao: isoData(-1100), valor: 6890, notaFiscal: "NF 12.445",
    fornecedor: "Dell Computadores do Brasil", garantiaFim: isoData(-370), status: "Em Uso",
    obs: "Estação padrão da secretaria com imagem corporativa.", unidadeId: "un2", responsavelId: "u9",
    predio: "Paço Municipal", sala: "Sala 18 — Empenhos",
    campos: { cpu: "Intel Core i5-11500", ram: "16 GB DDR4", storage: "SSD NVMe 512 GB", gpu: "Intel UHD 750", so: "Windows 11 Pro 23H2" },
    rede: { hostname: "ADM-PC-023", ipv4: "192.168.10.47", ipv6: "—", mac: "D4:5D:64:1A:2B:47", tipoEnd: "DHCP", vlan: "VLAN 10 — Administração", subrede: "255.255.255.0", gateway: "192.168.10.1", dns1: "192.168.0.5", dns2: "192.168.0.6", dominio: "prefeitura.local", ou: "OU=SEFAZ,OU=Estacoes,DC=prefeitura,DC=local", ingressado: true, ultimaSync: isoRel(0, 6, 12), statusDominio: "Sincronizado" },
    historicoIP: ipHist([
      ["192.168.10.47", "ADM-PC-023", "D4:5D:64:1A:2B:47", "10", 0, "DHCP"],
      ["192.168.10.31", "ADM-PC-023", "D4:5D:64:1A:2B:47", "10", -60, "DHCP"],
      ["192.168.20.15", "DTI-IMG-023", "D4:5D:64:1A:2B:47", "20", -180, "Manual"],
    ]),
    movimentacoes: [
      { origem: "Almoxarifado Central", destino: "DTI — Preparação", responsavelAnterior: "Estoque", novoResponsavel: "Rafael Duarte Pinto", data: isoRel(-1090), usuario: "Mariana Lopes Siqueira", motivo: "Preparação de imagem corporativa" },
      { origem: "DTI — Preparação", destino: "SEFAZ — Sala de Empenhos", responsavelAnterior: "Rafael Duarte Pinto", novoResponsavel: "Fernanda Castro Lima", data: isoRel(-1080), usuario: "Mariana Lopes Siqueira", motivo: "Entrega com termo de responsabilidade" },
    ],
    manutencoes: [
      { id: "mn1a", tecnicoId: "u5", data: isoRel(-120), tipo: "Corretiva", descricao: "Estação reiniciando sozinha", diagnostico: "Superaquecimento por poeira", solucao: "Limpeza interna e troca de pasta térmica", pecas: "Pasta térmica", custo: 35, chamadoId: null, tempoMin: 40 },
      { id: "mn1b", tecnicoId: "u5", data: isoRel(-30), tipo: "Corretiva", descricao: "Fonte com ruído", diagnostico: "Capacitor estufado", solucao: "Fonte substituída em garantia interna", pecas: "Fonte 240W", custo: 210, chamadoId: null, tempoMin: 55 },
    ],
  },
  {
    id: "at2", patrimonio: "000461", codigoInterno: "DTI-N-014", serie: "LNV8842X", categoria: "Notebook",
    fabricante: "Lenovo", modelo: "ThinkPad E15", aquisicao: isoData(-800), valor: 7450, notaFiscal: "NF 13.102",
    fornecedor: "Lenovo Brasil", garantiaFim: isoData(300), status: "Emprestado",
    obs: "Notebook de reserva para empréstimo a servidores em deslocamento.", unidadeId: "un6", responsavelId: "u13",
    predio: "SEOB", sala: "Fiscalização",
    campos: { cpu: "Intel Core i7-1165G7", ram: "16 GB DDR4", storage: "SSD NVMe 512 GB", gpu: "Intel Iris Xe", so: "Windows 11 Pro 23H2" },
    rede: { hostname: "SEOB-NB-014", ipv4: "192.168.30.22", ipv6: "—", mac: "8C:16:45:77:AA:22", tipoEnd: "DHCP", vlan: "VLAN 30 — SEOB", subrede: "255.255.255.0", gateway: "192.168.30.1", dns1: "192.168.0.5", dns2: "192.168.0.6", dominio: "prefeitura.local", ou: "OU=SEOB,OU=Notebooks,DC=prefeitura,DC=local", ingressado: true, ultimaSync: isoRel(-2, 17, 40), statusDominio: "Sincronizado" },
    historicoIP: ipHist([
      ["192.168.30.22", "SEOB-NB-014", "8C:16:45:77:AA:22", "30", -2, "Active Directory"],
      ["10.4.9.87", "DTI-NB-014", "8C:16:45:77:AA:22", "20", -90, "Varredura de rede"],
    ]),
    movimentacoes: [
      { origem: "DTI — Estoque", destino: "SEOB — Fiscalização", responsavelAnterior: "Estoque", novoResponsavel: "Renata Barbosa Farias", data: isoRel(-40), usuario: "Mariana Lopes Siqueira", motivo: "Empréstimo para vistorias de obras (termo nº 2026-081)" },
    ],
    manutencoes: [],
  },
  {
    id: "at3", patrimonio: "000102", codigoInterno: "DTI-S-001", serie: "SVCTAG0102", categoria: "Servidor",
    fabricante: "Dell", modelo: "PowerEdge R750", aquisicao: isoData(-400), valor: 98500, notaFiscal: "NF 15.878",
    fornecedor: "Dell Computadores do Brasil", garantiaFim: isoData(1060), status: "Em Uso",
    obs: "Host principal do cluster de virtualização (datacenter).", unidadeId: "un11", responsavelId: "u4",
    predio: "Datacenter", sala: "Rack 2 — U21",
    campos: { cpu: "2× Xeon Silver 4314", ram: "256 GB DDR4 ECC", storage: "8× 1,92 TB SSD SAS", hypervisor: "VMware vSphere 8", servicos: "vCenter, AD, Arquivos", so: "ESXi 8.0 U2" },
    rede: { hostname: "ESXI-HOST-01", ipv4: "192.168.0.11", ipv6: "—", mac: "B0:26:28:11:01:AA", tipoEnd: "Estático", vlan: "VLAN 0 — Gerência DC", subrede: "255.255.255.0", gateway: "192.168.0.1", dns1: "192.168.0.5", dns2: "192.168.0.6", dominio: "prefeitura.local", ou: "OU=Servidores,DC=prefeitura,DC=local", ingressado: true, ultimaSync: isoRel(0, 5, 58), statusDominio: "Sincronizado" },
    historicoIP: ipHist([["192.168.0.11", "ESXI-HOST-01", "B0:26:28:11:01:AA", "0", -400, "Manual"]]),
    movimentacoes: [],
    manutencoes: [{ id: "mn3a", tecnicoId: "u4", data: isoRel(-15), tipo: "Preventiva", descricao: "Preventiva trimestral", diagnostico: "Sem alertas de hardware", solucao: "Atualização de firmware iDRAC e BIOS", pecas: "—", custo: 0, chamadoId: null, tempoMin: 90 }],
  },
  {
    id: "at4", patrimonio: "000117", codigoInterno: "DTI-S-002", serie: "HPE117P", categoria: "Servidor",
    fabricante: "HPE", modelo: "ProLiant DL380 Gen10", aquisicao: isoData(-1500), valor: 74200, notaFiscal: "NF 9.204",
    fornecedor: "HPE Brasil", garantiaFim: isoData(-40), status: "Em Uso",
    obs: "Banco de dados SQL e sistema tributário.", unidadeId: "un11", responsavelId: "u4",
    predio: "Datacenter", sala: "Rack 2 — U24",
    campos: { cpu: "2× Xeon Gold 6248", ram: "192 GB DDR4 ECC", storage: "12× 900 GB SAS 10k", hypervisor: "Windows Server 2022", servicos: "SQL Server, Tributário", so: "Windows Server 2022" },
    rede: { hostname: "SRV-SQL-01", ipv4: "192.168.0.20", ipv6: "—", mac: "A0:B1:C2:20:00:15", tipoEnd: "Estático", vlan: "VLAN 0 — Gerência DC", subrede: "255.255.255.0", gateway: "192.168.0.1", dns1: "192.168.0.5", dns2: "192.168.0.6", dominio: "prefeitura.local", ou: "OU=Servidores,DC=prefeitura,DC=local", ingressado: true, ultimaSync: isoRel(0, 6, 2), statusDominio: "Sincronizado" },
    historicoIP: ipHist([["192.168.0.20", "SRV-SQL-01", "A0:B1:C2:20:00:15", "0", -700, "Manual"], ["192.168.0.22", "SRV-SQL-01", "A0:B1:C2:20:00:15", "0", -900, "Manual"]]),
    movimentacoes: [],
    manutencoes: [
      { id: "mn4a", tecnicoId: "u4", data: isoRel(-80), tipo: "Corretiva", descricao: "Alerta de disco com setores realocados", diagnostico: "Disco 4 com falha iminente", solucao: "Disco substituído e RAID reconstruído", pecas: "HD SAS 900 GB", custo: 1850, chamadoId: null, tempoMin: 120 },
      { id: "mn4b", tecnicoId: "u4", data: isoRel(-200), tipo: "Preventiva", descricao: "Preventiva trimestral", diagnostico: "Bateria do controlador com carga baixa", solucao: "Bateria do RAID substituída", pecas: "Bateria cache", custo: 620, chamadoId: null, tempoMin: 45 },
      { id: "mn4c", tecnicoId: "u4", data: isoRel(-320), tipo: "Corretiva", descricao: "Fonte redundante em falha", diagnostico: "Fonte 2 fora de especificação", solucao: "Fonte substituída em garantia", pecas: "Fonte 800W", custo: 0, chamadoId: null, tempoMin: 60 },
    ],
  },
  {
    id: "at5", patrimonio: "000233", codigoInterno: "DTI-R-005", serie: "CSC9200-55", categoria: "Switch",
    fabricante: "Cisco", modelo: "Catalyst 9200L-48P", aquisicao: isoData(-700), valor: 28900, notaFiscal: "NF 14.020",
    fornecedor: "Cisco do Brasil", garantiaFim: isoData(760), status: "Em Uso",
    obs: "Switch de acesso do Paço Municipal (PoE).", unidadeId: "un11", responsavelId: "u3",
    predio: "Paço Municipal", sala: "Copa de rede — 2º andar",
    campos: { portas: "48× 1GbE PoE + 4× SFP+", gerenciavel: "Sim — CLI/SNMP", vlans: "12 VLANs ativas", firmware: "IOS-XE 17.9.4", ipGerencia: "192.168.0.55" },
    rede: { hostname: "SW-PACO-02", ipv4: "192.168.0.55", ipv6: "—", mac: "00:1A:A2:55:05:CC", tipoEnd: "Estático", vlan: "VLAN 0 — Gerência", subrede: "255.255.255.0", gateway: "192.168.0.1", dns1: "192.168.0.5", dns2: "192.168.0.6", dominio: "prefeitura.local", ou: "OU=Rede,DC=prefeitura,DC=local", ingressado: false, ultimaSync: isoRel(0, 6, 30), statusDominio: "Não ingressado" },
    historicoIP: ipHist([["192.168.0.55", "SW-PACO-02", "00:1A:A2:55:05:CC", "0", -700, "Manual"]]),
    movimentacoes: [],
    manutencoes: [],
  },
  {
    id: "at6", patrimonio: "000301", codigoInterno: "DTI-P-007", serie: "HPLJ301", categoria: "Impressora",
    fabricante: "HP", modelo: "LaserJet Pro M428fdw", aquisicao: isoData(-600), valor: 3980, notaFiscal: "NF 13.777",
    fornecedor: "Kalunga S.A.", garantiaFim: isoData(-235), status: "Em Uso",
    obs: "Impressora compartilhada do protocolo central.", unidadeId: "un13", responsavelId: "u8",
    predio: "Paço Municipal", sala: "Guichê 2 — DCOMP",
    campos: { ipRede: "192.168.10.140", tipoImp: "Laser monocromática multifuncional", toner: "HP 59X (alto rendimento)", contador: "84.312 páginas" },
    rede: { hostname: "IMP-DCOMP-01", ipv4: "192.168.10.140", ipv6: "—", mac: "3C:52:82:14:0D:88", tipoEnd: "Estático", vlan: "VLAN 10 — Administração", subrede: "255.255.255.0", gateway: "192.168.10.1", dns1: "192.168.0.5", dns2: "192.168.0.6", dominio: "prefeitura.local", ou: "OU=Impressoras,DC=prefeitura,DC=local", ingressado: false, ultimaSync: isoRel(-1, 19, 10), statusDominio: "Não ingressado" },
    historicoIP: ipHist([["192.168.10.140", "IMP-DCOMP-01", "3C:52:82:14:0D:88", "10", -600, "Manual"], ["192.168.10.151", "IMP-DCOMP-01", "3C:52:82:14:0D:88", "10", -800, "DHCP"]]),
    movimentacoes: [{ origem: "DTI — Estoque", destino: "DCOMP — Guichê 2", responsavelAnterior: "Estoque", novoResponsavel: "Tiago Almeida Braga", data: isoRel(-590), usuario: "Mariana Lopes Siqueira", motivo: "Substituição de impressora com defeito" }],
    manutencoes: [
      { id: "mn6a", tecnicoId: "u5", data: isoRel(-1), tipo: "Corretiva", descricao: "Atolamento recorrente de papel", diagnostico: "Rolos de tração desgastados", solucao: "Rolos substituídos", pecas: "Kit rolos de tração", custo: 180, chamadoId: "TI-2026-000008", tempoMin: 35 },
      { id: "mn6b", tecnicoId: "u5", data: isoRel(-150), tipo: "Preventiva", descricao: "Limpeza preventiva semestral", diagnostico: "Acúmulo de toner no fusor", solucao: "Limpeza do conjunto fusor", pecas: "—", custo: 0, chamadoId: null, tempoMin: 25 },
    ],
  },
  {
    id: "at7", patrimonio: "000150", codigoInterno: "DTI-NB-003", serie: "SMS3000-99", categoria: "Nobreak",
    fabricante: "SMS", modelo: "Sinus Triphases 30 kVA", aquisicao: isoData(-1300), valor: 42300, notaFiscal: "NF 8.512",
    fornecedor: "SMS Tecnologia", garantiaFim: isoData(-200), status: "Em Uso",
    obs: "Nobreak do datacenter — rack 3.", unidadeId: "un11", responsavelId: "u4",
    predio: "Datacenter", sala: "Rack 3",
    campos: { potencia: "30 kVA / 27 kW", bateria: "Banco 40× 9Ah", trocaBateria: "Prevista para março/2027" },
    rede: null,
    historicoIP: [],
    movimentacoes: [],
    manutencoes: [{ id: "mn7a", tecnicoId: "u4", data: isoRel(-8), tipo: "Preventiva", descricao: "Substituição preventiva — alerta de bateria", diagnostico: "Banco de baterias com capacitância baixa", solucao: "Banco de baterias substituído", pecas: "40 baterias 9Ah", custo: 8900, chamadoId: null, tempoMin: 150 }],
  },
  {
    id: "at8", patrimonio: "000412", codigoInterno: "DTI-AP-011", serie: "UBI-AP-412", categoria: "Access Point",
    fabricante: "Ubiquiti", modelo: "UniFi U6 Pro", aquisicao: isoData(-350), valor: 1890, notaFiscal: "NF 15.110",
    fornecedor: "Fibra Shop", garantiaFim: isoData(380), status: "Em Uso",
    obs: "Cobertura Wi-Fi da recepção central.", unidadeId: "un11", responsavelId: "u3",
    predio: "Paço Municipal", sala: "Recepção — teto",
    campos: { padrao: "Wi-Fi 6 (802.11ax)", ssid: "Prefeitura-Corporativa, Prefeitura-Visitantes", ipGerencia: "192.168.0.81" },
    rede: { hostname: "AP-RECEPCAO-01", ipv4: "192.168.0.81", ipv6: "—", mac: "F0:9F:C2:81:11:44", tipoEnd: "DHCP", vlan: "VLAN 0 — Gerência", subrede: "255.255.255.0", gateway: "192.168.0.1", dns1: "192.168.0.5", dns2: "192.168.0.6", dominio: "prefeitura.local", ou: "—", ingressado: false, ultimaSync: isoRel(0, 6, 45), statusDominio: "Não ingressado" },
    historicoIP: ipHist([["192.168.0.81", "AP-RECEPCAO-01", "F0:9F:C2:81:11:44", "0", -10, "Varredura de rede"], ["192.168.0.90", "AP-RECEPCAO-01", "F0:9F:C2:81:11:44", "0", -120, "DHCP"]]),
    movimentacoes: [],
    manutencoes: [],
  },
  {
    id: "at9", patrimonio: "000090", codigoInterno: "DTI-FW-001", serie: "FTN-60F-90", categoria: "Firewall",
    fabricante: "Fortinet", modelo: "FortiGate 200F", aquisicao: isoData(-500), valor: 58700, notaFiscal: "NF 14.900",
    fornecedor: "Fortinet Brasil", garantiaFim: isoData(590), status: "Em Uso",
    obs: "Firewall de borda com UTM ativo.", unidadeId: "un11", responsavelId: "u3",
    predio: "Datacenter", sala: "Rack 1 — U02",
    campos: { firmware: "FortiOS 7.4.4", licenca: "UTM + IPS até 12/2027", portas: "8× GE RJ45 + 4× SFP" },
    rede: { hostname: "FW-BORDA-01", ipv4: "192.168.0.2", ipv6: "—", mac: "90:6C:AC:02:00:02", tipoEnd: "Estático", vlan: "VLAN 0 — Gerência", subrede: "255.255.255.0", gateway: "—", dns1: "192.168.0.5", dns2: "8.8.8.8", dominio: "prefeitura.local", ou: "—", ingressado: false, ultimaSync: isoRel(0, 6, 1), statusDominio: "Não ingressado" },
    historicoIP: ipHist([["192.168.0.2", "FW-BORDA-01", "90:6C:AC:02:00:02", "0", -500, "Manual"]]),
    movimentacoes: [],
    manutencoes: [],
  },
  {
    id: "at10", patrimonio: "000520", codigoInterno: "DTI-ST-001", serie: "SYN-520", categoria: "Storage",
    fabricante: "Synology", modelo: "RS1221+ (8 baias)", aquisicao: isoData(-260), valor: 21400, notaFiscal: "NF 15.560",
    fornecedor: "Armazém Digital", garantiaFim: isoData(470), status: "Em Uso",
    obs: "Storage de backup local (regra 3-2-1).", unidadeId: "un11", responsavelId: "u4",
    predio: "Datacenter", sala: "Rack 3 — U10",
    campos: { capacidade: "48 TB úteis", raid: "RAID 6", discos: "8× 12 TB NAS" },
    rede: { hostname: "NAS-BACKUP-01", ipv4: "192.168.0.30", ipv6: "—", mac: "00:11:32:30:00:30", tipoEnd: "Estático", vlan: "VLAN 0 — Gerência DC", subrede: "255.255.255.0", gateway: "192.168.0.1", dns1: "192.168.0.5", dns2: "192.168.0.6", dominio: "prefeitura.local", ou: "OU=Servidores,DC=prefeitura,DC=local", ingressado: false, ultimaSync: isoRel(0, 4, 0), statusDominio: "Não ingressado" },
    historicoIP: ipHist([["192.168.0.30", "NAS-BACKUP-01", "00:11:32:30:00:30", "0", -260, "Manual"]]),
    movimentacoes: [],
    manutencoes: [],
  },
  {
    id: "at11", patrimonio: "000298", codigoInterno: "DTI-D-090", serie: "DL0298BR", categoria: "Desktop",
    fabricante: "Dell", modelo: "OptiPlex 3050", aquisicao: isoData(-2600), valor: 2900, notaFiscal: "NF 4.118",
    fornecedor: "Dell Computadores do Brasil", garantiaFim: isoData(-1500), status: "Obsoleto",
    obs: "Estação antiga — candidata à substituição pelo projeto de atualização do parque.", unidadeId: "un12", responsavelId: "u7",
    predio: "Paço Municipal", sala: "Sala 24 — RH",
    campos: { cpu: "Intel Core i3-6100", ram: "4 GB DDR4", storage: "HD 500 GB", gpu: "Intel HD 530", so: "Windows 10 Pro 21H2" },
    rede: { hostname: "RH-PC-090", ipv4: "192.168.10.90", ipv6: "—", mac: "E4:B3:18:90:0A:12", tipoEnd: "DHCP", vlan: "VLAN 10 — Administração", subrede: "255.255.255.0", gateway: "192.168.10.1", dns1: "192.168.0.5", dns2: "192.168.0.6", dominio: "prefeitura.local", ou: "OU=DRH,OU=Estacoes,DC=prefeitura,DC=local", ingressado: true, ultimaSync: isoRel(-6, 8, 20), statusDominio: "Desatualizado" },
    historicoIP: ipHist([["192.168.10.90", "RH-PC-090", "E4:B3:18:90:0A:12", "10", -6, "DHCP"], ["192.168.10.77", "RH-PC-090", "E4:B3:18:90:0A:12", "10", -200, "DHCP"]]),
    movimentacoes: [],
    manutencoes: [
      { id: "mn11a", tecnicoId: "u5", data: isoRel(-40), tipo: "Corretiva", descricao: "Lentidão extrema", diagnostico: "HD com setores defeituosos", solucao: "SSD instalado como paliativo", pecas: "SSD 240 GB", custo: 160, chamadoId: null, tempoMin: 50 },
      { id: "mn11b", tecnicoId: "u5", data: isoRel(-160), tipo: "Corretiva", descricao: "Não liga", diagnostico: "Memória com mau contato", solucao: "Limpeza de contatos", pecas: "—", custo: 0, chamadoId: null, tempoMin: 20 },
      { id: "mn11c", tecnicoId: "u5", data: isoRel(-300), tipo: "Corretiva", descricao: "Tela azul recorrente", diagnostico: "Driver de vídeo corrompido", solucao: "Reinstalação de driver", pecas: "—", custo: 0, chamadoId: null, tempoMin: 30 },
      { id: "mn11d", tecnicoId: "u5", data: isoRel(-420), tipo: "Corretiva", descricao: "Teclado sem resposta", diagnostico: "Teclado danificado", solucao: "Teclado substituído", pecas: "Teclado USB", custo: 45, chamadoId: null, tempoMin: 15 },
    ],
  },
  {
    id: "at12", patrimonio: "000610", codigoInterno: "DTI-SP-004", serie: "MOT-610", categoria: "Smartphone",
    fabricante: "Motorola", modelo: "Moto G84", aquisicao: isoData(-200), valor: 1750, notaFiscal: "NF 16.010",
    fornecedor: "Telefonia Municipal", garantiaFim: isoData(530), status: "Emprestado",
    obs: "Aparelho para plantão da Defesa Civil.", unidadeId: "un6", responsavelId: "u13",
    predio: "SEOB", sala: "Plantão",
    campos: {},
    rede: null,
    historicoIP: [],
    movimentacoes: [{ origem: "DTI — Estoque", destino: "SEOB — Plantão", responsavelAnterior: "Estoque", novoResponsavel: "Renata Barbosa Farias", data: isoRel(-180), usuario: "Mariana Lopes Siqueira", motivo: "Termo de responsabilidade nº 2026-064" }],
    manutencoes: [],
  },
  {
    id: "at13", patrimonio: "000655", codigoInterno: "DTI-M-120", serie: "LG24-655", categoria: "Monitor",
    fabricante: "LG", modelo: "24MK430 23,8\"", aquisicao: isoData(-90), valor: 780, notaFiscal: "NF 16.440",
    fornecedor: "Kalunga S.A.", garantiaFim: isoData(1000), status: "Em Estoque",
    obs: "Lote da reposição de monitores — aguardando demanda.", unidadeId: "un11", responsavelId: null,
    predio: "Almoxarifado TI", sala: "Prateleira C-2",
    campos: {},
    rede: null,
    historicoIP: [],
    movimentacoes: [{ origem: "Fornecedor", destino: "Almoxarifado TI", responsavelAnterior: "Kalunga S.A.", novoResponsavel: "Estoque", data: isoRel(-85), usuario: "Mariana Lopes Siqueira", motivo: "Recebimento NF 16.440" }],
    manutencoes: [],
  },
  {
    id: "at14", patrimonio: "000701", codigoInterno: "DTI-SC-002", serie: "EPSON-701", categoria: "Scanner",
    fabricante: "Epson", modelo: "WorkForce DS-530 II", aquisicao: isoData(-450), valor: 3150, notaFiscal: "NF 14.305",
    fornecedor: "Armazém Digital", garantiaFim: isoData(280), status: "Em Uso",
    obs: "Digitalização de processos físicos do protocolo.", unidadeId: "un13", responsavelId: "u8",
    predio: "Paço Municipal", sala: "Protocolo Central",
    campos: {},
    rede: null,
    historicoIP: [],
    movimentacoes: [],
    manutencoes: [{ id: "mn14a", tecnicoId: "u5", data: isoRel(-60), tipo: "Preventiva", descricao: "Limpeza dos rolos de alimentação", diagnostico: "Marcas de arraste nas digitalizações", solucao: "Rolos e vidros limpos", pecas: "—", custo: 0, chamadoId: null, tempoMin: 20 }],
  },
  {
    id: "at15", patrimonio: "000533", codigoInterno: "DTI-TF-009", serie: "GRC-TF-533", categoria: "Telefone IP",
    fabricante: "Grandstream", modelo: "GRP2614", aquisicao: isoData(-550), valor: 690, notaFiscal: "NF 13.980",
    fornecedor: "Telefonia Municipal", garantiaFim: isoData(180), status: "Em Uso",
    obs: "Ramal 6121 — Gabinete RH.", unidadeId: "un12", responsavelId: "u7",
    predio: "Paço Municipal", sala: "Gabinete RH",
    campos: {},
    rede: { hostname: "TEL-6121", ipv4: "192.168.50.21", ipv6: "—", mac: "C0:74:AD:21:50:15", tipoEnd: "DHCP", vlan: "VLAN 50 — Voz", subrede: "255.255.255.0", gateway: "192.168.50.1", dns1: "192.168.0.5", dns2: "192.168.0.6", dominio: "prefeitura.local", ou: "—", ingressado: false, ultimaSync: isoRel(0, 6, 0), statusDominio: "Não ingressado" },
    historicoIP: ipHist([["192.168.50.21", "TEL-6121", "C0:74:AD:21:50:15", "50", -3, "DHCP"]]),
    movimentacoes: [],
    manutencoes: [{ id: "mn15a", tecnicoId: "u5", data: isoRel(-4), tipo: "Corretiva", descricao: "Sem tom de discagem", diagnostico: "Rota de saída incorreta na central", solucao: "Rota corrigida e registro renovado", pecas: "—", custo: 0, chamadoId: "TI-2026-000003", tempoMin: 25 }],
  },
  {
    id: "at16", patrimonio: "000045", codigoInterno: "DTI-RT-001", serie: "CSC-RT-045", categoria: "Roteador",
    fabricante: "Cisco", modelo: "ISR 4331", aquisicao: isoData(-2200), valor: 45600, notaFiscal: "NF 6.777",
    fornecedor: "Cisco do Brasil", garantiaFim: isoData(-1100), status: "Baixado",
    obs: "Roteador de borda substituído pelo firewall com funções de roteamento.", unidadeId: "un11", responsavelId: null,
    predio: "Almoxarifado TI", sala: "Descarte — aguardando leilão",
    campos: {},
    rede: null,
    historicoIP: ipHist([["192.168.0.1", "RT-BORDA-ANTIGO", "00:25:84:01:00:01", "0", -1100, "Manual"]]),
    movimentacoes: [{ origem: "Datacenter — Rack 1", destino: "Almoxarifado TI", responsavelAnterior: "Juliana Freitas Almeida", novoResponsavel: "Estoque", data: isoRel(-1100), usuario: "Carlos Eduardo Menezes", motivo: "Baixa patrimonial — substituição tecnológica" }],
    manutencoes: [],
  },
];

export interface CampanhaInventario {
  id: string; nome: string; periodo: string; responsavelId: string;
  itens: { patrimonioId: string; resultado: string }[];
  historico?: { patrimonioId: string; resultado: string; usuario: string; data: string; obs?: string }[];
}
export const INVENTARIO_SEED: CampanhaInventario[] = [
  {
    id: "inv1", nome: "Inventário de TI 2026", periodo: "01/10/2026 a 31/10/2026", responsavelId: "u5",
    itens: [
      { patrimonioId: "at1", resultado: "Localizado" }, { patrimonioId: "at2", resultado: "Movido" },
      { patrimonioId: "at3", resultado: "Localizado" }, { patrimonioId: "at4", resultado: "Localizado" },
      { patrimonioId: "at5", resultado: "Localizado" }, { patrimonioId: "at6", resultado: "Dados Divergentes" },
      { patrimonioId: "at7", resultado: "Em Manutenção" }, { patrimonioId: "at8", resultado: "Localizado" },
      { patrimonioId: "at9", resultado: "Localizado" }, { patrimonioId: "at10", resultado: "Localizado" },
      { patrimonioId: "at11", resultado: "Localizado" }, { patrimonioId: "at12", resultado: "Não Localizado" },
      { patrimonioId: "at13", resultado: "Localizado" }, { patrimonioId: "at14", resultado: "Localizado" },
      { patrimonioId: "at15", resultado: "Localizado" }, { patrimonioId: "at16", resultado: "Baixado" },
    ],
  },
];

export interface LicencaSoftware { id: string; software: string; fornecedor: string; tipo: string; total: number; usadas: number; vencimento: string; contrato: string; }
export const LICENCAS_SEED: LicencaSoftware[] = [
  { id: "lc1", software: "Microsoft 365 A3", fornecedor: "Microsoft", tipo: "Assinatura anual", total: 350, usadas: 289, vencimento: isoData(210), contrato: "CT-2025-014" },
  { id: "lc2", software: "Windows 11 Pro", fornecedor: "Microsoft", tipo: "OEM vitalícia", total: 450, usadas: 418, vencimento: isoData(3000), contrato: "Diversos" },
  { id: "lc3", software: "Kaspersky EDR", fornecedor: "Kaspersky", tipo: "Assinatura anual", total: 500, usadas: 486, vencimento: isoData(64), contrato: "CT-2026-002" },
  { id: "lc4", software: "Adobe Acrobat Pro", fornecedor: "Adobe", tipo: "Assinatura mensal", total: 25, usadas: 25, vencimento: isoData(21), contrato: "CT-2024-031" },
  { id: "lc5", software: "AutoCAD LT", fornecedor: "Autodesk", tipo: "Assinatura anual", total: 5, usadas: 3, vencimento: isoData(150), contrato: "CT-2025-009" },
  { id: "lc6", software: "Zabbix Enterprise", fornecedor: "Zabbix SIA", tipo: "Suporte anual", total: 1, usadas: 1, vencimento: isoData(320), contrato: "CT-2026-005" },
];

export interface ArtigoBase { id: string; titulo: string; categoria: string; conteudo: string; autorId: string; status: "Publicado" | "Rascunho"; visibilidade: "Todos" | "Somente TI"; atualizadoEm: string; }
export const BASE_CONHECIMENTO_SEED: ArtigoBase[] = [
  { id: "kb1", titulo: "Como redefinir minha senha", categoria: "Usuários e Senhas", conteudo: "1. Acesse o Portal Interno e clique em “Esqueci minha senha”.\n2. Informe sua matrícula e confirme o ramal cadastrado.\n3. Você receberá uma senha provisória no e-mail institucional.\n4. No primeiro acesso, o sistema solicitará a criação de uma nova senha com no mínimo 8 caracteres.\n\nCaso não tenha e-mail cadastrado, abra um chamado na Central de Serviços.", autorId: "u5", status: "Publicado", visibilidade: "Todos", atualizadoEm: isoRel(-40) },
  { id: "kb2", titulo: "Como acessar a pasta de rede da minha equipe", categoria: "Arquivos e Pastas", conteudo: "1. Abra o Explorador de Arquivos e clique em “Rede”.\n2. Navegue até \\\\arquivos\\sua-secretaria.\n3. Se a pasta não aparecer, verifique se você está conectado à rede corporativa (cabo ou Wi-Fi Prefeitura-Corporativa).\n4. Sem permissão? Peça ao gestor da sua unidade que solicite o acesso via catálogo (Solicitar Acesso).", autorId: "u4", status: "Publicado", visibilidade: "Todos", atualizadoEm: isoRel(-90) },
  { id: "kb3", titulo: "Como instalar uma impressora de rede", categoria: "Impressoras", conteudo: "1. Vá em Configurações → Dispositivos → Impressoras e scanners.\n2. Clique em “Adicionar uma impressora” e aguarde a detecção.\n3. Se não aparecer, clique em “A impressora desejada não está na lista” e informe o caminho: \\\\IMP-DCOMP-01\\compartilhamento.\n4. Imprima uma página de teste.\n\nDrivers homologados estão na pasta \\\\arquivos\\dti\\drivers.", autorId: "u5", status: "Publicado", visibilidade: "Todos", atualizadoEm: isoRel(-120) },
  { id: "kb4", titulo: "Como solicitar acesso a um sistema", categoria: "Acesso a Sistemas", conteudo: "1. Acesse a Central de Serviços de TI e escolha o serviço “Solicitar Acesso”.\n2. Informe o sistema, o perfil desejado e a justificativa.\n3. A solicitação passará pela aprovação do gestor da sua secretaria.\n4. Você será notificado no GovFlow quando o acesso for concedido.\n\nPerfis administrativos exigem aprovação adicional da Segurança da Informação.", autorId: "u1", status: "Publicado", visibilidade: "Todos", atualizadoEm: isoRel(-15) },
  { id: "kb5", titulo: "Procedimento de backup dos servidores", categoria: "Infraestrutura", conteudo: "Rotina diária: 22h — snapshot das VMs críticas (RTO 4h / RPO 24h).\nRotina semanal: domingo 01h — cópia completa para o NAS-BACKUP-01.\nMensal: fita LTO enviada ao cofre da agência central.\n\nA verificação de integridade é automática e gera alerta no canal #infraestrutura em caso de falha.", autorId: "u4", status: "Publicado", visibilidade: "Somente TI", atualizadoEm: isoRel(-60) },
  { id: "kb6", titulo: "Checklist de recebimento de equipamentos", categoria: "Patrimônio", conteudo: "1. Conferir nota fiscal × ordem de fornecimento.\n2. Registrar número de série e patrimônio no GovFlow.\n3. Aplicar etiqueta patrimonial e QR Code.\n4. Instalar imagem corporativa e ingressar no domínio.\n5. Gerar termo de responsabilidade e coletar assinatura.", autorId: "u5", status: "Rascunho", visibilidade: "Somente TI", atualizadoEm: isoRel(-5) },
];

/* ===================== Roteamento de atendimento de TI ===================== */

export interface UnidadeGestora { id: string; nome: string; sigla: string; codigo: string; unidadeId: string; gestorId: string; }
export const UNIDADES_GESTORAS_SEED: UnidadeGestora[] = [
  { id: "ug1", nome: "Prefeitura Municipal de Cidade Exemplo", sigla: "PMCE", codigo: "UG-001", unidadeId: "un0", gestorId: "u2" },
  { id: "ug2", nome: "Fundo Municipal de Saúde", sigla: "FMS", codigo: "UG-002", unidadeId: "un4", gestorId: "u11" },
  { id: "ug3", nome: "Fundo Municipal de Educação", sigla: "FME", codigo: "UG-003", unidadeId: "un3", gestorId: "u10" },
];

export interface FundoMunicipal { id: string; nome: string; sigla: string; codigo: string; unidadeId: string; gestorId: string; ativo: boolean; }
export const FUNDOS_SEED: FundoMunicipal[] = [
  { id: "fm1", nome: "Fundo Municipal de Saúde", sigla: "FMS", codigo: "FM-002", unidadeId: "un4", gestorId: "u11", ativo: true },
  { id: "fm2", nome: "Fundo Municipal de Educação", sigla: "FME", codigo: "FM-003", unidadeId: "un3", gestorId: "u10", ativo: true },
];

export interface TipoUnidade { id: string; nome: string; codigo: string; ordem: number; ativo: boolean; }
export const TIPOS_UNIDADE_SEED: TipoUnidade[] = [
  { id: "tu1", nome: "Prefeitura", codigo: "PREF", ordem: 1, ativo: true },
  { id: "tu2", nome: "Secretaria", codigo: "SEC", ordem: 2, ativo: true },
  { id: "tu3", nome: "Secretaria Especial", codigo: "SECE", ordem: 3, ativo: true },
  { id: "tu4", nome: "Autarquia", codigo: "AUT", ordem: 4, ativo: true },
  { id: "tu5", nome: "Fundação", codigo: "FUND", ordem: 5, ativo: true },
  { id: "tu6", nome: "Fundo Municipal", codigo: "FM", ordem: 6, ativo: true },
  { id: "tu7", nome: "Diretoria", codigo: "DIR", ordem: 7, ativo: true },
  { id: "tu8", nome: "Departamento", codigo: "DEP", ordem: 8, ativo: true },
  { id: "tu9", nome: "Coordenadoria", codigo: "COORD", ordem: 9, ativo: true },
  { id: "tu10", nome: "Divisão", codigo: "DIV", ordem: 10, ativo: true },
  { id: "tu11", nome: "Setor", codigo: "SET", ordem: 11, ativo: true },
  { id: "tu12", nome: "Núcleo", codigo: "NUC", ordem: 12, ativo: true },
  { id: "tu13", nome: "Unidade Escolar", codigo: "UE", ordem: 13, ativo: true },
  { id: "tu14", nome: "Unidade de Saúde", codigo: "US", ordem: 14, ativo: true },
  { id: "tu15", nome: "Hospital", codigo: "HOSP", ordem: 15, ativo: true },
  { id: "tu16", nome: "UBS", codigo: "UBS", ordem: 16, ativo: true },
  { id: "tu17", nome: "Almoxarifado", codigo: "ALM", ordem: 17, ativo: true },
  { id: "tu18", nome: "Outro", codigo: "OUT", ordem: 18, ativo: true },
];

export interface DominioAtendimento { id: string; nome: string; descricao: string; unidadeId: string; gestoraId: string; gestorId: string; ativo: boolean; }
export const DOMINIOS_SEED: DominioAtendimento[] = [
  { id: "dom1", nome: "TI Corporativa", descricao: "Domínio central de tecnologia — atende Administração, Fazenda, Obras, Turismo e órgãos sem equipe própria.", unidadeId: "un11", gestoraId: "ug1", gestorId: "u2", ativo: true },
  { id: "dom2", nome: "TI Saúde", descricao: "Domínio próprio da Secretaria de Saúde, vinculado ao Fundo Municipal de Saúde. Atende SESAU e unidades subordinadas (UBS, hospitais, vigilância).", unidadeId: "un4", gestoraId: "ug2", gestorId: "u11", ativo: true },
  { id: "dom3", nome: "TI Educação", descricao: "Domínio próprio da Secretaria de Educação. Atende SEMED, escolas e unidades pedagógicas.", unidadeId: "un3", gestoraId: "ug3", gestorId: "u10", ativo: true },
];

/** Grupos adicionais (domínios próprios de Saúde e Educação) — somados aos grupos corporativos. */
export const GRUPOS_EXTRAS_SEED: GrupoSuporte[] = [
  { id: "g7", nome: "Suporte TI Saúde", sigla: "STS", membroIds: ["u5", "u6"], dominioId: "dom2", gestorId: "u11", horario: "Seg a sex, 7h às 19h", estrategiaAtribuicao: "Menor número de chamados ativos", permiteAtribAuto: true, permiteSelecaoTecnico: "Opcional", categoriasAtendidas: ["Computador e Notebook", "Impressoras", "Internet e Rede"] },
  { id: "g8", nome: "Sistemas Saúde", sigla: "SIS-S", membroIds: ["u6"], dominioId: "dom2", gestorId: "u11", horario: "Seg a sex, 8h às 18h", estrategiaAtribuicao: "Técnico padrão do serviço", permiteAtribAuto: true, permiteSelecaoTecnico: "Somente Gestores", categoriasAtendidas: ["Sistemas", "Acesso a Sistemas"] },
  { id: "g9", nome: "Suporte TI Educação", sigla: "STE", membroIds: ["u5"], dominioId: "dom3", gestorId: "u10", horario: "Seg a sex, 8h às 17h", estrategiaAtribuicao: "Round Robin", permiteAtribAuto: true, permiteSelecaoTecnico: "Não", categoriasAtendidas: ["Computador e Notebook", "Wi-Fi"] },
];

export interface CoberturaAtendimento { id: string; grupoId: string; unidadeId: string; incluirSubordinadas: boolean; prioridade: number; ativa: boolean; }
export const COBERTURAS_SEED: CoberturaAtendimento[] = [
  { id: "cb1", grupoId: "g7", unidadeId: "un4", incluirSubordinadas: true, prioridade: 10, ativa: true },
  { id: "cb2", grupoId: "g9", unidadeId: "un3", incluirSubordinadas: true, prioridade: 10, ativa: true },
  { id: "cb3", grupoId: "g1", unidadeId: "un1", incluirSubordinadas: true, prioridade: 20, ativa: true },
];

export type CondicaoRoteamento = "Serviço" | "Unidade Administrativa" | "Categoria" | "Unidade + Categoria";
export interface RegraRoteamento {
  id: string; nome: string; condicaoTipo: CondicaoRoteamento; condicaoValor: string;
  condicaoExtra: string | null; grupoId: string; prioridade: number; ativa: boolean;
}
export const REGRAS_ROTEAMENTO_SEED: RegraRoteamento[] = [
  { id: "rr1", nome: "Portal da Transparência → Sistemas Corporativos", condicaoTipo: "Serviço", condicaoValor: "sv12", condicaoExtra: null, grupoId: "g4", prioridade: 10, ativa: true },
  { id: "rr2", nome: "Sistemas × Saúde → Sistemas Saúde", condicaoTipo: "Unidade + Categoria", condicaoValor: "cat5", condicaoExtra: "un4", grupoId: "g8", prioridade: 20, ativa: true },
  { id: "rr3", nome: "SEFAZ → Suporte Técnico (regra explícita)", condicaoTipo: "Unidade Administrativa", condicaoValor: "un2", condicaoExtra: null, grupoId: "g1", prioridade: 30, ativa: true },
];

export interface ResponsavelGlobal { id: string; servicoId: string; tecnicoId: string; grupoId: string; cobertura: string; ativo: boolean; }
export const RESPONSAVEIS_GLOBAIS_SEED: ResponsavelGlobal[] = [
  { id: "rg1", servicoId: "sv11", tecnicoId: "u6", grupoId: "g4", cobertura: "Toda a Organização", ativo: true },
];

/** Serviços adicionais — somados ao catálogo corporativo. */
export const SERVICOS_EXTRAS_SEED: Servico[] = [
  { id: "sv11", nome: "Suporte ao Sistema Tributário", categoriaId: "cat5", grupoId: "g4", descricao: "Atendimento ao sistema de arrecadação e tributação, com responsável global dedicado para toda a organização.", requerAprovacao: false, regraAprovacaoId: null, prioridadePadrao: "Alta", selecaoTecnico: "Obrigatório", tecnicoPreferencialId: "u6" },
  { id: "sv12", nome: "Suporte ao Portal da Transparência", categoriaId: "cat5", grupoId: "g4", descricao: "Publicação de dados, correções e acessos administrativos do Portal da Transparência.", requerAprovacao: false, regraAprovacaoId: null, prioridadePadrao: "Normal", selecaoTecnico: "Opcional", tecnicoPreferencialId: "u1" },
];

/* ===================== Licenciamento ===================== */

export interface LicencaSistema {
  produto: string; organizacao: string; instalacaoId: string; tipo: string;
  ativacao: string; validade: string; status: "Ativa" | "Período de Tolerância" | "Expirada" | "Suspensa" | "Revogada";
  modulos: string[]; ultimaValidacao: string; toleranciaDias: number; assinatura: string;
}
export const LICENCA_SEED: LicencaSistema = {
  produto: "GovFlow — Plataforma Integrada de Gestão",
  organizacao: "Prefeitura Municipal de Cidade Exemplo",
  instalacaoId: "GF-7F41-92AC-8B23",
  tipo: "Licença perpétua com manutenção anual",
  ativacao: isoRel(-320), validade: isoData(210), status: "Ativa",
  modulos: ["Núcleo (Organização, Usuários, Projetos)", "Comunicação", "Central de Serviços", "Patrimônio de TI", "Relatórios Avançados"],
  ultimaValidacao: isoRel(-2), toleranciaDias: 30,
  assinatura: "ED25519::8f4aKj2…demonstração",
};
export interface EventoLicenca { id: string; data: string; evento: string; status: string; origem: string; detalhe: string; }
export const EVENTOS_LICENCA_SEED: EventoLicenca[] = [
  { id: "evl1", data: isoRel(-320, 9, 15), evento: "Ativação da licença", status: "Ativa", origem: "Arquivo govflow-license.lic", detalhe: "Assinatura verificada com a chave pública embutida." },
  { id: "evl2", data: isoRel(-60, 6, 0), evento: "Validação periódica", status: "Ativa", origem: "Servidor de licenciamento", detalhe: "Validação online concluída sem pendências." },
  { id: "evl3", data: isoRel(-2, 6, 0), evento: "Validação periódica", status: "Ativa", origem: "Servidor de licenciamento", detalhe: "Validação online concluída sem pendências." },
];

export interface SnapshotRelatorio { id: string; nome: string; data: string; filtros: string; total: number; usuario: string; hash: string; }

/* ===================== Ativos adicionais (qualidade de dados) ===================== */

export const ATIVOS_INCOMPLETOS_SEED: Ativo[] = [
  {
    id: "ati1", patrimonio: "000722", codigoInterno: "SEMED-PJ-002", serie: "", categoria: "Projetor",
    fabricante: "Epson", modelo: "PowerLite X51+", aquisicao: isoData(-300), valor: 4120, notaFiscal: "NF 15.930",
    fornecedor: "Armazém Digital", garantiaFim: isoData(430), status: "Em Uso",
    obs: "Cadastrado na migração da planilha da Educação — série pendente de verificação física.",
    unidadeId: "un3", responsavelId: "u10", predio: "SEMED", sala: "Sala de Formação",
    campos: {}, rede: null, historicoIP: [], movimentacoes: [], manutencoes: [],
    pertencimento: { orgaoId: "un0", gestoraId: "ug3", fundoId: "fm2", secretariaId: "un3", departamentoId: null, centroCusto: "CC-0330", responsavelPatrimonialId: "u10" },
  },
  {
    id: "ati2", patrimonio: "000735", codigoInterno: "SAU-IMP-019", serie: "HPLJ-735B", categoria: "Impressora",
    fabricante: "HP", modelo: "LaserJet M15w", aquisicao: isoData(-420), valor: 1390, notaFiscal: "NF 14.810",
    fornecedor: "Kalunga S.A.", garantiaFim: isoData(-60), status: "Em Uso",
    obs: "Responsável e sala pendentes de confirmação após reforma da UBS.",
    unidadeId: "un4", responsavelId: null, predio: "UBS Centro", sala: "",
    campos: {}, rede: null, historicoIP: [], movimentacoes: [], manutencoes: [],
    pertencimento: { orgaoId: "un0", gestoraId: "ug2", fundoId: "fm1", secretariaId: "un4", departamentoId: null, centroCusto: "CC-0442", responsavelPatrimonialId: null },
  },
  {
    id: "ati3", patrimonio: "000741", codigoInterno: "DTI-M-121", serie: "LG24-655", categoria: "Monitor",
    fabricante: "LG", modelo: "24MK430 23,8\"", aquisicao: "", valor: 780, notaFiscal: "NF 16.440",
    fornecedor: "Kalunga S.A.", garantiaFim: isoData(1000), status: "Em Estoque",
    obs: "Possível duplicidade de série com o patrimônio 000655 — verificar antes do tombamento definitivo.",
    unidadeId: "un11", responsavelId: null, predio: "Almoxarifado TI", sala: "Prateleira C-3",
    campos: {}, rede: null, historicoIP: [], movimentacoes: [], manutencoes: [],
  },
  {
    id: "ati4", patrimonio: "", codigoInterno: "SETUR-TAB-004", serie: "TAB-744SM", categoria: "Tablet",
    fabricante: "Samsung", modelo: "Galaxy Tab A9", aquisicao: isoData(-150), valor: 1590, notaFiscal: "NF 16.205",
    fornecedor: "Telefonia Municipal", garantiaFim: isoData(580), status: "Em Uso",
    obs: "Número de patrimônio pendente de etiquetagem.",
    unidadeId: "un5", responsavelId: "u12", predio: "SETUR", sala: "Atendimento",
    campos: {}, rede: null, historicoIP: [], movimentacoes: [], manutencoes: [],
  },
];
