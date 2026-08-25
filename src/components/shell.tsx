import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { M } from "../i18n";
import { PERFIS_RBAC } from "../lib/data";
import { useApp } from "../lib/store";
import { fmtData, fmtDataLonga, tempoRel } from "../lib/format";
import { Avatar, Brasao, Chip, Icon } from "./ui";

export type ViewKey =
  | "painel" | "minha-area" | "comunicacao" | "central-ti" | "patrimonio" | "seguranca" | "projetos" | "tarefas"
  | "demandas" | "fluxos" | "equipes" | "organograma" | "calendario" | "documentos" | "monitoramento"
  | "indicadores" | "riscos" | "relatorios" | "aprovacoes" | "administracao" | "configuracoes";

const NAV: { grupo: string; itens: { chave: ViewKey; icone: string }[] }[] = [
  { grupo: M.grupos.principal, itens: [{ chave: "painel", icone: "painel" }, { chave: "minha-area", icone: "area" }, { chave: "comunicacao", icone: "chat" }] },
  { grupo: "Serviços de TI", itens: [{ chave: "central-ti", icone: "fone" }, { chave: "patrimonio", icone: "caixa" }, { chave: "seguranca", icone: "escudo" }] },
  { grupo: M.grupos.gestao, itens: [{ chave: "projetos", icone: "projetos" }, { chave: "tarefas", icone: "tarefas" }, { chave: "demandas", icone: "demandas" }, { chave: "fluxos", icone: "fluxos" }] },
  { grupo: M.grupos.estrutura, itens: [{ chave: "equipes", icone: "equipes" }, { chave: "organograma", icone: "organograma" }, { chave: "calendario", icone: "calendario" }, { chave: "documentos", icone: "documentos" }] },
  { grupo: M.grupos.monitoramento, itens: [{ chave: "monitoramento", icone: "monitor" }, { chave: "indicadores", icone: "indicadores" }, { chave: "riscos", icone: "riscos" }, { chave: "relatorios", icone: "relatorios" }] },
  { grupo: M.grupos.sistema, itens: [{ chave: "administracao", icone: "administracao" }, { chave: "configuracoes", icone: "configuracoes" }] },
];

const TITULOS: Record<ViewKey, string> = {
  "painel": M.nav.painel, "minha-area": M.nav.minhaArea, "comunicacao": M.nav.comunicacao,
  "central-ti": M.nav.centralTI, "patrimonio": M.nav.patrimonio, "seguranca": "Segurança da Informação",
  "monitoramento": "Monitoramento", "projetos": M.nav.projetos,
  "tarefas": M.nav.tarefas, "demandas": M.nav.demandas, "fluxos": M.nav.fluxos, "equipes": M.nav.equipes,
  "organograma": M.nav.organograma, "calendario": M.nav.calendario, "documentos": M.nav.documentos,
  "indicadores": M.nav.indicadores, "riscos": M.nav.riscos, "relatorios": M.nav.relatorios,
  "aprovacoes": M.nav.aprovacoes, "administracao": M.nav.administracao, "configuracoes": M.nav.configuracoes,
};

