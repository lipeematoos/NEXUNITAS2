import { isoRel, isoData } from "./format";
import { Ativo } from "./data";

/** Campo de data — escrito de forma indireta para máxima compatibilidade. */
type CampoData = { [k in "data"]: string };
const dt = (v: string): CampoData => ({ ["data"]: v });
const isoDate = isoData;

/* ===================== Camadas e controles ===================== */

export interface CamadaSeguranca { id: string; nome: string; codigo: string; ordem: number; descricao: string; tipo: string; status: "Ativa" | "Em implantação" | "Inativa"; obs?: string; }

export const CAMADAS_SEED: CamadaSeguranca[] = [
  { id: "cam1", nome: "Camada Física", codigo: "FIS", ordem: 1, descricao: "Proteção de CPD, salas técnicas, racks e equipamentos contra acesso físico indevido.", tipo: "Física", status: "Ativa" },
  { id: "cam2", nome: "Perímetro", codigo: "PER", ordem: 2, descricao: "Defesa de borda: firewall físico, links e controle de tráfego de entrada e saída.", tipo: "Perímetro", status: "Ativa" },
  { id: "cam3", nome: "Rede", codigo: "RED", ordem: 3, descricao: "Segmentação por VLANs e zonas, controle de tráfego interno e detecção de varreduras.", tipo: "Rede", status: "Ativa" },
  { id: "cam4", nome: "Firewall Lógico", codigo: "FWL", ordem: 4, descricao: "Filtragem adicional instalada em servidor, protegendo a rede de servidores e serviços.", tipo: "Lógica", status: "Ativa" },
  { id: "cam5", nome: "Servidores", codigo: "SRV", ordem: 5, descricao: "Hardening, serviços essenciais mínimos, patches e contas de serviço dedicadas.", tipo: "Servidores", status: "Ativa" },
  { id: "cam6", nome: "Endpoint", codigo: "END", ordem: 6, descricao: "Antivírus/EDR, criptografia de disco e políticas de dispositivo nas estações.", tipo: "Endpoint", status: "Ativa" },
  { id: "cam7", nome: "Aplicação", codigo: "APP", ordem: 7, descricao: "Revisão de código, homologação, WAF e controle de publicação dos sistemas municipais.", tipo: "Aplicação", status: "Em implantação" },
  { id: "cam8", nome: "Identidade", codigo: "IDE", ordem: 8, descricao: "Diretório corporativo, MFA, contas privilegiadas e revisão periódica de acessos.", tipo: "Identidade", status: "Ativa" },
  { id: "cam9", nome: "Dados", codigo: "DAD", ordem: 9, descricao: "Classificação da informação, criptografia, LGPD e mascaramento de dados sensíveis.", tipo: "Dados", status: "Em implantação" },
  { id: "cam10", nome: "Monitoramento", codigo: "MON", ordem: 10, descricao: "Coleta de logs, alertas, SIEM e análise de eventos de segurança.", tipo: "Monitoramento", status: "Em implantação" },
  { id: "cam11", nome: "Continuidade", codigo: "CON", ordem: 11, descricao: "Backups testados, planos de recuperação e exercícios de restauração.", tipo: "Continuidade", status: "Ativa" },
];

export interface ControleSeguranca {
  id: string; nome: string; descricao: string; camadaId: string; categoria: string;
  tipoControle: "Preventivo" | "Detectivo" | "Corretivo" | "Compensatório" | "Recuperação";
  ativoId?: string; sistemaRelacionado?: string; responsavelId: string; unidadeId: string;
  status: "Implementado" | "Parcialmente Implementado" | "Planejado" | "Em Implantação" | "Não Implementado" | "Não Aplicável";
  implantadoEm?: string; ultimaRevisao?: string; proximaRevisao?: string; evidencias?: string; obs?: string;
}

export const CONTROLES_SEED: ControleSeguranca[] = [
  { id: "ct1", nome: "Firewall Físico de Perímetro", descricao: "Appliance de borda com filtragem estado, NAT e regras de entrada/saída.", camadaId: "cam2", categoria: "Rede", tipoControle: "Preventivo", ativoId: "as1", responsavelId: "u4", unidadeId: "un111", status: "Implementado", implantadoEm: isoData(-700), ultimaRevisao: isoData(-60), proximaRevisao: isoData(120), evidencias: "Política de regras revisada — Rev. 2026-01" },
  { id: "ct2", nome: "Firewall Lógico em Servidor", descricao: "Filtragem interna protegendo a rede de servidores e serviços críticos.", camadaId: "cam4", categoria: "Lógica", tipoControle: "Preventivo", ativoId: "as2", responsavelId: "u4", unidadeId: "un111", status: "Implementado", implantadoEm: isoData(-400), ultimaRevisao: isoData(-60), proximaRevisao: isoData(120), evidencias: "Regras exportadas e arquivadas" },
  { id: "ct3", nome: "Segmentação por VLAN e Zonas", descricao: "Separação de redes administrativas, servidores, Wi-Fi, CFTV e voz.", camadaId: "cam3", categoria: "Rede", tipoControle: "Preventivo", ativoId: "as3", responsavelId: "u3", unidadeId: "un111", status: "Implementado", implantadoEm: isoData(-500), ultimaRevisao: isoData(-90), proximaRevisao: isoData(90), evidencias: "Diagrama de VLANs v3.2" },
  { id: "ct4", nome: "Controle de Acesso Biométrico — CPD", descricao: "Acesso físico ao CPD mediante biometria e registro de entradas.", camadaId: "cam1", categoria: "Física", tipoControle: "Preventivo", responsavelId: "u2", unidadeId: "un11", status: "Implementado", implantadoEm: isoData(-800), ultimaRevisao: isoData(-30), proximaRevisao: isoData(150), evidencias: "Relatório de acessos mensal" },
  { id: "ct5", nome: "CFTV do Datacenter", descricao: "Câmeras com gravação 90 dias cobrindo entradas e corredores frios.", camadaId: "cam1", categoria: "Física", tipoControle: "Detectivo", responsavelId: "u2", unidadeId: "un11", status: "Implementado", ultimaRevisao: isoData(-45), proximaRevisao: isoData(135), evidencias: "Gravações íntegras verificadas" },
  { id: "ct6", nome: "EDR nas Estações", descricao: "Detecção e resposta em endpoints com console centralizado.", camadaId: "cam6", categoria: "Endpoint", tipoControle: "Detectivo", responsavelId: "u4", unidadeId: "un111", status: "Parcialmente Implementado", implantadoEm: isoData(-200), ultimaRevisao: isoData(-15), proximaRevisao: isoData(45), evidencias: "86% do parque coberto", obs: "Estações antigas pendentes de substituição." },
  { id: "ct7", nome: "MFA para Contas Privilegiadas", descricao: "Segundo fator obrigatório para administradores de domínio e sistemas.", camadaId: "cam8", categoria: "Identidade", tipoControle: "Preventivo", responsavelId: "u2", unidadeId: "un11", status: "Parcialmente Implementado", ultimaRevisao: isoData(-20), proximaRevisao: isoData(40), evidencias: "MFA ativo para domínio; pendente nos sistemas legados" },
  { id: "ct8", nome: "Revisão Trimestral de Acessos", descricao: "Certificação de acessos por gestor de unidade com trilha de decisão.", camadaId: "cam8", categoria: "Identidade", tipoControle: "Detectivo", responsavelId: "u7", unidadeId: "un12", status: "Em Implantação", proximaRevisao: isoData(30), obs: "Primeiro ciclo previsto para o próximo trimestre." },
  { id: "ct9", nome: "Backup com Cópia Externa", descricao: "Rotinas diárias com cópia semanal fora do datacenter e verificação.", camadaId: "cam11", categoria: "Dados", tipoControle: "Recuperação", ativoId: "at10", responsavelId: "u4", unidadeId: "un111", status: "Implementado", ultimaRevisao: isoData(-10), proximaRevisao: isoData(80), evidencias: "Teste de restauração de 2026 — sucesso" },
  { id: "ct10", nome: "SIEM e Correlação de Logs", descricao: "Centralização de logs com regras de correlação e alertas.", camadaId: "cam10", categoria: "Monitoramento", tipoControle: "Detectivo", responsavelId: "u2", unidadeId: "un11", status: "Não Implementado", obs: "Em fase de especificação; previsto no plano anual de contratações." },
  { id: "ct11", nome: "Nobreak e Gerador — CPD", descricao: "Redundância elétrica com autonomia de 4h e teste mensal.", camadaId: "cam1", categoria: "Física", tipoControle: "Compensatório", responsavelId: "u4", unidadeId: "un111", status: "Implementado", ultimaRevisao: isoData(-25), proximaRevisao: isoData(35), evidencias: "Laudo do teste de carga" },
  { id: "ct12", nome: "Criptografia de Discos — Notebooks", descricao: "Cifragem integral dos notebooks com chaves centralizadas.", camadaId: "cam6", categoria: "Endpoint", tipoControle: "Preventivo", responsavelId: "u4", unidadeId: "un111", status: "Em Implantação", obs: "Lote 2 em andamento (60%).", proximaRevisao: isoData(60) },
  { id: "ct13", nome: "Plano de Continuidade dos Sistemas Críticos", descricao: "RTO/RPO definidos e procedimentos de recuperação documentados.", camadaId: "cam11", categoria: "Continuidade", tipoControle: "Recuperação", responsavelId: "u1", unidadeId: "un112", status: "Parcialmente Implementado", ultimaRevisao: isoData(-70), proximaRevisao: isoData(60), evidencias: "5 planos vigentes; 2 em redação" },
  { id: "ct14", nome: "Treinamento de Conscientização", descricao: "Trilha obrigatória anual com campanhas de phishing simulado.", camadaId: "cam8", categoria: "Pessoas", tipoControle: "Preventivo", responsavelId: "u7", unidadeId: "un12", status: "Implementado", ultimaRevisao: isoData(-50), proximaRevisao: isoData(130), evidencias: "Campanha 2026 — 82% de conclusão" },
];

/* ===================== Firewalls ===================== */

export interface Firewall {
  id: string; nome: string; tipo: "Físico" | "Lógico" | "Virtual" | "Appliance" | "Endpoint" | "Nuvem";
  fabricante: string; modelo: string; ativoId?: string; patrimonio?: string; serie?: string;
  localizacao: string; predio: string; sala: string; rack?: string; u?: string;
  ipGerencia?: string; hostname?: string; firmware?: string; software?: string; versao?: string;
  servidorHospedeiroId?: string; redesProtegidas?: string; servicosProtegidos?: string;
  status: "Ativo" | "Em manutenção" | "Desativado"; altaDisponibilidade: boolean; redundanteId?: string;
  implantadoEm: string; ultimaAtualizacao: string; ultimaRevisao: string;
  responsavelId: string; equipeId?: string; backupConfig: string; obs?: string;
}

