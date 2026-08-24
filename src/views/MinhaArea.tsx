import { useMemo, useState } from "react";
import { Avatar, Barra, Chip, Contador, Icon, PrioridadeChip, Reveal, Scramble, StatusChip, useToast } from "../components/ui";
import { STATUS_TAREFA, TOM_CSS } from "../lib/data";
import { DIAS_CURTO, MESES, diasAte, fmtData, fmtHora, fmtNum, fmtPct, mesmaData, tempoRel } from "../lib/format";
import { useApp } from "../lib/store";

function Cartao({ titulo, icone, children, acao, atraso = 0 }: { titulo: string; icone: string; children: React.ReactNode; acao?: React.ReactNode; atraso?: number }) {
  return (
    <Reveal delay={atraso} className="h-full">
      <div className="card p-5 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3 flex-none">
          <h3 className="font-display font-bold text-[15.5px] m-0 flex items-center gap-2">
            <span style={{ color: "var(--green)" }}><Icon name={icone} size={17} /></span> {titulo}
          </h3>
          {acao}
        </div>
        <div className="flex-1 min-h-0">{children}</div>
      </div>
    </Reveal>
  );
}

export default function MinhaArea() {
  const app = useApp();
  const { atual, tarefas, projetos, demandas, equipes, unidades, usuarios, eventos, notificacoes, documentos, mudarStatusDemanda, moverTarefa, marcarNotificacoesLidas } = app;
  const toast = useToast();
  const [abaTarefas, setAbaTarefas] = useState("ativas");

  const minhasTarefas = useMemo(() => tarefas.filter((t) => t.responsavelId === atual.id), [tarefas, atual.id]);
  const meusProjetos = useMemo(() => projetos.filter((p) => p.responsavelId === atual.id), [projetos, atual.id]);
  const minhasDemandas = useMemo(() => demandas.filter((d) => d.responsavelId === atual.id || d.solicitanteId === atual.id), [demandas, atual.id]);
  const minhaEquipe = equipes.find((e) => e.liderId === atual.id || e.membroIds.includes(atual.id));
  const pendencias = minhasTarefas.filter((t) => t.status !== "Concluído" && (diasAte(t.prazo) < 0 || t.status === "Aguardando"));
  const aprovacoesDemandas = demandas.filter((d) => d.status === "Em Análise" && d.responsavelId === atual.id);
  const aprovacoesDocs = documentos.filter((d) => d.status === "Em revisão");
  const bloqueadas = minhasTarefas.filter((t) => t.status === "Bloqueado");
  const meusPrazos = minhasTarefas.filter((t) => t.status !== "Concluído").sort((a, b) => +new Date(a.prazo) - +new Date(b.prazo));

  const hoje = new Date();
  const diasMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const primeiroDow = new Date(hoje.getFullYear(), hoje.getMonth(), 1).getDay();

  const unidade = unidades.find((u) => u.id === atual.unidadeId);
  const membros = minhaEquipe ? usuarios.filter((u) => minhaEquipe.membroIds.includes(u.id)) : [];

  const listaTarefas = abaTarefas === "ativas" ? minhasTarefas.filter((t) => t.status !== "Concluído") : minhasTarefas.filter((t) => t.status === "Concluído");

  return (
    <div className="space-y-5">
      {/* Cabeçalho pessoal */}
      <Reveal>
        <div className="card overflow-hidden">
          <div className="hazard h-[4px]" />
          <div className="p-6 flex flex-wrap items-center gap-5">
            <Avatar nome={atual.nome} size={64} />
            <div className="min-w-0 flex-1">
              <div className="ovl mb-1">Servidora municipal · {unidade?.sigla} ({unidade?.nome})</div>
              <h2 className="font-display font-extrabold text-[28px] leading-tight m-0 tracking-tight"><Scramble texto={atual.nome} /></h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[12.5px]" style={{ color: "var(--muted)" }}>
                <span className="flex items-center gap-1.5"><Icon name="usuario" size={14} /> {atual.cargo}</span>
                <span className="flex items-center gap-1.5"><Icon name="documentos" size={14} /> Matrícula {atual.matricula}</span>
                <span className="flex items-center gap-1.5"><Icon name="sino" size={14} /> Ramal {atual.ramal}</span>
              </div>
            </div>
            <div className="flex gap-6">
              {[
                { r: "Tarefas abertas", v: minhasTarefas.filter((t) => t.status !== "Concluído").length, c: "var(--ink)" },
                { r: "Em atraso", v: minhasTarefas.filter((t) => t.status !== "Concluído" && diasAte(t.prazo) < 0).length, c: "var(--red)" },
                { r: "Demandas comigo", v: demandas.filter((d) => d.responsavelId === atual.id && !["Concluída", "Recusada", "Cancelada"].includes(d.status)).length, c: "var(--blue)" },
              ].map((k) => (
                <div key={k.r} className="text-center">
                  <div className="font-display font-extrabold text-[30px] leading-none" style={{ color: k.c }}><Contador valor={k.v} /></div>
                  <div className="text-[10.5px] font-bold uppercase tracking-wider mt-1" style={{ color: "var(--muted)" }}>{k.r}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Grade de widgets */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Cartao titulo="Minhas Tarefas" icone="tarefas" atraso={40}
          acao={
            <div className="flex gap-1 p-0.5 rounded-md" style={{ background: "rgba(19,37,29,0.06)" }}>
              {([["ativas", "Ativas"], ["feitas", "Concluídas"]] as const).map(([k, r]) => (
                <button key={k} className="px-2.5 py-1 rounded text-[11.5px] font-bold cursor-pointer border-0" style={abaTarefas === k ? { background: "var(--card)", boxShadow: "var(--shadow-1)" } : { background: "transparent", color: "var(--muted)" }} onClick={() => setAbaTarefas(k)}>{r}</button>
              ))}
            </div>
          }
        >
          <div className="flex flex-wrap gap-1.5 mb-3">
            {STATUS_TAREFA.map((s) => {
              const qtd = minhasTarefas.filter((t) => t.status === s.label).length;
              if (qtd === 0) return null;
              return <Chip key={s.label} tom={s.tom}>{s.label}: {fmtNum(qtd)}</Chip>;
            })}
          </div>
          <ul className="space-y-2 m-0 p-0 list-none">
            {listaTarefas.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center gap-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: TOM_CSS[STATUS_TAREFA.find((s) => s.label === t.status)?.tom ?? "cinza"].fg }} />
                <span className={`flex-1 text-[12.5px] font-semibold truncate ${t.status === "Concluído" ? "line-through opacity-60" : ""}`}>{t.titulo}</span>
                <PrioridadeChip p={t.prioridade} />
              </li>
            ))}
            {listaTarefas.length === 0 && <li className="text-[12.5px]" style={{ color: "var(--muted)" }}>Nenhuma tarefa nesta visão. Bom trabalho!</li>}
          </ul>
        </Cartao>

        <Cartao titulo="Meus Projetos" icone="projetos" atraso={80}>
          <div className="space-y-4">
            {meusProjetos.map((p) => (
              <div key={p.id}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[13px] font-bold truncate">{p.nome}</span>
                  <StatusChip s={p.status} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1"><Barra valor={p.progresso} cor={p.saude === "Crítico" ? "var(--red)" : "var(--green)"} /></div>
                  <span className="text-[12px] font-bold tabular-nums">{fmtPct(p.progresso)}</span>
                  <span className="text-[11px] tabular-nums" style={{ color: "var(--muted)" }}>{fmtData(p.prazo)}</span>
                </div>
              </div>
            ))}
          </div>
        </Cartao>

        <Cartao titulo="Minhas Demandas" icone="demandas" atraso={120}>
          <ul className="space-y-2.5 m-0 p-0 list-none">
            {minhasDemandas.slice(0, 5).map((d) => (
              <li key={d.id} className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded flex-none" style={{ background: "rgba(19,37,29,0.06)", color: "var(--muted)" }}>{d.protocolo.replace("DEM-2026-", "#")}</span>
                <span className="flex-1 text-[12.5px] font-semibold truncate">{d.tipo}</span>
                <StatusChip s={d.status} />
              </li>
            ))}
          </ul>
        </Cartao>

        <Cartao titulo="Meu Calendário" icone="calendario" atraso={40}>
          <div className="text-center font-display font-bold text-[13.5px] capitalize mb-2">{MESES[hoje.getMonth()]} {hoje.getFullYear()}</div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10.5px] font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>
            {DIAS_CURTO.map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: primeiroDow }).map((_, i) => <span key={`v${i}`} />)}
            {Array.from({ length: diasMes }).map((_, i) => {
              const dia = i + 1;
              const data = new Date(hoje.getFullYear(), hoje.getMonth(), dia);
              const temEvento = eventos.some((e) => mesmaData(new Date(e.data + "T12:00:00"), data));
              const temPrazo = minhasTarefas.some((t) => mesmaData(new Date(t.prazo), data));
              const ehHoje = mesmaData(data, hoje);
              return (
                <span
                  key={dia}
                  className="relative aspect-square flex items-center justify-center rounded-md text-[11.5px] font-semibold"
                  style={ehHoje ? { background: "var(--deep)", color: "#f2b70a" } : { color: "var(--ink)" }}
                >
                  {dia}
                  {(temEvento || temPrazo) && !ehHoje && <span className="absolute bottom-[3px] w-1 h-1 rounded-full" style={{ background: temPrazo ? "var(--red)" : "var(--green)" }} />}
                </span>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-[10.5px] font-semibold" style={{ color: "var(--muted)" }}>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--green)" }} /> Evento</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--red)" }} /> Prazo de tarefa</span>
          </div>
        </Cartao>

        <Cartao titulo="Meus Prazos" icone="relogio" atraso={80}>
          <ul className="space-y-2 m-0 p-0 list-none">
            {meusPrazos.slice(0, 6).map((t) => {
              const d = diasAte(t.prazo);
              return (
                <li key={t.id} className="flex items-center gap-2.5">
                  <span className="flex-1 text-[12.5px] font-semibold truncate">{t.titulo}</span>
                  <Chip tom={d < 0 ? "vermelho" : d <= 2 ? "ambar" : "cinza"} dot={false}>
                    {d < 0 ? `Em atraso (${fmtNum(Math.abs(d))} d)` : d === 0 ? "Vence hoje" : `${fmtData(t.prazo)} · ${fmtHora(t.prazo)}`}
                  </Chip>
                </li>
              );
            })}
            {meusPrazos.length === 0 && <li className="text-[12.5px]" style={{ color: "var(--muted)" }}>Nenhum prazo pendente.</li>}
          </ul>
        </Cartao>

        <Cartao titulo="Minhas Notificações" icone="sino" atraso={120}
          acao={<button className="text-[11.5px] font-bold cursor-pointer bg-transparent border-0" style={{ color: "var(--green)" }} onClick={() => { marcarNotificacoesLidas(); toast("Notificações marcadas como lidas", "verde"); }}>Marcar lidas</button>}
        >
          <ul className="space-y-2.5 m-0 p-0 list-none">
            {notificacoes.slice(0, 5).map((n) => (
              <li key={n.id} className="flex gap-2.5">
                <span className="mt-[5px] w-2 h-2 rounded-full flex-none" style={{ background: n.lida ? "var(--line-2)" : TOM_CSS[n.tom].fg }} />
                <div className="min-w-0">
                  <div className={`text-[12.5px] leading-snug ${n.lida ? "opacity-65" : "font-bold"}`}>{n.titulo}</div>
                  <div className="text-[11px] truncate" style={{ color: "var(--muted)" }}>{n.detalhe} · {tempoRel(n.data)}</div>
                </div>
              </li>
            ))}
          </ul>
        </Cartao>

        <Cartao titulo="Pendências" icone="aviso" atraso={40}>
          {pendencias.length === 0 ? (
            <p className="text-[12.5px] m-0" style={{ color: "var(--muted)" }}>Nenhuma pendência crítica no momento.</p>
          ) : (
            <ul className="space-y-2 m-0 p-0 list-none">
              {pendencias.map((t) => (
                <li key={t.id} className="flex items-center gap-2.5 py-1 rounded-md px-2" style={{ background: diasAte(t.prazo) < 0 ? "var(--red-soft)" : "var(--amber-soft)" }}>
                  <Icon name={diasAte(t.prazo) < 0 ? "aviso" : "relogio"} size={15} className={diasAte(t.prazo) < 0 ? "text-[var(--red)]" : "text-[var(--amber)]"} />
                  <span className="flex-1 text-[12.5px] font-semibold truncate">{t.titulo}</span>
                  <span className="text-[11px] font-bold" style={{ color: diasAte(t.prazo) < 0 ? "var(--red)" : "var(--amber)" }}>
                    {diasAte(t.prazo) < 0 ? "Prazo vencido" : "Aguardando terceiro"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Cartao>

        <Cartao titulo="Aprovações Pendentes" icone="check" atraso={80}>
          <div className="space-y-3">
            {aprovacoesDemandas.map((d) => (
              <div key={d.id} className="rounded-lg p-3" style={{ border: "1px solid var(--line)", background: "rgba(242,183,10,0.05)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: "var(--muted)" }}>{d.protocolo}</span>
                  <StatusChip s={d.status} />
                </div>
                <div className="text-[12.5px] font-bold mb-2">{d.tipo}</div>
                <div className="flex gap-2">
                  <button className="btn btn-primary !py-1.5 !px-3 text-[12px] flex-1" onClick={() => { mudarStatusDemanda(d.id, "Aceita", "Aprovada na Minha Área"); toast("Demanda aprovada", "verde", d.protocolo); }}>Aprovar</button>
                  <button className="btn btn-outline !py-1.5 !px-3 text-[12px] flex-1" style={{ color: "var(--red)", borderColor: "var(--red)" }} onClick={() => { mudarStatusDemanda(d.id, "Recusada", "Recusada na Minha Área"); toast("Demanda recusada", "ambar", d.protocolo); }}>Recusar</button>
                </div>
              </div>
            ))}
            {aprovacoesDocs.map((doc) => (
              <div key={doc.id} className="rounded-lg p-3 flex items-center gap-3" style={{ border: "1px solid var(--line)" }}>
                <Icon name="documentos" size={18} className="text-[var(--green)] flex-none" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-bold truncate">{doc.nome}</div>
                  <div className="text-[11px]" style={{ color: "var(--muted)" }}>Versão {doc.versao} · aguarda revisão</div>
                </div>
                <button className="btn btn-outline !py-1.5 !px-3 text-[12px]" onClick={() => toast("Documento aprovado", "verde", `${doc.nome} — v${doc.versao}`)}>Aprovar</button>
              </div>
            ))}
            {aprovacoesDemandas.length === 0 && aprovacoesDocs.length === 0 && <p className="text-[12.5px] m-0" style={{ color: "var(--muted)" }}>Nada aguardando sua aprovação.</p>}
          </div>
        </Cartao>

        <Cartao titulo="Atividades Bloqueadas" icone="riscos" atraso={120}>
          {bloqueadas.length === 0 ? (
            <p className="text-[12.5px] m-0" style={{ color: "var(--muted)" }}>Nenhuma atividade bloqueada sob sua responsabilidade.</p>
          ) : (
            <div className="space-y-3">
              {bloqueadas.map((t) => (
                <div key={t.id} className="rounded-lg p-3" style={{ border: "1px solid var(--line)", borderLeft: "3px solid var(--red)" }}>
                  <div className="text-[12.5px] font-bold">{t.titulo}</div>
                  <div className="text-[11.5px] mt-1 flex items-start gap-1.5" style={{ color: "var(--red)" }}>
                    <Icon name="cadeado" size={13} className="mt-0.5 flex-none" /> {t.bloqueioMotivo ?? "Motivo não informado"}
                  </div>
                  <button className="btn btn-outline !py-1.5 !px-3 text-[12px] mt-2.5" onClick={() => { moverTarefa(t.id, "Em Andamento"); toast("Atividade desbloqueada", "verde", t.titulo); }}>
                    <Icon name="check" size={14} /> Desbloquear
                  </button>
                </div>
              ))}
            </div>
          )}
        </Cartao>

        <Cartao titulo="Minha Equipe" icone="equipes" atraso={60} acao={minhaEquipe ? <Chip tom="verde" dot={false}>{minhaEquipe.nome}</Chip> : undefined}>
          <div className="space-y-3">
            {membros.map((m) => {
              const carga = tarefas.filter((t) => t.responsavelId === m.id && t.status !== "Concluído").length;
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <Avatar nome={m.nome} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-bold truncate">{m.nome} {m.id === minhaEquipe?.liderId && <span className="text-[10px] font-bold uppercase tracking-wider ml-1 px-1.5 py-0.5 rounded" style={{ background: "var(--yellow-soft)", color: "var(--accent-ink)" }}>Líder</span>}</div>
                    <div className="text-[11px] truncate" style={{ color: "var(--muted)" }}>{m.cargo}</div>
                  </div>
                  <div className="w-[72px] flex-none">
                    <Barra valor={Math.min(100, carga * 16)} cor={carga > 5 ? "var(--amber)" : "var(--green)"} altura={5} />
                    <div className="text-[10px] font-bold mt-0.5 text-right" style={{ color: "var(--muted)" }}>{fmtNum(carga)} tarefas</div>
                  </div>
                </div>
              );
            })}
            {minhaEquipe && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {minhaEquipe.especialidades.map((e) => <Chip key={e} tom="cinza" dot={false}>{e}</Chip>)}
              </div>
            )}
          </div>
        </Cartao>
      </div>
    </div>
  );
}
