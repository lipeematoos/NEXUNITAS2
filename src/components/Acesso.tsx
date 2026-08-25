import { FormEvent, useEffect, useMemo, useState } from "react";
import { M } from "../i18n";
import { Brasao, Icon, Scramble, useToast } from "./ui";
import { useApp } from "../lib/store";
import { fmtData, fmtNum } from "../lib/format";

const PASSOS = [
  "Dados do Órgão",
  "Administrador do Sistema",
  "Configuração do Banco de Dados",
  "Configurações Gerais",
  "Autenticação",
  "Estrutura Administrativa Inicial",
  "Finalizar Instalação",
];

function Fundo({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ambient noise flex items-center justify-center p-4 py-10">
      {children}
    </div>
  );
}

function CaixaPasso({ ativo, rotulo, numero, feito }: { ativo: boolean; rotulo: string; numero: number; feito: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2.5 relative">
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-[11.5px] font-extrabold flex-none transition-all duration-300"
        style={ativo
          ? { background: "var(--accent)", color: "var(--accent-ink)", boxShadow: "0 0 0 4px rgba(242,183,10,0.25)" }
          : feito ? { background: "var(--green)", color: "#fff" } : { background: "rgba(19,37,29,0.08)", color: "var(--muted)" }}
      >
        {feito ? <Icon name="check" size={13} /> : numero}
      </span>
      <span className={`text-[12.5px] font-bold ${ativo ? "" : feito ? "" : "opacity-60"}`} style={ativo ? { color: "var(--ink)" } : feito ? { color: "var(--green)" } : undefined}>
        {rotulo}
      </span>
    </div>
  );
}

