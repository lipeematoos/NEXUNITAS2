import { FormEvent, useState } from "react";
import { M } from "../i18n";
import { Brasao, Campo, Chave, Icon } from "./ui";

/* ===================== Login ===================== */

export function Login({ onEntrar }: { onEntrar: () => void }) {
  const [aba, setAba] = useState<"usuario" | "matricula">("usuario");
  const [id, setId] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const entrar = (e: FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !senha.trim()) {
      setErro(`Informe ${aba === "usuario" ? "o usuário" : "a matrícula"} e a senha para continuar.`);
      return;
    }
    setErro("");
    setCarregando(true);
    setTimeout(onEntrar, 700);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-ambient noise">
      <aside
        className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: "linear-gradient(165deg, var(--deep-2) 0%, var(--deep) 70%)" }}
      >
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" aria-hidden="true">
          <defs>
            <pattern id="pcontorno" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M0 60c30-38 60-38 120 0M0 90c30-38 60-38 120 0M0 30c30-38 60-38 120 0" fill="none" stroke="#f2b70a" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pcontorno)" />
        </svg>
        <div className="relative">
          <div className="flex items-center gap-4">
            <Brasao size={62} />
            <div>
              <div className="font-display font-extrabold text-[30px] text-[#f4f7f2] leading-none tracking-tight">SIGA</div>
              <div className="text-[12px] mt-1.5" style={{ color: "rgba(244,247,242,0.6)" }}>{M.sistema.nome}</div>
            </div>
          </div>
        </div>
        <div className="relative max-w-[460px]">
          <div className="ovl mb-4" style={{ color: "rgba(242,183,10,0.9)" }}>{M.sistema.orgao}</div>
          <h2 className="font-display font-extrabold text-[40px] leading-[1.08] text-[#f4f7f2] m-0 tracking-tight">
            Projetos, tarefas e demandas da gestão pública em um só lugar.
          </h2>
          <p className="text-[14px] mt-4 leading-relaxed" style={{ color: "rgba(244,247,242,0.68)" }}>
            Acompanhe entregas das secretarias, atenda solicitações com SLA e mantenha a trilha de auditoria completa — conforme as boas práticas de governança.
          </p>
          <div className="flex gap-6 mt-8">
            {[["projetos", "8 projetos ativos"], ["demandas", "12 demandas em fila"], ["administracao", "Auditoria completa"]].map(([ic, tx]) => (
              <div key={ic} className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: "rgba(244,247,242,0.75)" }}>
                <span style={{ color: "#f2b70a" }}><Icon name={ic} size={17} /></span>{tx}
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-[11px]" style={{ color: "rgba(244,247,242,0.4)" }}>
          {M.sistema.versao} · {M.sistema.acesso} · Fuso America/Sao_Paulo
        </div>
      </aside>

      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] anim-rise">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <Brasao size={44} />
            <div>
              <div className="font-display font-extrabold text-[22px] leading-none">SIGA</div>
              <div className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>{M.sistema.nome}</div>
            </div>
          </div>
          <div className="ovl mb-2">Acesso ao sistema</div>
          <h1 className="font-display font-extrabold text-[28px] m-0 tracking-tight">Identifique-se</h1>
          <p className="text-[13px] mt-1.5 mb-6" style={{ color: "var(--muted)" }}>Utilize suas credenciais funcionais para acessar o painel.</p>

          <div className="flex gap-1 p-1 rounded-lg mb-5" style={{ background: "rgba(19,37,29,0.06)" }}>
            {([["usuario", "Usuário"], ["matricula", "Matrícula"]] as const).map(([k, r]) => (
              <button
                key={k} onClick={() => { setAba(k); setId(""); setErro(""); }}
                className="flex-1 py-2 rounded-md text-[13px] font-bold cursor-pointer border-0 transition-all"
                style={aba === k ? { background: "var(--card)", boxShadow: "var(--shadow-1)", color: "var(--ink)" } : { background: "transparent", color: "var(--muted)" }}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={entrar} className="space-y-4">
            <Campo rotulo={aba === "usuario" ? "Usuário" : "Matrícula"} obrigatorio>
              <div className="relative">
                <Icon name="usuario" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input className="input pl-9" placeholder={aba === "usuario" ? "ex.: ana.rocha" : "ex.: 2019-0045"} value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" />
              </div>
            </Campo>
            <Campo rotulo="Senha" obrigatorio>
              <div className="relative">
                <Icon name="cadeado" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input className="input pl-9" type="password" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
              </div>
            </Campo>
            {erro && (
              <div className="flex items-start gap-2 text-[12.5px] rounded-lg px-3 py-2.5 anim-pop" style={{ background: "var(--red-soft)", color: "var(--red)" }}>
                <Icon name="aviso" size={15} className="mt-0.5 flex-none" /> {erro}
              </div>
            )}
            <button className="btn btn-primary w-full !py-2.5 text-[14px]" disabled={carregando}>
              {carregando ? <span className="inline-block w-4 h-4 rounded-full border-2 border-white/40 border-t-white anim-spin" /> : <Icon name="sair" size={16} className="rotate-180" />}
              {carregando ? "Verificando credenciais…" : "Entrar"}
            </button>
          </form>

          <div className="mt-5 rounded-lg px-4 py-3 text-[12px] leading-relaxed" style={{ background: "var(--yellow-soft)", color: "var(--accent-ink)" }}>
            <strong>Ambiente de demonstração:</strong> utilize o usuário <strong>ana.rocha</strong> (ou a matrícula <strong>2019-0045</strong>) com qualquer senha.
          </div>
          <p className="text-[11px] text-center mt-6" style={{ color: "var(--muted)" }}>
            O acesso é registrado em auditoria. Em caso de esquecimento de senha, procure o DTI — ramal 6110.
          </p>
        </div>
      </main>
    </div>
  );
}

/* ===================== Assistente de Instalação ===================== */

const PASSOS = [
  "Dados do Órgão",
  "Administrador do Sistema",
  "Configuração do Banco de Dados",
  "Configurações Gerais",
  "Autenticação",
  "Estrutura Administrativa Inicial",
  "Finalizar Instalação",
];

export function AssistenteInstalacao({ onConcluir }: { onConcluir: () => void }) {
  const [passo, setPasso] = useState(0);
  const [dados, setDados] = useState({
    orgao: "Prefeitura Municipal de Cidade Exemplo", cnpj: "12.345.678/0001-90", uf: "SP", municipio: "Cidade Exemplo", endereco: "Praça Central, 100 — Centro",
    nome: "", email: "", usuario: "", matricula: "", senha: "", confirmar: "",
    sgbd: "PostgreSQL", host: "localhost", porta: "5432", base: "siga_producao", dbUsuario: "siga_app", dbSenha: "",
    idioma: "pt-BR", fuso: "America/Sao_Paulo", moeda: "BRL", formatoData: "DD/MM/YYYY",
    metodo: "usuario", mfa: true, senhaForte: true, bloqueio: true, sso: false,
  });
  const [secretarias, setSecretarias] = useState([
    "Secretaria Municipal de Administração", "Secretaria Municipal de Fazenda", "Secretaria Municipal de Educação",
    "Secretaria Municipal de Saúde", "Secretaria Municipal de Turismo", "Secretaria Municipal de Obras",
  ]);
  const [criarDepartamentos, setCriarDepartamentos] = useState(true);
  const [teste, setTeste] = useState<"ocioso" | "testando" | "ok">("ocioso");
  const [instalando, setInstalando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState("");

  const set = (k: string, v: string | boolean) => setDados((d) => ({ ...d, [k]: v }));

  const podeAvancar = (): boolean => {
    switch (passo) {
      case 0: return !!(dados.orgao && dados.municipio && dados.cnpj);
      case 1: return !!(dados.nome && dados.email && dados.usuario && dados.matricula && dados.senha && dados.senha === dados.confirmar);
      case 2: return !!(dados.host && dados.base && dados.dbUsuario);
      case 4: return true;
      case 5: return secretarias.length > 0;
      default: return true;
    }
  };

  const avancar = () => {
    if (!podeAvancar()) { setErro("Preencha os campos obrigatórios deste passo para continuar."); return; }
    setErro("");
    setPasso((p) => Math.min(6, p + 1));
  };

  const testarConexao = () => {
    setTeste("testando");
    setTimeout(() => setTeste("ok"), 1300);
  };

  const instalar = () => {
    setInstalando(true);
    setProgresso(0);
    const id = setInterval(() => {
      setProgresso((p) => {
        if (p >= 100) { clearInterval(id); setConcluido(true); return 100; }
        return p + 4 + Math.random() * 9;
      });
    }, 140);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[340px_1fr] bg-ambient noise">
      <aside className="hidden lg:flex flex-col p-8" style={{ background: "linear-gradient(178deg, var(--deep-2), var(--deep) 70%)", borderRight: "1px solid rgba(242,183,10,0.2)" }}>
        <div className="flex items-center gap-3 mb-10">
          <Brasao size={44} />
          <div>
            <div className="font-display font-extrabold text-[22px] text-[#f4f7f2] leading-none">SIGA</div>
            <div className="text-[10.5px] mt-1" style={{ color: "rgba(244,247,242,0.55)" }}>Assistente de Instalação</div>
          </div>
        </div>
        <ol className="space-y-1">
          {PASSOS.map((p, i) => {
            const feito = i < passo || concluido;
            const atual = i === passo && !concluido;
            return (
              <li key={p} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all" style={atual ? { background: "rgba(242,183,10,0.13)", boxShadow: "inset 3px 0 0 var(--accent)" } : undefined}>
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-none"
                  style={feito ? { background: "var(--accent)", color: "var(--accent-ink)" } : atual ? { border: "2px solid var(--accent)", color: "#f2b70a" } : { border: "1px solid rgba(244,247,242,0.25)", color: "rgba(244,247,242,0.45)" }}
                >
                  {feito ? <Icon name="check" size={12} /> : i + 1}
                </span>
                <span className="text-[12.5px] font-semibold" style={{ color: atual || feito ? "#f4f7f2" : "rgba(244,247,242,0.5)" }}>{p}</span>
              </li>
            );
          })}
        </ol>
        <div className="mt-auto text-[10.5px]" style={{ color: "rgba(244,247,242,0.4)" }}>
          {M.sistema.nome} · {M.sistema.versao}
        </div>
      </aside>

      <main className="flex items-start justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[620px] anim-rise" key={passo}>
          <div className="ovl mb-2 lg:hidden">Assistente de Instalação</div>
          <h1 className="font-display font-extrabold text-[30px] m-0 tracking-tight">{PASSOS[passo]}</h1>
          <p className="text-[13px] mt-1.5 mb-7" style={{ color: "var(--muted)" }}>
            Passo {passo + 1} de {PASSOS.length} — configure os parâmetros iniciais do sistema.
          </p>

          {erro && (
            <div className="flex items-center gap-2 text-[13px] rounded-lg px-4 py-3 mb-5 anim-pop" style={{ background: "var(--red-soft)", color: "var(--red)" }}>
              <Icon name="aviso" size={16} /> {erro}
            </div>
          )}

          {passo === 0 && (
            <div className="space-y-4">
              <Campo rotulo="Nome do Órgão / Entidade" obrigatorio>
                <input className="input" value={dados.orgao} onChange={(e) => set("orgao", e.target.value)} />
              </Campo>
              <div className="grid grid-cols-2 gap-4">
                <Campo rotulo="CNPJ" obrigatorio><input className="input" value={dados.cnpj} onChange={(e) => set("cnpj", e.target.value)} /></Campo>
                <Campo rotulo="UF"><select className="select" value={dados.uf} onChange={(e) => set("uf", e.target.value)}>{["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((u) => <option key={u}>{u}</option>)}</select></Campo>
              </div>
              <Campo rotulo="Município" obrigatorio><input className="input" value={dados.municipio} onChange={(e) => set("municipio", e.target.value)} /></Campo>
              <Campo rotulo="Endereço da sede"><input className="input" value={dados.endereco} onChange={(e) => set("endereco", e.target.value)} /></Campo>
            </div>
          )}

          {passo === 1 && (
            <div className="space-y-4">
              <Campo rotulo="Nome completo" obrigatorio><input className="input" placeholder="ex.: Carlos Eduardo Menezes" value={dados.nome} onChange={(e) => set("nome", e.target.value)} /></Campo>
              <div className="grid grid-cols-2 gap-4">
                <Campo rotulo="E-mail institucional" obrigatorio><input className="input" type="email" placeholder="nome@cidadeexemplo.gov.br" value={dados.email} onChange={(e) => set("email", e.target.value)} /></Campo>
                <Campo rotulo="Matrícula funcional" obrigatorio><input className="input" placeholder="ex.: 2011-0212" value={dados.matricula} onChange={(e) => set("matricula", e.target.value)} /></Campo>
              </div>
              <Campo rotulo="Usuário de acesso" obrigatorio><input className="input" placeholder="ex.: carlos.menezes" value={dados.usuario} onChange={(e) => set("usuario", e.target.value)} /></Campo>
              <div className="grid grid-cols-2 gap-4">
                <Campo rotulo="Senha" obrigatorio><input className="input" type="password" value={dados.senha} onChange={(e) => set("senha", e.target.value)} /></Campo>
                <Campo rotulo="Confirmar senha" obrigatorio><input className="input" type="password" value={dados.confirmar} onChange={(e) => set("confirmar", e.target.value)} /></Campo>
              </div>
              {dados.senha && dados.confirmar && dados.senha !== dados.confirmar && (
                <p className="text-[12px] m-0" style={{ color: "var(--red)" }}>As senhas informadas não conferem.</p>
              )}
            </div>
          )}

          {passo === 2 && (
            <div className="space-y-4">
              <Campo rotulo="Sistema Gerenciador de Banco de Dados">
                <select className="select" value={dados.sgbd} onChange={(e) => set("sgbd", e.target.value)}>{["PostgreSQL", "MySQL", "SQL Server", "Oracle"].map((s) => <option key={s}>{s}</option>)}</select>
              </Campo>
              <div className="grid grid-cols-[1fr_120px] gap-4">
                <Campo rotulo="Servidor (host)" obrigatorio><input className="input" value={dados.host} onChange={(e) => set("host", e.target.value)} /></Campo>
                <Campo rotulo="Porta"><input className="input" value={dados.porta} onChange={(e) => set("porta", e.target.value)} /></Campo>
              </div>
              <Campo rotulo="Nome da base de dados" obrigatorio><input className="input" value={dados.base} onChange={(e) => set("base", e.target.value)} /></Campo>
              <div className="grid grid-cols-2 gap-4">
                <Campo rotulo="Usuário da base" obrigatorio><input className="input" value={dados.dbUsuario} onChange={(e) => set("dbUsuario", e.target.value)} /></Campo>
                <Campo rotulo="Senha da base"><input className="input" type="password" value={dados.dbSenha} onChange={(e) => set("dbSenha", e.target.value)} /></Campo>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button className="btn btn-outline" onClick={testarConexao} disabled={teste === "testando"}>
                  {teste === "testando" ? <span className="inline-block w-4 h-4 rounded-full border-2 border-[var(--deep)]/30 border-t-[var(--deep)] anim-spin" /> : <Icon name="banco" size={16} />}
                  {teste === "ok" ? "Conectado" : "Testar Conexão"}
                </button>
                {teste === "ok" && (
                  <span className="flex items-center gap-1.5 text-[12.5px] font-bold anim-pop" style={{ color: "var(--green)" }}>
                    <Icon name="check" size={15} /> Conexão estabelecida em 0,4 s
                  </span>
                )}
              </div>
            </div>
          )}

          {passo === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Campo rotulo="Idioma do sistema">
                  <select className="select" value={dados.idioma} onChange={(e) => set("idioma", e.target.value)}>
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en" disabled>English (em breve)</option>
                    <option value="es" disabled>Español (em breve)</option>
                  </select>
                </Campo>
                <Campo rotulo="Fuso horário">
                  <select className="select" value={dados.fuso} onChange={(e) => set("fuso", e.target.value)}>{["America/Sao_Paulo", "America/Manaus", "America/Fortaleza", "America/Noronha"].map((f) => <option key={f}>{f}</option>)}</select>
                </Campo>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Campo rotulo="Moeda padrão">
                  <select className="select" value={dados.moeda} onChange={(e) => set("moeda", e.target.value)}>
                    <option value="BRL">R$ — Real brasileiro</option>
                    <option value="USD">US$ — Dólar americano</option>
                    <option value="EUR">€ — Euro</option>
                  </select>
                </Campo>
                <Campo rotulo="Formato de data">
                  <select className="select" value={dados.formatoData} onChange={(e) => set("formatoData", e.target.value)}>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (24/08/2026)</option>
                  </select>
                </Campo>
              </div>
              <div className="rounded-lg px-4 py-3 text-[12.5px]" style={{ background: "var(--blue-soft)", color: "var(--blue)" }}>
                <strong>Regionalização pt-BR:</strong> números no formato 1.250,50 e datas no fuso America/Sao_Paulo serão aplicados em todo o sistema.
              </div>
            </div>
          )}

          {passo === 4 && (
            <div className="space-y-2">
              <div className="ovl mb-3">Método principal de autenticação</div>
              {([["usuario", "Usuário + Senha", "Autenticação pelo nome de usuário institucional"], ["matricula", "Matrícula + Senha", "Autenticação pela matrícula funcional do servidor"]] as const).map(([k, r, d]) => (
                <button
                  key={k} onClick={() => set("metodo", k)}
                  className="w-full flex items-center gap-3 rounded-lg px-4 py-3.5 text-left cursor-pointer transition-all mb-2"
                  style={dados.metodo === k ? { background: "var(--green-soft)", border: "1.5px solid var(--green)" } : { background: "var(--card)", border: "1.5px solid var(--line-2)" }}
                >
                  <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-none" style={{ borderColor: dados.metodo === k ? "var(--green)" : "var(--line-2)" }}>
                    {dados.metodo === k && <span className="w-2 h-2 rounded-full" style={{ background: "var(--green)" }} />}
                  </span>
                  <span>
                    <span className="block text-[13.5px] font-bold">{r}</span>
                    <span className="block text-[12px]" style={{ color: "var(--muted)" }}>{d}</span>
                  </span>
                </button>
              ))}
              <div className="pt-3 space-y-1">
                <Chave ligado={dados.senhaForte} onChange={(v) => set("senhaForte", v)} rotulo="Exigir senha forte" desc="Mínimo de 8 caracteres com letras, números e símbolos." />
                <Chave ligado={dados.mfa} onChange={(v) => set("mfa", v)} rotulo="Verificação em duas etapas (MFA)" desc="Obrigatória para perfis Administrador e Gerente de Projeto." />
                <Chave ligado={dados.bloqueio} onChange={(v) => set("bloqueio", v)} rotulo="Bloqueio após 5 tentativas" desc="Conta bloqueada por 30 minutos após falhas consecutivas." />
                <Chave ligado={dados.sso} onChange={(v) => set("sso", v)} rotulo="Integração SSO (gov.br)" desc="Disponível em versão futura." />
              </div>
            </div>
          )}

          {passo === 5 && (
            <div className="space-y-3">
              <div className="ovl mb-1">Secretarias e unidades de nível superior</div>
              {secretarias.map((s, i) => (
                <div key={i} className="flex items-center gap-2 anim-pop">
                  <span style={{ color: "var(--green)" }}><Icon name="organograma" size={16} /></span>
                  <input className="input" value={s} onChange={(e) => setSecretarias((ls) => ls.map((x, j) => (j === i ? e.target.value : x)))} />
                  <button className="icon-btn" style={{ color: "var(--red)" }} onClick={() => setSecretarias((ls) => ls.filter((_, j) => j !== i))} aria-label="Remover unidade">
                    <Icon name="excluir" size={16} />
                  </button>
                </div>
              ))}
              <button className="btn btn-outline" onClick={() => setSecretarias((ls) => [...ls, "Nova Secretaria Municipal"])}>
                <Icon name="mais" size={15} /> Adicionar unidade
              </button>
              <div className="pt-2">
                <Chave
                  ligado={criarDepartamentos} onChange={setCriarDepartamentos}
                  rotulo="Criar departamentos padrão na Secretaria de Administração"
                  desc="Tecnologia da Informação, Recursos Humanos, Compras e Patrimônio."
                />
              </div>
            </div>
          )}

          {passo === 6 && !concluido && !instalando && (
            <div className="space-y-4">
              <div className="card p-5">
                <div className="ovl mb-3">Resumo da instalação</div>
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-[13px] m-0">
                  {[
                    ["Órgão", dados.orgao], ["Município", `${dados.municipio} / ${dados.uf}`],
                    ["Administrador", dados.nome || "—"], ["Usuário", dados.usuario || "—"],
                    ["Banco de dados", `${dados.sgbd} — ${dados.base}@${dados.host}:${dados.porta}`],
                    ["Autenticação", dados.metodo === "usuario" ? "Usuário + Senha" : "Matrícula + Senha"],
                    ["Idioma / Fuso", "Português (Brasil) · America/Sao_Paulo"], ["Unidades", `${secretarias.length} secretarias${criarDepartamentos ? " + 4 departamentos" : ""}`],
                  ].map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="font-bold" style={{ color: "var(--muted)" }}>{k}</dt>
                      <dd className="m-0 font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="rounded-lg px-4 py-3 text-[12.5px] flex gap-2" style={{ background: "var(--yellow-soft)", color: "var(--accent-ink)" }}>
                <Icon name="info" size={16} className="flex-none mt-0.5" />
                Ao concluir, as tabelas serão criadas, os dados de demonstração carregados e o acesso será redirecionado para a tela de login.
              </div>
              <button className="btn btn-accent w-full !py-3 text-[14px]" onClick={instalar}><Icon name="check" size={17} /> Concluir Instalação</button>
            </div>
          )}

          {passo === 6 && instalando && !concluido && (
            <div className="card p-8 text-center anim-pop">
              <span className="inline-block w-10 h-10 rounded-full border-[3px] border-[var(--deep)]/20 border-t-[var(--deep)] anim-spin mb-4" />
              <div className="font-display font-bold text-[17px]">Instalando o SIGA…</div>
              <p className="text-[12.5px] mt-1 mb-5" style={{ color: "var(--muted)" }}>Criando estrutura de dados, perfis de acesso e unidades administrativas.</p>
              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(19,37,29,0.1)" }}>
                <div className="h-full rounded-full transition-all duration-200" style={{ width: `${Math.min(100, progresso)}%`, background: "linear-gradient(90deg, var(--deep-3), var(--green))" }} />
              </div>
              <div className="text-[12px] font-bold mt-2 tabular-nums" style={{ color: "var(--muted)" }}>{Math.min(100, Math.round(progresso))}%</div>
            </div>
          )}

          {concluido && (
            <div className="card p-10 text-center anim-pop">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: "var(--green-soft)", color: "var(--green)" }}>
                <Icon name="check" size={32} />
              </span>
              <div className="font-display font-extrabold text-[24px] tracking-tight">Instalação concluída com sucesso</div>
              <p className="text-[13px] mt-2 mb-6 max-w-[420px] mx-auto" style={{ color: "var(--muted)" }}>
                O SIGA está configurado para <strong>{dados.orgao}</strong>. Estrutura administrativa, perfis de acesso e parâmetros regionais foram aplicados.
              </p>
              <button className="btn btn-primary !py-2.5 px-6" onClick={onConcluir}>Acessar o Sistema <Icon name="seta-d" size={16} /></button>
            </div>
          )}

          {passo < 6 && (
            <div className="flex items-center justify-between mt-8">
              <button className="btn btn-ghost" onClick={() => setPasso((p) => Math.max(0, p - 1))} disabled={passo === 0}>
                <Icon name="chevron-e" size={15} /> Voltar
              </button>
              <button className="btn btn-primary" onClick={avancar} disabled={!podeAvancar()}>
                Avançar <Icon name="chevron-d" size={15} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
