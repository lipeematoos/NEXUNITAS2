import { useState } from "react";
import { Campo, Chip, Icon, Modal, useToast } from "../../components/ui";
import { fmtData, fmtDataHora, fmtNum } from "../../lib/format";
import { useApp } from "../../lib/store";

type SubAba = "tipos" | "fundos" | "licenciamento" | "config";

export default function AdminSistema() {
  const {
    tiposUnidade, setTiposUnidade, gestoras, fundos, unidades, usuarios, licenca, eventosLicenca,
    validarLicenca, importarLicenca, setLicencaStatus, exportarConfiguracao, modoRestrito, registrarAuditoria,
  } = useApp();
  const toast = useToast();
  const [aba, setAba] = useState<SubAba>("tipos");
  const [novoTipo, setNovoTipo] = useState("");
  const [modalImportar, setModalImportar] = useState(false);
  const [textoLicenca, setTextoLicenca] = useState("");

  const nomeDe = (id: string) => usuarios.find((u) => u.id === id)?.nome ?? "—";
  const unDe = (id: string) => unidades.find((u) => u.id === id);

  const statusCor = (s: string) => (s === "Ativa" ? "verde" : s === "Período de Tolerância" ? "ambar" : "vermelho") as "verde" | "ambar" | "vermelho";

  const baixarConfig = () => {
    const dados = exportarConfiguracao();
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "govflow_configuracao.json";
    a.click();
    URL.revokeObjectURL(url);
    registrarAuditoria("Exportação de configuração", "govflow_configuracao.json", "Estrutura, catálogo, regras e perfis exportados (sem senhas ou segredos)");
    toast("Configuração exportada", "verde", "govflow_configuracao.json — sem senhas ou chaves privadas");
  };

  return (
    <div>
      {modoRestrito && (
        <div className="mb-4 rounded-lg px-4 py-3 flex items-center gap-3 anim-pop" style={{ background: "var(--red-soft)", border: "1px solid var(--red)" }}>
          <Icon name="cadeado" size={19} className="text-[var(--red)]" />
          <div className="flex-1 text-[12.5px]">
            <strong style={{ color: "var(--red)" }}>Sistema em modo restrito por licenciamento.</strong>{" "}
            <span style={{ color: "var(--muted)" }}>Consultas, relatórios, backups e exportações permanecem liberados. Nenhum dado é excluído.</span>
          </div>
        </div>
      )}

      <div className="flex gap-1 mb-5 overflow-x-auto" style={{ borderBottom: "1px solid var(--line)" }}>
        {([["tipos", "Tipos de Unidade", "organograma"], ["fundos", "Fundos e Gestoras", "administracao"], ["licenciamento", "Licenciamento", "escudo"], ["config", "Configuração do Sistema", "configuracoes"]] as const).map(([k, r, ic]) => (
          <button key={k} className={`tab-btn ${aba === k ? "on" : ""}`} onClick={() => setAba(k)}>
            <span className="inline-flex items-center gap-1.5"><Icon name={ic} size={14} /> {r}</span>
          </button>
        ))}
      </div>

      {/* ===== Tipos de unidade ===== */}
      {aba === "tipos" && (
        <div className="grid lg:grid-cols-2 gap-4 items-start">
          <div className="card p-5">
            <div className="ovl mb-3">Tipos de unidade administrativa</div>
            <p className="text-[12px] mt-0 mb-4 leading-relaxed" style={{ color: "var(--muted)" }}>
              Cada município organiza-se de forma diferente. Crie, renomeie, reordene e desative tipos sem alterar o código do sistema.
            </p>
            <div className="space-y-2">
              {[...tiposUnidade].sort((a, b) => a.ordem - b.ordem).map((t, i, arr) => (
                <div key={t.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2" style={{ background: t.ativo ? "rgba(19,37,29,0.035)" : "rgba(19,37,29,0.02)", opacity: t.ativo ? 1 : 0.55 }}>
                  <span className="w-6 h-6 rounded flex items-center justify-center text-[10.5px] font-extrabold flex-none" style={{ background: "var(--grey-soft)", color: "var(--grey)" }}>{i + 1}</span>
                  <span className="flex-1 text-[13px] font-bold">{t.nome}</span>
                  <span className="text-[10.5px] tabular-nums" style={{ color: "var(--muted)" }}>{t.codigo}</span>
                  <button className="icon-btn !w-7 !h-7" aria-label="Subir" disabled={i === 0}
                    onClick={() => { const ord = [...arr]; const [x] = ord.splice(i, 1); ord.splice(i - 1, 0, x); setTiposUnidade(ord.map((tt, j) => ({ ...tt, ordem: j + 1 }))); }}>
                    <Icon name="chevron-b" size={14} className="rotate-180" />
                  </button>
                  <button className="icon-btn !w-7 !h-7" aria-label="Descer" disabled={i === arr.length - 1}
                    onClick={() => { const ord = [...arr]; const [x] = ord.splice(i, 1); ord.splice(i + 1, 0, x); setTiposUnidade(ord.map((tt, j) => ({ ...tt, ordem: j + 1 }))); }}>
                    <Icon name="chevron-b" size={14} />
                  </button>
                  <button className="chip border-0 cursor-pointer" style={{ background: t.ativo ? "var(--green-soft)" : "var(--grey-soft)", color: t.ativo ? "var(--green)" : "var(--grey)" }}
                    onClick={() => { setTiposUnidade(tiposUnidade.map((x) => x.id === t.id ? { ...x, ativo: !x.ativo } : x)); toast(t.ativo ? "Tipo desativado" : "Tipo ativado", t.ativo ? "ambar" : "verde", t.nome); }}>
                    {t.ativo ? "Ativo" : "Inativo"}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <div className="ovl mb-3">Novo tipo</div>
            <div className="flex gap-2">
              <input className="input" placeholder="ex.: Coordenadoria de Vigilância" value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)} />
              <button className="btn btn-accent flex-none" onClick={() => {
                if (!novoTipo.trim()) { toast("Informe o nome do tipo", "vermelho"); return; }
                setTiposUnidade([...tiposUnidade, { id: `tu${Date.now()}`, nome: novoTipo.trim(), codigo: novoTipo.trim().slice(0, 4).toUpperCase(), ordem: tiposUnidade.length + 1, ativo: true }]);
                registrarAuditoria("Criação de tipo de unidade", novoTipo.trim(), "Novo tipo disponível para a estrutura organizacional");
                toast("Tipo criado", "verde", novoTipo.trim());
                setNovoTipo("");
              }}><Icon name="mais" size={15} /> Criar</button>
            </div>
            <div className="mt-5">
              <div className="ovl mb-3">Hierarquia em uso</div>
              <div className="space-y-1.5">
                {["Prefeitura", "Secretaria", "Departamento", "Divisão", "Setor"].map((t, i) => (
                  <div key={t} className="flex items-center gap-2 text-[12.5px] font-semibold" style={{ paddingLeft: i * 18 }}>
                    <span className="w-2 h-2 rounded-sm" style={{ background: i === 0 ? "var(--accent)" : "var(--green)" }} />
                    {t} {i < 4 && <Icon name="chevron-b" size={12} className="opacity-40" />}
                  </div>
                ))}
              </div>
              <p className="text-[11px] mt-3 mb-0" style={{ color: "var(--muted)" }}>
                Profundidade ilimitada, prevenção de referência circular e herança de regras de atendimento da unidade superior.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== Fundos e gestoras ===== */}
      {aba === "fundos" && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {gestoras.map((g) => (
              <div key={g.id} className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-extrabold text-[13px]" style={{ background: "var(--deep)", color: "var(--accent)" }}>{g.sigla.slice(0, 3)}</span>
                  <Chip tom="cinza" dot={false}>{g.codigo}</Chip>
                </div>
                <h3 className="font-display font-bold text-[15.5px] m-0">{g.nome}</h3>
                <div className="text-[12px] mt-2 space-y-1">
                  <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Vinculada a</span><strong>{unDe(g.unidadeId)?.sigla}</strong></div>
                  <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Gestor</span><strong>{nomeDe(g.gestorId)}</strong></div>
                </div>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <div className="ovl mb-3">Fundos municipais</div>
            <div className="overflow-x-auto">
              <table className="tbl min-w-[620px]">
                <thead><tr><th>Fundo</th><th>Código</th><th>Unidade vinculada</th><th>Gestor</th><th>Situação</th></tr></thead>
                <tbody>
                  {fundos.map((f) => (
                    <tr key={f.id}>
                      <td className="font-bold text-[12.5px]">{f.nome}</td>
                      <td className="tabular-nums text-[12px]">{f.codigo}</td>
                      <td className="text-[12px]">{unDe(f.unidadeId)?.nome}</td>
                      <td className="text-[12px]">{nomeDe(f.gestorId)}</td>
                      <td><Chip tom={f.ativo ? "verde" : "cinza"}>{f.ativo ? "Ativo" : "Inativo"}</Chip></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11.5px] mt-3 mb-0" style={{ color: "var(--muted)" }}>
              Fundo próprio <strong>não implica</strong> equipe de TI própria: a unidade decide separadamente se possui domínio de atendimento (ex.: TI Saúde) ou se usa a TI Corporativa.
            </p>
          </div>
        </div>
      )}

      {/* ===== Licenciamento ===== */}
      {aba === "licenciamento" && (
        <div className="grid lg:grid-cols-2 gap-4 items-start">
          <div className="space-y-4">
            <div className="card overflow-hidden">
              <div className="hazard h-[5px]" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="ovl mb-1.5">Licença do produto</div>
                    <h3 className="font-display font-extrabold text-[18px] m-0">{licenca.produto}</h3>
                    <div className="text-[12.5px] mt-1" style={{ color: "var(--muted)" }}>{licenca.organizacao}</div>
                  </div>
                  <Chip tom={statusCor(licenca.status)}>{licenca.status}</Chip>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-4 text-[12.5px]">
                  {[
                    ["Identificador da instalação", <strong key="i" className="tabular-nums">{licenca.instalacaoId}</strong>],
                    ["Tipo de licença", licenca.tipo],
                    ["Ativação", fmtData(licenca.ativacao)],
                    ["Validade", fmtData(licenca.validade)],
                    ["Última validação", fmtData(licenca.ultimaValidacao)],
                    ["Período de tolerância", `${fmtNum(licenca.toleranciaDias)} dias`],
                  ].map(([k, v], i) => (
                    <div key={i}><div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{k}</div><div className="font-semibold mt-0.5">{v}</div></div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted)" }}>Módulos licenciados</div>
                  <div className="flex flex-wrap gap-1.5">
                    {licenca.modulos.map((m) => <Chip key={m} tom="pinho" dot={false}>{m}</Chip>)}
                  </div>
                </div>
                <div className="mt-4 pt-3 text-[11px] flex items-center gap-2" style={{ borderTop: "1px dashed var(--line)", color: "var(--muted)" }}>
                  <Icon name="escudo" size={13} /> Assinatura {licenca.assinatura} — validada localmente com chave pública embutida. A chave privada de assinatura nunca reside na instalação.
                </div>
              </div>
            </div>
            <div className="card p-5 space-y-2.5">
              <div className="ovl mb-1">Operações</div>
              <div className="grid sm:grid-cols-2 gap-2">
                <button className="btn btn-primary justify-start" onClick={() => { validarLicenca("Servidor de licenciamento (simulação online)"); toast("Licença validada", "verde", `Última validação: ${fmtDataHora(new Date().toISOString())}`); }}>
                  <Icon name="check" size={15} /> Validar agora
                </button>
                <button className="btn btn-outline justify-start" onClick={() => setModalImportar(true)}>
                  <Icon name="enviar" size={15} /> Importar arquivo .lic
                </button>
                <button className="btn btn-outline justify-start" style={{ color: "var(--amber)", borderColor: "var(--amber)" }} onClick={() => { setLicencaStatus("Expirada"); toast("Licença expirada (demonstração)", "ambar", "O modo restrito foi ativado preservando todos os dados."); }}>
                  <Icon name="relogio" size={15} /> Simular expiração
                </button>
                <button className="btn btn-outline justify-start" onClick={() => { setLicencaStatus("Ativa"); toast("Licença reativada", "verde", "Modo restrito desativado."); }}>
                  <Icon name="engrenagem" size={15} /> Reativar licença
                </button>
              </div>
              <p className="text-[11px] m-0 leading-relaxed" style={{ color: "var(--muted)" }}>
                Em modo restrito: login de administradores, consultas, relatórios, backups, exportações e ativação de licença permanecem disponíveis.
                O sistema <strong>nunca</strong> exclui dados, corrompe arquivos ou executa comandos remotos — revogação é apenas uma mudança de status com política predefinida.
              </p>
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--line)" }}>
              <div className="font-display font-bold text-[15px]">Auditoria de licenciamento</div>
              <div className="text-[11.5px]" style={{ color: "var(--muted)" }}>Ativação, validações, tolerância, expiração e revogação — registro imutável.</div>
            </div>
            <div className="overflow-x-auto">
              <table className="tbl min-w-[520px]">
                <thead><tr><th>Data/Hora</th><th>Evento</th><th>Status</th><th>Origem</th></tr></thead>
                <tbody>
                  {eventosLicenca.map((e) => (
                    <tr key={e.id}>
                      <td className="tabular-nums text-[12px] whitespace-nowrap font-bold">{fmtDataHora(e.data)}</td>
                      <td>
                        <div className="text-[12.5px] font-bold">{e.evento}</div>
                        <div className="text-[10.5px]" style={{ color: "var(--muted)" }}>{e.detalhe}</div>
                      </td>
                      <td><Chip tom={statusCor(e.status)} dot={false}>{e.status}</Chip></td>
                      <td className="text-[12px]" style={{ color: "var(--muted)" }}>{e.origem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== Configuração ===== */}
      {aba === "config" && (
        <div className="grid lg:grid-cols-2 gap-4 items-start">
          <div className="card p-5">
            <div className="ovl mb-3">Exportar configuração do sistema</div>
            <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
              Gera um arquivo JSON com a estrutura administrativa, tipos de unidade, catálogos de serviços, regras de roteamento,
              fluxos de aprovação, categorias de patrimônio e perfis de acesso — <strong>sem senhas, tokens ou chaves privadas</strong>.
              Ideal para replicar a implantação em outro município.
            </p>
            <button className="btn btn-primary mt-3" onClick={baixarConfig}><Icon name="baixar" size={15} /> Exportar govflow_configuracao.json</button>
          </div>
          <div className="card p-5">
            <div className="ovl mb-3">Importar configuração</div>
            <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
              Reaproveite um modelo padrão (ex.: “Template base — Prefeitura Municipal”) e personalize secretarias, fundos, equipes de TI,
              regras e perfis. Conflitos são validados antes da importação e nada é sobrescrito sem confirmação.
            </p>
            <button className="btn btn-outline mt-3" onClick={() => { toast("Arquivo validado", "verde", "Nenhum conflito encontrado — 142 definições prontas para importação (demonstração)."); registrarAuditoria("Validação de importação de configuração", "template_prefeitura.json", "142 definições, 0 conflitos"); }}>
              <Icon name="enviar" size={15} /> Selecionar arquivo JSON…
            </button>
            <div className="mt-4 rounded-lg px-4 py-3 text-[11.5px] flex gap-2" style={{ background: "var(--yellow-soft)", color: "var(--accent-ink)" }}>
              <Icon name="aviso" size={14} className="flex-none mt-0.5" />
              A importação é auditada e pode ser desfeita pelos snapshots de configuração anteriores.
            </div>
          </div>
        </div>
      )}

      {/* ===== Modal importar licença ===== */}
      <Modal aberto={modalImportar} onFechar={() => setModalImportar(false)} titulo="Importar arquivo de licença"
        rodape={<>
          <button className="btn btn-outline" onClick={() => setModalImportar(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => {
            const ok = importarLicenca(textoLicenca);
            toast(ok ? "Licença ativada" : "Arquivo rejeitado", ok ? "verde" : "vermelho", ok ? "Assinatura válida para esta instalação." : "Assinatura inválida ou identificador divergente.");
            if (ok) setModalImportar(false);
            setTextoLicenca("");
          }}><Icon name="check" size={15} /> Validar e ativar</button>
        </>}>
        <div className="space-y-3">
          <p className="text-[12.5px] m-0 leading-relaxed" style={{ color: "var(--muted)" }}>
            Em ambientes sem internet, importe o arquivo <strong>govflow-license.lic</strong> assinado pelo fornecedor.
            Para a demonstração, cole um conteúdo contendo <code className="kbd">GF-LIC::{licenca.instalacaoId}</code>.
          </p>
          <Campo rotulo="Conteúdo do arquivo .lic" obrigatorio>
            <textarea className="textarea font-mono !text-[11.5px]" rows={5} placeholder={`GF-LIC::${licenca.instalacaoId}::assinatura...`} value={textoLicenca} onChange={(e) => setTextoLicenca(e.target.value)} />
          </Campo>
        </div>
      </Modal>
    </div>
  );
}
