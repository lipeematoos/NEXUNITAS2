import { useMemo, useState } from "react";
import { Chip, Icon, useToast } from "../../components/ui";
import { Ativo, PERTENCIMENTO_EXPLICITO, Pertencimento, camposFaltantes } from "../../lib/data";
import { fmtData, fmtDataHora, fmtMoeda, fmtNum } from "../../lib/format";
import { useApp } from "../../lib/store";

type SubAba = "qualidade" | "secretarias" | "gestoras" | "idade" | "obsolescencia" | "oficiais";

const anosDe = (iso: string) => (iso ? (Date.now() - new Date(iso).getTime()) / (365.25 * 86400000) : null);

export function pertencimentoEfetivo(a: Ativo, secretarias: { id: string }[], unDe: (id: string | null) => { id: string; parentId: string | null; tipo: string } | undefined): Pertencimento {
  if (a.pertencimento) return a.pertencimento;
  if (PERTENCIMENTO_EXPLICITO[a.id]) return PERTENCIMENTO_EXPLICITO[a.id];
  let cur = unDe(a.unidadeId);
  let secretariaId = a.unidadeId;
  while (cur) {
    if (cur.tipo === "Secretaria") { secretariaId = cur.id; break; }
    if (!cur.parentId) break;
    cur = unDe(cur.parentId);
  }
  void secretarias;
  return { orgaoId: "un0", gestoraId: "ug1", fundoId: null, secretariaId, departamentoId: null, centroCusto: null, responsavelPatrimonialId: a.responsavelId };
}