export const FIREWALLS_SEED: Firewall[] = [
  {
    id: "fw1", nome: "Firewall de Perímetro Principal", tipo: "Físico", fabricante: "Datacom", modelo: "DM4200",
    ativoId: "as1", patrimonio: "000800", serie: "DCM-4200-8841", localizacao: "CPD", predio: "Paço Municipal",
    sala: "CPD — Sala Cofre", rack: "RACK-01", u: "U01–U02", ipGerencia: "10.0.0.1", hostname: "FW-BORDA-01",
    firmware: "DmOS 4.2.1", status: "Ativo", altaDisponibilidade: false,
    implantadoEm: isoData(-700), ultimaAtualizacao: isoData(-40), ultimaRevisao: isoData(-60),
    responsavelId: "u4", equipeId: "eq4", backupConfig: "Diário às 02h — retido 90 dias",
    obs: "NAT, segmentação de borda, filtragem de entrada/saída e proteção do acesso externo. Registro de demonstração — o fabricante é configurável.",
  },
  {
    id: "fw2", nome: "Firewall Lógico — Rede de Servidores", tipo: "Lógico", fabricante: "Projeto interno", modelo: "Base Linux",
    ativoId: "as2", patrimonio: "000801", serie: "SRV-SEC-01", localizacao: "CPD", predio: "Paço Municipal",
    sala: "CPD — Sala Cofre", rack: "RACK-01", u: "U10–U13", ipGerencia: "10.0.30.5", hostname: "SRV-SEC-01",
    software: "Filtragem por pacotes do SO", versao: "2026.04 LTS", servidorHospedeiroId: "as2",
    redesProtegidas: "VLAN 30 — Servidores · VLAN 0 — Gerência", servicosProtegidos: "AD, DNS, DHCP, Banco de Dados, Portal interno",
    status: "Ativo", altaDisponibilidade: false, implantadoEm: isoData(-400), ultimaAtualizacao: isoData(-20), ultimaRevisao: isoData(-60),
    responsavelId: "u4", equipeId: "eq1", backupConfig: "Regras versionadas no repositório interno",
    obs: "Camada adicional de filtragem interna entre o core e a rede de servidores.",
  },
];

export interface InterfaceFirewall {
  id: string; firewallId: string; nome: string; portaFisica: string; tipo: string; ip: string;
  subrede: string; vlan: string; zona: string; velocidade: string; status: "Ativa" | "Inativa"; descricao: string;
}

export const INTERFACES_FW_SEED: InterfaceFirewall[] = [
  { id: "if1", firewallId: "fw1", nome: "eth0", portaFisica: "SFP+ 1", tipo: "WAN", ip: "200.231.44.10", subrede: "/30", vlan: "—", zona: "WAN", velocidade: "1 Gbps", status: "Ativa", descricao: "Link principal — operadora Alfa" },
  { id: "if2", firewallId: "fw1", nome: "eth1", portaFisica: "SFP+ 2", tipo: "WAN", ip: "189.40.72.6", subrede: "/30", vlan: "—", zona: "WAN", velocidade: "500 Mbps", status: "Ativa", descricao: "Link de backup — operadora Beta" },
  { id: "if3", firewallId: "fw1", nome: "eth2", portaFisica: "RJ45 1", tipo: "LAN", ip: "10.0.0.2", subrede: "255.255.0.0", vlan: "VLAN 2 — Core", zona: "LAN", velocidade: "1 Gbps", status: "Ativa", descricao: "Conexão com o Core Switch" },
  { id: "if4", firewallId: "fw1", nome: "eth3", portaFisica: "RJ45 2", tipo: "DMZ", ip: "10.0.200.1", subrede: "255.255.255.0", vlan: "VLAN 200 — DMZ", zona: "DMZ", velocidade: "1 Gbps", status: "Ativa", descricao: "Serviços publicados (Portal cidadão)" },
  { id: "if5", firewallId: "fw2", nome: "ens192", portaFisica: "vmnic1", tipo: "Interna", ip: "10.0.30.5", subrede: "255.255.255.0", vlan: "VLAN 30 — Servidores", zona: "SERVIDORES", velocidade: "10 Gbps", status: "Ativa", descricao: "Filtragem da rede de servidores" },
  { id: "if6", firewallId: "fw2", nome: "ens193", portaFisica: "vmnic2", tipo: "Gerência", ip: "10.0.0.5", subrede: "255.255.255.0", vlan: "VLAN 0 — Gerência", zona: "GESTAO", velocidade: "1 Gbps", status: "Ativa", descricao: "Plano de gerência do CPD" },
];

export interface RegraFirewall {
  id: string; firewallId: string; nome: string; origem: string; destino: string; servico: string;
  protocolo: string; acao: "Permitir" | "Bloquear" | "Registrar" | "Outro"; justificativa: string;
  responsavelId: string; criadaEm: string; ultimaRevisao: string; status: "Ativa" | "Inativa"; chamadoRelacionado?: string;
}

export const REGRAS_FW_SEED: RegraFirewall[] = [
  { id: "rg1", firewallId: "fw1", nome: "NAT de saída — LAN", origem: "LAN (10.0.0.0/16)", destino: "Internet", servico: "Todos", protocolo: "TCP/UDP", acao: "Permitir", justificativa: "Navegação corporativa com NAT e filtro de conteúdo.", responsavelId: "u4", criadaEm: isoData(-690), ultimaRevisao: isoData(-60), status: "Ativa" },
  { id: "rg2", firewallId: "fw1", nome: "Portal Cidadão — HTTPS", origem: "Internet", destino: "DMZ (10.0.200.10)", servico: "443", protocolo: "TCP", acao: "Permitir", justificativa: "Publicação do Portal de Serviços.", responsavelId: "u1", criadaEm: isoData(-300), ultimaRevisao: isoData(-60), status: "Ativa", chamadoRelacionado: "TI-2026-000001" },
  { id: "rg3", firewallId: "fw1", nome: "VPN — Acesso remoto", origem: "Internet", destino: "FW (IPSec)", servico: "UDP 500/4500", protocolo: "IPSec", acao: "Permitir", justificativa: "Acesso remoto seguro para equipes autorizadas.", responsavelId: "u3", criadaEm: isoData(-500), ultimaRevisao: isoData(-60), status: "Ativa" },
  { id: "rg4", firewallId: "fw1", nome: "Default deny — WAN", origem: "Internet", destino: "Qualquer", servico: "Todos", protocolo: "Todos", acao: "Bloquear", justificativa: "Negação padrão de todo tráfego de entrada não autorizado.", responsavelId: "u4", criadaEm: isoData(-700), ultimaRevisao: isoData(-60), status: "Ativa" },
  { id: "rg5", firewallId: "fw1", nome: "Registro de tentativas — portas de gerência", origem: "Internet", destino: "FW (22/443 gerência)", servico: "22, 443", protocolo: "TCP", acao: "Registrar", justificativa: "Auditoria de tentativas de acesso à gerência do equipamento.", responsavelId: "u4", criadaEm: isoData(-700), ultimaRevisao: isoData(-60), status: "Ativa" },
  { id: "rg6", firewallId: "fw1", nome: "CFTV sem Internet", origem: "VLAN 60 — CFTV", destino: "Internet", servico: "Todos", protocolo: "Todos", acao: "Bloquear", justificativa: "Rede de videomonitoramento isolada da Internet.", responsavelId: "u3", criadaEm: isoData(-450), ultimaRevisao: isoData(-60), status: "Ativa" },
  { id: "rg7", firewallId: "fw2", nome: "Administração → Banco de Dados", origem: "VLAN 10 — Administração", destino: "SRV-DB-01", servico: "1433", protocolo: "TCP", acao: "Permitir", justificativa: "Acesso das estações homologadas ao sistema tributário.", responsavelId: "u4", criadaEm: isoData(-390), ultimaRevisao: isoData(-60), status: "Ativa", chamadoRelacionado: "TI-2026-000003" },
  { id: "rg8", firewallId: "fw2", nome: "Servidores → Internet (atualizações)", origem: "VLAN 30 — Servidores", destino: "Internet (WSUS/repos)", servico: "80, 443", protocolo: "TCP", acao: "Permitir", justificativa: "Atualizações de sistemas via proxy interno.", responsavelId: "u4", criadaEm: isoData(-380), ultimaRevisao: isoData(-60), status: "Ativa" },
];

export interface RevisaoRegraFirewall { campanha: string; regraId: string; decisao: "Manter" | "Alterar" | "Desativar" | "Excluir" | "Revisar posteriormente" | null; revisor: string | null; data: string | null; justificativa: string | null; }

export const REVISAO_REGRAS_SEED: RevisaoRegraFirewall[] = [
  { campanha: "Revisão Semestral de Firewall — 2026", regraId: "rg1", decisao: "Manter", revisor: "Rafael Duarte Pinto", data: isoData(-58), justificativa: "Regra essencial, sem alterações de escopo." },
  { campanha: "Revisão Semestral de Firewall — 2026", regraId: "rg2", decisao: "Manter", revisor: "Rafael Duarte Pinto", data: isoData(-58), justificativa: "Portal em produção." },
  { campanha: "Revisão Semestral de Firewall — 2026", regraId: "rg3", decisao: null, revisor: null, data: null, justificativa: null },
  { campanha: "Revisão Semestral de Firewall — 2026", regraId: "rg4", decisao: "Manter", revisor: "Rafael Duarte Pinto", data: isoData(-58), justificativa: "Negação padrão obrigatória." },
  { campanha: "Revisão Semestral de Firewall — 2026", regraId: "rg5", decisao: null, revisor: null, data: null, justificativa: null },
  { campanha: "Revisão Semestral de Firewall — 2026", regraId: "rg6", decisao: null, revisor: null, data: null, justificativa: null },
  { campanha: "Revisão Semestral de Firewall — 2026", regraId: "rg7", decisao: null, revisor: null, data: null, justificativa: null },
  { campanha: "Revisão Semestral de Firewall — 2026", regraId: "rg8", decisao: "Revisar posteriormente", revisor: "Juliana Freitas Almeida", data: isoData(-30), justificativa: "Aguardando migração do repositório para o proxy novo." },
];

