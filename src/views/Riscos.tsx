import { useMemo, useState } from "react";
import { Avatar, Campo, Chip, Icon, Modal, Reveal, Seletor, useToast } from "../components/ui";
import { CabecalhoPagina } from "../components/shell";
import { Risco } from "../lib/data";
import { fmtNum } from "../lib/format";
import { useApp } from "../lib/store";

const corCelula = (p: number, i: number) => {
  const s = p * i;
  if (s <= 6) return "rgba(30,122,84,0.16)";
  if (s <= 12) return "rgba(242,183,10,0.2)";
  if (s <= 18) return "rgba(180,105,14,0.22)";
  return "rgba(179,64,42,0.24)";
};
const nivelDe = (p: number, i: number) => {
  const s = p * i;
  return s >= 15 ? "Crítico" : s >= 8 ? "Monitorando" : "Mitigado";
};

export default function Riscos() {
  const { riscos, usuarios, projetos, criarRisco } = useApp();
  const toast = useToast();
  const [selecionadoId, setSelecionadoId] = useState<string | null>(riscos[0]?.id ?? null);
  const [modal, setModal] = useState(false);
  const [novo, setNovo] = useState({ titulo: "", descricao: "", categoria: "Tecnológico" as Risco["categoria"], probabilidade: 3, impacto: 3, tendencia: "Estável" as Risco["tendencia"], mitigacao: "", responsavelId: "u2", projetoId: "" });

  const selecionado = useMemo(() => riscos.find((r) => r.id === selecionadoId) ?? null, [riscos, selecionadoId]);
  const ordenados = useMemo(() => [...riscos].sort((a, b) => b.probabilidade * b.impacto - a.probabilidade * a.impacto), [riscos]);

  const salvar = () => {
    if (!novo.titulo.trim()) { toast("Informe o título do risco", "vermelho"); return; }
    criarRisco({
      titulo: novo.titulo.trim(), descricao: novo.descricao || "—", categoria: novo.categoria,
      probabilidade: novo.probabilidade, impacto: novo.impacto, tendencia: novo.tendencia,
      nivel: nivelDe(novo.probabilidade, novo.impacto), mitigacao: novo.mitigacao || "Plano de mitigação a definir.",
      responsavelId: novo.responsavelId, projetoId: novo.projetoId || null,
    });
    toast("Risco registrado", "verde", `${novo.titulo} (${novo.probabilidade}×${novo.impacto})`);
    setModal(false);
    setNovo({ ...novo, titulo: "", descricao: "", mitigacao: "" });
  };

  return (
    <div>
      <CabecalhoPagina
        titulo="Riscos"
        subtitulo={`${fmtNum(riscos.length)} riscos mapeados · ${fmtNum(riscos.filter((r) => r.nivel === "Crítico").length)} críticos exigindo ação imediata`}
        acoes={<button className="btn btn-accent" onClick={() => setModal(true)}><Icon name="mais" size={16} /> Novo Risco</button>}
      />

      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-4 items-start">
        {/* Matriz */}
        <Reveal>
          <div className="card p-5">
            <div className="ovl mb-1.5">Matriz de probabilidade × impacto</div>
            <h3 className="font-display font-bold text-[16.5px] m-0 mb-4">Mapa de calor dos riscos</h3>
            <div className="flex gap-2">
              <div className="flex flex-col justify-between items-center py-1 flex-none">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>Probabilidade →</span>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-5 gap-1">
                  {[5, 4, 3, 2, 1].map((p) =>
                    [1, 2, 3, 4, 5].map((i) => {
                      const naCelula = riscos.filter((r) => r.probabilidade === p && r.impacto === i);
                      return (
                        <div key={`${p}-${i}`} className="relative aspect-[1.5/1] rounded-md flex items-center justify-center gap-1 flex-wrap p-1" style={{ background: corCelula(p, i) }} title={`Probabilidade ${p} × Impacto ${i}`}>
                          {naCelula.map((r) => (
                            <button
                              key={r.id}
                              onClick={() => setSelecionadoId(r.id)}
                              className="w-6 h-6 rounded-full text-[10px] font-extrabold text-white flex items-center justify-center cursor-pointer transition-transform hover:scale-125 border-0"
                              style={{ background: r.nivel === "Crítico" ? "var(--red)" : r.nivel === "Monitorando" ? "var(--amber)" : "var(--green)", outline: selecionadoId === r.id ? "2.5px solid var(--deep)" : "none", outlineOffset: 1.5 }}
                              title={r.titulo}
                              aria-label={r.titulo}
                            >
                              {r.titulo[0]}
                            </button>
                          ))}
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="grid grid-cols-5 gap-1 mt-1 text-center text-[10.5px] font-bold" style={{ color: "var(--muted)" }}>
                  {[1, 2, 3, 4, 5].map((i) => <span key={i}>{i}</span>)}
                </div>
                <div className="text-center text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: "var(--muted)" }}>Impacto →</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 text-[11px] font-bold" style={{ color: "var(--muted)" }}>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--green)" }} /> Mitigado (≤7)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--amber)" }} /> Monitorando (8–14)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--red)" }} /> Crítico (≥15)</span>
            </div>
          </div>
        </Reveal>

        {/* Detalhe */}
        <Reveal delay={80}>
          {selecionado ? (
            <div className="card p-5" key={selecionado.id}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="ovl mb-1.5">{selecionado.categoria} · P{selecionado.probabilidade} × I{selecionado.impacto} = {selecionado.probabilidade * selecionado.impacto}</div>
                  <h3 className="font-display font-bold text-[18px] m-0 leading-snug">{selecionado.titulo}</h3>
                </div>
                <Chip tom={selecionado.nivel === "Crítico" ? "vermelho" : selecionado.nivel === "Monitorando" ? "ambar" : "verde"}>{selecionado.nivel}</Chip>
              </div>
              <p className="text-[13px] leading-relaxed m-0 mb-4" style={{ color: "var(--muted)" }}>{selecionado.descricao}</p>
              <div className="rounded-lg px-4 py-3 mb-4" style={{ background: "rgba(30,122,84,0.06)", borderLeft: "3px solid var(--green)" }}>
                <div className="text-[10.5px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--green)" }}>Plano de Mitigação</div>
                <div className="text-[12.5px] font-semibold leading-relaxed">{selecionado.mitigacao}</div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {(() => { const r = usuarios.find((u) => u.id === selecionado.responsavelId); return r ? (
                  <span className="flex items-center gap-2 text-[12.5px] font-semibold"><Avatar nome={r.nome} size={28} /> {r.nome}</span>
                ) : null; })()}
                <span className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: selecionado.tendencia === "Subindo" ? "var(--red)" : selecionado.tendencia === "Diminuindo" ? "var(--green)" : "var(--muted)" }}>
                  <Icon name={selecionado.tendencia === "Diminuindo" ? "tendencia-down" : "tendencia-up"} size={15} /> Tendência: {selecionado.tendencia}
                </span>
                {selecionado.projetoId && (
                  <span className="text-[12px] font-semibold" style={{ color: "var(--blue)" }}>
                    ↳ {projetos.find((p) => p.id === selecionado.projetoId)?.nome}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-5 text-[13px]" style={{ color: "var(--muted)" }}>Selecione um ponto na matriz para ver o detalhe do risco.</div>
          )}

          <div className="card p-5 mt-4">
            <div className="ovl mb-3">Registro por severidade</div>
            <ul className="space-y-1 m-0 p-0 list-none">
              {ordenados.map((r) => {
                const s = r.probabilidade * r.impacto;
                return (
                  <li key={r.id}>
                    <button
                      className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left cursor-pointer border-0 transition-colors"
                      style={{ background: selecionadoId === r.id ? "var(--green-soft)" : "transparent" }}
                      onMouseEnter={(e) => { if (selecionadoId !== r.id) (e.currentTarget as HTMLButtonElement).style.background = "rgba(19,37,29,0.045)"; }}
                      onMouseLeave={(e) => { if (selecionadoId !== r.id) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                      onClick={() => setSelecionadoId(r.id)}
                    >
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-extrabold text-[13px] flex-none"
                        style={{ background: corCelula(r.probabilidade, r.impacto), color: s >= 15 ? "var(--red)" : s >= 8 ? "var(--amber)" : "var(--green)" }}>
                        {s}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[12.5px] font-bold truncate">{r.titulo}</span>
                        <span className="block text-[10.5px]" style={{ color: "var(--muted)" }}>{r.categoria} · P{r.probabilidade} × I{r.impacto}</span>
                      </span>
                      <Icon name="tendencia-up" size={14} className={r.tendencia === "Diminuindo" ? "rotate-180 text-[var(--green)]" : r.tendencia === "Subindo" ? "text-[var(--red)]" : "opacity-40 rotate-90"} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      </div>

      <Modal aberto={modal} onFechar={() => setModal(false)} titulo="Novo Risco" largo
        rodape={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={salvar}><Icon name="check" size={15} /> Registrar risco</button></>}
      >
        <div className="space-y-4">
          <Campo rotulo="Título do risco" obrigatorio><input className="input" placeholder="ex.: Indisponibilidade do sistema de arrecadação" value={novo.titulo} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })} /></Campo>
          <Campo rotulo="Descrição"><textarea className="textarea" rows={2} value={novo.descricao} onChange={(e) => setNovo({ ...novo, descricao: e.target.value })} placeholder="Causas e efeitos potenciais…" /></Campo>
          <div className="grid grid-cols-2 gap-4">
            <Seletor rotulo="Categoria" valor={novo.categoria} onChange={(v) => setNovo({ ...novo, categoria: v as Risco["categoria"] })} opcoes={["Tecnológico", "Operacional", "Financeiro", "Conformidade"]} />
            <Seletor rotulo="Tendência" valor={novo.tendencia} onChange={(v) => setNovo({ ...novo, tendencia: v as Risco["tendencia"] })} opcoes={["Subindo", "Estável", "Diminuindo"]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo={`Probabilidade: ${novo.probabilidade}`}>
              <input type="range" min={1} max={5} value={novo.probabilidade} onChange={(e) => setNovo({ ...novo, probabilidade: Number(e.target.value) })} className="w-full" style={{ accentColor: "var(--green)" }} />
            </Campo>
            <Campo rotulo={`Impacto: ${novo.impacto}`}>
              <input type="range" min={1} max={5} value={novo.impacto} onChange={(e) => setNovo({ ...novo, impacto: Number(e.target.value) })} className="w-full" style={{ accentColor: "var(--red)" }} />
            </Campo>
          </div>
          <div className="rounded-lg px-3.5 py-2.5 text-[12.5px] font-bold" style={{ background: corCelula(novo.probabilidade, novo.impacto) }}>
            Severidade calculada: {novo.probabilidade * novo.impacto} — nível {nivelDe(novo.probabilidade, novo.impacto)}
          </div>
          <Campo rotulo="Plano de mitigação"><textarea className="textarea" rows={2} value={novo.mitigacao} onChange={(e) => setNovo({ ...novo, mitigacao: e.target.value })} placeholder="Ações preventivas e de contingência…" /></Campo>
          <div className="grid grid-cols-2 gap-4">
            <Seletor rotulo="Responsável pelo monitoramento" valor={novo.responsavelId} onChange={(v) => setNovo({ ...novo, responsavelId: v })} opcoes={usuarios.map((u) => ({ valor: u.id, rotulo: u.nome }))} />
            <Seletor rotulo="Projeto vinculado" valor={novo.projetoId} onChange={(v) => setNovo({ ...novo, projetoId: v })} opcoes={[{ valor: "", rotulo: "Sem vínculo" }, ...projetos.map((p) => ({ valor: p.id, rotulo: p.nome }))]} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
