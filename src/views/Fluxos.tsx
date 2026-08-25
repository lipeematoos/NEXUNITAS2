import { useState } from "react";
import { Chave, Chip, Icon, Reveal, useToast } from "../components/ui";
import { CabecalhoPagina } from "../components/shell";
import { Fluxo } from "../lib/data";
import { fmtNum } from "../lib/format";
import { useApp } from "../lib/store";

function CartaoFluxo({ fluxo }: { fluxo: Fluxo }) {
  const { atualizarFluxo } = useApp();
  const toast = useToast();
  const [expandido, setExpandido] = useState(fluxo.id === "f1");

  const setEtapa = (idEtapa: string, campo: "nome" | "papel" | "slaHoras", valor: string) => {
    atualizarFluxo(fluxo.id, {
      etapas: fluxo.etapas.map((e) => (e.id === idEtapa ? { ...e, [campo]: campo === "slaHoras" ? Number(valor) || 0 : valor } : e)),
    });
  };
  const removerEtapa = (idEtapa: string) => {
    atualizarFluxo(fluxo.id, { etapas: fluxo.etapas.filter((e) => e.id !== idEtapa) });
    toast("Etapa removida", "ambar", fluxo.nome);
  };
  const adicionarEtapa = () => {
    atualizarFluxo(fluxo.id, { etapas: [...fluxo.etapas, { id: `${fluxo.id}e${fluxo.etapas.length + 1}x`, nome: "Nova etapa", papel: "A definir", slaHoras: 24 }] });
    toast("Etapa adicionada", "verde", fluxo.nome);
  };

  return (
    <Reveal>
      <div className="card overflow-hidden" style={{ opacity: fluxo.ativo ? 1 : 0.75 }}>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-none" style={{ background: fluxo.ativo ? "var(--green-soft)" : "var(--grey-soft)", color: fluxo.ativo ? "var(--green)" : "var(--grey)" }}>
            <Icon name="fluxos" size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-bold text-[16px] m-0">{fluxo.nome}</h3>
              <Chip tom={fluxo.ativo ? "verde" : "cinza"}>{fluxo.ativo ? "Ativo" : "Inativo"}</Chip>
            </div>
            <p className="text-[12px] m-0 mt-0.5" style={{ color: "var(--muted)" }}>{fluxo.descricao}</p>
          </div>
          <div className="text-right mr-1 hidden sm:block">
            <div className="font-display font-extrabold text-[20px] leading-none tabular-nums">{fmtNum(fluxo.instancias)}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Instâncias em andamento</div>
          </div>
          <div className="w-[130px] flex-none" style={{ borderBottom: "1px solid var(--line)" }}>
            <Chave ligado={fluxo.ativo} onChange={(v) => { atualizarFluxo(fluxo.id, { ativo: v }); toast(v ? "Fluxo ativado" : "Fluxo desativado", v ? "verde" : "ambar", fluxo.nome); }} rotulo="" />
          </div>
          <button className="btn btn-outline !py-1.5 text-[12px]" onClick={() => setExpandido(!expandido)}>
            {expandido ? "Recolher" : "Editar etapas"} <Icon name={expandido ? "chevron-b" : "chevron-d"} size={14} />
          </button>
        </div>

        {/* Cadeia de etapas (visão compacta) */}
        <div className="px-5 pb-4 overflow-x-auto">
          <div className="flex items-center min-w-max gap-0">
            {fluxo.etapas.map((e, i) => (
              <div key={e.id} className="flex items-center">
                <div
                  className="px-3.5 py-2 rounded-lg text-[12px] font-bold whitespace-nowrap transition-transform hover:-translate-y-0.5"
                  style={{
                    background: i === 0 ? "var(--grey-soft)" : i === fluxo.etapas.length - 1 ? "var(--green-soft)" : "var(--yellow-soft)",
                    color: i === fluxo.etapas.length - 1 ? "var(--green)" : "var(--ink)",
                    border: "1px solid var(--line)",
                  }}
                >
                  {e.nome}
                  {e.slaHoras > 0 && <span className="block text-[9.5px] font-semibold opacity-70">SLA {fmtNum(e.slaHoras)} h</span>}
                </div>
                {i < fluxo.etapas.length - 1 && (
                  <svg width="34" height="12" viewBox="0 0 34 12" className="mx-0.5 flex-none" aria-hidden="true">
                    <path d="M0 6h26m0 0-5-4.5M26 6l-5 4.5" stroke="var(--line-2)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Editor de etapas */}
        {expandido && (
          <div className="px-5 py-4 anim-fade" style={{ background: "rgba(19,37,29,0.03)", borderTop: "1px solid var(--line)" }}>
            <div className="ovl mb-3">Etapas do fluxo — edição</div>
            <div className="space-y-2.5">
              {fluxo.etapas.map((e, i) => (
                <div key={e.id} className="grid grid-cols-[28px_1fr_1fr_110px_36px] gap-2 items-center">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold" style={{ background: "var(--deep)", color: "#f2b70a" }}>{i + 1}</span>
                  <input className="input !py-1.5 text-[12.5px]" value={e.nome} onChange={(ev) => setEtapa(e.id, "nome", ev.target.value)} aria-label="Nome da etapa" />
                  <input className="input !py-1.5 text-[12.5px]" value={e.papel} onChange={(ev) => setEtapa(e.id, "papel", ev.target.value)} aria-label="Papel responsável" />
                  <div className="relative">
                    <input className="input !py-1.5 text-[12.5px] pr-8" type="number" min={0} value={e.slaHoras} onChange={(ev) => setEtapa(e.id, "slaHoras", ev.target.value)} aria-label="SLA em horas" />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10.5px] font-bold" style={{ color: "var(--muted)" }}>h</span>
                  </div>
                  <button className="icon-btn" style={{ color: "var(--red)" }} onClick={() => removerEtapa(e.id)} aria-label="Remover etapa" disabled={fluxo.etapas.length <= 2}>
                    <Icon name="excluir" size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button className="btn btn-outline mt-3 !py-1.5 text-[12px]" onClick={adicionarEtapa}>
              <Icon name="mais" size={14} /> Nova Etapa
            </button>
            <p className="text-[11px] mt-2.5 mb-0" style={{ color: "var(--muted)" }}>
              As alterações são gravadas automaticamente e registradas no Registro de Auditoria.
            </p>
          </div>
        )}
      </div>
    </Reveal>
  );
}

export default function Fluxos() {
  const { fluxos, demandas } = useApp();
  const ativas = demandas.filter((d) => !["Concluída", "Recusada", "Cancelada"].includes(d.status)).length;

  return (
    <div>
      <CabecalhoPagina
        titulo="Fluxos de Trabalho"
        subtitulo={`${fmtNum(fluxos.filter((f) => f.ativo).length)} fluxos ativos · ${fmtNum(ativas)} instâncias de demanda em tramitação`}
      />
      <div className="space-y-4">
        {fluxos.map((f) => <CartaoFluxo key={f.id} fluxo={f} />)}
      </div>
      <div className="card px-5 py-4 mt-5 flex items-start gap-3">
        <span className="mt-0.5" style={{ color: "var(--blue)" }}><Icon name="info" size={18} /></span>
        <p className="text-[12.5px] leading-relaxed m-0" style={{ color: "var(--muted)" }}>
          Os fluxos definem o caminho obrigatório de tramitação das demandas e processos. O SLA de cada etapa alimenta o indicador de
          cumprimento por equipe e as notificações de prazo. Papéis sugeridos: <strong>Solicitante</strong>, <strong>Responsável pela Equipe</strong>,
          <strong> Gerente de Projeto</strong>, <strong>Responsável pela Unidade</strong>.
        </p>
      </div>
    </div>
  );
}
