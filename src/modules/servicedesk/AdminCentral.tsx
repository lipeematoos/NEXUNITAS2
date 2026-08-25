import { useMemo, useState } from "react";
import { Avatar, Campo, Chip, Icon, Seletor, useToast } from "../../components/ui";
import { CATEGORIAS_PORTAL, CondicaoRoteamento } from "../../lib/data";
import { fmtNum } from "../../lib/format";
import { useApp } from "../../lib/store";

type SubAba = "dominios" | "grupos" | "cobertura" | "regras" | "globais" | "simulador";

export default function AdminCentral() {
  const app = useApp();
  const {
    dominios, setDominios, gruposSuporte, setGruposSuporte, coberturas, setCoberturas,
    regrasRoteamento, setRegrasRoteamento, responsaveisGlobais, setResponsaveisGlobais,
    servicos, setServicos, unidades, usuarios, gestoras, simularRoteamento, registrarAuditoria,
  } = app;
  const toast = useToast();
  const [aba, setAba] = useState<SubAba>("dominios");
  const [simUnidade, setSimUnidade] = useState("un4");
  const [simServico, setSimServico] = useState("sv11");
  const [simCategoria, setSimCategoria] = useState("cat5");

  const nomeDe = (id: string | null) => usuarios.find((u) => u.id === id);
  const unDe = (id: string | null) => unidades.find((u) => u.id === id);

  const simulacao = useMemo(
    () => simularRoteamento(simUnidade, simServico || null, simCategoria),
    [simUnidade, simServico, simCategoria, simularRoteamento]
  );

  const ABAS: { chave: SubAba; rotulo: string; icone: string }[] = [
    { chave: "dominios", rotulo: "Domínios de Atendimento", icone: "sistema" },
    { chave: "grupos", rotulo: "Grupos e Técnicos", icone: "equipes" },
    { chave: "cobertura", rotulo: "Cobertura", icone: "organograma" },
    { chave: "regras", rotulo: "Regras de Roteamento", icone: "fluxos" },
    { chave: "globais", rotulo: "Responsáveis Globais", icone: "escudo" },
    { chave: "simulador", rotulo: "Simulador", icone: "busca" },
  ];

  return (
    <div>
      <div className="flex gap-1 mb-5 overflow-x-auto" style={{ borderBottom: "1px solid var(--line)" }}>
        {ABAS.map((a) => (
          <button key={a.chave} className={`tab-btn ${aba === a.chave ? "on" : ""}`} onClick={() => setAba(a.chave)}>
            <span className="inline-flex items-center gap-1.5"><Icon name={a.icone} size={14} /> {a.rotulo}</span>
          </button>
        ))}
      </div>

      {/* ===== Domínios ===== */}
      {aba === "dominios" && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {dominios.map((d) => (
              <div key={d.id} className="card card-hover p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--deep)", color: "var(--accent)" }}>
                    <Icon name="sistema" size={19} />
                  </span>
                  <Chip tom={d.ativo ? "verde" : "cinza"}>{d.ativo ? "Ativo" : "Inativo"}</Chip>
                </div>
                <h3 className="font-display font-bold text-[17px] m-0">{d.nome}</h3>
                <p className="text-[12px] mt-1 mb-3 leading-relaxed" style={{ color: "var(--muted)" }}>{d.descricao}</p>
                <div className="space-y-1.5 text-[12px]">
                  <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Unidade responsável</span><strong>{unDe(d.unidadeId)?.sigla}</strong></div>
                  <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Unidade gestora</span><strong>{gestoras.find((g) => g.id === d.gestoraId)?.sigla ?? "—"}</strong></div>
                  <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Gestor</span><strong>{nomeDe(d.gestorId)?.nome.split(" ").slice(0, 2).join(" ")}</strong></div>
                  <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Grupos vinculados</span><strong>{fmtNum(gruposSuporte.filter((g) => g.dominioId === d.id).length)}</strong></div>
                </div>
                <button
                  className="btn btn-outline w-full mt-3 !py-1.5 text-[12px]"
                  onClick={() => { setDominios(dominios.map((x) => x.id === d.id ? { ...x, ativo: !x.ativo } : x)); toast(d.ativo ? "Domínio desativado" : "Domínio ativado", d.ativo ? "ambar" : "verde", d.nome); }}
                >
                  {d.ativo ? "Desativar domínio" : "Ativar domínio"}
                </button>
              </div>
            ))}
          </div>
          <div className="card px-5 py-4 flex items-start gap-3">
            <Icon name="info" size={17} className="mt-0.5 flex-none text-[var(--blue)]" />
            <p className="text-[12.5px] m-0 leading-relaxed" style={{ color: "var(--muted)" }}>
              Um <strong>domínio de atendimento</strong> representa uma equipe de TI independente (TI Corporativa, TI Saúde, TI de autarquia…).
              Domínios são opcionais: um fundo municipal pode existir sem equipe própria de TI — a decisão é do administrador, nunca do código.
            </p>
          </div>
        </div>
      )}

      {/* ===== Grupos ===== */}
      {aba === "grupos" && (
        <div className="space-y-3">
          {gruposSuporte.map((g) => (
            <div key={g.id} className="card p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-none" style={{ background: "var(--green-soft)", color: "var(--green)" }}>
                  <Icon name="equipes" size={17} />
                </span>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-[15px]">{g.nome}</span>
                    {g.sigla && <Chip tom="cinza" dot={false}>{g.sigla}</Chip>}
                    <Chip tom="ciano" dot={false}>{dominios.find((d) => d.id === g.dominioId)?.nome ?? "Sem domínio"}</Chip>
                  </div>
                  <div className="text-[11.5px] mt-0.5" style={{ color: "var(--muted)" }}>
                    Gestor: {nomeDe(g.gestorId ?? null)?.nome ?? "—"} · {g.horario ?? "—"} · {(g.categoriasAtendidas ?? []).join(", ") || "Todas as categorias"}
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {g.membroIds.map((id) => <Avatar key={id} nome={nomeDe(id)?.nome ?? "?"} size={28} />)}
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 mt-3 pt-3" style={{ borderTop: "1px dashed var(--line)" }}>
                <Seletor rotulo="Estratégia de atribuição automática" valor={g.estrategiaAtribuicao ?? "Manual"}
                  onChange={(v) => { setGruposSuporte(gruposSuporte.map((x) => x.id === g.id ? { ...x, estrategiaAtribuicao: v as never } : x)); toast("Estratégia atualizada", "verde", `${g.nome}: ${v}`); }}
                  opcoes={["Manual", "Round Robin", "Menor número de chamados ativos", "Técnico padrão do serviço"]} />
                <Seletor rotulo="Seleção de técnico pelo solicitante" valor={g.permiteSelecaoTecnico ?? "Não"}
                  onChange={(v) => setGruposSuporte(gruposSuporte.map((x) => x.id === g.id ? { ...x, permiteSelecaoTecnico: v as never } : x))}
                  opcoes={["Não", "Opcional", "Obrigatório", "Somente Gestores"]} />
                <div className="flex items-end pb-1 gap-2">
                  <button className={`chip border-0 cursor-pointer`} style={{ background: g.permiteAtribAuto ? "var(--green-soft)" : "var(--grey-soft)", color: g.permiteAtribAuto ? "var(--green)" : "var(--grey)" }}
                    onClick={() => setGruposSuporte(gruposSuporte.map((x) => x.id === g.id ? { ...x, permiteAtribAuto: !x.permiteAtribAuto } : x))}>
                    Atribuição automática: {g.permiteAtribAuto ? "Sim" : "Não"}
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="card p-5">
            <div className="ovl mb-3">Seleção de técnico por serviço (catálogo)</div>
            <div className="overflow-x-auto">
              <table className="tbl min-w-[640px]">
                <thead><tr><th>Serviço</th><th>Permitir selecionar técnico</th><th>Técnico preferencial / padrão</th></tr></thead>
                <tbody>
                  {servicos.map((s) => {
                    const g = gruposSuporte.find((x) => x.id === s.grupoId);
                    return (
                      <tr key={s.id}>
                        <td className="font-bold text-[12.5px]">{s.nome}<div className="text-[10.5px] font-normal" style={{ color: "var(--muted)" }}>Grupo: {g?.nome}</div></td>
                        <td>
                          <select className="select !py-1 !text-[11.5px] !w-[170px]" value={s.selecaoTecnico ?? "Não"}
                            onChange={(e) => { setServicos(servicos.map((x) => x.id === s.id ? { ...x, selecaoTecnico: e.target.value as never } : x)); }}>
                            {["Não", "Opcional", "Obrigatório", "Somente Gestores"].map((o) => <option key={o}>{o}</option>)}
                          </select>
                        </td>
                        <td>
                          <select className="select !py-1 !text-[11.5px] !w-[210px]" value={s.tecnicoPreferencialId ?? ""}
                            onChange={(e) => setServicos(servicos.map((x) => x.id === s.id ? { ...x, tecnicoPreferencialId: e.target.value || null } : x))}>
                            <option value="">— Nenhum —</option>
                            {(g?.membroIds ?? []).map((id) => <option key={id} value={id}>{nomeDe(id)?.nome}</option>)}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] mt-2 mb-0" style={{ color: "var(--muted)" }}>
              Somente técnicos do grupo responsável pelo serviço podem ser escolhidos — o solicitante não consegue atribuir o chamado a técnicos fora do grupo.
            </p>
          </div>
        </div>
      )}

      {/* ===== Cobertura ===== */}
      {aba === "cobertura" && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--line)" }}>
              <div>
                <div className="font-display font-bold text-[15px]">Cobertura de atendimento</div>
                <div className="text-[11.5px]" style={{ color: "var(--muted)" }}>Vínculo grupo × unidade administrativa. Com “incluir subordinadas”, hospitais, UBS e setores herdam o grupo da secretaria.</div>
              </div>
              <button className="btn btn-accent !py-1.5 text-[12px]" onClick={() => {
                setCoberturas([...coberturas, { id: `cb${Date.now()}`, grupoId: gruposSuporte[0]?.id ?? "g1", unidadeId: "un2", incluirSubordinadas: false, prioridade: 50, ativa: true }]);
                toast("Cobertura adicionada", "verde", "Configure o grupo e a unidade abaixo.");
              }}><Icon name="mais" size={14} /> Nova Cobertura</button>
            </div>
            <table className="tbl">
              <thead><tr><th>Grupo de atendimento</th><th>Unidade administrativa</th><th>Subordinadas</th><th>Prioridade</th><th>Ativa</th><th></th></tr></thead>
              <tbody>
                {coberturas.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <select className="select !py-1 !text-[11.5px] !w-[180px]" value={c.grupoId} onChange={(e) => setCoberturas(coberturas.map((x) => x.id === c.id ? { ...x, grupoId: e.target.value } : x))}>
                        {gruposSuporte.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="select !py-1 !text-[11.5px] !w-[230px]" value={c.unidadeId} onChange={(e) => setCoberturas(coberturas.map((x) => x.id === c.id ? { ...x, unidadeId: e.target.value } : x))}>
                        {unidades.map((u) => <option key={u.id} value={u.id}>{u.sigla} — {u.nome}</option>)}
                      </select>
                    </td>
                    <td>
                      <button className="chip border-0 cursor-pointer" style={{ background: c.incluirSubordinadas ? "var(--green-soft)" : "var(--grey-soft)", color: c.incluirSubordinadas ? "var(--green)" : "var(--grey)" }}
                        onClick={() => setCoberturas(coberturas.map((x) => x.id === c.id ? { ...x, incluirSubordinadas: !x.incluirSubordinadas } : x))}>
                        {c.incluirSubordinadas ? "Sim — herda" : "Não"}
                      </button>
                    </td>
                    <td><input className="input !py-1 !w-[70px] text-center tabular-nums" type="number" value={c.prioridade} onChange={(e) => setCoberturas(coberturas.map((x) => x.id === c.id ? { ...x, prioridade: Number(e.target.value) } : x))} /></td>
                    <td>
                      <button className="chip border-0 cursor-pointer" style={{ background: c.ativa ? "var(--green-soft)" : "var(--grey-soft)", color: c.ativa ? "var(--green)" : "var(--grey)" }}
                        onClick={() => setCoberturas(coberturas.map((x) => x.id === c.id ? { ...x, ativa: !x.ativa } : x))}>
                        {c.ativa ? "Ativa" : "Inativa"}
                      </button>
                    </td>
                    <td>
                      <button className="icon-btn" style={{ color: "var(--red)" }} aria-label="Remover cobertura"
                        onClick={() => { setCoberturas(coberturas.filter((x) => x.id !== c.id)); registrarAuditoria("Exclusão de cobertura", `${unDe(c.unidadeId)?.sigla}`, "Regra de cobertura removida"); toast("Cobertura removida", "ambar"); }}>
                        <Icon name="excluir" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card px-5 py-4 flex items-start gap-3">
            <Icon name="info" size={17} className="mt-0.5 flex-none text-[var(--blue)]" />
            <p className="text-[12.5px] m-0 leading-relaxed" style={{ color: "var(--muted)" }}>
              Unidades subordinadas podem <strong>sobrescrever</strong> a regra herdada: basta cadastrar uma cobertura própria (ou equipe própria) na unidade filha —
              o motor de roteamento sempre prefere a regra mais específica.
            </p>
          </div>
        </div>
      )}

      {/* ===== Regras de roteamento ===== */}
      {aba === "regras" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="ovl">Regras avaliadas em ordem de prioridade (menor número primeiro)</div>
            <button className="btn btn-accent !py-1.5 text-[12px]" onClick={() => {
              setRegrasRoteamento([...regrasRoteamento, { id: `rr${Date.now()}`, nome: "Nova regra", condicaoTipo: "Categoria", condicaoValor: "cat1", condicaoExtra: null, grupoId: "g1", prioridade: 100, ativa: true }]);
              toast("Regra criada", "verde", "Edite as condições abaixo.");
            }}><Icon name="mais" size={14} /> Nova Regra</button>
          </div>
          <div className="space-y-3">
            {[...regrasRoteamento].sort((a, b) => a.prioridade - b.prioridade).map((r, idx) => (
              <div key={r.id} className="card p-4" style={{ opacity: r.ativa ? 1 : 0.65 }}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-extrabold flex-none" style={{ background: "var(--deep)", color: "var(--accent)" }}>{idx + 1}</span>
                  <input className="input !w-[250px] font-bold" value={r.nome} onChange={(e) => setRegrasRoteamento(regrasRoteamento.map((x) => x.id === r.id ? { ...x, nome: e.target.value } : x))} aria-label="Nome da regra" />
                  <select className="select !w-[100px] !py-1.5 text-[12px]" value={r.prioridade} onChange={(e) => setRegrasRoteamento(regrasRoteamento.map((x) => x.id === r.id ? { ...x, prioridade: Number(e.target.value) } : x))} aria-label="Prioridade">
                    {[5, 10, 20, 30, 40, 50, 60, 80, 100].map((p) => <option key={p} value={p}>P{p}</option>)}
                  </select>
                  <button className="chip border-0 cursor-pointer" style={{ background: r.ativa ? "var(--green-soft)" : "var(--grey-soft)", color: r.ativa ? "var(--green)" : "var(--grey)" }}
                    onClick={() => setRegrasRoteamento(regrasRoteamento.map((x) => x.id === r.id ? { ...x, ativa: !x.ativa } : x))}>
                    {r.ativa ? "Ativa" : "Inativa"}
                  </button>
                  <button className="icon-btn ml-auto" style={{ color: "var(--red)" }} aria-label="Excluir regra"
                    onClick={() => { setRegrasRoteamento(regrasRoteamento.filter((x) => x.id !== r.id)); toast("Regra excluída", "ambar", r.nome); }}>
                    <Icon name="excluir" size={16} />
                  </button>
                </div>
                <div className="grid sm:grid-cols-4 gap-3 mt-3 items-end">
                  <Campo rotulo="Se (condição)">
                    <select className="select" value={r.condicaoTipo} onChange={(e) => setRegrasRoteamento(regrasRoteamento.map((x) => x.id === r.id ? { ...x, condicaoTipo: e.target.value as CondicaoRoteamento } : x))}>
                      {["Serviço", "Unidade Administrativa", "Categoria", "Unidade + Categoria"].map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Campo>
                  <Campo rotulo={r.condicaoTipo === "Serviço" ? "Serviço" : r.condicaoTipo === "Categoria" || r.condicaoTipo === "Unidade + Categoria" ? "Categoria" : "Unidade"}>
                    <select className="select" value={r.condicaoValor} onChange={(e) => setRegrasRoteamento(regrasRoteamento.map((x) => x.id === r.id ? { ...x, condicaoValor: e.target.value } : x))}>
                      {r.condicaoTipo === "Serviço"
                        ? servicos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)
                        : r.condicaoTipo === "Unidade Administrativa"
                          ? unidades.map((u) => <option key={u.id} value={u.id}>{u.sigla} — {u.nome}</option>)
                          : CATEGORIAS_PORTAL.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </Campo>
                  {r.condicaoTipo === "Unidade + Categoria" ? (
                    <Campo rotulo="E unidade (ou subordinada)">
                      <select className="select" value={r.condicaoExtra ?? ""} onChange={(e) => setRegrasRoteamento(regrasRoteamento.map((x) => x.id === r.id ? { ...x, condicaoExtra: e.target.value || null } : x))}>
                        <option value="">— Qualquer —</option>
                        {unidades.map((u) => <option key={u.id} value={u.id}>{u.sigla}</option>)}
                      </select>
                    </Campo>
                  ) : <div />}
                  <Campo rotulo="Então → grupo de atendimento">
                    <select className="select" value={r.grupoId} onChange={(e) => setRegrasRoteamento(regrasRoteamento.map((x) => x.id === r.id ? { ...x, grupoId: e.target.value } : x))}>
                      {gruposSuporte.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                    </select>
                  </Campo>
                </div>
              </div>
            ))}
          </div>
          <div className="card px-5 py-4">
            <div className="ovl mb-2">Precedência padrão do motor</div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[12.5px]">
              {["Responsável global por serviço", "Regras de roteamento (prioridade)", "Equipe própria da unidade", "Cobertura da unidade / herdada", "Regra do fundo municipal (via domínio)", "Regra de categoria", "Equipe padrão da organização"].map((p, i) => (
                <div key={p} className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-none" style={{ background: "var(--yellow-soft)", color: "var(--accent-ink)" }}>{i + 1}</span>
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== Responsáveis globais ===== */}
      {aba === "globais" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="ovl">Especialistas que atendem toda a organização, independente da unidade do solicitante</div>
            <button className="btn btn-accent !py-1.5 text-[12px]" onClick={() => {
              setResponsaveisGlobais([...responsaveisGlobais, { id: `rg${Date.now()}`, servicoId: servicos[0]?.id ?? "sv1", tecnicoId: usuarios[0]?.id ?? "u1", grupoId: "g4", cobertura: "Toda a Organização", ativo: true }]);
              toast("Responsável global adicionado", "verde");
            }}><Icon name="mais" size={14} /> Novo Responsável</button>
          </div>
          <div className="grid lg:grid-cols-2 gap-3">
            {responsaveisGlobais.map((r) => {
              const tec = nomeDe(r.tecnicoId);
              return (
                <div key={r.id} className="card p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar nome={tec?.nome ?? "?"} size={38} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[13.5px]">{tec?.nome}</div>
                      <div className="text-[11px]" style={{ color: "var(--muted)" }}>{tec?.cargo}</div>
                    </div>
                    <Chip tom={r.ativo ? "verde" : "cinza"}>{r.ativo ? "Ativo" : "Inativo"}</Chip>
                    <button className="icon-btn" style={{ color: "var(--red)" }} aria-label="Remover" onClick={() => setResponsaveisGlobais(responsaveisGlobais.filter((x) => x.id !== r.id))}>
                      <Icon name="excluir" size={15} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Seletor rotulo="Serviço" valor={r.servicoId} onChange={(v) => setResponsaveisGlobais(responsaveisGlobais.map((x) => x.id === r.id ? { ...x, servicoId: v } : x))}
                      opcoes={servicos.map((s) => ({ valor: s.id, rotulo: s.nome }))} />
                    <Seletor rotulo="Grupo de apoio (backup)" valor={r.grupoId} onChange={(v) => setResponsaveisGlobais(responsaveisGlobais.map((x) => x.id === r.id ? { ...x, grupoId: v } : x))}
                      opcoes={gruposSuporte.map((g) => ({ valor: g.id, rotulo: g.nome }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <Seletor rotulo="Técnico" valor={r.tecnicoId} onChange={(v) => setResponsaveisGlobais(responsaveisGlobais.map((x) => x.id === r.id ? { ...x, tecnicoId: v } : x))}
                      opcoes={usuarios.filter((u) => u.ativo).map((u) => ({ valor: u.id, rotulo: u.nome }))} />
                    <Seletor rotulo="Cobertura" valor={r.cobertura} onChange={(v) => setResponsaveisGlobais(responsaveisGlobais.map((x) => x.id === r.id ? { ...x, cobertura: v } : x))}
                      opcoes={["Toda a Organização", "Unidade + subordinadas", "Unidade Gestora"]} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Simulador ===== */}
      {aba === "simulador" && (
        <div className="grid lg:grid-cols-[340px_1fr] gap-4 items-start">
          <div className="card p-5 space-y-4">
            <div className="ovl">Parâmetros da solicitação</div>
            <Seletor rotulo="Unidade do solicitante" valor={simUnidade} onChange={setSimUnidade}
              opcoes={unidades.map((u) => ({ valor: u.id, rotulo: `${u.sigla} — ${u.nome}` }))} />
            <Seletor rotulo="Serviço" valor={simServico} onChange={setSimServico}
              opcoes={[{ valor: "", rotulo: "Sem serviço (avulso)" }, ...servicos.map((s) => ({ valor: s.id, rotulo: s.nome }))]} />
            <Seletor rotulo="Categoria" valor={simCategoria} onChange={setSimCategoria}
              opcoes={CATEGORIAS_PORTAL.map((c) => ({ valor: c.id, rotulo: c.nome }))} />
            <p className="text-[11.5px] m-0" style={{ color: "var(--muted)" }}>
              O simulador executa o motor real de roteamento — o mesmo usado na abertura de chamados — e mostra cada regra avaliada.
            </p>
          </div>
          <div className="card p-5">
            <div className="ovl mb-3">Traço da decisão</div>
            <ol className="m-0 p-0 list-none space-y-1.5 mb-4">
              {simulacao.passos.map((p, i) => (
                <li key={i} className="text-[12.5px] flex gap-2 items-start">
                  <span className={`mt-1 w-2 h-2 rounded-full flex-none ${p.startsWith("✓") ? "pulse-live" : ""}`} style={{ background: p.startsWith("✓") ? "var(--green)" : p.startsWith("—") ? "var(--line-2)" : "var(--accent)" }} />
                  <span className={p.startsWith("✓") ? "font-bold" : ""} style={{ color: p.startsWith("—") ? "var(--muted)" : undefined }}>{p}</span>
                </li>
              ))}
            </ol>
            <div className="rounded-lg p-4 anim-pop" key={`${simulacao.grupoId}-${simulacao.regra}`} style={{ background: "var(--green-soft)", border: "1px solid rgba(30,122,84,0.3)" }}>
              <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "var(--green)" }}>Roteamento aplicado</div>
              <div className="font-display font-extrabold text-[18px] mt-1" style={{ color: "var(--green)" }}>{simulacao.grupoNome}</div>
              <div className="text-[12px] mt-1 font-semibold">{simulacao.regra}</div>
              <div className="text-[11.5px] mt-0.5" style={{ color: "var(--muted)" }}>Domínio: {simulacao.dominioNome} · {simulacao.detalhe}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
