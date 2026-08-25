import { useMemo, useState } from "react";
import { Avatar, Barra, Campo, Chip, Confirmacao, Icon, Modal, PainelLateral, Seletor, Tom, useToast } from "../components/ui";
import { CabecalhoPagina } from "../components/shell";
import { Equipe, PAPEIS_EQUIPE, TIPOS_EQUIPE, Unidade } from "../lib/data";
import { fmtNum, tempoRel } from "../lib/format";
import { useApp } from "../lib/store";

/* ===================== EQUIPES ===================== */

export function Equipes() {
  const { equipes, unidades, usuarios, projetos, tarefas, chamados, criarEquipe, atualizarEquipe, adicionarMembroEquipe, removerMembroEquipe, temPermissao } = useApp();
  const toast = useToast();
  const [sel, setSel] = useState<Equipe | null>(null);
  const [modalNova, setModalNova] = useState(false);
  const [modalAdd, setModalAdd] = useState(false);
  const [buscaAdd, setBuscaAdd] = useState("");
  const [papelAdd, setPapelAdd] = useState("Membro");
  const [confirmaRemocao, setConfirmaRemocao] = useState<string | null>(null);
  const [nova, setNova] = useState({ nome: "", sigla: "", descricao: "", unidadeId: "un11", tipo: "TI", liderId: "u1", liderSubstitutoId: "" });

  const equipeAtual = sel ? equipes.find((e) => e.id === sel.id) ?? null : null;
  const unDe = (id: string) => unidades.find((u) => u.id === id);
  const nomeDe = (id: string | null | undefined) => usuarios.find((u) => u.id === id);
  const podeGerir = temPermissao("team.edit") || temPermissao("team.members.manage") || temPermissao("team.create");

  const resultadosBusca = useMemo(() => {
    const q = buscaAdd.trim().toLowerCase();
    return usuarios.filter((u) => u.ativo && (q === "" || `${u.nome} ${u.matricula} ${u.usuario} ${u.cargo}`.toLowerCase().includes(q)))
      .filter((u) => !equipeAtual?.membroIds.includes(u.id))
      .slice(0, 8);
  }, [buscaAdd, usuarios, equipeAtual]);

  const salvarNova = () => {
    if (!nova.nome.trim()) { toast("Informe o nome da equipe", "vermelho"); return; }
    criarEquipe({
      nome: nova.nome.trim(), sigla: nova.sigla || nova.nome.slice(0, 3).toUpperCase(), descricao: nova.descricao,
      unidadeId: nova.unidadeId, liderId: nova.liderId, liderSubstitutoId: nova.liderSubstitutoId || undefined,
      membroIds: [nova.liderId], especialidades: [], tipo: nova.tipo,
      papeis: { [nova.liderId]: "Responsável" }, ativa: true,
    });
    toast("Equipe criada", "verde", nova.nome);
    setModalNova(false);
    setNova({ nome: "", sigla: "", descricao: "", unidadeId: "un11", tipo: "TI", liderId: "u1", liderSubstitutoId: "" });
  };

  return (
    <div>
      <CabecalhoPagina
        titulo="Equipes"
        subtitulo={`${fmtNum(equipes.filter((e) => e.ativa !== false).length)} equipes ativas · servidores podem participar de múltiplas equipes com papéis distintos`}
        acoes={podeGerir ? <button className="btn btn-accent" onClick={() => setModalNova(true)}><Icon name="mais" size={16} /> Nova Equipe</button> : undefined}
      />
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {equipes.map((e) => {
          const projetosEq = projetos.filter((p) => p.equipeId === e.id).length;
          const tarefasEq = tarefas.filter((t) => e.membroIds.includes(t.responsavelId) && t.status !== "Concluído").length;
          return (
            <button key={e.id} className="card card-hover p-5 text-left cursor-pointer block" style={{ opacity: e.ativa === false ? 0.6 : 1 }} onClick={() => setSel(e)}>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-extrabold text-[13px]" style={{ background: "var(--deep)", color: "var(--accent)" }}>{e.sigla ?? e.nome.slice(0, 3).toUpperCase()}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold truncate">{e.nome}</div>
                  <div className="text-[11px]" style={{ color: "var(--muted)" }}>{unDe(e.unidadeId)?.nome}</div>
                </div>
                <Chip tom={e.ativa === false ? "cinza" : "verde"} dot={false}>{e.ativa === false ? "Inativa" : e.tipo ?? "Ativa"}</Chip>
              </div>
              {e.descricao && <p className="text-[11.5px] mt-1 mb-3 leading-snug" style={{ color: "var(--muted)" }}>{e.descricao}</p>}
              <div className="flex items-center justify-between mt-2">
                <div className="flex -space-x-2">
                  {e.membroIds.slice(0, 5).map((id) => <Avatar key={id} nome={nomeDe(id)?.nome ?? "?"} size={28} titulo={nomeDe(id)?.nome} />)}
                  {e.membroIds.length > 5 && <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold" style={{ background: "var(--grey-soft)", color: "var(--grey)", border: "2px solid var(--card)" }}>+{e.membroIds.length - 5}</span>}
                </div>
                <div className="text-[10.5px] text-right" style={{ color: "var(--muted)" }}>
                  <div><strong style={{ color: "var(--ink)" }}>{fmtNum(projetosEq)}</strong> projetos</div>
                  <div><strong style={{ color: "var(--ink)" }}>{fmtNum(tarefasEq)}</strong> tarefas abertas</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Página da equipe */}
      <PainelLateral aberto={!!equipeAtual} onFechar={() => setSel(null)}
        titulo={equipeAtual ? <span className="flex items-center gap-2">{equipeAtual.nome} <Chip tom="cinza" dot={false}>{equipeAtual.sigla}</Chip></span> : ""}
        rodape={equipeAtual && podeGerir ? (
          <>
            <button className="btn btn-outline flex-1" onClick={() => { setModalAdd(true); setBuscaAdd(""); }}><Icon name="mais" size={15} /> Adicionar Colaborador</button>
            <button className="btn btn-outline flex-1" style={{ color: equipeAtual.ativa === false ? "var(--green)" : "var(--red)", borderColor: equipeAtual.ativa === false ? "var(--green)" : "var(--red)" }}
              onClick={() => { atualizarEquipe(equipeAtual.id, { ativa: equipeAtual.ativa === false }); toast(equipeAtual.ativa === false ? "Equipe reativada" : "Equipe desativada", equipeAtual.ativa === false ? "verde" : "ambar", equipeAtual.nome); }}>
              {equipeAtual.ativa === false ? "Reativar Equipe" : "Desativar Equipe"}
            </button>
          </>
        ) : undefined}>
        {equipeAtual && (() => {
          const projs = projetos.filter((p) => p.equipeId === equipeAtual.id);
          const tafs = tarefas.filter((t) => equipeAtual.membroIds.includes(t.responsavelId));
          const chs = chamados.filter((c) => c.tecnicoId && equipeAtual.membroIds.includes(c.tecnicoId) && !["Fechado", "Cancelado"].includes(c.status));
          const cargaMax = Math.max(1, ...equipeAtual.membroIds.map((id) => tafs.filter((t) => t.responsavelId === id && t.status !== "Concluído").length));
          return (
            <div className="space-y-5">
              <div className="rounded-lg p-4" style={{ background: "rgba(19,37,29,0.04)" }}>
                {equipeAtual.descricao && <p className="text-[12.5px] mt-0 mb-2 leading-relaxed" style={{ color: "var(--muted)" }}>{equipeAtual.descricao}</p>}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
                  <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Unidade</span><strong>{unDe(equipeAtual.unidadeId)?.sigla}</strong></div>
                  <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Tipo</span><strong>{equipeAtual.tipo ?? "—"}</strong></div>
                  <div className="flex justify-between gap-2"><span style={{ color: "var(--muted)" }}>Responsável</span><strong className="text-right">{nomeDe(equipeAtual.liderId)?.nome}</strong></div>
                  <div className="flex justify-between gap-2"><span style={{ color: "var(--muted)" }}>Substituto</span><strong className="text-right">{equipeAtual.liderSubstitutoId ? nomeDe(equipeAtual.liderSubstitutoId)?.nome : "—"}</strong></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="ovl">Membros — {fmtNum(equipeAtual.membroIds.length)}</div>
                  {podeGerir && <button className="btn btn-outline !py-1 text-[11.5px]" onClick={() => { setModalAdd(true); setBuscaAdd(""); }}><Icon name="mais" size={12} /> Adicionar</button>}
                </div>
                <div className="space-y-2">
                  {equipeAtual.membroIds.map((id) => {
                    const u = nomeDe(id);
                    const papel = equipeAtual.papeis?.[id] ?? (id === equipeAtual.liderId ? "Responsável" : "Membro");
                    const nTarefas = tafs.filter((t) => t.responsavelId === id && t.status !== "Concluído").length;
                    return (
                      <div key={id} className="rounded-lg px-3.5 py-3" style={{ background: "rgba(19,37,29,0.035)" }}>
                        <div className="flex items-center gap-2.5">
                          <Avatar nome={u?.nome ?? "?"} size={30} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[12.5px] font-bold truncate">{u?.nome}</div>
                            <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{u?.cargo} · {u?.matricula}</div>
                          </div>
                          {podeGerir ? (
                            <select className="select !py-1 !text-[11px] !w-[120px]" value={papel}
                              onChange={(e) => { atualizarEquipe(equipeAtual.id, { papeis: { ...(equipeAtual.papeis ?? {}), [id]: e.target.value } }); toast("Papel alterado", "verde", `${u?.nome}: ${e.target.value}`); }}>
                              {PAPEIS_EQUIPE.map((p) => <option key={p}>{p}</option>)}
                            </select>
                          ) : <Chip tom="cinza" dot={false}>{papel}</Chip>}
                          {id === equipeAtual.liderId && <Chip tom="verde" dot={false}>Líder</Chip>}
                          {podeGerir && <button className="icon-btn !w-7 !h-7" style={{ color: "var(--red)" }} onClick={() => setConfirmaRemocao(id)} aria-label="Remover"><Icon name="excluir" size={14} /></button>}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider flex-none" style={{ color: "var(--muted)" }}>Carga</span>
                          <div className="flex-1"><Barra valor={(nTarefas / cargaMax) * 100} cor={nTarefas / cargaMax > 0.8 ? "var(--red)" : nTarefas / cargaMax > 0.5 ? "var(--amber)" : "var(--green)"} altura={5} /></div>
                          <span className="text-[11px] font-extrabold tabular-nums">{fmtNum(nTarefas)} tarefas</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="ovl mb-2.5">Projetos da equipe — {fmtNum(projs.length)}</div>
                {projs.length === 0 && <p className="text-[12px]" style={{ color: "var(--muted)" }}>Nenhum projeto vinculado.</p>}
                {projs.map((p) => (
                  <div key={p.id} className="flex items-center gap-2.5 py-1.5 text-[12.5px]">
                    <span className="font-bold">{p.codigo}</span>
                    <span className="flex-1 truncate" style={{ color: "var(--muted)" }}>{p.nome}</span>
                    <span className="font-extrabold tabular-nums">{fmtNum(p.progresso)}%</span>
                  </div>
                ))}
              </div>

              <div>
                <div className="ovl mb-2.5">Chamados atendidos (ativos) — {fmtNum(chs.length)}</div>
                {chs.length === 0 && <p className="text-[12px]" style={{ color: "var(--muted)" }}>Nenhum chamado ativo com técnicos da equipe.</p>}
                {chs.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center gap-2.5 py-1.5 text-[12px]">
                    <span className="font-bold tabular-nums">{c.numero}</span>
                    <span className="flex-1 truncate" style={{ color: "var(--muted)" }}>{c.titulo}</span>
                    <Chip tom={c.status === "Em Atendimento" ? "azul" : "ambar"} dot={false}>{c.status}</Chip>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </PainelLateral>

      {/* Nova equipe */}
      <Modal aberto={modalNova} onFechar={() => setModalNova(false)} titulo="Nova Equipe" largo
        rodape={<><button className="btn btn-outline" onClick={() => setModalNova(false)}>Cancelar</button><button className="btn btn-accent" onClick={salvarNova}><Icon name="check" size={15} /> Criar equipe</button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_110px] gap-4">
            <Campo rotulo="Nome da equipe" obrigatorio><input className="input" value={nova.nome} onChange={(e) => setNova({ ...nova, nome: e.target.value })} placeholder="ex.: Equipe de Segurança da Informação" /></Campo>
            <Campo rotulo="Sigla"><input className="input" value={nova.sigla} onChange={(e) => setNova({ ...nova, sigla: e.target.value })} placeholder="ESI" /></Campo>
          </div>
          <Campo rotulo="Descrição"><textarea className="textarea" rows={2} value={nova.descricao} onChange={(e) => setNova({ ...nova, descricao: e.target.value })} /></Campo>
          <div className="grid grid-cols-2 gap-4">
            <Seletor rotulo="Unidade administrativa" obrigatorio valor={nova.unidadeId} onChange={(v) => setNova({ ...nova, unidadeId: v })}
              opcoes={unidades.filter((u) => u.id !== "un0").map((u) => ({ valor: u.id, rotulo: `${u.sigla} — ${u.nome}` }))} />
            <Seletor rotulo="Tipo da equipe" valor={nova.tipo} onChange={(v) => setNova({ ...nova, tipo: v })} opcoes={TIPOS_EQUIPE} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Seletor rotulo="Responsável pela equipe" obrigatorio valor={nova.liderId} onChange={(v) => setNova({ ...nova, liderId: v })}
              opcoes={usuarios.filter((u) => u.ativo).map((u) => ({ valor: u.id, rotulo: u.nome }))} />
            <Seletor rotulo="Responsável substituto" valor={nova.liderSubstitutoId} onChange={(v) => setNova({ ...nova, liderSubstitutoId: v })}
              opcoes={[{ valor: "", rotulo: "Não definido" }, ...usuarios.filter((u) => u.ativo && u.id !== nova.liderId).map((u) => ({ valor: u.id, rotulo: u.nome }))]} />
          </div>
        </div>
      </Modal>

      {/* Adicionar colaborador */}
      <Modal aberto={modalAdd} onFechar={() => setModalAdd(false)} titulo={`Adicionar Colaborador — ${equipeAtual?.nome ?? ""}`} largo
        rodape={<button className="btn btn-outline" onClick={() => setModalAdd(false)}>Fechar</button>}>
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_170px] gap-3">
            <div className="relative">
              <Icon name="busca" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input className="input pl-9" placeholder="Pesquisar por nome, matrícula, usuário ou cargo…" value={buscaAdd} onChange={(e) => setBuscaAdd(e.target.value)} />
            </div>
            <Seletor rotulo="" valor={papelAdd} onChange={setPapelAdd} opcoes={PAPEIS_EQUIPE} />
          </div>
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
            {resultadosBusca.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-lg px-3.5 py-2.5" style={{ background: "rgba(19,37,29,0.035)" }}>
                <Avatar nome={u.nome} size={30} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-bold truncate">{u.nome} <span className="font-normal text-[10.5px]" style={{ color: "var(--muted)" }}>· {u.matricula}</span></div>
                  <div className="text-[10.5px] truncate" style={{ color: "var(--muted)" }}>{u.cargo} · {unDe(u.unidadeId)?.sigla}</div>
                </div>
                <button className="btn btn-primary !py-1.5 text-[11.5px]" onClick={() => {
                  if (equipeAtual) { adicionarMembroEquipe(equipeAtual.id, u.id, papelAdd); toast("Colaborador adicionado", "verde", `${u.nome} → ${equipeAtual.nome} (${papelAdd})`); }
                }}><Icon name="mais" size={13} /> Adicionar</button>
              </div>
            ))}
            {resultadosBusca.length === 0 && <p className="text-[12px] text-center py-4" style={{ color: "var(--muted)" }}>Nenhum servidor encontrado (membros atuais já listados).</p>}
          </div>
        </div>
      </Modal>

      <Confirmacao
        aberto={!!confirmaRemocao}
        titulo="Remover colaborador da equipe"
        mensagem={`Remover ${nomeDe(confirmaRemocao)?.nome ?? ""} da equipe ${equipeAtual?.nome ?? ""}? O histórico de atividades do servidor é preservado.`}
        perigoso
        onCancelar={() => setConfirmaRemocao(null)}
        onConfirmar={() => {
          if (equipeAtual && confirmaRemocao) { removerMembroEquipe(equipeAtual.id, confirmaRemocao); toast("Colaborador removido", "ambar", nomeDe(confirmaRemocao)?.nome); }
          setConfirmaRemocao(null);
        }}
      />
    </div>
  );
}

/* ===================== ORGANOGRAMA (editável) ===================== */

const tomTipo = (tipo: string): Tom => (tipo === "Órgão" ? "ambar" : tipo === "Secretaria" ? "verde" : tipo === "Departamento" ? "azul" : tipo === "Divisão" ? "ciano" : "cinza");

export function Organograma() {
  const { unidades, usuarios, equipes, projetos, coberturas, criarUnidade, atualizarUnidade, moverUnidade, temPermissao, tiposUnidade } = useApp();
  const toast = useToast();
  const [selId, setSelId] = useState<string | null>("un0");
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set(["un0", "un1", "un11"]));
  const [modalNova, setModalNova] = useState<string | null>(null); // parentId
  const [modalEditar, setModalEditar] = useState<Unidade | null>(null);
  const [modalMover, setModalMover] = useState<Unidade | null>(null);
  const [novoPai, setNovoPai] = useState("un0");
  const [confirmouImpacto, setConfirmouImpacto] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", sigla: "", tipo: "Setor", responsavelId: "" });

  const podeEditar = temPermissao("organizationChart.manage") || temPermissao("system.configure");
  const unDe = (id: string | null | undefined) => unidades.find((u) => u.id === id);
  const nomeDe = (id: string | null | undefined) => usuarios.find((u) => u.id === id);
  const sel = unDe(selId);

  const filhos = (id: string) => unidades.filter((u) => u.parentId === id);
  const descendentes = (id: string): string[] => filhos(id).flatMap((f) => [f.id, ...descendentes(f.id)]);

  const impacto = useMemo(() => {
    if (!modalMover) return null;
    const subtree = [modalMover.id, ...descendentes(modalMover.id)]; // eslint-disable-line react-hooks/exhaustive-deps
    return {
      usuarios: usuarios.filter((u) => subtree.includes(u.unidadeId)).length,
      equipes: equipes.filter((e) => subtree.includes(e.unidadeId)).length,
      projetos: projetos.filter((p) => subtree.includes(p.unidadeId)).length,
      coberturas: coberturas.filter((c) => subtree.includes(c.unidadeId)).length,
    };
  }, [modalMover, unidades, usuarios, equipes, projetos, coberturas]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExp = (id: string) => {
    setExpandidos((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const salvarNova = () => {
    if (!form.nome.trim() || !modalNova) { toast("Informe o nome da unidade", "vermelho"); return; }
    criarUnidade({ nome: form.nome.trim(), sigla: form.sigla || form.nome.slice(0, 4).toUpperCase(), tipo: form.tipo, parentId: modalNova, responsavelId: form.responsavelId || undefined, ativa: true });
    toast("Unidade criada", "verde", `${form.nome} vinculada a ${unDe(modalNova)?.nome}`);
    setModalNova(null); setForm({ nome: "", sigla: "", tipo: "Setor", responsavelId: "" });
  };

  const aplicarMover = () => {
    if (!modalMover) return;
    const ok = moverUnidade(modalMover.id, novoPai);
    if (!ok) { toast("Vínculo inválido", "vermelho", "Referência circular ou unidade inexistente — a alteração foi bloqueada."); return; }
    toast("Vínculo hierárquico alterado", "verde", `${modalMover.nome} → ${unDe(novoPai)?.nome}`);
    setModalMover(null); setConfirmouImpacto(false);
  };

  const renderArvore = (id: string, nivel: number): React.ReactNode => {
    const u = unDe(id);
    if (!u) return null;
    const kids = filhos(id);
    const exp = expandidos.has(id);
    const selecionado = selId === id;
    const inativa = u.ativa === false;
    return (
      <div key={id}>
        <div
          className={`flex items-center gap-2 rounded-lg pl-2 pr-3 py-2 cursor-pointer transition-all border group ${selecionado ? "" : "hover:border-[var(--line-2)]"}`}
          style={{
            marginLeft: nivel * 22,
            background: selecionado ? "var(--green-soft)" : "transparent",
            borderColor: selecionado ? "var(--green)" : "transparent",
            opacity: inativa ? 0.5 : 1,
          }}
          onClick={() => setSelId(id)}
          draggable={podeEditar && id !== "un0"}
          onDragStart={() => setDragId(id)}
          onDragOver={(e) => { if (podeEditar) e.preventDefault(); }}
          onDrop={() => {
            if (!podeEditar || !dragId || dragId === id) return;
            const mov = unDe(dragId);
            if (mov) { setModalMover(mov); setNovoPai(id); setConfirmouImpacto(false); }
            setDragId(null);
          }}
        >
          {kids.length > 0 ? (
            <button className="icon-btn !w-6 !h-6 flex-none" onClick={(e) => { e.stopPropagation(); toggleExp(id); }} aria-label={exp ? "Recolher" : "Expandir"}>
              <Icon name={exp ? "chevron-b" : "chevron-d"} size={13} />
            </button>
          ) : <span className="w-6 flex-none" />}
          <span className="w-2.5 h-2.5 rounded-sm flex-none" style={{ background: inativa ? "var(--grey)" : undefined }} />
          <Chip tom={tomTipo(u.tipo)} dot={false}>{u.tipo}</Chip>
          <span className="text-[13px] font-bold truncate">{u.nome}</span>
          <span className="text-[10.5px] tabular-nums flex-none" style={{ color: "var(--muted)" }}>{u.sigla}</span>
          {inativa && <Chip tom="cinza" dot={false}>Inativa</Chip>}
          {u.temEquipePropria && <span title="Possui equipe própria de TI" style={{ color: "var(--green)" }}><Icon name="escudo" size={13} /></span>}
          {podeEditar && id !== "un0" && (
            <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 flex-none" style={{ color: "var(--muted)" }}>
              <Icon name="arrastar" size={14} />
            </span>
          )}
        </div>
        {exp && kids.map((k) => renderArvore(k.id, nivel + 1))}
      </div>
    );
  };

  return (
    <div>
      <CabecalhoPagina
        titulo="Organograma"
        subtitulo="Estrutura administrativa dinâmica — profundidade ilimitada, tipos configuráveis e edição visual com auditoria."
        acoes={podeEditar ? (
          <>
            <button className="btn btn-outline" onClick={() => setModalMover(sel && sel.id !== "un0" ? sel : null)} disabled={!sel || sel.id === "un0"}><Icon name="seta-d" size={15} /> Mover Unidade</button>
            <button className="btn btn-accent" onClick={() => { setModalNova(selId ?? "un0"); setForm({ nome: "", sigla: "", tipo: "Setor", responsavelId: "" }); }}><Icon name="mais" size={16} /> Nova Unidade Abaixo</button>
          </>
        ) : <Chip tom="cinza" dot={false}>Somente leitura — seu perfil não gerencia a estrutura</Chip>}
      />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 items-start">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Icon name="organograma" size={17} className="opacity-60" />
            <span className="text-[12px] font-bold" style={{ color: "var(--muted)" }}>
              Clique para selecionar · {podeEditar ? "arraste uma unidade sobre outra para alterar o vínculo hierárquico" : "estrutura em modo consulta"}
            </span>
          </div>
          {renderArvore("un0", 0)}
        </div>

        {sel ? (
          <div className="card p-5 lg:sticky lg:top-[76px]">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Chip tom={tomTipo(sel.tipo)} dot={false}>{sel.tipo}</Chip>
                  <Chip tom={sel.ativa === false ? "cinza" : "verde"} dot={false}>{sel.ativa === false ? "Inativa" : "Ativa"}</Chip>
                  {sel.temEquipePropria && <Chip tom="pinho" dot={false}>Equipe própria de TI</Chip>}
                </div>
                <h3 className="font-display font-extrabold text-[19px] m-0 leading-tight">{sel.nome}</h3>
                <div className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>{sel.sigla} · vinculada a {unDe(sel.parentId)?.nome ?? "—"} (raiz)</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 text-[12px]">
              {[
                ["Responsável", nomeDe(sel.responsavelId)?.nome ?? "—"],
                ["Ramal", sel.ramal ?? "—"],
                ["Servidores", fmtNum(usuarios.filter((u) => u.unidadeId === sel.id || descendentes(sel.id).includes(u.unidadeId)).length)],
                ["Equipes", fmtNum(equipes.filter((e) => e.unidadeId === sel.id).length)],
                ["Projetos", fmtNum(projetos.filter((p) => p.unidadeId === sel.id).length)],
                ["Gestora", sel.gestoraId ? "Fundo/Gestora vinculada" : "Prefeitura"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md px-3 py-2" style={{ background: "rgba(19,37,29,0.04)" }}>
                  <div className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{k}</div>
                  <div className="font-bold mt-0.5">{v}</div>
                </div>
              ))}
            </div>

            {podeEditar && (
              <div className="space-y-2">
                <div className="ovl mb-1">Ações contextuais</div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="btn btn-outline !py-2 text-[12px]" onClick={() => { setModalEditar(sel); setForm({ nome: sel.nome, sigla: sel.sigla, tipo: sel.tipo, responsavelId: sel.responsavelId ?? "" }); }}><Icon name="editar" size={14} /> Editar</button>
                  <button className="btn btn-outline !py-2 text-[12px]" onClick={() => { setModalNova(sel.id); setForm({ nome: "", sigla: "", tipo: "Setor", responsavelId: "" }); }}><Icon name="mais" size={14} /> Adicionar Abaixo</button>
                  <button className="btn btn-outline !py-2 text-[12px]" disabled={sel.id === "un0"} onClick={() => { setModalMover(sel); setNovoPai(sel.parentId ?? "un0"); setConfirmouImpacto(false); }}><Icon name="seta-d" size={14} /> Mover / Alterar Vínculo</button>
                  <button className="btn btn-outline !py-2 text-[12px]" style={{ color: sel.ativa === false ? "var(--green)" : "var(--red)", borderColor: sel.ativa === false ? "var(--green)" : "var(--red)" }}
                    onClick={() => { atualizarUnidade(sel.id, { ativa: sel.ativa === false }); toast(sel.ativa === false ? "Unidade reativada" : "Unidade desativada", sel.ativa === false ? "verde" : "ambar", sel.nome); }}>
                    <Icon name={sel.ativa === false ? "check" : "fechar"} size={14} /> {sel.ativa === false ? "Reativar" : "Desativar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card p-8 text-center text-[13px]" style={{ color: "var(--muted)" }}>Selecione uma unidade na árvore.</div>
        )}
      </div>

      {/* Nova / editar unidade */}
      <Modal aberto={!!modalNova} onFechar={() => setModalNova(null)} titulo={`Nova Unidade subordinada a ${unDe(modalNova)?.sigla ?? ""}`}
        rodape={<><button className="btn btn-outline" onClick={() => setModalNova(null)}>Cancelar</button><button className="btn btn-primary" onClick={salvarNova}><Icon name="check" size={15} /> Criar unidade</button></>}>
        <div className="space-y-4">
          <Campo rotulo="Nome" obrigatorio><input className="input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="ex.: Coordenadoria de Vigilância em Saúde" /></Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Sigla"><input className="input" value={form.sigla} onChange={(e) => setForm({ ...form, sigla: e.target.value })} /></Campo>
            <Seletor rotulo="Tipo" valor={form.tipo} onChange={(v) => setForm({ ...form, tipo: v })} opcoes={tiposUnidade.filter((t) => t.ativo).map((t) => t.nome)} />
          </div>
          <Seletor rotulo="Responsável" valor={form.responsavelId} onChange={(v) => setForm({ ...form, responsavelId: v })}
            opcoes={[{ valor: "", rotulo: "Definir depois" }, ...usuarios.filter((u) => u.ativo).map((u) => ({ valor: u.id, rotulo: u.nome }))]} />
        </div>
      </Modal>

      <Modal aberto={!!modalEditar} onFechar={() => setModalEditar(null)} titulo={`Editar — ${modalEditar?.sigla ?? ""}`}
        rodape={<><button className="btn btn-outline" onClick={() => setModalEditar(null)}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => {
            if (!modalEditar || !form.nome.trim()) { toast("Informe o nome", "vermelho"); return; }
            atualizarUnidade(modalEditar.id, { nome: form.nome.trim(), sigla: form.sigla, tipo: form.tipo, responsavelId: form.responsavelId || undefined });
            toast("Unidade atualizada", "verde", form.nome);
            setModalEditar(null);
          }}><Icon name="check" size={15} /> Salvar alterações</button></>}>
        <div className="space-y-4">
          <Campo rotulo="Nome" obrigatorio><input className="input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Sigla"><input className="input" value={form.sigla} onChange={(e) => setForm({ ...form, sigla: e.target.value })} /></Campo>
            <Seletor rotulo="Tipo" valor={form.tipo} onChange={(v) => setForm({ ...form, tipo: v })} opcoes={tiposUnidade.filter((t) => t.ativo).map((t) => t.nome)} />
          </div>
          <Seletor rotulo="Responsável" valor={form.responsavelId} onChange={(v) => setForm({ ...form, responsavelId: v })}
            opcoes={[{ valor: "", rotulo: "Sem responsável" }, ...usuarios.filter((u) => u.ativo).map((u) => ({ valor: u.id, rotulo: u.nome }))]} />
        </div>
      </Modal>

      {/* Mover unidade com análise de impacto */}
      <Modal aberto={!!modalMover} onFechar={() => { setModalMover(null); setConfirmouImpacto(false); }} titulo={`Mover — ${modalMover?.nome ?? ""}`}
        rodape={<>
          <button className="btn btn-outline" onClick={() => { setModalMover(null); setConfirmouImpacto(false); }}>Cancelar</button>
          <button className="btn btn-primary" disabled={!confirmouImpacto} onClick={aplicarMover}><Icon name="check" size={15} /> Confirmar mudança de vínculo</button>
        </>}>
        {modalMover && impacto && (
          <div className="space-y-4">
            <p className="text-[13px] m-0 leading-relaxed" style={{ color: "var(--muted)" }}>
              <strong style={{ color: "var(--ink)" }}>Deseja alterar o vínculo hierárquico desta unidade?</strong><br />
              A mudança afeta regras herdadas (atendimento de TI, coberturas, relatórios e permissões de escopo).
            </p>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="rounded-lg px-3.5 py-3" style={{ background: "rgba(19,37,29,0.045)" }}>
                <div className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Vínculo atual</div>
                <div className="font-bold mt-1">{unDe(modalMover.parentId)?.nome ?? "Raiz da organização"}</div>
              </div>
              <div className="rounded-lg px-3.5 py-3" style={{ background: "var(--green-soft)" }}>
                <div className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: "var(--green)" }}>Nova unidade superior</div>
                <div className="font-bold mt-1" style={{ color: "var(--green)" }}>{unDe(novoPai)?.nome}</div>
              </div>
            </div>
            <Seletor rotulo="Ou escolha a nova unidade superior" valor={novoPai} onChange={(v) => { setNovoPai(v); setConfirmouImpacto(false); }}
              opcoes={unidades.filter((u) => u.id !== modalMover.id && !descendentes(modalMover.id).includes(u.id)).map((u) => ({ valor: u.id, rotulo: `${u.sigla} — ${u.nome}` }))} />
            <div className="rounded-lg p-4" style={{ background: "var(--yellow-soft)", border: "1px solid rgba(242,183,10,0.5)" }}>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--accent-ink)" }}>Impacto da alteração (unidade + subordinadas)</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                <span>· {fmtNum(impacto.usuarios)} servidores lotados</span>
                <span>· {fmtNum(impacto.equipes)} equipes vinculadas</span>
                <span>· {fmtNum(impacto.projetos)} projetos da unidade</span>
                <span>· {fmtNum(impacto.coberturas)} regras de atendimento</span>
              </div>
              <p className="text-[11px] mt-2 mb-0" style={{ color: "var(--accent-ink)" }}>Referências circulares são bloqueadas automaticamente; a estrutura anterior fica registrada em auditoria.</p>
            </div>
            <label className="flex items-center gap-2.5 text-[12.5px] font-bold cursor-pointer">
              <input type="checkbox" checked={confirmouImpacto} onChange={(e) => setConfirmouImpacto(e.target.checked)} style={{ accentColor: "var(--green)", width: 16, height: 16 }} />
              Analisei o impacto e autorizo a alteração
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