/* ===================== Topologia ===================== */

export interface NoTopologia {
  id: string; nome: string; tipo: string; ativoId?: string; ip?: string; hostname?: string;
  localizacao: string; criticidade: "Baixa" | "Média" | "Alta" | "Crítica"; status: "Operacional" | "Degradado" | "Indisponível";
  notas?: string; x: number; y: number;
}

export const NOS_TOPOLOGIA_SEED: NoTopologia[] = [
  { id: "t1", nome: "Internet / ISP", tipo: "Link", localizacao: "Externo", criticidade: "Crítica", status: "Operacional", x: 80, y: 320, notas: "Dois provedores com balanceamento passivo." },
  { id: "t2", nome: "Firewall Físico Datacom", tipo: "Firewall", ativoId: "as1", ip: "10.0.0.1", hostname: "FW-BORDA-01", localizacao: "CPD · RACK-01 U01–U02", criticidade: "Crítica", status: "Operacional", x: 280, y: 320, notas: "Borda única — sem redundância física (ponto único de falha)." },
  { id: "t3", nome: "Core Switch", tipo: "Switch", ativoId: "as3", ip: "10.0.2.1", hostname: "CORE-SW-01", localizacao: "CPD · RACK-01 U05–U06", criticidade: "Crítica", status: "Operacional", x: 480, y: 320 },
  { id: "t4", nome: "SRV-SEC-01 (Firewall Lógico)", tipo: "Servidor", ativoId: "as2", ip: "10.0.30.5", hostname: "SRV-SEC-01", localizacao: "CPD · RACK-01 U10–U13", criticidade: "Alta", status: "Operacional", x: 680, y: 320, notas: "Hospeda a filtragem lógica da rede de servidores." },
  { id: "t5", nome: "Rede Administrativa — VLAN 10", tipo: "Rede", localizacao: "Paço Municipal", criticidade: "Média", status: "Operacional", x: 680, y: 120 },
  { id: "t6", nome: "Rede de Servidores — VLAN 30", tipo: "Rede", localizacao: "CPD", criticidade: "Crítica", status: "Operacional", x: 880, y: 320 },
  { id: "t7", nome: "Wi-Fi Corporativo — VLAN 40", tipo: "Rede", localizacao: "Todas as unidades", criticidade: "Baixa", status: "Operacional", x: 480, y: 520 },
  { id: "t8", nome: "SRV-AD-01 — Diretório", tipo: "Servidor", ip: "10.0.30.10", hostname: "SRV-AD-01", localizacao: "VLAN 30 — virtualizado", criticidade: "Crítica", status: "Operacional", x: 1080, y: 140, notas: "AD, DNS e DHCP corporativos." },
  { id: "t9", nome: "SRV-DB-01 — Banco de Dados", tipo: "Servidor", ip: "10.0.30.20", hostname: "SRV-DB-01", localizacao: "VLAN 30 — virtualizado", criticidade: "Crítica", status: "Operacional", x: 1080, y: 300 },
  { id: "t10", nome: "SRV-WEB-01 — Portal", tipo: "Servidor", ip: "10.0.200.10", hostname: "SRV-WEB-01", localizacao: "DMZ — virtualizado", criticidade: "Alta", status: "Operacional", x: 1080, y: 460 },
  { id: "t11", nome: "NAS-BACKUP-01", tipo: "Storage", ativoId: "at10", ip: "192.168.0.30", hostname: "NAS-BACKUP-01", localizacao: "CPD · RACK-02", criticidade: "Alta", status: "Operacional", x: 880, y: 520 },
];

export interface ConexaoTopologia {
  id: string; origem: string; destino: string; velocidade: string; vlan?: string;
  redundante: boolean; tipoLink: string; status: "Ativo" | "Inativo";
}

export const CONEXOES_TOPOLOGIA_SEED: ConexaoTopologia[] = [
  { id: "cx1", origem: "t1", destino: "t2", velocidade: "1 Gbps", redundante: true, tipoLink: "Fibra (operadora)", status: "Ativo" },
  { id: "cx2", origem: "t2", destino: "t3", velocidade: "1 Gbps", redundante: false, tipoLink: "Cobre", status: "Ativo" },
  { id: "cx3", origem: "t3", destino: "t4", velocidade: "10 Gbps", vlan: "VLAN 30", redundante: false, tipoLink: "Fibra multimodo", status: "Ativo" },
  { id: "cx4", origem: "t3", destino: "t5", velocidade: "1 Gbps", vlan: "VLAN 10", redundante: false, tipoLink: "Cobre", status: "Ativo" },
  { id: "cx5", origem: "t3", destino: "t7", velocidade: "1 Gbps", vlan: "VLAN 40", redundante: false, tipoLink: "Cobre", status: "Ativo" },
  { id: "cx6", origem: "t4", destino: "t6", velocidade: "10 Gbps", vlan: "VLAN 30", redundante: false, tipoLink: "Fibra multimodo", status: "Ativo" },
  { id: "cx7", origem: "t6", destino: "t8", velocidade: "10 Gbps", redundante: false, tipoLink: "Virtual", status: "Ativo" },
  { id: "cx8", origem: "t6", destino: "t9", velocidade: "10 Gbps", redundante: false, tipoLink: "Virtual", status: "Ativo" },
  { id: "cx9", origem: "t6", destino: "t10", velocidade: "1 Gbps", vlan: "VLAN 200", redundante: false, tipoLink: "Virtual", status: "Ativo" },
  { id: "cx10", origem: "t6", destino: "t11", velocidade: "10 Gbps", redundante: true, tipoLink: "Fibra", status: "Ativo" },
];

/* ===================== Rede e segmentação ===================== */

export interface Vlan { id: string; numero: number; nome: string; rede: string; gateway: string; finalidade: string; unidadeId: string; zona: string; status: "Ativa" | "Inativa"; }

export const VLANS_SEED: Vlan[] = [
  { id: "vl10", numero: 10, nome: "Administração", rede: "10.0.10.0/24", gateway: "10.0.10.1", finalidade: "Estações administrativas do Paço", unidadeId: "un1", zona: "LAN", status: "Ativa" },
  { id: "vl20", numero: 20, nome: "Fazenda", rede: "10.0.11.0/24", gateway: "10.0.11.1", finalidade: "Estações da SEFAZ (sistema tributário)", unidadeId: "un2", zona: "LAN", status: "Ativa" },
  { id: "vl30", numero: 30, nome: "Servidores", rede: "10.0.30.0/24", gateway: "10.0.30.1", finalidade: "Servidores e serviços críticos", unidadeId: "un11", zona: "SERVIDORES", status: "Ativa" },
  { id: "vl40", numero: 40, nome: "Wi-Fi Corporativo", rede: "10.0.40.0/24", gateway: "10.0.40.1", finalidade: "Dispositivos corporativos sem fio", unidadeId: "un11", zona: "WIFI", status: "Ativa" },
  { id: "vl50", numero: 50, nome: "Visitantes", rede: "10.0.50.0/24", gateway: "10.0.50.1", finalidade: "Acesso isolado de visitantes", unidadeId: "un1", zona: "Visitantes", status: "Ativa" },
  { id: "vl60", numero: 60, nome: "CFTV", rede: "10.0.60.0/24", gateway: "10.0.60.1", finalidade: "Videomonitoramento (sem Internet)", unidadeId: "un11", zona: "CFTV", status: "Ativa" },
];

export interface ZonaSeguranca { id: string; nome: string; descricao: string; }
export const ZONAS_SEED: ZonaSeguranca[] = [
  { id: "z1", nome: "Internet", descricao: "Rede externa não confiável" }, { id: "z2", nome: "WAN", descricao: "Enlaces entre unidades" },
  { id: "z3", nome: "LAN", descricao: "Redes administrativas" }, { id: "z4", nome: "DMZ", descricao: "Serviços publicados" },
  { id: "z5", nome: "SERVIDORES", descricao: "Rede de servidores internos" }, { id: "z6", nome: "Usuários", descricao: "Estações de trabalho" },
  { id: "z7", nome: "Visitantes", descricao: "Acesso temporário isolado" }, { id: "z8", nome: "CFTV", descricao: "Videomonitoramento" },
  { id: "z9", nome: "VOIP", descricao: "Telefonia IP" }, { id: "z10", nome: "GESTAO", descricao: "Gerência de rede" },
];

/* ===================== Segurança física ===================== */

export interface AmbienteFisico {
  id: string; nome: string; predio: string; sala: string; responsavelId: string; criticidade: "Baixa" | "Média" | "Alta" | "Crítica";
  controles: { nome: string; situacao: "Conforme" | "Parcial" | "Não Conforme" | "Não Verificado" }[];
  ultimaInspecao: string; proximaInspecao: string; obs?: string;
}

export const AMBIENTES_FISICOS_SEED: AmbienteFisico[] = [
  {
    id: "amb1", nome: "CPD Principal", predio: "Paço Municipal", sala: "Sala Cofre — Térreo", responsavelId: "u2", criticidade: "Crítica",
    controles: [
      { nome: "Controle biométrico", situacao: "Conforme" }, { nome: "CFTV", situacao: "Conforme" },
      { nome: "Climatização de precisão", situacao: "Conforme" }, { nome: "Nobreak", situacao: "Conforme" },
      { nome: "Gerador", situacao: "Conforme" }, { nome: "Detector de fumaça", situacao: "Conforme" },
      { nome: "Supressão de incêndio (gás)", situacao: "Parcial" }, { nome: "Sensor de umidade", situacao: "Conforme" },
      { nome: "Registro de entrada", situacao: "Conforme" },
    ],
    ultimaInspecao: isoData(-30), proximaInspecao: isoData(60), obs: "Recarga do agente de supressão prevista no contrato de manutenção.",
  },
  {
    id: "amb2", nome: "Sala Técnica — SEMED", predio: "Secretaria de Educação", sala: "2º andar", responsavelId: "u5", criticidade: "Média",
    controles: [
      { nome: "Porta com chave", situacao: "Conforme" }, { nome: "CFTV", situacao: "Não Verificado" },
      { nome: "Nobreak", situacao: "Conforme" }, { nome: "Extintor", situacao: "Conforme" },
      { nome: "Controle de visitantes", situacao: "Parcial" },
    ],
    ultimaInspecao: isoData(-90), proximaInspecao: isoData(15),
  },
  {
    id: "amb3", nome: "Telecom Room — SESAU", predio: "Secretaria de Saúde", sala: "Subsolo", responsavelId: "u3", criticidade: "Alta",
    controles: [
      { nome: "Fechadura eletrônica", situacao: "Conforme" }, { nome: "Alarme", situacao: "Parcial" },
      { nome: "Sensor de temperatura", situacao: "Conforme" }, { nome: "Extintor", situacao: "Não Conforme" },
    ],
    ultimaInspecao: isoData(-120), proximaInspecao: isoData(-10), obs: "Extintor vencido — chamado de reposição aberto.",
  },
];

