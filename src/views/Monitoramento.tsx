import { useMemo, useState } from "react";
import { Campo, Chip, Icon, Modal, Reveal, Seletor, Vazio, useToast } from "../components/ui";
import { CabecalhoPagina } from "../components/shell";
import { fmtData, fmtDataHora, fmtMoeda, fmtNum, tempoRel } from "../lib/format";
import { useApp, Store } from "../lib/store";
import { SISTEMAS_SEED } from "../lib/seguranca-seed";

/* ============ Fontes de dados controladas (sem SQL livre) ============ */

interface Fonte { rotulo: string; permissao?: string; colunas: { chave: string; rotulo: string }[]; linhas: (app: Store) => Record<string, string>[]; }

const FONTES: Record<string, Fonte> = {
  usuarios: {
    rotulo: "Usuários", colunas: [
      { chave: "nome", rotulo: "Nome" }, { chave: "matricula", rotulo: "Matrícula" }, { chave: "usuario", rotulo: "Usuário" },
      { chave: "cargo", rotulo: "Cargo" }, { chave: "unidade", rotulo: "Lotação" }, { chave: "perfil", rotulo: "Perfil" }, { chave: "status", rotulo: "Status" },
    ],
    linhas: (a) => a.usuarios.map((u) => ({ nome: u.nome, matricula: u.matricula, usuario: u.usuario, cargo: u.cargo, unidade: a.unidades.find((x) => x.id === u.unidadeId)?.sigla ?? "—", perfil: u.perfil, status: u.ativo ? "Ativo" : "Suspenso" })),
  },
  unidades: {
    rotulo: "Unidades Administrativas", colunas: [
      { chave: "nome", rotulo: "Nome" }, { chave: "sigla", rotulo: "Sigla" }, { chave: "tipo", rotulo: "Tipo" },
      { chave: "superior", rotulo: "Unidade Superior" }, { chave: "responsavel", rotulo: "Responsável" }, { chave: "status", rotulo: "Status" },
    ],
    linhas: (a) => a.unidades.map((u) => ({ nome: u.nome, sigla: u.sigla, tipo: u.tipo, superior: a.unidades.find((x) => x.id === u.parentId)?.sigla ?? "—", responsavel: a.usuarios.find((x) => x.id === u.responsavelId)?.nome ?? "—", status: u.ativa === false ? "Inativa" : "Ativa" })),
  },
  equipes: {
    rotulo: "Equipes", colunas: [
      { chave: "nome", rotulo: "Equipe" }, { chave: "tipo", rotulo: "Tipo" }, { chave: "unidade", rotulo: "Unidade" },
      { chave: "lider", rotulo: "Responsável" }, { chave: "membros", rotulo: "Membros" }, { chave: "status", rotulo: "Status" },
    ],
    linhas: (a) => a.equipes.map((e) => ({ nome: e.nome, tipo: e.tipo ?? "—", unidade: a.unidades.find((x) => x.id === e.unidadeId)?.sigla ?? "—", lider: a.usuarios.find((x) => x.id === e.liderId)?.nome ?? "—", membros: String(e.membroIds.length), status: e.ativa === false ? "Inativa" : "Ativa" })),
  },
  projetos: {
    rotulo: "Projetos", colunas: [
      { chave: "codigo", rotulo: "Código" }, { chave: "nome", rotulo: "Projeto" }, { chave: "status", rotulo: "Status" },
      { chave: "progresso", rotulo: "Progresso" }, { chave: "orcamento", rotulo: "Orçamento" }, { chave: "responsavel", rotulo: "Responsável" }, { chave: "prazo", rotulo: "Prazo" },
    ],
    linhas: (a) => a.projetos.map((p) => ({ codigo: p.codigo, nome: p.nome, status: p.status, progresso: `${p.progresso}%`, orcamento: fmtMoeda(p.orcamento, a.config.regional.moeda), responsavel: a.usuarios.find((x) => x.id === p.responsavelId)?.nome ?? "—", prazo: fmtData(p.prazo) })),
  },
  tarefas: {
    rotulo: "Tarefas", colunas: [
      { chave: "titulo", rotulo: "Tarefa" }, { chave: "status", rotulo: "Status" }, { chave: "prioridade", rotulo: "Prioridade" },
      { chave: "responsavel", rotulo: "Responsável" }, { chave: "prazo", rotulo: "Prazo" },
    ],
    linhas: (a) => a.tarefas.map((t) => ({ titulo: t.titulo, status: t.status, prioridade: t.prioridade, responsavel: a.usuarios.find((x) => x.id === t.responsavelId)?.nome ?? "—", prazo: fmtData(t.prazo) })),
  },
  demandas: {
    rotulo: "Demandas", colunas: [
      { chave: "protocolo", rotulo: "Protocolo" }, { chave: "tipo", rotulo: "Tipo" }, { chave: "status", rotulo: "Status" },
      { chave: "prioridade", rotulo: "Prioridade" }, { chave: "solicitante", rotulo: "Solicitante" }, { chave: "prazo", rotulo: "Prazo" },
    ],
    linhas: (a) => a.demandas.map((d) => ({ protocolo: d.protocolo, tipo: d.tipo, status: d.status, prioridade: d.prioridade, solicitante: a.usuarios.find((x) => x.id === d.solicitanteId)?.nome ?? "—", prazo: fmtData(d.prazo) })),
  },
  chamados: {
    rotulo: "Chamados", colunas: [
      { chave: "numero", rotulo: "Número" }, { chave: "titulo", rotulo: "Título" }, { chave: "tipo", rotulo: "Tipo" },
      { chave: "prioridade", rotulo: "Prioridade" }, { chave: "status", rotulo: "Status" }, { chave: "grupo", rotulo: "Grupo" }, { chave: "prazo", rotulo: "Prazo" },
    ],
    linhas: (a) => a.chamados.map((c) => ({ numero: c.numero, titulo: c.titulo, tipo: c.tipo, prioridade: c.prioridade, status: c.status, grupo: a.gruposSuporte.find((g) => g.id === c.grupoId)?.nome ?? "—", prazo: fmtData(c.prazoResolucao) })),
  },
  ativos: {
    rotulo: "Patrimônio de TI", permissao: "asset.view", colunas: [
      { chave: "patrimonio", rotulo: "Patrimônio" }, { chave: "equipamento", rotulo: "Equipamento" }, { chave: "categoria", rotulo: "Categoria" },
      { chave: "secretaria", rotulo: "Secretaria Proprietária" }, { chave: "localizacao", rotulo: "Localização" }, { chave: "responsavel", rotulo: "Responsável" },
      { chave: "status", rotulo: "Status" }, { chave: "valor", rotulo: "Valor" },
    ],
    linhas: (a) => a.ativos.map((x) => ({
      patrimonio: x.patrimonio || "(sem número)", equipamento: `${x.fabricante} ${x.modelo}`, categoria: x.categoria,
      secretaria: a.unidades.find((u) => u.id === (x.pertencimento?.secretariaId ?? x.unidadeId))?.sigla ?? "—",
      localizacao: `${x.predio} — ${x.sala || "não informada"}`,
      responsavel: a.usuarios.find((u) => u.id === x.responsavelId)?.nome ?? "Sem responsável",
      status: x.status, valor: fmtMoeda(x.valor, a.config.regional.moeda),
    })),
  },
  manutencoes: {
    rotulo: "Manutenções", permissao: "asset.view", colunas: [
      { chave: "patrimonio", rotulo: "Patrimônio" }, { chave: "tipo", rotulo: "Tipo" }, { chave: "descricao", rotulo: "Descrição" },
      { chave: "tecnico", rotulo: "Técnico" }, { chave: "custo", rotulo: "Custo" }, { chave: "data", rotulo: "Data" },
    ],
    linhas: (a) => a.ativos.flatMap((x) => x.manutencoes.map((m) => ({ patrimonio: x.patrimonio, tipo: m.tipo, descricao: m.descricao, tecnico: a.usuarios.find((u) => u.id === m.tecnicoId)?.nome ?? "—", custo: fmtMoeda(m.custo, a.config.regional.moeda), data: fmtData(m.data) }))),
  },
  inventario: {
    rotulo: "Inventário", permissao: "asset.view", colunas: [
      { chave: "campanha", rotulo: "Campanha" }, { chave: "patrimonio", rotulo: "Patrimônio" }, { chave: "resultado", rotulo: "Resultado" },
    ],
    linhas: (a) => a.inventario.flatMap((c) => c.itens.map((i) => ({ campanha: c.nome, patrimonio: a.ativos.find((x) => x.id === i.patrimonioId)?.patrimonio ?? i.patrimonioId, resultado: i.resultado }))),
  },
  incidentes: {
    rotulo: "Incidentes de Segurança", permissao: "security.dashboard.view", colunas: [
      { chave: "numero", rotulo: "Número" }, { chave: "titulo", rotulo: "Título" }, { chave: "severidade", rotulo: "Severidade" },
      { chave: "status", rotulo: "Status" }, { chave: "responsavel", rotulo: "Responsável" }, { chave: "data", rotulo: "Data" },
    ],
    linhas: (a) => a.incidentesSeguranca.map((i) => ({ numero: i.numero, titulo: i.titulo, severidade: i.severidade, status: i.status, responsavel: a.usuarios.find((u) => u.id === i.responsavelId)?.nome ?? "—", data: fmtData(i.data) })),
  },
  vulnerabilidades: {
    rotulo: "Vulnerabilidades", permissao: "security.dashboard.view", colunas: [
      { chave: "titulo", rotulo: "Vulnerabilidade" }, { chave: "severidade", rotulo: "Severidade" }, { chave: "status", rotulo: "Status" }, { chave: "prazo", rotulo: "Prazo" },
    ],
    linhas: (a) => a.vulnerabilidades.map((v) => ({ titulo: v.titulo, severidade: v.severidade, status: v.status, prazo: v.prazo.startsWith("2") ? fmtData(v.prazo) : "—" })),
  },
  riscos: {
    rotulo: "Riscos", colunas: [
      { chave: "titulo", rotulo: "Risco" }, { chave: "categoria", rotulo: "Categoria" }, { chave: "nivel", rotulo: "Nível" },
      { chave: "score", rotulo: "Score" }, { chave: "responsavel", rotulo: "Responsável" },
    ],
    linhas: (a) => a.riscos.map((r) => ({ titulo: r.titulo, categoria: r.categoria, nivel: r.nivel, score: String(r.probabilidade * r.impacto), responsavel: a.usuarios.find((u) => u.id === r.responsavelId)?.nome ?? "—" })),
  },
  documentos: {
    rotulo: "Documentos", colunas: [
      { chave: "nome", rotulo: "Documento" }, { chave: "categoria", rotulo: "Categoria" }, { chave: "versao", rotulo: "Versão" }, { chave: "status", rotulo: "Status" },
    ],
    linhas: (a) => a.documentos.map((d) => ({ nome: d.nome, categoria: d.categoria, versao: d.versao, status: d.status })),
  },
  auditoria: {
    rotulo: "Auditoria", permissao: "security.audit.view", colunas: [
      { chave: "dataHora", rotulo: "Data/Hora" }, { chave: "usuario", rotulo: "Usuário" }, { chave: "acao", rotulo: "Ação" }, { chave: "objeto", rotulo: "Objeto" },
    ],
    linhas: (a) => a.auditoria.map((x) => ({ dataHora: fmtDataHora(x.dataHora), usuario: x.usuario, acao: x.acao, objeto: x.objeto })),
  },
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function baixarArquivo(nome: string, conteudo: string, mime: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: mime }));
  const a = document.createElement("a");
  a.href = url; a.download = nome; a.click();
  URL.revokeObjectURL(url);
}

