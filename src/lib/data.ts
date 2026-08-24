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
}
export interface Unidade {
  id: string; nome: string; sigla: string;
  tipo: "Órgão" | "Secretaria" | "Departamento" | "Divisão" | "Setor";
  parentId: string | null; responsavelId?: string; ramal?: string;
}
export interface Equipe { id: string; nome: string; unidadeId: string; liderId: string; membroIds: string[]; especialidades: string[]; }
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
  id: string; titulo: string; descricao: string; categoria: "Tecnológico" | "Operacional" | "Financeiro" | "Conformidade";
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
  { id: "un3", nome: "Secretaria Municipal de Educação", sigla: "SEMED", tipo: "Secretaria", parentId: "un0", responsavelId: "u10", ramal: "6300" },
  { id: "un4", nome: "Secretaria Municipal de Saúde", sigla: "SESAU", tipo: "Secretaria", parentId: "un0", responsavelId: "u11", ramal: "6400" },
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