export interface Rack { id: string; nome: string; local: string; alturaU: number; status: "Ativo" | "Em expansão"; responsavelId: string; posicoes: { u: string; descricao: string; ativoId?: string }[]; }

export const RACKS_SEED: Rack[] = [
  {
    id: "rk1", nome: "RACK-01", local: "CPD — Sala Cofre", alturaU: 42, status: "Ativo", responsavelId: "u4",
    posicoes: [
      { u: "U01–U02", descricao: "Firewall Físico Datacom DM4200", ativoId: "as1" },
      { u: "U05–U06", descricao: "Core Switch", ativoId: "as3" },
      { u: "U08–U09", descricao: "Switch de Gerência", },
      { u: "U10–U13", descricao: "Servidor SRV-SEC-01 (Firewall Lógico)", ativoId: "as2" },
      { u: "U20–U24", descricao: "Nobreak 3 kVA", },
      { u: "U30–U32", descricao: "Patch panels — 240 pontos", },
    ],
  },
  { id: "rk2", nome: "RACK-02", local: "CPD — Sala Cofre", alturaU: 24, status: "Ativo", responsavelId: "u4", posicoes: [{ u: "U04–U08", descricao: "NAS-BACKUP-01", ativoId: "at10" }, { u: "U12–U14", descricao: "DVR — CFTV", }] },
];

/* ===================== Ativos críticos e redundância ===================== */

export interface AtivoCritico {
  ativoId: string; criticidade: "Baixa" | "Média" | "Alta" | "Crítica"; justificativa: string;
  dependencias: string; servicosAfetados: string; rto: string; rpo: string;
  redundancia: "Sem Redundância" | "Redundância Parcial" | "Redundante" | "Alta Disponibilidade";
  backup: string; responsavelId: string;
}

export const ATIVOS_CRITICOS_SEED: AtivoCritico[] = [
  { ativoId: "as1", criticidade: "Crítica", justificativa: "Todo o tráfego de entrada/saída da Prefeitura passa por este equipamento.", dependencias: "Links de Internet; Core Switch", servicosAfetados: "Internet, Portal, VPN, Sistema Tributário, Saúde, e-mail", rto: "2h", rpo: "—", redundancia: "Sem Redundância", backup: "Configuração diária", responsavelId: "u4" },
  { ativoId: "as3", criticidade: "Crítica", justificativa: "Núcleo de comutação interliga todas as VLANs e o datacenter.", dependencias: "Firewall físico; Switches de acesso", servicosAfetados: "Todas as redes internas", rto: "4h", rpo: "—", redundancia: "Sem Redundância", backup: "Configuração semanal", responsavelId: "u3" },
  { ativoId: "as2", criticidade: "Alta", justificativa: "Hospeda a filtragem lógica e a console de monitoramento.", dependencias: "Core Switch; SRV-AD-01", servicosAfetados: "Rede de servidores, alertas", rto: "4h", rpo: "24h", redundancia: "Sem Redundância", backup: "VM replicada semanalmente", responsavelId: "u4" },
  { ativoId: "at10", criticidade: "Alta", justificativa: "Repositório central de backups dos sistemas críticos.", dependencias: "Rede de servidores", servicosAfetados: "Recuperação de todos os sistemas", rto: "8h", rpo: "24h", redundancia: "Redundância Parcial", backup: "Snapshot + cópia externa", responsavelId: "u4" },
];

export interface LinkInternet {
  id: string; provedor: string; contrato: string; velocidade: string; ipPublico: string; tipo: string;
  papel: "Principal" | "Backup"; localizacao: string; firewallId: string; status: "Operacional" | "Indisponível"; sla: string; responsavelId: string;
}

export const LINKS_SEED: LinkInternet[] = [
  { id: "lk1", provedor: "Operadora Alfa", contrato: "CT-2025-021", velocidade: "1 Gbps", ipPublico: "200.231.44.10", tipo: "Fibra dedicada", papel: "Principal", localizacao: "Paço Municipal", firewallId: "fw1", status: "Operacional", sla: "99,5% — reparo em 4h", responsavelId: "u3" },
  { id: "lk2", provedor: "Operadora Beta", contrato: "CT-2025-036", velocidade: "500 Mbps", ipPublico: "189.40.72.6", tipo: "Fibra dedicada", papel: "Backup", localizacao: "Paço Municipal", firewallId: "fw1", status: "Operacional", sla: "99% — reparo em 8h", responsavelId: "u3" },
];

/* ===================== Servidores e sistemas ===================== */

export interface ServicoServidor { nome: string; porta: string; protocolo: string; status: "Operacional" | "Degradado" | "Parado"; criticidade: "Baixa" | "Média" | "Alta" | "Crítica"; responsavelId: string; dependencias: string; }
export interface ServidorDoc {
  ativoId: string; hostname: string; ip: string; so: string; cpu: string; ram: string; storage: string;
  hypervisor: string; tipo: "Físico" | "Virtual"; dominio: string; localizacao: string;
  criticidade: "Baixa" | "Média" | "Alta" | "Crítica"; status: "Operacional" | "Degradado"; equipeId: string;
  servicos: ServicoServidor[];
}

export const SERVIDORES_SEED: ServidorDoc[] = [
  {
    ativoId: "as2", hostname: "SRV-SEC-01", ip: "10.0.30.5", so: "Linux LTS", cpu: "8 vCPU", ram: "32 GB", storage: "500 GB SSD",
    hypervisor: "VMware ESXi", tipo: "Virtual", dominio: "prefeitura.local", localizacao: "VLAN 30 — CPD",
    criticidade: "Alta", status: "Operacional", equipeId: "eq1",
    servicos: [
      { nome: "Firewall Lógico (filtragem)", porta: "—", protocolo: "—", status: "Operacional", criticidade: "Crítica", responsavelId: "u4", dependencias: "Core Switch" },
      { nome: "Monitoramento (Zabbix)", porta: "10050/10051", protocolo: "TCP", status: "Operacional", criticidade: "Alta", responsavelId: "u4", dependencias: "SRV-DB-01" },
    ],
  },
  {
    ativoId: "srv-ad", hostname: "SRV-AD-01", ip: "10.0.30.10", so: "Windows Server", cpu: "4 vCPU", ram: "16 GB", storage: "300 GB SSD",
    hypervisor: "VMware ESXi", tipo: "Virtual", dominio: "prefeitura.local", localizacao: "VLAN 30 — CPD",
    criticidade: "Crítica", status: "Operacional", equipeId: "eq1",
    servicos: [
      { nome: "Active Directory", porta: "389/636", protocolo: "LDAP", status: "Operacional", criticidade: "Crítica", responsavelId: "u4", dependencias: "—" },
      { nome: "DNS", porta: "53", protocolo: "TCP/UDP", status: "Operacional", criticidade: "Crítica", responsavelId: "u4", dependencias: "—" },
      { nome: "DHCP", porta: "67", protocolo: "UDP", status: "Operacional", criticidade: "Alta", responsavelId: "u4", dependencias: "Core Switch" },
    ],
  },
  {
    ativoId: "srv-db", hostname: "SRV-DB-01", ip: "10.0.30.20", so: "Windows Server", cpu: "8 vCPU", ram: "64 GB", storage: "2 TB SSD",
    hypervisor: "VMware ESXi", tipo: "Virtual", dominio: "prefeitura.local", localizacao: "VLAN 30 — CPD",
    criticidade: "Crítica", status: "Operacional", equipeId: "eq3",
    servicos: [
      { nome: "Banco de Dados — Tributário", porta: "1433", protocolo: "TCP", status: "Operacional", criticidade: "Crítica", responsavelId: "u6", dependencias: "SRV-AD-01" },
      { nome: "Banco de Dados — Saúde", porta: "1434", protocolo: "TCP", status: "Operacional", criticidade: "Crítica", responsavelId: "u6", dependencias: "SRV-AD-01" },
    ],
  },
  {
    ativoId: "srv-web", hostname: "SRV-WEB-01", ip: "10.0.200.10", so: "Linux LTS", cpu: "4 vCPU", ram: "16 GB", storage: "400 GB SSD",
    hypervisor: "VMware ESXi", tipo: "Virtual", dominio: "prefeitura.local", localizacao: "DMZ (VLAN 200)",
    criticidade: "Alta", status: "Operacional", equipeId: "eq3",
    servicos: [
      { nome: "Portal de Serviços (Web)", porta: "443", protocolo: "HTTPS", status: "Operacional", criticidade: "Alta", responsavelId: "u1", dependencias: "Firewall físico; SRV-DB-01" },
      { nome: "Portal da Transparência", porta: "443", protocolo: "HTTPS", status: "Operacional", criticidade: "Alta", responsavelId: "u1", dependencias: "SRV-DB-01" },
    ],
  },
];

export interface SistemaMunicipal {
  id: string; nome: string; descricao: string; secretariaId: string; gestorId: string; tecnicoId: string;
  responsavelGlobalId?: string; fornecedor: string; contrato: string; url: string; servidor: string; bancoDados: string;
  autenticacao: string; criticidade: "Baixa" | "Média" | "Alta" | "Crítica"; sla: string; backup: string;
  rto: string; rpo: string; status: "Operacional" | "Em implantação" | "Degradado";
}

