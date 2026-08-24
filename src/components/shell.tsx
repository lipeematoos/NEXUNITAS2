import { ReactNode, useEffect, useRef, useState } from "react";
import { M } from "../i18n";
import { useApp } from "../lib/store";
import { fmtData, fmtDataLonga, tempoRel } from "../lib/format";
import { Avatar, Brasao, Chip, Icon } from "./ui";

export type ViewKey =
  | "painel" | "minha-area" | "projetos" | "tarefas" | "demandas" | "fluxos" | "equipes" | "organograma"
  | "calendario" | "documentos" | "indicadores" | "riscos" | "relatorios" | "administracao" | "configuracoes";

const NAV: { grupo: string; itens: { chave: ViewKey; icone: string }[] }[] = [
  { grupo: M.grupos.principal, itens: [ { chave: "painel", icone: "painel" }, { chave: "minha-area", icone: "area" } ] },
  { grupo: M.grupos.gestao, itens: [ { chave: "projetos", icone: "projetos" }, { chave: "tarefas", icone: "tarefas" }, { chave: "demandas", icone: "demandas" }, { chave: "fluxos", icone: "fluxos" } ] },
  { grupo: M.grupos.estrutura, itens: [ { chave: "equipes", icone: "equipes" }, { chave: "organograma", icone: "organograma" }, { chave: "calendario", icone: "calendario" }, { chave: "documentos", icone: "documentos" } ] },
  { grupo: M.grupos.monitoramento, itens: [ { chave: "indicadores", icone: "indicadores" }, { chave: "riscos", icone: "riscos" }, { chave: "relatorios", icone: "relatorios" } ] },
  { grupo: M.grupos.sistema, itens: [ { chave: "administracao", icone: "administracao" }, { chave: "configuracoes", icone: "configuracoes" } ] },
];

