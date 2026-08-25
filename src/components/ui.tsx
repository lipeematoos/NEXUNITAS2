import { ReactNode, createContext, useContext, useEffect, useId, useRef, useState } from "react";
import { PRIORIDADES, STATUS_ATIVO, STATUS_CHAMADO, STATUS_DEMANDA, STATUS_PROJETO, STATUS_TAREFA, TOM_CSS, Tom } from "../lib/data";
import { fmtNum } from "../lib/format";

/* ===================== Ícones (SVG próprios) ===================== */

const ICONES: Record<string, ReactNode> = {
  painel: (<><rect x="3" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" /></>),
  area: (<><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c1.3-3.4 4.1-5 7.5-5s6.2 1.6 7.5 5" /></>),
  projetos: (<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12h18" /></>),
  tarefas: (<><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><path d="m8 12.5 2.6 2.6L16 9.5" /></>),
  demandas: (<><path d="M4 13V6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5V13" /><path d="M4 13h4l1.5 2.5h5L16 13h4v4.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5Z" /></>),
  fluxos: (<><circle cx="5.5" cy="12" r="2.5" /><circle cx="18.5" cy="5.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /><path d="M8 12h4m0 0 4-5m-4 5 4 5" /></>),
  equipes: (<><circle cx="9" cy="8.5" r="3" /><path d="M3.5 19c.9-2.9 3-4.4 5.5-4.4s4.6 1.5 5.5 4.4" /><path d="M15 5.8a3 3 0 0 1 0 5.4M17.4 14.9c1.6.6 2.7 1.9 3.1 4.1" /></>),
  calendario: (<><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /><path d="M7.5 13h2.5M14 13h2.5M7.5 16.5h2.5" /></>),
  documentos: (<><path d="M6 3.5h8l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5a1.5 1.5 0 0 1 1.5-1.5Z" /><path d="M14 3.5V8h4.5M9 12.5h6M9 16h6" /></>),
  indicadores: (<><path d="M4 19.5h16" /><path d="M5.5 19.5V11M10.2 19.5V6M15 19.5v-9M19.5 19.5V9" /></>),
  riscos: (<><path d="M12 4 2.8 19.5h18.4Z" /><path d="M12 10v4M12 16.8v.4" /></>),
  relatorios: (<><path d="M4 4v16h16" /><path d="m7 14 3.5-4 3 2.5L18 7" /></>),
  organograma: (<><rect x="9" y="3.5" width="6" height="5" rx="1" /><rect x="3" y="15.5" width="6" height="5" rx="1" /><rect x="15" y="15.5" width="6" height="5" rx="1" /><path d="M12 8.5v3.5m0 0H6v3.5m6-3.5h6v3.5" /></>),
  administracao: (<><path d="M12 3 5 5.8v5.4c0 4.6 3 7.7 7 9.3 4-1.6 7-4.7 7-9.3V5.8Z" /><path d="m9 11.5 2.2 2.2L15.5 9" /></>),
  configuracoes: (<><path d="M4 7h9M17 7h3M4 17h3M11 17h9M4 12h13" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /><circle cx="19" cy="12" r="2" /></>),
  sino: (<><path d="M6 16v-5.5a6 6 0 0 1 12 0V16l1.5 2.5h-15Z" /><path d="M10 21a2.2 2.2 0 0 0 4 0" /></>),
  busca: (<><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.4-4.4" /></>),
  mais: (<path d="M12 5v14M5 12h14" />),
  fechar: (<path d="M6 6l12 12M18 6 6 18" />),
  relogio: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>),
  "chevron-b": (<path d="m6 9.5 6 6 6-6" />),
  "chevron-d": (<path d="m9.5 6 6 6-6 6" />),
  "chevron-e": (<path d="m14.5 6-6 6 6 6" />),
  editar: (<><path d="M14.5 5.5 18.5 9.5 8 20H4v-4Z" /><path d="m12.5 7.5 4 4" /></>),
  excluir: (<><path d="M5 7h14M10 7V5h4v2M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" /><path d="M10 11v6M14 11v6" /></>),
  baixar: (<><path d="M12 4v10m0 0 4-4m-4 4-4-4" /><path d="M4.5 16.5V18a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-1.5" /></>),
  enviar: (<><path d="M12 14V4m0 0L8 8m4-4 4 4" /><path d="M4.5 16.5V18a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-1.5" /></>),
  arrastar: (<><circle cx="9" cy="6" r="1" fill="currentColor" /><circle cx="15" cy="6" r="1" fill="currentColor" /><circle cx="9" cy="12" r="1" fill="currentColor" /><circle cx="15" cy="12" r="1" fill="currentColor" /><circle cx="9" cy="18" r="1" fill="currentColor" /><circle cx="15" cy="18" r="1" fill="currentColor" /></>),
  filtro: (<path d="M4 5h16l-6.2 7.4V19l-3.6-2v-4.6Z" />),
  check: (<path d="m5 12.5 4.5 4.5L19 7.5" />),
  aviso: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V13M12 16.4v.4" /></>),
  info: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.6v.4" /></>),
  sair: (<><path d="M14 4h-7A1.5 1.5 0 0 0 5.5 5.5v13A1.5 1.5 0 0 0 7 20h7" /><path d="m16 8 4 4-4 4M20 12H9.5" /></>),
  olho: (<><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></>),
  cadeado: (<><rect x="5.5" y="10.5" width="13" height="9.5" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></>),
  usuario: (<><circle cx="12" cy="8" r="3.4" /><path d="M5 20c1.2-3.2 3.9-4.8 7-4.8s5.8 1.6 7 4.8" /></>),
  "seta-d": (<path d="M4 12h15m0 0-5-5m5 5-5 5" />),
  "tendencia-up": (<><path d="m3.5 17 5.5-5.5 3.5 3.5 7-7.5" /><path d="M14.5 7.5h5v5" /></>),
  "tendencia-down": (<><path d="m3.5 7 5.5 5.5L12.5 9l7 7.5" /><path d="M14.5 16.5h5v-5" /></>),
  banco: (<><ellipse cx="12" cy="6" rx="7.5" ry="2.8" /><path d="M4.5 6v12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6" /><path d="M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8" /></>),
  menu: (<path d="M4 6.5h16M4 12h16M4 17.5h16" />),
  engrenagem: (<><circle cx="12" cy="12" r="3.2" /><path d="M12 3.5v2.6m0 11.8v2.6M3.5 12h2.6m11.8 0h2.6M6 6l1.9 1.9M16.1 16.1 18 18M18 6l-1.9 1.9M7.9 16.1 6 18" /></>),
  monitor: (<><rect x="3.5" y="4.5" width="17" height="11.5" rx="1.8" /><path d="M9 20h6M12 16v4" /></>),
  impressora: (<><path d="M7 8V3.5h10V8" /><rect x="3.5" y="8" width="17" height="8" rx="1.5" /><path d="M7 13h10v7.5H7Z" /></>),
  rede: (<><circle cx="12" cy="5" r="2.2" /><circle cx="5" cy="19" r="2.2" /><circle cx="19" cy="19" r="2.2" /><path d="M12 7.2V13m0 0-5.4 4M12 13l5.4 4" /></>),
  wifi: (<><path d="M2.5 9.5a13.5 13.5 0 0 1 19 0" /><path d="M5.5 12.8a9.2 9.2 0 0 1 13 0" /><path d="M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="19" r="1.3" fill="currentColor" /></>),
  fone: (<><path d="M4.5 12.5a7.5 7.5 0 0 1 15 0" /><rect x="3" y="12.5" width="4" height="6.5" rx="1.5" /><rect x="17" y="12.5" width="4" height="6.5" rx="1.5" /><path d="M19.5 19c0 1.5-2 2.5-4.5 2.5" /></>),
  chat: (<><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H12l-4.5 4v-4h-2A1.5 1.5 0 0 1 4 14.5Z" /><path d="M8 9h8M8 12h5" /></>),
  caixa: (<><path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4Z" /><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9" /></>),
  sistema: (<><rect x="3.5" y="4" width="17" height="13" rx="1.8" /><path d="M3.5 8h17M6.5 6h.01M9 6h.01" /><path d="m7.5 12 2 2-2 2M11.5 16h4" /></>),
  cpu: (<><rect x="7" y="7" width="10" height="10" rx="1.5" /><rect x="10" y="10" width="4" height="4" /><path d="M9 3.5V7m6-3.5V7M9 17v3.5m6-3.5v3.5M3.5 9H7m-3.5 6H7M17 9h3.5M17 15h3.5" /></>),
  periferico: (<><rect x="3.5" y="7" width="17" height="11" rx="2" /><path d="M7 10.5h2.5m2.5 0h2.5M7 13.5h10M9 16.5h6" /></>),
  pasta: (<><path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4.5L12 7.5h7A1.5 1.5 0 0 1 20.5 9v8.5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5Z" /></>),
  carimbo: (<><circle cx="12" cy="7.5" r="3.5" /><path d="m9.5 10-1.5 6h8l-1.5-6" /><path d="M6 19.5h12" /></>),
  qr: (<><rect x="4" y="4" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1" /><path d="M13.5 13.5h3v3h-3zM17 17h3v3h-3zM20 13.5v.5M13.5 20h.5" /></>),
  escudo: (<><path d="M12 3 5 5.8v5.4c0 4.6 3 7.7 7 9.3 4-1.6 7-4.7 7-9.3V5.8Z" /></>),
};

export function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {ICONES[name] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}

/* ===================== Brasão institucional ===================== */

export function Brasao({ size = 44 }: { size?: number }) {
  const uid = useId();
  return (
    <svg width={size} height={(size * 56) / 48} viewBox="0 0 48 56" aria-hidden="true">
      <defs>
        <clipPath id={`bc-${uid}`}>
          <path d="M24 2 44 9v21c0 11.5-8.6 19.6-20 24C12.6 49.6 4 41.5 4 30V9Z" />
        </clipPath>
      </defs>
      <path d="M24 2 44 9v21c0 11.5-8.6 19.6-20 24C12.6 49.6 4 41.5 4 30V9Z" fill="#0b2a20" stroke="#f2b70a" strokeWidth="2" />
      <g clipPath={`url(#bc-${uid})`}>
        <rect x="4" y="22" width="40" height="8" fill="#f2b70a" />
        <path d="m24 7 1.9 4.1L30.4 12l-4.5 1.9L24 18l-1.9-4.1L17.6 12l4.5-.9Z" fill="#f2b70a" />
        <path d="M10 36h4v10h-4zM17 34h4v12h-4zM24 33h4v13h-4zM31 34h4v12h-4z" fill="#f2b70a" opacity="0.85" />
        <path d="M4 40c6 5 12 7.5 20 9 8-1.5 14-4 20-9v14H4Z" fill="#103629" />
      </g>
    </svg>
  );
}

/* ===================== Chips e badges ===================== */

const STATUS_DOC_TOM: Record<string, Tom> = { "Em vigor": "verde", "Em revisão": "ambar", Aprovado: "azul", Obsoleto: "cinza" };

export function Chip({ tom, children, dot = true }: { tom: Tom; children: ReactNode; dot?: boolean }) {
  const c = TOM_CSS[tom];
  return (
    <span className="chip" style={{ background: c.bg, color: c.fg }}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

export function StatusChip({ s }: { s: string }) {
  const lista = [...STATUS_TAREFA, ...STATUS_DEMANDA, ...STATUS_PROJETO, ...STATUS_CHAMADO, ...STATUS_ATIVO];
  const achado = lista.find((x) => x.label === s);
  const tom: Tom = achado ? achado.tom : STATUS_DOC_TOM[s] ?? "cinza";
  return <Chip tom={tom}>{s}</Chip>;
}

export function PrioridadeChip({ p }: { p: string }) {
  const achado = PRIORIDADES.find((x) => x.label === p);
  return <Chip tom={achado?.tom ?? "cinza"}>{p}</Chip>;
}

const AVATARES = ["#1e7a54", "#20659f", "#0e7490", "#b4690e", "#7d5a10", "#17603f", "#96331e", "#4d5c53"];
export function Avatar({ nome, size = 30, titulo }: { nome: string; size?: number; titulo?: string }) {
  const ini = nome.trim().split(/\s+/);
  const txt = ((ini[0]?.[0] ?? "") + (ini.length > 1 ? ini[ini.length - 1][0] : "")).toUpperCase();
  let h = 0;
  for (const c of nome) h = (h * 31 + c.charCodeAt(0)) % 997;
  const cor = AVATARES[h % AVATARES.length];
  return (
    <span
      title={titulo ?? nome}
      className="inline-flex items-center justify-center rounded-full font-bold text-white flex-none select-none"
      style={{ width: size, height: size, background: cor, fontSize: size * 0.36, letterSpacing: "0.02em" }}
    >
      {txt}
    </span>
  );
}

/* ===================== Progresso ===================== */

export function Barra({ valor, cor = "var(--green)", altura = 6 }: { valor: number; cor?: string; altura?: number }) {
  return (
    <div className="w-full rounded-full bg-[rgba(19,37,29,0.09)] overflow-hidden" style={{ height: altura }}>
      <div className="bar-anim h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, valor))}%`, background: cor }} />
    </div>
  );
}

export function Anel({ valor, size = 92, cor = "var(--green)", rotulo }: { valor: number; size?: number; cor?: string; rotulo?: string }) {
  const ref = useRef<SVGCircleElement>(null);
  const [off, setOff] = useState(1);
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  useEffect(() => {
    const idc = requestAnimationFrame(() => setOff(1 - Math.min(100, valor) / 100));
    return () => cancelAnimationFrame(idc);
  }, [valor]);
  return (
    <svg width={size} height={size} className="block">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(19,37,29,0.1)" strokeWidth="8" />
      <circle
        ref={ref} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={cor} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * off} transform={`rotate(-90 ${size / 2} ${size / 2})`} className="ring-anim"
      />
      <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" className="font-display" style={{ fontSize: size * 0.24, fontWeight: 800, fill: "var(--ink)" }}>
        {fmtNum(valor)}%
      </text>
      {rotulo && (
        <text x="50%" y="64%" textAnchor="middle" style={{ fontSize: 9, fill: "var(--muted)", fontWeight: 600 }}>
          {rotulo}
        </text>
      )}
    </svg>
  );
}

/* ===================== Contador animado ===================== */

export function Contador({ valor, formato, duracao = 950, className }: { valor: number; formato?: (n: number) => string; duracao?: number; className?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(valor); return; }
    let ini: number | null = null;
    let raf = 0;
    const passo = (ts: number) => {
      if (ini === null) ini = ts;
      const p = Math.min(1, (ts - ini) / duracao);
      setN(valor * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [valor, duracao]);
  return <span className={className}>{formato ? formato(n) : fmtNum(n)}</span>;
}

/* ===================== Efeito de decodificação (scramble) ===================== */

const GLIFOS = "▚▞▙#%&@≡+·";
export function Scramble({ texto, className, velocidade = 26 }: { texto: string; className?: string; velocidade?: number }) {
  const [saida, setSaida] = useState(texto);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setSaida(texto); return; }
    let frame = 0;
    const idv = setInterval(() => {
      frame++;
      const fixos = Math.floor(frame / 2);
      let s = "";
      for (let i = 0; i < texto.length; i++) {
        s += i < fixos ? texto[i] : texto[i] === " " ? " " : GLIFOS[Math.floor(Math.random() * GLIFOS.length)];
      }
      setSaida(s);
      if (fixos >= texto.length) clearInterval(idv);
    }, velocidade);
    return () => clearInterval(idv);
  }, [texto, velocidade]);
  return <span className={className}>{saida}</span>;
}

/* ===================== Revelação ao rolar ===================== */

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setOn(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (ents) => { if (ents[0].isIntersecting) { setOn(true); io.disconnect(); } },
      { threshold: 0.06 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`rv ${on ? "on" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ===================== Formulário ===================== */

export function Campo({ rotulo, obrigatorio, children, className = "" }: { rotulo: string; obrigatorio?: boolean; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">
        {rotulo} {obrigatorio && <span style={{ color: "var(--red)" }}>*</span>}
      </span>
      {children}
    </label>
  );
}

export function Seletor({ rotulo, obrigatorio, valor, onChange, opcoes, className = "" }: {
  rotulo: string; obrigatorio?: boolean; valor: string; onChange: (v: string) => void;
  opcoes: (string | { valor: string; rotulo: string })[]; className?: string;
}) {
  return (
    <Campo rotulo={rotulo} obrigatorio={obrigatorio} className={className}>
      <select className="select" value={valor} onChange={(e) => onChange(e.target.value)}>
        {opcoes.map((o) => {
          const { valor: v, rotulo: r } = typeof o === "string" ? { valor: o, rotulo: o } : o;
          return <option key={v} value={v}>{r}</option>;
        })}
      </select>
    </Campo>
  );
}

export function Chave({ ligado, onChange, rotulo, desc }: { ligado: boolean; onChange: (v: boolean) => void; rotulo: string; desc?: string }) {
  return (
    <button
      type="button" role="switch" aria-checked={ligado} onClick={() => onChange(!ligado)}
      className="flex items-center justify-between gap-4 w-full text-left py-2.5 group cursor-pointer bg-transparent border-0"
    >
      <span>
        <span className="block font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{rotulo}</span>
        {desc && <span className="block text-xs mt-0.5" style={{ color: "var(--muted)" }}>{desc}</span>}
      </span>
      <span
        className="flex-none rounded-full relative transition-colors duration-200"
        style={{ width: 40, height: 22, background: ligado ? "var(--green)" : "#c3cec2" }}
      >
        <span
          className="absolute top-[3px] rounded-full bg-white shadow transition-all duration-200"
          style={{ width: 16, height: 16, left: ligado ? 21 : 3 }}
        />
      </span>
    </button>
  );
}

/* ===================== Sobreposições ===================== */

export function Modal({ aberto, onFechar, titulo, children, rodape, largo }: {
  aberto: boolean; onFechar: () => void; titulo: string; children: ReactNode; rodape?: ReactNode; largo?: boolean;
}) {
  useEffect(() => {
    if (!aberto) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onFechar(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [aberto, onFechar]);
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-4 sm:p-8 anim-fade" style={{ background: "rgba(11,42,32,0.5)" }} onMouseDown={onFechar}>
      <div
        className={`card w-full ${largo ? "max-w-2xl" : "max-w-lg"} anim-pop my-auto`}
        style={{ borderRadius: 12, boxShadow: "var(--shadow-2)" }}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-label={titulo}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--line)" }}>
          <h3 className="font-display font-bold text-[16px] m-0">{titulo}</h3>
          <button className="icon-btn" onClick={onFechar} aria-label="Fechar"><Icon name="fechar" /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {rodape && <div className="flex justify-end gap-2 px-5 py-3.5" style={{ borderTop: "1px solid var(--line)", background: "rgba(19,37,29,0.02)" }}>{rodape}</div>}
      </div>
    </div>
  );
}

export function Confirmacao({ aberto, titulo, mensagem, onConfirmar, onCancelar, perigoso }: {
  aberto: boolean; titulo: string; mensagem: string; onConfirmar: () => void; onCancelar: () => void; perigoso?: boolean;
}) {
  return (
    <Modal
      aberto={aberto} onFechar={onCancelar} titulo={titulo}
      rodape={
        <>
          <button className="btn btn-outline" onClick={onCancelar}>Cancelar</button>
          <button className={`btn ${perigoso ? "btn-danger" : "btn-primary"}`} onClick={onConfirmar}>Confirmar</button>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed m-0" style={{ color: "var(--muted)" }}>{mensagem}</p>
    </Modal>
  );
}

export function PainelLateral({ aberto, onFechar, titulo, children, rodape }: {
  aberto: boolean; onFechar: () => void; titulo: ReactNode; children: ReactNode; rodape?: ReactNode;
}) {
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-[65] anim-fade" style={{ background: "rgba(11,42,32,0.42)" }} onMouseDown={onFechar}>
      <aside
        className="absolute right-0 top-0 bottom-0 w-full max-w-[440px] flex flex-col anim-slide-r"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--line)", boxShadow: "var(--shadow-2)" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="font-display font-bold text-[15px]">{titulo}</div>
          <button className="icon-btn" onClick={onFechar} aria-label="Fechar"><Icon name="fechar" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {rodape && <div className="px-5 py-3.5 flex gap-2" style={{ borderTop: "1px solid var(--line)" }}>{rodape}</div>}
      </aside>
    </div>
  );
}

/* ===================== Toasts ===================== */

interface Toast { id: number; titulo: string; detalhe?: string; tom: "verde" | "ambar" | "vermelho" | "azul"; }
const ToastCtx = createContext<(titulo: string, tom?: Toast["tom"], detalhe?: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [lista, setLista] = useState<Toast[]>([]);
  const push = (titulo: string, tom: Toast["tom"] = "verde", detalhe?: string) => {
    const id = Date.now() + Math.random();
    setLista((l) => [...l, { id, titulo, detalhe, tom }]);
    setTimeout(() => setLista((l) => l.filter((t) => t.id !== id)), 4200);
  };
  const cores: Record<string, string> = { verde: "var(--green)", ambar: "var(--amber)", vermelho: "var(--red)", azul: "var(--blue)" };
  const icones: Record<string, string> = { verde: "check", ambar: "aviso", vermelho: "aviso", azul: "info" };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-[95] flex flex-col gap-2 w-[330px] max-w-[calc(100vw-2rem)]">
        {lista.map((t) => (
          <div key={t.id} className="card anim-slide-r flex items-start gap-3 px-4 py-3" style={{ borderLeft: `4px solid ${cores[t.tom]}` }}>
            <span style={{ color: cores[t.tom] }} className="mt-0.5"><Icon name={icones[t.tom]} size={17} /></span>
            <div className="min-w-0">
              <div className="font-bold text-[13px]">{t.titulo}</div>
              {t.detalhe && <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{t.detalhe}</div>}
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ===================== Estado vazio ===================== */

export function Vazio({ icone = "busca", titulo, dica }: { icone?: string; titulo: string; dica?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ background: "var(--grey-soft)", color: "var(--muted)" }}>
        <Icon name={icone} size={22} />
      </span>
      <p className="font-display font-bold text-[15px] m-0">{titulo}</p>
      {dica && <p className="text-xs mt-1 m-0 max-w-[280px]" style={{ color: "var(--muted)" }}>{dica}</p>}
    </div>
  );
}

/* ===================== Status de chamado / ativo ===================== */

import { STATUS_ATIVO as _SA, STATUS_CHAMADO as _SC } from "../lib/data";

export function StatusChamadoChip({ s }: { s: string }) {
  const achado = [..._SC, ..._SA].find((x) => x.label === s);
  return <Chip tom={achado?.tom ?? "cinza"}>{s}</Chip>;
}

/* ===================== QR Code (padrão determinístico por ativo) ===================== */

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function QrCode({ valor, size = 148 }: { valor: string; size?: number }) {
  const n = 21;
  const cel = size / n;
  let h = hashStr(valor);
  const rand = () => { h = (Math.imul(h, 1103515245) + 12345) >>> 0; return h / 4294967296; };
  const grade: boolean[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => rand() > 0.52));
  const marcador = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
      const borda = i === 0 || i === 6 || j === 0 || j === 6;
      const miolo = i >= 2 && i <= 4 && j >= 2 && j <= 4;
      grade[r + i][c + j] = borda || miolo;
    }
    for (let i = -1; i <= 7; i++) {
      if (r + i >= 0 && r + i < n && c - 1 >= 0) grade[r + i][c - 1] = false;
      if (r + i >= 0 && r + i < n && c + 7 < n) grade[r + i][c + 7] = false;
    }
    for (let j = -1; j <= 7; j++) {
      if (c + j >= 0 && c + j < n && r - 1 >= 0) grade[r - 1][c + j] = false;
      if (c + j >= 0 && c + j < n && r + 7 < n) grade[r + 7][c + j] = false;
    }
  };
  marcador(0, 0); marcador(0, n - 7); marcador(n - 7, 0);
  for (let i = 8; i < n - 8; i++) { grade[6][i] = i % 2 === 0; grade[i][6] = i % 2 === 0; }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`QR Code ${valor}`} role="img" style={{ background: "#fff", borderRadius: 8, border: "1px solid var(--line)" }}>
      {grade.map((linha, r) =>
        linha.map((preto, c) => preto ? <rect key={`${r}-${c}`} x={c * cel + 0.4} y={r * cel + 0.4} width={cel - 0.8} height={cel - 0.8} fill="#13251d" /> : null)
      )}
    </svg>
  );
}

/* ===================== Rastreador de etapas de aprovação ===================== */

export interface EtapaRastreio { nome: string; status: "Pendente" | "Aprovado" | "Rejeitado" | "Ajuste solicitado"; aprovadorNome: string; data?: string; comentario?: string; }

export function RastreadorEtapas({ etapas }: { etapas: EtapaRastreio[] }) {
  if (etapas.length === 0) return null;
  const cor = (s: EtapaRastreio["status"]) =>
    s === "Aprovado" ? "var(--green)" : s === "Rejeitado" ? "var(--red)" : s === "Ajuste solicitado" ? "var(--amber)" : "var(--line-2)";
  return (
    <ol className="m-0 p-0 list-none">
      {etapas.map((e, i) => (
        <li key={i} className="flex gap-3 pb-4 last:pb-0">
          <div className="flex flex-col items-center">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center flex-none"
              style={e.status === "Pendente"
                ? { border: "2px solid var(--line-2)", background: "#fff", color: "transparent" }
                : { background: cor(e.status), color: "#fff" }}
            >
              <Icon name={e.status === "Aprovado" ? "check" : e.status === "Rejeitado" ? "fechar" : e.status === "Ajuste solicitado" ? "editar" : "check"} size={12} />
            </span>
            {i < etapas.length - 1 && <span className="flex-1 w-[2px] mt-1 rounded" style={{ background: etapas[i + 1].status !== "Pendente" || e.status === "Aprovado" ? "var(--line-2)" : "var(--line)" }} />}
          </div>
          <div className="min-w-0 pt-0.5">
            <div className="text-[12.5px] font-bold leading-tight">{e.nome}</div>
            <div className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>
              {e.status === "Pendente" ? `Aguardando — ${e.aprovadorNome}` : `${e.status} por ${e.aprovadorNome}${e.data ? ` · ${e.data}` : ""}`}
            </div>
            {e.comentario && <div className="text-[11.5px] mt-1 italic px-2.5 py-1.5 rounded-md" style={{ background: "rgba(19,37,29,0.045)", color: "var(--muted)" }}>“{e.comentario}”</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