export const SISTEMAS_SEED: SistemaMunicipal[] = [
  { id: "sis1", nome: "Sistema Tributário", descricao: "Arrecadação, IPTU, ISS e dívida ativa.", secretariaId: "un2", gestorId: "u9", tecnicoId: "u6", responsavelGlobalId: "u6", fornecedor: "Vendor Fiscal", contrato: "CT-2024-011", url: "https://tributario.prefeitura.local", servidor: "SRV-DB-01", bancoDados: "SQL Server", autenticacao: "AD + MFA", criticidade: "Crítica", sla: "99,5%", backup: "Diário + log a cada 15 min", rto: "4h", rpo: "15 min", status: "Operacional" },
  { id: "sis2", nome: "Portal de Serviços", descricao: "Protocolo digital, agendamentos e serviços ao cidadão.", secretariaId: "un1", gestorId: "u1", tecnicoId: "u1", fornecedor: "Desenvolvimento interno", contrato: "—", url: "https://servicos.cidadeexemplo.gov.br", servidor: "SRV-WEB-01", bancoDados: "PostgreSQL", autenticacao: "gov.br / cadastro", criticidade: "Alta", sla: "99%", backup: "Diário", rto: "8h", rpo: "24h", status: "Em implantação" },
  { id: "sis3", nome: "Sistema de Saúde (e-SUS)", descricao: "Atendimento das UBS, vacinas e regulação.", secretariaId: "un4", gestorId: "u11", tecnicoId: "u6", fornecedor: "Ministério da Saúde", contrato: "Adesão federal", url: "https://saude.prefeitura.local", servidor: "SRV-DB-01", bancoDados: "SQL Server", autenticacao: "AD", criticidade: "Crítica", sla: "99%", backup: "Diário", rto: "6h", rpo: "1h", status: "Operacional" },
  { id: "sis4", nome: "Folha de Pagamento", descricao: "Folha, encargos e consignações dos servidores.", secretariaId: "un1", gestorId: "u7", tecnicoId: "u6", fornecedor: "Vendor RH", contrato: "CT-2023-007", url: "https://folha.prefeitura.local", servidor: "SRV-DB-01", bancoDados: "SQL Server", autenticacao: "AD + MFA", criticidade: "Crítica", sla: "99,5%", backup: "Diário + pré-fechamento", rto: "4h", rpo: "1h", status: "Operacional" },
  { id: "sis5", nome: "Protocolo Digital", descricao: "Tramitação de processos administrativos.", secretariaId: "un1", gestorId: "u2", tecnicoId: "u1", fornecedor: "Desenvolvimento interno", contrato: "—", url: "https://protocolo.prefeitura.local", servidor: "SRV-WEB-01", bancoDados: "PostgreSQL", autenticacao: "AD", criticidade: "Alta", sla: "99%", backup: "Diário", rto: "8h", rpo: "24h", status: "Operacional" },
  { id: "sis6", nome: "Portal da Transparência", descricao: "Publicação de receitas, despesas e contratos.", secretariaId: "un2", gestorId: "u9", tecnicoId: "u1", fornecedor: "Desenvolvimento interno", contrato: "—", url: "https://transparencia.cidadeexemplo.gov.br", servidor: "SRV-WEB-01", bancoDados: "PostgreSQL", autenticacao: "Pública", criticidade: "Alta", sla: "99%", backup: "Diário", rto: "8h", rpo: "24h", status: "Operacional" },
];

/* ===================== Identidades e cofre ===================== */

export interface IdentidadeAcesso { id: string; usuario: string; sistema: string; tipoConta: string; nivel: string; concedidoPor: string; aprovadoPor: string; concedidoEm: string; revisao: string; status: "Ativo" | "Suspenso" | "Em revisão"; }

export const IDENTIDADES_SEED: IdentidadeAcesso[] = [
  { id: "id1", usuario: "ana.rocha", sistema: "Active Directory", tipoConta: "Usuário", nivel: "Padrão", concedidoPor: "Carlos Eduardo Menezes", aprovadoPor: "Patrícia Nunes Castro", concedidoEm: isoData(-900), revisao: isoData(45), status: "Ativo" },
  { id: "id2", usuario: "svc-backup", sistema: "Active Directory", tipoConta: "Conta de serviço", nivel: "Privilegiada", concedidoPor: "Carlos Eduardo Menezes", aprovadoPor: "Carlos Eduardo Menezes", concedidoEm: isoData(-700), revisao: isoData(-20), status: "Em revisão" },
  { id: "id3", usuario: "svc-tributario", sistema: "Sistema Tributário", tipoConta: "Conta de aplicação", nivel: "Privilegiada", concedidoPor: "Eduardo Sá Barreto", aprovadoPor: "Fernanda Castro Lima", concedidoEm: isoData(-500), revisao: isoData(30), status: "Ativo" },
  { id: "id4", usuario: "mariana.lopes", sistema: "Firewall de Perímetro", tipoConta: "Usuário", nivel: "Operador (leitura)", concedidoPor: "Rafael Duarte Pinto", aprovadoPor: "Carlos Eduardo Menezes", concedidoEm: isoData(-300), revisao: isoDate0(), status: "Ativo" },
  { id: "id5", usuario: "ex-servidor.0231", sistema: "Active Directory", tipoConta: "Usuário", nivel: "Padrão", concedidoPor: "Patrícia Nunes Castro", aprovadoPor: "Patrícia Nunes Castro", concedidoEm: isoData(-1200), revisao: isoData(-90), status: "Suspenso" },
];

function isoDate0() { return isoData(60); }

export interface AcessoPrivilegiado { id: string; usuarioId: string; sistema: string; privilegio: string; justificativa: string; aprovacao: string; inicio: string; revisao: string; expiracao: string; status: "Ativo" | "Expirado" | "Em revisão"; }

export const PRIVILEGIOS_SEED: AcessoPrivilegiado[] = [
  { id: "pv1", usuarioId: "u2", sistema: "Active Directory", privilegio: "Domain Admin", justificativa: "Administração do diretório corporativo", aprovacao: "Comitê de TI — Ata 2026-02", inicio: isoData(-800), revisao: isoDate0(), expiracao: isoData(180), status: "Ativo" },
  { id: "pv2", usuarioId: "u4", sistema: "Firewall de Perímetro", privilegio: "Administrador do equipamento", justificativa: "Gestão da política de borda", aprovacao: "Comitê de TI — Ata 2026-02", inicio: isoData(-700), revisao: isoDate0(), expiracao: isoData(180), status: "Ativo" },
  { id: "pv3", usuarioId: "u6", sistema: "SRV-DB-01", privilegio: "DBA (sa)", justificativa: "Administração dos bancos críticos", aprovacao: "Gestora SEFAZ", inicio: isoData(-500), revisao: isoData(-15), expiracao: isoData(30), status: "Em revisão" },
  { id: "pv4", usuarioId: "u4", sistema: "Hipervisor", privilegio: "Root / vCenter Admin", justificativa: "Gestão da virtualização", aprovacao: "Comitê de TI — Ata 2026-02", inicio: isoData(-700), revisao: isoDate0(), expiracao: isoData(180), status: "Ativo" },
  { id: "pv5", usuarioId: "u5", sistema: "Backup", privilegio: "Administrador de Backup", justificativa: "Rotinas e restaurações", aprovacao: "Diretor DTI", inicio: isoData(-400), revisao: isoData(-40), expiracao: isoData(-5), status: "Expirado" },
];

export interface CredencialCofre {
  id: string; nome: string; categoria: string; alvo: string; usuarioConta: string;
  segredoCifrado: string; criadoEm: string; rotacionadaEm: string; responsavelId: string; obs?: string;
}

/** Segredos armazenados cifrados em repouso (cifra demonstrativa — em produção: KMS + AES-256). */
export const COFRE_SEED: CredencialCofre[] = [
  { id: "cr1", nome: "Administração — Firewall de Perímetro", categoria: "Equipamento de rede", alvo: "FW-BORDA-01 (10.0.0.1)", usuarioConta: "admin", segredoCifrado: cifrar("demonstracao"), criadoEm: isoData(-700), rotacionadaEm: isoData(-90), responsavelId: "u4", obs: "Acesso apenas via VLAN de gerência." },
  { id: "cr2", nome: "Enable — Core Switch", categoria: "Equipamento de rede", alvo: "CORE-SW-01 (10.0.2.1)", usuarioConta: "admin", segredoCifrado: cifrar("demonstracao"), criadoEm: isoData(-600), rotacionadaEm: isoData(-120), responsavelId: "u3" },
  { id: "cr3", nome: "Banco de Dados — SRV-DB-01", categoria: "Banco de dados", alvo: "SRV-DB-01 (10.0.30.20)", usuarioConta: "svc-admin-db", segredoCifrado: cifrar("demonstracao"), criadoEm: isoData(-500), rotacionadaEm: isoData(-30), responsavelId: "u6" },
  { id: "cr4", nome: "Conta de serviço — Backup", categoria: "Conta de serviço", alvo: "Domínio prefeitura.local", usuarioConta: "svc-backup", segredoCifrado: cifrar("demonstracao"), criadoEm: isoData(-700), rotacionadaEm: isoData(-150), responsavelId: "u4" },
  { id: "cr5", nome: "Chave de API — Gateway de Pagamentos", categoria: "Chave de API", alvo: "Gateway institucional", usuarioConta: "integracao-pmc", segredoCifrado: cifrar("demonstracao"), criadoEm: isoData(-200), rotacionadaEm: isoData(-60), responsavelId: "u1" },
];

export function cifrar(s: string): string {
  try { return btoa(unescape(encodeURIComponent(s)) + "::v1"); } catch { return "cifrado"; }
}
export function decifrar(s: string): string {
  try { return decodeURIComponent(escape(atob(s))).replace("::v1", ""); } catch { return "••••"; }
}

export interface CofreLog { id: string; usuario: string; data: string; credencial: string; acao: string; ip: string; }

export const COFRE_LOG_SEED: CofreLog[] = [
  { id: "cl1", usuario: "Rafael Duarte Pinto", data: isoRel(-2, 15, 40), credencial: "Administração — Firewall de Perímetro", acao: "Credencial visualizada", ip: "10.0.4.29" },
  { id: "cl2", usuario: "Carlos Eduardo Menezes", data: isoRel(-12, 10, 5), credencial: "Banco de Dados — SRV-DB-01", acao: "Credencial rotacionada", ip: "10.0.4.10" },
  { id: "cl3", usuario: "Carlos Eduardo Menezes", data: isoRel(-30, 9, 12), credencial: "Chave de API — Gateway de Pagamentos", acao: "Credencial criada", ip: "10.0.4.10" },
];

/* ===================== Incidentes, vulnerabilidades, patches ===================== */

export interface IncidenteSeguranca extends CampoData {
  id: string; numero: string; titulo: string; descricao: string; hora: string;
  unidadeId: string; usuarioAfetadoId?: string; ativoId?: string; sistema?: string; ip?: string;
  severidade: "Baixa" | "Média" | "Alta" | "Crítica"; impacto: string;
  status: "Aberto" | "Em Análise" | "Contido" | "Em Investigação" | "Em Correção" | "Monitoramento" | "Resolvido" | "Fechado";
  responsavelId: string; evidencias: string[]; acoesImediatas: string; causaRaiz?: string;
  acoesCorretivas?: string; encerramento?: string; chamadoOrigem?: string;
}

