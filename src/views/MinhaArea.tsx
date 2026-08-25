import { useState } from "react";
import { Avatar, Chip, Icon, Reveal, Scramble, StatusChamadoChip, StatusChip, PrioridadeChip, useToast } from "../components/ui";
import { fmtData, fmtNum, saudacao, tempoRel } from "../lib/format";
import { useApp } from "../lib/store";

export default function MinhaArea({ irPara }: { irPara: (v: string) => void }) {
  const { atual, tarefas, projetos, demandas, equipes, usuarios, unidades, eventos, notificacoes, marcarNotificacoesLidas, chamados, decidirAprovacao } = useApp();
  const toast = useToast();
  const [comentarioAprov, setComentarioAprov] = useState("");

  const minhasTarefas = tarefas.filter((t) => t.responsavelId === atual.id && t.status !== "Concluído");
  const meusProjetos = projetos.filter((p) => p.responsavelId === atual.id);
  const minhasDemandas = demandas.filter((d) => d.responsavelId === atual.id && !["Concluída", "Recusada", "Cancelada"].includes(d.status));
  const minhaEquipe = equipes.find((e) => e.liderId === atual.id || e.membroIds.includes(atual.id));
  const meusChamados = chamados.filter((c) => c.solicitanteId === atual.id || c.tecnicoId === atual.id).slice(0, 5);
  const pendenciasAprovacao = chamados.filter((c) => c.status === "Aguardando Aprovação" && c.aprovacoes.some((a) => a.status === "Pendente" && a.aprovadorNome === atual.nome));
  const bloqueadas = tarefas.filter((t) => t.status === "Bloqueado");
  const prazos = tarefas
    .filter((t) => t.responsavelId === atual.id && t.status !== "Concluído")
    .sort((a, b) => a.prazo.localeCompare(b.prazo))
    .slice(0, 5);

  const nomeDe = (id: string) => usuarios.find((u) => u.id === id);
  const lotacao = unidades.find((u) => u.id === atual.unidadeId);

  const decidir = (chamadoId: string, etapaId: string, decisao: "Aprovado" | "Rejeitado") => {
    decidirAprovacao(chamadoId, etapaId, decisao, comentarioAprov || (decisao === "Aprovado" ? "Aprovado sem ressalvas." : ""));
    toast(decisao === "Aprovado" ? "Aprovação registrada" : "Solicitação rejeitada", decisao === "Aprovado" ? "verde" : "vermelho");
    setComentarioAprov("");
  };

  return (
    <div>
      {/* Cabeçalho personalizado */}
      <div className="card overflow-hidden mb-5">
        <div className="hazard h-[5px]" />
        <div className="flex flex-wrap items-center gap-4 px-6 py-5" style={{ background: "linear-gradient(120deg, rgba(30,122,84,0.08), transparent 55%)" }}>
          <Avatar nome={atual.nome} size={56} />
          <div className="flex-1 min-w-[220px]">
            <h2 className="font-display font-extrabold text-[24px] m-0 tracking-tight">
              <Scramble texto={`${saudacao()}, ${atual.nome.split(" ")[0]}!`} />
            </h2>
            <p className="text-[13px] m-0 mt-1" style={{ color: "var(--muted)" }}>
              {atual.cargo} · {lotacao?.nome} · matrícula {atual.matricula} · ramal {atual.ramal}
            </p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {[
              [fmtNum(minhasTarefas.length), "tarefas abertas", "var(--blue)"],
              [fmtNum(pendenciasAprovacao.length), "aprovações pendentes", "var(--amber)"],
              [fmtNum(meusChamados.length), "chamados recentes", "var(--cyan)"],
              [fmtNum(bloqueadas.length), "bloqueadas", "var(--red)"],
            ].map(([n, r, cor]) => (
              <div key={r} className="rounded-lg px-4 py-2.5 text-center" style={{ background: "#fff", border: "1px solid var(--line)" }}>
                <div className="font-display font-extrabold text-[20px] leading-none tabular-nums" style={{ color: cor }}>{n}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: "var(--muted)" }}>{r}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-4 items-start">
        {/* Coluna 1 */}
        <div className="space-y-4">
          <Reveal>
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="ovl">Minhas Tarefas — {fmtNum(minhasTarefas.length)}</div>
                <button className="btn btn-ghost !py-1 text-[11.5px]" onClick={() => irPara("tarefas")}>Ver todas</button>
              </div>
              <div className="space-y-2">
                {minhasTarefas.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 hover:translate-x-0.5 transition-transform" style={{ background: "rgba(19,37,29,0.035)" }}>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12.5px] font-bold truncate">{t.titulo}</span>
                      <span className="block text-[10.5px]" style={{ color: "var(--muted)" }}>Prazo {fmtData(t.prazo)}</span>
                    </span>
                    <PrioridadeChip p={t.prioridade} />
                    <StatusChip s={t.status} />
                  </div>
                ))}
                {minhasTarefas.length === 0 && <p className="text-[12px] m-0" style={{ color: "var(--muted)" }}>Nenhuma tarefa aberta. Bom trabalho!</p>}
              </div>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="ovl">Meus Chamados</div>
                <button className="btn btn-ghost !py-1 text-[11.5px]" onClick={() => irPara("central-ti")}>Central de Serviços</button>
              </div>
              <div className="space-y-2">
                {meusChamados.map((c) => (
                  <button key={c.id} className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left cursor-pointer border-0 transition-transform hover:translate-x-0.5" style={{ background: "rgba(19,37,29,0.035)" }} onClick={() => irPara("central-ti")}>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12.5px] font-bold truncate">{c.titulo}</span>
                      <span className="block text-[10.5px] tabular-nums" style={{ color: "var(--muted)" }}>{c.numero} · {tempoRel(c.criadoEm)}</span>
                    </span>
                    <StatusChamadoChip s={c.status} />
                  </button>
                ))}
                {meusChamados.length === 0 && <p className="text-[12px] m-0" style={{ color: "var(--muted)" }}>Nenhum chamado recente.</p>}
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="ovl">Meus Prazos</div>
                <button className="btn btn-ghost !py-1 text-[11.5px]" onClick={() => irPara("calendario")}>Calendário</button>
              </div>
              <div className="space-y-2">
                {prazos.map((t) => {
                  const d = new Date(t.prazo).getTime() - Date.now();
                  const dias = Math.ceil(d / 86400000);
                  return (
                    <div key={t.id} className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-extrabold text-[13px] flex-none tabular-nums"
                        style={{ background: dias < 0 ? "var(--red-soft)" : dias <= 1 ? "var(--amber-soft)" : "var(--green-soft)", color: dias < 0 ? "var(--red)" : dias <= 1 ? "var(--amber)" : "var(--green)" }}>
                        {dias < 0 ? `-${fmtNum(Math.abs(dias))}` : fmtNum(dias)}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[12px] font-bold truncate">{t.titulo}</span>
                        <span className="block text-[10.5px]" style={{ color: "var(--muted)" }}>{fmtData(t.prazo)} {dias < 0 ? "· vencido" : dias === 0 ? "· hoje" : dias === 1 ? "· amanhã" : ""}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Coluna 2 */}
        <div className="space-y-4">
          <Reveal delay={40}>
            <div className="card p-5" style={{ borderColor: pendenciasAprovacao.length > 0 ? "rgba(242,183,10,0.5)" : undefined }}>
              <div className="flex items-center justify-between mb-3">
                <div className="ovl" style={{ color: pendenciasAprovacao.length > 0 ? "var(--accent-2)" : undefined }}>
                  Aprovações Pendentes — {fmtNum(pendenciasAprovacao.length)}
                </div>
                <button className="btn btn-ghost !py-1 text-[11.5px]" onClick={() => irPara("aprovacoes")}>Gerenciar</button>
              </div>
              {pendenciasAprovacao.length === 0 ? (
                <p className="text-[12px] m-0" style={{ color: "var(--muted)" }}>Nenhuma solicitação aguardando sua decisão.</p>
              ) : (
                <div className="space-y-3">
                  {pendenciasAprovacao.map((c) => {
                    const etapa = c.aprovacoes.find((a) => a.status === "Pendente");
                    const sol = nomeDe(c.solicitanteId);
                    return (
                      <div key={c.id} className="rounded-lg p-3.5" style={{ background: "rgba(242,183,10,0.07)", border: "1px solid rgba(242,183,10,0.3)" }}>
                        <div className="flex items-center gap-2 text-[11px] mb-1">
                          <span className="font-bold tabular-nums">{c.numero}</span>
                          <Chip tom="ambar" dot={false}>{etapa?.etapaNome}</Chip>
                          <PrioridadeChip p={c.prioridade} />
                        </div>
                        <div className="text-[12.5px] font-bold">{c.titulo}</div>
                        <div className="text-[10.5px] mt-0.5 mb-2" style={{ color: "var(--muted)" }}>
                          Solicitante: {sol?.nome} ({unidades.find((u) => u.id === c.unidadeId)?.sigla}) · prazo {fmtData(c.prazoResolucao)}
                        </div>
                        <input className="input !py-1.5 !text-[11.5px] mb-2" placeholder="Observação (opcional)…" value={comentarioAprov} onChange={(e) => setComentarioAprov(e.target.value)} />
                        <div className="flex gap-1.5">
                          <button className="btn !py-1.5 flex-1 text-[11.5px]" style={{ background: "var(--green)", color: "#fff" }} onClick={() => decidir(c.id, etapa!.etapaId, "Aprovado")}>
                            <Icon name="check" size={13} /> Aprovar
                          </button>
                          <button className="btn btn-outline !py-1.5 flex-1 text-[11.5px]" style={{ color: "var(--red)", borderColor: "var(--red)" }} onClick={() => decidir(c.id, etapa!.etapaId, "Rejeitado")}>
                            <Icon name="fechar" size={13} /> Rejeitar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="ovl">Minhas Demandas</div>
                <button className="btn btn-ghost !py-1 text-[11.5px]" onClick={() => irPara("demandas")}>Demandas</button>
              </div>
              <div className="space-y-2">
                {minhasDemandas.slice(0, 4).map((d) => (
                  <div key={d.id} className="flex items-center gap-2.5">
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12.5px] font-bold truncate">{d.tipo}</span>
                      <span className="block text-[10.5px] tabular-nums" style={{ color: "var(--muted)" }}>{d.protocolo}</span>
                    </span>
                    <StatusChip s={d.status} />
                  </div>
                ))}
                {minhasDemandas.length === 0 && <p className="text-[12px] m-0" style={{ color: "var(--muted)" }}>Nenhuma demanda sob sua responsabilidade.</p>}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="card p-5">
              <div className="ovl mb-3">Meus Projetos — {fmtNum(meusProjetos.length)}</div>
              <div className="space-y-2.5">
                {meusProjetos.map((p) => (
                  <button key={p.id} className="w-full text-left cursor-pointer bg-transparent border-0 p-0 hover:translate-x-0.5 transition-transform" onClick={() => irPara("projetos")}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12.5px] font-bold truncate">{p.nome}</span>
                      <span className="text-[11.5px] font-extrabold tabular-nums">{fmtNum(p.progresso)}%</span>
                    </div>
                    <div className="rounded-full h-1.5 overflow-hidden" style={{ background: "rgba(19,37,29,0.09)" }}>
                      <div className="h-full bar-anim rounded-full" style={{ width: `${p.progresso}%`, background: p.saude === "Crítico" ? "var(--red)" : p.saude === "Em atenção" ? "var(--amber)" : "var(--green)" }} />
                    </div>
                  </button>
                ))}
                {meusProjetos.length === 0 && <p className="text-[12px] m-0" style={{ color: "var(--muted)" }}>Você não gerencia projetos no momento.</p>}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Coluna 3 */}
        <div className="space-y-4">
          <Reveal delay={60}>
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="ovl">Minhas Notificações</div>
                <button className="btn btn-ghost !py-1 text-[11.5px]" onClick={() => { marcarNotificacoesLidas(); toast("Notificações marcadas como lidas", "verde"); }}>Marcar lidas</button>
              </div>
              <div className="space-y-2">
                {notificacoes.filter((n) => !n.lida).slice(0, 4).map((n) => (
                  <div key={n.id} className="flex gap-2.5 rounded-lg px-3 py-2.5" style={{ background: "rgba(242,183,10,0.06)" }}>
                    <span className="mt-1 w-2 h-2 rounded-full flex-none" style={{ background: "var(--accent)" }} />
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-bold">{n.titulo}</div>
                      <div className="text-[11px]" style={{ color: "var(--muted)" }}>{n.detalhe}</div>
                    </div>
                  </div>
                ))}
                {notificacoes.filter((n) => !n.lida).length === 0 && <p className="text-[12px] m-0" style={{ color: "var(--muted)" }}>Caixa limpa — nada pendente.</p>}
              </div>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="card p-5">
              <div className="ovl mb-3">Pendências</div>
              <div className="space-y-2">
                {tarefas.filter((t) => t.status === "Em Revisão" && t.responsavelId === atual.id).map((t) => (
                  <div key={t.id} className="flex items-center gap-2 text-[12px]">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--cyan)" }} />
                    <span className="flex-1 truncate font-semibold">{t.titulo}</span>
                    <StatusChip s={t.status} />
                  </div>
                ))}
                {minhasDemandas.filter((d) => d.status === "Aguardando").map((d) => (
                  <div key={d.id} className="flex items-center gap-2 text-[12px]">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--amber)" }} />
                    <span className="flex-1 truncate font-semibold">{d.tipo}</span>
                    <StatusChip s={d.status} />
                  </div>
                ))}
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--red)" }} />
                  <span className="flex-1 truncate font-semibold">{fmtNum(pendenciasAprovacao.length)} aprovações aguardando decisão</span>
                  <Chip tom="ambar" dot={false}>Aprovações</Chip>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="card p-5">
              <div className="ovl mb-3">Atividades Bloqueadas — {fmtNum(bloqueadas.length)}</div>
              {bloqueadas.length === 0 ? (
                <p className="text-[12px] m-0" style={{ color: "var(--muted)" }}>Nenhuma atividade bloqueada no momento.</p>
              ) : (
                <div className="space-y-2.5">
                  {bloqueadas.map((t) => (
                    <div key={t.id} className="rounded-lg px-3.5 py-3" style={{ background: "var(--red-soft)" }}>
                      <div className="text-[12.5px] font-bold" style={{ color: "var(--red)" }}>{t.titulo}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>{t.bloqueioMotivo}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="card p-5">
              <div className="ovl mb-3">Minha Equipe {minhaEquipe ? `— ${minhaEquipe.nome}` : ""}</div>
              {minhaEquipe ? (
                <>
                  <div className="space-y-2 mb-3">
                    {minhaEquipe.membroIds.map((id) => {
                      const u = nomeDe(id);
                      if (!u) return null;
                      return (
                        <div key={id} className="flex items-center gap-2.5">
                          <Avatar nome={u.nome} size={28} />
                          <span className="flex-1 text-[12.5px] font-bold">{u.nome}</span>
                          {minhaEquipe.liderId === id && <Chip tom="verde" dot={false}>Líder</Chip>}
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: u.ativo ? "var(--green)" : "var(--grey)" }} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {minhaEquipe.especialidades.map((e) => <Chip key={e} tom="cinza" dot={false}>{e}</Chip>)}
                  </div>
                </>
              ) : <p className="text-[12px] m-0" style={{ color: "var(--muted)" }}>Você não participa de equipes no momento.</p>}
            </div>
          </Reveal>

          <Reveal delay={170}>
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="ovl">Meu Calendário — próximos</div>
                <button className="btn btn-ghost !py-1 text-[11.5px]" onClick={() => irPara("calendario")}>Abrir</button>
              </div>
              <div className="space-y-2">
                {eventos.slice(0, 4).map((e) => (
                  <div key={e.id} className="flex items-center gap-2.5 text-[12px]">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-none" style={{ background: "var(--blue-soft)", color: "var(--blue)" }}>
                      <Icon name="calendario" size={15} />
                    </span>
                    <span className="flex-1 font-bold truncate">{e.titulo}</span>
                    <span className="tabular-nums text-[11px]" style={{ color: "var(--muted)" }}>{fmtData(e.data)} {e.hora}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
