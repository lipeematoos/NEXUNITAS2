import { useMemo, useState } from "react";
import { Avatar, Campo, Chip, Icon, Modal, PrioridadeChip, Seletor, StatusChamadoChip, Vazio, useToast } from "../../components/ui";
import { CabecalhoPagina } from "../../components/shell";
import { EtapaAprovacao, RegraAprovacao } from "../../lib/data";
import { fmtData, fmtDataHora, fmtNum } from "../../lib/format";
import { useApp } from "../../lib/store";

const TIPOS_APROVADOR = ["Usuário específico", "Gestor da unidade", "Gestor da secretaria", "Perfil", "Grupo"];

export default function Aprovacoes() {
  const { chamados, usuarios, unidades, servicos, regrasAprovacao, setRegrasAprovacao, decidirAprovacao, atual, temPermissao } = useApp();
  const toast = useToast();
  const [modalDecisao, setModalDecisao] = useState<{ chamadoId: string; etapaId: string; decisao: "Aprovado" | "Rejeitado" | "Ajuste solicitado" } | null>(null);
  const [comentario, setComentario] = useState("");
  const [modalRegra, setModalRegra] = useState(false);
  const [regraEdicao, setRegraEdicao] = useState<RegraAprovacao | null>(null);
  const [novaRegra, setNovaRegra] = useState({ nome: "", condicoes: "", servicoId: "" });

  const podeAprovar = temPermissao("ticket.approve") || temPermissao("system.configure");
  const podeGerir = temPermissao("system.configure");

  const pendentes = useMemo(
    () => chamados.filter((c) => c.status === "Aguardando Aprovação" && c.aprovacoes.some((a) => a.status === "Pendente")),
    [chamados]
  );
  const historicoDecisoes = useMemo(
    () => chamados
      .filter((c) => c.aprovacoes.some((a) => a.status !== "Pendente"))
      .flatMap((c) => c.aprovacoes.filter((a) => a.status !== "Pendente").map((a) => ({ ...a, chamado: c })))
      .sort((a, b) => (b.data ?? "").localeCompare(a.data ?? ""))
      .slice(0, 8),
    [chamados]
  );

  const nomeDe = (id: string) => usuarios.find((u) => u.id === id);
  const decidir = () => {
    if (!modalDecisao) return;
    decidirAprovacao(modalDecisao.chamadoId, modalDecisao.etapaId, modalDecisao.decisao, comentario);
    const ch = chamados.find((c) => c.id === modalDecisao.chamadoId);
    toast(
      modalDecisao.decisao === "Aprovado" ? "Aprovação registrada" : modalDecisao.decisao === "Rejeitado" ? "Solicitação rejeitada" : "Ajuste solicitado ao solicitante",
      modalDecisao.decisao === "Aprovado" ? "verde" : modalDecisao.decisao === "Rejeitado" ? "vermelho" : "ambar",
      `${ch?.numero} · decisão gravada no histórico permanente`
    );
    setComentario("");
    setModalDecisao(null);
  };

  const salvarRegra = () => {
    if (!regraEdicao) return;
    if (regraEdicao.etapas.length === 0) { toast("Adicione ao menos uma etapa", "vermelho"); return; }
    if (regraEdicao.id.startsWith("nova")) {
      setRegrasAprovacao([...regrasAprovacao, { ...regraEdicao, id: `ra${Date.now()}` }]);
      toast("Regra criada", "verde", regraEdicao.nome);
    } else {
      setRegrasAprovacao(regrasAprovacao.map((r) => (r.id === regraEdicao.id ? regraEdicao : r)));
      toast("Regra atualizada", "verde", regraEdicao.nome);
    }
    setModalRegra(false);
    setRegraEdicao(null);
  };

  const etapaPatch = (idx: number, patch: Partial<EtapaAprovacao>) => {
    if (!regraEdicao) return;
    setRegraEdicao({ ...regraEdicao, etapas: regraEdicao.etapas.map((e, i) => (i === idx ? { ...e, ...patch } : e)) });
  };
  const moverEtapa = (idx: number, dir: -1 | 1) => {
    if (!regraEdicao) return;
    const arr = [...regraEdicao.etapas];
    const alvo = idx + dir;
    if (alvo < 0 || alvo >= arr.length) return;
    [arr[idx], arr[alvo]] = [arr[alvo], arr[idx]];
    setRegraEdicao({ ...regraEdicao, etapas: arr });
  };

  return (
    <div>
      <CabecalhoPagina
        titulo="Aprovações Pendentes"
        subtitulo={`${fmtNum(pendentes.length)} solicitações aguardando decisão · circuito configurável por serviço, sem regras fixas no sistema`}
      />

      {/* ===== Pendências ===== */}
      <div className="ovl mb-3">Fila de decisão — {fmtNum(pendentes.length)} pendências</div>
      {pendentes.length === 0 ? (
        <div className="card mb-6"><Vazio icone="carimbo" titulo="Nenhuma aprovação pendente" dica="Todas as solicitações foram decididas. Novas pendências aparecem aqui automaticamente." /></div>
      ) : (
        <div className="card overflow-hidden mb-6 anim-rise">
          <div className="overflow-x-auto">
            <table className="tbl min-w-[900px]">
              <thead><tr><th>Solicitação</th><th>Solicitante</th><th>Secretaria</th><th>Serviço</th><th>Etapa atual</th><th>Prazo</th><th>Prioridade</th><th className="text-right">Ações</th></tr></thead>
              <tbody>
                {pendentes.map((c) => {
                  const sol = nomeDe(c.solicitanteId);
                  const etapa = c.aprovacoes.find((a) => a.status === "Pendente");
                  const atrasado = etapa && c.prazoResolucao < new Date().toISOString();
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="font-bold tabular-nums text-[12px]">{c.numero}</div>
                        <div className="text-[11.5px] max-w-[220px] truncate" style={{ color: "var(--muted)" }}>{c.titulo}</div>
                      </td>
                      <td>
                        <span className="flex items-center gap-2 text-[12px] font-semibold whitespace-nowrap">
                          <Avatar nome={sol?.nome ?? "?"} size={24} /> {sol?.nome.split(" ").slice(0, 2).join(" ")}
                        </span>
                      </td>
                      <td className="text-[12px] font-bold">{unidades.find((u) => u.id === c.unidadeId)?.sigla}</td>
                      <td className="text-[12px]">{servicos.find((s) => s.id === c.servicoId)?.nome ?? "—"}</td>
                      <td>
                        <div className="text-[12px] font-bold" style={{ color: "var(--amber)" }}>{etapa?.etapaNome}</div>
                        <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{etapa?.aprovadorNome}</div>
                      </td>
                      <td className="text-[12px] tabular-nums font-bold whitespace-nowrap" style={{ color: atrasado ? "var(--red)" : undefined }}>
                        {fmtData(c.prazoResolucao)} {atrasado && "· atrasado"}
                      </td>
                      <td><PrioridadeChip p={c.prioridade} /></td>
                      <td>
                        <div className="flex justify-end gap-1.5">
                          {podeAprovar ? (
                            <>
                              <button className="btn btn-outline !py-1 !px-2 text-[11px]" style={{ color: "var(--green)", borderColor: "var(--green)" }} onClick={() => setModalDecisao({ chamadoId: c.id, etapaId: etapa!.etapaId, decisao: "Aprovado" })}>
                                <Icon name="check" size={13} /> Aprovar
                              </button>
                              <button className="btn btn-outline !py-1 !px-2 text-[11px]" style={{ color: "var(--red)", borderColor: "var(--red)" }} onClick={() => setModalDecisao({ chamadoId: c.id, etapaId: etapa!.etapaId, decisao: "Rejeitado" })}>
                                <Icon name="fechar" size={13} /> Rejeitar
                              </button>
                              <button className="btn btn-outline !py-1 !px-2 text-[11px]" onClick={() => setModalDecisao({ chamadoId: c.id, etapaId: etapa!.etapaId, decisao: "Ajuste solicitado" })}>
                                <Icon name="editar" size={13} /> Ajuste
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] font-semibold" style={{ color: "var(--muted)" }}>Sem permissão para decidir</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        {/* ===== Regras de aprovação ===== */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="ovl">Regras de Aprovação — motor configurável</div>
            {podeGerir && (
              <button className="btn btn-outline !py-1.5 text-[12px]" onClick={() => {
                setNovaRegra({ nome: "", condicoes: "", servicoId: "" });
                setRegraEdicao({ id: "nova", nome: "Nova regra de aprovação", servicoId: null, condicoes: "", ativo: true, etapas: [{ id: "e1", nome: "Etapa 1", tipoAprovador: "Gestor da unidade", aprovador: "Unidade do solicitante", obrigatoria: true, paralelo: false, prazoHoras: 24 }] });
                setModalRegra(true);
              }}>
                <Icon name="mais" size={14} /> Nova Regra
              </button>
            )}
          </div>
          <div className="space-y-3">
            {regrasAprovacao.map((r) => (
              <div key={r.id} className="card p-4" style={{ opacity: r.ativo ? 1 : 0.7 }}>
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-none" style={{ background: r.ativo ? "var(--amber-soft)" : "var(--grey-soft)", color: r.ativo ? "var(--amber)" : "var(--grey)" }}>
                    <Icon name="carimbo" size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-[15px] m-0">{r.nome}</h3>
                      <Chip tom={r.ativo ? "verde" : "cinza"} dot={false}>{r.ativo ? "Ativa" : "Inativa"}</Chip>
                      {r.servicoId && <Chip tom="azul" dot={false}>Serviço: {servicos.find((s) => s.id === r.servicoId)?.nome}</Chip>}
                    </div>
                    <p className="text-[11.5px] m-0 mt-1" style={{ color: "var(--muted)" }}>{r.condicoes}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      {r.etapas.map((e, i) => (
                        <span key={e.id} className="flex items-center gap-1.5">
                          <span className="chip" style={{ background: "var(--grey-soft)", color: "var(--grey)", border: e.obrigatoria ? "1px solid var(--line-2)" : "1px dashed var(--line-2)" }}>
                            {i + 1}. {e.nome}
                            {!e.obrigatoria && <em className="not-italic text-[9.5px]">opcional</em>}
                            {e.paralelo && <em className="not-italic text-[9.5px]">∥ paralelo</em>}
                          </span>
                          {i < r.etapas.length - 1 && <Icon name="seta-d" size={12} className="opacity-40" />}
                        </span>
                      ))}
                    </div>
                  </div>
                  {podeGerir && (
                    <button className="btn btn-outline !py-1.5 text-[11.5px] flex-none" onClick={() => { setRegraEdicao(JSON.parse(JSON.stringify(r)) as RegraAprovacao); setModalRegra(true); }}>
                      <Icon name="editar" size={13} /> Editar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11.5px] mt-3 leading-relaxed" style={{ color: "var(--muted)" }}>
            As regras definem <strong>quem aprova o quê</strong> — por usuário, gestor da unidade, gestor da secretaria, perfil ou grupo — com etapas
            sequenciais ou paralelas, obrigatórias ou opcionais, e prazo de escalonamento. Alterações valem imediatamente para novas solicitações.
          </p>
        </div>

        {/* ===== Histórico de decisões ===== */}
        <div>
          <div className="ovl mb-3">Histórico de decisões — permanente e ineditável</div>
          <div className="card p-5">
            {historicoDecisoes.length === 0 ? (
              <p className="text-[12.5px] m-0" style={{ color: "var(--muted)" }}>Nenhuma decisão registrada ainda.</p>
            ) : (
              <ol className="m-0 p-0 list-none space-y-3.5">
                {historicoDecisoes.map((d, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center flex-none"
                      style={{
                        background: d.status === "Aprovado" ? "var(--green-soft)" : d.status === "Rejeitado" ? "var(--red-soft)" : "var(--amber-soft)",
                        color: d.status === "Aprovado" ? "var(--green)" : d.status === "Rejeitado" ? "var(--red)" : "var(--amber)",
                      }}>
                      <Icon name={d.status === "Aprovado" ? "check" : d.status === "Rejeitado" ? "fechar" : "editar"} size={13} />
                    </span>
                    <div className="min-w-0 flex-1" style={{ borderBottom: i < historicoDecisoes.length - 1 ? "1px dashed var(--line)" : undefined, paddingBottom: 12 }}>
                      <div className="text-[12.5px]">
                        <strong>{d.status}</strong> — {d.etapaNome}
                        <span className="tabular-nums font-bold ml-1.5" style={{ color: "var(--muted)" }}>{d.chamado.numero}</span>
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>
                        Decisão de {d.aprovadorNome} (aprovador: {atual.nome === d.aprovadorNome ? "você" : "registrada"}) · {d.data ? fmtDataHora(d.data) : ""} · IP 10.0.4.21
                      </div>
                      {d.comentario && <div className="text-[11.5px] italic mt-1" style={{ color: "var(--muted)" }}>“{d.comentario}”</div>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
            <div className="flex items-center gap-2 mt-4 text-[11px] font-semibold px-3.5 py-2.5 rounded-lg" style={{ background: "var(--green-soft)", color: "var(--green)" }}>
              <Icon name="escudo" size={14} /> Trilha imutável — decisões, etapas, IPs e status anteriores são preservados para auditoria.
            </div>
          </div>
        </div>
      </div>

      {/* ===== Modal decisão ===== */}
      <Modal
        aberto={!!modalDecisao} onFechar={() => setModalDecisao(null)}
        titulo={modalDecisao?.decisao === "Aprovado" ? "Aprovar solicitação" : modalDecisao?.decisao === "Rejeitado" ? "Rejeitar solicitação" : "Solicitar ajustes"}
        rodape={<>
          <button className="btn btn-outline" onClick={() => setModalDecisao(null)}>Cancelar</button>
          <button className={`btn ${modalDecisao?.decisao === "Rejeitado" ? "btn-danger" : "btn-primary"}`} onClick={decidir}>
            <Icon name="check" size={15} /> Confirmar decisão
          </button>
        </>}
      >
        <div className="space-y-3">
          <div className="rounded-lg px-4 py-3 text-[12.5px]" style={{ background: "rgba(19,37,29,0.04)" }}>
            <strong>{chamados.find((c) => c.id === modalDecisao?.chamadoId)?.numero}</strong> — {chamados.find((c) => c.id === modalDecisao?.chamadoId)?.titulo}
            <div className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
              Etapa: {chamados.find((c) => c.id === modalDecisao?.chamadoId)?.aprovacoes.find((a) => a.etapaId === modalDecisao?.etapaId)?.etapaNome}
            </div>
          </div>
          {modalDecisao && <StatusChamadoChip s={modalDecisao.decisao === "Aprovado" ? "Aprovado" : modalDecisao.decisao === "Rejeitado" ? "Rejeitado" : "Aguardando Usuário"} />}
          <Campo rotulo="Comentário (obrigatório para rejeição)" obrigatorio={modalDecisao?.decisao === "Rejeitado"}>
            <textarea className="textarea" rows={3} placeholder="Registre a justificativa — ficará no histórico permanente." value={comentario} onChange={(e) => setComentario(e.target.value)} />
          </Campo>
        </div>
      </Modal>

      {/* ===== Modal regra ===== */}
      <Modal
        aberto={modalRegra && !!regraEdicao} onFechar={() => { setModalRegra(false); setRegraEdicao(null); }}
        titulo={regraEdicao?.id.startsWith("nova") ? "Nova Regra de Aprovação" : "Editar Regra de Aprovação"} largo
        rodape={<>
          <button className="btn btn-outline" onClick={() => { setModalRegra(false); setRegraEdicao(null); }}>Cancelar</button>
          <button className="btn btn-primary" onClick={salvarRegra}><Icon name="check" size={15} /> Salvar regra</button>
        </>}
      >
        {regraEdicao && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Campo rotulo="Nome da regra" obrigatorio>
                <input className="input" value={regraEdicao.nome} onChange={(e) => setRegraEdicao({ ...regraEdicao, nome: e.target.value })} />
              </Campo>
              <Seletor rotulo="Serviço vinculado" valor={regraEdicao.servicoId ?? ""} onChange={(v) => setRegraEdicao({ ...regraEdicao, servicoId: v || null })}
                opcoes={[{ valor: "", rotulo: "Sem vínculo direto (condições livres)" }, ...servicos.map((s) => ({ valor: s.id, rotulo: s.nome }))]} />
            </div>
            <Campo rotulo="Condições de aplicação (texto livre)">
              <input className="input" placeholder="ex.: Serviço X · secretaria Y · prioridade Alta ou superior" value={regraEdicao.condicoes} onChange={(e) => setRegraEdicao({ ...regraEdicao, condicoes: e.target.value })} />
            </Campo>
            <div className="flex items-center justify-between">
              <div className="ovl">Etapas do circuito ({regraEdicao.etapas.length})</div>
              <label className="flex items-center gap-2 text-[12px] font-bold cursor-pointer">
                <input type="checkbox" checked={regraEdicao.ativo} onChange={(e) => setRegraEdicao({ ...regraEdicao, ativo: e.target.checked })} style={{ accentColor: "var(--green)" }} />
                Regra ativa
              </label>
            </div>
            <div className="space-y-2.5">
              {regraEdicao.etapas.map((e, i) => (
                <div key={e.id} className="rounded-lg p-3" style={{ background: "rgba(19,37,29,0.03)", border: "1px solid var(--line)" }}>
                  <div className="grid grid-cols-[26px_1fr_150px_1fr_70px] gap-2 items-center">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold" style={{ background: "var(--deep)", color: "#f2b70a" }}>{i + 1}</span>
                    <input className="input !py-1.5 text-[12px]" value={e.nome} onChange={(ev) => etapaPatch(i, { nome: ev.target.value })} placeholder="Nome da etapa" aria-label="Nome da etapa" />
                    <select className="select !py-1.5 text-[12px]" value={e.tipoAprovador} onChange={(ev) => etapaPatch(i, { tipoAprovador: ev.target.value as EtapaAprovacao["tipoAprovador"] })} aria-label="Tipo de aprovador">
                      {TIPOS_APROVADOR.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    {e.tipoAprovador === "Usuário específico" ? (
                      <select className="select !py-1.5 text-[12px]" value={e.aprovador} onChange={(ev) => etapaPatch(i, { aprovador: ev.target.value })} aria-label="Aprovador">
                        {usuarios.map((u) => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                      </select>
                    ) : e.tipoAprovador === "Perfil" ? (
                      <select className="select !py-1.5 text-[12px]" value={e.aprovador} onChange={(ev) => etapaPatch(i, { aprovador: ev.target.value })} aria-label="Perfil aprovador">
                        {["Administrador", "Gerente de Projeto", "Responsável pela Equipe", "Responsável pela Unidade"].map((p) => <option key={p}>{p}</option>)}
                      </select>
                    ) : (
                      <input className="input !py-1.5 text-[12px]" value={e.aprovador} onChange={(ev) => etapaPatch(i, { aprovador: ev.target.value })} placeholder="Unidade, secretaria ou grupo" aria-label="Aprovador" />
                    )}
                    <div className="relative">
                      <input className="input !py-1.5 text-[12px] pr-7" type="number" min={1} value={e.prazoHoras} onChange={(ev) => etapaPatch(i, { prazoHoras: Number(ev.target.value) })} aria-label="Prazo em horas" />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold" style={{ color: "var(--muted)" }}>h</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 pl-8">
                    <label className="flex items-center gap-1.5 text-[11.5px] font-semibold cursor-pointer">
                      <input type="checkbox" checked={e.obrigatoria} onChange={(ev) => etapaPatch(i, { obrigatoria: ev.target.checked })} style={{ accentColor: "var(--green)" }} /> Obrigatória
                    </label>
                    <label className="flex items-center gap-1.5 text-[11.5px] font-semibold cursor-pointer" title="Etapas paralelas podem ser decididas simultaneamente">
                      <input type="checkbox" checked={e.paralelo} onChange={(ev) => etapaPatch(i, { paralelo: ev.target.checked })} style={{ accentColor: "var(--blue)" }} /> Paralela
                    </label>
                    <span className="flex-1" />
                    <button className="icon-btn !w-7 !h-7" disabled={i === 0} style={{ opacity: i === 0 ? 0.3 : 1 }} onClick={() => moverEtapa(i, -1)} aria-label="Subir etapa"><Icon name="chevron-b" size={14} className="rotate-180" /></button>
                    <button className="icon-btn !w-7 !h-7" disabled={i === regraEdicao.etapas.length - 1} style={{ opacity: i === regraEdicao.etapas.length - 1 ? 0.3 : 1 }} onClick={() => moverEtapa(i, 1)} aria-label="Descer etapa"><Icon name="chevron-b" size={14} /></button>
                    <button className="icon-btn !w-7 !h-7" style={{ color: "var(--red)" }} disabled={regraEdicao.etapas.length <= 1} onClick={() => setRegraEdicao({ ...regraEdicao, etapas: regraEdicao.etapas.filter((_, j) => j !== i) })} aria-label="Remover etapa">
                      <Icon name="excluir" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-outline !py-1.5 text-[12px]" onClick={() => setRegraEdicao({
              ...regraEdicao,
              etapas: [...regraEdicao.etapas, { id: `e${regraEdicao.etapas.length + 1}x`, nome: `Etapa ${regraEdicao.etapas.length + 1}`, tipoAprovador: "Grupo", aprovador: "Sistemas", obrigatoria: true, paralelo: false, prazoHoras: 24 }],
            })}>
              <Icon name="mais" size={14} /> Adicionar etapa
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