export const INCIDENTES_SEG_SEED: IncidenteSeguranca[] = [
  {
    id: "is1", numero: "SEG-2026-000001", titulo: "Phishing direcionado a servidores da SEFAZ", descricao: "Mensagem simulando intimação tributária com anexo malicioso enviada a 12 contas.",
    ...dt(isoRel(-6)), hora: "09:42", unidadeId: "un2", sistema: "Correio eletrônico", severidade: "Alta", impacto: "Roubo de credenciais e possível acesso ao sistema tributário.",
    status: "Contido", responsavelId: "u2", evidencias: ["Cabeçalhos originais preservados", "Anexo em quarentena (hash SHA-256 registrado)"],
    acoesImediatas: "Mensagem removida das caixas; domínio remetente bloqueado; senhas das contas afetadas expiradas.",
    causaRaiz: "Campanha externa de engenharia social com domínio semelhante ao institucional.",
    acoesCorretivas: "Habilitar DMARC em modo rejeição; campanha de conscientização extra para SEFAZ.", chamadoOrigem: "TI-2026-000003",
  },
  {
    id: "is2", numero: "SEG-2026-000002", titulo: "Tentativa de ransomware bloqueada no endpoint", descricao: "Executável desconhecido criptografando pasta temporária em estação da SEMED; EDR interrompeu o processo.",
    ...dt(isoRel(-3)), hora: "14:10", unidadeId: "un3", ativoId: "at11", severidade: "Crítica", impacto: "Potencial ciframento de arquivos e propagação lateral.",
    status: "Em Investigação", responsavelId: "u4", evidencias: ["Log do EDR exportado", "Imagem forense da estação coletada"],
    acoesImediatas: "Estação isolada da rede; varredura completa agendada no segmento.",
  },
  {
    id: "is3", numero: "SEG-2026-000003", titulo: "Perda de smartphone institucional", descricao: "Aparelho de plantão não localizado após vistoria de campo.",
    ...dt(isoRel(-20)), hora: "17:25", unidadeId: "un6", ativoId: "at12", severidade: "Média", impacto: "Exposição de contatos institucionais; dados corporativos com criptografia.",
    status: "Resolvido", responsavelId: "u5", evidencias: ["Boletim de ocorrência anexado"],
    acoesImediatas: "Apagamento remoto executado; chip bloqueado junto à operadora.",
    acoesCorretivas: "Revisão do termo de responsabilidade e checklist de devolução.", encerramento: isoRel(-15),
  },
  {
    id: "is4", numero: "SEG-2026-000004", titulo: "Acesso indevido a pasta restrita do RH", descricao: "Conta com perfil padrão acessou planilha salarial fora do horário de expediente.",
    ...dt(isoRel(-1)), hora: "21:08", unidadeId: "un12", severidade: "Alta", impacto: "Vazamento de dados pessoais de servidores (LGPD).",
    status: "Em Correção", responsavelId: "u2", evidencias: ["Trilha de auditoria do servidor de arquivos"],
    acoesImediatas: "Acesso revogado preventivamente; gestor notificado; DPO cientificado.",
  },
];

export interface Vulnerabilidade {
  id: string; titulo: string; descricao: string; ativoId?: string; sistema?: string; cve?: string;
  severidade: "Baixa" | "Média" | "Alta" | "Crítica"; cvss?: number; descobertaEm: string; origem: string;
  responsavelId: string; prazo: string; status: "Aberta" | "Em Análise" | "Planejada" | "Em Correção" | "Corrigida" | "Aceita" | "Falso Positivo";
  remediacao?: string;
}

export const VULNERABILIDADES_SEED: Vulnerabilidade[] = [
  { id: "vu1", titulo: "Firmware desatualizado no firewall de borda", descricao: "Versão atual exposta a CVE público com exploit conhecido para escalonamento.", ativoId: "as1", cve: "CVE-2026-1187", severidade: "Crítica", cvss: 9.1, descobertaEm: isoData(-15), origem: "Varredura trimestral", responsavelId: "u4", prazo: isoData(5), status: "Planejada", remediacao: "Janela de manutenção aprovada para atualização do DmOS." },
  { id: "vu2", titulo: "Sistema operacional fora de suporte — SRV-LEG-02", descricao: "Servidor legado com SO sem correções de segurança desde 2023.", ativoId: "at11", severidade: "Alta", cvss: 8.4, descobertaEm: isoData(-40), origem: "Inventário de ativos", responsavelId: "u4", prazo: isoData(30), status: "Em Correção", remediacao: "Migração do serviço para o ambiente virtualizado em andamento." },
  { id: "vu3", titulo: "RDP exposto na VLAN administrativa", descricao: "Porta 3389 acessível entre segmentos sem broker.", severidade: "Alta", cvss: 7.8, descobertaEm: isoData(-25), origem: "Auditoria interna", responsavelId: "u3", prazo: isoData(10), status: "Em Correção", remediacao: "Regra de bloqueio em teste; acesso migrará para VPN com MFA." },
  { id: "vu4", titulo: "Certificado SSL do Portal da Transparência a vencer", descricao: "Certificado expira em 12 dias.", sistema: "Portal da Transparência", severidade: "Média", cvss: 5.3, descobertaEm: isoData(-8), origem: "Monitoramento", responsavelId: "u1", prazo: isoData(12), status: "Aberta", remediacao: "Renovação automática em homologação." },
  { id: "vu5", titulo: "Injeção SQL em sistema legado de protocolo", descricao: "Campo de busca aceita entrada não sanitizada.", sistema: "Protocolo (legado)", cve: "—", severidade: "Crítica", cvss: 9.8, descobertaEm: isoData(-60), origem: "Teste de intrusão", responsavelId: "u1", prazo: isoData(-10), status: "Aceita", remediacao: "Risco aceito pelo comitê até a substituição pelo Protocolo Digital (PRJ-2026-002)." },
  { id: "vu6", titulo: "Alerta de varredura em porta 445", descricao: "Tentativas externas de enumeração SMB bloqueadas na borda.", severidade: "Baixa", cvss: 3.1, descobertaEm: isoData(-2), origem: "SIEM (logs de borda)", responsavelId: "u3", prazo: isoData(20), status: "Corrigida", remediacao: "Bloqueio já vigente; regra de registro reforçada." },
];

export interface Patch { id: string; ativoId?: string; sistema: string; versaoAtual: string; versaoDisponivel: string; patch: string; criticidade: "Baixa" | "Média" | "Alta" | "Crítica"; implantacao: string; responsavelId: string; status: "Atualizado" | "Pendente" | "Agendado" | "Falhou" | "Não Aplicável" | "Não Suportado"; }

export const PATCHES_SEED: Patch[] = [
  { id: "pa1", ativoId: "as1", sistema: "Firewall de Perímetro", versaoAtual: "DmOS 4.1.9", versaoDisponivel: "DmOS 4.2.2", patch: "Hotfix CVE-2026-1187", criticidade: "Crítica", implantacao: isoData(5), responsavelId: "u4", status: "Agendado" },
  { id: "pa2", ativoId: "at11", sistema: "Estação RH-PC-090", versaoAtual: "Windows 10 21H2", versaoDisponivel: "Windows 10 22H2", patch: " cumulativo mensal", criticidade: "Alta", implantacao: isoData(-3), responsavelId: "u5", status: "Falhou" },
  { id: "pa3", ativoId: "srv-db", sistema: "SRV-DB-01", versaoAtual: "SQL 2019 CU22", versaoDisponivel: "SQL 2019 CU24", patch: "Cumulativo de segurança", criticidade: "Alta", implantacao: isoDate0(), responsavelId: "u6", status: "Pendente" },
  { id: "pa4", ativoId: "srv-ad", sistema: "SRV-AD-01", versaoAtual: "Última KB", versaoDisponivel: "—", patch: "Windows Update mensal", criticidade: "Média", implantacao: isoRel(-5), responsavelId: "u4", status: "Atualizado" },
  { id: "pa5", ativoId: "srv-web", sistema: "SRV-WEB-01", versaoAtual: "Kernel 6.8.12", versaoDisponivel: "Kernel 6.8.14", patch: "Correção de escalonamento local", criticidade: "Alta", implantacao: isoRel(-2), responsavelId: "u4", status: "Atualizado" },
  { id: "pa6", ativoId: "at16", sistema: "Roteador (baixado)", versaoAtual: "IOS 16.9", versaoDisponivel: "—", patch: "—", criticidade: "Baixa", implantacao: "—", responsavelId: "u3", status: "Não Aplicável" },
];

export interface ProtecaoEndpoint { ativoId: string; antivirus: boolean; edr: boolean; produto: string; versao: string; ultimaAtualizacao: string; ultimoScan: string; protecaoAtiva: boolean; status: "Protegido" | "Desatualizado" | "Sem Proteção" | "Desconhecido"; }

export const ENDPOINTS_SEED: ProtecaoEndpoint[] = [
  { ativoId: "at1", antivirus: true, edr: true, produto: "Kaspersky EDR", versao: "12.1", ultimaAtualizacao: isoRel(0, 6, 0), ultimoScan: isoRel(-1), protecaoAtiva: true, status: "Protegido" },
  { ativoId: "at11", antivirus: true, edr: false, produto: "Kaspersky Endpoint", versao: "11.4", ultimaAtualizacao: isoRel(-9), ultimoScan: isoRel(-12), protecaoAtiva: true, status: "Desatualizado" },
  { ativoId: "at3", antivirus: true, edr: true, produto: "Kaspersky EDR", versao: "12.1", ultimaAtualizacao: isoRel(0, 6, 0), ultimoScan: isoRel(-1), protecaoAtiva: true, status: "Protegido" },
  { ativoId: "at5", antivirus: true, edr: true, produto: "Kaspersky EDR", versao: "12.1", ultimaAtualizacao: isoRel(0, 6, 0), ultimoScan: isoRel(-2), protecaoAtiva: true, status: "Protegido" },
  { ativoId: "at9", antivirus: false, edr: false, produto: "—", versao: "—", ultimaAtualizacao: "—", ultimoScan: "—", protecaoAtiva: false, status: "Sem Proteção" },
];

/* ===================== Backups, continuidade ===================== */

