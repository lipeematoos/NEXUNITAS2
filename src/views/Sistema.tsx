import { useRef, useState } from "react";
import { Avatar, Campo, Chip, Icon, Modal, Reveal, Seletor, Chave, useToast } from "../components/ui";
import AdminSistema from "../modules/admin/AdminSistema";
import { ConstrutorRelatorios } from "./Monitoramento";
import { fmtData, fmtDataHora, fmtNum } from "../lib/format";
import { useApp } from "../lib/store";

type Aba = "usuarios" | "perfis" | "senhas" | "unidades" | "cargos" | "relatorios" | "identidade" | "auditoria" | "sistema";

function forcaSenha(s: string): { nota: number; rotulo: string; cor: string } {
  let nota = 0;
  if (s.length >= 8) nota++;
  if (s.length >= 12) nota++;
  if (/[A-Z]/.test(s) && /[a-z]/.test(s)) nota++;
  if (/[0-9]/.test(s)) nota++;
  if (/[^A-Za-z0-9]/.test(s)) nota++;
  if (nota <= 1) return { nota, rotulo: "Fraca", cor: "var(--red)" };
  if (nota <= 3) return { nota, rotulo: "Média", cor: "var(--amber)" };
  return { nota, rotulo: "Forte", cor: "var(--green)" };
}