function useForaClique(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

function useRelogio() {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return agora;
}

interface ResultadoBusca { icone: string; tipo: string; texto: string; detalhe: string; destino: ViewKey; }

function PaletaBusca({ aberto, onFechar, irPara }: { aberto: boolean; onFechar: () => void; irPara: (v: ViewKey) => void }) {
  const { projetos, tarefas, demandas, chamados, ativos, usuarios, unidades, canais } = useApp();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (aberto) { setQ(""); setTimeout(() => inputRef.current?.focus(), 30); } }, [aberto]);

  const resultados = useMemo<ResultadoBusca[]>(() => {
    const ql = q.trim().toLowerCase();
    if (ql.length < 2) return [];
    const unidade = (id: string) => unidades.find((u) => u.id === id)?.sigla ?? "";
    return [
      ...usuarios.filter((u) => `${u.nome} ${u.matricula}`.toLowerCase().includes(ql)).slice(0, 3)
        .map((u) => ({ icone: "usuario", tipo: "Servidor", texto: u.nome, detalhe: `Matrícula ${u.matricula} · ${unidade(u.unidadeId)}`, destino: "organograma" as ViewKey })),
      ...chamados.filter((c) => `${c.numero} ${c.titulo}`.toLowerCase().includes(ql)).slice(0, 4)
        .map((c) => ({ icone: "fone", tipo: "Chamado", texto: `${c.numero} — ${c.titulo}`, detalhe: c.status, destino: "central-ti" as ViewKey })),
      ...ativos.filter((a) => `${a.patrimonio} ${a.serie} ${a.modelo} ${a.rede?.hostname ?? ""} ${a.rede?.ipv4 ?? ""} ${a.rede?.mac ?? ""} ${usuarios.find((u) => u.id === a.responsavelId)?.nome ?? ""}`.toLowerCase().includes(ql)).slice(0, 4)
        .map((a) => ({ icone: "caixa", tipo: "Patrimônio", texto: `${a.patrimonio} — ${a.fabricante} ${a.modelo}`, detalhe: `${a.categoria} · ${a.rede?.hostname ?? a.sala} ${a.rede?.ipv4 ? "· " + a.rede.ipv4 : ""}`, destino: "patrimonio" as ViewKey })),
      ...projetos.filter((p) => p.nome.toLowerCase().includes(ql)).slice(0, 3)
        .map((p) => ({ icone: "projetos", tipo: "Projeto", texto: p.nome, detalhe: p.codigo, destino: "projetos" as ViewKey })),
      ...tarefas.filter((t) => t.titulo.toLowerCase().includes(ql)).slice(0, 3)
        .map((t) => ({ icone: "tarefas", tipo: "Tarefa", texto: t.titulo, detalhe: t.status, destino: "tarefas" as ViewKey })),
      ...demandas.filter((d) => `${d.protocolo} ${d.tipo}`.toLowerCase().includes(ql)).slice(0, 3)
        .map((d) => ({ icone: "demandas", tipo: "Demanda", texto: `${d.protocolo} — ${d.tipo}`, detalhe: d.status, destino: "demandas" as ViewKey })),
      ...canais.filter((c) => !c.direto && c.nome.includes(ql)).slice(0, 3)
        .map((c) => ({ icone: "chat", tipo: "Canal", texto: `#${c.nome}`, detalhe: c.descricao, destino: "comunicacao" as ViewKey })),
    ].slice(0, 12);
  }, [q, usuarios, chamados, ativos, projetos, tarefas, demandas, canais, unidades]);

  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-[12vh] px-4 anim-fade" style={{ background: "rgba(11,42,32,0.55)" }} onMouseDown={onFechar}>
      <div className="card w-full max-w-[620px] overflow-hidden anim-pop" style={{ boxShadow: "var(--shadow-2)" }} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-label="Pesquisa global">
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid var(--line)" }}>
          <Icon name="busca" size={18} className="opacity-60" />
          <input
            ref={inputRef} className="flex-1 bg-transparent border-0 outline-none text-[14px] font-medium"
            placeholder="Pesquisar servidores, chamados, patrimônios, IPs, hostnames, projetos…"
            value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onFechar();
              if (e.key === "Enter" && resultados[0]) { irPara(resultados[0].destino); onFechar(); }
            }}
            style={{ color: "var(--ink)" }}
            aria-label="Pesquisar"
          />
          <span className="kbd">ESC</span>
        </div>
        <div className="max-h-[46vh] overflow-y-auto py-1.5">
          {q.trim().length < 2 && (
            <div className="px-5 py-4 text-[12px] leading-relaxed" style={{ color: "var(--muted)" }}>
              Digite ao menos 2 caracteres. A pesquisa cobre <strong>servidores e matrículas</strong>, <strong>chamados</strong>,
              <strong> patrimônios por número, série, hostname, IP ou MAC</strong>, <strong>projetos, tarefas, demandas</strong> e <strong>canais</strong>.
            </div>
          )}
          {q.trim().length >= 2 && resultados.length === 0 && (
            <div className="px-5 py-6 text-center text-[13px]" style={{ color: "var(--muted)" }}>Nenhum resultado para “{q}”.</div>
          )}
          {resultados.map((r, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer bg-transparent border-0 hover:bg-[rgba(30,122,84,0.08)] transition-colors"
              onClick={() => { irPara(r.destino); onFechar(); }}
            >
              <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-none" style={{ background: "var(--green-soft)", color: "var(--green)" }}>
                <Icon name={r.icone} size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold truncate">{r.texto}</span>
                <span className="block text-[11px] truncate" style={{ color: "var(--muted)" }}>{r.detalhe}</span>
              </span>
              <span className="chip" style={{ background: "var(--grey-soft)", color: "var(--grey)" }}>{r.tipo}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sino({ irPara }: { irPara: (v: ViewKey) => void }) {
  const { notificacoes, marcarNotificacoesLidas, chamados, atual } = useApp();
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useForaClique(ref, () => setAberto(false));

  const pendenciasAprovacao = chamados.filter((c) => c.status === "Aguardando Aprovação" &&
    c.aprovacoes.some((a) => a.status === "Pendente" && a.aprovadorNome === atual.nome));
  const naoLidas = notificacoes.filter((n) => !n.lida).length;
  const total = naoLidas + pendenciasAprovacao.length;

  return (
    <div ref={ref} className="relative">
      <button className="icon-btn relative" onClick={() => setAberto(!aberto)} aria-label="Notificações">
        <Icon name="sino" size={19} />
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: "var(--red)" }}>
            {total}
          </span>
        )}
      </button>
      {aberto && (
        <div className="card absolute right-0 top-[calc(100%+8px)] w-[380px] max-w-[calc(100vw-2rem)] z-50 overflow-hidden anim-pop" style={{ boxShadow: "var(--shadow-2)" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
            <span className="font-display font-bold text-[14px]">Notificações</span>
            <button className="text-xs font-semibold cursor-pointer bg-transparent border-0" style={{ color: "var(--green)" }} onClick={marcarNotificacoesLidas}>
              Marcar todas como lidas
            </button>
          </div>
          <div className="max-h-[340px] overflow-y-auto">
            {pendenciasAprovacao.map((c) => (
              <button
                key={c.id} className="w-full flex gap-3 px-4 py-3 text-left bg-transparent border-0 cursor-pointer"
                style={{ borderBottom: "1px solid var(--line)", background: "rgba(242,183,10,0.08)" }}
                onClick={() => { irPara("aprovacoes"); setAberto(false); }}
              >
                <span className="mt-0.5" style={{ color: "var(--accent-2)" }}><Icon name="carimbo" size={17} /></span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold">Aprovação pendente — {c.numero}</span>
                  <span className="block text-xs mt-0.5" style={{ color: "var(--muted)" }}>{c.titulo}</span>
                </span>
              </button>
            ))}
            {notificacoes.map((n) => (
              <div key={n.id} className="flex gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--line)", background: n.lida ? "transparent" : "rgba(242,183,10,0.06)" }}>
                <span className="mt-1 w-2 h-2 rounded-full flex-none" style={{ background: n.lida ? "var(--line-2)" : "var(--accent)" }} />
                <div className="min-w-0">
                  <div className="text-[13px] font-bold">{n.titulo}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{n.detalhe}</div>
                  <div className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>{tempoRel(n.data)}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="w-full py-2.5 text-[12.5px] font-bold cursor-pointer bg-transparent border-0 hover:bg-[rgba(30,122,84,0.06)]"
            style={{ color: "var(--green)", borderTop: "1px solid var(--line)" }}
            onClick={() => { irPara("minha-area"); setAberto(false); }}
          >
            Ver todas na Minha Área
          </button>
        </div>
      )}
    </div>
  );
}

export function Shell({ view, irPara, onLogout, children }: {
  view: ViewKey; irPara: (v: ViewKey) => void; onLogout: () => void; children: ReactNode;
}) {
  const { atual, unidades, tarefas, config, perfilSimulado, setPerfilSimulado, temPermissaoMenu, ativos, modoRestrito } = useApp();
  const [menuAberto, setMenuAberto] = useState(false);
  const [userAberto, setUserAberto] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  useForaClique(userRef, () => setUserAberto(false));
  const agora = useRelogio();

  // Identidade visual configurável (marca definida pelo administrador)
  useEffect(() => {
    const raiz = document.documentElement;
    raiz.style.setProperty("--deep", config.marca.corPrimaria);
    raiz.style.setProperty("--accent", config.marca.corAcento);
    return () => {
      raiz.style.removeProperty("--deep");
      raiz.style.removeProperty("--accent");
    };
  }, [config.marca]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      const digitando = alvo instanceof HTMLInputElement || alvo instanceof HTMLTextAreaElement || alvo instanceof HTMLSelectElement;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setBuscaAberta((a) => !a);
      }
      if (e.key === "/" && !digitando) {
        e.preventDefault();
        setBuscaAberta(true);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const emAberto = tarefas.filter((t) => t.status !== "Concluído").length;
  const patrimonioEmUso = ativos.filter((a) => ["Em Uso", "Emprestado"].includes(a.status)).length;
  const lotacao = unidades.find((u) => u.id === atual.unidadeId);
  const nomeProduto = config.marca.produto || M.sistema.sigla;

  return (
    <div className="min-h-screen bg-ambient noise">
      <PaletaBusca aberto={buscaAberta} onFechar={() => setBuscaAberta(false)} irPara={irPara} />

      {/* ===== Sidebar ===== */}
      {menuAberto && <div className="fixed inset-0 z-[55] lg:hidden anim-fade" style={{ background: "rgba(11,42,32,0.5)" }} onClick={() => setMenuAberto(false)} />}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-[60] w-[248px] flex flex-col transition-transform duration-300 lg:translate-x-0 ${menuAberto ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "linear-gradient(178deg, var(--deep) 0%, var(--deep) 55%)", borderRight: "1px solid rgba(242,183,10,0.18)" }}
      >
        <div className="hazard h-[5px] flex-none" style={{ background: `repeating-linear-gradient(-45deg, var(--accent) 0 10px, var(--deep) 10px 20px)` }} />
        <div className="flex items-center gap-3 px-4 pt-5 pb-4 flex-none">
          {config.identidade.brasaoDataUrl && config.identidade.usoBrasao.includes("menu")
            ? <img src={config.identidade.brasaoDataUrl} alt="Brasão" style={{ width: 40, height: 44, objectFit: "contain", background: "#fff", borderRadius: 6, padding: 2 }} />
            : <Brasao size={38} />}
          <div className="min-w-0">
            <div className="font-display font-extrabold text-[19px] leading-none text-[#f4f7f2] tracking-tight">{nomeProduto}</div>
            <div className="text-[10px] mt-1 leading-tight" style={{ color: "rgba(244,247,242,0.55)" }}>{config.marca.subtitulo}</div>
          </div>
          <button className="icon-btn ml-auto lg:hidden" style={{ color: "#f4f7f2" }} onClick={() => setMenuAberto(false)} aria-label="Fechar menu">
            <Icon name="fechar" />
          </button>
        </div>
        <div className="px-4 pb-3 flex-none">
          <div className="rounded-lg px-3 py-2 text-[10.5px] leading-snug" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(244,247,242,0.7)" }}>
            {config.orgao.nome}
            <span className="flex items-center gap-1 mt-1" style={{ color: "rgba(242,183,10,0.85)" }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-live" style={{ background: "var(--accent)" }} /> Intranet — operação local
            </span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Navegação principal">
          {NAV.map((g) => {
            const visiveis = g.itens.filter((i) => temPermissaoMenu(i.chave));
            if (visiveis.length === 0) return null;
            return (
              <div key={g.grupo} className="mt-3">
                <div className="px-2 text-[10px] font-bold tracking-[0.16em] uppercase mb-1.5" style={{ color: "rgba(242,183,10,0.65)" }}>{g.grupo}</div>
                {visiveis.map((item) => {
                  const ativo = view === item.chave;
                  return (
                    <button
                      key={item.chave}
                      onClick={() => { irPara(item.chave); setMenuAberto(false); }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-[7.5px] rounded-md text-left text-[13px] font-semibold cursor-pointer border-0 mb-[2px] transition-all duration-150 ${ativo ? "" : "bg-transparent hover:bg-[rgba(255,255,255,0.07)]"}`}
                      style={ativo ? { background: "rgba(242,183,10,0.14)", color: "#f4f7f2", boxShadow: "inset 3px 0 0 var(--accent)" } : { color: "rgba(244,247,242,0.72)" }}
                    >
                      <Icon name={item.icone} size={17} className={ativo ? "text-[#f2b70a]" : ""} />
                      {TITULOS[item.chave]}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="flex-none px-3 pb-4">
          <div className="rounded-lg p-3 flex items-center gap-2.5" style={{ background: "rgba(255,255,255,0.06)" }}>
            <Avatar nome={atual.nome} size={34} />
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-bold text-[#f4f7f2] truncate">{atual.nome}</div>
              <div className="text-[10.5px] truncate" style={{ color: "rgba(244,247,242,0.55)" }}>{lotacao?.sigla} · {atual.matricula}</div>
            </div>
            <button className="icon-btn" style={{ color: "rgba(244,247,242,0.7)" }} onClick={onLogout} title="Sair do sistema" aria-label="Sair">
              <Icon name="sair" size={17} />
            </button>
          </div>
          <div className="text-center text-[10px] mt-2.5" style={{ color: "rgba(244,247,242,0.35)" }}>
            {nomeProduto} · ambiente intranet · v2.4.1
          </div>
        </div>
      </aside>

      {/* ===== Conteúdo ===== */}
      <div className="lg:pl-[248px] flex flex-col min-h-screen">
        <header
          className="sticky top-0 z-40 flex items-center gap-3 px-4 sm:px-6 h-[60px] flex-none"
          style={{ background: "rgba(251,252,249,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--line)" }}
        >
          <button className="icon-btn lg:hidden" onClick={() => setMenuAberto(true)} aria-label="Abrir menu"><Icon name="menu" size={20} /></button>
          <div className="min-w-0">
            <div className="text-[10.5px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--muted)" }}>{config.orgao.municipio} · {config.orgao.uf}</div>
            <h1 className="font-display font-extrabold text-[17px] leading-tight m-0 tracking-tight">{TITULOS[view]}</h1>
          </div>
          <div className="flex-1" />
          <button
            className="hidden md:flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-medium cursor-pointer border transition-colors"
            style={{ background: "#fff", borderColor: "var(--line-2)", color: "var(--muted)" }}
            onClick={() => setBuscaAberta(true)}
          >
            <Icon name="busca" size={15} /> Pesquisar em todo o sistema… <span className="kbd ml-4">Ctrl K</span>
          </button>
          <div className="hidden xl:block text-right flex-none">
            <div className="font-display font-bold text-[13px] leading-tight tabular-nums">
              {fmtData(agora)} · {agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{fmtDataLonga(agora)}</div>
          </div>
          <Sino irPara={irPara} />
          <div ref={userRef} className="relative flex-none">
            <button
              className="flex items-center gap-2 cursor-pointer bg-transparent border-0 rounded-lg pl-1 pr-2 py-1 hover:bg-[rgba(19,37,29,0.05)] transition-colors"
              onClick={() => setUserAberto(!userAberto)}
              aria-label="Menu do usuário"
            >
              <Avatar nome={atual.nome} size={30} />
              <Icon name="chevron-b" size={14} className="opacity-50" />
            </button>
            {userAberto && (
              <div className="card absolute right-0 top-[calc(100%+8px)] w-[270px] z-50 overflow-hidden anim-pop" style={{ boxShadow: "var(--shadow-2)" }}>
                <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
                  <div className="text-[13px] font-bold">{atual.nome}</div>
                  <div className="text-[11px]" style={{ color: "var(--muted)" }}>{atual.cargo}</div>
                </div>
                <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
                  <div className="label !mb-1.5">Simular perfil de acesso (demonstração de RBAC)</div>
                  <select className="select !py-1.5 text-[12px]" value={perfilSimulado} onChange={(e) => setPerfilSimulado(e.target.value)}>
                    {Object.keys(PERFIS_RBAC).map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-left bg-transparent border-0 cursor-pointer hover:bg-[rgba(30,122,84,0.07)]" onClick={() => { irPara("minha-area"); setUserAberto(false); }}>
                  <Icon name="area" size={16} /> Minha Área
                </button>
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-left bg-transparent border-0 cursor-pointer hover:bg-[rgba(30,122,84,0.07)]" onClick={() => { irPara("configuracoes"); setUserAberto(false); }}>
                  <Icon name="configuracoes" size={16} /> Configurações
                </button>
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-left bg-transparent border-0 cursor-pointer hover:bg-[rgba(179,64,42,0.08)]" style={{ color: "var(--red)", borderTop: "1px solid var(--line)" }} onClick={onLogout}>
                  <Icon name="sair" size={16} /> Sair do sistema
                </button>
              </div>
            )}
          </div>
        </header>

        {modoRestrito && (
          <div className="px-4 sm:px-6 pt-3 max-w-[1460px] w-full mx-auto">
            <div className="rounded-lg px-4 py-2.5 flex items-center gap-3 anim-pop" style={{ background: "var(--red-soft)", border: "1px solid var(--red)" }}>
              <Icon name="cadeado" size={17} className="text-[var(--red)] flex-none" />
              <span className="text-[12.5px]"><strong style={{ color: "var(--red)" }}>Sistema em modo restrito por licenciamento.</strong> <span style={{ color: "var(--muted)" }}>Consultas, relatórios, backups e exportações permanecem liberados; registros operacionais novos estão bloqueados. Nenhum dado é excluído.</span></span>
            </div>
          </div>
        )}

        <main className="flex-1 px-4 sm:px-6 py-5 max-w-[1460px] w-full mx-auto">{children}</main>

        <footer className="px-6 py-4 text-[11px] flex flex-wrap items-center gap-x-4 gap-y-1 flex-none" style={{ color: "var(--muted)", borderTop: "1px solid var(--line)" }}>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--green)" }} /> Sistema operacional — ambiente de produção</span>
          <span>{config.orgao.nome} · {nomeProduto} v2.4.1 · {config.identidade.rodape}</span>
          <span className="ml-auto">{emAberto} tarefas em aberto · {patrimonioEmUso} equipamentos em uso · fuso America/Sao_Paulo</span>
        </footer>
      </div>
    </div>
  );
}

export function CabecalhoPagina({ titulo, subtitulo, acoes }: { titulo: string; subtitulo?: string; acoes?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h2 className="font-display font-extrabold text-[26px] leading-tight m-0 tracking-tight">{titulo}</h2>
        {subtitulo && <p className="text-[13px] mt-1 m-0" style={{ color: "var(--muted)" }}>{subtitulo}</p>}
      </div>
      {acoes && <div className="flex items-center gap-2 flex-wrap">{acoes}</div>}
    </div>
  );
}

export function KpiFaixa({ itens }: { itens: { rotulo: string; valor: ReactNode; extra?: ReactNode; cor?: string }[] }) {
  const n = itens.length;
  return (
    <div
      className="card grid grid-cols-2 md:grid-cols-3 overflow-hidden"
      style={{ borderColor: "var(--line)", gridTemplateColumns: undefined }}
    >
      {itens.map((k, i) => (
        <div
          key={i} className="px-5 py-4"
          style={{
            borderColor: "var(--line)",
            borderLeft: i % 3 !== 0 ? "1px solid var(--line)" : undefined,
            borderTop: i >= 3 ? "1px solid var(--line)" : undefined,
            gridColumn: n === 5 && i >= 3 ? `span 1` : undefined,
          }}
        >
          <div className="ovl mb-2" style={{ fontSize: 10 }}>{k.rotulo}</div>
          <div className="font-display font-extrabold text-[26px] leading-none tracking-tight" style={{ color: k.cor ?? "var(--ink)" }}>{k.valor}</div>
          {k.extra && <div className="mt-1.5 text-[11px]" style={{ color: "var(--muted)" }}>{k.extra}</div>}
        </div>
      ))}
    </div>
  );
}

export { Chip };