export interface BackupJob { id: string; alvo: string; tipo: string; frequencia: string; destino: string; retencao: string; criptografia: boolean; ultimoBackup: string; ultimoSucesso: string; ultimoTeste: string | null; responsavelId: string; status: "OK" | "Falha" | "Alerta"; }

export const BACKUPS_SEED: BackupJob[] = [
  { id: "bk1", alvo: "SRV-DB-01 — Bancos críticos", tipo: "Completo + log", frequencia: "Diário 22h / log 15 min", destino: "NAS-BACKUP-01 + cópia externa", retencao: "35 dias", criptografia: true, ultimoBackup: isoRel(0, 22, 40), ultimoSucesso: isoRel(0, 22, 40), ultimoTeste: isoData(-45), responsavelId: "u4", status: "OK" },
  { id: "bk2", alvo: "Máquinas virtuais (hypervisor)", tipo: "Snapshot", frequencia: "Diário 23h", destino: "NAS-BACKUP-01", retencao: "14 dias", criptografia: true, ultimoBackup: isoRel(0, 23, 10), ultimoSucesso: isoRel(0, 23, 10), ultimoTeste: isoDate(-90), responsavelId: "u4", status: "OK" },
  { id: "bk3", alvo: "Active Directory (system state)", tipo: "System state", frequencia: "Diário 21h", destino: "NAS-BACKUP-01", retencao: "30 dias", criptografia: true, ultimoBackup: isoRel(0, 21, 5), ultimoSucesso: isoRel(0, 21, 5), ultimoTeste: null, responsavelId: "u4", status: "Alerta" },
  { id: "bk4", alvo: "Servidor de arquivos", tipo: "Incremental", frequencia: "Diário 20h", destino: "NAS-BACKUP-01", retencao: "60 dias", criptografia: true, ultimoBackup: isoRel(-1, 20, 15), ultimoSucesso: isoRel(-2, 20, 15), ultimoTeste: isoDate(-120), responsavelId: "u5", status: "Falha" },
  { id: "bk5", alvo: "Configurações de rede (firewall/switches)", tipo: "Export", frequencia: "Diário 02h", destino: "Cofre de configurações", retencao: "90 dias", criptografia: true, ultimoBackup: isoRel(0, 2, 3), ultimoSucesso: isoRel(0, 2, 3), ultimoTeste: isoDate(-30), responsavelId: "u3", status: "OK" },
  { id: "bk6", alvo: "Portal de Serviços (banco + mídia)", tipo: "Completo", frequencia: "Diário 03h", destino: "NAS-BACKUP-01", retencao: "30 dias", criptografia: true, ultimoBackup: isoRel(0, 3, 20), ultimoSucesso: isoRel(0, 3, 20), ultimoTeste: null, responsavelId: "u1", status: "Alerta" },
];

export interface TesteRestauracao { id: string; backupId: string; data: string; responsavelId: string; resultado: "Sucesso" | "Parcial" | "Falha"; tempo: string; notas: string; }

export const TESTES_RESTORE_SEED: TesteRestauracao[] = [
  { id: "tr1", backupId: "bk1", data: isoDate(-45), responsavelId: "u4", resultado: "Sucesso", tempo: "3h12", notas: "Restauração completa em ambiente isolado; integridade verificada." },
  { id: "tr2", backupId: "bk2", data: isoDate(-90), responsavelId: "u4", resultado: "Sucesso", tempo: "1h48", notas: "VM de teste restaurada e iniciada com sucesso." },
  { id: "tr3", backupId: "bk4", data: isoDate(-120), responsavelId: "u5", resultado: "Parcial", tempo: "2h05", notas: "Arquivos recentes fora da janela incremental recuperados manualmente." },
  { id: "tr4", backupId: "bk5", data: isoDate(-30), responsavelId: "u3", resultado: "Sucesso", tempo: "25 min", notas: "Configuração do firewall importada em equipamento de laboratório." },
];

export interface PlanoContinuidade { id: string; sistema: string; responsavelId: string; criticidade: "Alta" | "Crítica"; rto: string; rpo: string; dependencias: string; backup: string; procedimentoAlternativo: string; procedimentoRecuperacao: string; ultimoTeste: string | null; proximoTeste: string; }

export const CONTINUIDADE_SEED: PlanoContinuidade[] = [
  { id: "pc1", sistema: "Sistema Tributário", responsavelId: "u6", criticidade: "Crítica", rto: "4h", rpo: "15 min", dependencias: "SRV-DB-01; SRV-AD-01; Firewall", backup: "bk1", procedimentoAlternativo: "Contingência manual de arrecadação (guichê) com registro posterior.", procedimentoRecuperacao: "Failover do banco para réplica; restauração pontual se necessário.", ultimoTeste: isoDate(-60), proximoTeste: isoDate(30) },
  { id: "pc2", sistema: "Folha de Pagamento", responsavelId: "u6", criticidade: "Crítica", rto: "4h", rpo: "1h", dependencias: "SRV-DB-01; AD", backup: "bk1", procedimentoAlternativo: "Fechamento com base no snapshot pré-rodada.", procedimentoRecuperacao: "Restauração do banco e reprocessamento da rodada.", ultimoTeste: isoDate(-150), proximoTeste: isoData(15) },
  { id: "pc3", sistema: "Portal de Serviços", responsavelId: "u1", criticidade: "Alta", rto: "8h", rpo: "24h", dependencias: "SRV-WEB-01; Firewall (DMZ)", backup: "bk6", procedimentoAlternativo: "Página estática institucional com aviso.", procedimentoRecuperacao: "Reimplantação via infraestrutura como código + restore do banco.", ultimoTeste: null, proximoTeste: isoDate(45) },
  { id: "pc4", sistema: "Diretório (AD/DNS/DHCP)", responsavelId: "u4", criticidade: "Crítica", rto: "2h", rpo: "24h", dependencias: "SRV-AD-01", backup: "bk3", procedimentoAlternativo: "Cache local de credenciais nas estações.", procedimentoRecuperacao: "Restauração de system state; reautorização DHCP.", ultimoTeste: null, proximoTeste: isoDate(20) },
  { id: "pc5", sistema: "Sistema de Saúde", responsavelId: "u6", criticidade: "Crítica", rto: "6h", rpo: "1h", dependencias: "SRV-DB-01", backup: "bk1", procedimentoAlternativo: "Fichas de atendimento em papel com digitação posterior.", procedimentoRecuperacao: "Restauração pontual do banco + conferência com as UBS.", ultimoTeste: isoDate(-100), proximoTeste: isoDate(60) },
];

/* ===================== Políticas, conscientização, maturidade ===================== */

export interface PoliticaSeguranca { id: string; titulo: string; versao: string; autorId: string; aprovacao: string; vigencia: string; revisao: string; status: "Em vigor" | "Em revisão" | "Obsoleta"; aceiteObrigatorio: boolean; lidoPor: string[]; }

export const POLITICAS_SEG_SEED: PoliticaSeguranca[] = [
  { id: "po1", titulo: "Política de Segurança da Informação", versao: "3.2", autorId: "u2", aprovacao: "Decreto nº 4.812/2025", vigencia: isoData(-400), revisao: isoData(330), status: "Em vigor", aceiteObrigatorio: true, lidoPor: ["u1", "u2", "u3", "u4", "u5"] },
  { id: "po2", titulo: "Política de Senhas", versao: "2.1", autorId: "u2", aprovacao: "Portaria DTI nº 18/2026", vigencia: isoData(-200), revisao: isoData(165), status: "Em vigor", aceiteObrigatorio: true, lidoPor: ["u1", "u2", "u3", "u5"] },
  { id: "po3", titulo: "Política de Controle de Acesso", versao: "1.4", autorId: "u2", aprovacao: "Comitê de TI — Ata 2025-11", vigencia: isoData(-260), revisao: isoData(105), status: "Em vigor", aceiteObrigatorio: false, lidoPor: ["u2", "u4"] },
  { id: "po4", titulo: "Política de Backup e Restauração", versao: "2.0", autorId: "u4", aprovacao: "Comitê de TI — Ata 2026-01", vigencia: isoData(-120), revisao: isoData(245), status: "Em vigor", aceiteObrigatorio: false, lidoPor: ["u4", "u5"] },
  { id: "po5", titulo: "Política de Uso Aceitável", versao: "1.9", autorId: "u7", aprovacao: "Portaria SEAD nº 32/2025", vigencia: isoData(-350), revisao: isoData(15), status: "Em revisão", aceiteObrigatorio: true, lidoPor: ["u1", "u3"] },
  { id: "po6", titulo: "Política de Classificação da Informação", versao: "1.0", autorId: "u2", aprovacao: "Comitê de TI — Ata 2026-03", vigencia: isoData(-80), revisao: isoData(285), status: "Em vigor", aceiteObrigatorio: false, lidoPor: ["u2"] },
  { id: "po7", titulo: "Política de Continuidade de Negócios — TI", versao: "2.1", autorId: "u2", aprovacao: "Comitê de Governança", vigencia: isoData(-75), revisao: isoData(290), status: "Em vigor", aceiteObrigatorio: false, lidoPor: ["u1", "u2", "u4"] },
  { id: "po8", titulo: "Política de Dispositivos Móveis", versao: "1.2", autorId: "u4", aprovacao: "Portaria DTI nº 22/2026", vigencia: isoData(-40), revisao: isoData(325), status: "Em vigor", aceiteObrigatorio: true, lidoPor: [] },
];

export const NIVEIS_CLASSIFICACAO = ["Pública", "Interna", "Restrita", "Confidencial"];

export interface ConteudoConscientizacao { id: string; titulo: string; categoria: string; tipo: "Artigo" | "Vídeo" | "PDF" | "Quiz"; resumo: string; autorId: string; }

