import { DragEvent, useMemo, useState } from "react";
import { Avatar, Campo, Chip, Icon, Modal, PrioridadeChip, Seletor, StatusChip, useToast } from "../components/ui";
import { CabecalhoPagina } from "../components/shell";
import { PRIORIDADES, STATUS_TAREFA, Tarefa, TOM_CSS } from "../lib/data";
import { diasAte, fmtData, fmtNum, isoRel } from "../lib/format";
import { useApp } from "../lib/store";

export default function Tarefas() {
  const { tarefas, projetos, usuarios, moverTarefa, criarTarefa } = useApp();
  const toast = useToast();
  const [busca, setBusca] = useState("");
  const [filtroResp, setFiltroResp] = useState("Todos");
  const [filtroPrio, setFiltroPrio] = useState("Todas");
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [colunaAtiva, setColunaAtiva] = useState<string | null>(null);
  const [detalhe, setDetalhe] = useState<Tarefa | null>(null);
  const [modalNova, setModalNova] = useState(false);
  const [nova, setNova] = useState({ titulo: "", descricao: "", projetoId: "", status: "A Fazer", prioridade: "Normal", responsavelId: "u1", prazo: isoRel(7).slice(0, 10), etiquetas: "" });

  const filtradas = useMemo(() => tarefas.filter((t) =>
    (filtroResp === "Todos" || t.responsavelId === filtroResp) &&
    (filtroPrio === "Todas" || t.prioridade === filtroPrio) &&
    (busca.trim() === "" || t.titulo.toLowerCase().includes(busca.trim().toLowerCase()))
  ), [tarefas, filtroResp, filtroPrio, busca]);

  const aoSoltar = (e: DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || arrastando;
    setColunaAtiva(null);
    setArrastando(null);
    if (!id) return;
    const t = tarefas.find((x) => x.id === id);
    if (!t || t.status === status) return;
    moverTarefa(id, status);
    toast("Tarefa movida", "verde", `“${t.titulo}” → ${status}`);
  };

  const salvarNova = () => {
    if (!nova.titulo.trim()) { toast("Informe o título da tarefa", "vermelho"); return; }
    criarTarefa({
      titulo: nova.titulo.trim(), descricao: nova.descricao || "—", projetoId: nova.projetoId || null, status: nova.status,
      prioridade: nova.prioridade, responsavelId: nova.responsavelId, prazo: new Date(nova.prazo + "T17:00:00").toISOString(),
      etiquetas: nova.etiquetas.split(",").map((x) => x.trim()).filter(Boolean), checklist: { feita: 0, total: 3 },
    });
    toast("Tarefa criada", "verde", nova.titulo);
    setModalNova(false);
    setNova({ ...nova, titulo: "", descricao: "", etiquetas: "" });
  };

  return (
    <div className="h-full">
      <CabecalhoPagina
        titulo="Tarefas"
        subtitulo={`Quadro com ${fmtNum(tarefas.filter((t) => t.status !== "Concluído").length)} tarefas em aberto · arraste os cartões entre as colunas`}
        acoes={<button className="btn btn-accent" onClick={() => setModalNova(true)}><Icon name="mais" size={16} /> Nova Tarefa</button>}
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Icon name="busca" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input className="input pl-9 w-[230px]" placeholder="Pesquisar tarefa…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <select className="select !w-[190px]" value={filtroResp} onChange={(e) => setFiltroResp(e.target.value)} aria-label="Filtrar por responsável">
          <option value="Todos">Todos os responsáveis</option>
          {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
        </select>
        <select className="select !w-[160px]" value={filtroPrio} onChange={(e) => setFiltroPrio(e.target.value)} aria-label="Filtrar por prioridade">
          <option value="Todas">Todas as prioridades</option>
          {PRIORIDADES.map((p) => <option key={p.label}>{p.label}</option>)}
        </select>
        {(busca || filtroResp !== "Todos" || filtroPrio !== "Todas") && (
          <button className="btn btn-ghost text-[12px]" onClick={() => { setBusca(""); setFiltroResp("Todos"); setFiltroPrio("Todas"); }}>
            <Icon name="fechar" size={13} /> Limpar filtros
          </button>
        )}
      </div>

      <div className="flex gap-3.5 overflow-x-auto pb-4 -mx-1 px-1" style={{ minHeight: 420 }}>
        {STATUS_TAREFA.map((col) => {
          const itens = filtradas.filter((t) => t.status === col.label);
          return (
            <section
              key={col.label}
              className={`flex-none w-[272px] rounded-xl flex flex-col max-h-[calc(100vh-270px)] transition-colors ${colunaAtiva === col.label ? "drag-over" : ""}`}
              style={{ background: "rgba(19,37,29,0.045)", border: "1px solid var(--line)" }}
              onDragOver={(e) => { e.preventDefault(); setColunaAtiva(col.label); }}
              onDragLeave={() => setColunaAtiva((c) => (c === col.label ? null : c))}
              onDrop={(e) => aoSoltar(e, col.label)}
              aria-label={`Coluna ${col.label}`}
            >
              <header className="flex items-center gap-2 px-3.5 pt-3 pb-2 flex-none">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: col.hex }} />
                <h3 className="font-display font-bold text-[13.5px] m-0">{col.label}</h3>
                <span className="ml-auto text-[11px] font-bold rounded-full px-2 py-0.5" style={{ background: "var(--card)", color: "var(--muted)", border: "1px solid var(--line)" }}>{fmtNum(itens.length)}</span>
              </header>
              <div className="flex-1 overflow-y-auto px-2.5 pb-2.5 space-y-2">
                {itens.map((t) => {
                  const resp = usuarios.find((u) => u.id === t.responsavelId);
                  const proj = projetos.find((p) => p.id === t.projetoId);
                  const d = diasAte(t.prazo);
                  return (
                    <article
                      key={t.id}
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData("text/plain", t.id); setArrastando(t.id); }}
                      onDragEnd={() => { setArrastando(null); setColunaAtiva(null); }}
                      onClick={() => setDetalhe(t)}
                      className={`card card-hover p-3 cursor-grab active:cursor-grabbing ${arrastando === t.id ? "dragging" : ""}`}
                      style={{ borderLeft: `3px solid ${PRIORIDADES.find((p) => p.label === t.prioridade)?.hex ?? "var(--line-2)"}` }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 opacity-35"><Icon name="arrastar" size={14} /></span>
                        <h4 className="text-[12.5px] font-bold leading-snug m-0 flex-1">{t.titulo}</h4>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {proj && <Chip tom="azul" dot={false}>{proj.codigo.replace("PRJ-2026-", "P").replace("PRJ-2025-", "P")}</Chip>}
                        {t.etiquetas.map((e) => <Chip key={e} tom="cinza" dot={false}>{e}</Chip>)}
                        {t.status === "Bloqueado" && <Chip tom="vermelho" dot={false}>Bloqueio</Chip>}
                      </div>
                      <div className="flex items-center gap-2 mt-2.5">
                        <Avatar nome={resp?.nome ?? "?"} size={22} />
                        <span className="text-[11px] font-semibold truncate" style={{ color: "var(--muted)" }}>{resp?.nome.split(" ")[0]}</span>
                        <span className="ml-auto flex items-center gap-1 text-[10.5px] font-bold tabular-nums px-1.5 py-0.5 rounded" style={{ background: d < 0 && t.status !== "Concluído" ? "var(--red-soft)" : "transparent", color: d < 0 && t.status !== "Concluído" ? "var(--red)" : "var(--muted)" }}>
                          <Icon name="relogio" size={11} /> {fmtData(t.prazo)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-[4px] rounded-full overflow-hidden" style={{ background: "rgba(19,37,29,0.09)" }}>
                          <div className="h-full rounded-full" style={{ width: `${(t.checklist.feita / t.checklist.total) * 100}%`, background: t.checklist.feita === t.checklist.total ? "var(--green)" : "var(--accent-2)" }} />
                        </div>
                        <span className="text-[10.5px] font-bold tabular-nums" style={{ color: "var(--muted)" }}>{t.checklist.feita}/{t.checklist.total}</span>
                      </div>
                    </article>
                  );
                })}
                {itens.length === 0 && (
                  <div className="rounded-lg border border-dashed px-3 py-6 text-center text-[11.5px]" style={{ borderColor: "var(--line-2)", color: "var(--muted)" }}>
                    Arraste tarefas para cá
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Detalhe da tarefa */}
      <Modal aberto={!!detalhe} onFechar={() => setDetalhe(null)} titulo="Detalhe da Tarefa"
        rodape={<button className="btn btn-primary" onClick={() => setDetalhe(null)}>Fechar</button>}
      >
        {detalhe && (() => {
          const t = tarefas.find((x) => x.id === detalhe.id) ?? detalhe;
          const resp = usuarios.find((u) => u.id === t.responsavelId);
          const proj = projetos.find((p) => p.id === t.projetoId);
          return (
            <div className="space-y-4">
              <div>
                <h4 className="font-display font-bold text-[17px] m-0 mb-1.5">{t.titulo}</h4>
                <p className="text-[13px] m-0" style={{ color: "var(--muted)" }}>{t.descricao}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusChip s={t.status} />
                <PrioridadeChip p={t.prioridade} />
                {proj && <Chip tom="azul" dot={false}>{proj.nome}</Chip>}
                <Chip tom={diasAte(t.prazo) < 0 ? "vermelho" : "cinza"} dot={false}>Prazo: {fmtData(t.prazo)}</Chip>
              </div>
              {t.bloqueioMotivo && (
                <div className="rounded-lg px-3.5 py-3 text-[12.5px] flex gap-2" style={{ background: "var(--red-soft)", color: "var(--red)" }}>
                  <Icon name="cadeado" size={15} className="mt-0.5 flex-none" /> <span><strong>Bloqueio:</strong> {t.bloqueioMotivo}</span>
                </div>
              )}
              <div className="flex items-center gap-3 rounded-lg px-3.5 py-3" style={{ background: "rgba(19,37,29,0.04)" }}>
                <Avatar nome={resp?.nome ?? "?"} size={34} />
                <div className="flex-1">
                  <div className="text-[13px] font-bold">{resp?.nome}</div>
                  <div className="text-[11.5px]" style={{ color: "var(--muted)" }}>{resp?.cargo}</div>
                </div>
              </div>
              <Campo rotulo="Alterar status">
                <select
                  className="select" value={t.status}
                  onChange={(e) => { moverTarefa(t.id, e.target.value); toast("Status atualizado", "verde", `${t.titulo} → ${e.target.value}`); }}
                >
                  {STATUS_TAREFA.map((s) => <option key={s.label}>{s.label}</option>)}
                </select>
              </Campo>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="label !mb-0">Checklist</span>
                  <span className="text-[11.5px] font-bold tabular-nums" style={{ color: "var(--muted)" }}>{t.checklist.feita} de {t.checklist.total} itens</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(19,37,29,0.09)" }}>
                  <div className="h-full rounded-full" style={{ width: `${(t.checklist.feita / t.checklist.total) * 100}%`, background: TOM_CSS[STATUS_TAREFA.find((s) => s.label === t.status)?.tom ?? "cinza"].fg }} />
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Nova tarefa */}
      <Modal aberto={modalNova} onFechar={() => setModalNova(false)} titulo="Nova Tarefa" largo
        rodape={
          <>
            <button className="btn btn-outline" onClick={() => setModalNova(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={salvarNova}><Icon name="check" size={15} /> Criar tarefa</button>
          </>
        }
      >
        <div className="space-y-4">
          <Campo rotulo="Título" obrigatorio>
            <input className="input" placeholder="ex.: Atualizar certificados SSL dos portais" value={nova.titulo} onChange={(e) => setNova({ ...nova, titulo: e.target.value })} />
          </Campo>
          <Campo rotulo="Descrição">
            <textarea className="textarea" rows={2} placeholder="Detalhes da atividade…" value={nova.descricao} onChange={(e) => setNova({ ...nova, descricao: e.target.value })} />
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Seletor rotulo="Projeto vinculado" valor={nova.projetoId} onChange={(v) => setNova({ ...nova, projetoId: v })}
              opcoes={[{ valor: "", rotulo: "Sem vínculo" }, ...projetos.map((p) => ({ valor: p.id, rotulo: p.nome }))]} />
            <Seletor rotulo="Responsável" obrigatorio valor={nova.responsavelId} onChange={(v) => setNova({ ...nova, responsavelId: v })}
              opcoes={usuarios.filter((u) => u.ativo).map((u) => ({ valor: u.id, rotulo: u.nome }))} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Seletor rotulo="Status" valor={nova.status} onChange={(v) => setNova({ ...nova, status: v })} opcoes={STATUS_TAREFA.map((s) => s.label)} />
            <Seletor rotulo="Prioridade" valor={nova.prioridade} onChange={(v) => setNova({ ...nova, prioridade: v })} opcoes={PRIORIDADES.map((p) => p.label)} />
            <Campo rotulo="Prazo" obrigatorio>
              <input className="input" type="date" value={nova.prazo} onChange={(e) => setNova({ ...nova, prazo: e.target.value })} />
            </Campo>
          </div>
          <Campo rotulo="Etiquetas (separadas por vírgula)">
            <input className="input" placeholder="ex.: Redes, Urgente, Saúde" value={nova.etiquetas} onChange={(e) => setNova({ ...nova, etiquetas: e.target.value })} />
          </Campo>
        </div>
      </Modal>
    </div>
  );
}
