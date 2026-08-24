import { useMemo, useState } from "react";
import { Avatar, Campo, Chip, Icon, Modal, PainelLateral, PrioridadeChip, Reveal, Seletor, StatusChip, Vazio, useToast } from "../components/ui";
import { CabecalhoPagina } from "../components/shell";
import { Demanda, PRIORIDADES, STATUS_DEMANDA, TIPOS_DEMANDA } from "../lib/data";
import { diasAte, fmtData, fmtDataHora, fmtNum, isoRel, tempoRel } from "../lib/format";
import { useApp } from "../lib/store";

const PROXIMAS_ACOES: Record<string, { rotulo: string; destino: string; tom?: "primario" | "perigo" }[]> = {
  "Nova": [{ rotulo: "Analisar", destino: "Em Análise", tom: "primario" }],
  "Em Análise": [{ rotulo: "Aceitar", destino: "Aceita", tom: "primario" }, { rotulo: "Recusar", destino: "Recusada", tom: "perigo" }],
  "Aceita": [{ rotulo: "Iniciar atendimento", destino: "Em Atendimento", tom: "primario" }],
  "Em Atendimento": [{ rotulo: "Concluir", destino: "Concluída", tom: "primario" }, { rotulo: "Colocar em aguardo", destino: "Aguardando" }],
  "Aguardando": [{ rotulo: "Retomar atendimento", destino: "Em Atendimento", tom: "primario" }],
};