export function AssistenteInstalacao({ onConcluir }: { onConcluir: () => void }) {
  const { config, setConfig } = useApp();
  const toast = useToast();
  const [passo, setPasso] = useState(0);
  const [dados, setDados] = useState({
    nome: "Prefeitura Municipal de Cidade Exemplo", cnpj: "12.345.678/0001-90", municipio: "Cidade Exemplo", uf: "SP", endereco: "Praça Central, 100 — Centro",
    admNome: "Carlos Eduardo Menezes", admUsuario: "admin", admMatricula: "2011-0212", admSenha: "", admConfirmar: "",
    bdHost: "192.168.0.30", bdPorta: "5432", bdNome: "govflow", bdUsuario: "govflow_app", bdSenha: "",
    idioma: "pt-BR", fuso: "America/Sao_Paulo", moeda: "BRL", formatoData: "DD/MM/YYYY", prefixo: "TI-2026",
    metodoLogin: "ambos", mfa: true, senhaForte: true, expiracao: true, bloqueio: true,
    estruturas: [true, true, true, true],
  });
  const [testando, setTestando] = useState(false);
  const [conexaoOk, setConexaoOk] = useState(false);
  const [instalando, setInstalando] = useState(false);
  const [progresso, setProgresso] = useState(0);

  const erros = useMemo(() => {
    const e: Record<string, string> = {};
    if (passo === 0) {
      if (!dados.nome.trim()) e.nome = "Informe o nome do órgão.";
      if (!dados.municipio.trim()) e.municipio = "Informe o município.";
    }
    if (passo === 1) {
      if (!dados.admNome.trim()) e.admNome = "Informe o nome do administrador.";
      if (!dados.admUsuario.trim()) e.admUsuario = "Informe o usuário de acesso.";
      if (dados.admSenha.length < 8) e.admSenha = "A senha deve ter ao menos 8 caracteres.";
      if (dados.admSenha !== dados.admConfirmar) e.admConfirmar = "As senhas não conferem.";
    }
    if (passo === 2) {
      if (!dados.bdHost.trim()) e.bdHost = "Informe o endereço do servidor.";
      if (!dados.bdNome.trim()) e.bdNome = "Informe o nome do banco.";
    }
    return e;
  }, [passo, dados]);

  const testarConexao = () => {
    setTestando(true);
    setConexaoOk(false);
    setTimeout(() => { setTestando(false); setConexaoOk(true); toast("Conexão estabelecida", "verde", `PostgreSQL ${dados.bdHost}:${dados.bdPorta} respondeu em 12 ms.`); }, 1400);
  };

  const concluir = () => {
    setInstalando(true);
    const idv = setInterval(() => {
      setProgresso((p) => {
        if (p >= 100) { clearInterval(idv); return 100; }
        return p + 2 + Math.random() * 4;
      });
    }, 60);
    setTimeout(() => {
      clearInterval(idv);
      setProgresso(100);
      setConfig({
        ...config,
        orgao: { nome: dados.nome, cnpj: dados.cnpj, endereco: dados.endereco, municipio: dados.municipio, uf: dados.uf },
        regional: { idioma: dados.idioma, fuso: dados.fuso, moeda: dados.moeda, formatoData: dados.formatoData },
        centralTI: { ...config.centralTI, prefixo: dados.prefixo },
        seguranca: { mfa: dados.mfa, senhaForte: dados.senhaForte, bloqueioTentativas: dados.bloqueio, sessaoLimite: dados.expiracao },
      });
      toast("Instalação concluída", "verde", "O sistema está pronto para uso na rede interna.");
      setTimeout(onConcluir, 900);
    }, 3400);
  };

  const podeAvancar = Object.keys(erros).length === 0 && (passo !== 2 || conexaoOk);

  const input = (rotulo: string, campo: string, tipo = "text", obrigatorio = true) => (
    <label className="block">
      <span className="label">{rotulo} {obrigatorio && <span style={{ color: "var(--red)" }}>*</span>}</span>
      <input
        className="input" type={tipo}
        value={(dados as unknown as Record<string, string | boolean>)[campo] as string}
        onChange={(e) => setDados({ ...dados, [campo]: e.target.value })}
        style={erros[campo] ? { borderColor: "var(--red)" } : undefined}
      />
      {erros[campo] && <span className="text-[11px] font-semibold mt-1 block" style={{ color: "var(--red)" }}>{erros[campo]}</span>}
    </label>
  );

  return (
    <Fundo>
      <div className="w-full max-w-[980px] card overflow-hidden anim-rise" style={{ borderRadius: 14, boxShadow: "var(--shadow-2)" }}>
        <div className="hazard h-[6px]" />
        <div className="grid md:grid-cols-[300px_1fr]">
          <div className="p-6 flex flex-col" style={{ background: "var(--deep)" }}>
            <div className="flex items-center gap-3 mb-6">
              <Brasao size={42} />
              <div>
                <div className="font-display font-extrabold text-[21px] text-[#f4f7f2] leading-none"><Scramble texto="GovFlow" /></div>
                <div className="text-[10px] mt-1" style={{ color: "rgba(244,247,242,0.55)" }}>Assistente de Instalação</div>
              </div>
            </div>
            <div className="flex-1">
              {PASSOS.map((p, i) => <CaixaPasso key={p} ativo={i === passo} feito={i < passo} numero={i + 1} rotulo={p} />)}
            </div>
            <div className="text-[10.5px] leading-relaxed mt-6" style={{ color: "rgba(244,247,242,0.5)" }}>
              Etapa {fmtNum(passo + 1)} de {fmtNum(PASSOS.length)} · instalação 100% local, sem dependência de internet.
            </div>
          </div>

          <div className="p-7">
            {instalando ? (
              <div className="py-10 text-center">
                <span className="inline-flex w-14 h-14 rounded-full items-center justify-center mb-5 anim-spin" style={{ border: "3px solid var(--line-2)", borderTopColor: "var(--green)" }} />
                <h2 className="font-display font-extrabold text-[22px] m-0">Instalando o GovFlow…</h2>
                <p className="text-[13px] mt-2 mb-6" style={{ color: "var(--muted)" }}>Criando estruturas, perfis de acesso e dados de demonstração.</p>
                <div className="max-w-[380px] mx-auto">
                  <div className="rounded-full h-2.5 overflow-hidden" style={{ background: "rgba(19,37,29,0.1)" }}>
                    <div className="h-full rounded-full transition-all duration-150" style={{ width: `${Math.min(100, progresso)}%`, background: "var(--green)" }} />
                  </div>
                  <div className="text-[12px] font-bold mt-2 tabular-nums">{fmtNum(Math.min(100, Math.round(progresso)))}%</div>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-display font-extrabold text-[22px] m-0 mb-1">{PASSOS[passo]}</h2>
                <p className="text-[13px] mt-0 mb-6" style={{ color: "var(--muted)" }}>
                  {passo === 0 && "Identifique o órgão ou entidade que utilizará a plataforma."}
                  {passo === 1 && "Crie a conta de administração do sistema. E-mail não é obrigatório."}
                  {passo === 2 && "Aponte a conexão com o banco PostgreSQL da rede interna."}
                  {passo === 3 && "Regionalização e padrões de numeração do atendimento de TI."}
                  {passo === 4 && "Métodos de acesso e políticas de segurança das contas."}
                  {passo === 5 && "Estrutura administrativa sugerida — tudo pode ser alterado depois."}
                  {passo === 6 && "Revise as configurações antes de concluir."}
                </p>

                {passo === 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">{input("Nome do Órgão / Entidade", "nome")}</div>
                    {input("CNPJ", "cnpj")}
                    <div className="grid grid-cols-[1fr_84px] gap-3">
                      {input("Município", "municipio")}
                      {input("UF", "uf")}
                    </div>
                    <div className="col-span-2">{input("Endereço", "endereco")}</div>
                  </div>
                )}

                {passo === 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">{input("Nome completo", "admNome")}</div>
                    {input("Usuário de acesso", "admUsuario")}
                    {input("Matrícula", "admMatricula")}
                    {input("Senha", "admSenha", "password")}
                    {input("Confirmar senha", "admConfirmar", "password")}
                  </div>
                )}

                {passo === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-[1fr_110px] gap-3">
                      {input("Servidor (IP ou nome)", "bdHost")}
                      {input("Porta", "bdPorta")}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {input("Banco de dados", "bdNome")}
                      {input("Usuário", "bdUsuario")}
                    </div>
                    {input("Senha", "bdSenha", "password", false)}
                    <div className="flex items-center gap-3">
                      <button className="btn btn-outline" onClick={testarConexao} disabled={testando}>
                        {testando ? <span className="inline-block w-4 h-4 rounded-full anim-spin" style={{ border: "2px solid var(--line-2)", borderTopColor: "var(--green)" }} /> : <Icon name="banco" size={16} />}
                        {testando ? "Testando conexão…" : "Testar Conexão"}
                      </button>
                      {conexaoOk && <ChipOk texto={`PostgreSQL ${dados.bdHost} acessível`} />}
                    </div>
                  </div>
                )}

                {passo === 3 && (
                  <div className="grid grid-cols-2 gap-4">
                    <Rotulo rotulo="Idioma do sistema">
                      <select className="select" value={dados.idioma} onChange={(e) => setDados({ ...dados, idioma: e.target.value })}>
                        <option value="pt-BR">Português (Brasil) — pt-BR</option>
                      </select>
                    </Rotulo>
                    <Rotulo rotulo="Fuso horário">
                      <select className="select" value={dados.fuso} onChange={(e) => setDados({ ...dados, fuso: e.target.value })}>
                        {["America/Sao_Paulo", "America/Manaus", "America/Fortaleza", "America/Noronha"].map((f) => <option key={f}>{f}</option>)}
                      </select>
                    </Rotulo>
                    <Rotulo rotulo="Moeda padrão">
                      <select className="select" value={dados.moeda} onChange={(e) => setDados({ ...dados, moeda: e.target.value })}>
                        <option value="BRL">R$ — Real brasileiro</option>
                        <option value="USD">US$ — Dólar americano</option>
                        <option value="EUR">€ — Euro</option>
                      </select>
                    </Rotulo>
                    <Rotulo rotulo="Formato de data">
                      <input className="input" value={dados.formatoData} disabled />
                    </Rotulo>
                    <Rotulo rotulo="Prefixo dos chamados de TI">
                      <input className="input" value={dados.prefixo} onChange={(e) => setDados({ ...dados, prefixo: e.target.value })} />
                    </Rotulo>
                    <div className="flex items-end pb-1 text-[11.5px]" style={{ color: "var(--muted)" }}>Exemplo de numeração: {dados.prefixo}-000001</div>
                  </div>
                )}

                {passo === 4 && (
                  <div className="space-y-3">
                    <Rotulo rotulo="Métodos de autenticação">
                      <div className="flex gap-2">
                        {[["ambos", "Usuário ou Matrícula + Senha"], ["usuario", "Somente Usuário + Senha"], ["matricula", "Somente Matrícula + Senha"]].map(([v, r]) => (
                          <button key={v} className={`btn ${dados.metodoLogin === v ? "btn-primary" : "btn-outline"} !py-2 text-[12px]`} onClick={() => setDados({ ...dados, metodoLogin: v })}>{r}</button>
                        ))}
                      </div>
                    </Rotulo>
                    <div className="card p-4 space-y-3 !shadow-none">
                      {[
                        ["mfa", "Verificação em duas etapas (MFA)", "Recomendada para perfis de gestão."],
                        ["senhaForte", "Política de senha forte", "Mínimo de 8 caracteres com complexidade."],
                        ["expiracao", "Expiração de sessão por inatividade", "Encerra sessões ociosas após 30 minutos."],
                        ["bloqueio", "Bloqueio por tentativas de login", "Bloqueio temporário após 5 falhas."],
                      ].map(([campo, rot, desc]) => (
                        <label key={campo} className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" className="mt-1" checked={(dados as unknown as Record<string, boolean>)[campo]} onChange={(e) => setDados({ ...dados, [campo]: e.target.checked })} style={{ accentColor: "var(--green)" }} />
                          <span>
                            <span className="block text-[13px] font-bold">{rot}</span>
                            <span className="block text-[11.5px]" style={{ color: "var(--muted)" }}>{desc}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="text-[11.5px] flex gap-1.5" style={{ color: "var(--muted)" }}>
                      <Icon name="info" size={13} className="mt-0.5 flex-none" /> Integrações com LDAP, Active Directory, Microsoft Entra ID e SSO poderão ser ativadas posteriormente.
                    </p>
                  </div>
                )}

                {passo === 5 && (
                  <div className="space-y-2.5">
                    {[
                      "Secretaria Municipal de Administração",
                      "Secretaria Municipal de Fazenda",
                      "Secretaria Municipal de Saúde",
                      "Secretaria Municipal de Educação",
                      "Secretaria Municipal de Turismo",
                      "Secretaria Municipal de Obras",
                    ].map((u, i) => (
                      <label key={u} className="flex items-center gap-3 card !shadow-none px-4 py-3 cursor-pointer hover:border-[var(--green)] transition-colors">
                        <input
                          type="checkbox" checked={dados.estruturas[i] ?? false}
                          onChange={(e) => { const arr = [...dados.estruturas]; arr[i] = e.target.checked; setDados({ ...dados, estruturas: arr }); }}
                          style={{ accentColor: "var(--green)" }}
                        />
                        <span className="text-[13px] font-semibold flex-1">{u}</span>
                        <span className="chip" style={{ background: "var(--grey-soft)", color: "var(--grey)" }}>Secretaria</span>
                      </label>
                    ))}
                    <p className="text-[11.5px] mt-2" style={{ color: "var(--muted)" }}>
                      Departamentos, divisões, setores e equipes podem ser criados livremente depois da instalação — sem limite de níveis hierárquicos.
                    </p>
                  </div>
                )}

                {passo === 6 && (
                  <div className="space-y-2.5">
                    {[
                      ["Órgão", dados.nome],
                      ["Administrador", `${dados.admNome} (${dados.admUsuario})`],
                      ["Banco de dados", `PostgreSQL ${dados.bdHost}:${dados.bdPorta}/${dados.bdNome}${conexaoOk ? " — conexão validada" : ""}`],
                      ["Regionalização", `${dados.idioma} · ${dados.fuso} · ${dados.moeda} · ${dados.formatoData}`],
                      ["Chamados de TI", `Prefixo ${dados.prefixo} · numeração automática`],
                      ["Autenticação", dados.metodoLogin === "ambos" ? "Usuário ou Matrícula + Senha" : dados.metodoLogin === "usuario" ? "Usuário + Senha" : "Matrícula + Senha"],
                      ["Estrutura inicial", `${dados.estruturas.filter(Boolean).length} secretarias municipais`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-4 py-2.5" style={{ borderBottom: "1px dashed var(--line)" }}>
                        <span className="w-[150px] flex-none text-[11px] font-bold uppercase tracking-wider pt-0.5" style={{ color: "var(--muted)" }}>{k}</span>
                        <span className="text-[13px] font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-8">
                  <button className="btn btn-ghost" onClick={() => setPasso(Math.max(0, passo - 1))} disabled={passo === 0 || instalando}>
                    <Icon name="chevron-e" size={15} /> Voltar
                  </button>
                  {passo < 6 ? (
                    <button className="btn btn-primary" onClick={() => podeAvancar ? setPasso(passo + 1) : toast("Preencha os campos obrigatórios", "vermelho", Object.values(erros)[0])} disabled={!podeAvancar}>
                      Avançar <Icon name="seta-d" size={15} />
                    </button>
                  ) : (
                    <button className="btn btn-accent" onClick={concluir} disabled={instalando}>
                      <Icon name="check" size={16} /> Concluir Instalação
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Fundo>
  );
}

function Rotulo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{rotulo}</span>
      {children}
    </label>
  );
}

function ChipOk({ texto }: { texto: string }) {
  return (
    <span className="chip anim-pop" style={{ background: "var(--green-soft)", color: "var(--green)" }}>
      <Icon name="check" size={12} /> {texto}
    </span>
  );
}

export function Login({ onEntrar }: { onEntrar: () => void }) {
  const { config } = useApp();
  const toast = useToast();
  const [metodo, setMetodo] = useState<"usuario" | "matricula">("usuario");
  const [ident, setIdent] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    const idv = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(idv);
  }, []);

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.style.setProperty("--deep", config.marca.corPrimaria);
    raiz.style.setProperty("--accent", config.marca.corAcento);
  }, [config.marca]);

  const entrar = (e: FormEvent) => {
    e.preventDefault();
    setErro("");
    if (!ident.trim() || !senha) { setErro(`Informe ${metodo === "usuario" ? "o usuário" : "a matrícula"} e a senha.`); return; }
    setCarregando(true);
    setTimeout(() => {
      setCarregando(false);
      toast("Sessão iniciada", "verde", "Bem-vindo(a) ao " + (config.marca.produto || "GovFlow"));
      onEntrar();
    }, 900);
  };

  return (
    <Fundo>
      <div className="w-full max-w-[1020px] grid md:grid-cols-[1.05fr_1fr] card overflow-hidden anim-rise" style={{ borderRadius: 14, boxShadow: "var(--shadow-2)", minHeight: 560 }}>
        {/* Painel institucional */}
        <div className="relative p-9 flex flex-col" style={{ background: "linear-gradient(170deg, var(--deep) 0%, #0e3527 100%)" }}>
          <div className="absolute top-0 left-0 right-0 hazard h-[6px]" />
          <div className="flex items-center gap-3.5 mt-2">
            {config.identidade.brasaoDataUrl && config.identidade.usoBrasao.includes("login")
              ? <img src={config.identidade.brasaoDataUrl} alt="Brasão" style={{ width: 54, height: 60, objectFit: "contain", background: "#fff", borderRadius: 8, padding: 3 }} />
              : <Brasao size={52} />}
            <div>
              <div className="font-display font-extrabold text-[30px] text-[#f4f7f2] leading-none tracking-tight">
                <Scramble texto={config.marca.produto || "GovFlow"} />
              </div>
              <div className="text-[11px] mt-1.5 leading-snug" style={{ color: "rgba(244,247,242,0.6)" }}>{config.marca.subtitulo}</div>
            </div>
          </div>
          <div className="mt-9 space-y-3.5 flex-1">
            {[
              ["organograma", "Estrutura administrativa dinâmica", "Secretarias, departamentos, divisões e setores configuráveis — sem código."],
              ["fone", "Central de Serviços de TI", "Chamados, catálogo de serviços, SLA e aprovações em múltiplos níveis."],
              ["caixa", "Patrimônio de TI sob controle", "Rede, domínio, histórico de IP, movimentações, manutenções e inventário."],
              ["chat", "Comunicação interna", "Canais, mensagens diretas e comunicados — tudo dentro da rede local."],
              ["escudo", "Auditoria e RBAC", "Perfis de acesso granulares e trilha de auditoria permanente."],
            ].map(([ic, t, d]) => (
              <div key={t} className="flex gap-3.5 items-start group">
                <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-none transition-transform group-hover:scale-110" style={{ background: "rgba(242,183,10,0.14)", color: "var(--accent)" }}>
                  <Icon name={ic} size={18} />
                </span>
                <div>
                  <div className="text-[13.5px] font-bold text-[#f4f7f2]">{t}</div>
                  <div className="text-[11.5px] leading-snug mt-0.5" style={{ color: "rgba(244,247,242,0.55)" }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12px] font-bold text-[#f4f7f2]">{config.orgao.nome}</div>
                <div className="text-[10.5px] mt-0.5" style={{ color: "rgba(244,247,242,0.5)" }}>{config.identidade.msgLogin || M.sistema.acesso}</div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-[17px] text-[#f4f7f2] tabular-nums leading-tight">
                  {agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>
                <div className="text-[10px]" style={{ color: "rgba(244,247,242,0.5)" }}>{fmtData(agora)} · America/Sao_Paulo</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold tracking-wider" style={{ color: "rgba(242,183,10,0.9)" }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-live" style={{ background: "var(--accent)" }} /> INTRANET · SEM NECESSIDADE DE INTERNET
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="p-9 flex flex-col justify-center">
          <h2 className="font-display font-extrabold text-[24px] m-0 tracking-tight">Acessar o sistema</h2>
          <p className="text-[13px] mt-1.5 mb-6" style={{ color: "var(--muted)" }}>Entre com suas credenciais funcionais. O e-mail não é obrigatório.</p>

          <div className="flex p-1 rounded-lg mb-5" style={{ background: "rgba(19,37,29,0.06)" }}>
            {([["usuario", "Usuário"], ["matricula", "Matrícula"]] as const).map(([v, r]) => (
              <button
                key={v} className="flex-1 py-2 rounded-md text-[12.5px] font-bold cursor-pointer border-0 transition-all"
                style={metodo === v ? { background: "var(--deep)", color: "#f4f7f2" } : { background: "transparent", color: "var(--muted)" }}
                onClick={() => { setMetodo(v); setIdent(""); setErro(""); }}
              >
                {r} + Senha
              </button>
            ))}
          </div>

          <form onSubmit={entrar} className="space-y-4">
            <label className="block">
              <span className="label">{metodo === "usuario" ? "Usuário" : "Matrícula funcional"}</span>
              <div className="relative">
                <Icon name="usuario" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  className="input pl-9" placeholder={metodo === "usuario" ? "ex.: ana.rocha" : "ex.: 2019-0045"}
                  value={ident} onChange={(e) => setIdent(e.target.value)} autoComplete="username"
                  style={erro ? { borderColor: "var(--red)" } : undefined}
                />
              </div>
            </label>
            <label className="block">
              <span className="label">Senha</span>
              <div className="relative">
                <Icon name="cadeado" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  className="input pl-9" type="password" placeholder="Sua senha de acesso"
                  value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password"
                  style={erro ? { borderColor: "var(--red)" } : undefined}
                />
              </div>
            </label>
            {erro && (
              <div className="text-[12px] font-semibold px-3.5 py-2.5 rounded-lg anim-pop" style={{ background: "var(--red-soft)", color: "var(--red)" }}>
                {erro}
              </div>
            )}
            <button className="btn btn-accent w-full !py-2.5 text-[13.5px]" type="submit" disabled={carregando}>
              {carregando
                ? <><span className="inline-block w-4 h-4 rounded-full anim-spin" style={{ border: "2px solid rgba(59,46,0,0.25)", borderTopColor: "var(--accent-ink)" }} /> Validando credenciais…</>
                : <><Icon name="sair" size={16} className="rotate-180" /> Entrar</>}
            </button>
          </form>

          <div className="mt-6 rounded-lg px-4 py-3 text-[11.5px] leading-relaxed" style={{ background: "var(--green-soft)", color: "var(--green)" }}>
            <strong>Ambiente de demonstração:</strong> utilize qualquer usuário e senha (mínimo 1 caractere), por exemplo <span className="kbd">ana.rocha</span> / <span className="kbd">123456</span> ou a matrícula <span className="kbd">2019-0045</span>.
          </div>

          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] font-semibold" style={{ color: "var(--muted)" }}>
            <span className="flex items-center gap-1"><Icon name="escudo" size={12} /> Sessões seguras</span>
            <span className="flex items-center gap-1"><Icon name="cadeado" size={12} /> Senhas com hash</span>
            <span className="flex items-center gap-1"><Icon name="relogio" size={12} /> Auditoria de acesso</span>
            <span className="flex items-center gap-1"><Icon name="banco" size={12} /> LDAP / AD prontos para ativar</span>
          </div>
        </div>
      </div>
    </Fundo>
  );
}