export const CONTEUDOS_SEED: ConteudoConscientizacao[] = [
  { id: "co1", titulo: "Como reconhecer um e-mail de phishing", categoria: "Phishing", tipo: "Artigo", resumo: "Sinais de alerta, exemplos reais do município e o que fazer ao receber uma mensagem suspeita.", autorId: "u2" },
  { id: "co2", titulo: "Senhas fortes sem complicação", categoria: "Senhas", tipo: "Vídeo", resumo: "Técnica de frases-senha, quando usar o cofre institucional e por que não repetir senhas.", autorId: "u2" },
  { id: "co3", titulo: "Engenharia social: o golpe do “suporte”", categoria: "Engenharia Social", tipo: "Artigo", resumo: "Criminosos se passam pela TI para obter senhas. A DTI nunca pede sua senha.", autorId: "u5" },
  { id: "co4", titulo: "Ransomware: por que o backup é a última linha", categoria: "Ransomware", tipo: "PDF", resumo: "Como o ataque acontece e o papel de cada servidor na prevenção.", autorId: "u4" },
  { id: "co5", titulo: "LGPD no dia a dia da Prefeitura", categoria: "LGPD", tipo: "Artigo", resumo: "Classificação da informação, minimização de dados e incidentes com dados pessoais.", autorId: "u2" },
  { id: "co6", titulo: "Quiz — Você clicaria neste link?", categoria: "Phishing", tipo: "Quiz", resumo: "10 situações simuladas para testar seu faro contra golpes.", autorId: "u5" },
  { id: "co7", titulo: "Trabalho remoto seguro", categoria: "Trabalho Remoto", tipo: "Artigo", resumo: "VPN, bloqueio de tela, redes Wi-Fi públicas e transporte do notebook institucional.", autorId: "u3" },
  { id: "co8", titulo: "Uso responsável de IA generativa", categoria: "Uso de IA", tipo: "Artigo", resumo: "O que nunca enviar a ferramentas públicas de IA e como usar com dados institucionais.", autorId: "u1" },
];

export interface CampanhaSeguranca { id: string; nome: string; periodo: string; publico: string; conteudosObrigatorios: string[]; taxaConclusao: number; status: "Em andamento" | "Concluída" | "Planejada"; }

export const CAMPANHAS_SEG_SEED: CampanhaSeguranca[] = [
  { id: "cp1", nome: "Campanha de Prevenção contra Phishing — 2026", periodo: "01/08/2026 a 30/11/2026", publico: "Toda a organização", conteudosObrigatorios: ["co1", "co6"], taxaConclusao: 82, status: "Em andamento" },
  { id: "cp2", nome: "Semana da LGPD", periodo: "15/09/2026 a 19/09/2026", publico: "Secretarias com dados pessoais (SESAU, SEFAZ, DRH)", conteudosObrigatorios: ["co5"], taxaConclusao: 100, status: "Concluída" },
  { id: "cp3", nome: "Segurança no Trabalho Remoto", periodo: "01/02/2027 a 28/02/2027", publico: "Servidores em regime híbrido", conteudosObrigatorios: ["co7"], taxaConclusao: 0, status: "Planejada" },
];

export interface DominioMaturidade { dominio: string; nivel: number; notas: string; }

export const MATURIDADE_SEED: DominioMaturidade[] = [
  { dominio: "Governança", nivel: 4, notas: "Comitê de TI ativo, políticas publicadas e plano anual vigente." },
  { dominio: "Segurança Física", nivel: 4, notas: "CPD com biometria, CFTV e redundância elétrica; salas técnicas em regularização." },
  { dominio: "Rede", nivel: 3, notas: "Segmentação consolidada; falta monitoramento contínuo de tráfego." },
  { dominio: "Identidade", nivel: 3, notas: "AD centralizado e MFA parcial; revisão de acessos em implantação." },
  { dominio: "Endpoint", nivel: 3, notas: "EDR em 86% do parque; substituição de estações antigas em curso." },
  { dominio: "Servidores", nivel: 4, notas: "Hardening padronizado e contas de serviço dedicadas." },
  { dominio: "Aplicações", nivel: 2, notas: "Homologação definida; testes de segurança ainda pontuais." },
  { dominio: "Dados", nivel: 2, notas: "Classificação aprovada; inventário de dados pessoais em construção." },
  { dominio: "Backup", nivel: 4, notas: "Rotinas diárias com cópia externa; ampliar testes de restauração." },
  { dominio: "Incidentes", nivel: 3, notas: "Fluxo definido com numeração própria; integrar correlação (SIEM)." },
  { dominio: "Continuidade", nivel: 3, notas: "Planos dos sistemas críticos redigidos; exercícios semestrais." },
  { dominio: "Conscientização", nivel: 3, notas: "Campanhas anuais com phishing simulado; adesão de 82%." },
];

export const NIVEIS_MATURIDADE = ["Inicial", "Básico", "Definido", "Gerenciado", "Otimizado"];

/* ===================== Ativos de infraestrutura de segurança ===================== */

export const ATIVOS_SEGURANCA_SEED: Ativo[] = [
  {
    id: "as1", patrimonio: "000800", codigoInterno: "DTI-FW-001", serie: "DCM-4200-8841", categoria: "Firewall",
    fabricante: "Datacom", modelo: "DM4200", aquisicao: isoData(-720), valor: 86500, notaFiscal: "NF 11.204",
    fornecedor: "Datacom S.A.", garantiaFim: isoData(10), status: "Em Uso",
    obs: "Firewall de perímetro principal — registro de demonstração com fabricante configurável.",
    unidadeId: "un111", responsavelId: "u4", predio: "Paço Municipal", sala: "CPD — RACK-01 U01–U02",
    pertencimento: { orgaoId: "un0", gestoraId: "ug1", fundoId: null, secretariaId: "un1", departamentoId: "un11", centroCusto: "CC-0110", responsavelPatrimonialId: "u2" },
    campos: { portas: "8× 1Gb + 4× 10Gb SFP+", gerenciado: "Sim", firmware: "DmOS 4.1.9" },
    rede: { hostname: "FW-BORDA-01", ipv4: "10.0.0.1", ipv6: "—", mac: "00:1A:3F:01:00:01", tipoEnd: "Estático", vlan: "VLAN 0 — Gerência", subrede: "255.255.255.0", gateway: "10.0.0.254", dns1: "10.0.30.10", dns2: "10.0.30.10", dominio: "prefeitura.local", ou: "OU=Seguranca,DC=prefeitura,DC=local", ingressado: false, ultimaSync: isoRel(0, 5, 0), statusDominio: "Não ingressado" },
    historicoIP: [], movimentacoes: [], manutencoes: [
      { id: "mn-as1a", tecnicoId: "u4", ...dt(isoRel(-40)), tipo: "Preventiva", descricao: "Atualização de firmware em janela", diagnostico: "—", solucao: "DmOS atualizado sem perda de sessões", pecas: "—", custo: 0, chamadoId: null, tempoMin: 60 },
    ],
  },
  {
    id: "as2", patrimonio: "000801", codigoInterno: "DTI-SV-020", serie: "BRPE-2026-1189", categoria: "Servidor",
    fabricante: "Dell", modelo: "PowerEdge R750", aquisicao: isoData(-420), valor: 64200, notaFiscal: "NF 12.887",
    fornecedor: "Dell Computadores do Brasil", garantiaFim: isoData(680), status: "Em Uso",
    obs: "Hospeda o firewall lógico e a console de monitoramento.",
    unidadeId: "un111", responsavelId: "u4", predio: "Paço Municipal", sala: "CPD — RACK-01 U10–U13",
    pertencimento: { orgaoId: "un0", gestoraId: "ug1", fundoId: null, secretariaId: "un1", departamentoId: "un11", centroCusto: "CC-0110", responsavelPatrimonialId: "u2" },
    campos: { cpu: "2× Xeon Silver 4314", ram: "128 GB DDR4 ECC", storage: "4× 1,92 TB SSD RAID 5", hipervisor: "VMware ESXi 8", servicos: "Firewall lógico · Zabbix", so: "Linux LTS" },
    rede: { hostname: "SRV-SEC-01", ipv4: "10.0.30.5", ipv6: "—", mac: "D0:94:66:30:00:05", tipoEnd: "Estático", vlan: "VLAN 30 — Servidores", subrede: "255.255.255.0", gateway: "10.0.30.1", dns1: "10.0.30.10", dns2: "10.0.30.10", dominio: "prefeitura.local", ou: "OU=Seguranca,DC=prefeitura,DC=local", ingressado: true, ultimaSync: isoRel(0, 6, 30), statusDominio: "OK" },
    historicoIP: [], movimentacoes: [], manutencoes: [],
  },
  {
    id: "as3", patrimonio: "000802", codigoInterno: "DTI-SW-002", serie: "CSC-9300-7714", categoria: "Switch",
    fabricante: "Cisco", modelo: "Catalyst 9300-48P", aquisicao: isoData(-600), valor: 41800, notaFiscal: "NF 12.031",
    fornecedor: "Cisco do Brasil", garantiaFim: isoData(130), status: "Em Uso",
    obs: "Core de rede do Paço Municipal.",
    unidadeId: "un111", responsavelId: "u3", predio: "Paço Municipal", sala: "CPD — RACK-01 U05–U06",
    pertencimento: { orgaoId: "un0", gestoraId: "ug1", fundoId: null, secretariaId: "un1", departamentoId: "un11", centroCusto: "CC-0110", responsavelPatrimonialId: "u2" },
    campos: { portas: "48× 1Gb PoE+ · 4× 10Gb SFP+", gerenciado: "Sim", vlan: "Trunk (VLANs 10–200)", firmware: "IOS-XE 17.9", ipGerencia: "10.0.2.1" },
    rede: { hostname: "CORE-SW-01", ipv4: "10.0.2.1", ipv6: "—", mac: "00:25:84:02:00:02", tipoEnd: "Estático", vlan: "VLAN 0 — Gerência", subrede: "255.255.255.0", gateway: "10.0.0.2", dns1: "10.0.30.10", dns2: "10.0.30.10", dominio: "prefeitura.local", ou: "OU=Rede,DC=prefeitura,DC=local", ingressado: false, ultimaSync: isoRel(0, 5, 15), statusDominio: "Não ingressado" },
    historicoIP: [], movimentacoes: [], manutencoes: [],
  },
];

export const INCIDENTE_CATEGORIAS = [
  "Phishing", "Malware", "Ransomware", "Acesso Indevido", "Conta Comprometida", "Vazamento de Dados",
  "Ataque de Rede", "Perda de Equipamento", "Furto", "Engenharia Social", "Indisponibilidade", "Violação de Política", "Outro",
];
export const INCIDENTE_STATUS = ["Aberto", "Em Análise", "Contido", "Em Investigação", "Em Correção", "Monitoramento", "Resolvido", "Fechado"];
export const VULN_STATUS = ["Aberta", "Em Análise", "Planejada", "Em Correção", "Corrigida", "Aceita", "Falso Positivo"];
export const CONTROLE_STATUS = ["Implementado", "Parcialmente Implementado", "Planejado", "Em Implantação", "Não Implementado", "Não Aplicável"];
export const TIPOS_CONTROLE = ["Preventivo", "Detectivo", "Corretivo", "Compensatório", "Recuperação"];
