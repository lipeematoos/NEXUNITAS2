import { useMemo, useRef, useState } from "react";
import { Avatar, Barra, Campo, Chip, Contador, Icon, Modal, PainelLateral, Seletor, useToast } from "../../components/ui";
import { Tom } from "../../lib/data";
import { CabecalhoPagina } from "../../components/shell";
import { fmtData, fmtDataHora, fmtNum, fmtPct } from "../../lib/format";
import { useApp } from "../../lib/store";
import {
  AMBIENTES_FISICOS_SEED, ATIVOS_CRITICOS_SEED, BACKUPS_SEED, CAMPANHAS_SEG_SEED, CONEXOES_TOPOLOGIA_SEED,
  CONTEUDOS_SEED, CONTINUIDADE_SEED, CONTROLE_STATUS, ENDPOINTS_SEED, FIREWALLS_SEED, IDENTIDADES_SEED,
  INCIDENTE_CATEGORIAS, INCIDENTE_STATUS, INTERFACES_FW_SEED, LINKS_SEED, NIVEIS_CLASSIFICACAO, NIVEIS_MATURIDADE,
  NOS_TOPOLOGIA_SEED, PATCHES_SEED, PRIVILEGIOS_SEED, RACKS_SEED, REGRAS_FW_SEED, SERVIDORES_SEED, SISTEMAS_SEED,
  TESTES_RESTORE_SEED, VLANS_SEED, VULN_STATUS, ZONAS_SEED,
} from "../../lib/seguranca-seed";

type Secao =
  | "visao" | "infra" | "topologia" | "camadas" | "criticos" | "firewalls" | "rede" | "servidores" | "sistemas"
  | "identidades" | "cofre" | "vulnerabilidades" | "patches" | "incidentes" | "backups" | "continuidade"
  | "fisica" | "politicas" | "conscientizacao" | "riscos" | "controles" | "maturidade" | "relatorios";

const NAV_SEG: { grupo: string; itens: { chave: Secao; rotulo: string; icone: string }[] }[] = [
  { grupo: "Governança", itens: [
    { chave: "visao", rotulo: "Visão Geral", icone: "painel" },
    { chave: "infra", rotulo: "Infraestrutura de Segurança", icone: "escudo" },
    { chave: "camadas", rotulo: "Camadas de Proteção", icone: "fluxos" },
    { chave: "controles", rotulo: "Controles de Segurança", icone: "check" },
    { chave: "maturidade", rotulo: "Maturidade", icone: "indicadores" },
    { chave: "riscos", rotulo: "Riscos de Segurança", icone: "riscos" },
    { chave: "relatorios", rotulo: "Relatórios", icone: "relatorios" },
  ] },
  { grupo: "Infraestrutura", itens: [
    { chave: "topologia", rotulo: "Topologia de Rede", icone: "rede" },
    { chave: "criticos", rotulo: "Ativos Críticos", icone: "aviso" },
    { chave: "firewalls", rotulo: "Firewalls", icone: "escudo" },
    { chave: "rede", rotulo: "Rede e Segmentação", icone: "rede" },
    { chave: "servidores", rotulo: "Servidores e Serviços", icone: "sistema" },
    { chave: "sistemas", rotulo: "Sistemas Críticos", icone: "monitor" },
    { chave: "fisica", rotulo: "Segurança Física", icone: "cadeado" },
    { chave: "backups", rotulo: "Backups e Recuperação", icone: "banco" },
    { chave: "continuidade", rotulo: "Continuidade", icone: "relogio" },
  ] },
  { grupo: "Operação", itens: [
    { chave: "identidades", rotulo: "Identidades e Acessos", icone: "usuario" },
    { chave: "cofre", rotulo: "Cofre de Credenciais", icone: "cadeado" },
    { chave: "vulnerabilidades", rotulo: "Vulnerabilidades", icone: "riscos" },
    { chave: "patches", rotulo: "Atualizações e Patches", icone: "engrenagem" },
    { chave: "incidentes", rotulo: "Incidentes de Segurança", icone: "aviso" },
  ] },
  { grupo: "Pessoas e Normas", itens: [
    { chave: "politicas", rotulo: "Políticas e Normas", icone: "documentos" },
    { chave: "conscientizacao", rotulo: "Conscientização", icone: "chat" },
  ] },
];

const tomSev = (s: string): Tom => (s === "Crítica" || s === "Crítico" ? "vermelho" : s === "Alta" ? "ambar" : s === "Média" ? "amarelo" : "cinza");
const tomStatusCtrl = (s: string): Tom => (s === "Implementado" ? "verde" : s.startsWith("Parcial") ? "ambar" : s === "Não Implementado" ? "vermelho" : s === "Em Implantação" ? "ciano" : "cinza");