export default function Demandas() {
  const { demandas, usuarios, unidades, mudarStatusDemanda, criarDemanda, atual } = useApp();
  const toast = useToast();
  const [aba, setAba] = useState("Todas");
  const [busca, setBusca] = useState("");
  const [detalhe, setDetalhe] = useState<Demanda | null>(null);
  const [modalNova, setModalNova] = useState(false);
  const [nova, setNova] = useState({ tipo: TIPOS_DEMANDA[0], descricao: "", solicitanteId: "u7", unidadeId: "un12", prioridade: "Normal", prazo: isoRel(5).slice(0, 10), responsavelId: "" });

  const contagem = useMemo(() => {
    const m: Record<string, number> = { Todas: demandas.length };
    STATUS_DEMANDA.forEach((s) => { m[s.label] = demandas.filter((d) => d.status === s.label).length; });
    return m;
  }, [demandas]);

  const filtradas = useMemo(() => demandas.filter((d) =>
    (aba === "Todas" || d.status === aba) &&
    (busca.trim() === "" || `${d.protocolo} ${d.tipo} ${d.descricao}`.toLowerCase().includes(busca.trim().toLowerCase()))
  ), [demandas, aba, busca]);

  const usuarioDe = (id: string | null) => usuarios.find((u) => u.id === id);
  const unidadeDe = (id: string) => unidades.find((u) => u.id === id);

  const agir = (d: Demanda, destino: string) => {
    mudarStatusDemanda(d.id, destino, "Alteração registrada na fila de demandas.");
    toast(`Demanda ${destino.toLowerCase()}`, destino === "Recusada" ? "ambar" : "verde", `${d.protocolo} → ${destino}`);
  };

  const salvarNova = () => {
    if (!nova.descricao.trim()) { toast("Descreva a solicitação", "vermelho"); return; }
    criarDemanda({
      tipo: nova.tipo, descricao: nova.descricao.trim(), solicitanteId: nova.solicitanteId, unidadeId: nova.unidadeId,
      responsavelId: nova.responsavelId || null, prioridade: nova.prioridade, prazo: new Date(nova.prazo + "T17:00:00").toISOString(),
    });
    toast("Demanda registrada", "verde", `${nova.tipo}`);
    setModalNova(false);
    setNova({ ...nova, descricao: "" });
  };

  return (
    <div>
      <CabecalhoPagina
        titulo="Demandas"
        subtitulo={`${fmtNum(demandas.filter((d) => !["Concluída", "Recusada", "Cancelada"].includes(d.status)).length)} demandas ativas na central de atendimento`}
        acoes={<button className="btn btn-accent" onClick={() => setModalNova(true)}><Icon name="mais" size={16} /> Nova Demanda</button>}
      />

      <div className="flex gap-1 overflow-x-auto pb-2 mb-3" style={{ borderBottom: "1px solid var(--line)" }}>
        {["Todas", ...STATUS_DEMANDA.map((s) => s.label)].map((s) => (
          <button key={s} className={`tab-btn ${aba === s ? "on" : ""}`} onClick={() => setAba(s)}>
            {s} <span className="opacity-70 tabular-nums">({fmtNum(contagem[s] ?? 0)})</span>
          </button>
        ))}
      </div>

      <div className="relative mb-4 max-w-[340px]">
        <Icon name="busca" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
        <input className="input pl-9" placeholder="Pesquisar por protocolo, tipo ou descrição…" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {filtradas.length === 0 ? (
        <div className="card"><Vazio icone="demandas" titulo="Nenhuma demanda neste filtro" dica="Ajuste a aba de status ou a pesquisa." /></div>
      ) : (
        <Reveal>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="tbl min-w-[860px]">
                <thead>
                  <tr>
                    <th>Protocolo</th><th>Tipo / Descrição</th><th>Solicitante</th><th>Prioridade</th><th>Prazo</th><th>Status</th><th>Responsável</th><th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((d) => {
                    const sol = usuarioDe(d.solicitanteId);
                    const unid = unidadeDe(d.unidadeId);
                    const resp = usuarioDe(d.responsavelId);
                    const dPrazo = diasAte(d.prazo);
                    const fechada = ["Concluída", "Recusada", "Cancelada"].includes(d.status);
                    return (
                      <tr key={d.id} className="cursor-pointer" onClick={() => setDetalhe(d)}>
                        <td className="font-bold tabular-nums text-[12px] whitespace-nowrap">{d.protocolo}</td>
                        <td>
                          <div className="font-bold text-[12.5px]">{d.tipo}</div>
                          <div className="text-[11.5px] truncate max-w-[240px]" style={{ color: "var(--muted)" }}>{d.descricao}</div>
                        </td>
                        <td>
                          <div className="text-[12px] font-semibold whitespace-nowrap">{sol?.nome.split(" ").slice(0, 2).join(" ")}</div>
                          <div className="text-[10.5px] font-bold" style={{ color: "var(--muted)" }}>{unid?.sigla}</div>
                        </td>
                        <td><PrioridadeChip p={d.prioridade} /></td>
                        <td className="whitespace-nowrap">
                          <span className="text-[12px] font-bold tabular-nums" style={{ color: !fechada && dPrazo < 0 ? "var(--red)" : "var(--ink)" }}>{fmtData(d.prazo)}</span>
                          {!fechada && dPrazo < 0 && <div className="text-[10px] font-bold" style={{ color: "var(--red)" }}>Em atraso</div>}
                        </td>
                        <td><StatusChip s={d.status} /></td>
                        <td>
                          {resp ? (
                            <span className="flex items-center gap-1.5 text-[12px] font-semibold whitespace-nowrap">
                              <Avatar nome={resp.nome} size={20} /> {resp.nome.split(" ")[0]}
                            </span>
                          ) : <span className="text-[11.5px] italic" style={{ color: "var(--muted)" }}>Não atribuída</span>}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1.5">
                            {(PROXIMAS_ACOES[d.status] ?? []).map((a) => (
                              <button
                                key={a.destino}
                                className={`btn !py-1 !px-2.5 text-[11.5px] ${a.tom === "primario" ? "btn-primary" : a.tom === "perigo" ? "btn-outline" : "btn-outline"}`}
                                style={a.tom === "perigo" ? { color: "var(--red)", borderColor: "var(--red)" } : undefined}
                                onClick={() => agir(d, a.destino)}
                              >
                                {a.rotulo}
                              </button>
                            ))}
                            {fechada && <span className="text-[11px] italic" style={{ color: "var(--muted)" }}>Encerrada</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      )}

      {/* Detalhe da demanda */}
      <PainelLateral
        aberto={!!detalhe} onFechar={() => setDetalhe(null)}
        titulo={detalhe ? <span className="flex items-center gap-2.5">{detalhe.protocolo} <StatusChip s={detalhe.status} /></span> : ""}
        rodape={detalhe && (PROXIMAS_ACOES[detalhe.status] ?? []).length > 0 ? (
          (PROXIMAS_ACOES[detalhe.status] ?? []).map((a) => (
            <button key={a.destino} className={`btn flex-1 ${a.tom === "primario" ? "btn-primary" : "btn-outline"}`} style={a.tom === "perigo" ? { color: "var(--red)", borderColor: "var(--red)" } : undefined}
              onClick={() => { agir(detalhe, a.destino); setDetalhe(null); }}>
              {a.rotulo}
            </button>
          ))
        ) : <button className="btn btn-primary flex-1" onClick={() => setDetalhe(null)}>Fechar</button>}
      >
        {detalhe && (() => {
          const d = demandas.find((x) => x.id === detalhe.id) ?? detalhe;
          const sol = usuarioDe(d.solicitanteId);
          const unid = unidadeDe(d.unidadeId);
          const resp = usuarioDe(d.responsavelId);
          return (
            <div className="space-y-5">
              <div>
                <h4 className="font-display font-bold text-[17px] m-0 mb-1">{d.tipo}</h4>
                <p className="text-[13px] leading-relaxed m-0" style={{ color: "var(--muted)" }}>{d.descricao}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusChip s={d.status} /><PrioridadeChip p={d.prioridade} />
                <Chip tom={diasAte(d.prazo) < 0 ? "vermelho" : "cinza"} dot={false}>Prazo: {fmtData(d.prazo)}</Chip>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg px-3.5 py-3 flex items-center gap-2.5" style={{ background: "rgba(19,37,29,0.04)" }}>
                  <Avatar nome={sol?.nome ?? "?"} size={30} />
                  <div className="min-w-0">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Solicitante</div>
                    <div className="text-[12.5px] font-bold truncate">{sol?.nome}</div>
                    <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{unid?.sigla} · {unid?.nome}</div>
                  </div>
                </div>
                <div className="rounded-lg px-3.5 py-3" style={{ background: "rgba(19,37,29,0.04)" }}>
                  <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Responsável</div>
                  {resp ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar nome={resp.nome} size={24} /><span className="text-[12.5px] font-bold">{resp.nome.split(" ").slice(0, 2).join(" ")}</span>
                    </div>
                  ) : <div className="text-[12.5px] italic mt-1" style={{ color: "var(--muted)" }}>Aguardando atribuição</div>}
                  <div className="text-[10.5px] mt-1" style={{ color: "var(--muted)" }}>Aberta em {fmtDataHora(d.criadaEm)}</div>
                </div>
              </div>

              <div>
                <div className="ovl mb-3">Histórico de Atividades</div>
                <ol className="m-0 p-0 list-none relative">
                  <span className="absolute left-[5px] top-1 bottom-1 w-px" style={{ background: "var(--line-2)" }} />
                  {[...d.historico].reverse().map((h, i) => (
                    <li key={i} className="relative pl-6 pb-4">
                      <span className="absolute left-0 top-1 w-[11px] h-[11px] rounded-full" style={{ background: i === 0 ? "var(--green)" : "var(--line-2)", border: "2px solid var(--card)" }} />
                      <div className="text-[12.5px] font-bold">{h.acao}</div>
                      {h.detalhe && <div className="text-[12px]" style={{ color: "var(--muted)" }}>{h.detalhe}</div>}
                      <div className="text-[10.5px] mt-0.5 font-semibold" style={{ color: "var(--muted)" }}>{h.usuario} · {tempoRel(h.data)} ({fmtDataHora(h.data)})</div>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <div className="ovl mb-2.5">Anexos</div>
                <div className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5" style={{ border: "1px dashed var(--line-2)" }}>
                  <Icon name="documentos" size={17} className="opacity-60" />
                  <span className="text-[12.5px] font-semibold">lista-servidores.pdf</span>
                  <span className="text-[11px] ml-auto" style={{ color: "var(--muted)" }}>84 KB</span>
                  <button className="icon-btn" aria-label="Baixar anexo" onClick={() => toast("Download iniciado", "azul", "lista-servidores.pdf")}><Icon name="baixar" size={16} /></button>
                </div>
              </div>
            </div>
          );
        })()}
      </PainelLateral>

      {/* Nova demanda */}
      <Modal aberto={modalNova} onFechar={() => setModalNova(false)} titulo="Nova Demanda" largo
        rodape={
          <>
            <button className="btn btn-outline" onClick={() => setModalNova(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={salvarNova}><Icon name="check" size={15} /> Registrar demanda</button>
          </>
        }
      >
        <div className="space-y-4">
          <Seletor rotulo="Tipo de solicitação" obrigatorio valor={nova.tipo} onChange={(v) => setNova({ ...nova, tipo: v })} opcoes={TIPOS_DEMANDA} />
          <Campo rotulo="Descrição da solicitação" obrigatorio>
            <textarea className="textarea" rows={3} placeholder="Detalhe o que é necessário, local, quantidade…" value={nova.descricao} onChange={(e) => setNova({ ...nova, descricao: e.target.value })} />
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Seletor rotulo="Solicitante" valor={nova.solicitanteId} onChange={(v) => setNova({ ...nova, solicitanteId: v })}
              opcoes={usuarios.map((u) => ({ valor: u.id, rotulo: u.nome }))} />
            <Seletor rotulo="Unidade de origem" valor={nova.unidadeId} onChange={(v) => setNova({ ...nova, unidadeId: v })}
              opcoes={unidades.filter((u) => u.id !== "un0").map((u) => ({ valor: u.id, rotulo: `${u.sigla} — ${u.nome}` }))} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Seletor rotulo="Prioridade" valor={nova.prioridade} onChange={(v) => setNova({ ...nova, prioridade: v })} opcoes={PRIORIDADES.map((p) => p.label)} />
            <Campo rotulo="Prazo desejado"><input className="input" type="date" value={nova.prazo} onChange={(e) => setNova({ ...nova, prazo: e.target.value })} /></Campo>
            <Seletor rotulo="Responsável (opcional)" valor={nova.responsavelId} onChange={(v) => setNova({ ...nova, responsavelId: v })}
              opcoes={[{ valor: "", rotulo: "Definir na triagem" }, ...usuarios.filter((u) => u.ativo).map((u) => ({ valor: u.id, rotulo: u.nome }))]} />
          </div>
          <p className="text-[11.5px] m-0 flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
            <Icon name="info" size={13} /> A demanda seguirá o fluxo “Atendimento de Demanda de TI” e receberá protocolo automático. Aberta por {atual.nome}.
          </p>
        </div>
      </Modal>
    </div>
  );
}
