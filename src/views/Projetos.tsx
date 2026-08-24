import { useMemo, useState } from "react";
import { Avatar, Barra, Campo, Chip, Icon, Modal, PainelLateral, PrioridadeChip, Reveal, Seletor, StatusChip, Vazio, useToast } from "../components/ui";
import { CabecalhoPagina } from "../components/shell";
import { PRIORIDADES, Projeto, SAUDE_PROJETO, STATUS_PROJETO } from "../lib/data";
import { diasAte, fmtData, fmtMoeda, fmtNum, fmtPct, isoRel } from "../lib/format";
import { useApp } from "../lib/store";

export default function Projetos() {
  const app = useApp();
  const { projetos, unidades, usuarios, equipes, tarefas, riscos, config, criarProjeto } = app;
  const toast = useToast();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [selecionado, setSelecionado] = useState<Projeto | null>(null);
  const [modalNovo, setModalNovo] = useState(false);
  const [novo, setNovo] = useState({ nome: "", descricao: "", unidadeId: "un11", responsavelId: "u1", equipeId: "eq1", prioridade: "Normal", status: "Planejamento", prazo: isoRel(90).slice(0, 10), orcamento: "100000" });

  const filtrados = useMemo(() => projetos.filter((p) =>
    (filtroStatus === "Todos" || p.status === filtroStatus) &&
    (busca.trim() === "" || `${p.nome} ${p.codigo}`.toLowerCase().includes(busca.trim().toLowerCase()))
  ), [projetos, filtroStatus, busca]);

  const unidadeDe = (id: string) => unidades.find((u) => u.id === id);
  const usuarioDe = (id: string) => usuarios.find((u) => u.id === id);

  const salvarNovo = () => {
    if (!novo.nome.trim()) { toast("Informe o nome do projeto", "vermelho"); return; }
    criarProjeto({
      nome: novo.nome.trim(), descricao: novo.descricao || "Sem descrição cadastrada.", unidadeId: novo.unidadeId,
      responsavelId: novo.responsavelId, equipeId: novo.equipeId, status: novo.status, prioridade: novo.prioridade,
      inicio: new Date().toISOString(), prazo: novo.prazo, saude: "Saudável", orcamento: Number(novo.orcamento) || 0,
    });
    toast("Projeto criado", "verde", novo.nome);
    setModalNovo(false);
    setNovo({ ...novo, nome: "", descricao: "" });
  };

  const corSaude = (s: string) => (s === "Crítico" ? "var(--red)" : s === "Em atenção" ? "var(--amber)" : "var(--green)");

  return (
    <div>
      <CabecalhoPagina
        titulo="Projetos"
        subtitulo={`${fmtNum(filtrados.length)} de ${fmtNum(projetos.length)} projetos · carteira de ${fmtMoeda(projetos.reduce((s, p) => s + p.orcamento, 0), config.regional.moeda)}`}
        acoes={
          <>
            <div className="relative hidden sm:block">
              <Icon name="busca" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input className="input pl-9 w-[220px]" placeholder="Pesquisar projeto…" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <select className="select !w-[150px]" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} aria-label="Filtrar por status">
              {["Todos", ...STATUS_PROJETO.map((s) => s.label)].map((s) => <option key={s}>{s}</option>)}
            </select>
            <button className="btn btn-accent" onClick={() => setModalNovo(true)}><Icon name="mais" size={16} /> Novo Projeto</button>
          </>
        }
      />

      {filtrados.length === 0 ? (
        <div className="card"><Vazio titulo="Nenhum projeto encontrado" dica="Ajuste a pesquisa ou o filtro de status." /></div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map((p, i) => {
            const unid = unidadeDe(p.unidadeId);
            const resp = usuarioDe(p.responsavelId);
            const equipe = equipes.find((e) => e.id === p.equipeId);
            const dPrazo = diasAte(p.prazo);
            return (
              <Reveal key={p.id} delay={Math.min(i, 6) * 50}>
                <button className="card card-hover w-full text-left p-5 cursor-pointer block" style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--card)", boxShadow: "var(--shadow-1)" }} onClick={() => setSelecionado(p)}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10.5px] font-bold tracking-wider tabular-nums" style={{ color: "var(--muted)" }}>{p.codigo}</span>
                    <StatusChip s={p.status} />
                  </div>
                  <h3 className="font-display font-bold text-[16.5px] leading-snug m-0 mb-2">{p.nome}</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1"><Barra valor={p.progresso} cor={corSaude(p.saude)} /></div>
                    <span className="text-[12px] font-bold tabular-nums">{fmtPct(p.progresso)}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] mb-3" style={{ color: "var(--muted)" }}>
                    <span className="flex items-center gap-1"><Icon name="organograma" size={13} /> {unid?.sigla}</span>
                    <span className="flex items-center gap-1"><Icon name="equipes" size={13} /> {equipe?.nome.replace("Equipe de ", "")}</span>
                    <span className="flex items-center gap-1"><Icon name="relogio" size={13} /> {fmtData(p.prazo)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px dashed var(--line)" }}>
                    <span className="flex items-center gap-2 text-[12px] font-semibold">
                      <Avatar nome={resp?.nome ?? "?"} size={24} /> {resp?.nome.split(" ").slice(0, 2).join(" ")}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-[11.5px] font-bold tabular-nums">{fmtMoeda(p.orcamento, config.regional.moeda).replace(",00", "")}</span>
                      <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded" style={{ background: dPrazo < 0 ? "var(--red-soft)" : "var(--grey-soft)", color: dPrazo < 0 ? "var(--red)" : "var(--grey)" }}>
                        {dPrazo < 0 ? `+${fmtNum(Math.abs(dPrazo))} d` : `${fmtNum(dPrazo)} d`}
                      </span>
                    </span>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* Detalhe do projeto */}
      <PainelLateral aberto={!!selecionado} onFechar={() => setSelecionado(null)} titulo={selecionado ? <span className="flex items-center gap-2"><span className="text-[11px] font-bold tabular-nums" style={{ color: "var(--muted)" }}>{selecionado.codigo}</span> {selecionado.nome}</span> : ""}>
        {selecionado && (() => {
          const p = projetos.find((x) => x.id === selecionado.id) ?? selecionado;
          const tarefasProj = tarefas.filter((t) => t.projetoId === p.id);
          const riscosProj = riscos.filter((r) => r.projetoId === p.id);
          const equipe = equipes.find((e) => e.id === p.equipeId);
          return (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <StatusChip s={p.status} />
                <PrioridadeChip p={p.prioridade} />
                <Chip tom={p.saude === "Crítico" ? "vermelho" : p.saude === "Em atenção" ? "ambar" : "verde"}>{p.saude}</Chip>
              </div>
              <p className="text-[13px] leading-relaxed m-0" style={{ color: "var(--muted)" }}>{p.descricao}</p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Progresso", fmtPct(p.progresso)],
                  ["Prazo", fmtData(p.prazo)],
                  ["Orçamento", fmtMoeda(p.orcamento, config.regional.moeda)],
                  ["Executado", fmtMoeda(p.executado, config.regional.moeda)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg px-3.5 py-3" style={{ background: "rgba(19,37,29,0.04)" }}>
                    <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{k}</div>
                    <div className="font-display font-bold text-[15px] mt-0.5 tabular-nums">{v}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="ovl mb-2">Execução orçamentária</div>
                <Barra valor={(p.executado / p.orcamento) * 100} cor="var(--blue)" />
                <div className="text-[11.5px] mt-1.5" style={{ color: "var(--muted)" }}>{fmtPct((p.executado / p.orcamento) * 100)} do orçamento executado</div>
              </div>

              <div>
                <div className="ovl mb-2.5">Fases do projeto</div>
                <ol className="m-0 p-0 list-none space-y-2">
                  {p.fases.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-[13px] font-semibold">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-none" style={f.feita ? { background: "var(--green)", color: "#fff" } : { border: "1.5px solid var(--line-2)", color: "transparent" }}>
                        <Icon name="check" size={11} />
                      </span>
                      <span className={f.feita ? "" : "opacity-70"}>{f.nome}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <div className="ovl mb-2.5">Tarefas vinculadas ({fmtNum(tarefasProj.length)})</div>
                <ul className="m-0 p-0 list-none space-y-1.5">
                  {tarefasProj.map((t) => (
                    <li key={t.id} className="flex items-center gap-2.5 text-[12.5px] font-semibold">
                      <span className="flex-1 truncate">{t.titulo}</span>
                      <StatusChip s={t.status} />
                    </li>
                  ))}
                  {tarefasProj.length === 0 && <li className="text-[12.5px]" style={{ color: "var(--muted)" }}>Nenhuma tarefa vinculada.</li>}
                </ul>
              </div>

              <div>
                <div className="ovl mb-2.5">Equipe ({equipe?.nome})</div>
                <div className="flex flex-wrap gap-2">
                  {usuarios.filter((u) => equipe?.membroIds.includes(u.id)).map((u) => (
                    <span key={u.id} className="flex items-center gap-2 rounded-full pr-3 py-1 pl-1" style={{ background: "rgba(19,37,29,0.05)" }}>
                      <Avatar nome={u.nome} size={22} /> <span className="text-[12px] font-semibold">{u.nome.split(" ")[0]}</span>
                    </span>
                  ))}
                </div>
              </div>

              {riscosProj.length > 0 && (
                <div>
                  <div className="ovl mb-2.5">Riscos associados</div>
                  {riscosProj.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 text-[12.5px] font-semibold py-1">
                      <Icon name="riscos" size={15} className={r.nivel === "Crítico" ? "text-[var(--red)]" : "text-[var(--amber)]"} />
                      <span className="flex-1 truncate">{r.titulo}</span>
                      <Chip tom={r.nivel === "Crítico" ? "vermelho" : "ambar"} dot={false}>{r.nivel}</Chip>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </PainelLateral>

      {/* Novo projeto */}
      <Modal
        aberto={modalNovo} onFechar={() => setModalNovo(false)} titulo="Novo Projeto" largo
        rodape={
          <>
            <button className="btn btn-outline" onClick={() => setModalNovo(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={salvarNovo}><Icon name="check" size={15} /> Criar projeto</button>
          </>
        }
      >
        <div className="space-y-4">
          <Campo rotulo="Nome do projeto" obrigatorio>
            <input className="input" placeholder="ex.: Digitalização do Arquivo Municipal" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
          </Campo>
          <Campo rotulo="Descrição">
            <textarea className="textarea" rows={3} placeholder="Objetivo, escopo e entregas esperadas…" value={novo.descricao} onChange={(e) => setNovo({ ...novo, descricao: e.target.value })} />
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Seletor rotulo="Unidade Administrativa" obrigatorio valor={novo.unidadeId} onChange={(v) => setNovo({ ...novo, unidadeId: v })}
              opcoes={unidades.filter((u) => u.id !== "un0").map((u) => ({ valor: u.id, rotulo: `${u.sigla} — ${u.nome}` }))} />
            <Seletor rotulo="Responsável (Gerente de Projeto)" obrigatorio valor={novo.responsavelId} onChange={(v) => setNovo({ ...novo, responsavelId: v })}
              opcoes={usuarios.filter((u) => u.ativo).map((u) => ({ valor: u.id, rotulo: u.nome }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Seletor rotulo="Equipe executora" valor={novo.equipeId} onChange={(v) => setNovo({ ...novo, equipeId: v })}
              opcoes={equipes.map((e) => ({ valor: e.id, rotulo: e.nome }))} />
            <Seletor rotulo="Prioridade" valor={novo.prioridade} onChange={(v) => setNovo({ ...novo, prioridade: v })}
              opcoes={PRIORIDADES.map((p) => p.label)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Seletor rotulo="Status inicial" valor={novo.status} onChange={(v) => setNovo({ ...novo, status: v })}
              opcoes={["Planejamento", "Em Andamento"]} />
            <Campo rotulo="Prazo (DD/MM/AAAA)" obrigatorio>
              <input className="input" type="date" value={novo.prazo} onChange={(e) => setNovo({ ...novo, prazo: e.target.value })} />
            </Campo>
            <Campo rotulo="Orçamento (R$)">
              <input className="input" type="number" min={0} step="1000" value={novo.orcamento} onChange={(e) => setNovo({ ...novo, orcamento: e.target.value })} />
            </Campo>
          </div>
        </div>
      </Modal>
    </div>
  );
}