export default function Monitoramento() {
  const app = useApp();
  const { temPermissao, config, atual, auditoria, notificacoes, registrarGeracao, relatoriosSalvos, salvarRelatorioFiltro, excluirRelatorioSalvo, templatesRelatorio } = app;
  const toast = useToast();
  const [aba, setAba] = useState<"painel" | "relatorios" | "servicos" | "atividades">("painel");
  const [fonte, setFonte] = useState("chamados");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [colunasAtivas, setColunasAtivas] = useState<string[] | null>(null);
  const [modalSalvar, setModalSalvar] = useState(false);
  const [nomeSalvo, setNomeSalvo] = useState("");

  const fontesVisiveis = useMemo(
    () => Object.entries(FONTES).filter(([, f]) => !f.permissao || temPermissao(f.permissao)),
    [temPermissao]
  );
  const fonteDef = FONTES[fonte] ?? FONTES.chamados;
  const colunas = (colunasAtivas ?? fonteDef.colunas.map((c) => c.chave)).map((chave) => fonteDef.colunas.find((c) => c.chave === chave)).filter(Boolean) as { chave: string; rotulo: string }[];

  const brutas = useMemo(() => fonteDef.linhas(app), [fonteDef, app]); // eslint-disable-line react-hooks/exhaustive-deps
  const valoresStatus = useMemo(() => {
    const col = fonteDef.colunas.find((c) => c.chave === "status");
    if (!col) return [];
    return Array.from(new Set(brutas.map((l) => l.status)));
  }, [brutas, fonteDef]);

  const filtradas = useMemo(() => brutas.filter((l) => {
    const ql = busca.trim().toLowerCase();
    const okBusca = ql === "" || Object.values(l).some((v) => v.toLowerCase().includes(ql));
    const okStatus = filtroStatus === "Todos" || !valoresStatus.length || l.status === filtroStatus;
    return okBusca && okStatus;
  }), [brutas, busca, filtroStatus, valoresStatus]);

  const filtrosTexto = `Fonte: ${fonteDef.rotulo}${busca ? ` · Pesquisa: "${busca}"` : ""}${filtroStatus !== "Todos" ? ` · Status: ${filtroStatus}` : ""}`;

  const mudarFonte = (f: string) => { setFonte(f); setFiltroStatus("Todos"); setBusca(""); setColunasAtivas(null); };

  const csvConteudo = () => "\uFEFF" + [
    colunas.map((c) => c.rotulo).join(";"),
    ...filtradas.map((l) => colunas.map((c) => `"${String(l[c.chave] ?? "").replace(/"/g, '""')}"`).join(";")),
  ].join("\n");

  const gerarPDF = (imprimirDireto: boolean) => {
    const w = window.open("", "_blank", "width=1000,height=700");
    if (!w) { toast("Pop-up bloqueado", "vermelho", "Permita pop-ups para gerar o PDF."); return; }
    const brasao = config.identidade.brasaoDataUrl
      ? `<img src="${config.identidade.brasaoDataUrl}" style="height:56px" alt="Brasão" />`
      : `<svg width="44" height="52" viewBox="0 0 48 56"><path d="M24 2 44 9v21c0 11.5-8.6 19.6-20 24C12.6 49.6 4 41.5 4 30V9Z" fill="${config.marca.corPrimaria}" stroke="${config.marca.corAcento}" stroke-width="2"/><rect x="4" y="22" width="40" height="8" fill="${config.marca.corAcento}"/></svg>`;
    w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(fonteDef.rotulo)} — ${esc(config.orgao.nome)}</title>
      <style>
        body{font-family:'Segoe UI',Arial,sans-serif;color:#13251d;margin:32px;font-size:12px}
        header{display:flex;gap:16px;align-items:center;border-bottom:3px solid ${config.marca.corPrimaria};padding-bottom:14px;margin-bottom:18px}
        header h1{font-size:17px;margin:0} header p{margin:2px 0 0;color:#5c6d63;font-size:11px}
        table{width:100%;border-collapse:collapse;margin-top:10px} th{background:${config.marca.corPrimaria};color:#f4f7f2;text-align:left;padding:7px 9px;font-size:10.5px;text-transform:uppercase;letter-spacing:.05em}
        td{padding:6px 9px;border-bottom:1px solid #dbe3d7;font-size:11px} tr:nth-child(even) td{background:#f4f6f1}
        .meta{display:flex;flex-wrap:wrap;gap:18px;font-size:10.5px;color:#5c6d63}
        footer{margin-top:22px;border-top:1px solid #cbd6c6;padding-top:8px;font-size:10px;color:#5c6d63;display:flex;justify-content:space-between}
      </style></head><body>
      <header>${brasao}<div><h1>${esc(config.orgao.nome)}</h1><p><strong>Relatório: ${esc(fonteDef.rotulo)}</strong> · ${esc(config.identidade.nomeSistema)}</p></div></header>
      <div class="meta">
        <span><strong>Gerado em:</strong> ${fmtDataHora(new Date().toISOString())}</span>
        <span><strong>Responsável:</strong> ${esc(atual.nome)}</span>
        <span><strong>Filtros aplicados:</strong> ${esc(filtrosTexto)}</span>
        <span><strong>Total de registros:</strong> ${fmtNum(filtradas.length)}</span>
      </div>
      <table><thead><tr>${colunas.map((c) => `<th>${esc(c.rotulo)}</th>`).join("")}</tr></thead>
      <tbody>${filtradas.map((l) => `<tr>${colunas.map((c) => `<td>${esc(String(l[c.chave] ?? ""))}</td>`).join("")}</tr>`).join("")}</tbody></table>
      <footer><span>${esc(config.identidade.rodape)}</span><span>Documento gerado eletronicamente — identificador RPT-${Date.now().toString(36).toUpperCase()}</span></footer>
      <script>window.onload=function(){${imprimirDireto ? "window.print();" : ""}}<\/script></body></html>`);
    w.document.close();
    registrarGeracao(fonteDef.rotulo, imprimirDireto ? "Impressão" : "PDF", filtrosTexto, filtradas.length);
    toast(imprimirDireto ? "Documento pronto para impressão" : "PDF gerado", "verde", `${fonteDef.rotulo} — ${fmtNum(filtradas.length)} registros (use “Salvar como PDF” na janela)`);
  };

  return (
    <div>
      <CabecalhoPagina titulo="Monitoramento" subtitulo="Acompanhamento institucional com relatórios funcionais — o escopo exibido respeita as permissões do seu perfil." />
      <div className="flex gap-1 mb-5 overflow-x-auto" style={{ borderBottom: "1px solid var(--line)" }}>
        {([["painel", "Painel", "painel"], ["relatorios", "Relatórios", "relatorios"], ["servicos", "Status dos Serviços", "sistema"], ["atividades", "Atividades", "relogio"]] as const).map(([k, r, ic]) => (
          <button key={k} className={`tab-btn ${aba === k ? "on" : ""}`} onClick={() => setAba(k)}>
            <span className="inline-flex items-center gap-1.5"><Icon name={ic} size={14} /> {r}</span>
          </button>
        ))}
      </div>

      {aba === "painel" && (
        <div className="space-y-4 anim-fade">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {[
              { rotulo: "Projetos ativos", n: app.projetos.filter((p) => ["Em Andamento", "Planejamento"].includes(p.status)).length, cor: "var(--blue)" },
              { rotulo: "Tarefas em aberto", n: app.tarefas.filter((t) => t.status !== "Concluído").length, cor: "var(--ink)" },
              { rotulo: "Chamados ativos", n: app.chamados.filter((c) => !["Fechado", "Resolvido", "Cancelado", "Rejeitado"].includes(c.status)).length, cor: "var(--cyan)" },
              { rotulo: "Demandas em curso", n: app.demandas.filter((d) => !["Concluída", "Cancelada", "Recusada"].includes(d.status)).length, cor: "var(--amber)" },
              { rotulo: "Incidentes abertos", n: app.incidentesSeguranca.filter((i) => !["Resolvido", "Fechado"].includes(i.status)).length, cor: "var(--red)" },
              { rotulo: "Servidores ativos", n: app.usuarios.filter((u) => u.ativo).length, cor: "var(--green)" },
            ].map((k, i) => (
              <Reveal key={k.rotulo} delay={i * 35}>
                <div className="card card-hover px-4 py-3.5">
                  <div className="font-display font-extrabold text-[26px] leading-none tabular-nums" style={{ color: k.cor }}>{k.n}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mt-1.5" style={{ color: "var(--muted)" }}>{k.rotulo}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="card p-5">
            <div className="ovl mb-4">Status dos serviços críticos — tempo real</div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {SISTEMAS_SEED.map((s) => (
                <div key={s.id} className="rounded-lg px-4 py-3 flex items-center gap-3" style={{ background: "rgba(19,37,29,0.035)" }}>
                  <span className="relative w-2.5 h-2.5 rounded-full flex-none pulse-live" style={{ background: s.status === "Operacional" ? "var(--green)" : "var(--amber)", color: s.status === "Operacional" ? "var(--green)" : "var(--amber)" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-bold truncate">{s.nome}</div>
                    <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>SLA {s.sla} · RTO {s.rto}</div>
                  </div>
                  <Chip tom={s.status === "Operacional" ? "verde" : "ambar"} dot={false}>{s.status}</Chip>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {aba === "relatorios" && (
        <div className="anim-fade space-y-4">
          <div className="card p-5">
            <div className="grid lg:grid-cols-[240px_1fr] gap-5">
              <div>
                <div className="ovl mb-2.5">Fontes de dados</div>
                <div className="space-y-1">
                  {fontesVisiveis.map(([chave, f]) => (
                    <button key={chave} className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-[12.5px] font-semibold cursor-pointer border-0 transition-all ${fonte === chave ? "" : "bg-transparent hover:bg-[rgba(30,122,84,0.08)]"}`}
                      style={fonte === chave ? { background: "var(--deep)", color: "#f2f6f0" } : { color: "var(--muted)" }}
                      onClick={() => mudarFonte(chave)}>
                      {f.rotulo}
                      <span className="ml-auto text-[10.5px] tabular-nums opacity-70">{fmtNum(f.linhas(app).length)}</span>
                    </button>
                  ))}
                </div>
                {templatesRelatorio.filter((t) => t.ativo).length > 0 && (
                  <>
                    <div className="ovl mb-2 mt-4">Modelos configurados</div>
                    <div className="space-y-1">
                      {templatesRelatorio.filter((t) => t.ativo).map((t) => (
                        <button key={t.id} className="w-full text-left px-3 py-2 rounded-md text-[12px] font-semibold cursor-pointer border transition-colors hover:border-[var(--green)]"
                          style={{ background: "rgba(19,37,29,0.03)", borderColor: "var(--line)" }}
                          onClick={() => { mudarFonte(t.fonte); setColunasAtivas(t.colunas); toast("Modelo aplicado", "verde", `${t.nome} — colunas e fonte configuradas`); }}>
                          {t.nome}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Icon name="busca" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                    <input className="input pl-9" placeholder="Filtrar registros…" value={busca} onChange={(e) => setBusca(e.target.value)} />
                  </div>
                  {valoresStatus.length > 0 && (
                    <select className="select !w-[180px]" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                      {["Todos", ...valoresStatus].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  )}
                  <span className="text-[12px] font-bold tabular-nums" style={{ color: "var(--muted)" }}>{fmtNum(filtradas.length)} registros</span>
                </div>
                <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--line)" }}>
                  <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                    <table className="tbl min-w-[640px]">
                      <thead className="sticky top-0" style={{ zIndex: 1 }}><tr>{colunas.map((c) => <th key={c.chave}>{c.rotulo}</th>)}</tr></thead>
                      <tbody>
                        {filtradas.slice(0, 120).map((l, i) => (
                          <tr key={i}>{colunas.map((c) => <td key={c.chave} className="text-[12px] whitespace-nowrap">{l[c.chave]}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                    {filtradas.length === 0 && <Vazio titulo="Nenhum registro com os filtros atuais" dica="Ajuste a pesquisa ou o filtro de status." />}
                  </div>
                </div>
                <div className="text-[11px] mt-2 mb-3" style={{ color: "var(--muted)" }}>Filtros aplicados: {filtrosTexto}</div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-primary" onClick={() => gerarPDF(false)}><Icon name="baixar" size={15} /> Baixar PDF</button>
                  <button className="btn btn-outline" onClick={() => { baixarArquivo(`${fonte}.xls`, csvConteudo(), "application/vnd.ms-excel"); registrarGeracao(fonteDef.rotulo, "XLSX", filtrosTexto, filtradas.length); toast("Excel gerado", "verde", `${fonte}.xls — ${fmtNum(filtradas.length)} registros`); }}>
                    <Icon name="baixar" size={15} /> Baixar Excel
                  </button>
                  <button className="btn btn-outline" onClick={() => { baixarArquivo(`${fonte}.csv`, csvConteudo(), "text/csv;charset=utf-8"); registrarGeracao(fonteDef.rotulo, "CSV", filtrosTexto, filtradas.length); toast("CSV gerado", "verde", `${fonte}.csv — ${fmtNum(filtradas.length)} registros`); }}>
                    <Icon name="baixar" size={15} /> Baixar CSV
                  </button>
                  <button className="btn btn-outline" onClick={() => gerarPDF(true)}><Icon name="impressora" size={15} /> Imprimir</button>
                  <button className="btn btn-ghost" onClick={() => { setNomeSalvo(`${fonteDef.rotulo} — ${busca || filtroStatus !== "Todos" ? filtrosTexto : "todos os registros"}`.slice(0, 60)); setModalSalvar(true); }}>
                    <Icon name="mais" size={15} /> Salvar em Meus Relatórios
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="ovl mb-3">Meus Relatórios</div>
              {relatoriosSalvos.length === 0 && <p className="text-[12px]" style={{ color: "var(--muted)" }}>Nenhum relatório salvo. Configure filtros e clique em “Salvar em Meus Relatórios”.</p>}
              <div className="space-y-2">
                {relatoriosSalvos.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-lg px-3.5 py-2.5" style={{ background: "rgba(19,37,29,0.035)" }}>
                    <Icon name="relatorios" size={16} className="opacity-60" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-bold truncate">{r.nome}</div>
                      <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{FONTES[r.fonte]?.rotulo} · salvo {tempoRel(r.criadoEm)}</div>
                    </div>
                    <button className="btn btn-outline !py-1 text-[11px]" onClick={() => { mudarFonte(r.fonte); setBusca(r.busca); setAba("relatorios"); toast("Relatório recarregado", "verde", r.nome); }}>Executar</button>
                    <button className="icon-btn" style={{ color: "var(--red)" }} onClick={() => { excluirRelatorioSalvo(r.id); toast("Relatório excluído", "ambar", r.nome); }} aria-label="Excluir"><Icon name="excluir" size={15} /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <div className="ovl mb-3">Histórico de gerações (auditoria de relatórios)</div>
              {app.historicoRelatorios.length === 0 && <p className="text-[12px]" style={{ color: "var(--muted)" }}>Nenhuma geração registrada nesta sessão.</p>}
              <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                {app.historicoRelatorios.map((h) => (
                  <div key={h.id} className="flex items-center gap-2.5 text-[12px]">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--green)" }} />
                    <span className="font-bold">{h.relatorio}</span>
                    <span style={{ color: "var(--muted)" }}>· {h.formato} · {fmtNum(h.registros)} registros · {h.filtros}</span>
                    <span className="ml-auto text-[10.5px] tabular-nums flex-none" style={{ color: "var(--muted)" }}>{fmtDataHora(h.data)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {aba === "servicos" && (
        <div className="anim-fade grid lg:grid-cols-2 gap-4">
          {SISTEMAS_SEED.map((s) => {
            const uptime = s.status === "Operacional" ? 97 + (s.id.length % 3) : 88;
            return (
              <div key={s.id} className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="relative w-3 h-3 rounded-full pulse-live flex-none" style={{ background: s.status === "Operacional" ? "var(--green)" : "var(--amber)", color: s.status === "Operacional" ? "var(--green)" : "var(--amber)" }} />
                  <h3 className="font-display font-bold text-[15.5px] m-0 flex-1">{s.nome}</h3>
                  <Chip tom={s.status === "Operacional" ? "verde" : "ambar"} dot={false}>{s.status}</Chip>
                </div>
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="flex-1 rounded-full overflow-hidden" style={{ background: "rgba(19,37,29,0.09)", height: 8 }}>
                    <div className="h-full bar-anim rounded-full" style={{ width: `${uptime}%`, background: uptime > 95 ? "var(--green)" : "var(--amber)" }} />
                  </div>
                  <span className="font-extrabold text-[13px] tabular-nums">{String(uptime).replace(".", ",")}%</span>
                </div>
                <div className="text-[11px] mb-3" style={{ color: "var(--muted)" }}>Disponibilidade 30 dias · SLA contratado {s.sla}</div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  {[["Gestor", app.usuarios.find((u) => u.id === s.gestorId)?.nome.split(" ")[0] ?? "—"], ["RTO", s.rto], ["RPO", s.rpo]].map(([k, v]) => (
                    <div key={k} className="rounded-md px-2.5 py-2" style={{ background: "rgba(19,37,29,0.04)" }}>
                      <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{k}</div>
                      <div className="font-bold mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {aba === "atividades" && (
        <div className="anim-fade grid lg:grid-cols-2 gap-4 items-start">
          <div className="card p-5">
            <div className="ovl mb-3">Histórico de atividades (auditoria)</div>
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {auditoria.slice(0, 30).map((a) => (
                <div key={a.id} className="tick-row text-[12px]">
                  <span className="font-bold">{a.acao}</span> <span style={{ color: "var(--muted)" }}>— {a.objeto}</span>
                  <span className="block text-[10.5px]" style={{ color: "var(--muted)" }}>{a.usuario} · {fmtDataHora(a.dataHora)} · IP {a.ip}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <div className="ovl mb-3">Notificações recentes</div>
            <div className="space-y-2.5">
              {notificacoes.map((n) => (
                <div key={n.id} className="flex gap-2.5 rounded-lg px-3.5 py-2.5" style={{ background: n.lida ? "rgba(19,37,29,0.03)" : "rgba(242,183,10,0.07)" }}>
                  <span className="mt-1 w-2 h-2 rounded-full flex-none" style={{ background: n.lida ? "var(--line-2)" : "var(--accent)" }} />
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-bold">{n.titulo}</div>
                    <div className="text-[11px]" style={{ color: "var(--muted)" }}>{n.detalhe}</div>
                    <div className="text-[10.5px] mt-0.5" style={{ color: "var(--muted)" }}>{tempoRel(n.data)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal aberto={modalSalvar} onFechar={() => setModalSalvar(false)} titulo="Salvar em Meus Relatórios"
        rodape={<><button className="btn btn-outline" onClick={() => setModalSalvar(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => {
            if (!nomeSalvo.trim()) { toast("Informe um nome", "vermelho"); return; }
            salvarRelatorioFiltro(nomeSalvo.trim(), fonte, busca);
            toast("Relatório salvo", "verde", nomeSalvo);
            setModalSalvar(false);
          }}><Icon name="check" size={15} /> Salvar</button></>}>
        <Campo rotulo="Nome do relatório" obrigatorio><input className="input" value={nomeSalvo} onChange={(e) => setNomeSalvo(e.target.value)} /></Campo>
        <p className="text-[11.5px] mt-3 mb-0" style={{ color: "var(--muted)" }}>Os filtros atuais ({filtrosTexto}) serão preservados para execução posterior.</p>
      </Modal>
    </div>
  );
}

/* ============ Construtor de Relatórios (Administração) ============ */

export function ConstrutorRelatorios() {
  const { temPermissao, templatesRelatorio, salvarTemplateRelatorio, toggleTemplateRelatorio, historicoRelatorios, registrarGeracao } = useApp();
  const toast = useToast();
  const [novo, setNovo] = useState({ nome: "", descricao: "", fonte: "ativos", agrupamento: "", layout: "Retrato" as "Retrato" | "Paisagem" });
  const [colunasSel, setColunasSel] = useState<string[]>([]);

  const podeCriar = temPermissao("report.template.create") || temPermissao("system.configure");
  const fonteDef = FONTES[novo.fonte];

  const toggleCol = (chave: string) => setColunasSel((s) => s.includes(chave) ? s.filter((c) => c !== chave) : [...s, chave]);

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="ovl mb-1">Construtor de Relatórios</div>
        <p className="text-[12px] mt-0 mb-4" style={{ color: "var(--muted)" }}>
          Crie modelos reutilizáveis sem alterar o código: escolha a fonte controlada, as colunas visíveis, o agrupamento e o layout.
          Os modelos aparecem no módulo Monitoramento para todos os usuários autorizados.
        </p>
        {podeCriar ? (
          <>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Campo rotulo="Nome do relatório" obrigatorio><input className="input" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} placeholder="ex.: Equipamentos Obsoletos por Secretaria" /></Campo>
              <Campo rotulo="Descrição"><input className="input" value={novo.descricao} onChange={(e) => setNovo({ ...novo, descricao: e.target.value })} /></Campo>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <Seletor rotulo="Fonte de dados" valor={novo.fonte} onChange={(v) => { setNovo({ ...novo, fonte: v }); setColunasSel(FONTES[v].colunas.map((c) => c.chave)); }}
                opcoes={Object.entries(FONTES).map(([k, f]) => ({ valor: k, rotulo: f.rotulo }))} />
              <Seletor rotulo="Agrupamento" valor={novo.agrupamento} onChange={(v) => setNovo({ ...novo, agrupamento: v })}
                opcoes={[{ valor: "", rotulo: "Sem agrupamento" }, ...fonteDef.colunas.map((c) => ({ valor: c.chave, rotulo: c.rotulo }))]} />
              <Seletor rotulo="Layout" valor={novo.layout} onChange={(v) => setNovo({ ...novo, layout: v as "Retrato" | "Paisagem" })} opcoes={["Retrato", "Paisagem"]} />
            </div>
            <div className="mb-4">
              <div className="label">Colunas visíveis</div>
              <div className="flex flex-wrap gap-1.5">
                {fonteDef.colunas.map((c) => (
                  <button key={c.chave} className="chip cursor-pointer border-0 transition-all"
                    style={colunasSel.includes(c.chave) ? { background: "var(--green)", color: "#fff" } : { background: "var(--grey-soft)", color: "var(--grey)" }}
                    onClick={() => toggleCol(c.chave)}>
                    {colunasSel.includes(c.chave) && <Icon name="check" size={10} />} {c.rotulo}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-accent" onClick={() => {
              if (!novo.nome.trim()) { toast("Informe o nome do relatório", "vermelho"); return; }
              if (colunasSel.length === 0) { toast("Selecione ao menos uma coluna", "vermelho"); return; }
              salvarTemplateRelatorio({ nome: novo.nome.trim(), descricao: novo.descricao, fonte: novo.fonte, colunas: colunasSel, agrupamento: novo.agrupamento, layout: novo.layout, formatos: ["PDF", "XLSX", "CSV"], ativo: true });
              toast("Modelo criado", "verde", `${novo.nome} disponível no Monitoramento`);
              setNovo({ nome: "", descricao: "", fonte: novo.fonte, agrupamento: "", layout: "Retrato" });
              setColunasSel([]);
            }}><Icon name="mais" size={15} /> Criar modelo de relatório</button>
          </>
        ) : (
          <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>Seu perfil não possui permissão para criar modelos (report.template.create).</p>
        )}
      </div>

      <div className="card p-5">
        <div className="ovl mb-3">Modelos existentes — {fmtNum(templatesRelatorio.length)}</div>
        <div className="space-y-2">
          {templatesRelatorio.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg px-3.5 py-2.5" style={{ background: "rgba(19,37,29,0.035)", opacity: t.ativo ? 1 : 0.55 }}>
              <Icon name="relatorios" size={16} className="opacity-60" />
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-bold">{t.nome} {t.agrupamento && <span className="font-normal text-[11px]" style={{ color: "var(--muted)" }}>· agrupado por {t.agrupamento}</span>}</div>
                <div className="text-[10.5px] truncate" style={{ color: "var(--muted)" }}>{FONTES[t.fonte]?.rotulo} · {t.colunas.length} colunas · {t.layout} · {t.formatos.join(", ")}</div>
              </div>
              <Chip tom={t.ativo ? "verde" : "cinza"} dot={false}>{t.ativo ? "Ativo" : "Inativo"}</Chip>
              <button className="btn btn-outline !py-1 text-[11px]" onClick={() => { toggleTemplateRelatorio(t.id); toast(t.ativo ? "Modelo desativado" : "Modelo ativado", t.ativo ? "ambar" : "verde", t.nome); }}>
                {t.ativo ? "Desativar" : "Ativar"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="ovl mb-3">Histórico de gerações — {fmtNum(historicoRelatorios.length)} registros</div>
        {historicoRelatorios.length === 0 ? (
          <p className="text-[12px] m-0" style={{ color: "var(--muted)" }}>Nenhuma geração registrada nesta sessão. Exporte um relatório no Monitoramento para alimentar o histórico.</p>
        ) : (
          <table className="tbl">
            <thead><tr><th>Data/Hora</th><th>Relatório</th><th>Usuário</th><th>Formato</th><th>Filtros</th><th>Registros</th></tr></thead>
            <tbody>
              {historicoRelatorios.map((h) => (
                <tr key={h.id}>
                  <td className="tabular-nums text-[12px] whitespace-nowrap font-bold">{fmtDataHora(h.data)}</td>
                  <td className="text-[12px] font-semibold">{h.relatorio}</td>
                  <td className="text-[12px]">{h.usuario}</td>
                  <td><Chip tom="azul" dot={false}>{h.formato}</Chip></td>
                  <td className="text-[11.5px] max-w-[260px] truncate" style={{ color: "var(--muted)" }}>{h.filtros}</td>
                  <td className="tabular-nums font-bold">{fmtNum(h.registros)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button className="btn btn-outline mt-3 !py-1.5 text-[12px]" onClick={() => {
          const csv = "\uFEFF" + ["Data/Hora;Relatório;Usuário;Formato;Filtros;Registros", ...historicoRelatorios.map((h) => [fmtDataHora(h.data), h.relatorio, h.usuario, h.formato, h.filtros, h.registros].join(";"))].join("\n");
          baixarArquivo("historico_relatorios.csv", csv, "text/csv;charset=utf-8");
          registrarGeracao("Histórico de Relatórios", "CSV", "Exportação completa", historicoRelatorios.length);
          toast("Histórico exportado", "verde", "historico_relatorios.csv");
        }}><Icon name="baixar" size={14} /> Exportar histórico (CSV)</button>
      </div>
    </div>
  );
}
