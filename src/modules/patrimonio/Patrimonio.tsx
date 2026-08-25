import { useMemo, useState } from "react";
import { Avatar, Campo, Chip, Contador, Icon, Modal, PainelLateral, QrCode, Reveal, Seletor, StatusChamadoChip, Vazio, useToast } from "../../components/ui";
import { CabecalhoPagina } from "../../components/shell";
import { Ativo, CAMPOS_DINAMICOS, CATEGORIAS_ATIVO, MOTIVOS_BAIXA, RESULTADOS_INVENTARIO, STATUS_ATIVO, camposFaltantes } from "../../lib/data";
import { fmtData, fmtMoeda, fmtNum, tempoRel } from "../../lib/format";
import { useApp } from "../../lib/store";
import RelatoriosPatrimoniais, { pertencimentoEfetivo } from "./RelatoriosPatrimoniais";

type Aba = "visao" | "equipamentos" | "movimentacoes" | "inventario" | "garantias" | "relatorios";

const anosDe = (iso: string) => (Date.now() - new Date(iso).getTime()) / (365.25 * 86400000);

export default function Patrimonio() {
  const { ativos, usuarios, unidades, inventario, licencas, movimentarAtivo, registrarManutencao, alterarStatusAtivo, setResultadoInventario, config, chamados, temPermissao, baixarAtivo, fundos, gestoras } = useApp();
  const toast = useToast();
  const [aba, setAba] = useState<Aba>("visao");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroCat, setFiltroCat] = useState("Todas");
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [modalMov, setModalMov] = useState<Ativo | null>(null);
  const [mov, setMov] = useState({ destino: "", novoResponsavel: "", motivo: "" });
  const [modalMan, setModalMan] = useState<Ativo | null>(null);
  const [man, setMan] = useState({ tipo: "Corretiva", descricao: "", diagnostico: "", solucao: "", pecas: "", custo: "", tempoMin: "45" });
  const [modalQr, setModalQr] = useState<Ativo | null>(null);
  const [modalTermo, setModalTermo] = useState<Ativo | null>(null);
  const [modalBaixa, setModalBaixa] = useState<Ativo | null>(null);
  const [baixa, setBaixa] = useState({ motivo: "Inservível", data: "", documento: "", processo: "", destino: "", obs: "" });
  const [abaDetalhe, setAbaDetalhe] = useState<"dados" | "rede" | "dominio" | "ip" | "historico">("dados");

  const nomeDe = (id: string | null) => usuarios.find((u) => u.id === id);
  const unidadeDe = (id: string) => unidades.find((u) => u.id === id);
  const selecionado = selecionadoId ? ativos.find((a) => a.id === selecionadoId) ?? null : null;

  /* Busca global de rede: IP, hostname, MAC, patrimônio, série, usuário */
  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return ativos.filter((a) => {
      const alvo = `${a.patrimonio} ${a.codigoInterno} ${a.serie} ${a.modelo} ${a.fabricante} ${a.rede?.hostname ?? ""} ${a.rede?.ipv4 ?? ""} ${a.rede?.mac ?? ""} ${nomeDe(a.responsavelId)?.nome ?? ""} ${a.categoria}`.toLowerCase();
      return (q === "" || alvo.includes(q)) &&
        (filtroStatus === "Todos" || a.status === filtroStatus) &&
        (filtroCat === "Todas" || a.categoria === filtroCat);
    });
  }, [ativos, busca, filtroStatus, filtroCat]); // eslint-disable-line react-hooks/exhaustive-deps

  const porCategoria = useMemo(() => {
    const m = new Map<string, number>();
    ativos.forEach((a) => m.set(a.categoria, (m.get(a.categoria) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [ativos]);
  const maxCat = Math.max(1, ...porCategoria.map(([, n]) => n));

  const porStatus = useMemo(() => STATUS_ATIVO.map((s) => ({ ...s, n: ativos.filter((a) => a.status === s.label).length })).filter((s) => s.n > 0), [ativos]);

  const candidatos = useMemo(() => ativos.filter((a) => {
    const idade = anosDe(a.aquisicao);
    const foraGarantia = a.garantiaFim < new Date().toISOString().slice(0, 10);
    const muitasManut = a.manutencoes.filter((m) => m.data > new Date(Date.now() - 365 * 86400000).toISOString()).length >= 3;
    return !["Baixado", "Obsoleto"].includes(a.status) && (idade >= 6 || (muitasManut && foraGarantia));
  }), [ativos]);

  const garantias = ativos
    .filter((a) => !["Baixado"].includes(a.status))
    .map((a) => ({ a, dias: Math.round((new Date(a.garantiaFim).getTime() - Date.now()) / 86400000) }))
    .sort((x, y) => x.dias - y.dias);

  const kpis = [
    { rotulo: "Total de Ativos", n: ativos.length, cor: "var(--ink)" },
    { rotulo: "Em Uso", n: ativos.filter((a) => a.status === "Em Uso").length, cor: "var(--green)" },
    { rotulo: "Em Estoque / Reserva", n: ativos.filter((a) => ["Em Estoque", "Reserva", "Cadastrado"].includes(a.status)).length, cor: "var(--blue)" },
    { rotulo: "Em Manutenção", n: ativos.filter((a) => a.status === "Em Manutenção").length, cor: "var(--amber)" },
    { rotulo: "Obsoletos / Baixados", n: ativos.filter((a) => ["Obsoleto", "Baixado"].includes(a.status)).length, cor: "var(--red)" },
    { rotulo: "Fora da Garantia", n: ativos.filter((a) => a.garantiaFim < new Date().toISOString().slice(0, 10) && a.status !== "Baixado").length, cor: "var(--red)" },
  ];

  const todasMovs = useMemo(
    () => ativos.flatMap((a) => a.movimentacoes.map((m) => ({ ...m, ativo: a }))).sort((a, b) => b.data.localeCompare(a.data)),
    [ativos]
  );

  const salvarMov = () => {
    if (!modalMov) return;
    if (!mov.destino.trim()) { toast("Informe o destino", "vermelho"); return; }
    movimentarAtivo(modalMov.id, {
      origem: `${unidadeDe(modalMov.unidadeId)?.sigla ?? "—"} — ${modalMov.sala}`,
      destino: mov.destino,
      responsavelAnterior: nomeDe(modalMov.responsavelId)?.nome ?? "Estoque",
      novoResponsavel: mov.novoResponsavel || "A definir",
      motivo: mov.motivo || "Transferência administrativa",
    });
    toast("Movimentação registrada", "verde", `Patrimônio ${modalMov.patrimonio} → ${mov.destino}`);
    setModalMov(null);
    setMov({ destino: "", novoResponsavel: "", motivo: "" });
  };

  const salvarMan = () => {
    if (!modalMan) return;
    if (!man.descricao.trim()) { toast("Informe a descrição", "vermelho"); return; }
    registrarManutencao(modalMan.id, {
      tecnicoId: "u5", data: new Date().toISOString(), tipo: man.tipo as "Corretiva",
      descricao: man.descricao, diagnostico: man.diagnostico || "—", solucao: man.solucao || "—",
      pecas: man.pecas || "—", custo: Number(man.custo) || 0, chamadoId: null, tempoMin: Number(man.tempoMin) || 0,
    });
    toast("Manutenção registrada", "verde", `Patrimônio ${modalMan.patrimonio} — histórico permanente atualizado`);
    setModalMan(null);
    setMan({ tipo: "Corretiva", descricao: "", diagnostico: "", solucao: "", pecas: "", custo: "", tempoMin: "45" });
  };

  const salvarBaixa = () => {
    if (!modalBaixa) return;
    if (!baixa.documento.trim() && !baixa.processo.trim()) { toast("Informe o documento ou o processo administrativo", "vermelho"); return; }
    baixarAtivo(modalBaixa.id, {
      motivo: baixa.motivo,
      data: baixa.data || new Date().toISOString().slice(0, 10),
      documento: baixa.documento || "—",
      processo: baixa.processo || "—",
      destino: baixa.destino || "Almoxarifado — aguardando destinação",
      obs: baixa.obs || "—",
    });
    toast("Baixa patrimonial registrada", "verde", `Patrimônio ${modalBaixa.patrimonio} — registro preservado com histórico`);
    setModalBaixa(null);
    setBaixa({ motivo: "Inservível", data: "", documento: "", processo: "", destino: "", obs: "" });
  };

  const podeGerir = temPermissao("asset.manage");
  const campanha = inventario[0];

  return (
    <div>
      <CabecalhoPagina
        titulo="Patrimônio de TI"
        subtitulo={`${fmtNum(ativos.length)} bens cadastrados · valor contábil ${fmtMoeda(ativos.reduce((s, a) => s + a.valor, 0), config.regional.moeda).replace(",00", "")} · inventário ${campanha?.nome ?? "—"}`}
      />
      <div className="flex gap-1 mb-5 overflow-x-auto" style={{ borderBottom: "1px solid var(--line)" }}>
        {([["visao", "Visão Geral", "painel"], ["equipamentos", "Equipamentos", "caixa"], ["movimentacoes", "Movimentações", "seta-d"], ["inventario", "Inventário", "check"], ["garantias", "Garantias e Licenças", "escudo"], ["relatorios", "Relatórios Institucionais", "relatorios"]] as const).map(([k, r, ic]) => (
          <button key={k} className={`tab-btn ${aba === k ? "on" : ""}`} onClick={() => setAba(k)}>
            <span className="inline-flex items-center gap-1.5"><Icon name={ic} size={14} /> {r}</span>
          </button>
        ))}
      </div>

      {/* ===== Visão geral ===== */}
      {aba === "visao" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {kpis.map((k, i) => (
              <Reveal key={k.rotulo} delay={i * 40}>
                <div className="card card-hover px-4 py-3.5">
                  <div className="font-display font-extrabold text-[26px] leading-none tabular-nums" style={{ color: k.cor }}>
                    <Contador valor={k.n} />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mt-1.5" style={{ color: "var(--muted)" }}>{k.rotulo}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4 items-start">
            <Reveal>
              <div className="card p-5">
                <div className="ovl mb-4">Equipamentos por categoria</div>
                <div className="space-y-2.5">
                  {porCategoria.map(([cat, n]) => (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="w-[110px] flex-none text-[12px] font-bold">{cat}</span>
                      <div className="flex-1 rounded-full overflow-hidden" style={{ background: "rgba(19,37,29,0.08)", height: 14 }}>
                        <div className="h-full rounded-full bar-anim flex items-center justify-end pr-1.5" style={{ width: `${(n / maxCat) * 100}%`, background: "linear-gradient(90deg, var(--green) 0%, #2f9d6e 100%)" }}>
                          {n >= 2 && <span className="text-[9px] font-extrabold text-white">{n}</span>}
                        </div>
                      </div>
                      <span className="w-8 text-right text-[12px] font-extrabold tabular-nums">{fmtNum(n)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={60}>
              <div className="card p-5">
                <div className="ovl mb-4">Ciclo de vida — distribuição por status</div>
                <div className="flex flex-wrap gap-2 mb-5">
                  {porStatus.map((s) => (
                    <button key={s.label} className="chip cursor-pointer border-0 transition-transform hover:scale-105" style={{ background: `${s.hex}22`, color: s.hex }} onClick={() => { setFiltroStatus(s.label); setAba("equipamentos"); }}>
                      <span className="dot" /> {s.label} · {fmtNum(s.n)}
                    </button>
                  ))}
                </div>
                <div className="ovl mb-3" style={{ color: "var(--red)" }}>Possíveis candidatos à substituição</div>
                <div className="space-y-2">
                  {candidatos.map((a) => (
                    <button key={a.id} className="w-full flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-left cursor-pointer border transition-colors hover:border-[var(--red)]"
                      style={{ background: "rgba(179,64,42,0.05)", borderColor: "transparent" }}
                      onClick={() => { setSelecionadoId(a.id); setAbaDetalhe("dados"); }}>
                      <span style={{ color: "var(--red)" }}><Icon name="aviso" size={17} /></span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[12.5px] font-bold truncate">Patrimônio {a.patrimonio} — {a.fabricante} {a.modelo}</span>
                        <span className="block text-[10.5px]" style={{ color: "var(--muted)" }}>
                          {fmtNum(Math.round(anosDe(a.aquisicao)))} anos de uso · {fmtNum(a.manutencoes.length)} manutenções · {a.garantiaFim < new Date().toISOString().slice(0, 10) ? "fora da garantia" : "em garantia"}
                        </span>
                      </span>
                      <Chip tom="vermelho" dot={false}>Recomendação</Chip>
                    </button>
                  ))}
                  {candidatos.length === 0 && <p className="text-[12px] m-0" style={{ color: "var(--muted)" }}>Nenhum equipamento elegível pelos critérios atuais.</p>}
                </div>
                <p className="text-[10.5px] mt-3 m-0" style={{ color: "var(--muted)" }}>Recomendação automática (≥ 6 anos de uso ou ≥ 3 manutenções em 12 meses fora da garantia). A baixa patrimonial é sempre decisão administrativa.</p>
              </div>
            </Reveal>
          </div>
        </div>
      )}

      {/* ===== Equipamentos ===== */}
      {aba === "equipamentos" && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[260px] max-w-[420px]">
              <Icon name="busca" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input className="input pl-9" placeholder="Pesquisa global: IP, hostname, MAC, patrimônio, série, usuário…" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <select className="select !w-[170px]" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} aria-label="Filtrar por status">
              {["Todos", ...STATUS_ATIVO.map((s) => s.label)].map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="select !w-[170px]" value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)} aria-label="Filtrar por categoria">
              {["Todas", ...CATEGORIAS_ATIVO].map((s) => <option key={s}>{s}</option>)}
            </select>
            <span className="self-center text-[12px] font-semibold" style={{ color: "var(--muted)" }}>{fmtNum(filtrados.length)} resultados</span>
          </div>

          {filtrados.length === 0 ? (
            <div className="card"><Vazio icone="caixa" titulo="Nenhum equipamento encontrado" dica="Tente pesquisar por IP (ex.: 192.168.10.47), hostname (ADM-PC-023) ou número de patrimônio." /></div>
          ) : (
            <div className="card overflow-hidden anim-rise">
              <div className="overflow-x-auto">
                <table className="tbl min-w-[900px]">
                  <thead><tr><th>Patrimônio</th><th>Equipamento</th><th>Categoria</th><th>Localização / Usuário</th><th>Hostname / IP</th><th>Status</th><th>Garantia</th><th className="text-right">Ações</th></tr></thead>
                  <tbody>
                    {filtrados.map((a) => {
                      const resp = nomeDe(a.responsavelId);
                      const foraGar = a.garantiaFim < new Date().toISOString().slice(0, 10);
                      return (
                        <tr key={a.id} className="cursor-pointer" onClick={() => { setSelecionadoId(a.id); setAbaDetalhe("dados"); }}>
                          <td>
                            <div className="font-extrabold tabular-nums text-[13px]">{a.patrimonio}</div>
                            <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{a.codigoInterno}</div>
                          </td>
                          <td>
                            <div className="font-semibold text-[12.5px]">{a.fabricante} {a.modelo}</div>
                            <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>Série {a.serie}</div>
                          </td>
                          <td><Chip tom="cinza" dot={false}>{a.categoria}</Chip></td>
                          <td>
                            <div className="text-[12px] font-bold">{resp ? resp.nome.split(" ").slice(0, 2).join(" ") : a.sala}</div>
                            <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{unidadeDe(a.unidadeId)?.sigla} · {a.predio}</div>
                          </td>
                          <td className="tabular-nums text-[11.5px]">
                            {a.rede ? <><div className="font-bold">{a.rede.hostname}</div><div style={{ color: "var(--muted)" }}>{a.rede.ipv4}</div></> : <span style={{ color: "var(--muted)" }}>—</span>}
                          </td>
                          <td><StatusChamadoChip s={a.status} /></td>
                          <td>
                            <span className="text-[11.5px] font-bold tabular-nums" style={{ color: foraGar ? "var(--red)" : "var(--green)" }}>
                              {fmtData(a.garantiaFim)}
                            </span>
                            <div className="text-[10px]" style={{ color: "var(--muted)" }}>{foraGar ? "vencida" : "vigente"}</div>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-1">
                              <button className="icon-btn" title="QR Code" aria-label="QR Code" onClick={() => setModalQr(a)}><Icon name="qr" size={16} /></button>
                              <button className="icon-btn" title="Movimentar" aria-label="Movimentar" onClick={() => { setModalMov(a); setMov({ destino: "", novoResponsavel: "", motivo: "" }); }}><Icon name="seta-d" size={16} /></button>
                              {podeGerir && <button className="icon-btn" title="Registrar manutenção" aria-label="Registrar manutenção" onClick={() => setModalMan(a)}><Icon name="engrenagem" size={16} /></button>}
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
        </>
      )}

      {/* ===== Movimentações ===== */}
      {aba === "movimentacoes" && (
        <div className="card overflow-hidden anim-rise">
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--line)" }}>
            <div>
              <div className="font-display font-bold text-[15px]">Trilha de movimentações</div>
              <div className="text-[11.5px]" style={{ color: "var(--muted)" }}>Toda transferência de custódia fica registrada — origem, destino, responsáveis e motivo.</div>
            </div>
            <Chip tom="verde" dot={false}>{fmtNum(todasMovs.length)} registros</Chip>
          </div>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[820px]">
              <thead><tr><th>Data</th><th>Equipamento</th><th>Origem</th><th></th><th>Destino</th><th>Responsáveis</th><th>Motivo</th><th>Registrado por</th></tr></thead>
              <tbody>
                {todasMovs.map((m, i) => (
                  <tr key={i}>
                    <td className="tabular-nums text-[12px] font-bold whitespace-nowrap">{fmtData(m.data)}</td>
                    <td className="text-[12px] font-bold whitespace-nowrap">{m.ativo.patrimonio} · {m.ativo.modelo}</td>
                    <td className="text-[12px]">{m.origem}</td>
                    <td><Icon name="seta-d" size={15} className="opacity-50" /></td>
                    <td className="text-[12px] font-bold">{m.destino}</td>
                    <td className="text-[12px]">{m.responsavelAnterior} → {m.novoResponsavel}</td>
                    <td className="text-[12px] max-w-[200px] truncate" style={{ color: "var(--muted)" }}>{m.motivo}</td>
                    <td className="text-[12px] whitespace-nowrap">{m.usuario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== Inventário ===== */}
      {aba === "inventario" && campanha && (() => {
        const cont = (r: string) => campanha.itens.filter((i) => i.resultado === r).length;
        const divergencias = cont("Não Localizado") + cont("Dados Divergentes") + cont("Movido");
        return (
          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[220px]">
                  <div className="ovl mb-1">Campanha vigente</div>
                  <h3 className="font-display font-extrabold text-[21px] m-0">{campanha.nome}</h3>
                  <div className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>{campanha.periodo} · responsável: {nomeDe(campanha.responsavelId)?.nome}</div>
                </div>
                <div className="w-[200px]">
                  <div className="flex justify-between text-[11.5px] font-bold mb-1"><span>Progresso da contagem</span><span className="tabular-nums">{fmtNum(campanha.itens.length)}/{fmtNum(campanha.itens.length)}</span></div>
                  <div className="rounded-full h-2.5 overflow-hidden" style={{ background: "rgba(19,37,29,0.1)" }}>
                    <div className="h-full bar-anim rounded-full" style={{ width: "100%", background: "var(--green)" }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  {[["Confirmado", "var(--green)"], ["Localização Divergente", "var(--blue)"], ["Responsável Divergente", "var(--cyan)"], ["Dados Divergentes", "var(--amber)"], ["Equipamento Adicional Encontrado", "var(--green)"], ["Não Localizado", "var(--red)"], ["Em Manutenção", "var(--cyan)"], ["Baixado", "var(--grey)"]].map(([r, cor]) => (
                    <span key={r} className="chip" style={{ background: `${cor}1e`, color: cor }}>{r}: {fmtNum(cont(r))}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="tbl min-w-[720px]">
                  <thead><tr><th>Patrimônio</th><th>Equipamento</th><th>Local esperado</th><th>Resultado</th><th className="text-right">Alterar resultado</th></tr></thead>
                  <tbody>
                    {campanha.itens.map((item) => {
                      const a = ativos.find((x) => x.id === item.patrimonioId);
                      if (!a) return null;
                      const corRes: Record<string, string> = { "Confirmado": "verde", "Localização Divergente": "azul", "Responsável Divergente": "ciano", "Dados Divergentes": "ambar", "Equipamento Adicional Encontrado": "pinho", "Não Localizado": "vermelho", "Em Manutenção": "ciano", "Baixado": "cinza" };
                      return (
                        <tr key={item.patrimonioId}>
                          <td className="font-extrabold tabular-nums">{a.patrimonio}</td>
                          <td className="text-[12.5px] font-semibold">{a.fabricante} {a.modelo}</td>
                          <td className="text-[12px]" style={{ color: "var(--muted)" }}>{a.predio} · {a.sala}</td>
                          <td><Chip tom={(corRes[item.resultado] ?? "cinza") as never}>{item.resultado}</Chip></td>
                          <td>
                            <select
                              className="select !py-1 !text-[11.5px] !w-[170px] ml-auto block"
                              value={item.resultado}
                              onChange={(e) => { setResultadoInventario(campanha.id, item.patrimonioId, e.target.value); toast("Resultado atualizado", "verde", `${a.patrimonio}: ${e.target.value}`); }}
                            >
                              {RESULTADOS_INVENTARIO.map((r) => <option key={r}>{r}</option>)}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 flex items-center gap-2 text-[12px] font-bold" style={{ borderTop: "1px solid var(--line)", background: divergencias > 0 ? "var(--amber-soft)" : "var(--green-soft)", color: divergencias > 0 ? "var(--amber)" : "var(--green)" }}>
                <Icon name={divergencias > 0 ? "aviso" : "check"} size={15} />
                {divergencias > 0 ? `${fmtNum(divergencias)} divergências a regularizar — relatório de discrepâncias disponível para exportação.` : "Inventário sem divergências."}
                <button className="btn btn-outline !py-1 text-[11px] ml-auto" onClick={() => toast("Relatório gerado", "azul", "inventario_divergencias_2026.csv")}><Icon name="baixar" size={13} /> Relatório de divergências</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== Garantias e licenças ===== */}
      {aba === "garantias" && (
        <div className="grid lg:grid-cols-2 gap-4 items-start">
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--line)" }}>
              <div className="font-display font-bold text-[15px]">Garantias</div>
              <div className="text-[11.5px]" style={{ color: "var(--muted)" }}>Alertas automáticos para garantias vencendo em até 60 dias.</div>
            </div>
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
              <table className="tbl min-w-[480px]">
                <thead><tr><th>Patrimônio</th><th>Fornecedor</th><th>Fim da garantia</th><th>Situação</th></tr></thead>
                <tbody>
                  {garantias.map(({ a, dias }) => (
                    <tr key={a.id}>
                      <td>
                        <div className="font-bold tabular-nums text-[12px]">{a.patrimonio}</div>
                        <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{a.modelo}</div>
                      </td>
                      <td className="text-[12px]">{a.fornecedor}</td>
                      <td className="tabular-nums text-[12px] font-bold">{fmtData(a.garantiaFim)}</td>
                      <td>
                        {dias < 0
                          ? <Chip tom="vermelho">Vencida há {fmtNum(Math.abs(dias))} dias</Chip>
                          : dias <= 60
                            ? <Chip tom="ambar">Vence em {fmtNum(dias)} dias</Chip>
                            : <Chip tom="verde">Vigente</Chip>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--line)" }}>
              <div className="font-display font-bold text-[15px]">Licenças de Software</div>
              <div className="text-[11.5px]" style={{ color: "var(--muted)" }}>Inventário de licenças com consumo e vencimento.</div>
            </div>
            <div className="p-5 space-y-4">
              {licencas.map((l) => {
                const pct = Math.min(100, (l.usadas / l.total) * 100);
                const dias = Math.round((new Date(l.vencimento).getTime() - Date.now()) / 86400000);
                return (
                  <div key={l.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] font-bold">{l.software}</span>
                      <span className="text-[11px] font-bold tabular-nums" style={{ color: dias < 30 ? "var(--red)" : "var(--muted)" }}>
                        {l.tipo} · {dias < 30 ? `vence em ${fmtNum(dias)} d` : `até ${fmtData(l.vencimento)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 rounded-full overflow-hidden" style={{ background: "rgba(19,37,29,0.08)", height: 10 }}>
                        <div className="h-full bar-anim rounded-full" style={{ width: `${pct}%`, background: pct >= 100 ? "var(--red)" : pct > 90 ? "var(--amber)" : "var(--blue)" }} />
                      </div>
                      <span className="text-[11.5px] font-extrabold tabular-nums whitespace-nowrap">{fmtNum(l.usadas)}/{fmtNum(l.total)}</span>
                    </div>
                    <div className="text-[10.5px] mt-1" style={{ color: "var(--muted)" }}>{l.fornecedor} · contrato {l.contrato}{pct >= 100 ? " · capacidade esgotada — ampliar contrato" : ""}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== Relatórios institucionais ===== */}
      {aba === "relatorios" && <RelatoriosPatrimoniais />}

      {/* ===== Drawer de detalhe ===== */}
      <PainelLateral aberto={!!selecionado} onFechar={() => setSelecionadoId(null)}
        titulo={selecionado ? <span className="flex items-center gap-2.5"><span className="tabular-nums" style={{ color: "var(--muted)", fontSize: 12 }}>Patrimônio {selecionado.patrimonio}</span><StatusChamadoChip s={selecionado.status} /></span> : ""}>
        {selecionado && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-[18px] m-0">{selecionado.fabricante} {selecionado.modelo}</h3>
                <div className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>{selecionado.categoria} · série {selecionado.serie || "não informada"} · {selecionado.aquisicao ? `adquirido em ${fmtData(selecionado.aquisicao)}` : "data de aquisição não informada"} · {fmtMoeda(selecionado.valor, config.regional.moeda)}</div>
                {(() => {
                  const faltam = camposFaltantes(selecionado);
                  return faltam.length === 0
                    ? <Chip tom="verde" dot={false}>Cadastro Completo</Chip>
                    : <span title={`Pendências: ${faltam.join(", ")}`}><Chip tom="ambar" dot={false}>Cadastro Incompleto — {faltam.length} pendência{faltam.length > 1 ? "s" : ""}</Chip></span>;
                })()}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Chip tom="cinza" dot={false}>{selecionado.predio} · {selecionado.sala}</Chip>
                  <Chip tom="cinza" dot={false}>{unidadeDe(selecionado.unidadeId)?.sigla}</Chip>
                  {selecionado.responsavelId && <Chip tom="azul" dot={false}>{nomeDe(selecionado.responsavelId)?.nome}</Chip>}
                </div>
              </div>
              <button className="icon-btn flex-none" title="QR Code" onClick={() => setModalQr(selecionado)}><Icon name="qr" size={20} /></button>
            </div>

            <div className="flex gap-1" style={{ borderBottom: "1px solid var(--line)" }}>
              {([["dados", "Dados"], ["rede", "Rede"], ["dominio", "Domínio"], ["ip", "Histórico IP"], ["historico", "Histórico"]] as const).map(([k, r]) => (
                <button key={k} className={`tab-btn !text-[11.5px] ${abaDetalhe === k ? "on" : ""}`} onClick={() => setAbaDetalhe(k)}>{r}</button>
              ))}
            </div>

            {abaDetalhe === "dados" && (
              <div className="space-y-3 anim-fade">
                {(() => {
                  const p = pertencimentoEfetivo(selecionado, unidades, (id) => unidades.find((u) => u.id === id));
                  const unDe = (id: string | null) => unidades.find((u) => u.id === id);
                  const unidadesGestora = (id: string) => gestoras.find((g) => g.id === id)?.sigla ?? "—";
                  return (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg p-3.5 col-span-2 sm:col-span-1" style={{ background: "var(--yellow-soft)", border: "1px solid rgba(242,183,10,0.4)" }}>
                        <div className="text-[9.5px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--accent-ink)" }}>Pertencimento Patrimonial</div>
                        <div className="space-y-1 text-[11.5px]">
                          <div className="flex justify-between gap-2"><span style={{ color: "var(--muted)" }}>Órgão</span><strong className="text-right">{unDe(p.orgaoId)?.sigla ?? "—"}</strong></div>
                          <div className="flex justify-between gap-2"><span style={{ color: "var(--muted)" }}>Unidade gestora</span><strong className="text-right">{unidadesGestora(p.gestoraId)}</strong></div>
                          <div className="flex justify-between gap-2"><span style={{ color: "var(--muted)" }}>Fundo vinculado</span><strong className="text-right">{p.fundoId ? fundos.find((f) => f.id === p.fundoId)?.sigla ?? "—" : "—"}</strong></div>
                          <div className="flex justify-between gap-2"><span style={{ color: "var(--muted)" }}>Secretaria proprietária</span><strong className="text-right">{unDe(p.secretariaId)?.sigla ?? "—"}</strong></div>
                          <div className="flex justify-between gap-2"><span style={{ color: "var(--muted)" }}>Departamento</span><strong className="text-right">{p.departamentoId ? unDe(p.departamentoId)?.sigla : "—"}</strong></div>
                          <div className="flex justify-between gap-2"><span style={{ color: "var(--muted)" }}>Centro de custo</span><strong className="text-right">{p.centroCusto ?? "—"}</strong></div>
                          <div className="flex justify-between gap-2"><span style={{ color: "var(--muted)" }}>Responsável patrimonial</span><strong className="text-right">{p.responsavelPatrimonialId ? nomeDe(p.responsavelPatrimonialId)?.nome.split(" ")[0] : "—"}</strong></div>
                        </div>
                      </div>
                      <div className="rounded-lg p-3.5 col-span-2 sm:col-span-1" style={{ background: "var(--blue-soft)", border: "1px solid rgba(32,101,159,0.3)" }}>
                        <div className="text-[9.5px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--blue)" }}>Localização Atual</div>
                        <div className="space-y-1 text-[11.5px]">
                          <div className="flex justify-between gap-2"><span style={{ color: "var(--muted)" }}>Onde está</span><strong className="text-right">{unDe(selecionado.unidadeId)?.sigla ?? "—"}</strong></div>
                          <div className="flex justify-between gap-2"><span style={{ color: "var(--muted)" }}>Prédio</span><strong className="text-right">{selecionado.predio || "—"}</strong></div>
                          <div className="flex justify-between gap-2"><span style={{ color: "var(--muted)" }}>Andar</span><strong className="text-right">{selecionado.localizacaoFisica?.andar ?? "—"}</strong></div>
                          <div className="flex justify-between gap-2"><span style={{ color: "var(--muted)" }}>Sala</span><strong className="text-right">{selecionado.sala || "—"}</strong></div>
                          <div className="flex justify-between gap-2"><span style={{ color: "var(--muted)" }}>Complemento</span><strong className="text-right">{selecionado.localizacaoFisica?.complemento ?? "—"}</strong></div>
                          <div className="flex justify-between gap-2"><span style={{ color: "var(--muted)" }}>Usuário responsável</span><strong className="text-right">{selecionado.responsavelId ? nomeDe(selecionado.responsavelId)?.nome.split(" ")[0] : "—"}</strong></div>
                          <div className="flex justify-between gap-2"><span style={{ color: "var(--muted)" }}>Matrícula</span><strong className="text-right">{selecionado.responsavelId ? nomeDe(selecionado.responsavelId)?.matricula : "—"}</strong></div>
                        </div>
                      </div>
                      {p.secretariaId !== selecionado.unidadeId && (
                        <p className="col-span-2 text-[10.5px] m-0 flex gap-1.5 items-start" style={{ color: "var(--muted)" }}>
                          <Icon name="info" size={12} className="mt-0.5 flex-none" /> Pertencimento e localização são distintos: o bem pertence a {unDe(p.secretariaId)?.sigla}, mas está fisicamente em {unDe(selecionado.unidadeId)?.sigla}. Movimentações não alteram a propriedade.
                        </p>
                      )}
                    </div>
                  );
                })()}
                {(CAMPOS_DINAMICOS[selecionado.categoria] ?? []).length > 0 && (
                  <div>
                    <div className="ovl mb-2">Campos técnicos — {selecionado.categoria}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(CAMPOS_DINAMICOS[selecionado.categoria] ?? []).map((c) => (
                        <div key={c.chave} className="rounded-lg px-3 py-2.5" style={{ background: "rgba(19,37,29,0.04)" }}>
                          <div className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{c.rotulo}</div>
                          <div className="text-[12px] font-bold mt-0.5">{selecionado.campos[c.chave] ?? "—"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {[["Nota fiscal", selecionado.notaFiscal], ["Fornecedor", selecionado.fornecedor], ["Garantia até", fmtData(selecionado.garantiaFim)], ["Código interno", selecionado.codigoInterno]].map(([k, v]) => (
                    <div key={k} className="rounded-lg px-3 py-2.5" style={{ background: "rgba(19,37,29,0.04)" }}>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{k}</div>
                      <div className="text-[12px] font-bold mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
                {podeGerir && (
                  <Seletor rotulo="Alterar status do ciclo de vida" valor={selecionado.status}
                    onChange={(v) => { alterarStatusAtivo(selecionado.id, v); toast("Status atualizado", "verde", `Patrimônio ${selecionado.patrimonio}: ${v}`); }}
                    opcoes={STATUS_ATIVO.map((s) => s.label)} />
                )}
              </div>
            )}

            {abaDetalhe === "rede" && (
              selecionado.rede ? (
                <div className="grid grid-cols-2 gap-2 anim-fade">
                  {[["Hostname", selecionado.rede.hostname], ["IPv4 atual", selecionado.rede.ipv4], ["IPv6", selecionado.rede.ipv6], ["MAC Address", selecionado.rede.mac], ["Endereçamento", selecionado.rede.tipoEnd], ["VLAN", selecionado.rede.vlan], ["Sub-rede", selecionado.rede.subrede], ["Gateway", selecionado.rede.gateway], ["DNS primário", selecionado.rede.dns1], ["DNS secundário", selecionado.rede.dns2]].map(([k, v]) => (
                    <div key={k} className="rounded-lg px-3 py-2.5" style={{ background: "rgba(19,37,29,0.04)" }}>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{k}</div>
                      <div className="text-[12px] font-bold mt-0.5 tabular-nums">{v}</div>
                    </div>
                  ))}
                </div>
              ) : <Vazio icone="rede" titulo="Sem interface de rede" dica="Equipamentos sem conectividade não possuem informações de rede." />
            )}

            {abaDetalhe === "dominio" && (
              selecionado.rede ? (
                <div className="space-y-3 anim-fade">
                  <div className="rounded-lg px-4 py-3 flex items-center gap-3" style={{ background: selecionado.rede.ingressado ? "var(--green-soft)" : "var(--grey-soft)" }}>
                    <Icon name="escudo" size={20} className={selecionado.rede.ingressado ? "text-[var(--green)]" : ""} />
                    <div>
                      <div className="text-[13px] font-bold">{selecionado.rede.ingressado ? "Ingressado no domínio" : "Não ingressado no domínio"}</div>
                      <div className="text-[11px]" style={{ color: "var(--muted)" }}>{selecionado.rede.dominio} · objeto: {selecionado.rede.statusDominio}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[["Domínio", selecionado.rede.dominio], ["Nome do computador", selecionado.rede.hostname], ["OU", selecionado.rede.ou], ["Última sincronização", fmtData(selecionado.rede.ultimaSync)], ["Último usuário conhecido", nomeDe(selecionado.responsavelId)?.nome ?? "—"], ["Status do objeto", selecionado.rede.statusDominio]].map(([k, v]) => (
                      <div key={k} className="rounded-lg px-3 py-2.5" style={{ background: "rgba(19,37,29,0.04)" }}>
                        <div className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{k}</div>
                        <div className="text-[12px] font-bold mt-0.5 break-all">{v}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] m-0 flex gap-1.5" style={{ color: "var(--muted)" }}><Icon name="info" size={13} className="mt-0.5 flex-none" /> Integração com Active Directory / LDAP pronta para sincronização automática de inventário.</p>
                </div>
              ) : <Vazio icone="escudo" titulo="Sem informações de domínio" dica="Este equipamento não participa do diretório corporativo." />
            )}

            {abaDetalhe === "ip" && (
              <div className="anim-fade">
                {selecionado.historicoIP.length === 0 ? (
                  <Vazio icone="rede" titulo="Sem histórico de endereçamento" dica="Registros de IP aparecem aqui com a fonte de detecção (DHCP, AD, varredura…)." />
                ) : (
                  <ol className="m-0 p-0 list-none space-y-3">
                    {selecionado.historicoIP.map((h, i) => (
                      <li key={i} className="tick-row">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-extrabold text-[14px] tabular-nums">{h.ipv4}</span>
                          <Chip tom={h.origem === "DHCP" ? "azul" : h.origem === "Active Directory" ? "ciano" : h.origem === "Manual" ? "verde" : h.origem === "Varredura de rede" ? "ambar" : "cinza"} dot={false}>{h.origem}</Chip>
                          <span className="text-[11px] ml-auto" style={{ color: "var(--muted)" }}>{fmtData(h.detectadoEm)} · VLAN {h.vlan}</span>
                        </div>
                        <div className="text-[11.5px] mt-0.5 tabular-nums" style={{ color: "var(--muted)" }}>{h.hostname} · MAC {h.mac}</div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}

            {abaDetalhe === "historico" && (
              <div className="space-y-4 anim-fade">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="ovl">Manutenções — {fmtNum(selecionado.manutencoes.length)}</div>
                    {podeGerir && <button className="btn btn-outline !py-1 text-[11px]" onClick={() => setModalMan(selecionado)}><Icon name="mais" size={12} /> Registrar</button>}
                  </div>
                  {selecionado.manutencoes.length === 0 && <p className="text-[12px]" style={{ color: "var(--muted)" }}>Nenhuma manutenção registrada.</p>}
                  <div className="space-y-2">
                    {[...selecionado.manutencoes].sort((a, b) => b.data.localeCompare(a.data)).map((m) => (
                      <div key={m.id} className="rounded-lg px-3.5 py-3" style={{ background: "rgba(19,37,29,0.035)", borderLeft: `3px solid ${m.tipo === "Corretiva" ? "var(--red)" : "var(--green)"}` }}>
                        <div className="flex items-center gap-2 text-[11px] mb-1">
                          <Chip tom={m.tipo === "Corretiva" ? "vermelho" : "verde"} dot={false}>{m.tipo}</Chip>
                          <span className="font-bold">{fmtData(m.data)}</span>
                          <span style={{ color: "var(--muted)" }}>{nomeDe(m.tecnicoId)?.nome} · {fmtNum(m.tempoMin)} min · {fmtMoeda(m.custo, config.regional.moeda)}</span>
                        </div>
                        <div className="text-[12px] font-bold">{m.descricao}</div>
                        <div className="text-[11.5px] mt-0.5" style={{ color: "var(--muted)" }}>Diagnóstico: {m.diagnostico} · Solução: {m.solucao}{m.pecas !== "—" ? ` · Peças: ${m.pecas}` : ""}</div>
                        {m.chamadoId && <div className="text-[10.5px] mt-1 font-bold" style={{ color: "var(--blue)" }}>↳ Vinculado ao chamado {m.chamadoId}</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="ovl mb-2">Movimentações — {fmtNum(selecionado.movimentacoes.length)}</div>
                  {selecionado.movimentacoes.length === 0 && <p className="text-[12px]" style={{ color: "var(--muted)" }}>Sem transferências registradas.</p>}
                  <ol className="m-0 p-0 list-none space-y-2">
                    {selecionado.movimentacoes.map((m, i) => (
                      <li key={i} className="tick-row text-[12px]">
                        <span className="font-bold">{m.origem}</span> <Icon name="seta-d" size={12} className="inline opacity-50" /> <span className="font-bold">{m.destino}</span>
                        <span className="block text-[10.5px]" style={{ color: "var(--muted)" }}>{fmtData(m.data)} · {m.responsavelAnterior} → {m.novoResponsavel} · {m.motivo}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <button className="btn btn-outline w-full" onClick={() => setModalTermo(selecionado)}><Icon name="documentos" size={15} /> Termo de Responsabilidade</button>
                {podeGerir && selecionado.status !== "Baixado" && (
                  <button className="btn btn-outline w-full" style={{ color: "var(--red)", borderColor: "var(--red)" }}
                    onClick={() => { setModalBaixa(selecionado); setBaixa({ motivo: "Inservível", data: "", documento: "", processo: "", destino: "", obs: "" }); }}>
                    <Icon name="excluir" size={15} /> Baixa de Equipamento
                  </button>
                )}
                {selecionado.status === "Baixado" && selecionado.baixa && (
                  <div className="rounded-lg px-3.5 py-3 text-[11.5px]" style={{ background: "var(--red-soft)", color: "var(--red)" }}>
                    <strong>Baixado em {fmtData(selecionado.baixa.data)}</strong> — {selecionado.baixa.motivo} · {selecionado.baixa.documento} · Processo {selecionado.baixa.processo}. O registro é permanente e nunca é excluído.
                  </div>
                )}
                {(() => {
                  const chs = chamados.filter((c) => c.patrimonioId === selecionado.id);
                  return chs.length > 0 ? (
                    <div>
                      <div className="ovl mb-2">Chamados vinculados — {fmtNum(chs.length)}</div>
                      {chs.map((c) => (
                        <div key={c.id} className="flex items-center gap-2 text-[12px] py-1">
                          <span className="font-bold tabular-nums">{c.numero}</span>
                          <span className="flex-1 truncate" style={{ color: "var(--muted)" }}>{c.titulo}</span>
                          <StatusChamadoChip s={c.status} />
                        </div>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        )}
      </PainelLateral>

      {/* ===== Modal de baixa ===== */}
      <Modal aberto={!!modalBaixa} onFechar={() => setModalBaixa(null)} titulo={`Baixa de Equipamento — Patrimônio ${modalBaixa?.patrimonio || "(sem número)"}`} largo
        rodape={<><button className="btn btn-outline" onClick={() => setModalBaixa(null)}>Cancelar</button><button className="btn btn-danger" onClick={salvarBaixa}><Icon name="excluir" size={15} /> Confirmar baixa</button></>}>
        <div className="space-y-4">
          <div className="rounded-lg px-4 py-3 text-[12px] flex gap-2" style={{ background: "var(--red-soft)", color: "var(--red)" }}>
            <Icon name="aviso" size={15} className="flex-none mt-0.5" />
            <span>A baixa é <strong>definitiva e auditada</strong>: o status passa para “Baixado”, o histórico é preservado e o equipamento permanece na base consolidada para prestação de contas. Nenhum registro é excluído fisicamente.</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Seletor rotulo="Motivo da baixa" obrigatorio valor={baixa.motivo} onChange={(v) => setBaixa({ ...baixa, motivo: v })} opcoes={MOTIVOS_BAIXA} />
            <Campo rotulo="Data da baixa"><input className="input" type="date" value={baixa.data} onChange={(e) => setBaixa({ ...baixa, data: e.target.value })} /></Campo>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Documento (termo/laudo)" obrigatorio><input className="input" placeholder="ex.: Termo de Baixa nº 2026-018" value={baixa.documento} onChange={(e) => setBaixa({ ...baixa, documento: e.target.value })} /></Campo>
            <Campo rotulo="Processo administrativo"><input className="input" placeholder="ex.: PROC-2026-4412" value={baixa.processo} onChange={(e) => setBaixa({ ...baixa, processo: e.target.value })} /></Campo>
          </div>
          <Campo rotulo="Destinação"><input className="input" placeholder="ex.: Alienação por leilão / descarte ecológico" value={baixa.destino} onChange={(e) => setBaixa({ ...baixa, destino: e.target.value })} /></Campo>
          <Campo rotulo="Observações"><textarea className="textarea" rows={2} value={baixa.obs} onChange={(e) => setBaixa({ ...baixa, obs: e.target.value })} /></Campo>
        </div>
      </Modal>

      {/* ===== Modais ===== */}
      <Modal aberto={!!modalMov} onFechar={() => setModalMov(null)} titulo={`Movimentar Patrimônio ${modalMov?.patrimonio ?? ""}`}
        rodape={<><button className="btn btn-outline" onClick={() => setModalMov(null)}>Cancelar</button><button className="btn btn-primary" onClick={salvarMov}><Icon name="seta-d" size={15} /> Registrar movimentação</button></>}>
        <div className="space-y-4">
          <div className="rounded-lg px-4 py-3 text-[12px]" style={{ background: "rgba(19,37,29,0.04)" }}>
            <span className="font-bold">Origem:</span> {modalMov ? `${unidadeDe(modalMov.unidadeId)?.sigla} — ${modalMov.sala} · responsável atual: ${nomeDe(modalMov.responsavelId)?.nome ?? "Estoque"}` : ""}
          </div>
          <Campo rotulo="Destino" obrigatorio><input className="input" placeholder="ex.: SEMED — Sala 10 ou Almoxarifado" value={mov.destino} onChange={(e) => setMov({ ...mov, destino: e.target.value })} /></Campo>
          <Seletor rotulo="Novo responsável" valor={mov.novoResponsavel} onChange={(v) => setMov({ ...mov, novoResponsavel: v })}
            opcoes={[{ valor: "", rotulo: "Estoque / sem responsável" }, ...usuarios.filter((u) => u.ativo).map((u) => ({ valor: u.nome, rotulo: `${u.nome} — ${u.matricula}` }))]} />
          <Campo rotulo="Motivo"><input className="input" placeholder="ex.: Substituição de estação em manutenção" value={mov.motivo} onChange={(e) => setMov({ ...mov, motivo: e.target.value })} /></Campo>
        </div>
      </Modal>

      <Modal aberto={!!modalMan} onFechar={() => setModalMan(null)} titulo={`Registrar Manutenção — Patrimônio ${modalMan?.patrimonio ?? ""}`} largo
        rodape={<><button className="btn btn-outline" onClick={() => setModalMan(null)}>Cancelar</button><button className="btn btn-primary" onClick={salvarMan}><Icon name="check" size={15} /> Registrar</button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Seletor rotulo="Tipo" valor={man.tipo} onChange={(v) => setMan({ ...man, tipo: v })} opcoes={["Corretiva", "Preventiva"]} />
            <Campo rotulo="Custo (R$)"><input className="input" type="number" min={0} value={man.custo} onChange={(e) => setMan({ ...man, custo: e.target.value })} /></Campo>
            <Campo rotulo="Tempo (min)"><input className="input" type="number" min={0} value={man.tempoMin} onChange={(e) => setMan({ ...man, tempoMin: e.target.value })} /></Campo>
          </div>
          <Campo rotulo="Descrição do serviço" obrigatorio><input className="input" value={man.descricao} onChange={(e) => setMan({ ...man, descricao: e.target.value })} placeholder="ex.: Estação não liga após queda de energia" /></Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Diagnóstico"><textarea className="textarea" rows={2} value={man.diagnostico} onChange={(e) => setMan({ ...man, diagnostico: e.target.value })} /></Campo>
            <Campo rotulo="Solução aplicada"><textarea className="textarea" rows={2} value={man.solucao} onChange={(e) => setMan({ ...man, solucao: e.target.value })} /></Campo>
          </div>
          <Campo rotulo="Peças utilizadas"><input className="input" value={man.pecas} onChange={(e) => setMan({ ...man, pecas: e.target.value })} placeholder="ex.: Fonte 240W, SSD 240 GB" /></Campo>
          <p className="text-[11px] m-0" style={{ color: "var(--muted)" }}>O histórico de manutenção é permanente e não pode ser excluído — atende ao requisito de rastreabilidade patrimonial.</p>
        </div>
      </Modal>

      <Modal aberto={!!modalQr} onFechar={() => setModalQr(null)} titulo={`QR Code — Patrimônio ${modalQr?.patrimonio ?? ""}`}
        rodape={<button className="btn btn-primary" onClick={() => { toast("Chamado pré-preenchido", "azul", `Equipamento ${modalQr?.patrimonio} vinculado ao novo chamado`); setModalQr(null); }}><Icon name="fone" size={15} /> Abrir Chamado deste equipamento</button>}>
        {modalQr && (
          <div className="text-center">
            <div className="inline-block p-3 rounded-xl" style={{ background: "#fff", border: "1px solid var(--line)" }}>
              <QrCode valor={`govflow://patrimonio/${modalQr.patrimonio}`} size={170} />
            </div>
            <div className="text-[13px] font-bold mt-3">{modalQr.fabricante} {modalQr.modelo}</div>
            <div className="text-[11.5px]" style={{ color: "var(--muted)" }}>govflow://patrimonio/{modalQr.patrimonio}</div>
            <p className="text-[11px] mt-3 m-0" style={{ color: "var(--muted)" }}>
              Ao escanear, usuários autorizados da TI acessam dados, manutenção, movimentação e abertura de chamado.
              Informações sensíveis de rede permanecem ocultas para perfis sem permissão.
            </p>
          </div>
        )}
      </Modal>

      <Modal aberto={!!modalTermo} onFechar={() => setModalTermo(null)} titulo="Termo de Responsabilidade" largo
        rodape={<><button className="btn btn-outline" onClick={() => setModalTermo(null)}>Fechar</button><button className="btn btn-primary" onClick={() => { toast("Termo gerado", "verde", `termo_responsabilidade_${modalTermo?.patrimonio}.pdf`); }}><Icon name="baixar" size={15} /> Gerar PDF</button></>}>
        {modalTermo && (
          <div className="rounded-lg p-5 text-[12.5px] leading-relaxed" style={{ background: "#fff", border: "1px solid var(--line)", fontFamily: "Georgia, serif" }}>
            <div className="text-center mb-4">
              <div className="font-bold uppercase tracking-wide">{config.orgao.nome}</div>
              <div className="font-bold mt-1">TERMO DE RESPONSABILIDADE DE USO DE BEM PATRIMONIAL</div>
            </div>
            <p>
              O(A) servidor(a) <strong>{nomeDe(modalTermo.responsavelId)?.nome ?? "____________________"}</strong>, matrícula{" "}
              <strong>{nomeDe(modalTermo.responsavelId)?.matricula ?? "__________"}</strong>, lotado(a) na unidade{" "}
              <strong>{unidadeDe(modalTermo.unidadeId)?.nome}</strong>, declara ter recebido em {fmtData(new Date().toISOString())} o equipamento abaixo,
              em perfeito estado de funcionamento, comprometendo-se a zelar pela sua conservação:
            </p>
            <table className="w-full text-[12px] my-3" style={{ borderCollapse: "collapse" }}>
              {[["Equipamento", `${modalTermo.fabricante} ${modalTermo.modelo}`], ["Categoria", modalTermo.categoria], ["Nº de Patrimônio", modalTermo.patrimonio], ["Nº de Série", modalTermo.serie], ["Local de uso", `${modalTermo.predio} — ${modalTermo.sala}`]].map(([k, v]) => (
                <tr key={k}><td className="font-bold py-1 pr-3" style={{ borderBottom: "1px solid var(--line)" }}>{k}</td><td style={{ borderBottom: "1px solid var(--line)" }}>{v}</td></tr>
              ))}
            </table>
            <div className="grid grid-cols-2 gap-8 mt-8 text-center text-[11px]">
              <div style={{ borderTop: "1px solid #333", paddingTop: 4 }}>Responsável pela entrega — DTI</div>
              <div style={{ borderTop: "1px solid #333", paddingTop: 4 }}>Servidor(a) — de acordo</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
