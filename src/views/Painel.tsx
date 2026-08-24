import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CabecalhoPagina, KpiFaixa } from "../components/shell";
import { Anel, Barra, Contador, Reveal, Scramble, StatusChip } from "../components/ui";
import { COMUNICADOS, DEMANDAS_POR_UNIDADE, SERIE_MENSAL, SLA_POR_EQUIPE, STATUS_DEMANDA, TOM_CSS } from "../lib/data";
import { diasAte, fmtData, fmtDataLonga, fmtMoeda, fmtNum, fmtPct, saudacao, tempoRel } from "../lib/format";
import { useApp } from "../lib/store";

const EIXO = { fontSize: 11, fill: "#5c6d63" } as const;

export default function Painel({ irPara }: { irPara: (v: string) => void }) {
  const { atual, projetos, tarefas, demandas, auditoria, config, riscos } = useApp();
  const primeiroNome = atual.nome.split(" ")[0];

  const ativos = projetos.filter((p) => !["Concluído", "Cancelado", "Suspenso"].includes(p.status));
  const emAndamento = tarefas.filter((t) => t.status === "Em Andamento").length;
  const emAtendimento = demandas.filter((d) => ["Em Atendimento", "Aceita", "Em Análise"].includes(d.status)).length;
  const prazos7 = tarefas.filter((t) => { const d = diasAte(t.prazo); return t.status !== "Concluído" && d >= 0 && d <= 7; }).length;
  const orcTotal = ativos.reduce((s, p) => s + p.orcamento, 0);
  const orcExec = ativos.reduce((s, p) => s + p.executado, 0);

  const demandasPorStatus = STATUS_DEMANDA.map((s) => ({
    nome: s.label, valor: demandas.filter((d) => d.status === s.label).length, cor: TOM_CSS[s.tom].fg,
  })).filter((x) => x.valor > 0);

  const emAtencao = projetos.filter((p) => ["Em Atenção", "Atrasado", "Em Andamento"].includes(p.status)).slice(0, 4);
  const proximosPrazos = tarefas
    .filter((t) => t.status !== "Concluído")
    .sort((a, b) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime())
    .slice(0, 6);
  const criticos = riscos.filter((r) => r.nivel === "Crítico").length;

  const corSaude = (s: string) => (s === "Crítico" ? "var(--red)" : s === "Em atenção" ? "var(--amber)" : "var(--green)");

  return (
    <div className="space-y-5">
      {/* Saudação + comunicados */}
      <Reveal>
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4 items-stretch">
          <div className="card p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 rounded-full opacity-[0.07]" style={{ background: "var(--accent)", transform: "translate(30%,-30%)" }} />
            <div className="ovl mb-2">{fmtDataLonga(new Date())}</div>
            <h2 className="font-display font-extrabold text-[32px] sm:text-[38px] leading-[1.05] m-0 tracking-tight">
              <Scramble texto={`${saudacao()}, ${primeiroNome}.`} />
            </h2>
            <p className="text-[13.5px] mt-2.5 mb-0 max-w-[460px]" style={{ color: "var(--muted)" }}>
              Há <strong style={{ color: "var(--ink)" }}>{fmtNum(prazos7)} prazos</strong> vencendo nos próximos 7 dias,{" "}
              <strong style={{ color: "var(--ink)" }}>{fmtNum(emAtendimento)} demandas</strong> em atendimento e{" "}
              <strong style={{ color: criticos > 0 ? "var(--red)" : "var(--ink)" }}>{fmtNum(criticos)} riscos críticos</strong> sob monitoramento.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <button className="btn btn-primary" onClick={() => irPara("tarefas")}>Abrir quadro de tarefas</button>
              <button className="btn btn-outline" onClick={() => irPara("demandas")}>Fila de demandas</button>
            </div>
          </div>
          <div className="card p-0 overflow-hidden flex flex-col" style={{ background: "var(--deep)" , borderColor: "var(--deep)"}}>
            <div className="hazard h-[4px] flex-none" />
            <div className="flex items-center gap-2 px-4 pt-3 pb-2 flex-none">
              <span className="w-2 h-2 rounded-full relative" style={{ background: "var(--accent)", color: "var(--accent)" }}><span className="pulse-live absolute inset-0 rounded-full" /></span>
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: "#f2b70a" }}>Mural de comunicados oficiais</span>
            </div>
            <div className="relative flex-1 overflow-hidden min-h-[86px]">
              <div className="ticker-track absolute whitespace-nowrap flex" style={{ width: "max-content" }}>
                {[0, 1].map((rep) => (
                  <div key={rep} className="flex">
                    {COMUNICADOS.map((c, i) => (
                      <span key={i} className="text-[12.5px] leading-snug mx-6 inline-flex items-start gap-2" style={{ color: "rgba(244,247,242,0.82)", maxWidth: 420, whiteSpace: "normal" }}>
                        <span style={{ color: "#f2b70a" }}>◆</span>{c}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Faixa de KPIs */}
      <Reveal delay={80}>
        <KpiFaixa
          itens={[
            { rotulo: "Projetos ativos", valor: <Contador valor={ativos.length} />, extra: `${fmtPct((orcExec / orcTotal) * 100)} do orçamento executado` },
            { rotulo: "Tarefas em andamento", valor: <Contador valor={emAndamento} />, extra: `${fmtNum(tarefas.filter((t) => t.status === "Bloqueado").length)} bloqueadas` },
            { rotulo: "Demandas em atendimento", valor: <Contador valor={emAtendimento} />, extra: `${fmtNum(demandas.filter((d) => d.status === "Nova").length)} novas na fila` },
            { rotulo: "Prazos em 7 dias", valor: <Contador valor={prazos7} />, cor: "var(--amber)", extra: `${fmtNum(tarefas.filter((t) => t.status !== "Concluído" && diasAte(t.prazo) < 0).length)} em atraso` },
            { rotulo: "Orçamento em execução", valor: <Contador valor={orcExec} formato={(n) => fmtMoeda(Math.round(n / 1000) * 1000, config.regional.moeda).replace(",00", "")} />, extra: `de ${fmtMoeda(orcTotal, config.regional.moeda).replace(",00", "")}` },
          ]}
        />
      </Reveal>

      {/* Gráficos principais */}
      <div className="grid lg:grid-cols-12 gap-4">
        <Reveal className="lg:col-span-7" delay={60}>
          <div className="card p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="ovl mb-1.5">Desempenho anual</div>
                <h3 className="font-display font-bold text-[17px] m-0">Entregas planejadas × realizadas</h3>
              </div>
              <div className="flex items-center gap-4 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--green)" }} /> Realizadas</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#a9bdb0" }} /> Planejadas</span>
              </div>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer>
                <AreaChart data={SERIE_MENSAL} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gEnt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--green)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--green)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(19,37,29,0.08)" vertical={false} />
                  <XAxis dataKey="mes" tick={EIXO} axisLine={false} tickLine={false} />
                  <YAxis tick={EIXO} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 12, fontFamily: "Public Sans" }} cursor={{ stroke: "var(--green)", strokeDasharray: "4 4" }} />
                  <Area type="monotone" dataKey="planejado" name="Planejadas" stroke="#a9bdb0" strokeWidth={2} fill="transparent" strokeDasharray="5 4" />
                  <Area type="monotone" dataKey="entregue" name="Realizadas" stroke="var(--green)" strokeWidth={2.5} fill="url(#gEnt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>

        <Reveal className="lg:col-span-5" delay={120}>
          <div className="card p-5 h-full">
            <div className="ovl mb-1.5">Atendimento</div>
            <h3 className="font-display font-bold text-[17px] m-0 mb-2">Demandas por status</h3>
            <div className="flex items-center gap-4">
              <div className="h-[210px] w-[55%]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={demandasPorStatus} dataKey="valor" nameKey="nome" innerRadius={52} outerRadius={82} paddingAngle={3} strokeWidth={0}>
                      {demandasPorStatus.map((d) => <Cell key={d.nome} fill={d.cor} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 12, fontFamily: "Public Sans" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex-1 space-y-1.5 m-0 p-0 list-none">
                {demandasPorStatus.map((d) => (
                  <li key={d.nome} className="flex items-center gap-2 text-[12px] font-semibold">
                    <span className="w-2.5 h-2.5 rounded-sm flex-none" style={{ background: d.cor }} />
                    <span className="flex-1 truncate" style={{ color: "var(--muted)" }}>{d.nome}</span>
                    <span className="font-display font-extrabold text-[14px]">{fmtNum(d.valor)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Listas operacionais */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Reveal delay={60}>
          <div className="card p-5 h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-[16px] m-0">Projetos em destaque</h3>
              <button className="text-[12px] font-bold cursor-pointer bg-transparent border-0" style={{ color: "var(--green)" }} onClick={() => irPara("projetos")}>Ver todos</button>
            </div>
            <div className="space-y-4">
              {emAtencao.map((p) => (
                <div key={p.id} className="group cursor-pointer" onClick={() => irPara("projetos")}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[13px] font-bold truncate group-hover:underline decoration-[var(--accent)] decoration-2 underline-offset-4">{p.nome}</span>
                    <span className="text-[11px] font-bold flex-none" style={{ color: corSaude(p.saude) }}>● {p.saude}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1"><Barra valor={p.progresso} cor={corSaude(p.saude)} /></div>
                    <span className="text-[12px] font-bold tabular-nums w-9 text-right">{fmtPct(p.progresso)}</span>
                    <span className="text-[11px] tabular-nums w-[70px] text-right" style={{ color: "var(--muted)" }}>{fmtData(p.prazo)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="card p-5 h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-[16px] m-0">Prazos próximos</h3>
              <button className="text-[12px] font-bold cursor-pointer bg-transparent border-0" style={{ color: "var(--green)" }} onClick={() => irPara("tarefas")}>Quadro</button>
            </div>
            <ul className="space-y-1 m-0 p-0 list-none">
              {proximosPrazos.map((t) => {
                const d = diasAte(t.prazo);
                const cor = d < 0 ? "var(--red)" : d === 0 ? "var(--amber)" : "var(--ink)";
                return (
                  <li key={t.id} className="flex items-center gap-3 py-1.5 rounded-md px-1 hover:bg-[rgba(30,122,84,0.05)] transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: cor }} />
                    <span className="flex-1 text-[12.5px] font-semibold truncate">{t.titulo}</span>
                    <span className="text-[11px] font-bold tabular-nums flex-none px-2 py-0.5 rounded-full" style={{ color: cor, background: d < 0 ? "var(--red-soft)" : "rgba(19,37,29,0.06)" }}>
                      {d < 0 ? `${fmtNum(Math.abs(d))} d em atraso` : d === 0 ? "hoje" : `${fmtNum(d)} d`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={180} className="md:col-span-2 xl:col-span-1">
          <div className="card p-5 h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-[16px] m-0">Atividade recente</h3>
              <button className="text-[12px] font-bold cursor-pointer bg-transparent border-0" style={{ color: "var(--green)" }} onClick={() => irPara("administracao")}>Auditoria</button>
            </div>
            <ol className="space-y-3 m-0 p-0 list-none">
              {auditoria.slice(0, 5).map((a) => (
                <li key={a.id} className="flex gap-2.5">
                  <span className="mt-[5px] w-2 h-2 rounded-full flex-none" style={{ background: a.usuario === "sistema" ? "var(--cyan)" : "var(--accent)" }} />
                  <div className="min-w-0">
                    <div className="text-[12.5px] leading-snug"><strong>{a.acao}</strong> — {a.detalhe}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>{a.usuario} · {tempoRel(a.dataHora)}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>

      {/* Carga por secretaria + SLA */}
      <div className="grid lg:grid-cols-12 gap-4">
        <Reveal className="lg:col-span-7" delay={60}>
          <div className="card p-5 h-full">
            <div className="ovl mb-1.5">Visão por unidade</div>
            <h3 className="font-display font-bold text-[17px] m-0 mb-3">Demandas por secretaria</h3>
            <div className="h-[230px]">
              <ResponsiveContainer>
                <BarChart data={DEMANDAS_POR_UNIDADE} margin={{ top: 4, right: 4, left: -22, bottom: 0 }} barGap={3}>
                  <CartesianGrid stroke="rgba(19,37,29,0.08)" vertical={false} />
                  <XAxis dataKey="sigla" tick={EIXO} axisLine={false} tickLine={false} />
                  <YAxis tick={EIXO} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 12, fontFamily: "Public Sans" }} cursor={{ fill: "rgba(30,122,84,0.06)" }} />
                  <Bar dataKey="abertas" name="Abertas no ano" fill="#b9c8bd" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="concluidas" name="Concluídas" fill="var(--green)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>
        <Reveal className="lg:col-span-5" delay={120}>
          <div className="card p-5 h-full">
            <div className="ovl mb-1.5">Qualidade de serviço</div>
            <h3 className="font-display font-bold text-[17px] m-0 mb-3">Cumprimento de SLA por equipe</h3>
            <div className="flex flex-wrap items-center justify-around gap-4">
              {SLA_POR_EQUIPE.map((e) => (
                <div key={e.equipe} className="text-center">
                  <Anel valor={e.sla} size={84} cor={e.sla >= 93 ? "var(--green)" : e.sla >= 90 ? "var(--amber)" : "var(--red)"} />
                  <div className="text-[11.5px] font-bold mt-1.5">{e.equipe}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Rodapé de status com chips */}
      <Reveal delay={60}>
        <div className="card px-5 py-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          <span className="ovl">Situação geral</span>
          <span className="text-[12.5px] font-semibold flex items-center gap-2">
            Projetos em andamento <span className="font-display font-extrabold text-[15px]">{fmtNum(projetos.filter((p) => p.status === "Em Andamento").length)}</span> <StatusChip s="Em Andamento" />
          </span>
          <span className="text-[12.5px] font-semibold flex items-center gap-2">
            Demandas na fila <span className="font-display font-extrabold text-[15px]">{fmtNum(demandas.filter((d) => ["Nova", "Em Análise"].includes(d.status)).length)}</span> <StatusChip s="Nova" />
          </span>
          <span className="text-[12.5px] font-semibold flex items-center gap-2">
            Tarefas bloqueadas <span className="font-display font-extrabold text-[15px]" style={{ color: "var(--red)" }}>{fmtNum(tarefas.filter((t) => t.status === "Bloqueado").length)}</span> <StatusChip s="Bloqueado" />
          </span>
          <span className="ml-auto text-[11.5px]" style={{ color: "var(--muted)" }}>Dados consolidados em tempo real · {fmtData(new Date())}</span>
        </div>
      </Reveal>
    </div>
  );
}

export { CabecalhoPagina };
