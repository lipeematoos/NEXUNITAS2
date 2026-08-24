import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Anel, Contador, Icon, Reveal, useToast } from "../components/ui";
import { CabecalhoPagina } from "../components/shell";
import { DEMANDAS_POR_UNIDADE, PRIORIDADES, RELATORIOS_MODELOS, SERIE_MENSAL, SLA_POR_EQUIPE } from "../lib/data";
import { fmtData, fmtDataHora, fmtNum, fmtPct } from "../lib/format";
import { useApp } from "../lib/store";

const EIXO = { fontSize: 11, fill: "#5c6d63" } as const;

/* ===================== Indicadores ===================== */

const PERIODOS = [
  { id: "30", rotulo: "30 dias", fator: 0.34 },
  { id: "90", rotulo: "90 dias", fator: 1 },
  { id: "365", rotulo: "12 meses", fator: 4.1 },
];

export function Indicadores() {
  const { tarefas, demandas } = useApp();
  const [periodo, setPeriodo] = useState(PERIODOS[1]);

  const kpis = useMemo(() => {
    const f = periodo.fator;
    return [
      { rotulo: "Taxa de conclusão", valor: 87, formato: (n: number) => fmtPct(Math.round(n)), delta: "+3,2 p.p.", positivo: true },
      { rotulo: "SLA cumprido", valor: 92, formato: (n: number) => fmtPct(Math.round(n)), delta: "+1,8 p.p.", positivo: true },
      { rotulo: "Lead time médio", valor: 4.2, formato: (n: number) => `${fmtNum(n, 1)} dias`, delta: "−0,6 dia", positivo: true },
      { rotulo: "Demandas resolvidas", valor: Math.round(1250 * f), formato: (n: number) => fmtNum(n), delta: "+12,4%", positivo: true },
      { rotulo: "Em atraso", valor: Math.round(tarefas.filter((t) => t.status !== "Concluído").length * 0.2 * f) + 3, formato: (n: number) => fmtNum(n), delta: "+2 itens", positivo: false },
    ];
  }, [periodo, tarefas]);

  const serie = periodo.id === "30" ? SERIE_MENSAL.slice(-1) : periodo.id === "90" ? SERIE_MENSAL.slice(-3) : SERIE_MENSAL;

  const porPrioridade = PRIORIDADES.map((p) => ({
    nome: p.label, valor: Math.max(1, Math.round(tarefas.filter((t) => t.prioridade === p.label).length * periodo.fator) + (p.peso % 3)),
    cor: p.hex,
  }));

  return (
    <div>
      <CabecalhoPagina
        titulo="Indicadores"
        subtitulo={`Acompanhamento estratégico do DTI · base consolidada em ${fmtData(new Date())}`}
        acoes={
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: "rgba(19,37,29,0.06)" }}>
            {PERIODOS.map((p) => (
              <button key={p.id} className="tab-btn" style={periodo.id === p.id ? { background: "var(--deep)", color: "#f2f6f0" } : undefined} onClick={() => setPeriodo(p)}>
                {p.rotulo}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
        {kpis.map((k, i) => (
          <Reveal key={k.rotulo} delay={i * 50}>
            <div className="card card-hover p-4">
              <div className="text-[10.5px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>{k.rotulo}</div>
              <div className="font-display font-extrabold text-[26px] leading-none tabular-nums"><Contador valor={k.valor} formato={k.formato} /></div>
              <div className="flex items-center gap-1 mt-2 text-[11px] font-bold" style={{ color: k.positivo ? "var(--green)" : "var(--red)" }}>
                <Icon name={k.positivo ? "tendencia-up" : "tendencia-up"} size={13} className={k.positivo ? "" : "rotate-180"} /> {k.delta} vs. período anterior
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Reveal>
          <div className="card p-5 h-full">
            <div className="ovl mb-1.5">Fluxo de atendimento</div>
            <h3 className="font-display font-bold text-[16.5px] m-0 mb-3">Demandas recebidas × concluídas</h3>
            <div className="h-[230px]">
              <ResponsiveContainer>
                <LineChart data={serie} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(19,37,29,0.08)" vertical={false} />
                  <XAxis dataKey="mes" tick={EIXO} axisLine={false} tickLine={false} />
                  <YAxis tick={EIXO} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 12, fontFamily: "Public Sans" }} />
                  <Line type="monotone" dataKey="demandas" name="Recebidas" stroke="var(--blue)" strokeWidth={2.2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="entregue" name="Concluídas" stroke="var(--green)" strokeWidth={2.2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="card p-5 h-full">
            <div className="ovl mb-1.5">Origem</div>
            <h3 className="font-display font-bold text-[16.5px] m-0 mb-3">Demandas por secretaria</h3>
            <div className="h-[230px]">
              <ResponsiveContainer>
                <BarChart data={DEMANDAS_POR_UNIDADE} layout="vertical" margin={{ top: 0, right: 10, left: 6, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(19,37,29,0.08)" horizontal={false} />
                  <XAxis type="number" tick={EIXO} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="sigla" tick={EIXO} axisLine={false} tickLine={false} width={52} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 12, fontFamily: "Public Sans" }} cursor={{ fill: "rgba(30,122,84,0.06)" }} />
                  <Bar dataKey="concluidas" name="Concluídas" fill="var(--green)" radius={[0, 3, 3, 0]} barSize={13} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Reveal>
          <div className="card p-5 h-full">
            <div className="ovl mb-1.5">Priorização</div>
            <h3 className="font-display font-bold text-[16.5px] m-0 mb-2">Tarefas por prioridade</h3>
            <div className="flex items-center gap-3">
              <div className="h-[210px] w-[52%]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={porPrioridade} dataKey="valor" nameKey="nome" innerRadius={48} outerRadius={78} paddingAngle={2} strokeWidth={0}>
                      {porPrioridade.map((d) => <Cell key={d.nome} fill={d.cor} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 12, fontFamily: "Public Sans" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex-1 space-y-1.5 m-0 p-0 list-none">
                {porPrioridade.map((p) => (
                  <li key={p.nome} className="flex items-center gap-2 text-[12px] font-semibold">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.cor }} />
                    <span className="flex-1" style={{ color: "var(--muted)" }}>{p.nome}</span>
                    <span className="font-display font-extrabold">{fmtNum(p.valor)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="card p-5 h-full">
            <div className="ovl mb-1.5">Acordo de nível de serviço</div>
            <h3 className="font-display font-bold text-[16.5px] m-0 mb-3">SLA por equipe no período</h3>
            <div className="flex flex-wrap items-center justify-around gap-4">
              {SLA_POR_EQUIPE.map((e) => (
                <div key={e.equipe} className="text-center">
                  <Anel valor={e.sla} size={92} cor={e.sla >= 93 ? "var(--green)" : e.sla >= 90 ? "var(--amber)" : "var(--red)"} rotulo={e.equipe} />
                </div>
              ))}
            </div>
            <p className="text-[11.5px] mt-3 mb-0 text-center" style={{ color: "var(--muted)" }}>
              Meta institucional: 95% das demandas atendidas dentro do prazo do fluxo.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ===================== Relatórios ===================== */

function Sparkline({ seed }: { seed: number }) {
  const pts = Array.from({ length: 10 }, (_, i) => 18 - Math.abs(Math.sin(seed * 3.7 + i * 1.3)) * 14 - (i % 3));
  const d = pts.map((y, i) => `${i === 0 ? "M" : "L"}${(i * 100) / 9},${y}`).join(" ");
  return (
    <svg viewBox="0 0 100 22" className="w-full h-[38px]" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" />
      <path d={`${d} L100,22 L0,22 Z`} fill="rgba(30,122,84,0.12)" />
    </svg>
  );
}

export function Relatorios() {
  const toast = useToast();
  const [gerando, setGerando] = useState<string | null>(null);
  const [recentes, setRecentes] = useState([
    { nome: "SLA de Demandas por Secretaria — Setembro", quando: new Date(Date.now() - 86400000 * 2).toISOString() },
    { nome: "Execução Orçamentária por Projeto — 3º trimestre", quando: new Date(Date.now() - 86400000 * 6).toISOString() },
  ]);
  const agendados = [
    { nome: "Produtividade por Equipe", frequencia: "Semanal (segunda, 7h)", destinatario: "Comitê de Governança de TI" },
    { nome: "Execução Orçamentária por Projeto", frequencia: "Mensal (dia 5, 8h)", destinatario: "SEFAZ e Gabinete" },
    { nome: "Matriz de Riscos Críticos", frequencia: "Quinzenal (sexta, 16h)", destinatario: "Responsáveis pelas Unidades" },
  ];

  const gerar = (nome: string) => {
    setGerando(nome);
    setTimeout(() => {
      setGerando(null);
      setRecentes((r) => [{ nome, quando: new Date().toISOString() }, ...r]);
      toast("Relatório gerado com sucesso", "verde", nome);
    }, 1400);
  };

  return (
    <div>
      <CabecalhoPagina titulo="Relatórios" subtitulo="Modelos oficiais de prestação de contas e monitoramento" />
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {RELATORIOS_MODELOS.map((r, i) => (
          <Reveal key={r.id} delay={i * 50}>
            <div className="card card-hover p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Chip2 texto={r.categoria} />
                <Sparkline seed={i + 1} />
              </div>
              <h3 className="font-display font-bold text-[15.5px] m-0 leading-snug">{r.nome}</h3>
              <p className="text-[12px] mt-1.5 mb-4 flex-1" style={{ color: "var(--muted)" }}>{r.descricao}</p>
              <div className="flex gap-2">
                <button className="btn btn-primary flex-1 !py-2 text-[12.5px]" onClick={() => gerar(r.nome)} disabled={gerando === r.nome}>
                  {gerando === r.nome ? <><span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white anim-spin" /> Gerando…</> : <><Icon name="relatorios" size={15} /> Gerar relatório</>}
                </button>
                <button className="btn btn-outline !py-2 text-[12.5px]" onClick={() => toast("Agendamento criado", "verde", `${r.nome} — envio mensal`)}>Agendar</button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-5">
        <Reveal>
          <div className="card p-5">
            <div className="ovl mb-3">Gerados recentemente</div>
            <ul className="space-y-2.5 m-0 p-0 list-none">
              {recentes.map((r, i) => (
                <li key={i} className="flex items-center gap-3 rounded-lg px-3.5 py-3 anim-pop" style={{ background: "rgba(19,37,29,0.035)", border: "1px solid var(--line)" }}>
                  <Icon name="documentos" size={18} className="text-[var(--green)] flex-none" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-bold truncate">{r.nome}</div>
                    <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{fmtDataHora(r.quando)}</div>
                  </div>
                  <button className="btn btn-outline !py-1 !px-2.5 text-[11.5px]" onClick={() => toast("Download iniciado", "azul", `${r.nome}.pdf`)}>PDF</button>
                  <button className="btn btn-outline !py-1 !px-2.5 text-[11.5px]" onClick={() => toast("Download iniciado", "azul", `${r.nome}.csv`)}>CSV</button>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="card p-5">
            <div className="ovl mb-3">Envios agendados</div>
            <table className="tbl">
              <thead><tr><th>Relatório</th><th>Frequência</th><th>Destinatário</th></tr></thead>
              <tbody>
                {agendados.map((a) => (
                  <tr key={a.nome}>
                    <td className="font-bold text-[12px]">{a.nome}</td>
                    <td className="text-[12px] whitespace-nowrap">{a.frequencia}</td>
                    <td className="text-[12px]" style={{ color: "var(--muted)" }}>{a.destinatario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function Chip2({ texto }: { texto: string }) {
  return <span className="chip" style={{ background: "var(--blue-soft)", color: "var(--blue)" }}>{texto}</span>;
}