function baixarCSV(nomeArquivo: string, linhas: (string | number)[][]) {
  const csv = linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RelatoriosPatrimoniais() {
  const { ativos, unidades, gestoras, fundos, usuarios, config, regrasObsolescencia, setRegrasObsolescencia, snapshots, salvarSnapshot, atual } = useApp();
  const toast = useToast();
  const [aba, setAba] = useState<SubAba>("qualidade");
  const [filtroSecretaria, setFiltroSecretaria] = useState("Todas");
  const [filtroStatus, setFiltroStatus] = useState("Todos");

  const unDe = (id: string | null) => unidades.find((u) => u.id === id);
  const pertDe = (a: Ativo) => pertencimentoEfetivo(a, unidades, unDe);
  const siglaDe = (id: string) => unDe(id)?.sigla ?? "—";
  const nomeUsuario = (id: string | null) => usuarios.find((u) => u.id === id)?.nome ?? "—";

  const filtrados = useMemo(() => ativos.filter((a) => {
    const sec = pertDe(a).secretariaId;
    return (filtroSecretaria === "Todas" || sec === filtroSecretaria) && (filtroStatus === "Todos" || a.status === filtroStatus);
  }), [ativos, filtroSecretaria, filtroStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ===== Qualidade do cadastro ===== */
  const qualidade = useMemo(() => {
    const semPatrimonio = ativos.filter((a) => !a.patrimonio).length;
    const semSerie = ativos.filter((a) => !a.serie).length;
    const semUnidade = ativos.filter((a) => !a.unidadeId).length;
    const semLocalizacao = ativos.filter((a) => !a.sala && !a.predio).length;
    const semResponsavel = ativos.filter((a) => !a.responsavelId && !["Em Estoque", "Baixado", "Reserva"].includes(a.status)).length;
    const semAquisicao = ativos.filter((a) => !a.aquisicao).length;
    const semCategoria = ativos.filter((a) => !a.categoria).length;
    const patrimonios = ativos.filter((a) => a.patrimonio).map((a) => a.patrimonio);
    const series = ativos.filter((a) => a.serie).map((a) => a.serie);
    const dupPatrimonio = [...new Set(patrimonios.filter((p, i) => patrimonios.indexOf(p) !== i))];
    const dupSerie = [...new Set(series.filter((s, i) => series.indexOf(s) !== i))];
    const incompletos = ativos.filter((a) => camposFaltantes(a).length > 0);
    return { semPatrimonio, semSerie, semUnidade, semLocalizacao, semResponsavel, semAquisicao, semCategoria, dupPatrimonio, dupSerie, incompletos };
  }, [ativos]);

  const completos = ativos.length - qualidade.incompletos.length;
  const pctCompletos = Math.round((completos / Math.max(1, ativos.length)) * 100);

  /* ===== Idade ===== */
  const faixas = [
    { rotulo: "Até 2 anos", min: 0, max: 2 }, { rotulo: "2 a 4 anos", min: 2, max: 4 },
    { rotulo: "4 a 6 anos", min: 4, max: 6 }, { rotulo: "6 a 8 anos", min: 6, max: 8 },
    { rotulo: "Mais de 8 anos", min: 8, max: 999 }, { rotulo: "Data desconhecida", min: -1, max: -1 },
  ];
  const idadeFaixas = faixas.map((f) => ({
    ...f,
    n: filtrados.filter((a) => {
      const idade = anosDe(a.aquisicao);
      if (f.min === -1) return idade === null;
      return idade !== null && idade >= f.min && idade < f.max;
    }).length,
  }));
  const maxIdade = Math.max(1, ...idadeFaixas.map((f) => f.n));

  /* ===== Obsolescência ===== */
  const anosLimite = (cat: string) => regrasObsolescencia.find((r) => r.categoria === cat)?.anos ?? regrasObsolescencia.find((r) => r.categoria === "_padrao")?.anos ?? 6;
  const obsoletos = useMemo(() => ativos.filter((a) => {
    if (["Baixado"].includes(a.status)) return false;
    const idade = anosDe(a.aquisicao);
    return idade !== null && idade >= anosLimite(a.categoria);
  }), [ativos, regrasObsolescencia]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ===== Relatórios oficiais ===== */
  const RELATORIOS: { id: string; nome: string; descricao: string; linhas: () => (string | number)[][] }[] = [
    { id: "rel1", nome: "Relação Geral de Equipamentos", descricao: "Todos os equipamentos de tecnologia da organização com pertencimento e localização.", linhas: () => [["Patrimônio", "Categoria", "Fabricante", "Modelo", "Série", "Status", "Secretaria proprietária", "Unidade gestora", "Localização", "Responsável", "Valor (R$)"], ...filtrados.map((a) => { const p = pertDe(a); return [a.patrimonio || "—", a.categoria, a.fabricante, a.modelo, a.serie || "—", a.status, siglaDe(p.secretariaId), gestoras.find((g) => g.id === p.gestoraId)?.sigla ?? "—", `${a.predio} — ${a.sala || "—"}`, nomeUsuario(a.responsavelId), a.valor]; })] },
    { id: "rel2", nome: "Equipamentos por Secretaria", descricao: "Consolidado por secretaria proprietária com quebra por categoria.", linhas: () => { const secs = [...new Set(ativos.map((a) => pertDe(a).secretariaId))]; return [["Secretaria", "Categoria", "Quantidade"], ...secs.flatMap((s) => { const doSec = ativos.filter((a) => pertDe(a).secretariaId === s); const cats = [...new Set(doSec.map((a) => a.categoria))]; return [...cats.map((c) => [unDe(s)?.nome ?? s, c, doSec.filter((a) => a.categoria === c).length] as (string | number)[]), [unDe(s)?.nome ?? s, "TOTAL", doSec.length] as (string | number)[]]; }), ["TOTAL GERAL", "—", ativos.length]]; } },
    { id: "rel3", nome: "Equipamentos por Unidade Gestora", descricao: "Prefeitura, fundos municipais e autarquias com valores contábeis.", linhas: () => [["Unidade Gestora", "Total", "Em uso", "Em estoque", "Manutenção", "Obsoletos", "Baixados", "Valor total (R$)"], ...gestoras.map((g) => { const doG = ativos.filter((a) => pertDe(a).gestoraId === g.id); return [g.nome, doG.length, doG.filter((a) => a.status === "Em Uso").length, doG.filter((a) => ["Em Estoque", "Reserva"].includes(a.status)).length, doG.filter((a) => ["Em Manutenção", "Aguardando Manutenção"].includes(a.status)).length, doG.filter((a) => a.status === "Obsoleto").length, doG.filter((a) => a.status === "Baixado").length, doG.reduce((s, a) => s + a.valor, 0)]; })] },
    { id: "rel4", nome: "Equipamentos por Categoria", descricao: "Parque tecnológico por tipo de equipamento.", linhas: () => [["Categoria", "Quantidade"], ...[...new Set(ativos.map((a) => a.categoria))].map((c) => [c, ativos.filter((a) => a.categoria === c).length])] },
    { id: "rel5", nome: "Equipamentos Obsoletos", descricao: "Acima do critério de idade configurado por categoria.", linhas: () => [["Patrimônio", "Categoria", "Modelo", "Idade (anos)", "Critério", "Secretaria", "Situação"], ...obsoletos.map((a) => { const idade = anosDe(a.aquisicao); return [a.patrimonio || "—", a.categoria, `${a.fabricante} ${a.modelo}`, idade !== null ? Math.round(idade) : "—", `${anosLimite(a.categoria)} anos`, siglaDe(pertDe(a).secretariaId), a.status]; })] },
    { id: "rel6", nome: "Equipamentos em Manutenção", descricao: "Em manutenção ou aguardando manutenção.", linhas: () => [["Patrimônio", "Modelo", "Status", "Manutenções", "Última", "Custo acumulado (R$)"], ...ativos.filter((a) => ["Em Manutenção", "Aguardando Manutenção"].includes(a.status)).map((a) => [a.patrimonio || "—", `${a.fabricante} ${a.modelo}`, a.status, a.manutencoes.length, a.manutencoes.length ? fmtData(a.manutencoes[a.manutencoes.length - 1].data) : "—", a.manutencoes.reduce((s, m) => s + m.custo, 0)])] },
    { id: "rel7", nome: "Equipamentos Não Localizados", descricao: "Itens com divergência de localização ou não localizados no inventário.", linhas: () => [["Patrimônio", "Modelo", "Status", "Local esperado"], ...ativos.filter((a) => a.status === "Não Localizado").map((a) => [a.patrimonio || "—", `${a.fabricante} ${a.modelo}`, a.status, `${a.predio} — ${a.sala || "—"}`])] },
    { id: "rel8", nome: "Equipamentos Baixados", descricao: "Baixas patrimoniais com motivo e processo (registros preservados).", linhas: () => [["Patrimônio", "Modelo", "Motivo", "Data", "Processo", "Destino"], ...ativos.filter((a) => a.status === "Baixado").map((a) => [a.patrimonio || "—", `${a.fabricante} ${a.modelo}`, a.baixa?.motivo ?? "—", a.baixa ? fmtData(a.baixa.data) : "—", a.baixa?.processo ?? "—", a.baixa?.destino ?? "—"])] },
    { id: "rel9", nome: "Equipamentos sem Informação Obrigatória", descricao: "Pendências de cadastro por equipamento.", linhas: () => [["Patrimônio", "Categoria", "Campos faltantes"], ...qualidade.incompletos.map((a) => [a.patrimonio || "—", a.categoria, camposFaltantes(a).join(", ")])] },
    { id: "rel10", nome: "Garantias", descricao: "Situação de garantia de todo o parque.", linhas: () => [["Patrimônio", "Modelo", "Fornecedor", "Fim da garantia", "Situação"], ...ativos.map((a) => { const dias = Math.round((new Date(a.garantiaFim).getTime() - Date.now()) / 86400000); return [a.patrimonio || "—", `${a.fabricante} ${a.modelo}`, a.fornecedor, fmtData(a.garantiaFim), dias < 0 ? "Vencida" : dias <= 60 ? `Vence em ${dias} dias` : "Vigente"]; })] },
  ];

  const gerar = (rel: (typeof RELATORIOS)[number], salvar: boolean) => {
    const linhas = rel.linhas();
    baixarCSV(`${rel.nome.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.csv`, linhas);
    if (salvar) {
      const filtros = `Secretaria: ${filtroSecretaria} · Status: ${filtroStatus}`;
      salvarSnapshot(rel.nome, filtros, linhas.length - 1);
      toast("Relatório gerado e snapshot salvo", "verde", `${rel.nome} · ${fmtNum(linhas.length - 1)} registros · filtros e hash registrados`);
    } else {
      toast("Relatório exportado (CSV)", "azul", `${rel.nome} · ${fmtNum(linhas.length - 1)} registros`);
    }
  };

  const secretarias = unidades.filter((u) => u.tipo === "Secretaria" || u.tipo === "Órgão");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select className="select !w-[250px]" value={filtroSecretaria} onChange={(e) => setFiltroSecretaria(e.target.value)} aria-label="Filtrar por secretaria proprietária">
          <option value="Todas">Todas as secretarias</option>
          {secretarias.map((s) => <option key={s.id} value={s.id}>{s.sigla} — {s.nome}</option>)}
        </select>
        <select className="select !w-[170px]" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} aria-label="Filtrar por status">
          <option value="Todos">Todos os status</option>
          {[...new Set(ativos.map((a) => a.status))].map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="text-[12px] font-semibold self-center" style={{ color: "var(--muted)" }}>{fmtNum(filtrados.length)} equipamentos no recorte</span>
        <span className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: "var(--deep)", color: "var(--accent)" }}>
          Base única consolidada — {fmtNum(ativos.length)} equipamentos em toda a organização
        </span>
      </div>

      <div className="flex gap-1 mb-5 overflow-x-auto" style={{ borderBottom: "1px solid var(--line)" }}>
        {([["qualidade", "Qualidade do Cadastro", "check"], ["secretarias", "Por Secretaria", "organograma"], ["gestoras", "Por Unidade Gestora", "administracao"], ["idade", "Idade do Parque", "relogio"], ["obsolescencia", "Obsolescência", "aviso"], ["oficiais", "Relatórios Oficiais", "relatorios"]] as const).map(([k, r, ic]) => (
          <button key={k} className={`tab-btn ${aba === k ? "on" : ""}`} onClick={() => setAba(k)}>
            <span className="inline-flex items-center gap-1.5"><Icon name={ic} size={14} /> {r}</span>
          </button>
        ))}
      </div>

      {/* ===== Qualidade ===== */}
      {aba === "qualidade" && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex flex-wrap items-center gap-5">
              <div className="w-[150px]">
                <div className="font-display font-extrabold text-[34px] leading-none tabular-nums" style={{ color: pctCompletos >= 80 ? "var(--green)" : "var(--amber)" }}>{fmtNum(pctCompletos)}%</div>
                <div className="text-[11px] font-bold uppercase tracking-wider mt-1" style={{ color: "var(--muted)" }}>Cadastros completos</div>
              </div>
              <div className="flex-1 min-w-[220px]">
                <div className="rounded-full h-3.5 overflow-hidden flex" style={{ background: "rgba(19,37,29,0.09)" }}>
                  <div className="h-full bar-anim" style={{ width: `${pctCompletos}%`, background: "var(--green)" }} />
                  <div className="h-full bar-anim" style={{ width: `${100 - pctCompletos}%`, background: "var(--amber)" }} />
                </div>
                <div className="text-[12px] mt-2" style={{ color: "var(--muted)" }}>
                  <strong>{fmtNum(completos)}</strong> completos · <strong>{fmtNum(qualidade.incompletos.length)}</strong> com campos obrigatórios pendentes. Saneie os dados antes de emitir relatórios oficiais.
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            {[
              ["Sem patrimônio", qualidade.semPatrimonio], ["Sem série", qualidade.semSerie], ["Sem secretaria", qualidade.semUnidade],
              ["Sem localização", qualidade.semLocalizacao], ["Sem responsável", qualidade.semResponsavel], ["Sem data de aquisição", qualidade.semAquisicao], ["Sem categoria", qualidade.semCategoria],
            ].map(([r, n]) => (
              <div key={r as string} className="card card-hover px-4 py-3.5 text-center">
                <div className="font-display font-extrabold text-[24px] tabular-nums" style={{ color: (n as number) > 0 ? "var(--red)" : "var(--green)" }}>{fmtNum(n as number)}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: "var(--muted)" }}>{r}</div>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-4 items-start">
            <div className="card p-5">
              <div className="ovl mb-3">Possíveis duplicidades</div>
              {qualidade.dupPatrimonio.length === 0 && qualidade.dupSerie.length === 0 ? (
                <p className="text-[12.5px] m-0" style={{ color: "var(--muted)" }}>Nenhuma duplicidade de patrimônio ou série detectada.</p>
              ) : (
                <ul className="m-0 p-0 list-none space-y-2">
                  {qualidade.dupSerie.map((s) => (
                    <li key={s} className="rounded-lg px-3.5 py-2.5" style={{ background: "var(--red-soft)" }}>
                      <div className="text-[12.5px] font-bold" style={{ color: "var(--red)" }}>Série possivelmente duplicada: {s}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>
                        {ativos.filter((a) => a.serie === s).map((a) => `${a.patrimonio || "(sem patrimônio)"} — ${a.modelo}`).join(" · ")}
                      </div>
                    </li>
                  ))}
                  {qualidade.dupPatrimonio.map((p) => (
                    <li key={p} className="rounded-lg px-3.5 py-2.5" style={{ background: "var(--red-soft)" }}>
                      <div className="text-[12.5px] font-bold" style={{ color: "var(--red)" }}>Patrimônio duplicado: {p}</div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-[10.5px] mt-3 mb-0" style={{ color: "var(--muted)" }}>Duplicidades não são mescladas automaticamente — um administrador autorizado decide o tratamento.</p>
            </div>
            <div className="card p-5">
              <div className="ovl mb-3">Registros com pendência</div>
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {qualidade.incompletos.map((a) => (
                  <div key={a.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5" style={{ background: "rgba(19,37,29,0.035)" }}>
                    <Icon name="aviso" size={15} className="text-[var(--amber)] flex-none" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-bold truncate">{a.patrimonio || "(sem patrimônio)"} — {a.fabricante} {a.modelo}</div>
                      <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{camposFaltantes(a).join(", ")}</div>
                    </div>
                    <Chip tom="ambar" dot={false}>Incompleto</Chip>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Por secretaria ===== */}
      {aba === "secretarias" && (
        <div className="space-y-4">
          {secretarias.map((s) => {
            const doSec = ativos.filter((a) => pertDe(a).secretariaId === s.id);
            if (doSec.length === 0) return null;
            const cats = [...new Set(doSec.map((a) => a.categoria))];
            return (
              <div key={s.id} className="card overflow-hidden">
                <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--line)" }}>
                  <div className="font-display font-bold text-[15px]">{s.nome}</div>
                  <Chip tom="verde">{fmtNum(doSec.length)} equipamentos</Chip>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 divide-x" style={{ borderColor: "var(--line)" }}>
                  {cats.map((c, i) => (
                    <div key={c} className="px-4 py-3" style={{ borderLeft: i > 0 ? "1px solid var(--line)" : undefined }}>
                      <div className="font-display font-extrabold text-[20px] tabular-nums">{fmtNum(doSec.filter((a) => a.categoria === c).length)}</div>
                      <div className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{c}s</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="card px-5 py-4 flex items-center justify-between" style={{ background: "var(--deep)", border: "none" }}>
            <span className="font-display font-extrabold text-[17px]" style={{ color: "#f4f7f2" }}>Total geral da Prefeitura</span>
            <span className="font-display font-extrabold text-[26px] tabular-nums" style={{ color: "var(--accent)" }}>{fmtNum(ativos.length)} equipamentos</span>
          </div>
        </div>
      )}

      {/* ===== Por gestora ===== */}
      {aba === "gestoras" && (
        <div className="grid lg:grid-cols-3 gap-4">
          {gestoras.map((g) => {
            const doG = ativos.filter((a) => pertDe(a).gestoraId === g.id);
            const linhas: [string, number, string][] = [
              ["Em uso", doG.filter((a) => a.status === "Em Uso").length, "var(--green)"],
              ["Em estoque / reserva", doG.filter((a) => ["Em Estoque", "Reserva"].includes(a.status)).length, "var(--blue)"],
              ["Em manutenção", doG.filter((a) => ["Em Manutenção", "Aguardando Manutenção"].includes(a.status)).length, "var(--amber)"],
              ["Obsoletos", doG.filter((a) => a.status === "Obsoleto").length, "var(--red)"],
              ["Inservíveis", doG.filter((a) => a.status === "Inservível").length, "var(--red)"],
              ["Baixados", doG.filter((a) => a.status === "Baixado").length, "var(--grey)"],
            ];
            return (
              <div key={g.id} className="card p-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-display font-bold text-[15px]">{g.nome}</div>
                  <Chip tom="cinza" dot={false}>{g.codigo}</Chip>
                </div>
                <div className="text-[11px] mb-3" style={{ color: "var(--muted)" }}>Vinculada a: {unDe(g.unidadeId)?.nome}</div>
                <div className="font-display font-extrabold text-[30px] tabular-nums">{fmtNum(doG.length)} <span className="text-[13px] font-bold" style={{ color: "var(--muted)" }}>ativos</span></div>
                <div className="space-y-1.5 mt-3">
                  {linhas.map(([r, n, cor]) => (
                    <div key={r} className="flex items-center justify-between text-[12px]">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: cor }} /> {r}</span>
                      <strong className="tabular-nums">{fmtNum(n)}</strong>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 text-[12px] font-bold" style={{ borderTop: "1px dashed var(--line)" }}>
                  Valor contábil: {fmtMoeda(doG.reduce((s, a) => s + a.valor, 0), config.regional.moeda)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Idade ===== */}
      {aba === "idade" && (
        <div className="card p-5">
          <div className="ovl mb-4">Idade do parque tecnológico (aquisição)</div>
          <div className="space-y-3">
            {idadeFaixas.map((f) => (
              <div key={f.rotulo} className="flex items-center gap-3">
                <span className="w-[150px] flex-none text-[12.5px] font-bold">{f.rotulo}</span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ background: "rgba(19,37,29,0.08)", height: 18 }}>
                  <div className="h-full bar-anim flex items-center justify-end pr-2" style={{ width: `${(f.n / maxIdade) * 100}%`, background: f.min >= 6 ? "var(--red)" : f.min >= 4 ? "var(--amber)" : "var(--green)" }}>
                    {f.n > 0 && <span className="text-[10px] font-extrabold text-white">{fmtNum(f.n)}</span>}
                  </div>
                </div>
                <span className="w-10 text-right font-extrabold tabular-nums">{fmtNum(f.n)}</span>
              </div>
            ))}
          </div>
          <p className="text-[11.5px] mt-4 mb-0" style={{ color: "var(--muted)" }}>Recorte atual: {filtroSecretaria === "Todas" ? "todas as secretarias" : unDe(filtroSecretaria)?.nome} · equipamentos com data de aquisição desconhecida são destacados para correção cadastral.</p>
        </div>
      )}

      {/* ===== Obsolescência ===== */}
      {aba === "obsolescencia" && (
        <div className="grid lg:grid-cols-[320px_1fr] gap-4 items-start">
          <div className="card p-5">
            <div className="ovl mb-3">Critérios configuráveis (anos)</div>
            <div className="space-y-2.5">
              {regrasObsolescencia.filter((r) => r.categoria !== "_padrao").map((r) => (
                <div key={r.categoria} className="flex items-center gap-3">
                  <span className="flex-1 text-[12.5px] font-bold">{r.categoria}</span>
                  <input className="input !py-1 !w-[74px] text-center tabular-nums" type="number" min={1} value={r.anos}
                    onChange={(e) => { setRegrasObsolescencia(regrasObsolescencia.map((x) => x.categoria === r.categoria ? { ...x, anos: Number(e.target.value) } : x)); }} />
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px dashed var(--line)" }}>
                <span className="flex-1 text-[12.5px] font-bold">Demais categorias</span>
                <input className="input !py-1 !w-[74px] text-center tabular-nums" type="number" min={1}
                  value={regrasObsolescencia.find((r) => r.categoria === "_padrao")?.anos ?? 6}
                  onChange={(e) => setRegrasObsolescencia(regrasObsolescencia.map((x) => x.categoria === "_padrao" ? { ...x, anos: Number(e.target.value) } : x))} />
              </div>
            </div>
            <button className="btn btn-primary w-full mt-4" onClick={() => toast("Critérios salvos", "verde", "O relatório de obsolescência foi recalculado.")}>
              <Icon name="check" size={15} /> Aplicar critérios
            </button>
          </div>
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--line)" }}>
              <div className="font-display font-bold text-[15px]">Relatório de Obsolescência Tecnológica</div>
              <Chip tom="vermelho">{fmtNum(obsoletos.length)} equipamentos</Chip>
            </div>
            <div className="overflow-x-auto">
              <table className="tbl min-w-[700px]">
                <thead><tr><th>Patrimônio</th><th>Categoria</th><th>Modelo</th><th>Idade</th><th>Localização</th><th>Manutenções</th><th>Recomendação</th></tr></thead>
                <tbody>
                  {obsoletos.map((a) => {
                    const idade = Math.round(anosDe(a.aquisicao) ?? 0);
                    const muitasManut = a.manutencoes.length >= 3;
                    return (
                      <tr key={a.id}>
                        <td className="font-extrabold tabular-nums">{a.patrimonio || "—"}</td>
                        <td><Chip tom="cinza" dot={false}>{a.categoria}</Chip></td>
                        <td className="text-[12px] font-semibold">{a.fabricante} {a.modelo}</td>
                        <td className="font-bold tabular-nums" style={{ color: "var(--red)" }}>{fmtNum(idade)} anos <span className="font-normal" style={{ color: "var(--muted)" }}>(critério {fmtNum(anosLimite(a.categoria))})</span></td>
                        <td className="text-[12px]">{siglaDe(pertDe(a).secretariaId)} · {a.sala || a.predio}</td>
                        <td className="tabular-nums text-[12px]">{fmtNum(a.manutencoes.length)}{muitasManut ? " ⚠" : ""}</td>
                        <td><Chip tom={muitasManut ? "vermelho" : "ambar"} dot={false}>{muitasManut ? "Substituição prioritária" : "Planejar substituição"}</Chip></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 text-[11px]" style={{ borderTop: "1px solid var(--line)", color: "var(--muted)" }}>
              Recomendações automáticas não executam baixa — a substituição é sempre decisão administrativa formal.
            </div>
          </div>
        </div>
      )}

      {/* ===== Oficiais ===== */}
      {aba === "oficiais" && (
        <div className="grid lg:grid-cols-2 gap-4 items-start">
          <div className="space-y-3">
            {RELATORIOS.map((r) => (
              <div key={r.id} className="card card-hover p-4 flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-none" style={{ background: "var(--green-soft)", color: "var(--green)" }}>
                  <Icon name="relatorios" size={17} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold">{r.nome}</div>
                  <div className="text-[11px]" style={{ color: "var(--muted)" }}>{r.descricao}</div>
                </div>
                <button className="btn btn-outline !py-1.5 text-[11.5px] flex-none" onClick={() => gerar(r, false)}><Icon name="baixar" size={13} /> CSV</button>
                <button className="btn btn-primary !py-1.5 text-[11.5px] flex-none" onClick={() => gerar(r, true)}><Icon name="check" size={13} /> Gerar oficial</button>
              </div>
            ))}
          </div>
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--line)" }}>
              <div className="font-display font-bold text-[15px]">Relatórios consolidados salvos (snapshots)</div>
              <div className="text-[11.5px]" style={{ color: "var(--muted)" }}>Registros imutáveis que comprovam o conteúdo reportado em cada data, mesmo que o patrimônio mude depois.</div>
            </div>
            {snapshots.length === 0 ? (
              <div className="px-5 py-8 text-center text-[12.5px]" style={{ color: "var(--muted)" }}>
                Nenhum snapshot salvo ainda. Clique em “Gerar oficial” para criar o primeiro registro com hash de integridade.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="tbl min-w-[560px]">
                  <thead><tr><th>Relatório</th><th>Gerado em</th><th>Registros</th><th>Hash</th><th>Por</th></tr></thead>
                  <tbody>
                    {snapshots.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div className="font-bold text-[12.5px]">{s.nome}</div>
                          <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{s.filtros}</div>
                        </td>
                        <td className="tabular-nums text-[12px] whitespace-nowrap">{fmtDataHora(s.data)}</td>
                        <td className="tabular-nums font-bold">{fmtNum(s.total)}</td>
                        <td className="tabular-nums text-[11px] font-bold" style={{ color: "var(--green)" }}>#{s.hash}</td>
                        <td className="text-[12px] whitespace-nowrap">{s.usuario === atual.nome ? "Você" : s.usuario}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
