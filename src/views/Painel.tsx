import { useMemo } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Anel, Contador, Icon, Reveal, Scramble, StatusChip, useToast } from "../components/ui";
import { CabecalhoPagina, KpiFaixa } from "../components/shell";
import { COMUNICADOS, DEMANDAS_POR_UNIDADE, SERIE_MENSAL, SLA_POR_EQUIPE, STATUS_TAREFA } from "../lib/data";
import { fmtDataLonga, fmtHora, fmtNum, fmtPct, saudacao } from "../lib/format";
import { useApp } from "../lib/store";

const TooltipGov = {
  contentStyle: {
    background: "#fbfcf9", border: "1px solid var(--line-2)", borderRadius: 8,
    fontSize: 12, fontFamily: "Public Sans, sans-serif", boxShadow: "var(--shadow-2)",
  },
  labelStyle: { fontWeight: 800, color: "#13251d" },
};

export default function Painel({ irPara }: { irPara: (v: string) => void }) {
  const { projetos, tarefas, demandas, chamados, riscos, usuarios, ativos, auditoria, config, atual, regrasSLA } = useApp();
  const toast = useToast();
  void toast; void regrasSLA;

  const ativosProj = projetos.filter((p) => !["Concluído", "Cancelado", "Suspenso"].includes(p.status));
  const atrasadosProj = projetos.filter((p) => p.status === "Atrasado");
  const concluidosProj = projetos.filter((p) => p.status === "Concluído");
  const demandasAbertas = demandas.filter((d) => !["Concluída", "Recusada", "Cancelada"].includes(d.status));
  const chamadosAbertos = chamados.filter((c) => !["Fechado", "Cancelado", "Rejeitado", "Resolvido"].includes(c.status));
  const tarefasAtrasadas = tarefas.filter((t) => t.status !== "Concluído" && t.prazo < new Date().toISOString());
  const riscosCriticos = riscos.filter((r) => r.nivel === "Crítico");
  const servidoresAtivos = usuarios.filter((u) => u.ativo).length;
  const equipEmUso = ativos.filter((a) => ["Em Uso", "Emprestado"].includes(a.status)).length;

  const tarefasPorStatus = useMemo(
    () => STATUS_TAREFA.map((s) => ({ nome: s.label, total: tarefas.filter((t) => t.status === s.label).length, hex: s.hex })).filter((x) => x.total > 0),
    [tarefas]
  );

  const chamadosPorSecretaria = useMemo(() => {
    const m = new Map<string, number>();
    chamados.forEach((c) => {
      const un = c.unidadeId;
      m.set(un, (m.get(un) ?? 0) + 1);
    });
    return ["un1", "un2", "un3", "un4", "un5", "un6", "un11"].map((id) => ({
      sigla: id === "un11" ? "DTI" : { un1: "SEAD", un2: "SEFAZ", un3: "SEMED", un4: "SESAU", un5: "SETUR", un6: "SEOB" }[id as "un1"] ?? id,
      chamados: m.get(id) ?? 0,
    })).filter((x) => x.chamados > 0);
  }, [chamados]);

  const equipamentosPorCategoria = useMemo(() => {
    const m = new Map<string, number>();
    ativos.forEach((a) => m.set(a.categoria, (m.get(a.categoria) ?? 0) + 1));
    return [...m.entries()].map(([nome, total]) => ({ nome, total })).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [ativos]);

  const projetosPorSecretaria = useMemo(() => {
    const m = new Map<string, number>();
    projetos.forEach((p) => m.set(p.unidadeId.slice(0, 3), (m.get(p.unidadeId.slice(0, 3)) ?? 0) + 1));
    return [{ sigla: "DINF", total: projetos.filter((p) => p.unidadeId === "un111").length },
    { sigla: "DSIS", total: projetos.filter((p) => p.unidadeId === "un112").length },
    { sigla: "SUP", total: projetos.filter((p) => p.unidadeId === "un113").length }].filter((x) => x.total > 0);
  }, [projetos]);
  void projetosPorSecretaria;

  const slaMedio = 92;
  const pctConcluidas = tarefas.length ? (tarefas.filter((t) => t.status === "Concluído").length / tarefas.length) * 100 : 0;

  return (
    <div>
      <CabecalhoPagina
        titulo={`${saudacao()}, ${atual.nome.split(" ")[0]}`}
        subtitulo={`${fmtDataLonga(new Date())} · visão executiva de ${config.orgao.nome}`}
      />

      {/* Mural de comunicados (ticker) */}
      <div className="card overflow-hidden mb-4 flex items-stretch">
        <div className="flex items-center gap-2 px-4 py-2.5 flex-none" style={{ background: "var(--deep)", color: "#f2b70a" }}>
          <Icon name="sino" size={16} />
          <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase">Comunicados</span>
        </div>
        <div className="relative flex-1 overflow-hidden" style={{ background: "var(--yellow-soft)" }}>
          <div className="ticker-track flex items-center gap-14 whitespace-nowrap py-2.5 pl-6 w-max">
            {[...COMUNICADOS, ...COMUNICADOS].map((c, i) => (
              <span key={i} className="flex items-center gap-2 text-[12.5px] font-semibold" style={{ color: "var(--accent-ink)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-2)" }} /> {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 mb-4">
          {[
            { rotulo: "Projetos Ativos", n: ativosProj.length, cor: "var(--green)", ic: "projetos", dest: "projetos" },
            { rotulo: "Projetos Atrasados", n: atrasadosProj.length, cor: "var(--red)", ic: "aviso", dest: "projetos" },
            { rotulo: "Concluídos", n: concluidosProj.length, cor: "var(--ink)", ic: "check", dest: "projetos" },
            { rotulo: "Demandas Abertas", n: demandasAbertas.length, cor: "var(--blue)", ic: "demandas", dest: "demandas" },
            { rotulo: "Chamados TI Abertos", n: chamadosAbertos.length, cor: "var(--cyan)", ic: "fone", dest: "central-ti" },
            { rotulo: "Tarefas Atrasadas", n: tarefasAtrasadas.length, cor: "var(--red)", ic: "relogio", dest: "tarefas" },
            { rotulo: "Riscos Críticos", n: riscosCriticos.length, cor: "var(--red)", ic: "riscos", dest: "riscos" },
            { rotulo: "Servidores Ativos", n: servidoresAtivos, cor: "var(--green)", ic: "equipes", dest: "organograma" },
          ].map((k, i) => (
            <button
              key={k.rotulo}
              className="card card-hover px-4 py-3.5 text-left cursor-pointer block anim-rise"
              style={{ animationDelay: `${i * 40}ms`, border: "1px solid var(--line)", background: "var(--card)", borderRadius: 10 }}
              onClick={() => irPara(k.dest)}
            >
              <span className="flex items-center justify-between mb-2">
                <span style={{ color: k.cor }}><Icon name={k.ic} size={16} /></span>
                <Icon name="seta-d" size={13} className="opacity-30" />
              </span>
              <span className="block font-display font-extrabold text-[26px] leading-none tracking-tight" style={{ color: k.cor }}>
                <Contador valor={k.n} />
              </span>
              <span className="block text-[9.5px] font-bold uppercase tracking-wider mt-1.5" style={{ color: "var(--muted)" }}>{k.rotulo}</span>
            </button>
          ))}
        </div>
      </Reveal>

      {/* Gráficos principais */}
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Reveal className="lg:col-span-2">
          <div className="card p-5 h-full">
            <div className="flex items-center justify-between mb-1">
              <div>
                <div className="ovl mb-1">Execução 2026</div>
                <h3 className="font-display font-bold text-[16.5px] m-0">Entregas planejadas × realizadas e demandas</h3>
              </div>
              <div className="flex gap-3 text-[11px] font-bold" style={{ color: "var(--muted)" }}>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--line-2)" }} /> Planejado</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--green)" }} /> Entregue</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--accent)" }} /> Demandas</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={SERIE_MENSAL} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gEnt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--green)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--green)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(19,37,29,0.07)" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#5c6d63" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5c6d63" }} axisLine={false} tickLine={false} />
                <Tooltip {...TooltipGov} />
                <Area type="monotone" dataKey="planejado" stroke="var(--line-2)" strokeWidth={2} strokeDasharray="5 4" fill="transparent" name="Planejado" />
                <Area type="monotone" dataKey="entregue" stroke="var(--green)" strokeWidth={2.4} fill="url(#gEnt)" name="Entregue" />
                <Area type="monotone" dataKey="demandas" stroke="var(--accent-2)" strokeWidth={2} fill="transparent" name="Demandas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Reveal>

        <Reveal delay={70}>
          <div className="card p-5 h-full flex flex-col">
            <div className="ovl mb-1">Conclusão de tarefas</div>
            <h3 className="font-display font-bold text-[16.5px] m-0 mb-3">Status geral do trabalho</h3>
            <div className="flex items-center gap-4 flex-1">
              <Anel valor={pctConcluidas} size={128} rotulo="concluídas" />
              <div className="flex-1 space-y-1.5 min-w-0">
                {tarefasPorStatus.map((s) => (
                  <div key={s.nome} className="flex items-center gap-2 text-[11.5px] font-semibold">
                    <span className="w-2.5 h-2.5 rounded-sm flex-none" style={{ background: s.hex }} />
                    <span className="flex-1 truncate">{s.nome}</span>
                    <span className="tabular-nums font-extrabold">{fmtNum(s.total)}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn btn-outline w-full mt-3 !py-2 text-[12px]" onClick={() => irPara("tarefas")}>
              Abrir quadro de tarefas <Icon name="seta-d" size={14} />
            </button>
          </div>
        </Reveal>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Tarefas por status (pizza) */}
        <Reveal>
          <div className="card p-5 h-full">
            <div className="ovl mb-1">Tarefas por status</div>
            <h3 className="font-display font-bold text-[16px] m-0 mb-2">Distribuição do quadro</h3>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={tarefasPorStatus} dataKey="total" nameKey="nome" innerRadius={48} outerRadius={78} paddingAngle={3} stroke="none">
                  {tarefasPorStatus.map((s) => <Cell key={s.nome} fill={s.hex} />)}
                </Pie>
                <Tooltip {...TooltipGov} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
              {tarefasPorStatus.map((s) => (
                <span key={s.nome} className="flex items-center gap-1.5 text-[10.5px] font-bold" style={{ color: "var(--muted)" }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: s.hex }} /> {s.nome}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Chamados por secretaria */}
        <Reveal delay={50}>
          <div className="card p-5 h-full">
            <div className="ovl mb-1">Chamados por secretaria</div>
            <h3 className="font-display font-bold text-[16px] m-0 mb-2">Central de Serviços de TI</h3>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={chamadosPorSecretaria} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid stroke="rgba(19,37,29,0.07)" vertical={false} />
                <XAxis dataKey="sigla" tick={{ fontSize: 10.5, fill: "#5c6d63" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10.5, fill: "#5c6d63" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...TooltipGov} cursor={{ fill: "rgba(30,122,84,0.06)" }} />
                <Bar dataKey="chamados" fill="var(--cyan)" radius={[4, 4, 0, 0]} maxBarSize={34} name="Chamados" />
              </BarChart>
            </ResponsiveContainer>
            <button className="btn btn-ghost w-full !py-1.5 text-[11.5px] mt-1" onClick={() => irPara("central-ti")}>Ver fila de atendimento</button>
          </div>
        </Reveal>

        {/* Equipamentos por categoria */}
        <Reveal delay={100}>
          <div className="card p-5 h-full">
            <div className="ovl mb-1">Equipamentos por categoria</div>
            <h3 className="font-display font-bold text-[16px] m-0 mb-2">Patrimônio de TI</h3>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={equipamentosPorCategoria} layout="vertical" margin={{ top: 0, right: 14, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="rgba(19,37,29,0.07)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10.5, fill: "#5c6d63" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="nome" width={86} tick={{ fontSize: 10.5, fill: "#5c6d63" }} axisLine={false} tickLine={false} />
                <Tooltip {...TooltipGov} cursor={{ fill: "rgba(242,183,10,0.08)" }} />
                <Bar dataKey="total" fill="var(--accent)" radius={[0, 4, 4, 0]} maxBarSize={16} name="Equipamentos" />
              </BarChart>
            </ResponsiveContainer>
            <button className="btn btn-ghost w-full !py-1.5 text-[11.5px] mt-1" onClick={() => irPara("patrimonio")}>Abrir patrimônio ({fmtNum(equipEmUso)} em uso)</button>
          </div>
        </Reveal>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Demandas por secretaria + SLA */}
        <Reveal className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="ovl mb-1">Carga por secretaria</div>
                <h3 className="font-display font-bold text-[16.5px] m-0">Demandas abertas × concluídas e SLA da TI</h3>
              </div>
            </div>
            <div className="grid md:grid-cols-[1.4fr_1fr] gap-5">
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={DEMANDAS_POR_UNIDADE} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(19,37,29,0.07)" vertical={false} />
                  <XAxis dataKey="sigla" tick={{ fontSize: 10.5, fill: "#5c6d63" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10.5, fill: "#5c6d63" }} axisLine={false} tickLine={false} />
                  <Tooltip {...TooltipGov} cursor={{ fill: "rgba(30,122,84,0.06)" }} />
                  <Bar dataKey="abertas" fill="var(--blue)" radius={[4, 4, 0, 0]} maxBarSize={22} name="Abertas" />
                  <Bar dataKey="concluidas" fill="var(--green)" radius={[4, 4, 0, 0]} maxBarSize={22} name="Concluídas" />
                </BarChart>
              </ResponsiveContainer>
              <div>
                <div className="ovl mb-3" style={{ fontSize: 10 }}>SLA da TI por grupo</div>
                <div className="space-y-3">
                  {SLA_POR_EQUIPE.map((e) => (
                    <div key={e.equipe}>
                      <div className="flex justify-between text-[11.5px] font-bold mb-1">
                        <span>{e.equipe}</span>
                        <span className="tabular-nums" style={{ color: e.sla >= 90 ? "var(--green)" : "var(--amber)" }}>{fmtPct(e.sla)}</span>
                      </div>
                      <div className="rounded-full h-2 overflow-hidden" style={{ background: "rgba(19,37,29,0.08)" }}>
                        <div className="h-full bar-anim rounded-full" style={{ width: `${e.sla}%`, background: e.sla >= 90 ? "var(--green)" : "var(--amber)" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-lg px-3.5 py-3" style={{ background: "var(--green-soft)" }}>
                  <Anel valor={slaMedio} size={64} cor="var(--green)" />
                  <div className="text-[11.5px] leading-snug" style={{ color: "var(--green)" }}>
                    <strong>SLA geral da TI: {fmtPct(slaMedio)}</strong><br />dentro da meta de 90% no mês
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Atividade recente */}
        <Reveal delay={80}>
          <div className="card p-5 h-full flex flex-col">
            <div className="ovl mb-3">Atividade recente</div>
            <div className="flex-1 space-y-3">
              {auditoria.slice(0, 7).map((a) => (
                <div key={a.id} className="flex gap-2.5">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center flex-none" style={{ background: "rgba(19,37,29,0.06)", color: "var(--muted)" }}>
                    <Icon name={a.acao.includes("chamado") || a.acao.includes("Chamado") ? "fone" : a.acao.includes("demanda") ? "demandas" : a.acao.includes("tarefa") ? "tarefas" : a.acao.includes("Backup") ? "banco" : "escudo"} size={13} />
                  </span>
                  <div className="min-w-0 flex-1" style={{ borderBottom: "1px dashed var(--line)", paddingBottom: 8 }}>
                    <div className="text-[12px] leading-snug"><strong>{a.acao}</strong> — {a.objeto}</div>
                    <div className="text-[10.5px] mt-0.5" style={{ color: "var(--muted)" }}>{a.usuario} · {fmtHora(a.dataHora)}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-outline w-full mt-3 !py-2 text-[12px]" onClick={() => irPara("administracao")}>
              Registro de Auditoria completo <Icon name="seta-d" size={14} />
            </button>
          </div>
        </Reveal>
      </div>

      {/* Rodapé de situação */}
      <Reveal delay={60}>
        <div className="card px-5 py-4 mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          <span className="ovl">Situação geral</span>
          <span className="text-[12.5px] font-semibold flex items-center gap-2">
            Projetos em andamento <span className="font-display font-extrabold text-[15px]">{fmtNum(projetos.filter((p) => p.status === "Em Andamento").length)}</span> <StatusChip s="Em Andamento" />
          </span>
          <span className="text-[12.5px] font-semibold flex items-center gap-2">
            Chamados aguardando aprovação <span className="font-display font-extrabold text-[15px]" style={{ color: "var(--amber)" }}>{fmtNum(chamados.filter((c) => c.status === "Aguardando Aprovação").length)}</span> <StatusChip s="Aguardando Aprovação" />
          </span>
          <span className="text-[12.5px] font-semibold flex items-center gap-2">
            Tarefas bloqueadas <span className="font-display font-extrabold text-[15px]" style={{ color: "var(--red)" }}>{fmtNum(tarefas.filter((t) => t.status === "Bloqueado").length)}</span> <StatusChip s="Bloqueado" />
          </span>
          <span className="ml-auto text-[11.5px]" style={{ color: "var(--muted)" }}>Dados consolidados em tempo real · {fmtDataLonga(new Date())}</span>
        </div>
      </Reveal>

      <span className="hidden"><Scramble texto="" /></span>
    </div>
  );
}
