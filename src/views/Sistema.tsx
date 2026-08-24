import { useMemo, useState } from "react";
import { Avatar, Campo, Chip, Confirmacao, Icon, Modal, Reveal, Seletor, Chave, useToast } from "../components/ui";
import { CabecalhoPagina } from "../components/shell";
import { ACOES_PERMISSAO, MODULOS_PERMISSAO, Usuario } from "../lib/data";
import { fmtDataHora, fmtNum } from "../lib/format";
import { useApp } from "../lib/store";

/* ===================== Administração ===================== */

export function Administracao() {
  const { usuarios, unidades, perfis, setPerfis, auditoria, toggleUsuario } = useApp();
  const toast = useToast();
  const [aba, setAba] = useState<"usuarios" | "perfis" | "auditoria">("usuarios");
  const [busca, setBusca] = useState("");
  const [confirmaSuspensao, setConfirmaSuspensao] = useState<Usuario | null>(null);
  const [modalNovo, setModalNovo] = useState(false);
  const [novo, setNovo] = useState({ nome: "", matricula: "", usuario: "", cargo: "", unidadeId: "un11", perfil: "Visualizador" });
  const [filtroAcao, setFiltroAcao] = useState("Todas");

  const filtrados = usuarios.filter((u) => busca.trim() === "" || `${u.nome} ${u.matricula} ${u.cargo}`.toLowerCase().includes(busca.toLowerCase()));
  const acoes = ["Todas", ...Array.from(new Set(auditoria.map((a) => a.acao)))];
  const audFiltrada = auditoria.filter((a) => filtroAcao === "Todas" || a.acao === filtroAcao);
  const unidadeDe = (id: string) => unidades.find((u) => u.id === id);

  const togglePermissao = (perfilNome: string, modulo: string, idx: number) => {
    setPerfis(perfis.map((p) => p.nome !== perfilNome ? p : {
      ...p,
      matriz: { ...p.matriz, [modulo]: p.matriz[modulo].map((v, i) => (i === idx ? !v : v)) },
    }));
    toast("Permissão atualizada", "verde", `${perfilNome} · ${modulo}`);
  };

  return (
    <div>
      <CabecalhoPagina titulo="Administração" subtitulo="Gestão de servidores, perfis de acesso e trilha de auditoria do sistema" />
      <div className="flex gap-1 mb-5" style={{ borderBottom: "1px solid var(--line)" }}>
        {([["usuarios", "Usuários", "usuario"], ["perfis", "Perfis de Acesso", "administracao"], ["auditoria", "Registro de Auditoria", "relogio"]] as const).map(([k, r, ic]) => (
          <button key={k} className={`tab-btn ${aba === k ? "on" : ""}`} onClick={() => setAba(k)}>
            <span className="inline-flex items-center gap-1.5"><Icon name={ic} size={14} /> {r}</span>
          </button>
        ))}
      </div>

      {aba === "usuarios" && (
        <Reveal>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative">
              <Icon name="busca" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input className="input pl-9 w-[280px]" placeholder="Pesquisar por nome, matrícula ou cargo…" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <button className="btn btn-accent ml-auto" onClick={() => setModalNovo(true)}><Icon name="mais" size={16} /> Novo Usuário</button>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="tbl min-w-[820px]">
                <thead><tr><th>Servidor</th><th>Matrícula</th><th>Cargo / Função</th><th>Lotação</th><th>Perfil de Acesso</th><th>Situação</th><th>Ações</th></tr></thead>
                <tbody>
                  {filtrados.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar nome={u.nome} size={30} />
                          <div>
                            <div className="font-bold text-[12.5px] whitespace-nowrap">{u.nome}</div>
                            <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-bold tabular-nums text-[12px]">{u.matricula}</td>
                      <td className="text-[12px]">{u.cargo}</td>
                      <td>
                        <div className="text-[12px] font-bold">{unidadeDe(u.unidadeId)?.sigla}</div>
                        <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>Ramal {u.ramal}</div>
                      </td>
                      <td><Chip tom={u.perfil === "Administrador" ? "vermelho" : u.perfil === "Gerente de Projeto" ? "azul" : "verde"} dot={false}>{u.perfil}</Chip></td>
                      <td><Chip tom={u.ativo ? "verde" : "cinza"}>{u.ativo ? "Ativo" : "Suspenso"}</Chip></td>
                      <td>
                        <div className="flex gap-1">
                          <button className="icon-btn" title="Editar" aria-label="Editar" onClick={() => toast("Edição de usuário", "verde", `${u.nome} — dados funcionais atualizados`)}><Icon name="editar" size={16} /></button>
                          <button className="icon-btn" style={{ color: "var(--red)" }} title={u.ativo ? "Suspender conta" : "Reativar conta"} aria-label="Suspender ou reativar" onClick={() => {
                            if (u.ativo) setConfirmaSuspensao(u);
                            else { toggleUsuario(u.id); toast("Conta reativada", "verde", u.nome); }
                          }}><Icon name={u.ativo ? "cadeado" : "check"} size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      )}

      {aba === "perfis" && (
        <Reveal>
          <div className="space-y-4">
            {perfis.map((p) => (
              <div key={p.nome} className="card overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 px-5 py-3.5" style={{ borderBottom: "1px solid var(--line)" }}>
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--deep)", color: "#f2b70a" }}><Icon name="administracao" size={18} /></span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-[15.5px] m-0">{p.nome}</h3>
                    <p className="text-[11.5px] m-0" style={{ color: "var(--muted)" }}>{p.descricao}</p>
                  </div>
                  <Chip tom="cinza" dot={false}>{fmtNum(usuarios.filter((u) => u.perfil === p.nome).length)} servidores</Chip>
                </div>
                <div className="overflow-x-auto">
                  <table className="tbl min-w-[720px]">
                    <thead><tr><th>Módulo</th>{ACOES_PERMISSAO.map((a) => <th key={a} className="text-center !px-2">{a}</th>)}</tr></thead>
                    <tbody>
                      {MODULOS_PERMISSAO.map((m) => (
                        <tr key={m}>
                          <td className="font-bold text-[12px]">{m}</td>
                          {p.matriz[m].map((v, i) => (
                            <td key={i} className="text-center !px-2">
                              <button
                                className="w-5 h-5 rounded inline-flex items-center justify-center cursor-pointer transition-all border-0"
                                style={v ? { background: "var(--green)", color: "#fff" } : { background: "rgba(19,37,29,0.08)", color: "transparent" }}
                                onClick={() => togglePermissao(p.nome, m, i)}
                                aria-label={`${p.nome} — ${m}: ${ACOES_PERMISSAO[i]}`}
                              >
                                <Icon name="check" size={11} />
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {aba === "auditoria" && (
        <Reveal>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <select className="select !w-[260px]" value={filtroAcao} onChange={(e) => setFiltroAcao(e.target.value)} aria-label="Filtrar por ação">
              {acoes.map((a) => <option key={a}>{a}</option>)}
            </select>
            <span className="text-[12px] font-semibold" style={{ color: "var(--muted)" }}>{fmtNum(audFiltrada.length)} registros no período</span>
            <button className="btn btn-outline ml-auto !py-1.5 text-[12px]" onClick={() => toast("Exportação iniciada", "azul", "registro_auditoria.csv")}>
              <Icon name="baixar" size={14} /> Exportar CSV
            </button>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="tbl min-w-[760px]">
                <thead><tr><th>Data/Hora</th><th>Usuário</th><th>Ação</th><th>Objeto</th><th>Detalhe</th><th>Endereço IP</th></tr></thead>
                <tbody>
                  {audFiltrada.map((a) => (
                    <tr key={a.id}>
                      <td className="font-bold tabular-nums text-[12px] whitespace-nowrap">{fmtDataHora(a.dataHora)}</td>
                      <td>
                        <span className="flex items-center gap-2 text-[12px] font-semibold whitespace-nowrap">
                          {a.usuario !== "sistema" && <Avatar nome={a.usuario} size={22} />}{a.usuario}
                        </span>
                      </td>
                      <td><Chip tom={a.acao.includes("recusada") || a.acao.includes("Tentativa") ? "vermelho" : a.acao.includes("Criação") || a.acao.includes("Abertura") ? "verde" : "azul"} dot={false}>{a.acao}</Chip></td>
                      <td className="font-bold text-[12px]">{a.objeto}</td>
                      <td className="text-[12px] max-w-[240px] truncate" style={{ color: "var(--muted)" }}>{a.detalhe}</td>
                      <td className="tabular-nums text-[11.5px]" style={{ color: "var(--muted)" }}>{a.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      )}

      <Confirmacao
        aberto={!!confirmaSuspensao}
        titulo="Suspender conta de usuário"
        mensagem={`A conta de ${confirmaSuspensao?.nome} (${confirmaSuspensao?.matricula}) será suspensa e o acesso ao SIGA bloqueado imediatamente. A ação ficará registrada na auditoria. Deseja continuar?`}
        perigoso
        onCancelar={() => setConfirmaSuspensao(null)}
        onConfirmar={() => {
          if (confirmaSuspensao) { toggleUsuario(confirmaSuspensao.id); toast("Conta suspensa", "ambar", confirmaSuspensao.nome); }
          setConfirmaSuspensao(null);
        }}
      />

      <Modal aberto={modalNovo} onFechar={() => setModalNovo(false)} titulo="Novo Usuário" largo
        rodape={<><button className="btn btn-outline" onClick={() => setModalNovo(false)}>Cancelar</button><button className="btn btn-primary" onClick={() => {
          if (!novo.nome.trim() || !novo.matricula.trim()) { toast("Preencha nome e matrícula", "vermelho"); return; }
          toast("Usuário criado", "verde", `${novo.nome} — convite de ativação enviado por e-mail`);
          setModalNovo(false); setNovo({ nome: "", matricula: "", usuario: "", cargo: "", unidadeId: "un11", perfil: "Visualizador" });
        }}><Icon name="check" size={15} /> Criar usuário</button></>}
      >
        <div className="space-y-4">
          <Campo rotulo="Nome completo" obrigatorio><input className="input" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} placeholder="ex.: Paula Regina Martins" /></Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Matrícula funcional" obrigatorio><input className="input" value={novo.matricula} onChange={(e) => setNovo({ ...novo, matricula: e.target.value })} placeholder="ex.: 2026-0201" /></Campo>
            <Campo rotulo="Usuário de acesso"><input className="input" value={novo.usuario} onChange={(e) => setNovo({ ...novo, usuario: e.target.value })} placeholder="ex.: paula.martins" /></Campo>
          </div>
          <Campo rotulo="Cargo / Função"><input className="input" value={novo.cargo} onChange={(e) => setNovo({ ...novo, cargo: e.target.value })} placeholder="ex.: Técnica Administrativa" /></Campo>
          <div className="grid grid-cols-2 gap-4">
            <Seletor rotulo="Lotação (Unidade Administrativa)" valor={novo.unidadeId} onChange={(v) => setNovo({ ...novo, unidadeId: v })}
              opcoes={unidades.filter((u) => u.id !== "un0").map((u) => ({ valor: u.id, rotulo: `${u.sigla} — ${u.nome}` }))} />
            <Seletor rotulo="Perfil de Acesso" valor={novo.perfil} onChange={(v) => setNovo({ ...novo, perfil: v })}
              opcoes={perfis.map((p) => p.nome)} />
          </div>
          <p className="text-[11.5px] m-0 flex gap-1.5 items-start" style={{ color: "var(--muted)" }}>
            <Icon name="info" size={13} className="mt-0.5 flex-none" /> O CPF não é solicitado para autenticação — o acesso utiliza usuário ou matrícula + senha, conforme a política de segurança.
          </p>
        </div>
      </Modal>
    </div>
  );
}

/* ===================== Configurações ===================== */

export function Configuracoes({ onRefazerInstalacao }: { onRefazerInstalacao: () => void }) {
  const { config, setConfig } = useApp();
  const toast = useToast();
  const [form, setForm] = useState(config);

  const salvar = () => { setConfig(form); toast("Configurações salvas", "verde", "As alterações valem para todo o sistema."); };

  return (
    <div>
      <CabecalhoPagina
        titulo="Configurações"
        subtitulo="Parâmetros do sistema, regionalização e políticas de segurança"
        acoes={<button className="btn btn-primary" onClick={salvar}><Icon name="check" size={15} /> Salvar alterações</button>}
      />
      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <Reveal>
          <div className="card p-5">
            <div className="ovl mb-4">Dados do Órgão</div>
            <div className="space-y-4">
              <Campo rotulo="Nome do Órgão / Entidade"><input className="input" value={form.orgao.nome} onChange={(e) => setForm({ ...form, orgao: { ...form.orgao, nome: e.target.value } })} /></Campo>
              <div className="grid grid-cols-2 gap-4">
                <Campo rotulo="CNPJ"><input className="input" value={form.orgao.cnpj} onChange={(e) => setForm({ ...form, orgao: { ...form.orgao, cnpj: e.target.value } })} /></Campo>
                <Campo rotulo="Município / UF"><input className="input" value={`${form.orgao.municipio} / ${form.orgao.uf}`} onChange={(e) => setForm({ ...form, orgao: { ...form.orgao, municipio: e.target.value.split(" / ")[0], uf: e.target.value.split(" / ")[1] ?? form.orgao.uf } })} /></Campo>
              </div>
              <Campo rotulo="Endereço"><input className="input" value={form.orgao.endereco} onChange={(e) => setForm({ ...form, orgao: { ...form.orgao, endereco: e.target.value } })} /></Campo>
            </div>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className="card p-5">
            <div className="ovl mb-4">Regionalização</div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Seletor rotulo="Idioma do sistema" valor={form.regional.idioma} onChange={(v) => setForm({ ...form, regional: { ...form.regional, idioma: v } })}
                  opcoes={[{ valor: "pt-BR", rotulo: "Português (Brasil)" }]} />
                <Seletor rotulo="Fuso horário" valor={form.regional.fuso} onChange={(v) => setForm({ ...form, regional: { ...form.regional, fuso: v } })}
                  opcoes={["America/Sao_Paulo", "America/Manaus", "America/Fortaleza", "America/Noronha"]} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Seletor rotulo="Moeda padrão" valor={form.regional.moeda} onChange={(v) => setForm({ ...form, regional: { ...form.regional, moeda: v } })}
                  opcoes={[{ valor: "BRL", rotulo: "R$ — Real brasileiro" }, { valor: "USD", rotulo: "US$ — Dólar americano" }, { valor: "EUR", rotulo: "€ — Euro" }]} />
                <Campo rotulo="Formato de data"><input className="input" value={form.regional.formatoData} disabled /></Campo>
              </div>
              <div className="rounded-lg px-4 py-3 text-[12px] leading-relaxed" style={{ background: "var(--green-soft)", color: "var(--green)" }}>
                <strong>pt-BR ativo:</strong> números 1.250,50 · datas DD/MM/YYYY · moeda configurável para outros padrões no futuro.
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={40}>
          <div className="card p-5">
            <div className="ovl mb-2">Notificações</div>
            <Chave ligado={form.notificacoes.tarefasAtribuidas} onChange={(v) => setForm({ ...form, notificacoes: { ...form.notificacoes, tarefasAtribuidas: v } })} rotulo="Tarefa atribuída" desc="Notificar quando uma tarefa for atribuída a você." />
            <Chave ligado={form.notificacoes.prazosVencendo} onChange={(v) => setForm({ ...form, notificacoes: { ...form.notificacoes, prazosVencendo: v } })} rotulo="Prazos vencendo" desc="Alertas 48 h e 24 h antes do vencimento." />
            <Chave ligado={form.notificacoes.aprovacoes} onChange={(v) => setForm({ ...form, notificacoes: { ...form.notificacoes, aprovacoes: v } })} rotulo="Aprovações pendentes" desc="Documentos e demandas aguardando seu parecer." />
            <Chave ligado={form.notificacoes.demandasNovas} onChange={(v) => setForm({ ...form, notificacoes: { ...form.notificacoes, demandasNovas: v } })} rotulo="Novas demandas" desc="Solicitações recebidas pela central de atendimento." />
            <Chave ligado={form.notificacoes.resumoDiario} onChange={(v) => setForm({ ...form, notificacoes: { ...form.notificacoes, resumoDiario: v } })} rotulo="Resumo diário por e-mail" desc="Consolidado das pendências às 7h30." />
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="card p-5">
            <div className="ovl mb-2">Segurança</div>
            <Chave ligado={form.seguranca.mfa} onChange={(v) => setForm({ ...form, seguranca: { ...form.seguranca, mfa: v } })} rotulo="Verificação em duas etapas (MFA)" desc="Obrigatória para perfis de gestão e administração." />
            <Chave ligado={form.seguranca.senhaForte} onChange={(v) => setForm({ ...form, seguranca: { ...form.seguranca, senhaForte: v } })} rotulo="Política de senha forte" desc="Mínimo de 8 caracteres com complexidade." />
            <Chave ligado={form.seguranca.bloqueioTentativas} onChange={(v) => setForm({ ...form, seguranca: { ...form.seguranca, bloqueioTentativas: v } })} rotulo="Bloqueio por tentativas" desc="Bloqueio de 30 min após 5 falhas de login." />
            <Chave ligado={form.seguranca.sessaoLimite} onChange={(v) => setForm({ ...form, seguranca: { ...form.seguranca, sessaoLimite: v } })} rotulo="Expiração de sessão" desc="Sessão encerrada após 30 min de inatividade." />
          </div>
        </Reveal>

        <Reveal delay={60} className="lg:col-span-2">
          <div className="card p-5">
            <div className="ovl mb-4">Dados e Manutenção</div>
            <div className="grid sm:grid-cols-3 gap-3">
              <button className="btn btn-outline justify-start !py-3" onClick={() => toast("Backup gerado", "verde", "backup_siga_2026-10-14.sql (42,1 MB)")}>
                <Icon name="baixar" size={16} /> Exportar backup dos dados
              </button>
              <button className="btn btn-outline justify-start !py-3" onClick={() => toast("Dados de demonstração restaurados", "verde", "As cargas iniciais foram recarregadas.")}>
                <Icon name="banco" size={16} /> Restaurar dados de demonstração
              </button>
              <button className="btn btn-outline justify-start !py-3" style={{ color: "var(--red)", borderColor: "var(--red)" }} onClick={onRefazerInstalacao}>
                <Icon name="engrenagem" size={16} /> Refazer Assistente de Instalação
              </button>
            </div>
            <p className="text-[11.5px] mt-3 mb-0" style={{ color: "var(--muted)" }}>
              O assistente permite reconfigurar dados do órgão, administrador, banco de dados, regionalização, autenticação e estrutura administrativa inicial.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