export function Administracao() {
  const app = useApp();
  const {
    usuarios, unidades, equipes, perfis, setPerfis, auditoria, toggleUsuario, criarUnidade, atualizarUnidade,
    config, setConfig, politicaSenha, setPoliticaSenha, alterarSenhaAdmin, redefinirSenhaUsuario, atual,
    tiposUnidade, registrarAuditoria, temPermissao,
  } = app;
  const toast = useToast();
  const [aba, setAba] = useState<Aba>("usuarios");
  const [busca, setBusca] = useState("");
  const [confirmSuspensao, setConfirmSuspensao] = useState<typeof usuarios[number] | null>(null);
  const [modalReset, setModalReset] = useState<typeof usuarios[number] | null>(null);
  const [resetModo, setResetModo] = useState<"gerar" | "manual">("gerar");
  const [resetManual, setResetManual] = useState("");
  const [resetObrigar, setResetObrigar] = useState(true);
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);
  const [novaUnidade, setNovaUnidade] = useState(false);
  const [unid, setUnid] = useState({ nome: "", sigla: "", tipo: "Setor", parentId: "un1", responsavelId: "" });
  const [senhaForm, setSenhaForm] = useState({ atual: "", nova: "", confirmar: "" });
  const [ident, setIdent] = useState(config.identidade);
  const [marcas, setMarcas] = useState({ corPrimaria: config.marca.corPrimaria, corAcento: config.marca.corAcento });
  const arqBrasao = useRef<HTMLInputElement>(null);
  const arqLogo = useRef<HTMLInputElement>(null);

  const filtrados = usuarios.filter((u) => busca.trim() === "" || `${u.nome} ${u.matricula} ${u.cargo}`.toLowerCase().includes(busca.toLowerCase()));
  const acoes = ["Todas", ...Array.from(new Set(auditoria.map((a) => a.acao)))];
  const [filtroAcao, setFiltroAcao] = useState("Todas");
  const audFiltrada = auditoria.filter((a) => filtroAcao === "Todas" || a.acao === filtroAcao);
  const unDe = (id: string) => unidades.find((u) => u.id === id);

  const ABAS: [Aba, string, string][] = [
    ["usuarios", "Usuários", "usuario"], ["perfis", "Perfis de Acesso", "administracao"], ["senhas", "Política de Senhas", "cadeado"],
    ["unidades", "Unidades Administrativas", "organograma"], ["cargos", "Cargos e Funções", "area"],
    ["relatorios", "Relatórios", "relatorios"], ["identidade", "Identidade do Sistema", "painel"],
    ["auditoria", "Auditoria", "relogio"], ["sistema", "Sistema e Licenciamento", "escudo"],
  ];

  const salvarIdentidade = () => {
    setConfig({ ...config, identidade: ident, marca: { ...config.marca, ...marcas } });
    registrarAuditoria("Alteração de identidade do sistema", ident.nomeSistema, ident.brasaoDataUrl ? "Brasão do órgão atualizado (arquivo em volume persistente)" : "Parâmetros de marca atualizados");
    toast("Identidade salva", "verde", "As alterações valem para login, menu, relatórios e PDFs.");
  };

  const lerArquivo = (file: File | undefined, alvo: "brasaoDataUrl" | "logoDataUrl") => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) { toast("Formato não suportado", "vermelho", "Use PNG, JPG ou SVG validado."); return; }
    if (file.size > 2 * 1024 * 1024) { toast("Arquivo muito grande", "vermelho", "Limite de 2 MB para imagens de identidade."); return; }
    const r = new FileReader();
    r.onload = () => { setIdent((i) => ({ ...i, [alvo]: String(r.result) })); toast("Imagem carregada", "verde", `${file.name} — salve para aplicar`); };
    r.readAsDataURL(file);
  };

  const togglePermissao = (perfilNome: string, modulo: string, idx: number) => {
    setPerfis(perfis.map((p) => p.nome !== perfilNome ? p : {
      ...p,
      matriz: { ...p.matriz, [modulo]: p.matriz[modulo].map((v, i) => (i === idx ? !v : v)) },
    }));
    toast("Permissão atualizada", "verde", `${perfilNome} · ${modulo}`);
  };

  return (
    <div>
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1" style={{ borderBottom: "1px solid var(--line)" }}>
        {ABAS.map(([k, r, ic]) => (
          <button key={k} className={`tab-btn ${aba === k ? "on" : ""}`} onClick={() => setAba(k)}>
            <span className="inline-flex items-center gap-1.5"><Icon name={ic} size={14} /> {r}</span>
          </button>
        ))}
      </div>

      {/* ===== USUÁRIOS ===== */}
      {aba === "usuarios" && (
        <Reveal>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative">
              <Icon name="busca" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input className="input pl-9 w-[280px]" placeholder="Pesquisar por nome, matrícula ou cargo…" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <span className="self-center text-[12px] font-semibold" style={{ color: "var(--muted)" }}>{fmtNum(filtrados.length)} servidores · senhas com hash seguro (Argon2) — nunca exibidas</span>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="tbl min-w-[880px]">
                <thead><tr><th>Servidor</th><th>Matrícula</th><th>Cargo / Função</th><th>Lotação</th><th>Perfis</th><th>Senha</th><th>Situação</th><th>Ações</th></tr></thead>
                <tbody>
                  {filtrados.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar nome={u.nome} size={30} />
                          <div>
                            <div className="font-bold text-[12.5px] whitespace-nowrap">{u.nome}</div>
                            <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{u.usuario}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-bold tabular-nums text-[12px]">{u.matricula}</td>
                      <td className="text-[12px]">{u.cargo}</td>
                      <td>
                        <div className="text-[12px] font-bold">{unDe(u.unidadeId)?.sigla}</div>
                        <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>Ramal {u.ramal}</div>
                      </td>
                      <td><Chip tom={u.perfil === "Administrador" ? "vermelho" : u.perfil === "Gerente de Projeto" ? "azul" : "verde"} dot={false}>{u.perfil}</Chip></td>
                      <td>
                        {u.trocarSenha
                          ? <Chip tom="ambar">Troca obrigatória</Chip>
                          : <span className="text-[11px]" style={{ color: "var(--muted)" }}>{u.ultimaTrocaSenha ? `Última alteração ${fmtData(u.ultimaTrocaSenha)}` : "—"}</span>}
                      </td>
                      <td><Chip tom={u.ativo ? "verde" : "cinza"}>{u.ativo ? "Ativo" : "Suspenso"}</Chip></td>
                      <td>
                        <div className="flex gap-1">
                          <button className="icon-btn" title="Redefinir senha" aria-label="Redefinir senha" onClick={() => { setModalReset(u); setSenhaGerada(null); setResetModo("gerar"); setResetManual(""); setResetObrigar(true); }}><Icon name="cadeado" size={16} /></button>
                          <button className="icon-btn" style={{ color: "var(--red)" }} title={u.ativo ? "Suspender conta" : "Reativar conta"} aria-label="Suspender ou reativar" onClick={() => {
                            if (u.ativo) setConfirmSuspensao(u);
                            else { toggleUsuario(u.id); toast("Conta reativada", "verde", u.nome); }
                          }}><Icon name={u.ativo ? "fechar" : "check"} size={16} /></button>
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

      {/* ===== PERFIS ===== */}
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
                    <thead><tr><th>Módulo</th>{(["Visualizar", "Criar / Editar", "Aprovar", "Administrar"]).map((a) => <th key={a} className="text-center !px-2">{a}</th>)}</tr></thead>
                    <tbody>
                      {Object.keys(p.matriz).map((m) => (
                        <tr key={m}>
                          <td className="font-bold text-[12px]">{m}</td>
                          {p.matriz[m].map((v, i) => (
                            <td key={i} className="text-center !px-2">
                              <button
                                className="w-5 h-5 rounded inline-flex items-center justify-center cursor-pointer transition-all border-0"
                                style={v ? { background: "var(--green)", color: "#fff" } : { background: "rgba(19,37,29,0.08)", color: "transparent" }}
                                onClick={() => togglePermissao(p.nome, m, i)}
                                aria-label={`${p.nome} — ${m}`}
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
            <p className="text-[11.5px] m-0" style={{ color: "var(--muted)" }}>
              Perfis granulares de segurança (Gestor/Analista/Auditor de Segurança, Administrador de Infraestrutura) usam permissões específicas
              <code className="kbd mx-1">security.*</code> aplicadas pelo motor RBAC — inclusive para ocultar seções do menu e dados sensíveis.
            </p>
          </div>
        </Reveal>
      )}

      {/* ===== POLÍTICA DE SENHAS ===== */}
      {aba === "senhas" && (
        <div className="grid lg:grid-cols-2 gap-4 items-start">
          <Reveal>
            <div className="card p-5">
              <div className="ovl mb-4">Senha do Administrador</div>
              <div className="text-[12px] mb-3" style={{ color: "var(--muted)" }}>
                Sessão: <strong style={{ color: "var(--ink)" }}>{atual.nome}</strong> · última alteração:{" "}
                <strong style={{ color: "var(--ink)" }}>{atual.ultimaTrocaSenha ? fmtDataHora(atual.ultimaTrocaSenha) : "não registrada nesta base"}</strong>
              </div>
              <div className="space-y-3">
                <Campo rotulo="Senha atual" obrigatorio><input className="input" type="password" value={senhaForm.atual} onChange={(e) => setSenhaForm({ ...senhaForm, atual: e.target.value })} /></Campo>
                <Campo rotulo="Nova senha" obrigatorio>
                  <input className="input" type="password" value={senhaForm.nova} onChange={(e) => setSenhaForm({ ...senhaForm, nova: e.target.value })} />
                </Campo>
                {senhaForm.nova && (() => {
                  const f = forcaSenha(senhaForm.nova);
                  return (
                    <div>
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((n) => <span key={n} className="h-1.5 flex-1 rounded-full" style={{ background: n <= f.nota ? f.cor : "rgba(19,37,29,0.1)" }} />)}
                      </div>
                      <span className="text-[11px] font-bold" style={{ color: f.cor }}>Força: {f.rotulo}</span>
                    </div>
                  );
                })()}
                <Campo rotulo="Confirmar nova senha" obrigatorio><input className="input" type="password" value={senhaForm.confirmar} onChange={(e) => setSenhaForm({ ...senhaForm, confirmar: e.target.value })} /></Campo>
                <button className="btn btn-primary w-full" onClick={() => {
                  if (senhaForm.nova !== senhaForm.confirmar) { toast("As senhas não conferem", "vermelho"); return; }
                  const erro = alterarSenhaAdmin(senhaForm.atual, senhaForm.nova);
                  if (erro) { toast("Não foi possível alterar", "vermelho", erro); return; }
                  toast("Senha alterada com sucesso", "verde", "O evento foi registrado em auditoria sem armazenar o valor.");
                  setSenhaForm({ atual: "", nova: "", confirmar: "" });
                }}><Icon name="cadeado" size={15} /> Alterar minha senha</button>
                <p className="text-[10.5px] m-0" style={{ color: "var(--muted)" }}>
                  A senha é verificada contra o hash armazenado (Argon2/bcrypt). Reutilização bloqueada pelo histórico de {politicaSenha.historico} senhas. Para demonstração, a senha atual é <code className="kbd">GovFlow@2026</code>.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div className="card p-5">
              <div className="ovl mb-3">Política de senhas da organização</div>
              <div className="grid grid-cols-2 gap-x-5">
                <Campo rotulo={`Tamanho mínimo: ${politicaSenha.tamanhoMin}`}>
                  <input type="range" min={6} max={20} value={politicaSenha.tamanhoMin} onChange={(e) => setPoliticaSenha({ ...politicaSenha, tamanhoMin: Number(e.target.value) })} className="w-full" style={{ accentColor: "var(--green)" }} />
                </Campo>
                <Campo rotulo={`Expiração: ${politicaSenha.expiracaoDias} dias`}>
                  <input type="range" min={0} max={365} step={15} value={politicaSenha.expiracaoDias} onChange={(e) => setPoliticaSenha({ ...politicaSenha, expiracaoDias: Number(e.target.value) })} className="w-full" style={{ accentColor: "var(--green)" }} />
                </Campo>
                <Campo rotulo={`Histórico: ${politicaSenha.historico} senhas`}>
                  <input type="range" min={0} max={12} value={politicaSenha.historico} onChange={(e) => setPoliticaSenha({ ...politicaSenha, historico: Number(e.target.value) })} className="w-full" style={{ accentColor: "var(--green)" }} />
                </Campo>
                <Campo rotulo={`Bloqueio: ${politicaSenha.tentativas} tentativas / ${politicaSenha.bloqueioMin} min`}>
                  <input type="range" min={3} max={10} value={politicaSenha.tentativas} onChange={(e) => setPoliticaSenha({ ...politicaSenha, tentativas: Number(e.target.value) })} className="w-full" style={{ accentColor: "var(--green)" }} />
                </Campo>
              </div>
              <div className="mt-2">
                <Chave ligado={politicaSenha.maiusculas} onChange={(v) => setPoliticaSenha({ ...politicaSenha, maiusculas: v })} rotulo="Exigir letras maiúsculas" />
                <Chave ligado={politicaSenha.minusculas} onChange={(v) => setPoliticaSenha({ ...politicaSenha, minusculas: v })} rotulo="Exigir letras minúsculas" />
                <Chave ligado={politicaSenha.numeros} onChange={(v) => setPoliticaSenha({ ...politicaSenha, numeros: v })} rotulo="Exigir números" />
                <Chave ligado={politicaSenha.especiais} onChange={(v) => setPoliticaSenha({ ...politicaSenha, especiais: v })} rotulo="Exigir caracteres especiais" />
                <Chave ligado={politicaSenha.obrigatoriaPrimeiroAcesso} onChange={(v) => setPoliticaSenha({ ...politicaSenha, obrigatoriaPrimeiroAcesso: v })} rotulo="Alteração obrigatória no primeiro acesso" />
              </div>
              <p className="text-[10.5px] mt-3 mb-0" style={{ color: "var(--muted)" }}>Alterações são auditadas e aplicadas a todas as contas na próxima troca de senha.</p>
            </div>
          </Reveal>
        </div>
      )}

      {/* ===== UNIDADES ===== */}
      {aba === "unidades" && (
        <Reveal>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted)" }}>{fmtNum(unidades.length)} unidades · {fmtNum(tiposUnidade.filter((t) => t.ativo).length)} tipos ativos · hierarquia ilimitada</span>
            <button className="btn btn-accent" onClick={() => { setNovaUnidade(true); setUnid({ nome: "", sigla: "", tipo: "Setor", parentId: "un1", responsavelId: "" }); }}><Icon name="mais" size={16} /> Nova Unidade</button>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="tbl min-w-[760px]">
                <thead><tr><th>Unidade</th><th>Tipo</th><th>Unidade superior</th><th>Responsável</th><th>Atendimento TI</th><th>Status</th></tr></thead>
                <tbody>
                  {unidades.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="font-bold text-[12.5px]">{u.nome}</div>
                        <div className="text-[10.5px] tabular-nums" style={{ color: "var(--muted)" }}>{u.sigla}</div>
                      </td>
                      <td><Chip tom="cinza" dot={false}>{u.tipo}</Chip></td>
                      <td className="text-[12px]">{unDe(u.parentId ?? "")?.sigla ?? "— (raiz)"}</td>
                      <td className="text-[12px]">{usuarios.find((x) => x.id === (u.responsavelId ?? ""))?.nome ?? "—"}</td>
                      <td>{u.temEquipePropria ? <Chip tom="pinho" dot={false}>Equipe própria</Chip> : <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>Herdado</span>}</td>
                      <td><Chip tom={u.ativa === false ? "cinza" : "verde"} dot={false}>{u.ativa === false ? "Inativa" : "Ativa"}</Chip></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      )}

      {/* ===== CARGOS ===== */}
      {aba === "cargos" && (
        <Reveal>
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="ovl mb-3">Cargos (configuráveis)</div>
              <div className="flex flex-wrap gap-2">
                {["Técnico de Informática", "Analista de Sistemas", "Assistente Administrativo", "Contador", "Engenheiro", "Professor", "Médico", "Enfermeiro", "Fiscal de Tributos", "Diretor de Departamento"].map((c) => (
                  <Chip key={c} tom="azul" dot={false}>{c}</Chip>
                ))}
              </div>
              <p className="text-[11.5px] mt-4 mb-0" style={{ color: "var(--muted)" }}>Cargos são criados pelo administrador em Tipos de Unidade / Pessoas — sem código.</p>
            </div>
            <div className="card p-5">
              <div className="ovl mb-3">Funções (atribuições funcionais)</div>
              <div className="flex flex-wrap gap-2">
                {["Secretário Municipal", "Subsecretário", "Diretor", "Coordenador", "Chefe de Setor", "Fiscal de Contrato", "Gestor de Sistema", "Técnico Responsável", "Gestor de TI"].map((c) => (
                  <Chip key={c} tom="verde" dot={false}>{c}</Chip>
                ))}
              </div>
              <p className="text-[11.5px] mt-4 mb-0" style={{ color: "var(--muted)" }}>Um servidor pode ter Cargo “Técnico de Informática” e Função “Coordenador de TI” — conceitos independentes.</p>
            </div>
          </div>
        </Reveal>
      )}

      {/* ===== RELATÓRIOS ===== */}
      {aba === "relatorios" && <Reveal><ConstrutorRelatorios /></Reveal>}

      {/* ===== IDENTIDADE ===== */}
      {aba === "identidade" && (
        <div className="grid lg:grid-cols-2 gap-4 items-start">
          <Reveal>
            <div className="card p-5">
              <div className="ovl mb-4">Identidade do Sistema</div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Campo rotulo="Nome do sistema"><input className="input" value={ident.nomeSistema} onChange={(e) => setIdent({ ...ident, nomeSistema: e.target.value })} /></Campo>
                  <Campo rotulo="Sigla"><input className="input" value={ident.sigla} onChange={(e) => setIdent({ ...ident, sigla: e.target.value })} /></Campo>
                </div>
                <Campo rotulo="Nome do órgão"><input className="input" value={config.orgao.nome} onChange={(e) => setConfig({ ...config, orgao: { ...config.orgao, nome: e.target.value } })} /></Campo>
                <Campo rotulo="Texto institucional (tela inicial)"><input className="input" value={ident.textoInstitucional} onChange={(e) => setIdent({ ...ident, textoInstitucional: e.target.value })} /></Campo>
                <Campo rotulo="Mensagem da tela de login"><textarea className="textarea" rows={2} value={ident.msgLogin} onChange={(e) => setIdent({ ...ident, msgLogin: e.target.value })} /></Campo>
                <Campo rotulo="Rodapé institucional"><input className="input" value={ident.rodape} onChange={(e) => setIdent({ ...ident, rodape: e.target.value })} /></Campo>
                <div className="grid grid-cols-2 gap-4">
                  <Campo rotulo="Cor principal">
                    <div className="flex items-center gap-2">
                      <input type="color" value={marcas.corPrimaria} onChange={(e) => setMarcas({ ...marcas, corPrimaria: e.target.value })} className="w-10 h-9 rounded cursor-pointer" style={{ border: "1px solid var(--line-2)" }} />
                      <input className="input" value={marcas.corPrimaria} onChange={(e) => setMarcas({ ...marcas, corPrimaria: e.target.value })} />
                    </div>
                  </Campo>
                  <Campo rotulo="Cor secundária (destaque)">
                    <div className="flex items-center gap-2">
                      <input type="color" value={marcas.corAcento} onChange={(e) => setMarcas({ ...marcas, corAcento: e.target.value })} className="w-10 h-9 rounded cursor-pointer" style={{ border: "1px solid var(--line-2)" }} />
                      <input className="input" value={marcas.corAcento} onChange={(e) => setMarcas({ ...marcas, corAcento: e.target.value })} />
                    </div>
                  </Campo>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div className="card p-5">
              <div className="ovl mb-4">Brasão do Órgão × Logo do Sistema</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="label">Brasão da Prefeitura (PNG, JPG ou SVG)</div>
                  <div className="rounded-lg p-4 flex flex-col items-center gap-3" style={{ background: "rgba(19,37,29,0.04)", border: "1px dashed var(--line-2)" }}>
                    {ident.brasaoDataUrl
                      ? <img src={ident.brasaoDataUrl} alt="Brasão" style={{ height: 74, objectFit: "contain" }} />
                      : <span className="w-[52px] h-[60px] rounded flex items-center justify-center" style={{ background: "var(--deep)" }}><Icon name="escudo" size={26} className="text-[#f2b70a]" /></span>}
                    <div className="flex gap-1.5">
                      <button className="btn btn-outline !py-1 text-[11px]" onClick={() => arqBrasao.current?.click()}><Icon name="enviar" size={12} /> {ident.brasaoDataUrl ? "Substituir" : "Enviar"}</button>
                      {ident.brasaoDataUrl && <button className="btn btn-ghost !py-1 text-[11px]" style={{ color: "var(--red)" }} onClick={() => setIdent({ ...ident, brasaoDataUrl: null })}>Remover</button>}
                    </div>
                    <input ref={arqBrasao} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={(e) => lerArquivo(e.target.files?.[0], "brasaoDataUrl")} />
                  </div>
                </div>
                <div>
                  <div className="label">Logo do Sistema</div>
                  <div className="rounded-lg p-4 flex flex-col items-center gap-3" style={{ background: "rgba(19,37,29,0.04)", border: "1px dashed var(--line-2)" }}>
                    {ident.logoDataUrl
                      ? <img src={ident.logoDataUrl} alt="Logo" style={{ height: 74, objectFit: "contain" }} />
                      : <span className="font-display font-extrabold text-[24px]" style={{ color: "var(--deep)" }}>{ident.nomeSistema}</span>}
                    <div className="flex gap-1.5">
                      <button className="btn btn-outline !py-1 text-[11px]" onClick={() => arqLogo.current?.click()}><Icon name="enviar" size={12} /> {ident.logoDataUrl ? "Substituir" : "Enviar"}</button>
                      {ident.logoDataUrl && <button className="btn btn-ghost !py-1 text-[11px]" style={{ color: "var(--red)" }} onClick={() => setIdent({ ...ident, logoDataUrl: null })}>Remover</button>}
                    </div>
                    <input ref={arqLogo} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={(e) => lerArquivo(e.target.files?.[0], "logoDataUrl")} />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="label">Onde o brasão aparece</div>
                <div className="flex flex-wrap gap-1.5">
                  {[["login", "Tela de Login"], ["menu", "Menu Lateral"], ["relatorios", "Relatórios"], ["pdfs", "PDFs"], ["termos", "Termos"], ["documentos", "Documentos"]].map(([v, r]) => {
                    const on = ident.usoBrasao.includes(v);
                    return (
                      <button key={v} className="chip cursor-pointer border-0"
                        style={on ? { background: "var(--green)", color: "#fff" } : { background: "var(--grey-soft)", color: "var(--grey)" }}
                        onClick={() => setIdent({ ...ident, usoBrasao: on ? ident.usoBrasao.filter((x) => x !== v) : [...ident.usoBrasao, v] })}>
                        {on && <Icon name="check" size={10} />} {r}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="text-[10.5px] mt-3 mb-4" style={{ color: "var(--muted)" }}>
                Em produção, os arquivos ficam em volume Docker persistente (<code className="kbd">/data/branding</code>) e entram nas rotinas de backup — nunca embutidos na imagem do contêiner.
              </p>
              <button className="btn btn-primary w-full" onClick={salvarIdentidade}><Icon name="check" size={15} /> Salvar Alterações de Identidade</button>
            </div>
          </Reveal>
        </div>
      )}

      {/* ===== AUDITORIA ===== */}
      {aba === "auditoria" && (
        <Reveal>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <select className="select !w-[280px]" value={filtroAcao} onChange={(e) => setFiltroAcao(e.target.value)} aria-label="Filtrar por ação">
              {acoes.map((a) => <option key={a}>{a}</option>)}
            </select>
            <span className="text-[12px] font-semibold" style={{ color: "var(--muted)" }}>{fmtNum(audFiltrada.length)} registros · imutáveis</span>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="tbl min-w-[760px]">
                <thead><tr><th>Data/Hora</th><th>Usuário</th><th>Ação</th><th>Objeto</th><th>Detalhe</th><th>IP</th></tr></thead>
                <tbody>
                  {audFiltrada.map((a) => (
                    <tr key={a.id}>
                      <td className="font-bold tabular-nums text-[12px] whitespace-nowrap">{fmtDataHora(a.dataHora)}</td>
                      <td>
                        <span className="flex items-center gap-2 text-[12px] font-semibold whitespace-nowrap">
                          {a.usuario !== "sistema" && <Avatar nome={a.usuario} size={22} />}{a.usuario}
                        </span>
                      </td>
                      <td><Chip tom={a.acao.includes("recusada") || a.acao.includes("Tentativa") || a.acao.includes("Falha") ? "vermelho" : a.acao.includes("Criação") || a.acao.includes("Abertura") ? "verde" : "azul"} dot={false}>{a.acao}</Chip></td>
                      <td className="font-bold text-[12px]">{a.objeto}</td>
                      <td className="text-[12px] max-w-[260px] truncate" style={{ color: "var(--muted)" }}>{a.detalhe}</td>
                      <td className="tabular-nums text-[11.5px]" style={{ color: "var(--muted)" }}>{a.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      )}

      {/* ===== SISTEMA ===== */}
      {aba === "sistema" && <AdminSistema />}

      {/* ===== Modal redefinição de senha ===== */}
      <Modal aberto={!!modalReset} onFechar={() => setModalReset(null)} titulo={`Redefinir Senha — ${modalReset?.nome ?? ""}`}
        rodape={!senhaGerada ? (
          <>
            <button className="btn btn-outline" onClick={() => setModalReset(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={() => {
              if (!modalReset) return;
              if (resetModo === "manual") {
                const f = forcaSenha(resetManual);
                if (resetManual.length < politicaSenha.tamanhoMin || f.nota < 3) { toast("Senha temporária não atende à política", "vermelho", `Mínimo ${politicaSenha.tamanhoMin} caracteres com complexidade.`); return; }
              }
              const gerada = redefinirSenhaUsuario(modalReset.id);
              setSenhaGerada(resetModo === "manual" ? resetManual : gerada);
            }}><Icon name="cadeado" size={15} /> Redefinir senha</button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={() => { setModalReset(null); setSenhaGerada(null); }}><Icon name="check" size={15} /> Concluído</button>
        )}>
        {!senhaGerada ? (
          <div className="space-y-4">
            <div className="flex gap-1.5">
              {([["gerar", "Gerar temporária automaticamente"], ["manual", "Definir manualmente"]] as const).map(([v, r]) => (
                <button key={v} className="btn flex-1 !py-2 text-[12px]"
                  style={resetModo === v ? { background: "var(--deep)", color: "#f2f6f0", border: "1px solid var(--deep)" } : { background: "transparent", border: "1px solid var(--line-2)", color: "var(--muted)" }}
                  onClick={() => setResetModo(v)}>{r}</button>
              ))}
            </div>
            {resetModo === "manual" && (
              <Campo rotulo="Senha temporária" obrigatorio><input className="input" value={resetManual} onChange={(e) => setResetManual(e.target.value)} /></Campo>
            )}
            <Chave ligado={resetObrigar} onChange={setResetObrigar} rotulo="Obrigar alteração da senha no próximo acesso" desc="O servidor receberá a senha provisória e definirá uma pessoal." />
            <p className="text-[10.5px] m-0" style={{ color: "var(--muted)" }}>A senha existente nunca é exibida. O novo valor é armazenado com hash (Argon2) e o evento vai para auditoria sem o valor em claro.</p>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-[13px] m-0" style={{ color: "var(--muted)" }}>Senha temporária gerada — <strong style={{ color: "var(--red)" }}>exibida uma única vez</strong>:</p>
            <code className="block rounded-lg px-4 py-3 font-display font-extrabold text-[22px] tracking-widest" style={{ background: "var(--yellow-soft)", color: "var(--accent-ink)" }}>{senhaGerada}</code>
            <button className="btn btn-outline" onClick={() => { navigator.clipboard?.writeText(senhaGerada); toast("Copiada para a área de transferência", "verde"); }}>
              <Icon name="documentos" size={14} /> Copiar
            </button>
            {resetObrigar && <div className="text-[11.5px]" style={{ color: "var(--muted)" }}>A conta foi marcada para <strong>troca obrigatória no próximo acesso</strong>.</div>}
          </div>
        )}
      </Modal>

      {/* ===== Modal suspensão ===== */}
      <Modal aberto={!!confirmSuspensao} onFechar={() => setConfirmSuspensao(null)} titulo="Suspender conta de usuário"
        rodape={<>
          <button className="btn btn-outline" onClick={() => setConfirmSuspensao(null)}>Cancelar</button>
          <button className="btn btn-danger" onClick={() => {
            if (confirmSuspensao) { toggleUsuario(confirmSuspensao.id); toast("Conta suspensa", "ambar", confirmSuspensao.nome); }
            setConfirmSuspensao(null);
          }}>Confirmar suspensão</button>
        </>}>
        <p className="text-[13px] leading-relaxed m-0" style={{ color: "var(--muted)" }}>
          A conta de <strong style={{ color: "var(--ink)" }}>{confirmSuspensao?.nome}</strong> ({confirmSuspensao?.matricula}) será suspensa e o acesso bloqueado imediatamente. A ação fica registrada na auditoria. Deseja continuar?
        </p>
      </Modal>

      {/* ===== Modal nova unidade ===== */}
      <Modal aberto={novaUnidade} onFechar={() => setNovaUnidade(false)} titulo="Nova Unidade Administrativa"
        rodape={<><button className="btn btn-outline" onClick={() => setNovaUnidade(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => {
            if (!unid.nome.trim()) { toast("Informe o nome", "vermelho"); return; }
            criarUnidade({ nome: unid.nome.trim(), sigla: unid.sigla || unid.nome.slice(0, 4).toUpperCase(), tipo: unid.tipo, parentId: unid.parentId, responsavelId: unid.responsavelId || undefined, ativa: true });
            toast("Unidade criada", "verde", unid.nome);
            setNovaUnidade(false);
          }}><Icon name="check" size={15} /> Criar</button></>}>
        <div className="space-y-4">
          <Campo rotulo="Nome" obrigatorio><input className="input" value={unid.nome} onChange={(e) => setUnid({ ...unid, nome: e.target.value })} placeholder="ex.: Departamento de Tributação" /></Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Sigla"><input className="input" value={unid.sigla} onChange={(e) => setUnid({ ...unid, sigla: e.target.value })} /></Campo>
            <Seletor rotulo="Tipo" valor={unid.tipo} onChange={(v) => setUnid({ ...unid, tipo: v })} opcoes={tiposUnidade.filter((t) => t.ativo).map((t) => t.nome)} />
          </div>
          <Seletor rotulo="Unidade superior (vínculo hierárquico)" obrigatorio valor={unid.parentId} onChange={(v) => setUnid({ ...unid, parentId: v })}
            opcoes={unidades.map((u) => ({ valor: u.id, rotulo: `${u.sigla} — ${u.nome}` }))} />
          <Seletor rotulo="Responsável" valor={unid.responsavelId} onChange={(v) => setUnid({ ...unid, responsavelId: v })}
            opcoes={[{ valor: "", rotulo: "Definir depois" }, ...usuarios.filter((u) => u.ativo).map((u) => ({ valor: u.id, rotulo: u.nome }))]} />
        </div>
      </Modal>
    </div>
  );
}

/* ===== Configurações (mantém a tela existente) ===== */

export function Configuracoes({ onRefazerInstalacao }: { onRefazerInstalacao: () => void }) {
  const { config, setConfig } = useApp();
  const toast = useToast();
  const [form, setForm] = useState(config);

  const salvar = () => { setConfig(form); toast("Configurações salvas", "verde", "As alterações valem para todo o sistema."); };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-extrabold text-[26px] leading-tight m-0 tracking-tight">Configurações</h2>
          <p className="text-[13px] mt-1 m-0" style={{ color: "var(--muted)" }}>Parâmetros regionais, notificações, segurança e manutenção</p>
        </div>
        <button className="btn btn-primary" onClick={salvar}><Icon name="check" size={15} /> Salvar alterações</button>
      </div>
      <div className="grid lg:grid-cols-2 gap-4 items-start">
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
            <Campo rotulo="Prefixo dos chamados de TI"><input className="input" value={form.centralTI.prefixo} onChange={(e) => setForm({ ...form, centralTI: { ...form.centralTI, prefixo: e.target.value } })} /></Campo>
          </div>
        </div>
        <div className="card p-5">
          <div className="ovl mb-2">Notificações</div>
          <Chave ligado={form.notificacoes.tarefasAtribuidas} onChange={(v) => setForm({ ...form, notificacoes: { ...form.notificacoes, tarefasAtribuidas: v } })} rotulo="Tarefa atribuída" desc="Notificar quando uma tarefa for atribuída a você." />
          <Chave ligado={form.notificacoes.prazosVencendo} onChange={(v) => setForm({ ...form, notificacoes: { ...form.notificacoes, prazosVencendo: v } })} rotulo="Prazos vencendo" desc="Alertas 48 h e 24 h antes do vencimento." />
          <Chave ligado={form.notificacoes.aprovacoes} onChange={(v) => setForm({ ...form, notificacoes: { ...form.notificacoes, aprovacoes: v } })} rotulo="Aprovações pendentes" desc="Documentos e demandas aguardando seu parecer." />
          <Chave ligado={form.notificacoes.demandasNovas} onChange={(v) => setForm({ ...form, notificacoes: { ...form.notificacoes, demandasNovas: v } })} rotulo="Novas demandas" desc="Solicitações recebidas pela central de atendimento." />
          <Chave ligado={form.notificacoes.resumoDiario} onChange={(v) => setForm({ ...form, notificacoes: { ...form.notificacoes, resumoDiario: v } })} rotulo="Resumo diário por e-mail" desc="Consolidado das pendências às 7h30." />
        </div>
        <div className="card p-5">
          <div className="ovl mb-2">Segurança</div>
          <Chave ligado={form.seguranca.mfa} onChange={(v) => setForm({ ...form, seguranca: { ...form.seguranca, mfa: v } })} rotulo="Verificação em duas etapas (MFA)" desc="Obrigatória para perfis de gestão e administração." />
          <Chave ligado={form.seguranca.senhaForte} onChange={(v) => setForm({ ...form, seguranca: { ...form.seguranca, senhaForte: v } })} rotulo="Política de senha forte" desc="Mínimo de 8 caracteres com complexidade." />
          <Chave ligado={form.seguranca.bloqueioTentativas} onChange={(v) => setForm({ ...form, seguranca: { ...form.seguranca, bloqueioTentativas: v } })} rotulo="Bloqueio por tentativas" desc="Bloqueio de 30 min após 5 falhas de login." />
          <Chave ligado={form.seguranca.sessaoLimite} onChange={(v) => setForm({ ...form, seguranca: { ...form.seguranca, sessaoLimite: v } })} rotulo="Expiração de sessão" desc="Sessão encerrada após 30 min de inatividade." />
        </div>
        <div className="card p-5">
          <div className="ovl mb-4">Dados e Manutenção</div>
          <div className="space-y-2.5">
            <button className="btn btn-outline w-full justify-start" onClick={() => toast("Backup gerado", "verde", "backup_govflow_2026-10-14.sql (42,1 MB) — inclui /data/branding")}>
              <Icon name="baixar" size={16} /> Exportar backup dos dados
            </button>
            <button className="btn btn-outline w-full justify-start" onClick={() => toast("Dados de demonstração restaurados", "verde", "As cargas iniciais foram recarregadas.")}>
              <Icon name="banco" size={16} /> Restaurar dados de demonstração
            </button>
            <button className="btn btn-outline w-full justify-start" style={{ color: "var(--red)", borderColor: "var(--red)" }} onClick={onRefazerInstalacao}>
              <Icon name="engrenagem" size={16} /> Refazer Assistente de Instalação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