export default function Seguranca() {
  const app = useApp();
  const {
    temPermissao, camadas, controles, incidentesSeguranca, vulnerabilidades, politicasSeguranca, cofre, cofreLog,
    revisoesRegras, maturidade, politicaSenha, ativos, riscos, unidades, usuarios, chamados, atual,
    setStatusControle, adicionarCamada, toggleCamada, decidirRevisaoRegra, revelarCredencial, criarCredencial,
    rotacionarCredencial, setMaturidade, aceitarPolitica, criarIncidente, mudarStatusIncidente,
    mudarStatusVulnerabilidade, criarRisco, registrarGeracao, config,
  } = app;
  const toast = useToast();
  const [secao, setSecao] = useState<Secao>("visao");
  const [noSel, setNoSel] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const arraste = useRef<{ x: number; y: number } | null>(null);
  const [modalIncidente, setModalIncidente] = useState(false);
  const [novoInc, setNovoInc] = useState({ titulo: "", descricao: "", categoria: "Phishing", severidade: "Média", unidadeId: "un1", ip: "" });
  const [modalCamada, setModalCamada] = useState(false);
  const [novaCamada, setNovaCamada] = useState({ nome: "", tipo: "Rede" });
  const [modalCredencial, setModalCredencial] = useState(false);
  const [novaCred, setNovaCred] = useState({ nome: "", categoria: "Equipamento de rede", alvo: "", usuarioConta: "", segredo: "", responsavelId: "u4" });
  const [segredoVisivel, setSegredoVisivel] = useState<Record<string, string>>({});
  const [modalRevisao, setModalRevisao] = useState<string | null>(null);
  const [justRevisao, setJustRevisao] = useState("");
  const [modalRisco, setModalRisco] = useState(false);
  const [novoRisco, setNovoRisco] = useState({ titulo: "", descricao: "", probabilidade: 3, impacto: 4 });

  const nomeDe = (id: string | null | undefined) => usuarios.find((u) => u.id === id);
  const unDe = (id: string) => unidades.find((u) => u.id === id);

  const podeCofre = temPermissao("security.credential.view");
  const podeGerirCofre = temPermissao("security.credential.manage");
  const podeGerirInc = temPermissao("security.incident.manage") || temPermissao("security.incident.create");
  const podeVuln = temPermissao("security.vulnerability.manage");
  const podePolitica = temPermissao("security.policy.manage");

  /* ===== Indicadores calculados ===== */
  const ativosCriticosIds = ATIVOS_CRITICOS_SEED.map((a) => a.ativoId);
  const kpis = useMemo(() => {
    const abertos = incidentesSeguranca.filter((i) => !["Resolvido", "Fechado"].includes(i.status));
    const foraDominio = ativos.filter((a) => a.rede && !a.rede.ingressado && ["Em Uso"].includes(a.status)).length;
    const semProtecao = ENDPOINTS_SEED.filter((e) => e.status === "Sem Proteção").length + ENDPOINTS_SEED.filter((e) => e.status === "Desatualizado").length;
    const pendRevisao = IDENTIDADES_SEED.filter((i) => i.status === "Em revisão").length + PRIVILEGIOS_SEED.filter((p) => p.status === "Em revisão").length;
    return [
      { rotulo: "Incidentes Abertos", n: abertos.length, cor: "var(--red)", icone: "aviso" },
      { rotulo: "Incidentes Críticos", n: abertos.filter((i) => i.severidade === "Crítica").length, cor: "var(--red)", icone: "aviso" },
      { rotulo: "Vulnerabilidades Críticas", n: vulnerabilidades.filter((v) => v.severidade === "Crítica" && !["Corrigida", "Aceita", "Falso Positivo"].includes(v.status)).length, cor: "var(--red)", icone: "riscos" },
      { rotulo: "Ativos Críticos", n: ativosCriticosIds.length, cor: "var(--ink)", icone: "caixa" },
      { rotulo: "Firewalls Ativos", n: FIREWALLS_SEED.filter((f) => f.status === "Ativo").length, cor: "var(--green)", icone: "escudo" },
      { rotulo: "Sistemas Críticos", n: SISTEMAS_SEED.filter((s) => s.criticidade === "Crítica").length, cor: "var(--ink)", icone: "sistema" },
      { rotulo: "Fora do Domínio", n: foraDominio, cor: "var(--amber)", icone: "rede" },
      { rotulo: "Proteção Pendente", n: semProtecao, cor: "var(--amber)", icone: "escudo" },
      { rotulo: "Contas Privilegiadas", n: PRIVILEGIOS_SEED.filter((p) => p.status === "Ativo").length, cor: "var(--blue)", icone: "cadeado" },
      { rotulo: "Acessos p/ Revisão", n: pendRevisao, cor: "var(--amber)", icone: "relogio" },
      { rotulo: "Backups com Falha", n: BACKUPS_SEED.filter((b) => b.status === "Falha").length, cor: "var(--red)", icone: "banco" },
      { rotulo: "Sem Teste de Restauração", n: BACKUPS_SEED.filter((b) => !b.ultimoTeste).length, cor: "var(--amber)", icone: "banco" },
      { rotulo: "Controles Pendentes", n: controles.filter((c) => ["Planejado", "Em Implantação", "Não Implementado"].includes(c.status)).length, cor: "var(--blue)", icone: "check" },
      { rotulo: "Políticas p/ Aceite", n: politicasSeguranca.filter((p) => p.aceiteObrigatorio && !p.lidoPor.includes(atual.id)).length, cor: "var(--amber)", icone: "documentos" },
      { rotulo: "Riscos Críticos", n: riscos.filter((r) => r.nivel === "Crítico").length, cor: "var(--red)", icone: "riscos" },
      { rotulo: "SPOF Identificados", n: ATIVOS_CRITICOS_SEED.filter((a) => a.redundancia === "Sem Redundância").length, cor: "var(--red)", icone: "aviso" },
    ];
  }, [incidentesSeguranca, vulnerabilidades, controles, politicasSeguranca, riscos, ativos, atual.id]);

  const exportarCSV = (nome: string, linhas: (string | number)[][]) => {
    const csv = "\uFEFF" + linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `${nome}.csv`; a.click();
    URL.revokeObjectURL(url);
    registrarGeracao(nome, "CSV", "Todos os registros", linhas.length - 1);
    toast("Relatório exportado", "verde", `${nome}.csv — ${fmtNum(linhas.length - 1)} registros`);
  };

  const nos = NOS_TOPOLOGIA_SEED;
  const conns = CONEXOES_TOPOLOGIA_SEED;
  const noSelObj = nos.find((n) => n.id === noSel) ?? null;

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      {/* Subnavegação do módulo */}
      <aside className="card w-full lg:w-[230px] lg:sticky lg:top-[76px] flex-none p-3 max-h-none lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto">
        {NAV_SEG.map((g) => (
          <div key={g.grupo} className="mb-3">
            <div className="ovl !text-[9.5px] mb-1.5 px-1">{g.grupo}</div>
            {g.itens.map((i) => (
              <button
                key={i.chave}
                className={`w-full flex items-center gap-2 px-2.5 py-[6.5px] rounded-md text-left text-[12.5px] font-semibold cursor-pointer border-0 mb-[2px] transition-all ${secao === i.chave ? "" : "bg-transparent hover:bg-[rgba(30,122,84,0.08)]"}`}
                style={secao === i.chave ? { background: "var(--deep)", color: "#f2f6f0", boxShadow: "inset 3px 0 0 var(--accent)" } : { color: "var(--muted)" }}
                onClick={() => setSecao(i.chave)}
              >
                <Icon name={i.icone} size={15} className={secao === i.chave ? "text-[#f2b70a]" : ""} />
                {i.rotulo}
              </button>
            ))}
          </div>
        ))}
      </aside>

      <div className="flex-1 min-w-0 w-full">
        {/* ============ VISÃO GERAL ============ */}
        {secao === "visao" && (
          <div className="space-y-4 anim-fade">
            <CabecalhoPagina titulo="Painel de Segurança da Informação" subtitulo={`Postura de segurança consolidada de ${config.orgao.nome} — dados integrados com patrimônio, chamados, riscos e ativos.`} />
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5">
              {kpis.map((k, i) => (
                <div key={k.rotulo} className="card card-hover px-3 py-3" style={{ animationDelay: `${i * 30}ms` }}>
                  <div className="flex items-center gap-1.5 mb-1.5" style={{ color: k.cor }}><Icon name={k.icone} size={13} /></div>
                  <div className="font-display font-extrabold text-[22px] leading-none tabular-nums" style={{ color: k.cor }}><Contador valor={k.n} /></div>
                  <div className="text-[9.5px] font-bold uppercase tracking-wider mt-1.5 leading-tight" style={{ color: "var(--muted)" }}>{k.rotulo}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="card p-5">
                <div className="ovl mb-4">Defesa em profundidade — camadas ativas</div>
                <div className="space-y-2">
                  {[...camadas].sort((a, b) => a.ordem - b.ordem).map((c, i) => {
                    const n = controles.filter((ct) => ct.camadaId === c.id).length;
                    return (
                      <div key={c.id} className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-extrabold flex-none" style={{ background: c.status === "Ativa" ? "var(--green)" : "var(--grey-soft)", color: c.status === "Ativa" ? "#fff" : "var(--grey)" }}>{i + 1}</span>
                        <span className="flex-1 text-[12.5px] font-bold">{c.nome}</span>
                        <span className="text-[10.5px]" style={{ color: "var(--muted)" }}>{fmtNum(n)} controles</span>
                        {i < camadas.length - 1 && <Icon name="chevron-b" size={11} className="opacity-30" />}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="card p-5">
                <div className="ovl mb-4">Vulnerabilidades por severidade</div>
                {(["Crítica", "Alta", "Média", "Baixa"] as const).map((s) => {
                  const n = vulnerabilidades.filter((v) => v.severidade === s).length;
                  const pct = (n / Math.max(1, vulnerabilidades.length)) * 100;
                  return (
                    <div key={s} className="mb-3">
                      <div className="flex justify-between text-[11.5px] font-bold mb-1"><span>{s}</span><span className="tabular-nums">{fmtNum(n)}</span></div>
                      <Barra valor={pct} cor={s === "Crítica" ? "var(--red)" : s === "Alta" ? "var(--amber)" : s === "Média" ? "#c9a227" : "var(--grey)"} />
                    </div>
                  );
                })}
                <div className="ovl mb-3 mt-5">Status dos controles</div>
                {CONTROLE_STATUS.map((s) => {
                  const n = controles.filter((c) => c.status === s).length;
                  if (n === 0) return null;
                  return (
                    <div key={s} className="flex items-center gap-2 py-1 text-[12px]">
                      <span className="w-2 h-2 rounded-full" style={{ background: s === "Implementado" ? "var(--green)" : s === "Não Implementado" ? "var(--red)" : s === "Parcialmente Implementado" ? "var(--amber)" : "var(--blue)" }} />
                      <span className="flex-1 font-semibold">{s}</span>
                      <span className="font-extrabold tabular-nums">{fmtNum(n)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="card p-5">
                <div className="ovl mb-4">Backups e endpoints</div>
                {(["OK", "Alerta", "Falha"] as const).map((s) => {
                  const n = BACKUPS_SEED.filter((b) => b.status === s).length;
                  return (
                    <div key={s} className="flex items-center gap-2 py-1 text-[12px]">
                      <span className="w-2 h-2 rounded-full" style={{ background: s === "OK" ? "var(--green)" : s === "Alerta" ? "var(--amber)" : "var(--red)" }} />
                      <span className="flex-1 font-semibold">Rotinas {s === "OK" ? "íntegras" : `em ${s.toLowerCase()}`}</span>
                      <span className="font-extrabold tabular-nums">{fmtNum(n)}</span>
                    </div>
                  );
                })}
                <div className="my-3" style={{ borderTop: "1px dashed var(--line)" }} />
                {(["Protegido", "Desatualizado", "Sem Proteção"] as const).map((s) => {
                  const n = ENDPOINTS_SEED.filter((e) => e.status === s).length;
                  return (
                    <div key={s} className="flex items-center gap-2 py-1 text-[12px]">
                      <span className="w-2 h-2 rounded-full" style={{ background: s === "Protegido" ? "var(--green)" : s === "Desatualizado" ? "var(--amber)" : "var(--red)" }} />
                      <span className="flex-1 font-semibold">Endpoints — {s.toLowerCase()}</span>
                      <span className="font-extrabold tabular-nums">{fmtNum(n)}</span>
                    </div>
                  );
                })}
                <div className="my-3" style={{ borderTop: "1px dashed var(--line)" }} />
                <div className="text-[11.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
                  <strong style={{ color: "var(--red)" }}>{fmtNum(ATIVOS_CRITICOS_SEED.filter((a) => a.redundancia === "Sem Redundância").length)} pontos únicos de falha</strong> identificados —
                  {" "}{ATIVOS_CRITICOS_SEED.filter((a) => a.redundancia === "Sem Redundância").map((a) => ativos.find((x) => x.id === a.ativoId)?.modelo ?? a.ativoId).join(", ")}.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ INFRAESTRUTURA ============ */}
        {secao === "infra" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Infraestrutura de Segurança" subtitulo="Arquitetura de defesa em profundidade — qualquer número de camadas de proteção entre a Internet e os dados." />
            <div className="grid lg:grid-cols-2 gap-4 items-start">
              <div className="card p-5">
                <div className="ovl mb-4">Fluxo de proteção (demo configurável)</div>
                {["Internet", "Firewall Físico (Datacom)", "Rede Interna / Perímetro", "Core Switch", "Firewall Lógico no Servidor", "Rede de Servidores", "Active Directory · DNS · DHCP", "Sistemas Municipais", "Dados"].map((etapa, i, arr) => (
                  <div key={etapa} className="flex flex-col items-center">
                    <div className="w-full rounded-lg px-4 py-2.5 text-center text-[12.5px] font-bold transition-transform hover:scale-[1.015]"
                      style={{
                        background: i === 1 || i === 4 ? "var(--deep)" : i === 0 ? "var(--grey-soft)" : i === arr.length - 1 ? "var(--green-soft)" : "rgba(19,37,29,0.04)",
                        color: i === 1 || i === 4 ? "#f2b70a" : undefined,
                        border: i === 1 || i === 4 ? "1px solid var(--accent)" : "1px solid var(--line)",
                      }}>
                      {etapa}
                    </div>
                    {i < arr.length - 1 && <Icon name="chevron-b" size={13} className="opacity-35 my-0.5" />}
                  </div>
                ))}
                <p className="text-[11px] mt-3 mb-0" style={{ color: "var(--muted)" }}>Registro de demonstração — fabricante, camadas e ordem são totalmente configuráveis pelo administrador.</p>
              </div>
              <SecaoCamadas />
            </div>
          </div>
        )}

        {/* ============ CAMADAS ============ */}
        {secao === "camadas" && <div className="anim-fade"><CabecalhoPagina titulo="Camadas de Proteção" subtitulo="Camadas de segurança configuráveis — crie novas camadas sem alterar o código." /><SecaoCamadas /></div>}

        {/* ============ TOPOLOGIA ============ */}
        {secao === "topologia" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Topologia de Rede" subtitulo="Mapa interativo da infraestrutura — arraste para mover, use os controles para zoom, clique em um nó para detalhes." />
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: "1px solid var(--line)" }}>
                <button className="btn btn-outline !py-1 text-[11.5px]" onClick={() => setZoom((z) => Math.min(1.8, z + 0.2))}><Icon name="mais" size={13} /> Zoom</button>
                <button className="btn btn-outline !py-1 text-[11.5px]" onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}>— Reduzir</button>
                <button className="btn btn-ghost !py-1 text-[11.5px]" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>Restaurar vista</button>
                <span className="ml-auto text-[11px]" style={{ color: "var(--muted)" }}>{fmtNum(nos.length)} nós · {fmtNum(conns.length)} conexões · documentação classificada como Restrita</span>
              </div>
              <svg
                viewBox="0 0 1240 640" className="w-full select-none" style={{ cursor: arraste.current ? "grabbing" : "grab", background: "radial-gradient(600px 300px at 50% 40%, rgba(30,122,84,0.06), transparent)" }}
                onMouseDown={(e) => { arraste.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }; }}
                onMouseMove={(e) => { if (arraste.current) setPan({ x: e.clientX - arraste.current.x, y: e.clientY - arraste.current.y }); }}
                onMouseUp={() => { arraste.current = null; }}
                onMouseLeave={() => { arraste.current = null; }}
              >
                <g transform={`translate(${pan.x / 2}, ${pan.y / 2}) scale(${zoom})`} style={{ transformOrigin: "620px 320px", transition: arraste.current ? "none" : "transform 0.2s ease" }}>
                  {conns.map((c) => {
                    const a = nos.find((n) => n.id === c.origem);
                    const b = nos.find((n) => n.id === c.destino);
                    if (!a || !b) return null;
                    return (
                      <g key={c.id}>
                        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={c.redundante ? "var(--green)" : "var(--line-2)"} strokeWidth={c.redundante ? 2.5 : 1.6} strokeDasharray={c.redundante ? "7 4" : undefined} />
                        <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 5} textAnchor="middle" style={{ fontSize: 9.5, fill: "var(--muted)", fontWeight: 700 }}>{c.velocidade}{c.vlan ? ` · ${c.vlan}` : ""}</text>
                      </g>
                    );
                  })}
                  {nos.map((n) => {
                    const crit = n.criticidade === "Crítica";
                    const sel = noSel === n.id;
                    return (
                      <g key={n.id} transform={`translate(${n.x}, ${n.y})`} onClick={(e) => { e.stopPropagation(); setNoSel(n.id); }} style={{ cursor: "pointer" }}>
                        <rect x={-78} y={-30} width={156} height={60} rx={10}
                          fill={sel ? "var(--deep)" : "#fbfcf9"}
                          stroke={crit ? "var(--red)" : sel ? "var(--accent)" : "var(--line-2)"} strokeWidth={crit || sel ? 2.2 : 1.2}
                          style={{ filter: sel ? "drop-shadow(0 6px 14px rgba(11,42,32,0.3))" : "drop-shadow(0 2px 5px rgba(19,37,29,0.1))", transition: "all 0.2s ease" }} />
                        <text x={0} y={-8} textAnchor="middle" style={{ fontSize: 11.5, fontWeight: 800, fill: sel ? "#f4f7f2" : "var(--ink)" }}>{n.nome.length > 24 ? n.nome.slice(0, 23) + "…" : n.nome}</text>
                        <text x={0} y={7} textAnchor="middle" style={{ fontSize: 9.5, fill: sel ? "rgba(244,247,242,0.7)" : "var(--muted)" }}>{n.tipo}{n.ip ? ` · ${n.ip}` : ""}</text>
                        <circle cx={64} cy={-18} r={4.5} fill={n.status === "Operacional" ? "var(--green)" : "var(--red)"}>
                          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
                        </circle>
                        {crit && <text x={0} y={21} textAnchor="middle" style={{ fontSize: 8.5, fontWeight: 800, fill: "var(--red)" }}>CRÍTICO</text>}
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>
        )}

        {/* ============ ATIVOS CRÍTICOS ============ */}
        {secao === "criticos" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Ativos Críticos" subtitulo="Criticidade, redundância e pontos únicos de falha — integrados ao Patrimônio de TI (mesma base, sem duplicação)." />
            <div className="grid lg:grid-cols-2 gap-4">
              {ATIVOS_CRITICOS_SEED.map((ac) => {
                const a = ativos.find((x) => x.id === ac.ativoId);
                const spof = ac.redundancia === "Sem Redundância";
                return (
                  <div key={ac.ativoId} className="card card-hover p-5" style={{ borderColor: spof ? "rgba(179,64,42,0.45)" : undefined }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[11px] font-extrabold tabular-nums" style={{ color: "var(--muted)" }}>Patrimônio {a?.patrimonio ?? ac.ativoId}</span>
                          <Chip tom={tomSev(ac.criticidade)}>{ac.criticidade}</Chip>
                          <Chip tom={ac.redundancia === "Sem Redundância" ? "vermelho" : ac.redundancia === "Redundância Parcial" ? "ambar" : "verde"} dot={false}>{ac.redundancia}</Chip>
                        </div>
                        <h3 className="font-display font-bold text-[16px] m-0">{a ? `${a.fabricante} ${a.modelo}` : ac.ativoId}</h3>
                        <p className="text-[12px] mt-1 mb-0" style={{ color: "var(--muted)" }}>{ac.justificativa}</p>
                      </div>
                    </div>
                    {spof && (
                      <div className="mt-3 rounded-lg px-3.5 py-2.5 flex items-center gap-2.5 text-[12px] font-bold" style={{ background: "var(--red-soft)", color: "var(--red)" }}>
                        <Icon name="aviso" size={16} /> Ponto único de falha identificado.
                        <button className="btn btn-outline !py-1 text-[11px] ml-auto" style={{ color: "var(--red)", borderColor: "var(--red)", background: "#fff" }}
                          onClick={() => {
                            criarRisco({ titulo: `Ponto único de falha — ${a?.modelo ?? ac.ativoId}`, descricao: `${ac.justificativa} Serviços afetados: ${ac.servicosAfetados}.`, categoria: "Segurança", probabilidade: 3, impacto: 5, tendencia: "Estável", nivel: "Crítico", mitigacao: "Avaliar redundância (equipamento sobressalente ou alta disponibilidade).", responsavelId: ac.responsavelId, projetoId: null });
                            toast("Risco criado", "verde", "Vinculado à Gestão de Riscos com nível Crítico.");
                          }}>
                          <Icon name="riscos" size={13} /> Criar risco relacionado
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px]">
                      {[["RTO", ac.rto], ["RPO", ac.rpo], ["Backup", ac.backup], ["Responsável", nomeDe(ac.responsavelId)?.nome.split(" ")[0] ?? "—"]].map(([k, v]) => (
                        <div key={k} className="rounded-md px-2.5 py-2" style={{ background: "rgba(19,37,29,0.04)" }}>
                          <div className="font-bold uppercase tracking-wider text-[9px]" style={{ color: "var(--muted)" }}>{k}</div>
                          <div className="font-bold mt-0.5">{v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-[11px] mt-2.5" style={{ color: "var(--muted)" }}><strong>Serviços afetados:</strong> {ac.servicosAfetados}</div>
                  </div>
                );
              })}
            </div>
            <div className="card p-5 mt-4">
              <div className="ovl mb-3">Links de Internet (dados sensíveis — visibilidade por permissão)</div>
              <div className="overflow-x-auto">
                <table className="tbl min-w-[720px]">
                  <thead><tr><th>Provedor</th><th>Contrato</th><th>Velocidade</th><th>IP Público</th><th>Papel</th><th>Firewall</th><th>SLA</th><th>Status</th></tr></thead>
                  <tbody>
                    {LINKS_SEED.map((l) => (
                      <tr key={l.id}>
                        <td className="font-bold text-[12.5px]">{l.provedor}</td>
                        <td className="tabular-nums text-[12px]">{l.contrato}</td>
                        <td className="font-bold">{l.velocidade}</td>
                        <td className="tabular-nums text-[12px]">{temPermissao("security.network.view") ? l.ipPublico : "•••.•••.•••.•••"}</td>
                        <td><Chip tom={l.papel === "Principal" ? "verde" : "azul"} dot={false}>{l.papel}</Chip></td>
                        <td className="text-[12px]">{FIREWALLS_SEED.find((f) => f.id === l.firewallId)?.nome}</td>
                        <td className="text-[12px]">{l.sla}</td>
                        <td><Chip tom="verde">{l.status}</Chip></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============ FIREWALLS ============ */}
        {secao === "firewalls" && (
          <div className="anim-fade space-y-4">
            <CabecalhoPagina titulo="Firewalls" subtitulo="Registros físicos, lógicos e virtuais — vinculados ao Patrimônio de TI. Detalhamento de regras restrito a perfis autorizados." />
            {FIREWALLS_SEED.map((fw) => {
              const a = ativos.find((x) => x.id === fw.ativoId);
              return (
                <div key={fw.id} className="card overflow-hidden">
                  <div className="flex flex-wrap items-center gap-4 px-5 py-4" style={{ borderBottom: "1px solid var(--line)" }}>
                    <span className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: "var(--deep)", color: "#f2b70a" }}><Icon name="escudo" size={22} /></span>
                    <div className="flex-1 min-w-[220px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-[16px] m-0">{fw.nome}</h3>
                        <Chip tom="verde">{fw.status}</Chip>
                        <Chip tom="cinza" dot={false}>{fw.tipo}</Chip>
                        {!fw.altaDisponibilidade && <Chip tom="vermelho" dot={false}>Sem redundância</Chip>}
                      </div>
                      <div className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>
                        {fw.fabricante} {fw.modelo} · Patrimônio {fw.patrimonio} · {fw.localizacao} — {fw.rack} {fw.u} · firmware {fw.firmware ?? fw.versao}
                      </div>
                    </div>
                    <div className="text-right text-[11px]" style={{ color: "var(--muted)" }}>
                      <div>Implantado: {fmtData(fw.implantadoEm)}</div>
                      <div>Última atualização: {fmtData(fw.ultimaAtualizacao)}</div>
                      <div>Responsável: {nomeDe(fw.responsavelId)?.nome}</div>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-2">
                    <div className="p-5" style={{ borderRight: "1px solid var(--line)" }}>
                      <div className="ovl mb-3">Interfaces e zonas</div>
                      <table className="tbl">
                        <thead><tr><th>Interface</th><th>IP</th><th>VLAN</th><th>Zona</th><th>Status</th></tr></thead>
                        <tbody>
                          {INTERFACES_FW_SEED.filter((i) => i.firewallId === fw.id).map((i) => (
                            <tr key={i.id}>
                              <td className="font-bold text-[12px]">{i.nome} <span className="font-normal" style={{ color: "var(--muted)" }}>({i.portaFisica})</span></td>
                              <td className="tabular-nums text-[12px]">{temPermissao("security.network.view") ? i.ip : "•••"}</td>
                              <td className="text-[12px]">{i.vlan}</td>
                              <td><Chip tom="ciano" dot={false}>{i.zona}</Chip></td>
                              <td><Chip tom="verde" dot={false}>{i.status}</Chip></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {fw.tipo === "Lógico" && (
                        <div className="mt-3 text-[12px] leading-relaxed rounded-lg px-3.5 py-3" style={{ background: "rgba(19,37,29,0.04)" }}>
                          <strong>Hospedado em:</strong> {a ? `${a.fabricante} ${a.modelo} (${a.patrimonio})` : fw.servidorHospedeiroId} · <strong>Software:</strong> {fw.software} {fw.versao}<br />
                          <strong>Redes protegidas:</strong> {fw.redesProtegidas}<br />
                          <strong>Serviços protegidos:</strong> {fw.servicosProtegidos}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="ovl mb-3">Regras documentadas ({REGRAS_FW_SEED.filter((r) => r.firewallId === fw.id).length})</div>
                      <div className="space-y-2">
                        {REGRAS_FW_SEED.filter((r) => r.firewallId === fw.id).map((r) => (
                          <div key={r.id} className="rounded-lg px-3.5 py-2.5" style={{ background: "rgba(19,37,29,0.035)" }}>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[12.5px] font-bold">{r.nome}</span>
                              <Chip tom={r.acao === "Permitir" ? "verde" : r.acao === "Bloquear" ? "vermelho" : "ambar"} dot={false}>{r.acao}</Chip>
                              <span className="ml-auto text-[10.5px] tabular-nums" style={{ color: "var(--muted)" }}>rev. {fmtData(r.ultimaRevisao)}</span>
                            </div>
                            {temPermissao("security.firewall.view") ? (
                              <div className="text-[11.5px] mt-1 tabular-nums" style={{ color: "var(--muted)" }}>{r.origem} → {r.destino} · {r.servico} {r.protocolo}</div>
                            ) : (
                              <div className="text-[11.5px] mt-1 flex items-center gap-1.5" style={{ color: "var(--muted)" }}><Icon name="cadeado" size={12} /> Detalhe restrito — requer permissão security.firewall.view</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="ovl">Revisão Semestral de Regras de Firewall — 2026</div>
                <Chip tom="ambar" dot={false}>{fmtNum(revisoesRegras.filter((r) => r.decisao === null).length)} pendentes</Chip>
              </div>
              <div className="overflow-x-auto">
                <table className="tbl min-w-[680px]">
                  <thead><tr><th>Regra</th><th>Firewall</th><th>Decisão</th><th>Revisor</th><th className="text-right">Ação</th></tr></thead>
                  <tbody>
                    {revisoesRegras.map((rv) => {
                      const regra = REGRAS_FW_SEED.find((r) => r.id === rv.regraId);
                      return (
                        <tr key={rv.regraId}>
                          <td className="font-bold text-[12.5px]">{regra?.nome}</td>
                          <td className="text-[12px]">{FIREWALLS_SEED.find((f) => f.id === regra?.firewallId)?.nome}</td>
                          <td>{rv.decisao ? <Chip tom={rv.decisao === "Manter" ? "verde" : rv.decisao === "Excluir" || rv.decisao === "Desativar" ? "vermelho" : "ambar"} dot={false}>{rv.decisao}</Chip> : <Chip tom="cinza">Pendente</Chip>}</td>
                          <td className="text-[12px]">{rv.revisor ?? "—"}{rv.data ? ` · ${fmtData(rv.data)}` : ""}</td>
                          <td className="text-right">
                            {!rv.decisao && (
                              <button className="btn btn-outline !py-1 text-[11.5px]" onClick={() => { setModalRevisao(rv.regraId); setJustRevisao(""); }}>Registrar decisão</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============ REDE E SEGMENTAÇÃO ============ */}
        {secao === "rede" && (
          <div className="anim-fade grid lg:grid-cols-2 gap-4 items-start">
            <div>
              <CabecalhoPagina titulo="Rede e Segmentação" subtitulo="VLANs e zonas de segurança configuráveis — IDs não são fixos." />
              <div className="card overflow-hidden">
                <table className="tbl">
                  <thead><tr><th>VLAN</th><th>Rede</th><th>Finalidade</th><th>Zona</th><th>Status</th></tr></thead>
                  <tbody>
                    {VLANS_SEED.map((v) => (
                      <tr key={v.id}>
                        <td className="font-extrabold tabular-nums">{fmtNum(v.numero)} <span className="font-semibold text-[11px]" style={{ color: "var(--muted)" }}>{v.nome}</span></td>
                        <td className="tabular-nums text-[12px]">{temPermissao("security.network.view") ? v.rede : "•••"}</td>
                        <td className="text-[12px]">{v.finalidade}</td>
                        <td><Chip tom="ciano" dot={false}>{v.zona}</Chip></td>
                        <td><Chip tom="verde" dot={false}>{v.status}</Chip></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="lg:mt-[74px]">
              <div className="card p-5">
                <div className="ovl mb-3">Zonas de segurança ({ZONAS_SEED.length})</div>
                <div className="flex flex-wrap gap-2">
                  {ZONAS_SEED.map((z) => (
                    <span key={z.id} className="chip cursor-default" style={{ background: "var(--cyan-soft)", color: "var(--cyan)" }} title={z.descricao}>{z.nome}</span>
                  ))}
                </div>
                <p className="text-[11.5px] mt-4 mb-0" style={{ color: "var(--muted)" }}>Zonas personalizadas podem ser criadas pelo administrador; as regras de firewall referenciam zonas, nunca endereços fixos.</p>
              </div>
            </div>
          </div>
        )}

        {/* ============ SERVIDORES ============ */}
        {secao === "servidores" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Servidores e Serviços" subtitulo="Integrado ao Patrimônio de TI — serviços essenciais documentados com porta, protocolo e dependências." />
            <div className="grid lg:grid-cols-2 gap-4">
              {SERVIDORES_SEED.map((s) => {
                const a = ativos.find((x) => x.id === s.ativoId);
                return (
                  <div key={s.ativoId} className="card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--blue-soft)", color: "var(--blue)" }}><Icon name="sistema" size={19} /></span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-[15.5px] m-0">{s.hostname}</h3>
                          <Chip tom={tomSev(s.criticidade)} dot={false}>{s.criticidade}</Chip>
                          <Chip tom="cinza" dot={false}>{s.tipo}</Chip>
                        </div>
                        <div className="text-[11.5px]" style={{ color: "var(--muted)" }}>
                          {a ? `Patrimônio ${a.patrimonio} · ` : ""}{s.so} · {s.cpu} · {s.ram} · {s.storage} · {s.hypervisor}
                        </div>
                      </div>
                    </div>
                    <table className="tbl">
                      <thead><tr><th>Serviço</th><th>Porta</th><th>Criticidade</th><th>Status</th></tr></thead>
                      <tbody>
                        {s.servicos.map((sv) => (
                          <tr key={sv.nome}>
                            <td className="font-bold text-[12px]">{sv.nome}</td>
                            <td className="tabular-nums text-[12px]">{sv.porta} {sv.protocolo}</td>
                            <td><Chip tom={tomSev(sv.criticidade)} dot={false}>{sv.criticidade}</Chip></td>
                            <td><Chip tom={sv.status === "Operacional" ? "verde" : "ambar"} dot={false}>{sv.status}</Chip></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============ SISTEMAS CRÍTICOS ============ */}
        {secao === "sistemas" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Sistemas Críticos" subtitulo="Catálogo de sistemas municipais com RTO/RPO e responsável global — integrado ao roteamento da Central de Serviços." />
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="tbl min-w-[900px]">
                  <thead><tr><th>Sistema</th><th>Secretaria Gestora</th><th>Responsável Global</th><th>Criticidade</th><th>SLA</th><th>RTO / RPO</th><th>Autenticação</th><th>Status</th></tr></thead>
                  <tbody>
                    {SISTEMAS_SEED.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div className="font-bold text-[12.5px]">{s.nome}</div>
                          <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{s.fornecedor} · {s.servidor}</div>
                        </td>
                        <td className="text-[12px]">{unDe(s.secretariaId)?.sigla}</td>
                        <td>
                          <span className="flex items-center gap-2 text-[12px] font-semibold whitespace-nowrap">
                            <Avatar nome={nomeDe(s.responsavelGlobalId ?? s.tecnicoId)?.nome ?? "?"} size={22} />
                            {nomeDe(s.responsavelGlobalId ?? s.tecnicoId)?.nome.split(" ").slice(0, 2).join(" ")}
                          </span>
                        </td>
                        <td><Chip tom={tomSev(s.criticidade)}>{s.criticidade}</Chip></td>
                        <td className="tabular-nums text-[12px] font-bold">{s.sla}</td>
                        <td className="tabular-nums text-[12px]">{s.rto} / {s.rpo}</td>
                        <td className="text-[12px]">{s.autenticacao}</td>
                        <td><Chip tom={s.status === "Operacional" ? "verde" : "ciano"} dot={false}>{s.status}</Chip></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============ IDENTIDADES ============ */}
        {secao === "identidades" && (
          <div className="anim-fade space-y-4">
            <CabecalhoPagina titulo="Identidades e Acessos" subtitulo="Contas de usuário, serviço e privilégios administrados com revisão periódica — sem armazenar senhas de domínio." />
            <div className="grid lg:grid-cols-2 gap-4 items-start">
              <div className="card overflow-hidden">
                <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--line)" }}><span className="font-display font-bold text-[15px]">Contas e acessos</span></div>
                <table className="tbl">
                  <thead><tr><th>Usuário</th><th>Sistema</th><th>Tipo</th><th>Revisão</th><th>Status</th></tr></thead>
                  <tbody>
                    {IDENTIDADES_SEED.map((i) => (
                      <tr key={i.id}>
                        <td className="font-bold text-[12px]">{i.usuario}</td>
                        <td className="text-[12px]">{i.sistema}</td>
                        <td><Chip tom={i.tipoConta.includes("serviço") || i.tipoConta.includes("aplicação") ? "ciano" : "cinza"} dot={false}>{i.tipoConta}</Chip></td>
                        <td className="tabular-nums text-[12px]">{fmtData(i.revisao)}</td>
                        <td><Chip tom={i.status === "Ativo" ? "verde" : i.status === "Suspenso" ? "cinza" : "ambar"} dot={false}>{i.status}</Chip></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-4">
                <div className="card overflow-hidden">
                  <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--line)" }}>
                    <span className="font-display font-bold text-[15px]">Acessos privilegiados</span>
                    <Chip tom="ambar" dot={false}>{fmtNum(PRIVILEGIOS_SEED.filter((p) => p.status !== "Ativo").length)} atenção</Chip>
                  </div>
                  <table className="tbl">
                    <thead><tr><th>Servidor</th><th>Privilégio</th><th>Expiração</th><th>Status</th></tr></thead>
                    <tbody>
                      {PRIVILEGIOS_SEED.map((p) => (
                        <tr key={p.id}>
                          <td className="font-bold text-[12px] whitespace-nowrap">{nomeDe(p.usuarioId)?.nome.split(" ").slice(0, 2).join(" ")}</td>
                          <td>
                            <div className="text-[12px] font-semibold">{p.privilegio}</div>
                            <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{p.sistema}</div>
                          </td>
                          <td className="tabular-nums text-[12px]">{fmtData(p.expiracao)}</td>
                          <td><Chip tom={p.status === "Ativo" ? "verde" : p.status === "Expirado" ? "vermelho" : "ambar"} dot={false}>{p.status}</Chip></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card p-5">
                  <div className="ovl mb-3">Política de senhas vigente</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px]">
                    {[
                      ["Tamanho mínimo", `${politicaSenha.tamanhoMin} caracteres`],
                      ["Expiração", `${politicaSenha.expiracaoDias} dias`],
                      ["Histórico", `${politicaSenha.historico} senhas`],
                      ["Bloqueio", `${politicaSenha.tentativas} tentativas / ${politicaSenha.bloqueioMin} min`],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-md px-3 py-2.5" style={{ background: "rgba(19,37,29,0.04)" }}>
                        <div className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{k}</div>
                        <div className="font-bold mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {[politicaSenha.maiusculas && "Maiúsculas", politicaSenha.minusculas && "Minúsculas", politicaSenha.numeros && "Números", politicaSenha.especiais && "Símbolos", politicaSenha.obrigatoriaPrimeiroAcesso && "Troca no 1º acesso"]
                      .filter(Boolean).map((r) => <Chip key={r as string} tom="verde" dot={false}>{r}</Chip>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ COFRE ============ */}
        {secao === "cofre" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Cofre de Credenciais" subtitulo="Segredos técnicos institucionais cifrados em repouso. Nunca armazene senhas pessoais de servidores aqui."
              acoes={podeGerirCofre ? <button className="btn btn-accent" onClick={() => setModalCredencial(true)}><Icon name="mais" size={16} /> Nova Credencial</button> : undefined} />
            {!podeCofre ? (
              <div className="card p-10 text-center">
                <Icon name="cadeado" size={34} className="mx-auto mb-3 opacity-40" />
                <h3 className="font-display font-bold text-[17px] m-0">Acesso não autorizado</h3>
                <p className="text-[13px] mt-2 mb-0" style={{ color: "var(--muted)" }}>Seu perfil atual ({perfilLabel()}) não possui a permissão <strong>security.credential.view</strong>.<br />Simule o perfil “Gestor de Segurança da Informação” no menu do usuário para demonstrar.</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4 items-start">
                <div className="space-y-3">
                  {cofre.map((c) => (
                    <div key={c.id} className="card p-4">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--yellow-soft)", color: "var(--accent-ink)" }}><Icon name="cadeado" size={15} /></span>
                        <span className="text-[13px] font-bold">{c.nome}</span>
                        <Chip tom="cinza" dot={false}>{c.categoria}</Chip>
                        <span className="ml-auto text-[10.5px]" style={{ color: "var(--muted)" }}>rotação {fmtData(c.rotacionadaEm)}</span>
                      </div>
                      <div className="text-[11.5px]" style={{ color: "var(--muted)" }}>{c.alvo} · conta <strong>{c.usuarioConta}</strong> · responsável {nomeDe(c.responsavelId)?.nome}</div>
                      <div className="flex items-center gap-2 mt-2.5">
                        <code className="flex-1 rounded-md px-3 py-2 text-[12px] tabular-nums" style={{ background: "rgba(19,37,29,0.05)" }}>
                          {segredoVisivel[c.id] ?? "••••••••••••••••"}
                        </code>
                        <button className="btn btn-outline !py-1.5 text-[11.5px]" onClick={() => {
                          if (segredoVisivel[c.id]) { setSegredoVisivel((s) => { const n = { ...s }; delete n[c.id]; return n; }); return; }
                          const valor = revelarCredencial(c.id);
                          setSegredoVisivel((s) => ({ ...s, [c.id]: valor }));
                          setTimeout(() => setSegredoVisivel((s) => { const n = { ...s }; delete n[c.id]; return n; }), 8000);
                        }}>
                          <Icon name={segredoVisivel[c.id] ? "fechar" : "olho"} size={13} /> {segredoVisivel[c.id] ? "Ocultar" : "Revelar"}
                        </button>
                        {podeGerirCofre && (
                          <button className="btn btn-outline !py-1.5 text-[11.5px]" onClick={() => { rotacionarCredencial(c.id, `Gf-${Math.random().toString(36).slice(2, 10)}!`); toast("Credencial rotacionada", "verde", `${c.nome} — novo segredo cifrado em repouso`); }}>
                            <Icon name="engrenagem" size={13} /> Rotacionar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card overflow-hidden">
                  <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--line)" }}>
                    <span className="font-display font-bold text-[15px]">Auditoria do cofre</span>
                    <div className="text-[11px]" style={{ color: "var(--muted)" }}>O valor do segredo nunca é registrado — apenas a ação, o usuário e o IP.</div>
                  </div>
                  <table className="tbl">
                    <thead><tr><th>Data/Hora</th><th>Usuário</th><th>Credencial</th><th>Ação</th></tr></thead>
                    <tbody>
                      {cofreLog.map((l) => (
                        <tr key={l.id}>
                          <td className="tabular-nums text-[11.5px] font-bold whitespace-nowrap">{fmtDataHora(l.data)}</td>
                          <td className="text-[12px] whitespace-nowrap">{l.usuario}</td>
                          <td className="text-[12px]">{l.credencial}</td>
                          <td><Chip tom={l.acao.includes("visualizada") ? "ambar" : l.acao.includes("rotacionada") ? "azul" : "verde"} dot={false}>{l.acao}</Chip></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ VULNERABILIDADES ============ */}
        {secao === "vulnerabilidades" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Vulnerabilidades" subtitulo="Gestão do ciclo de vida com severidade, CVSS e remediação." />
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="tbl min-w-[860px]">
                  <thead><tr><th>Vulnerabilidade</th><th>CVE / CVSS</th><th>Severidade</th><th>Origem</th><th>Prazo</th><th>Status</th><th className="text-right">Alterar status</th></tr></thead>
                  <tbody>
                    {vulnerabilidades.map((v) => (
                      <tr key={v.id}>
                        <td>
                          <div className="font-bold text-[12.5px]">{v.titulo}</div>
                          <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{v.remediacao ?? v.descricao}</div>
                        </td>
                        <td className="tabular-nums text-[12px] whitespace-nowrap">{v.cve} {v.cvss ? `· ${String(v.cvss).replace(".", ",")}` : ""}</td>
                        <td><Chip tom={tomSev(v.severidade)}>{v.severidade}</Chip></td>
                        <td className="text-[12px]">{v.origem}</td>
                        <td className="tabular-nums text-[12px] font-bold" style={{ color: v.prazo < new Date().toISOString().slice(0, 10) && !["Corrigida", "Aceita", "Falso Positivo"].includes(v.status) ? "var(--red)" : undefined }}>{v.prazo.startsWith("2") ? fmtData(v.prazo) : "—"}</td>
                        <td><Chip tom={v.status === "Corrigida" ? "verde" : v.status === "Aberta" ? "vermelho" : v.status === "Aceita" || v.status === "Falso Positivo" ? "cinza" : "ambar"}>{v.status}</Chip></td>
                        <td className="text-right">
                          {podeVuln && (
                            <select className="select !py-1 !text-[11.5px] !w-[150px] ml-auto block" value={v.status}
                              onChange={(e) => { mudarStatusVulnerabilidade(v.id, e.target.value); toast("Vulnerabilidade atualizada", "verde", `${v.titulo} → ${e.target.value}`); }}>
                              {VULN_STATUS.map((s) => <option key={s}>{s}</option>)}
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============ PATCHES ============ */}
        {secao === "patches" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Atualizações e Patches" subtitulo="Situação de atualização do parque — integrada aos ativos." />
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="tbl min-w-[760px]">
                  <thead><tr><th>Sistema / Ativo</th><th>Versão atual</th><th>Disponível</th><th>Patch</th><th>Criticidade</th><th>Implantação</th><th>Status</th></tr></thead>
                  <tbody>
                    {PATCHES_SEED.map((p) => {
                      const a = ativos.find((x) => x.id === p.ativoId);
                      return (
                        <tr key={p.id}>
                          <td className="font-bold text-[12.5px]">{p.sistema}{a ? <span className="font-normal text-[10.5px]" style={{ color: "var(--muted)" }}> · Patrimônio {a.patrimonio}</span> : null}</td>
                          <td className="tabular-nums text-[12px]">{p.versaoAtual}</td>
                          <td className="tabular-nums text-[12px]">{p.versaoDisponivel}</td>
                          <td className="text-[12px]">{p.patch}</td>
                          <td><Chip tom={tomSev(p.criticidade)} dot={false}>{p.criticidade}</Chip></td>
                          <td className="tabular-nums text-[12px]">{p.implantacao.startsWith("2") ? fmtData(p.implantacao) : "—"}</td>
                          <td><Chip tom={p.status === "Atualizado" ? "verde" : p.status === "Falhou" ? "vermelho" : p.status === "Agendado" || p.status === "Pendente" ? "ambar" : "cinza"} dot={false}>{p.status}</Chip></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card p-5 mt-4">
              <div className="ovl mb-3">Proteção de endpoints (antivírus / EDR)</div>
              <div className="overflow-x-auto">
                <table className="tbl min-w-[680px]">
                  <thead><tr><th>Ativo</th><th>Produto</th><th>EDR</th><th>Última atualização</th><th>Último scan</th><th>Situação</th></tr></thead>
                  <tbody>
                    {ENDPOINTS_SEED.map((e) => {
                      const a = ativos.find((x) => x.id === e.ativoId);
                      return (
                        <tr key={e.ativoId}>
                          <td className="font-bold text-[12.5px]">Patrimônio {a?.patrimonio ?? e.ativoId} {a ? `· ${a.modelo}` : ""}</td>
                          <td className="text-[12px]">{e.produto} {e.versao !== "—" ? e.versao : ""}</td>
                          <td><Chip tom={e.edr ? "verde" : "cinza"} dot={false}>{e.edr ? "Instalado" : "—"}</Chip></td>
                          <td className="tabular-nums text-[12px]">{e.ultimaAtualizacao.startsWith("2") ? fmtData(e.ultimaAtualizacao) : "—"}</td>
                          <td className="tabular-nums text-[12px]">{e.ultimoScan.startsWith("2") ? fmtData(e.ultimoScan) : "—"}</td>
                          <td><Chip tom={e.status === "Protegido" ? "verde" : e.status === "Desatualizado" ? "ambar" : "vermelho"}>{e.status}</Chip></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============ INCIDENTES ============ */}
        {secao === "incidentes" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Incidentes de Segurança" subtitulo="Numeração própria SEG-2026-XXXXXX · conversão direta a partir de chamados da Central de Serviços."
              acoes={podeGerirInc ? <button className="btn btn-accent" onClick={() => setModalIncidente(true)}><Icon name="mais" size={16} /> Novo Incidente</button> : undefined} />
            <div className="grid lg:grid-cols-2 gap-4">
              {incidentesSeguranca.map((i) => (
                <div key={i.id} className="card p-5" style={{ borderLeft: `4px solid ${i.severidade === "Crítica" ? "var(--red)" : i.severidade === "Alta" ? "var(--amber)" : "var(--line-2)"}` }}>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-extrabold tabular-nums text-[12px]" style={{ color: "var(--muted)" }}>{i.numero}</span>
                    <Chip tom={tomSev(i.severidade)}>{i.severidade}</Chip>
                    <Chip tom={["Resolvido", "Fechado"].includes(i.status) ? "verde" : i.status === "Aberto" ? "vermelho" : "ambar"} dot={false}>{i.status}</Chip>
                    {i.chamadoOrigem && <Chip tom="azul" dot={false}>Origem: {i.chamadoOrigem}</Chip>}
                  </div>
                  <h3 className="font-display font-bold text-[15.5px] m-0">{i.titulo}</h3>
                  <p className="text-[12px] mt-1 mb-2" style={{ color: "var(--muted)" }}>{i.descricao}</p>
                  <div className="text-[11.5px] space-y-1">
                    <div><strong>Ocorrência:</strong> {fmtData(i.data)} {i.hora} · {unDe(i.unidadeId)?.sigla}{i.ativoId ? ` · Patrimônio ${ativos.find((a) => a.id === i.ativoId)?.patrimonio ?? i.ativoId}` : ""}{i.ip ? ` · IP ${i.ip}` : ""}</div>
                    <div><strong>Ações imediatas:</strong> {i.acoesImediatas}</div>
                    {i.causaRaiz && <div><strong>Causa raiz:</strong> {i.causaRaiz}</div>}
                    {i.acoesCorretivas && <div><strong>Correções:</strong> {i.acoesCorretivas}</div>}
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px dashed var(--line)" }}>
                    <Avatar nome={nomeDe(i.responsavelId)?.nome ?? "?"} size={24} />
                    <span className="text-[12px] font-bold">{nomeDe(i.responsavelId)?.nome}</span>
                    {podeGerirInc && !["Resolvido", "Fechado"].includes(i.status) && (
                      <select className="select !py-1 !text-[11.5px] !w-[170px] ml-auto" value={i.status}
                        onChange={(e) => { mudarStatusIncidente(i.id, e.target.value, ""); toast("Incidente atualizado", "verde", `${i.numero} → ${e.target.value}`); }}>
                        {INCIDENTE_STATUS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ BACKUPS ============ */}
        {secao === "backups" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Backups e Recuperação" subtitulo="Rotinas, retenção, criptografia e testes de restauração — alertas para backups nunca testados." />
            <div className="card overflow-hidden mb-4">
              <div className="overflow-x-auto">
                <table className="tbl min-w-[860px]">
                  <thead><tr><th>Alvo</th><th>Tipo / Frequência</th><th>Destino</th><th>Criptografia</th><th>Último sucesso</th><th>Último teste</th><th>Status</th></tr></thead>
                  <tbody>
                    {BACKUPS_SEED.map((b) => (
                      <tr key={b.id}>
                        <td className="font-bold text-[12.5px]">{b.alvo}</td>
                        <td className="text-[12px]">{b.tipo} · {b.frequencia}</td>
                        <td className="text-[12px]">{b.destino} · retenção {b.retencao}</td>
                        <td><Chip tom={b.criptografia ? "verde" : "vermelho"} dot={false}>{b.criptografia ? "Cifrado" : "Sem cifragem"}</Chip></td>
                        <td className="tabular-nums text-[12px]">{fmtData(b.ultimoSucesso)}</td>
                        <td>
                          {b.ultimoTeste
                            ? <span className="tabular-nums text-[12px]">{fmtData(b.ultimoTeste)}</span>
                            : <Chip tom="ambar">Nunca testado</Chip>}
                        </td>
                        <td><Chip tom={b.status === "OK" ? "verde" : b.status === "Alerta" ? "ambar" : "vermelho"}>{b.status}</Chip></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="card p-5">
                <div className="ovl mb-3">Testes de restauração</div>
                <div className="space-y-2.5">
                  {TESTES_RESTORE_SEED.map((t) => {
                    const b = BACKUPS_SEED.find((x) => x.id === t.backupId);
                    return (
                      <div key={t.id} className="flex items-center gap-3 rounded-lg px-3.5 py-2.5" style={{ background: "rgba(19,37,29,0.035)" }}>
                        <Chip tom={t.resultado === "Sucesso" ? "verde" : t.resultado === "Parcial" ? "ambar" : "vermelho"} dot={false}>{t.resultado}</Chip>
                        <span className="flex-1 text-[12px] font-semibold">{b?.alvo}</span>
                        <span className="text-[11px] tabular-nums" style={{ color: "var(--muted)" }}>{fmtData(t.data)} · {t.tempo}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="card p-5">
                <div className="ovl mb-3">Atenção imediata</div>
                {BACKUPS_SEED.filter((b) => b.status !== "OK" || !b.ultimoTeste).map((b) => (
                  <div key={b.id} className="flex items-start gap-2.5 py-2" style={{ borderBottom: "1px dashed var(--line)" }}>
                    <Icon name="aviso" size={16} className="mt-0.5 flex-none" />
                    <div className="text-[12px]">
                      <strong>{b.alvo}:</strong>{" "}
                      {b.status === "Falha" ? "última execução com falha — verificar destino e credenciais." : b.status === "Alerta" ? "sem teste de restauração registrado." : "pendência de teste de restauração."}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============ CONTINUIDADE ============ */}
        {secao === "continuidade" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Continuidade" subtitulo="Planos de recuperação dos serviços críticos com RTO/RPO e exercícios programados." />
            <div className="grid lg:grid-cols-2 gap-4">
              {CONTINUIDADE_SEED.map((p) => (
                <div key={p.id} className="card p-5">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-display font-bold text-[15.5px] m-0">{p.sistema}</h3>
                    <Chip tom={tomSev(p.criticidade)} dot={false}>{p.criticidade}</Chip>
                    {!p.ultimoTeste && <Chip tom="ambar" dot={false}>Sem exercício realizado</Chip>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11.5px] mb-3">
                    {[["RTO", p.rto], ["RPO", p.rpo], ["Último teste", p.ultimoTeste ? fmtData(p.ultimoTeste) : "—"], ["Próximo teste", fmtData(p.proximoTeste)]].map(([k, v]) => (
                      <div key={k} className="rounded-md px-3 py-2" style={{ background: "rgba(19,37,29,0.04)" }}>
                        <div className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{k}</div>
                        <div className="font-bold mt-0.5 tabular-nums">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[11.5px] space-y-1" style={{ color: "var(--muted)" }}>
                    <div><strong style={{ color: "var(--ink)" }}>Procedimento alternativo:</strong> {p.procedimentoAlternativo}</div>
                    <div><strong style={{ color: "var(--ink)" }}>Recuperação:</strong> {p.procedimentoRecuperacao}</div>
                    <div><strong style={{ color: "var(--ink)" }}>Dependências:</strong> {p.dependencias}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ SEGURANÇA FÍSICA ============ */}
        {secao === "fisica" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Segurança Física" subtitulo="Ambientes protegidos, controles físicos e documentação de racks — vinculada ao patrimônio." />
            <div className="grid lg:grid-cols-3 gap-4 items-start">
              {AMBIENTES_FISICOS_SEED.map((amb) => (
                <div key={amb.id} className="card p-5">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-display font-bold text-[15px] m-0">{amb.nome}</h3>
                    <Chip tom={tomSev(amb.criticidade)} dot={false}>{amb.criticidade}</Chip>
                  </div>
                  <div className="text-[11.5px] mb-3" style={{ color: "var(--muted)" }}>{amb.predio} · {amb.sala} · resp. {nomeDe(amb.responsavelId)?.nome}</div>
                  <div className="space-y-1.5">
                    {amb.controles.map((c) => (
                      <div key={c.nome} className="flex items-center gap-2 text-[12px]">
                        <span className="w-2 h-2 rounded-full" style={{ background: c.situacao === "Conforme" ? "var(--green)" : c.situacao === "Parcial" ? "var(--amber)" : c.situacao === "Não Conforme" ? "var(--red)" : "var(--grey)" }} />
                        <span className="flex-1 font-semibold">{c.nome}</span>
                        <span className="text-[10.5px] font-bold" style={{ color: c.situacao === "Conforme" ? "var(--green)" : c.situacao === "Parcial" ? "var(--amber)" : c.situacao === "Não Conforme" ? "var(--red)" : "var(--grey)" }}>{c.situacao}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] mt-3 pt-2.5" style={{ borderTop: "1px dashed var(--line)", color: "var(--muted)" }}>
                    Inspeção: {fmtData(amb.ultimaInspecao)} → <strong style={{ color: amb.proximaInspecao < new Date().toISOString().slice(0, 10) ? "var(--red)" : undefined }}>{fmtData(amb.proximaInspecao)}</strong>
                    {amb.obs && <div className="mt-1 italic">{amb.obs}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-4 mt-4">
              {RACKS_SEED.map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-display font-bold text-[15px] m-0">{r.nome}</h3>
                    <Chip tom="cinza" dot={false}>{r.alturaU}U</Chip>
                    <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>{r.local}</span>
                  </div>
                  <div className="space-y-1.5">
                    {r.posicoes.map((p) => (
                      <div key={p.u} className="flex items-center gap-3 rounded-md px-3 py-2 text-[12px]" style={{ background: p.ativoId ? "var(--green-soft)" : "rgba(19,37,29,0.035)" }}>
                        <span className="font-extrabold tabular-nums w-16 flex-none">{p.u}</span>
                        <span className="font-semibold">{p.descricao}</span>
                        {p.ativoId && <Icon name="caixa" size={13} className="ml-auto opacity-50" />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ POLÍTICAS ============ */}
        {secao === "politicas" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Políticas e Normas" subtitulo={`Níveis de classificação: ${NIVEIS_CLASSIFICACAO.join(" · ")} — aceite registrado por servidor.`} />
            <div className="grid lg:grid-cols-2 gap-4">
              {politicasSeguranca.map((p) => {
                const aceitou = p.lidoPor.includes(atual.id);
                const adesao = Math.round((p.lidoPor.length / Math.max(1, usuarios.filter((u) => u.ativo).length)) * 100);
                return (
                  <div key={p.id} className="card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-[15px] m-0">{p.titulo}</h3>
                          <Chip tom="cinza" dot={false}>v{p.versao}</Chip>
                          <Chip tom={p.status === "Em vigor" ? "verde" : p.status === "Em revisão" ? "ambar" : "cinza"} dot={false}>{p.status}</Chip>
                        </div>
                        <div className="text-[11.5px] mt-1" style={{ color: "var(--muted)" }}>{p.aprovacao} · vigente desde {fmtData(p.vigencia)} · revisão {fmtData(p.revisao)}</div>
                      </div>
                      {p.aceiteObrigatorio && (
                        aceitou
                          ? <Chip tom="verde">Li e estou ciente</Chip>
                          : <button className="btn btn-primary !py-1.5 text-[11.5px] flex-none" onClick={() => { aceitarPolitica(p.id); toast("Aceite registrado", "verde", `${p.titulo} (v${p.versao})`); }}><Icon name="check" size={13} /> Li e estou ciente</button>
                      )}
                    </div>
                    {p.aceiteObrigatorio && (
                      <div className="mt-3">
                        <div className="flex justify-between text-[10.5px] font-bold mb-1"><span style={{ color: "var(--muted)" }}>Adesão dos servidores</span><span className="tabular-nums">{fmtPct(adesao)}</span></div>
                        <Barra valor={adesao} cor={adesao >= 80 ? "var(--green)" : "var(--amber)"} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============ CONSCIENTIZAÇÃO ============ */}
        {secao === "conscientizacao" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Conscientização" subtitulo="Conteúdos, quizzes e campanhas de segurança para servidores." />
            <div className="grid lg:grid-cols-2 gap-4 mb-4">
              {CAMPANHAS_SEG_SEED.map((c) => (
                <div key={c.id} className="card p-5">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <h3 className="font-display font-bold text-[15.5px] m-0">{c.nome}</h3>
                    <Chip tom={c.status === "Concluída" ? "verde" : c.status === "Em andamento" ? "azul" : "cinza"} dot={false}>{c.status}</Chip>
                  </div>
                  <div className="text-[11.5px] mb-3" style={{ color: "var(--muted)" }}>{c.periodo} · Público: {c.publico}</div>
                  <div className="flex justify-between text-[10.5px] font-bold mb-1"><span style={{ color: "var(--muted)" }}>Taxa de conclusão</span><span className="tabular-nums">{fmtPct(c.taxaConclusao)}</span></div>
                  <Barra valor={c.taxaConclusao} cor={c.taxaConclusao >= 80 ? "var(--green)" : "var(--amber)"} />
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {CONTEUDOS_SEED.map((c) => (
                <div key={c.id} className="card card-hover p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Chip tom={c.tipo === "Quiz" ? "ambar" : c.tipo === "Vídeo" ? "azul" : c.tipo === "PDF" ? "vermelho" : "verde"} dot={false}>{c.tipo}</Chip>
                    <Chip tom="cinza" dot={false}>{c.categoria}</Chip>
                  </div>
                  <div className="text-[13px] font-bold leading-snug">{c.titulo}</div>
                  <p className="text-[11.5px] mt-1.5 mb-0 leading-relaxed" style={{ color: "var(--muted)" }}>{c.resumo}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ RISCOS DE SEGURANÇA ============ */}
        {secao === "riscos" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Riscos de Segurança" subtitulo="Integrado à Gestão de Riscos — riscos de segurança usam a mesma matriz com categoria própria."
              acoes={<button className="btn btn-accent" onClick={() => setModalRisco(true)}><Icon name="mais" size={16} /> Novo Risco de Segurança</button>} />
            <div className="grid lg:grid-cols-2 gap-4">
              {riscos.filter((r) => ["Segurança", "Tecnológico"].includes(r.categoria)).map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <Chip tom={r.nivel === "Crítico" ? "vermelho" : r.nivel === "Monitorando" ? "ambar" : "verde"}>{r.nivel}</Chip>
                    <Chip tom="cinza" dot={false}>{r.categoria}</Chip>
                    <span className="ml-auto text-[11px] font-bold tabular-nums" style={{ color: "var(--muted)" }}>P{r.probabilidade} × I{r.impacto} = {r.probabilidade * r.impacto}</span>
                  </div>
                  <h3 className="font-display font-bold text-[15px] m-0">{r.titulo}</h3>
                  <p className="text-[12px] mt-1 mb-2" style={{ color: "var(--muted)" }}>{r.descricao}</p>
                  <div className="rounded-lg px-3.5 py-2.5 text-[11.5px]" style={{ background: "rgba(30,122,84,0.06)" }}>
                    <strong style={{ color: "var(--green)" }}>Mitigação:</strong> {r.mitigacao}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ CONTROLES ============ */}
        {secao === "controles" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Matriz de Controles de Segurança" subtitulo="Controles por camada com tipo, evidências e ciclo de revisão." />
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="tbl min-w-[860px]">
                  <thead><tr><th>Controle</th><th>Camada</th><th>Tipo</th><th>Responsável</th><th>Última revisão</th><th>Próxima</th><th>Status</th></tr></thead>
                  <tbody>
                    {controles.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="font-bold text-[12.5px]">{c.nome}</div>
                          <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{c.evidencias ?? c.descricao}</div>
                        </td>
                        <td><Chip tom="ciano" dot={false}>{camadas.find((cm) => cm.id === c.camadaId)?.nome ?? "—"}</Chip></td>
                        <td className="text-[12px]">{c.tipoControle}</td>
                        <td className="text-[12px] whitespace-nowrap">{nomeDe(c.responsavelId)?.nome.split(" ").slice(0, 2).join(" ")}</td>
                        <td className="tabular-nums text-[12px]">{c.ultimaRevisao ? fmtData(c.ultimaRevisao) : "—"}</td>
                        <td className="tabular-nums text-[12px]" style={{ color: c.proximaRevisao && c.proximaRevisao < new Date().toISOString().slice(0, 10) ? "var(--red)" : undefined }}>{c.proximaRevisao ? fmtData(c.proximaRevisao) : "—"}</td>
                        <td>
                          <select className="select !py-1 !text-[11.5px] !w-[190px]" value={c.status}
                            onChange={(e) => { setStatusControle(c.id, e.target.value); toast("Controle atualizado", "verde", `${c.nome} → ${e.target.value}`); }}>
                            {CONTROLE_STATUS.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============ MATURIDADE ============ */}
        {secao === "maturidade" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Maturidade de Segurança" subtitulo="Modelo interno de maturidade (1–5). Não declara conformidade com normas externas." />
            <div className="card p-5 mb-4">
              <div className="flex flex-wrap gap-4 items-center">
                {NIVEIS_MATURIDADE.map((n, i) => (
                  <span key={n} className="flex items-center gap-2 text-[11.5px] font-bold" style={{ color: "var(--muted)" }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10.5px]" style={{ background: `color-mix(in srgb, var(--green) ${25 + i * 19}%, var(--grey))` }}>{i + 1}</span>
                    {n}
                  </span>
                ))}
                <span className="ml-auto font-display font-extrabold text-[20px] tabular-nums" style={{ color: "var(--green)" }}>
                  {(maturidade.reduce((s, m) => s + m.nivel, 0) / maturidade.length).toFixed(1).replace(".", ",")} <span className="text-[12px] font-bold" style={{ color: "var(--muted)" }}>média geral</span>
                </span>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {maturidade.map((m) => (
                <div key={m.dominio} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-bold">{m.dominio}</span>
                    <Chip tom={m.nivel >= 4 ? "verde" : m.nivel === 3 ? "azul" : "ambar"} dot={false}>{m.nivel} — {NIVEIS_MATURIDADE[m.nivel - 1]}</Chip>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} className="flex-1 h-2.5 rounded-full border-0 cursor-pointer transition-all"
                        style={{ background: n <= m.nivel ? "var(--green)" : "rgba(19,37,29,0.1)" }}
                        onClick={() => { setMaturidade(maturidade.map((x) => x.dominio === m.dominio ? { ...x, nivel: n } : x)); toast("Maturidade atualizada", "verde", `${m.dominio}: nível ${n}`); }}
                        aria-label={`Nível ${n}`} />
                    ))}
                  </div>
                  <p className="text-[11px] m-0 leading-relaxed" style={{ color: "var(--muted)" }}>{m.notas}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ RELATÓRIOS ============ */}
        {secao === "relatorios" && (
          <div className="anim-fade">
            <CabecalhoPagina titulo="Relatórios de Segurança" subtitulo="Exportações geradas a partir dos registros reais do módulo." />
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {[
                { nome: "Arquitetura de Segurança", fn: () => exportarCSV("arquitetura_seguranca", [["Camada", "Ordem", "Tipo", "Status"], ...[...camadas].sort((a, b) => a.ordem - b.ordem).map((c) => [c.nome, c.ordem, c.tipo, c.status])]) },
                { nome: "Firewalls", fn: () => exportarCSV("firewalls", [["Nome", "Tipo", "Fabricante", "Modelo", "Localização", "Status"], ...FIREWALLS_SEED.map((f) => [f.nome, f.tipo, f.fabricante, f.modelo, f.localizacao, f.status])]) },
                { nome: "Regras de Firewall", fn: () => exportarCSV("regras_firewall", [["Regra", "Origem", "Destino", "Serviço", "Ação", "Status"], ...REGRAS_FW_SEED.map((r) => [r.nome, r.origem, r.destino, r.servico, r.acao, r.status])]) },
                { nome: "VLANs e Zonas", fn: () => exportarCSV("vlans", [["VLAN", "Nome", "Rede", "Zona", "Finalidade"], ...VLANS_SEED.map((v) => [v.numero, v.nome, v.rede, v.zona, v.finalidade])]) },
                { nome: "Ativos Críticos e SPOF", fn: () => exportarCSV("ativos_criticos", [["Patrimônio", "Criticidade", "Redundância", "RTO", "RPO"], ...ATIVOS_CRITICOS_SEED.map((a) => [ativos.find((x) => x.id === a.ativoId)?.patrimonio ?? a.ativoId, a.criticidade, a.redundancia, a.rto, a.rpo])]) },
                { nome: "Incidentes", fn: () => exportarCSV("incidentes_seguranca", [["Número", "Título", "Severidade", "Status", "Data"], ...incidentesSeguranca.map((i) => [i.numero, i.titulo, i.severidade, i.status, fmtData(i.data)])]) },
                { nome: "Vulnerabilidades", fn: () => exportarCSV("vulnerabilidades", [["Título", "CVE", "Severidade", "Status", "Prazo"], ...vulnerabilidades.map((v) => [v.titulo, v.cve ?? "—", v.severidade, v.status, v.prazo])]) },
                { nome: "Patches", fn: () => exportarCSV("patches", [["Sistema", "Versão atual", "Disponível", "Status"], ...PATCHES_SEED.map((p) => [p.sistema, p.versaoAtual, p.versaoDisponivel, p.status])]) },
                { nome: "Contas Privilegiadas", fn: () => exportarCSV("contas_privilegiadas", [["Usuário", "Sistema", "Privilégio", "Expiração", "Status"], ...PRIVILEGIOS_SEED.map((p) => [nomeDe(p.usuarioId)?.nome ?? "", p.sistema, p.privilegio, fmtData(p.expiracao), p.status])]) },
                { nome: "Backups e Testes", fn: () => exportarCSV("backups", [["Alvo", "Frequência", "Último sucesso", "Último teste", "Status"], ...BACKUPS_SEED.map((b) => [b.alvo, b.frequencia, fmtData(b.ultimoSucesso), b.ultimoTeste ? fmtData(b.ultimoTeste) : "Nunca testado", b.status])]) },
                { nome: "Controles", fn: () => exportarCSV("controles_seguranca", [["Controle", "Camada", "Tipo", "Status"], ...controles.map((c) => [c.nome, camadas.find((cm) => cm.id === c.camadaId)?.nome ?? "", c.tipoControle, c.status])]) },
                { nome: "Maturidade", fn: () => exportarCSV("maturidade", [["Domínio", "Nível", "Descrição"], ...maturidade.map((m) => [m.dominio, `${m.nivel} — ${NIVEIS_MATURIDADE[m.nivel - 1]}`, m.notas])]) },
              ].map((r) => (
                <button key={r.nome} className="card card-hover p-4 text-left cursor-pointer block" onClick={r.fn}>
                  <div className="flex items-center gap-2 mb-2" style={{ color: "var(--green)" }}><Icon name="baixar" size={17} /></div>
                  <div className="text-[13px] font-bold">{r.nome}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>Gerar CSV com registros atuais</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== Drawer de nó da topologia ===== */}
      <PainelLateral aberto={!!noSelObj} onFechar={() => setNoSel(null)}
        titulo={noSelObj ? <span className="flex items-center gap-2"><Icon name="rede" size={17} /> {noSelObj.nome}</span> : ""}>
        {noSelObj && (() => {
          const ativo = noSelObj.ativoId ? ativos.find((a) => a.id === noSelObj.ativoId) : null;
          const incRel = incidentesSeguranca.filter((i) => i.ativoId === noSelObj.ativoId || (noSelObj.ip && i.ip === noSelObj.ip));
          const deps = conns.filter((c) => c.origem === noSelObj.id || c.destino === noSelObj.id)
            .map((c) => nos.find((n) => n.id === (c.origem === noSelObj.id ? c.destino : c.origem)))
            .filter(Boolean);
          const ctrls = controles.filter((c) => c.ativoId === noSelObj.ativoId);
          const ac = ATIVOS_CRITICOS_SEED.find((x) => x.ativoId === noSelObj.ativoId);
          return (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Chip tom="cinza" dot={false}>{noSelObj.tipo}</Chip>
                <Chip tom={tomSev(noSelObj.criticidade)}>{noSelObj.criticidade}</Chip>
                <Chip tom="verde" dot={false}>{noSelObj.status}</Chip>
                {ac?.redundancia === "Sem Redundância" && <Chip tom="vermelho" dot={false}>Ponto único de falha</Chip>}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                {[["Hostname", noSelObj.hostname ?? "—"], ["IP", noSelObj.ip ?? "—"], ["Localização", noSelObj.localizacao], ["Patrimônio", ativo?.patrimonio ?? "—"]].map(([k, v]) => (
                  <div key={k} className="rounded-lg px-3 py-2.5" style={{ background: "rgba(19,37,29,0.04)" }}>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{k}</div>
                    <div className="font-bold mt-0.5 tabular-nums">{v}</div>
                  </div>
                ))}
              </div>
              {ativo && (
                <div>
                  <div className="ovl mb-2">Ativo vinculado (Patrimônio de TI)</div>
                  <div className="rounded-lg px-3.5 py-3 text-[12px]" style={{ background: "var(--blue-soft)" }}>
                    <strong>{ativo.fabricante} {ativo.modelo}</strong> · série {ativo.serie}<br />
                    Status: {ativo.status} · Garantia até {fmtData(ativo.garantiaFim)}<br />
                    {ativo.manutencoes.length} manutenções registradas · {unDe(ativo.unidadeId)?.sigla}
                  </div>
                </div>
              )}
              <div>
                <div className="ovl mb-2">Dependências diretas</div>
                {deps.length === 0 && <p className="text-[12px]" style={{ color: "var(--muted)" }}>Nó de extremidade.</p>}
                <div className="flex flex-wrap gap-1.5">
                  {deps.map((d) => <Chip key={d!.id} tom="ciano" dot={false}>{d!.nome}</Chip>)}
                </div>
              </div>
              <div>
                <div className="ovl mb-2">Incidentes relacionados — {fmtNum(incRel.length)}</div>
                {incRel.length === 0 && <p className="text-[12px]" style={{ color: "var(--muted)" }}>Nenhum incidente vinculado a este nó.</p>}
                {incRel.map((i) => (
                  <div key={i.id} className="flex items-center gap-2 text-[12px] py-1">
                    <span className="font-bold tabular-nums">{i.numero}</span>
                    <span className="flex-1 truncate" style={{ color: "var(--muted)" }}>{i.titulo}</span>
                    <Chip tom={tomSev(i.severidade)} dot={false}>{i.severidade}</Chip>
                  </div>
                ))}
              </div>
              <div>
                <div className="ovl mb-2">Controles de segurança — {fmtNum(ctrls.length)}</div>
                {ctrls.length === 0 && <p className="text-[12px]" style={{ color: "var(--muted)" }}>Controles associados à camada, não diretamente ao ativo.</p>}
                {ctrls.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 text-[12px] py-1">
                    <span className="flex-1 font-semibold">{c.nome}</span>
                    <Chip tom={tomStatusCtrl(c.status)} dot={false}>{c.status}</Chip>
                  </div>
                ))}
              </div>
              {noSelObj.notas && <p className="text-[11.5px] italic m-0" style={{ color: "var(--muted)" }}>{noSelObj.notas}</p>}
            </div>
          );
        })()}
      </PainelLateral>

      {/* ===== Modais ===== */}
      <Modal aberto={modalIncidente} onFechar={() => setModalIncidente(false)} titulo="Novo Incidente de Segurança" largo
        rodape={<><button className="btn btn-outline" onClick={() => setModalIncidente(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => {
            if (!novoInc.titulo.trim()) { toast("Informe o título", "vermelho"); return; }
            const i = criarIncidente({
              titulo: novoInc.titulo, descricao: novoInc.descricao || "Relato inicial registrado.", ...dtLocal(),
              hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
              unidadeId: novoInc.unidadeId, severidade: novoInc.severidade as never, impacto: "Em avaliação.",
              responsavelId: atual.id, evidencias: [], acoesImediatas: "Triagem inicial pela equipe de segurança.", ip: novoInc.ip || undefined,
            });
            toast("Incidente registrado", "verde", `${i.numero} — numerado automaticamente`);
            setModalIncidente(false); setNovoInc({ titulo: "", descricao: "", categoria: "Phishing", severidade: "Média", unidadeId: "un1", ip: "" });
          }}><Icon name="check" size={15} /> Registrar incidente</button></>}>
        <div className="space-y-4">
          <Campo rotulo="Título" obrigatorio><input className="input" value={novoInc.titulo} onChange={(e) => setNovoInc({ ...novoInc, titulo: e.target.value })} placeholder="ex.: E-mail suspeito com anexo executável" /></Campo>
          <Campo rotulo="Descrição"><textarea className="textarea" rows={3} value={novoInc.descricao} onChange={(e) => setNovoInc({ ...novoInc, descricao: e.target.value })} /></Campo>
          <div className="grid grid-cols-3 gap-4">
            <Seletor rotulo="Categoria" valor={novoInc.categoria} onChange={(v) => setNovoInc({ ...novoInc, categoria: v })} opcoes={INCIDENTE_CATEGORIAS} />
            <Seletor rotulo="Severidade" valor={novoInc.severidade} onChange={(v) => setNovoInc({ ...novoInc, severidade: v })} opcoes={["Baixa", "Média", "Alta", "Crítica"]} />
            <Seletor rotulo="Unidade afetada" valor={novoInc.unidadeId} onChange={(v) => setNovoInc({ ...novoInc, unidadeId: v })} opcoes={unidades.map((u) => ({ valor: u.id, rotulo: `${u.sigla} — ${u.nome}` }))} />
          </div>
          <Campo rotulo="IP envolvido (opcional)"><input className="input tabular-nums" value={novoInc.ip} onChange={(e) => setNovoInc({ ...novoInc, ip: e.target.value })} placeholder="10.0.x.x" /></Campo>
        </div>
      </Modal>

      <Modal aberto={modalCamada} onFechar={() => setModalCamada(false)} titulo="Nova Camada de Segurança"
        rodape={<><button className="btn btn-outline" onClick={() => setModalCamada(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => {
            if (!novaCamada.nome.trim()) { toast("Informe o nome da camada", "vermelho"); return; }
            adicionarCamada(novaCamada.nome.trim(), novaCamada.tipo);
            toast("Camada criada", "verde", novaCamada.nome);
            setModalCamada(false); setNovaCamada({ nome: "", tipo: "Rede" });
          }}><Icon name="check" size={15} /> Criar camada</button></>}>
        <div className="space-y-4">
          <Campo rotulo="Nome" obrigatorio><input className="input" value={novaCamada.nome} onChange={(e) => setNovaCamada({ ...novaCamada, nome: e.target.value })} placeholder="ex.: Dispositivos IoT" /></Campo>
          <Seletor rotulo="Tipo" valor={novaCamada.tipo} onChange={(v) => setNovaCamada({ ...novaCamada, tipo: v })} opcoes={["Física", "Perímetro", "Rede", "Lógica", "Servidores", "Endpoint", "Aplicação", "Identidade", "Dados", "Monitoramento", "Continuidade"]} />
        </div>
      </Modal>

      <Modal aberto={modalCredencial} onFechar={() => setModalCredencial(false)} titulo="Nova Credencial Institucional"
        rodape={<><button className="btn btn-outline" onClick={() => setModalCredencial(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => {
            if (!novaCred.nome.trim() || !novaCred.segredo) { toast("Preencha nome e segredo", "vermelho"); return; }
            criarCredencial({ nome: novaCred.nome, categoria: novaCred.categoria, alvo: novaCred.alvo || "—", usuarioConta: novaCred.usuarioConta || "admin", responsavelId: novaCred.responsavelId, obs: undefined }, novaCred.segredo);
            toast("Credencial armazenada", "verde", "Segredo cifrado em repouso — valor descartado da memória do formulário.");
            setModalCredencial(false); setNovaCred({ nome: "", categoria: "Equipamento de rede", alvo: "", usuarioConta: "", segredo: "", responsavelId: "u4" });
          }}><Icon name="cadeado" size={15} /> Armazenar cifrado</button></>}>
        <div className="space-y-4">
          <Campo rotulo="Nome" obrigatorio><input className="input" value={novaCred.nome} onChange={(e) => setNovaCred({ ...novaCred, nome: e.target.value })} placeholder="ex.: Administração — Switch do Paço" /></Campo>
          <div className="grid grid-cols-2 gap-4">
            <Seletor rotulo="Categoria" valor={novaCred.categoria} onChange={(v) => setNovaCred({ ...novaCred, categoria: v })} opcoes={["Equipamento de rede", "Servidor", "Banco de dados", "Conta de serviço", "Chave de API", "Aplicação"]} />
            <Seletor rotulo="Responsável" valor={novaCred.responsavelId} onChange={(v) => setNovaCred({ ...novaCred, responsavelId: v })} opcoes={usuarios.map((u) => ({ valor: u.id, rotulo: u.nome }))} />
          </div>
          <Campo rotulo="Alvo (equipamento/sistema)"><input className="input" value={novaCred.alvo} onChange={(e) => setNovaCred({ ...novaCred, alvo: e.target.value })} placeholder="ex.: CORE-SW-01 (10.0.2.1)" /></Campo>
          <Campo rotulo="Conta"><input className="input" value={novaCred.usuarioConta} onChange={(e) => setNovaCred({ ...novaCred, usuarioConta: e.target.value })} /></Campo>
          <Campo rotulo="Segredo" obrigatorio><input className="input tabular-nums" type="password" value={novaCred.segredo} onChange={(e) => setNovaCred({ ...novaCred, segredo: e.target.value })} placeholder="Nunca é exibido ou registrado em auditoria" /></Campo>
        </div>
      </Modal>

      <Modal aberto={!!modalRevisao} onFechar={() => setModalRevisao(null)} titulo="Revisão de Regra de Firewall"
        rodape={<><button className="btn btn-outline" onClick={() => setModalRevisao(null)}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => {
            if (!modalRevisao) return;
            decidirRevisaoRegra(modalRevisao, "Manter", justRevisao || "Sem ressalvas.");
            toast("Decisão registrada", "verde", "Revisão documentada com autor e data.");
            setModalRevisao(null);
          }}><Icon name="check" size={15} /> Confirmar</button></>}>
        <div className="space-y-3">
          <div className="flex gap-1.5 flex-wrap">
            {(["Manter", "Alterar", "Desativar", "Excluir", "Revisar posteriormente"] as const).map((d) => (
              <button key={d} className={`tab-btn`} data-d={d} onClick={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                decidirRevisaoRegra(modalRevisao!, d as never, justRevisao || `Decisão: ${d}`);
                toast("Decisão registrada", d === "Excluir" || d === "Desativar" ? "ambar" : "verde", `${btn.dataset.d}`);
                setModalRevisao(null);
              }}>{d}</button>
            ))}
          </div>
          <Campo rotulo="Justificativa"><textarea className="textarea" rows={3} value={justRevisao} onChange={(e) => setJustRevisao(e.target.value)} /></Campo>
        </div>
      </Modal>

      <Modal aberto={modalRisco} onFechar={() => setModalRisco(false)} titulo="Novo Risco de Segurança"
        rodape={<><button className="btn btn-outline" onClick={() => setModalRisco(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => {
            if (!novoRisco.titulo.trim()) { toast("Informe o título", "vermelho"); return; }
            criarRisco({ titulo: novoRisco.titulo, descricao: novoRisco.descricao || "—", categoria: "Segurança", probabilidade: novoRisco.probabilidade, impacto: novoRisco.impacto, tendencia: "Estável", nivel: novoRisco.probabilidade * novoRisco.impacto >= 15 ? "Crítico" : novoRisco.probabilidade * novoRisco.impacto >= 8 ? "Monitorando" : "Mitigado", mitigacao: "Plano de mitigação a definir.", responsavelId: atual.id, projetoId: null });
            toast("Risco registrado", "verde", novoRisco.titulo);
            setModalRisco(false); setNovoRisco({ titulo: "", descricao: "", probabilidade: 3, impacto: 4 });
          }}><Icon name="check" size={15} /> Registrar</button></>}>
        <div className="space-y-4">
          <Campo rotulo="Título" obrigatorio><input className="input" value={novoRisco.titulo} onChange={(e) => setNovoRisco({ ...novoRisco, titulo: e.target.value })} placeholder="ex.: Ausência de MFA no acesso remoto" /></Campo>
          <Campo rotulo="Descrição"><textarea className="textarea" rows={2} value={novoRisco.descricao} onChange={(e) => setNovoRisco({ ...novoRisco, descricao: e.target.value })} /></Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo={`Probabilidade: ${novoRisco.probabilidade}`}><input type="range" min={1} max={5} value={novoRisco.probabilidade} onChange={(e) => setNovoRisco({ ...novoRisco, probabilidade: Number(e.target.value) })} className="w-full" style={{ accentColor: "var(--green)" }} /></Campo>
            <Campo rotulo={`Impacto: ${novoRisco.impacto}`}><input type="range" min={1} max={5} value={novoRisco.impacto} onChange={(e) => setNovoRisco({ ...novoRisco, impacto: Number(e.target.value) })} className="w-full" style={{ accentColor: "var(--red)" }} /></Campo>
          </div>
        </div>
      </Modal>
    </div>
  );

  function perfilLabel() { return app.perfilSimulado; }
}

function dtLocal(): { [k in "data"]: string } {
  return { ["data"]: new Date().toISOString() };
}

function SecaoCamadas() {
  const { camadas, controles, adicionarCamada, toggleCamada } = useApp();
  const toast = useToast();
  const [aberto, setAberto] = useState(false);
  const [nova, setNova] = useState({ nome: "", tipo: "Rede" });
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="ovl">Camadas registradas — {fmtNum(camadas.length)}</div>
        <button className="btn btn-outline !py-1.5 text-[12px]" onClick={() => setAberto(true)}><Icon name="mais" size={14} /> Nova Camada</button>
      </div>
      <div className="space-y-2">
        {[...camadas].sort((a, b) => a.ordem - b.ordem).map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-lg px-3.5 py-2.5" style={{ background: "rgba(19,37,29,0.035)", opacity: c.status === "Inativa" ? 0.55 : 1 }}>
            <span className="w-7 h-7 rounded flex items-center justify-center text-[10.5px] font-extrabold flex-none" style={{ background: "var(--deep)", color: "#f2b70a" }}>{c.codigo}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold">{c.nome}</div>
              <div className="text-[10.5px] truncate" style={{ color: "var(--muted)" }}>{c.descricao}</div>
            </div>
            <span className="text-[10.5px] tabular-nums flex-none" style={{ color: "var(--muted)" }}>{fmtNum(controles.filter((ct) => ct.camadaId === c.id).length)} controles</span>
            <Chip tom={c.status === "Ativa" ? "verde" : c.status === "Em implantação" ? "ciano" : "cinza"} dot={false}>{c.status}</Chip>
            <button className="icon-btn !w-7 !h-7" title={c.status === "Ativa" ? "Desativar" : "Ativar"} onClick={() => { toggleCamada(c.id); toast("Camada atualizada", "verde", `${c.nome}: ${c.status === "Ativa" ? "Inativa" : "Ativa"}`); }}>
              <Icon name={c.status === "Ativa" ? "fechar" : "check"} size={13} />
            </button>
          </div>
        ))}
      </div>
      <Modal aberto={aberto} onFechar={() => setAberto(false)} titulo="Nova Camada de Segurança"
        rodape={<><button className="btn btn-outline" onClick={() => setAberto(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => {
            if (!nova.nome.trim()) { toast("Informe o nome", "vermelho"); return; }
            adicionarCamada(nova.nome.trim(), nova.tipo);
            toast("Camada criada", "verde", nova.nome);
            setAberto(false); setNova({ nome: "", tipo: "Rede" });
          }}><Icon name="check" size={15} /> Criar</button></>}>
        <div className="space-y-4">
          <Campo rotulo="Nome" obrigatorio><input className="input" value={nova.nome} onChange={(e) => setNova({ ...nova, nome: e.target.value })} placeholder="ex.: Dispositivos IoT" /></Campo>
          <Seletor rotulo="Tipo" valor={nova.tipo} onChange={(v) => setNova({ ...nova, tipo: v })} opcoes={["Física", "Perímetro", "Rede", "Lógica", "Servidores", "Endpoint", "Aplicação", "Identidade", "Dados", "Monitoramento", "Continuidade"]} />
        </div>
      </Modal>
    </div>
  );
}
