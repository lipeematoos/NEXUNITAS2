import { useMemo, useState } from "react";
import { Campo, Chip, Icon, Modal, Reveal, Seletor, Vazio, useToast } from "../components/ui";
import { CabecalhoPagina } from "../components/shell";
import { Documento } from "../lib/data";
import { DIAS_CURTO, MESES, fmtData, fmtNum, isoData, mesmaData as mesmoDia } from "../lib/format";
import { useApp } from "../lib/store";

const COR_EVENTO: Record<string, { bg: string; fg: string }> = {
  "Reunião": { bg: "var(--blue-soft)", fg: "var(--blue)" },
  "Prazo": { bg: "var(--red-soft)", fg: "var(--red)" },
  "Entrega": { bg: "var(--green-soft)", fg: "var(--green)" },
  "Treinamento": { bg: "var(--cyan-soft)", fg: "var(--cyan)" },
  "Comitê": { bg: "var(--yellow-soft)", fg: "var(--accent-ink)" },
};

/* ===================== Calendário ===================== */

export function Calendario() {
  const { eventos, tarefas, criarEvento } = useApp();
  const toast = useToast();
  const hoje = new Date();
  const [ref, setRef] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [selecionado, setSelecionado] = useState<Date>(hoje);
  const [modal, setModal] = useState(false);
  const [novo, setNovo] = useState({ titulo: "", data: isoData(0), hora: "10:00", tipo: "Reunião" });

  const ano = ref.getFullYear();
  const mes = ref.getMonth();
  const primeiroDow = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();

  const eventosComPrazos = useMemo(() => [
    ...eventos,
    ...tarefas.filter((t) => t.status !== "Concluído").map((t) => ({ id: `tz-${t.id}`, titulo: `Prazo: ${t.titulo}`, data: t.prazo.slice(0, 10), hora: "17:00", tipo: "Prazo" as const })),
  ], [eventos, tarefas]);

  const doDia = (d: Date) => eventosComPrazos.filter((e) => mesmoDia(new Date(e.data + "T12:00:00"), d)).sort((a, b) => a.hora.localeCompare(b.hora));

  const salvar = () => {
    if (!novo.titulo.trim()) { toast("Informe o título do evento", "vermelho"); return; }
    criarEvento({ titulo: novo.titulo.trim(), data: novo.data, hora: novo.hora, tipo: novo.tipo as "Reunião" });
    toast("Evento adicionado à agenda", "verde", `${novo.titulo} — ${fmtData(novo.data)} ${novo.hora}`);
    setModal(false);
    setNovo({ ...novo, titulo: "" });
  };

  const futuros = eventosComPrazos
    .filter((e) => new Date(e.data + "T23:59:59") >= new Date())
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
    .slice(0, 8);

  return (
    <div>
      <CabecalhoPagina
        titulo="Calendário"
        subtitulo="Agenda institucional, prazos de tarefas e entregas de projetos"
        acoes={<button className="btn btn-accent" onClick={() => setModal(true)}><Icon name="mais" size={16} /> Novo Evento</button>}
      />
      <div className="grid lg:grid-cols-[1fr_300px] gap-4 items-start">
        <Reveal>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-extrabold text-[22px] m-0 capitalize tracking-tight">{MESES[mes]} {ano}</h3>
              <div className="flex items-center gap-1.5">
                <button className="icon-btn" onClick={() => setRef(new Date(ano, mes - 1, 1))} aria-label="Mês anterior"><Icon name="chevron-e" size={17} /></button>
                <button className="btn btn-outline !py-1.5 text-[12px]" onClick={() => { setRef(new Date(hoje.getFullYear(), hoje.getMonth(), 1)); setSelecionado(hoje); }}>Hoje</button>
                <button className="icon-btn" onClick={() => setRef(new Date(ano, mes + 1, 1))} aria-label="Próximo mês"><Icon name="chevron-d" size={17} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {DIAS_CURTO.map((d) => <div key={d} className="text-center text-[10.5px] font-bold uppercase tracking-wider py-1" style={{ color: "var(--muted)" }}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: primeiroDow }).map((_, i) => <div key={`v${i}`} />)}
              {Array.from({ length: totalDias }).map((_, i) => {
                const dia = i + 1;
                const data = new Date(ano, mes, dia);
                const evs = doDia(data);
                const ehHoje = mesmoDia(data, hoje);
                const ehSel = mesmoDia(data, selecionado);
                return (
                  <button
                    key={dia}
                    onClick={() => setSelecionado(data)}
                    className="relative min-h-[74px] rounded-lg p-1.5 text-left cursor-pointer transition-all border align-top"
                    style={{
                      background: ehSel ? "var(--green-soft)" : "var(--card)",
                      borderColor: ehHoje ? "var(--accent)" : ehSel ? "var(--green)" : "var(--line)",
                      boxShadow: ehHoje ? "0 0 0 2px rgba(242,183,10,0.4)" : undefined,
                    }}
                  >
                    <span className={`text-[12px] font-bold ${ehHoje ? "inline-flex items-center justify-center w-5 h-5 rounded-full text-white" : ""}`} style={ehHoje ? { background: "var(--deep)" } : undefined}>
                      {dia}
                    </span>
                    <span className="block space-y-0.5 mt-0.5">
                      {evs.slice(0, 2).map((e) => (
                        <span key={e.id} className="block text-[9.5px] font-bold leading-tight rounded px-1 py-0.5 truncate" style={{ background: COR_EVENTO[e.tipo].bg, color: COR_EVENTO[e.tipo].fg }}>
                          {e.hora} {e.titulo}
                        </span>
                      ))}
                      {evs.length > 2 && <span className="block text-[9px] font-bold pl-1" style={{ color: "var(--muted)" }}>+{fmtNum(evs.length - 2)} mais</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              {Object.entries(COR_EVENTO).map(([k, v]) => (
                <span key={k} className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: "var(--muted)" }}>
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: v.bg, border: `1px solid ${v.fg}` }} /> {k}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="space-y-4">
          <Reveal delay={80}>
            <div className="card p-5">
              <div className="ovl mb-3 capitalize">{fmtData(selecionado)} — agenda do dia</div>
              {doDia(selecionado).length === 0 ? (
                <p className="text-[12.5px] m-0" style={{ color: "var(--muted)" }}>Nenhum evento ou prazo nesta data.</p>
              ) : (
                <ul className="space-y-2 m-0 p-0 list-none">
                  {doDia(selecionado).map((e) => (
                    <li key={e.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5" style={{ background: COR_EVENTO[e.tipo].bg }}>
                      <span className="font-display font-extrabold text-[13px] tabular-nums" style={{ color: COR_EVENTO[e.tipo].fg }}>{e.hora}</span>
                      <span className="text-[12px] font-bold flex-1" style={{ color: COR_EVENTO[e.tipo].fg }}>{e.titulo}</span>
                    </li>
                  ))}
                </ul>
              )}
              <button className="btn btn-outline w-full mt-3 !py-2 text-[12.5px]" onClick={() => { setNovo({ ...novo, data: isoData(Math.round((selecionado.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)) }); setModal(true); }}>
                <Icon name="mais" size={14} /> Adicionar evento neste dia
              </button>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div className="card p-5">
              <div className="ovl mb-3">Próximos eventos</div>
              <ul className="space-y-2.5 m-0 p-0 list-none">
                {futuros.map((e) => (
                  <li key={e.id} className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: COR_EVENTO[e.tipo].fg }} />
                    <span className="flex-1 text-[12px] font-semibold truncate">{e.titulo}</span>
                    <span className="text-[11px] font-bold tabular-nums" style={{ color: "var(--muted)" }}>{fmtData(e.data)} {e.hora}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>

      <Modal aberto={modal} onFechar={() => setModal(false)} titulo="Novo Evento"
        rodape={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={salvar}><Icon name="check" size={15} /> Salvar evento</button></>}
      >
        <div className="space-y-4">
          <Campo rotulo="Título" obrigatorio><input className="input" placeholder="ex.: Reunião com Secretaria de Obras" value={novo.titulo} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })} /></Campo>
          <div className="grid grid-cols-3 gap-3">
            <Campo rotulo="Data" obrigatorio><input className="input" type="date" value={novo.data} onChange={(e) => setNovo({ ...novo, data: e.target.value })} /></Campo>
            <Campo rotulo="Hora" obrigatorio><input className="input" type="time" value={novo.hora} onChange={(e) => setNovo({ ...novo, hora: e.target.value })} /></Campo>
            <Seletor rotulo="Tipo" valor={novo.tipo} onChange={(v) => setNovo({ ...novo, tipo: v })} opcoes={Object.keys(COR_EVENTO)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ===================== Documentos ===================== */

const COR_ARQ: Record<string, string> = { PDF: "var(--red)", DOCX: "var(--blue)", XLSX: "var(--green)", PPTX: "var(--amber)" };

export function Documentos() {
  const { documentos, usuarios, criarDocumento } = useApp();
  const toast = useToast();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todas");
  const [modal, setModal] = useState(false);
  const [novo, setNovo] = useState({ nome: "", categoria: "Norma", tipoArquivo: "PDF" as Documento["tipoArquivo"], status: "Em revisão" as Documento["status"], tamanho: "1,0 MB" });

  const categorias = ["Todas", ...Array.from(new Set(documentos.map((d) => d.categoria)))];
  const filtrados = documentos.filter((d) =>
    (filtro === "Todas" || d.categoria === filtro) &&
    (busca.trim() === "" || d.nome.toLowerCase().includes(busca.trim().toLowerCase()))
  );

  const salvar = () => {
    if (!novo.nome.trim()) { toast("Informe o nome do documento", "vermelho"); return; }
    criarDocumento({ nome: novo.nome.trim(), categoria: novo.categoria, tipoArquivo: novo.tipoArquivo, status: novo.status, responsavelId: "u1", tamanho: novo.tamanho });
    toast("Documento enviado", "verde", `${novo.nome} — v1.0`);
    setModal(false);
    setNovo({ ...novo, nome: "" });
  };

  return (
    <div>
      <CabecalhoPagina
        titulo="Documentos"
        subtitulo={`${fmtNum(documentos.length)} documentos normativos e técnicos sob gestão do DTI`}
        acoes={<button className="btn btn-accent" onClick={() => setModal(true)}><Icon name="enviar" size={16} /> Enviar Documento</button>}
      />
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative">
          <Icon name="busca" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input className="input pl-9 w-[260px]" placeholder="Pesquisar documento…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <select className="select !w-[170px]" value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtrar por categoria">
          {categorias.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {filtrados.length === 0 ? (
        <div className="card"><Vazio icone="documentos" titulo="Nenhum documento encontrado" dica="Ajuste a pesquisa ou a categoria." /></div>
      ) : (
        <Reveal>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="tbl min-w-[760px]">
                <thead><tr><th>Documento</th><th>Categoria</th><th>Versão</th><th>Situação</th><th>Atualizado</th><th>Responsável</th><th className="text-right">Ações</th></tr></thead>
                <tbody>
                  {filtrados.map((d) => {
                    const resp = usuarios.find((u) => u.id === d.responsavelId);
                    return (
                      <tr key={d.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-lg flex items-center justify-center text-[9.5px] font-extrabold flex-none" style={{ background: "rgba(19,37,29,0.05)", color: COR_ARQ[d.tipoArquivo] }}>
                              {d.tipoArquivo}
                            </span>
                            <div className="min-w-0">
                              <div className="font-bold text-[12.5px] truncate max-w-[280px]">{d.nome}</div>
                              <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{d.tamanho}</div>
                            </div>
                          </div>
                        </td>
                        <td><Chip tom="cinza" dot={false}>{d.categoria}</Chip></td>
                        <td className="font-bold tabular-nums text-[12px]">{d.versao}</td>
                        <td><Chip tom={d.status === "Em vigor" ? "verde" : d.status === "Em revisão" ? "ambar" : d.status === "Aprovado" ? "azul" : "cinza"}>{d.status}</Chip></td>
                        <td className="text-[12px] tabular-nums whitespace-nowrap">{fmtData(d.atualizadoEm)}</td>
                        <td className="text-[12px] font-semibold whitespace-nowrap">{resp?.nome.split(" ").slice(0, 2).join(" ")}</td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <button className="icon-btn" title="Baixar" aria-label="Baixar" onClick={() => toast("Download iniciado", "azul", `${d.nome} (${d.tamanho})`)}><Icon name="baixar" size={16} /></button>
                            <button className="icon-btn" title="Histórico de versões" aria-label="Histórico" onClick={() => toast("Histórico de versões", "verde", `${d.nome}: ${d.versao} é a versão atual`)}><Icon name="relogio" size={16} /></button>
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

      <Modal aberto={modal} onFechar={() => setModal(false)} titulo="Enviar Documento"
        rodape={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={salvar}><Icon name="enviar" size={15} /> Enviar</button></>}
      >
        <div className="space-y-4">
          <Campo rotulo="Nome do documento" obrigatorio><input className="input" placeholder="ex.: Portaria de Nomeação do Comitê de TI" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} /></Campo>
          <div className="grid grid-cols-2 gap-3">
            <Seletor rotulo="Categoria" valor={novo.categoria} onChange={(v) => setNovo({ ...novo, categoria: v })} opcoes={["Política", "Manual", "Norma", "Plano", "Ata", "Termo", "Guia", "Inventário"]} />
            <Seletor rotulo="Formato" valor={novo.tipoArquivo} onChange={(v) => setNovo({ ...novo, tipoArquivo: v as Documento["tipoArquivo"] })} opcoes={["PDF", "DOCX", "XLSX", "PPTX"]} />
          </div>
          <div
            className="rounded-lg border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors hover:bg-[rgba(30,122,84,0.04)]"
            style={{ borderColor: "var(--line-2)" }}
            onClick={() => toast("Arquivo anexado", "verde", "documento_versao_final.pdf (simulação)")}
          >
            <Icon name="enviar" size={22} className="mx-auto mb-2 opacity-50" />
            <div className="text-[12.5px] font-bold">Clique para anexar o arquivo</div>
            <div className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>PDF, DOCX, XLSX ou PPTX até 50 MB</div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