const TITULOS: Record<ViewKey, string> = {
  "painel": M.nav.painel, "minha-area": M.nav.minhaArea, "projetos": M.nav.projetos, "tarefas": M.nav.tarefas,
  "demandas": M.nav.demandas, "fluxos": M.nav.fluxos, "equipes": M.nav.equipes, "organograma": M.nav.organograma,
  "calendario": M.nav.calendario, "documentos": M.nav.documentos, "indicadores": M.nav.indicadores,
  "riscos": M.nav.riscos, "relatorios": M.nav.relatorios, "administracao": M.nav.administracao, "configuracoes": M.nav.configuracoes,
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

function BuscaGlobal({ irPara }: { irPara: (v: ViewKey) => void }) {
  const { projetos, tarefas, demandas } = useApp();
  const [q, setQ] = useState("");
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useForaClique(ref, () => setAberto(false));

  const ql = q.trim().toLowerCase();
  const resultados = ql.length >= 2 ? [
    ...projetos.filter((p) => p.nome.toLowerCase().includes(ql)).slice(0, 4).map((p) => ({ icone: "projetos", tipo: "Projeto", texto: p.nome, destino: "projetos" as ViewKey })),
    ...tarefas.filter((t) => t.titulo.toLowerCase().includes(ql)).slice(0, 4).map((t) => ({ icone: "tarefas", tipo: "Tarefa", texto: t.titulo, destino: "tarefas" as ViewKey })),
    ...demandas.filter((d) => `${d.protocolo} ${d.tipo}`.toLowerCase().includes(ql)).slice(0, 4).map((d) => ({ icone: "demandas", tipo: "Demanda", texto: `${d.protocolo} — ${d.tipo}`, destino: "demandas" as ViewKey })),
  ] : [];

  return (
    <div ref={ref} className="relative hidden md:block w-[340px]">
      <Icon name="busca" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        className="input pl-9 pr-10" placeholder="Pesquisar projetos, tarefas, demandas…" value={q}
        onChange={(e) => { setQ(e.target.value); setAberto(true); }}
        onFocus={() => setAberto(true)}
        aria-label="Pesquisa global"
      />
      <span className="kbd absolute right-2.5 top-1/2 -translate-y-1/2">/</span>
      {aberto && ql.length >= 2 && (
        <div className="card absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden anim-pop" style={{ boxShadow: "var(--shadow-2)" }}>
          {resultados.length === 0 && <div className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>Nenhum resultado para “{q}”.</div>}
          {resultados.map((r, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer bg-transparent border-0 hover:bg-[rgba(30,122,84,0.07)] transition-colors"
              onClick={() => { irPara(r.destino); setQ(""); setAberto(false); }}
            >
              <span style={{ color: "var(--green)" }}><Icon name={r.icone} size={16} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold truncate">{r.texto}</span>
                <span className="block text-[11px]" style={{ color: "var(--muted)" }}>{r.tipo}</span>
              </span>
              <Icon name="seta-d" size={14} className="opacity-40" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Sino({ irPara }: { irPara: (v: ViewKey) => void }) {
  const { notificacoes, marcarNotificacoesLidas } = useApp();
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useForaClique(ref, () => setAberto(false));
  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <div ref={ref} className="relative">
      <button className="icon-btn relative" onClick={() => setAberto(!aberto)} aria-label="Notificações">
        <Icon name="sino" size={19} />
        {naoLidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: "var(--red)" }}>
            {naoLidas}
          </span>
        )}
      </button>
      {aberto && (
        <div className="card absolute right-0 top-[calc(100%+8px)] w-[360px] max-w-[calc(100vw-2rem)] z-50 overflow-hidden anim-pop" style={{ boxShadow: "var(--shadow-2)" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
            <span className="font-display font-bold text-[14px]">Notificações</span>
            <button className="text-xs font-semibold cursor-pointer bg-transparent border-0" style={{ color: "var(--green)" }} onClick={marcarNotificacoesLidas}>
              Marcar todas como lidas
            </button>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
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
  const { atual, unidades, tarefas, demandas } = useApp();
  const [menuAberto, setMenuAberto] = useState(false);
  const [userAberto, setUserAberto] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  useForaClique(userRef, () => setUserAberto(false));
  const agora = useRelogio();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement) && !(e.target instanceof HTMLSelectElement)) {
        e.preventDefault();
        (document.querySelector('input[aria-label="Pesquisa global"]') as HTMLInputElement | null)?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const pendenciasHoje = tarefas.filter((t) => t.status !== "Concluído").length;
  const novasDemandas = demandas.filter((d) => d.status === "Nova" || d.status === "Em Análise").length;
  const lotacao = unidades.find((u) => u.id === atual.unidadeId);

  return (
    <div className="min-h-screen bg-ambient noise">
      {/* ===== Sidebar ===== */}
      {menuAberto && <div className="fixed inset-0 z-[55] lg:hidden anim-fade" style={{ background: "rgba(11,42,32,0.5)" }} onClick={() => setMenuAberto(false)} />}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-[60] w-[248px] flex flex-col transition-transform duration-300 lg:translate-x-0 ${menuAberto ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "linear-gradient(178deg, var(--deep-2) 0%, var(--deep) 55%)", borderRight: "1px solid rgba(242,183,10,0.18)" }}
      >
        <div className="hazard h-[5px] flex-none" />
        <div className="flex items-center gap-3 px-4 pt-5 pb-4 flex-none">
          <Brasao size={38} />
          <div className="min-w-0">
            <div className="font-display font-extrabold text-[19px] leading-none text-[#f4f7f2] tracking-tight">SIGA</div>
            <div className="text-[10px] mt-1 leading-tight" style={{ color: "rgba(244,247,242,0.55)" }}>Gestão e Acompanhamento</div>
          </div>
          <button className="icon-btn ml-auto lg:hidden" style={{ color: "#f4f7f2" }} onClick={() => setMenuAberto(false)} aria-label="Fechar menu">
            <Icon name="fechar" />
          </button>
        </div>
        <div className="px-4 pb-3 flex-none">
          <div className="rounded-lg px-3 py-2 text-[10.5px] leading-snug" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(244,247,242,0.7)" }}>
            {M.sistema.orgao}
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Navegação principal">
          {NAV.map((g) => (
            <div key={g.grupo} className="mt-3">
              <div className="px-2 text-[10px] font-bold tracking-[0.16em] uppercase mb-1.5" style={{ color: "rgba(242,183,10,0.65)" }}>{g.grupo}</div>
              {g.itens.map((item) => {
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
                    {item.chave === "demandas" && novasDemandas > 0 && (
                      <span className="ml-auto text-[10px] font-bold rounded-full px-1.5 py-0.5" style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>{novasDemandas}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
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
            {M.sistema.nome} · {M.sistema.versao}
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
            <div className="text-[10.5px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--muted)" }}>{M.sistema.orgaoCurto}</div>
            <h1 className="font-display font-extrabold text-[17px] leading-tight m-0 tracking-tight">{TITULOS[view]}</h1>
          </div>
          <div className="flex-1" />
          <BuscaGlobal irPara={irPara} />
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
              <div className="card absolute right-0 top-[calc(100%+8px)] w-[230px] z-50 overflow-hidden anim-pop" style={{ boxShadow: "var(--shadow-2)" }}>
                <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
                  <div className="text-[13px] font-bold">{atual.nome}</div>
                  <div className="text-[11px]" style={{ color: "var(--muted)" }}>{atual.cargo}</div>
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

        <main className="flex-1 px-4 sm:px-6 py-5 max-w-[1460px] w-full mx-auto">{children}</main>

        <footer className="px-6 py-4 text-[11px] flex flex-wrap items-center gap-x-4 gap-y-1 flex-none" style={{ color: "var(--muted)", borderTop: "1px solid var(--line)" }}>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--green)" }} /> Sistema operacional — ambiente de produção</span>
          <span>{M.sistema.orgao} · {M.sistema.versao}</span>
          <span className="ml-auto">{pendenciasHoje} tarefas em aberto · fuso America/Sao_Paulo</span>
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
      {acoes && <div className="flex items-center gap-2">{acoes}</div>}
    </div>
  );
}

export function KpiFaixa({ itens }: { itens: { rotulo: string; valor: ReactNode; extra?: ReactNode; cor?: string }[] }) {
  return (
    <div className="card grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 overflow-hidden">
      {itens.map((k, i) => (
        <div key={i} className="px-5 py-4" style={{ borderLeft: i > 0 ? "1px solid var(--line)" : undefined, borderTop: i >= 3 ? "1px solid var(--line)" : undefined }}>
          <div className="ovl mb-2" style={{ fontSize: 10 }}>{k.rotulo}</div>
          <div className="font-display font-extrabold text-[26px] leading-none tracking-tight" style={{ color: k.cor ?? "var(--ink)" }}>{k.valor}</div>
          {k.extra && <div className="mt-1.5 text-[11px]" style={{ color: "var(--muted)" }}>{k.extra}</div>}
        </div>
      ))}
    </div>
  );
}

export { Chip };
