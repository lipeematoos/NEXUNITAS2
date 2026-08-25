import { useMemo, useState } from "react";
import { Avatar, Campo, Chip, Icon, Modal, PainelLateral, PrioridadeChip, Reveal, Seletor, StatusChamadoChip, Vazio, useToast } from "../../components/ui";
import { CabecalhoPagina } from "../../components/shell";
import { CATEGORIAS_PORTAL, Chamado, STATUS_CHAMADO, TIPO_CHAMADO } from "../../lib/data";
import { fmtData, fmtDataHora, fmtNum, tempoRel } from "../../lib/format";
import { useApp } from "../../lib/store";
import AdminCentral from "./AdminCentral";

type Aba = "portal" | "fila" | "meus" | "base" | "roteamento" | "admin";

export default function CentralTI({ irPara }: { irPara: (v: string) => void }) {
  const app = useApp();
  const {
    chamados, servicos, gruposSuporte, usuarios, unidades, ativos, regrasSLA, config, atual,
    abrirChamado, mudarStatusChamado, atribuirChamado, comentarChamado, decidirAprovacao,
    setServicos, setRegrasSLA, criarArtigoBase, baseConhecimento, temPermissao,
    simularRoteamento, modoRestrito,
  } = app;
  const toast = useToast();
  const [aba, setAba] = useState<Aba>("portal");
  const [catSel, setCatSel] = useState<string | null>(null);
  const [detalhe, setDetalhe] = useState<Chamado | null>(null);
  const [modalNovo, setModalNovo] = useState(false);
  const [modalAtribuir, setModalAtribuir] = useState(false);
  const [modalDecisao, setModalDecisao] = useState<{ etapaId: string; decisao: "Aprovado" | "Rejeitado" | "Ajuste solicitado" } | null>(null);
  const [comentarioDecisao, setComentarioDecisao] = useState("");
  const [novoComentario, setNovoComentario] = useState("");
  const [tipoComentario, setTipoComentario] = useState<"resposta" | "interna">("resposta");
  const [buscaFila, setBuscaFila] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState("Todas");
  const [artigoAberto, setArtigoAberto] = useState<string | null>(null);
  const [modalArtigo, setModalArtigo] = useState(false);
  const [novoArtigo, setNovoArtigo] = useState({ titulo: "", categoria: "Usuários e Senhas", conteudo: "", visibilidade: "Todos" });
  const [novo, setNovo] = useState({
    titulo: "", descricao: "", tipo: "Solicitação de Serviço" as (typeof TIPO_CHAMADO)[number],
    categoriaId: "cat4", servicoId: "sv1", prioridade: "Normal", local: "", patrimonioId: "",
    tecnicoPreferencialId: "",
  });

  const chamadoAtual = detalhe ? chamados.find((c) => c.id === detalhe.id) ?? null : null;
  const nomeDe = (id: string | null) => usuarios.find((u) => u.id === id);
  const unidadeDe = (id: string) => unidades.find((u) => u.id === id);

  const previaRota = useMemo(
    () => simularRoteamento(atual.unidadeId, novo.servicoId || null, novo.categoriaId),
    [novo.servicoId, novo.categoriaId, simularRoteamento, atual.unidadeId]
  );
  const servicoSel = servicos.find((s) => s.id === novo.servicoId);
  const permiteTecnico = (servicoSel?.selecaoTecnico ?? "Não") !== "Não";
  const tecnicosDisponiveis = gruposSuporte.find((g) => g.id === previaRota.grupoId)?.membroIds ?? [];

  /* ===== Fila e indicadores ===== */
  const hoje = new Date().toISOString().slice(0, 10);
  const resumo = useMemo(() => [
    { rotulo: "Novos / Triagem", n: chamados.filter((c) => ["Aberto", "Em Triagem"].includes(c.status)).length, cor: "var(--blue)" },
    { rotulo: "Aguardando Aprovação", n: chamados.filter((c) => c.status === "Aguardando Aprovação").length, cor: "var(--amber)" },
    { rotulo: "Aprovados p/ executar", n: chamados.filter((c) => c.status === "Aprovado").length, cor: "var(--green)" },
    { rotulo: "Em Atendimento", n: chamados.filter((c) => c.status === "Em Atendimento").length, cor: "var(--cyan)" },
    { rotulo: "Aguardando Usuário", n: chamados.filter((c) => c.status === "Aguardando Usuário").length, cor: "var(--amber)" },
    { rotulo: "Atrasados", n: chamados.filter((c) => !["Fechado", "Resolvido", "Cancelado", "Rejeitado"].includes(c.status) && c.prazoResolucao < new Date().toISOString()).length, cor: "var(--red)" },
    { rotulo: "Críticos", n: chamados.filter((c) => c.prioridade === "Crítica" && !["Fechado", "Resolvido", "Cancelado"].includes(c.status)).length, cor: "var(--red)" },
    { rotulo: "Resolvidos Hoje", n: chamados.filter((c) => c.status === "Resolvido" && c.historico.some((h) => h.acao.includes("resolvido") && h.data.slice(0, 10) === hoje)).length, cor: "var(--green)" },
  ], [chamados, hoje]);

  const fila = useMemo(() => chamados.filter((c) =>
    (filtroStatus === "Todos" || c.status === filtroStatus) &&
    (filtroPrioridade === "Todas" || c.prioridade === filtroPrioridade) &&
    (buscaFila.trim() === "" || `${c.numero} ${c.titulo}`.toLowerCase().includes(buscaFila.trim().toLowerCase()))
  ), [chamados, filtroStatus, filtroPrioridade, buscaFila]);

  const meus = chamados.filter((c) => c.solicitanteId === atual.id || c.tecnicoId === atual.id);

  /* ===== Ações ===== */
  const abrirNovo = () => {
    if (modoRestrito) { toast("Sistema em modo restrito", "vermelho", "A criação de novos chamados está bloqueada por licenciamento. Consultas e relatórios continuam disponíveis."); return; }
    if (!novo.titulo.trim() || !novo.descricao.trim()) { toast("Preencha título e descrição", "vermelho"); return; }
    if (!novo.local.trim()) { toast("Informe a sala / local do atendimento", "vermelho"); return; }
    if (servicoSel?.selecaoTecnico === "Obrigatório" && !novo.tecnicoPreferencialId) { toast("Este serviço exige a escolha de um técnico", "vermelho", "Selecione o técnico preferencial do grupo responsável."); return; }
    const criado = abrirChamado({ ...novo, servicoId: novo.servicoId || null, patrimonioId: novo.patrimonioId || null, tecnicoPreferencialId: novo.tecnicoPreferencialId || null });
    toast("Chamado registrado", "verde", `${criado.numero} — prazo ${fmtData(criado.prazoResolucao)} ${new Date(criado.prazoResolucao).getHours()}h`);
    if (criado.status === "Aguardando Aprovação") toast("Enviado para aprovação", "ambar", "A execução depende da aprovação configurada para este serviço.");
    setModalNovo(false);
    setNovo({ ...novo, titulo: "", descricao: "", local: "", patrimonioId: "" });
    setAba("meus");
  };

  const enviarComentario = () => {
    if (!chamadoAtual || !novoComentario.trim()) return;
    comentarChamado(chamadoAtual.id, novoComentario.trim(), tipoComentario);
    toast(tipoComentario === "resposta" ? "Resposta enviada ao solicitante" : "Nota interna registrada", tipoComentario === "resposta" ? "verde" : "ambar");
    setNovoComentario("");
  };

  const confirmarDecisao = () => {
    if (!chamadoAtual || !modalDecisao) return;
    decidirAprovacao(chamadoAtual.id, modalDecisao.etapaId, modalDecisao.decisao, comentarioDecisao);
    toast(
      modalDecisao.decisao === "Aprovado" ? "Etapa aprovada" : modalDecisao.decisao === "Rejeitado" ? "Solicitação rejeitada" : "Ajuste solicitado",
      modalDecisao.decisao === "Aprovado" ? "verde" : modalDecisao.decisao === "Rejeitado" ? "vermelho" : "ambar",
      chamadoAtual.numero
    );
    setComentarioDecisao("");
    setModalDecisao(null);
  };

  const servicosDaCat = servicos.filter((s) => !catSel || s.categoriaId === catSel);
  const podeGerir = temPermissao("ticket.manage");
  const podeAprovar = temPermissao("ticket.approve") || temPermissao("system.configure");
  const artigosVisiveis = baseConhecimento.filter((a) => a.visibilidade === "Todos" || podeGerir);

  const ABAS: { chave: Aba; rotulo: string; icone: string }[] = [
    { chave: "portal", rotulo: "Portal de Serviços", icone: "painel" },
    { chave: "fila", rotulo: "Fila de Atendimento", icone: "fone" },
    { chave: "meus", rotulo: "Meus Chamados", icone: "usuario" },
    { chave: "base", rotulo: "Base de Conhecimento", icone: "documentos" },
    ...(podeGerir ? [{ chave: "roteamento" as Aba, rotulo: "Roteamento e Domínios", icone: "fluxos" }] : []),
    ...(podeGerir ? [{ chave: "admin" as Aba, rotulo: "Administração da Central", icone: "engrenagem" }] : []),
  ];

  return (
    <div>
      <CabecalhoPagina
        titulo="Central de Serviços de TI"
        subtitulo={`${fmtNum(chamados.filter((c) => !["Fechado", "Cancelado", "Rejeitado"].includes(c.status)).length)} chamados ativos · SLA por prioridade vigente · prefixo ${config.centralTI.prefixo}`}
        acoes={
          <>
            <button className="btn btn-outline" onClick={() => irPara("aprovacoes")}>
              <Icon name="carimbo" size={16} /> Aprovações Pendentes
              {chamados.filter((c) => c.status === "Aguardando Aprovação").length > 0 && (
                <span className="chip !text-[10px] !px-1.5" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}>
                  {fmtNum(chamados.filter((c) => c.status === "Aguardando Aprovação").length)}
                </span>
              )}
            </button>
            <button className="btn btn-accent" onClick={() => { setCatSel(null); setModalNovo(true); }}>
              <Icon name="mais" size={16} /> Solicitar Atendimento
            </button>
          </>
        }
      />

      <div className="flex gap-1 mb-5 overflow-x-auto" style={{ borderBottom: "1px solid var(--line)" }}>
        {ABAS.map((a) => (
          <button key={a.chave} className={`tab-btn ${aba === a.chave ? "on" : ""}`} onClick={() => setAba(a.chave)}>
            <span className="inline-flex items-center gap-1.5"><Icon name={a.icone} size={14} /> {a.rotulo}</span>
          </button>
        ))}
      </div>

      {/* ===== Portal de Serviços ===== */}
      {aba === "portal" && (
        <>
          <div className="ovl mb-3">Como podemos ajudar?</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
            {CATEGORIAS_PORTAL.map((c, i) => {
              const qt = servicos.filter((s) => s.categoriaId === c.id).length;
              return (
                <Reveal key={c.id} delay={Math.min(i, 8) * 40}>
                  <button
                    className="card card-hover w-full text-left p-4 cursor-pointer block"
                    style={catSel === c.id ? { borderColor: "var(--green)", boxShadow: "0 0 0 2px rgba(30,122,84,0.18)" } : undefined}
                    onClick={() => setCatSel(catSel === c.id ? null : c.id)}
                  >
                    <span className="w-10 h-10 rounded-lg flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110" style={{ background: "var(--green-soft)", color: "var(--green)" }}>
                      <Icon name={c.icone} size={20} />
                    </span>
                    <div className="text-[12.5px] font-bold leading-tight">{c.nome}</div>
                    <div className="text-[10.5px] mt-1 leading-snug" style={{ color: "var(--muted)" }}>{c.descricao}</div>
                    {qt > 0 && <span className="chip mt-2" style={{ background: "var(--grey-soft)", color: "var(--grey)" }}>{qt} serviços</span>}
                  </button>
                </Reveal>
              );
            })}
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="ovl">{catSel ? `Serviços — ${CATEGORIAS_PORTAL.find((c) => c.id === catSel)?.nome}` : "Todos os serviços do catálogo"}</div>
            {catSel && <button className="btn btn-ghost !py-1 text-[11.5px]" onClick={() => setCatSel(null)}>Limpar filtros</button>}
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {servicosDaCat.map((s) => {
              const regra = s.regraAprovacaoId;
              return (
                <div key={s.id} className="card card-hover p-4 flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-none" style={{ background: "var(--blue-soft)", color: "var(--blue)" }}>
                    <Icon name={CATEGORIAS_PORTAL.find((c) => c.id === s.categoriaId)?.icone ?? "info"} size={17} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-bold">{s.nome}</span>
                      {s.requerAprovacao && <Chip tom="ambar" dot={false}><Icon name="carimbo" size={10} /> Aprovação</Chip>}
                    </div>
                    <p className="text-[11.5px] mt-1 mb-2 leading-snug" style={{ color: "var(--muted)" }}>{s.descricao}</p>
                    <div className="flex items-center gap-3 text-[10.5px] font-semibold" style={{ color: "var(--muted)" }}>
                      <span className="flex items-center gap-1"><Icon name="equipes" size={12} /> {gruposSuporte.find((g) => g.id === s.grupoId)?.nome}</span>
                      <span className="flex items-center gap-1"><Icon name="relogio" size={12} /> SLA {regrasSLA.find((r) => r.prioridade === s.prioridadePadrao)?.resolucaoHoras ?? 24}h</span>
                    </div>
                  </div>
                  <button className="btn btn-outline !py-1.5 text-[11.5px] flex-none" onClick={() => { setNovo({ ...novo, categoriaId: s.categoriaId, servicoId: s.id, prioridade: s.prioridadePadrao, tipo: "Solicitação de Serviço" }); setModalNovo(true); }}>
                    Solicitar
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ===== Fila ===== */}
      {aba === "fila" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5 mb-4">
            {resumo.map((r, i) => (
              <Reveal key={r.rotulo} delay={i * 35}>
                <div className="card px-3.5 py-3 card-hover">
                  <div className="font-display font-extrabold text-[24px] leading-none tabular-nums" style={{ color: r.cor }}>{fmtNum(r.n)}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mt-1.5" style={{ color: "var(--muted)" }}>{r.rotulo}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative">
              <Icon name="busca" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input className="input pl-9 w-[240px]" placeholder="Número ou título…" value={buscaFila} onChange={(e) => setBuscaFila(e.target.value)} />
            </div>
            <select className="select !w-[190px]" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} aria-label="Filtrar por status">
              {["Todos", ...STATUS_CHAMADO.map((s) => s.label)].map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="select !w-[150px]" value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)} aria-label="Filtrar por prioridade">
              {["Todas", "Crítica", "Urgente", "Alta", "Normal", "Baixa"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <span className="text-[12px] font-semibold self-center" style={{ color: "var(--muted)" }}>{fmtNum(fila.length)} resultados</span>
          </div>
          {fila.length === 0 ? (
            <div className="card"><Vazio icone="fone" titulo="Nenhum chamado encontrado" dica="Ajuste os filtros ou abra um novo atendimento." /></div>
          ) : (
            <div className="card overflow-hidden anim-rise">
              <div className="overflow-x-auto">
                <table className="tbl min-w-[860px]">
                  <thead><tr><th>Número</th><th>Título</th><th>Tipo</th><th>Solicitante</th><th>Prioridade</th><th>Status</th><th>Prazo</th><th>Técnico</th></tr></thead>
                  <tbody>
                    {fila.map((c) => {
                      const atrasado = !["Fechado", "Resolvido", "Cancelado", "Rejeitado"].includes(c.status) && c.prazoResolucao < new Date().toISOString();
                      return (
                        <tr key={c.id} className="cursor-pointer" onClick={() => setDetalhe(c)}>
                          <td className="font-bold tabular-nums text-[12px] whitespace-nowrap">{c.numero}</td>
                          <td className="font-semibold text-[12.5px] max-w-[260px] truncate">{c.titulo}</td>
                          <td><Chip tom={c.tipo === "Incidente" ? "vermelho" : "azul"} dot={false}>{c.tipo === "Incidente" ? "Incidente" : "Solicitação"}</Chip></td>
                          <td className="text-[12px] whitespace-nowrap">{nomeDe(c.solicitanteId)?.nome.split(" ").slice(0, 2).join(" ")}</td>
                          <td><PrioridadeChip p={c.prioridade} /></td>
                          <td><StatusChamadoChip s={c.status} /></td>
                          <td className="whitespace-nowrap text-[12px] tabular-nums font-bold" style={{ color: atrasado ? "var(--red)" : undefined }}>
                            {fmtData(c.prazoResolucao)} {atrasado && "· atrasado"}
                          </td>
                          <td className="text-[12px] whitespace-nowrap">{c.tecnicoId ? nomeDe(c.tecnicoId)?.nome.split(" ")[0] : <span style={{ color: "var(--muted)" }}>Não atribuído</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== Meus chamados ===== */}
      {aba === "meus" && (
        meus.length === 0 ? (
          <div className="card"><Vazio icone="fone" titulo="Você ainda não possui chamados" dica="Use o Portal de Serviços para solicitar atendimento." /></div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {meus.map((c) => (
              <button key={c.id} className="card card-hover p-4 text-left cursor-pointer block" onClick={() => setDetalhe(c)}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: "var(--muted)" }}>{c.numero}</span>
                  <StatusChamadoChip s={c.status} />
                </div>
                <div className="text-[13px] font-bold leading-snug mb-2">{c.titulo}</div>
                <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: "var(--muted)" }}>
                  <PrioridadeChip p={c.prioridade} />
                  <span className="ml-auto flex items-center gap-1"><Icon name="relogio" size={12} /> {fmtData(c.prazoResolucao)}</span>
                </div>
                <div className="mt-2.5 pt-2.5 text-[11px] flex items-center gap-1.5" style={{ borderTop: "1px dashed var(--line)", color: "var(--muted)" }}>
                  {c.solicitanteId === atual.id
                    ? <><Icon name="usuario" size={12} /> Aberto por você {tempoRel(c.criadoEm)}</>
                    : <><Icon name="fone" size={12} /> Você é o técnico responsável</>}
                </div>
              </button>
            ))}
          </div>
        )
      )}

      {/* ===== Base de conhecimento ===== */}
      {aba === "base" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="ovl">{fmtNum(artigosVisiveis.length)} artigos publicados</div>
            <button className="btn btn-outline !py-1.5 text-[12px]" onClick={() => setModalArtigo(true)}><Icon name="mais" size={14} /> Novo Artigo</button>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {artigosVisiveis.map((a) => (
              <button key={a.id} className="card card-hover p-4 text-left cursor-pointer block" onClick={() => setArtigoAberto(a.id)}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--cyan-soft)", color: "var(--cyan)" }}><Icon name="documentos" size={15} /></span>
                  <Chip tom="cinza" dot={false}>{a.categoria}</Chip>
                  <Chip tom={a.status === "Publicado" ? "verde" : "ambar"} dot={false}>{a.status}</Chip>
                </div>
                <div className="text-[13px] font-bold leading-snug">{a.titulo}</div>
                <div className="text-[11px] mt-1.5 flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                  <Icon name="relogio" size={12} /> Atualizado {tempoRel(a.atualizadoEm)} · {a.visibilidade === "Todos" ? "Toda a organização" : "Somente TI"}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ===== Administração ===== */}
      {aba === "admin" && (
        <div className="grid lg:grid-cols-2 gap-4 items-start">
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--line)" }}>
              <div className="font-display font-bold text-[15px]">Catálogo de Serviços</div>
              <div className="text-[11.5px]" style={{ color: "var(--muted)" }}>Exigência de aprovação, grupo executor e prioridade padrão — sem alterar código.</div>
            </div>
            <div className="overflow-x-auto">
              <table className="tbl min-w-[520px]">
                <thead><tr><th>Serviço</th><th>Grupo</th><th>Prioridade</th><th>Aprovação</th></tr></thead>
                <tbody>
                  {servicos.map((s) => (
                    <tr key={s.id}>
                      <td className="font-bold text-[12px]">{s.nome}</td>
                      <td>
                        <select className="select !py-1 !text-[11.5px] !w-[150px]" value={s.grupoId} onChange={(e) => { setServicos(servicos.map((x) => x.id === s.id ? { ...x, grupoId: e.target.value } : x)); toast("Grupo executor atualizado", "verde", `${s.nome} → ${gruposSuporte.find((g) => g.id === e.target.value)?.nome}`); }}>
                          {gruposSuporte.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                        </select>
                      </td>
                      <td>
                        <select className="select !py-1 !text-[11.5px] !w-[110px]" value={s.prioridadePadrao} onChange={(e) => setServicos(servicos.map((x) => x.id === s.id ? { ...x, prioridadePadrao: e.target.value } : x))}>
                          {["Crítica", "Urgente", "Alta", "Normal", "Baixa"].map((p) => <option key={p}>{p}</option>)}
                        </select>
                      </td>
                      <td>
                        <button
                          className="chip cursor-pointer border-0 transition-all"
                          style={s.requerAprovacao ? { background: "var(--amber-soft)", color: "var(--amber)" } : { background: "var(--grey-soft)", color: "var(--grey)" }}
                          onClick={() => { setServicos(servicos.map((x) => x.id === s.id ? { ...x, requerAprovacao: !x.requerAprovacao } : x)); toast(s.requerAprovacao ? "Aprovação removida" : "Aprovação exigida", s.requerAprovacao ? "verde" : "ambar", s.nome); }}
                        >
                          {s.requerAprovacao ? "Exigida" : "Não exigida"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card overflow-hidden">
              <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--line)" }}>
                <div className="font-display font-bold text-[15px]">Regras de SLA</div>
                <div className="text-[11.5px]" style={{ color: "var(--muted)" }}>Primeira resposta e resolução por prioridade. Expediente: {config.centralTI.expediente}.</div>
              </div>
              <table className="tbl">
                <thead><tr><th>Prioridade</th><th>1ª resposta (min)</th><th>Resolução (h)</th></tr></thead>
                <tbody>
                  {regrasSLA.map((r) => (
                    <tr key={r.prioridade}>
                      <td><PrioridadeChip p={r.prioridade} /></td>
                      <td><input className="input !py-1 !w-[86px] text-center tabular-nums" type="number" value={r.primeiraRespostaMin} onChange={(e) => setRegrasSLA(regrasSLA.map((x) => x.prioridade === r.prioridade ? { ...x, primeiraRespostaMin: Number(e.target.value) } : x))} /></td>
                      <td><input className="input !py-1 !w-[86px] text-center tabular-nums" type="number" value={r.resolucaoHoras} onChange={(e) => setRegrasSLA(regrasSLA.map((x) => x.prioridade === r.prioridade ? { ...x, resolucaoHoras: Number(e.target.value) } : x))} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card p-5">
              <div className="font-display font-bold text-[15px] mb-3">Grupos de Atendimento</div>
              <div className="grid grid-cols-2 gap-2.5">
                {gruposSuporte.map((g) => (
                  <div key={g.id} className="rounded-lg px-3.5 py-3" style={{ background: "rgba(19,37,29,0.04)" }}>
                    <div className="text-[12.5px] font-bold">{g.nome}</div>
                    <div className="flex -space-x-1.5 mt-1.5">
                      {g.membroIds.map((id) => <Avatar key={id} nome={nomeDe(id)?.nome ?? "?"} size={22} />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Roteamento e domínios ===== */}
      {aba === "roteamento" && <AdminCentral />}

      {/* ===== Drawer do chamado ===== */}
      <PainelLateral aberto={!!chamadoAtual} onFechar={() => setDetalhe(null)}
        titulo={chamadoAtual ? <span className="flex items-center gap-2"><span className="tabular-nums" style={{ color: "var(--muted)", fontSize: 12 }}>{chamadoAtual.numero}</span> <StatusChamadoChip s={chamadoAtual.status} /></span> : ""}>
        {chamadoAtual && (() => {
          const c = chamadoAtual;
          const sol = nomeDe(c.solicitanteId);
          const ativoVinc = c.patrimonioId ? ativos.find((a) => a.id === c.patrimonioId) : null;
          const etapaPendente = c.aprovacoes.find((a) => a.status === "Pendente");
          const atrasado = !["Fechado", "Resolvido", "Cancelado", "Rejeitado"].includes(c.status) && c.prazoResolucao < new Date().toISOString();
          return (
            <div className="space-y-5">
              <div>
                <h3 className="font-display font-bold text-[17px] m-0 leading-snug">{c.titulo}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Chip tom={c.tipo === "Incidente" ? "vermelho" : "azul"} dot={false}>{c.tipo}</Chip>
                  <PrioridadeChip p={c.prioridade} />
                  <span className="chip" style={{ background: atrasado ? "var(--red-soft)" : "var(--grey-soft)", color: atrasado ? "var(--red)" : "var(--grey)" }}>
                    <Icon name="relogio" size={11} /> SLA: {fmtDataHora(c.prazoResolucao)} {atrasado && "· ESTOURADO"}
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed mt-3 mb-0" style={{ color: "var(--muted)" }}>{c.descricao}</p>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-lg p-4" style={{ background: "rgba(19,37,29,0.035)" }}>
                {[
                  ["Solicitante", <span key="s" className="flex items-center gap-2"><Avatar nome={sol?.nome ?? "?"} size={22} /> {sol?.nome}</span>],
                  ["Matrícula", sol?.matricula],
                  ["Unidade", `${unidadeDe(c.unidadeId)?.sigla} — ${unidadeDe(c.unidadeId)?.nome}`],
                  ["Local", c.local],
                  ["Serviço", servicos.find((s) => s.id === c.servicoId)?.nome ?? (c.categoriaId ? CATEGORIAS_PORTAL.find((cc) => cc.id === c.categoriaId)?.nome ?? "—" : "—")],
                  ["Grupo", gruposSuporte.find((g) => g.id === c.grupoId)?.nome ?? "Não definido"],
                  ["Técnico", c.tecnicoId ? nomeDe(c.tecnicoId)?.nome : "Não atribuído"],
                  ["Aberto em", fmtDataHora(c.criadoEm)],
                ].map(([k, v], i) => (
                  <div key={i}>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{k}</div>
                    <div className="text-[12.5px] font-semibold mt-0.5">{v}</div>
                  </div>
                ))}
              </div>

              {ativoVinc && (
                <div className="rounded-lg p-4" style={{ background: "var(--blue-soft)", border: "1px solid rgba(32,101,159,0.25)" }}>
                  <div className="flex items-center gap-2 mb-2" style={{ color: "var(--blue)" }}>
                    <Icon name="caixa" size={16} /> <span className="text-[11px] font-bold uppercase tracking-wider">Equipamento relacionado</span>
                  </div>
                  <div className="text-[13px] font-bold">Patrimônio {ativoVinc.patrimonio} — {ativoVinc.fabricante} {ativoVinc.modelo}</div>
                  <div className="text-[11.5px] mt-1 grid grid-cols-2 gap-x-3" style={{ color: "var(--muted)" }}>
                    {ativoVinc.rede && <span>Hostname: <strong>{ativoVinc.rede.hostname}</strong></span>}
                    {ativoVinc.rede && <span>IP: <strong>{ativoVinc.rede.ipv4}</strong></span>}
                    {ativoVinc.rede && <span>Domínio: <strong>{ativoVinc.rede.dominio}</strong></span>}
                    <span>Série: <strong>{ativoVinc.serie}</strong></span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="btn btn-outline !py-1.5 text-[11.5px]" style={{ background: "#fff" }} onClick={() => irPara("patrimonio")}><Icon name="olho" size={13} /> Ver Equipamento</button>
                    <button className="btn btn-outline !py-1.5 text-[11.5px]" style={{ background: "#fff" }} onClick={() => toast("Histórico carregado", "azul", `${ativoVinc.manutencoes.length} manutenções registradas para o patrimônio ${ativoVinc.patrimonio}`)}><Icon name="relogio" size={13} /> Ver Manutenções</button>
                  </div>
                </div>
              )}

              {c.aprovacoes.length > 0 && (
                <div>
                  <div className="ovl mb-3">Circuito de aprovação</div>
                  <div className="rounded-lg p-4" style={{ background: "rgba(242,183,10,0.06)", border: "1px solid rgba(242,183,10,0.3)" }}>
                    {c.aprovacoes.map((a, i) => (
                      <div key={a.etapaId} className="flex items-center gap-3 py-2" style={{ borderBottom: i < c.aprovacoes.length - 1 ? "1px dashed rgba(242,183,10,0.35)" : undefined }}>
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold flex-none"
                          style={a.status === "Aprovado" ? { background: "var(--green)", color: "#fff" } : a.status === "Rejeitado" ? { background: "var(--red)", color: "#fff" } : a.status === "Ajuste solicitado" ? { background: "var(--amber)", color: "#fff" } : { background: "#fff", border: "1.5px solid var(--line-2)", color: "var(--muted)" }}>
                          {a.status === "Aprovado" ? <Icon name="check" size={12} /> : i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] font-bold">{a.etapaNome}</div>
                          <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>
                            {a.status === "Pendente" ? `Aguardando — ${a.aprovadorNome}` : `${a.status} · ${a.data ? fmtDataHora(a.data) : ""}`}
                          </div>
                          {a.comentario && <div className="text-[11px] italic mt-0.5" style={{ color: "var(--muted)" }}>“{a.comentario}”</div>}
                        </div>
                        {a.status === "Pendente" && etapaPendente?.etapaId === a.etapaId && podeAprovar && (
                          <button className="btn btn-outline !py-1 text-[11px] flex-none" onClick={() => setModalDecisao({ etapaId: a.etapaId, decisao: "Aprovado" })}>Decidir</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(c.roteamento?.length ?? 0) > 0 && (
                <div>
                  <div className="ovl mb-2.5">Histórico de Roteamento</div>
                  <ol className="m-0 p-0 list-none space-y-2">
                    {c.roteamento!.map((r, i) => (
                      <li key={i} className="tick-row text-[12px]">
                        <span className="font-bold">{r.regra}</span>
                        <span className="block mt-0.5" style={{ color: "var(--muted)" }}>{r.detalhe}</span>
                        <span className="block text-[10.5px] mt-0.5" style={{ color: "var(--muted)" }}>
                          {fmtDataHora(r.data)} · Grupo: {r.grupo} · Domínio: {r.dominio}{r.tecnico ? ` · Técnico: ${r.tecnico}` : ""} · {r.automatico ? "automático" : "manual"}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div>
                <div className="ovl mb-2.5">Histórico</div>
                <ol className="m-0 p-0 list-none space-y-2.5">
                  {[...c.historico].reverse().map((h, i) => (
                    <li key={i} className="tick-row text-[12px]">
                      <span className="font-bold">{h.acao}</span>
                      <span style={{ color: "var(--muted)" }}> — {h.detalhe}</span>
                      <span className="block text-[10.5px]" style={{ color: "var(--muted)" }}>{h.usuario} · {fmtDataHora(h.data)}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <div className="ovl mb-2.5">Comentários e notas ({c.comentarios.length})</div>
                <div className="space-y-2 mb-3">
                  {c.comentarios.map((cc) => {
                    const autor = nomeDe(cc.autorId);
                    return (
                      <div key={cc.id} className="rounded-lg px-3.5 py-2.5" style={{ background: cc.tipo === "interna" ? "var(--yellow-soft)" : "rgba(19,37,29,0.035)", borderLeft: cc.tipo === "interna" ? "3px solid var(--accent)" : "3px solid var(--green)" }}>
                        <div className="flex items-center gap-2 text-[11px] mb-1">
                          <Avatar nome={autor?.nome ?? "?"} size={18} />
                          <span className="font-bold">{autor?.nome}</span>
                          <Chip tom={cc.tipo === "interna" ? "ambar" : "verde"} dot={false}>{cc.tipo === "interna" ? "Nota interna TI" : "Resposta ao solicitante"}</Chip>
                          <span className="ml-auto" style={{ color: "var(--muted)" }}>{fmtDataHora(cc.data)}</span>
                        </div>
                        <div className="text-[12.5px] leading-relaxed">{cc.texto}</div>
                      </div>
                    );
                  })}
                  {c.comentarios.length === 0 && <p className="text-[12px] m-0" style={{ color: "var(--muted)" }}>Nenhum comentário registrado.</p>}
                </div>
                <div className="flex gap-1 mb-2">
                  {([["resposta", "Resposta ao Solicitante"], ["interna", "Nota Interna da TI"]] as const).map(([v, r]) => (
                    <button key={v} className={`tab-btn !text-[11.5px] ${tipoComentario === v ? "on" : ""}`} onClick={() => setTipoComentario(v)}>{r}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input className="input" placeholder={tipoComentario === "resposta" ? "Escrever resposta visível ao solicitante…" : "Nota visível apenas à equipe de TI…"} value={novoComentario} onChange={(e) => setNovoComentario(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviarComentario()} />
                  <button className="btn btn-primary flex-none" onClick={enviarComentario}><Icon name="enviar" size={15} /></button>
                </div>
              </div>
            </div>
          );
        })()}
        {chamadoAtual && (
          <>
            {podeGerir && !["Fechado", "Cancelado", "Rejeitado"].includes(chamadoAtual.status) && (
              <button className="btn btn-outline flex-1" onClick={() => setModalAtribuir(true)}><Icon name="usuario" size={15} /> Atribuir</button>
            )}
            {podeGerir && ["Aprovado", "Atribuído", "Em Triagem"].includes(chamadoAtual.status) && (
              <button className="btn btn-primary flex-1" onClick={() => { mudarStatusChamado(chamadoAtual.id, "Em Atendimento", "Técnico iniciou o atendimento."); toast("Atendimento iniciado", "verde", chamadoAtual.numero); }}>
                <Icon name="check" size={15} /> Iniciar Atendimento
              </button>
            )}
            {podeGerir && ["Em Atendimento", "Aguardando Usuário", "Aguardando Peça", "Aguardando Terceiro"].includes(chamadoAtual.status) && (
              <button className="btn btn-primary flex-1" onClick={() => { mudarStatusChamado(chamadoAtual.id, "Resolvido", "Solução registrada pelo técnico."); toast("Chamado resolvido", "verde", chamadoAtual.numero); }}>
                <Icon name="check" size={15} /> Resolver
              </button>
            )}
            {podeGerir && chamadoAtual.status === "Resolvido" && (
              <button className="btn btn-primary flex-1" onClick={() => { mudarStatusChamado(chamadoAtual.id, "Fechado", "Encerramento confirmado."); toast("Chamado fechado", "verde", chamadoAtual.numero); }}>
                <Icon name="cadeado" size={15} /> Fechar
              </button>
            )}
          </>
        )}
      </PainelLateral>

      {/* ===== Modal novo chamado ===== */}
      <Modal aberto={modalNovo} onFechar={() => setModalNovo(false)} titulo="Solicitar Atendimento" largo
        rodape={<><button className="btn btn-outline" onClick={() => setModalNovo(false)}>Cancelar</button><button className="btn btn-accent" onClick={abrirNovo}><Icon name="enviar" size={15} /> Abrir chamado</button></>}>
        <div className="space-y-4">
          <div className="rounded-lg px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]" style={{ background: "var(--green-soft)" }}>
            {[["Solicitante", atual.nome], ["Matrícula", atual.matricula], ["Secretaria", unidadeDe(atual.unidadeId)?.sigla ?? "—"], ["Ramal", atual.ramal]].map(([k, v]) => (
              <div key={k}><div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--green)" }}>{k}</div><div className="font-bold" style={{ color: "var(--ink)" }}>{v}</div></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Seletor rotulo="Tipo" obrigatorio valor={novo.tipo} onChange={(v) => setNovo({ ...novo, tipo: v as typeof novo.tipo })}
              opcoes={[{ valor: "Incidente", rotulo: "Incidente — algo parou de funcionar" }, { valor: "Solicitação de Serviço", rotulo: "Solicitação de Serviço — algo novo" }]} />
            <Seletor rotulo="Categoria" obrigatorio valor={novo.categoriaId} onChange={(v) => setNovo({ ...novo, categoriaId: v, servicoId: servicos.find((s) => s.categoriaId === v)?.id ?? "" })}
              opcoes={CATEGORIAS_PORTAL.map((c) => ({ valor: c.id, rotulo: c.nome }))} />
          </div>
          <Seletor rotulo="Serviço do catálogo" valor={novo.servicoId} onChange={(v) => {
            const s = servicos.find((x) => x.id === v);
            setNovo({ ...novo, servicoId: v, prioridade: s?.prioridadePadrao ?? novo.prioridade });
          }}
            opcoes={[{ valor: "", rotulo: "Sem serviço específico (atendimento avulso)" }, ...servicos.filter((s) => s.categoriaId === novo.categoriaId).map((s) => ({ valor: s.id, rotulo: `${s.nome}${s.requerAprovacao ? " — exige aprovação" : ""}` }))]} />
          {novo.servicoId && servicos.find((s) => s.id === novo.servicoId)?.requerAprovacao && (
            <div className="flex items-center gap-2 text-[12px] font-semibold px-3.5 py-2.5 rounded-lg anim-pop" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}>
              <Icon name="carimbo" size={15} /> Este serviço exige aprovação antes da execução pela TI. O chamado iniciará como “Aguardando Aprovação”.
            </div>
          )}
          <div className="rounded-lg p-3.5 anim-fade" key={`${previaRota.grupoId}-${previaRota.regra}`} style={{ background: "rgba(30,122,84,0.06)", border: "1px solid rgba(30,122,84,0.25)" }}>
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "var(--green)" }}>
              <Icon name="fluxos" size={13} /> Roteamento automático — você não precisa saber qual equipe atende
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[12.5px]">
              <strong>{previaRota.grupoNome}</strong>
              <span style={{ color: "var(--muted)" }}>Domínio: {previaRota.dominioNome}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold" style={{ background: "#fff", color: "var(--green)", border: "1px solid rgba(30,122,84,0.3)" }}>{previaRota.regra}</span>
            </div>
          </div>
          {permiteTecnico && (
            <Seletor
              rotulo={`Técnico preferencial ${servicoSel?.selecaoTecnico === "Obrigatório" ? "(obrigatório)" : "(opcional)"}`}
              obrigatorio={servicoSel?.selecaoTecnico === "Obrigatório"}
              valor={novo.tecnicoPreferencialId}
              onChange={(v) => setNovo({ ...novo, tecnicoPreferencialId: v })}
              opcoes={[{ valor: "", rotulo: "Definido automaticamente pelo grupo" }, ...tecnicosDisponiveis.map((id) => ({ valor: id, rotulo: usuarios.find((u) => u.id === id)?.nome ?? id }))]}
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Seletor rotulo="Prioridade" obrigatorio valor={novo.prioridade} onChange={(v) => setNovo({ ...novo, prioridade: v })}
              opcoes={["Baixa", "Normal", "Alta", "Urgente", "Crítica"]} />
            <Campo rotulo="Sala / Local" obrigatorio>
              <input className="input" placeholder="ex.: Sala 18 — SEFAZ" value={novo.local} onChange={(e) => setNovo({ ...novo, local: e.target.value })} />
            </Campo>
          </div>
          <Campo rotulo="Título" obrigatorio><input className="input" placeholder="Resumo do problema ou pedido" value={novo.titulo} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })} /></Campo>
          <Campo rotulo="Descrição" obrigatorio><textarea className="textarea" rows={3} placeholder="Descreva com detalhes: o que aconteceu, quando, mensagens de erro…" value={novo.descricao} onChange={(e) => setNovo({ ...novo, descricao: e.target.value })} /></Campo>
          <Seletor rotulo="Equipamento relacionado (opcional)" valor={novo.patrimonioId} onChange={(v) => setNovo({ ...novo, patrimonioId: v })}
            opcoes={[{ valor: "", rotulo: "Nenhum / não se aplica" },
            ...ativos.filter((a) => a.responsavelId === atual.id || a.unidadeId === atual.unidadeId).map((a) => ({
              valor: a.id,
              rotulo: `Patrimônio ${a.patrimonio} — ${a.fabricante} ${a.modelo}${a.rede ? ` · ${a.rede.hostname} · ${a.rede.ipv4}` : ""}`,
            }))]} />
          {(() => {
            const a = ativos.find((x) => x.id === novo.patrimonioId);
            return a ? (
              <div className="rounded-lg px-4 py-3 text-[11.5px] grid grid-cols-2 gap-x-4 gap-y-1 anim-pop" style={{ background: "var(--blue-soft)", color: "var(--muted)" }}>
                <span>Hostname: <strong style={{ color: "var(--ink)" }}>{a.rede?.hostname ?? "—"}</strong></span>
                <span>IP: <strong style={{ color: "var(--ink)" }}>{a.rede?.ipv4 ?? "—"}</strong></span>
                <span>Domínio: <strong style={{ color: "var(--ink)" }}>{a.rede?.dominio ?? "—"}</strong></span>
                <span>Série: <strong style={{ color: "var(--ink)" }}>{a.serie}</strong></span>
              </div>
            ) : null;
          })()}
        </div>
      </Modal>

      {/* ===== Modal atribuir ===== */}
      <AtribuirModal
        aberto={modalAtribuir}
        onFechar={() => setModalAtribuir(false)}
        onAtribuir={(tec, gru) => {
          if (!chamadoAtual) return;
          atribuirChamado(chamadoAtual.id, tec || null, gru || null);
          toast("Chamado atribuído", "verde", chamadoAtual.numero);
          setModalAtribuir(false);
        }}
      />

      {/* ===== Modal decisão de aprovação ===== */}
      <Modal aberto={!!modalDecisao} onFechar={() => setModalDecisao(null)}
        titulo={modalDecisao?.decisao === "Aprovado" ? "Aprovar Etapa" : modalDecisao?.decisao === "Rejeitado" ? "Rejeitar Solicitação" : "Solicitar Ajuste"}
        rodape={<>
          <button className="btn btn-outline" onClick={() => setModalDecisao(null)}>Cancelar</button>
          <button className={`btn ${modalDecisao?.decisao === "Rejeitado" ? "btn-danger" : "btn-primary"}`} onClick={confirmarDecisao}>
            <Icon name="check" size={15} /> {modalDecisao?.decisao === "Aprovado" ? "Confirmar aprovação" : modalDecisao?.decisao === "Rejeitado" ? "Confirmar rejeição" : "Solicitar ajuste"}
          </button>
        </>}>
        <div className="space-y-3">
          <div className="flex gap-1.5">
            {([["Aprovado", "Aprovar", "verde"], ["Rejeitado", "Rejeitar", "vermelho"], ["Ajuste solicitado", "Solicitar Ajustes", "ambar"]] as const).map(([v, r, cor]) => (
              <button key={v} className="btn !py-1.5 flex-1"
                style={{
                  background: modalDecisao?.decisao === v ? (cor === "verde" ? "var(--green)" : cor === "vermelho" ? "var(--red)" : "var(--amber)") : "transparent",
                  color: modalDecisao?.decisao === v ? "#fff" : "var(--muted)",
                  border: "1px solid var(--line-2)",
                }}
                onClick={() => setModalDecisao((m) => m ? { ...m, decisao: v } : m)}>{r}</button>
            ))}
          </div>
          <Campo rotulo="Observação (registrada no histórico permanente)">
            <textarea className="textarea" rows={3} placeholder="Justificativa da decisão…" value={comentarioDecisao} onChange={(e) => setComentarioDecisao(e.target.value)} />
          </Campo>
        </div>
      </Modal>

      {/* ===== Modal artigo ===== */}
      <Modal aberto={modalArtigo} onFechar={() => setModalArtigo(false)} titulo="Novo Artigo — Base de Conhecimento" largo
        rodape={<><button className="btn btn-outline" onClick={() => setModalArtigo(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => {
            if (!novoArtigo.titulo.trim() || !novoArtigo.conteudo.trim()) { toast("Preencha título e conteúdo", "vermelho"); return; }
            criarArtigoBase({ titulo: novoArtigo.titulo.trim(), categoria: novoArtigo.categoria, conteudo: novoArtigo.conteudo.trim(), autorId: atual.id, status: "Publicado", visibilidade: novoArtigo.visibilidade as "Todos" });
            toast("Artigo publicado", "verde", novoArtigo.titulo);
            setModalArtigo(false);
            setNovoArtigo({ titulo: "", categoria: "Usuários e Senhas", conteudo: "", visibilidade: "Todos" });
          }}><Icon name="check" size={15} /> Publicar</button></>}>
        <div className="space-y-4">
          <Campo rotulo="Título" obrigatorio><input className="input" placeholder="ex.: Como solicitar acesso à VPN" value={novoArtigo.titulo} onChange={(e) => setNovoArtigo({ ...novoArtigo, titulo: e.target.value })} /></Campo>
          <div className="grid grid-cols-2 gap-4">
            <Seletor rotulo="Categoria" valor={novoArtigo.categoria} onChange={(v) => setNovoArtigo({ ...novoArtigo, categoria: v })} opcoes={["Usuários e Senhas", "Impressoras", "Arquivos e Pastas", "Acesso a Sistemas", "Infraestrutura", "Patrimônio"]} />
            <Seletor rotulo="Visibilidade" valor={novoArtigo.visibilidade} onChange={(v) => setNovoArtigo({ ...novoArtigo, visibilidade: v })} opcoes={["Todos", "Somente TI"]} />
          </div>
          <Campo rotulo="Conteúdo (passo a passo)" obrigatorio><textarea className="textarea" rows={6} placeholder="1. Primeiro passo…" value={novoArtigo.conteudo} onChange={(e) => setNovoArtigo({ ...novoArtigo, conteudo: e.target.value })} /></Campo>
        </div>
      </Modal>

      {/* ===== Modal leitura de artigo ===== */}
      <Modal aberto={!!artigoAberto} onFechar={() => setArtigoAberto(null)} titulo={baseConhecimento.find((a) => a.id === artigoAberto)?.titulo ?? ""} largo
        rodape={<button className="btn btn-primary" onClick={() => setArtigoAberto(null)}>Fechar</button>}>
        {(() => {
          const a = baseConhecimento.find((x) => x.id === artigoAberto);
          return a ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Chip tom="ciano" dot={false}>{a.categoria}</Chip>
                <Chip tom={a.visibilidade === "Todos" ? "verde" : "ambar"} dot={false}>{a.visibilidade === "Todos" ? "Toda a organização" : "Somente TI"}</Chip>
                <span className="text-[11px] self-center" style={{ color: "var(--muted)" }}>Por {nomeDe(a.autorId)?.nome} · atualizado {tempoRel(a.atualizadoEm)}</span>
              </div>
              <div className="text-[13.5px] leading-relaxed whitespace-pre-line">{a.conteudo}</div>
            </div>
          ) : null;
        })()}
      </Modal>
    </div>
  );
}

function AtribuirModal({ aberto, onFechar, onAtribuir }: { aberto: boolean; onFechar: () => void; onAtribuir: (tec: string, gru: string) => void }) {
  const { gruposSuporte, usuarios } = useApp();
  const [tec, setTec] = useState("");
  const [gru, setGru] = useState(gruposSuporte[0]?.id ?? "");
  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Atribuir Chamado"
      rodape={
        <>
          <button className="btn btn-outline" onClick={onFechar}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onAtribuir(tec, gru)}><Icon name="check" size={15} /> Atribuir</button>
        </>
      }
    >
      <div className="space-y-4">
        <Seletor rotulo="Grupo de atendimento" valor={gru} onChange={setGru}
          opcoes={gruposSuporte.map((g) => ({ valor: g.id, rotulo: g.nome }))} />
        <Seletor rotulo="Técnico responsável" valor={tec} onChange={setTec}
          opcoes={[{ valor: "", rotulo: "Não atribuído" }, ...usuarios.filter((u) => u.ativo).map((u) => ({ valor: u.id, rotulo: u.nome }))]} />
        <p className="text-[11.5px] m-0" style={{ color: "var(--muted)" }}>
          A atribuição fica registrada no histórico do chamado e na trilha de auditoria.
        </p>
      </div>
    </Modal>
  );
}
