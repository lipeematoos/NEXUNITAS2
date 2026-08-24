import { useState } from "react";
import { Avatar, Barra, Chip, Icon, Reveal } from "../components/ui";
import { CabecalhoPagina } from "../components/shell";
import { Unidade } from "../lib/data";
import { fmtNum, fmtPct } from "../lib/format";
import { useApp } from "../lib/store";

/* ===================== Equipes ===================== */

export function Equipes() {
  const { equipes, usuarios, tarefas, unidades, projetos } = useApp();

  return (
    <div>
      <CabecalhoPagina
        titulo="Equipes"
        subtitulo={`${fmtNum(equipes.length)} equipes vinculadas ao Departamento de Tecnologia da Informação`}
      />
      <div className="grid md:grid-cols-2 gap-4">
        {equipes.map((eq, i) => {
          const membros = usuarios.filter((u) => eq.membroIds.includes(u.id));
          const lider = usuarios.find((u) => u.id === eq.liderId);
          const unid = unidades.find((u) => u.id === eq.unidadeId);
          const abertas = tarefas.filter((t) => eq.membroIds.includes(t.responsavelId) && t.status !== "Concluído");
          const projetosEq = projetos.filter((p) => p.equipeId === eq.id && !["Concluído", "Cancelado"].includes(p.status)).length;
          const cargaMax = Math.max(...membros.map((m) => abertas.filter((t) => t.responsavelId === m.id).length), 1);
          return (
            <Reveal key={eq.id} delay={i * 60}>
              <div className="card card-hover p-5 h-full">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="ovl mb-1.5">{unid?.sigla} · {unid?.nome}</div>
                    <h3 className="font-display font-bold text-[18px] m-0">{eq.nome}</h3>
                  </div>
                  <span className="w-10 h-10 rounded-lg flex items-center justify-center flex-none" style={{ background: "var(--deep)", color: "#f2b70a" }}>
                    <Icon name="equipes" size={20} />
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {eq.especialidades.map((e) => <Chip key={e} tom="verde" dot={false}>{e}</Chip>)}
                </div>
                <div className="space-y-3 mb-4">
                  {membros.map((m) => {
                    const carga = abertas.filter((t) => t.responsavelId === m.id).length;
                    return (
                      <div key={m.id} className="flex items-center gap-3">
                        <Avatar nome={m.nome} size={32} />
                        <div className="min-w-0 flex-1">
                          <div className="text-[12.5px] font-bold truncate">
                            {m.nome}
                            {m.id === lider?.id && <span className="ml-1.5 text-[9.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded align-middle" style={{ background: "var(--yellow-soft)", color: "var(--accent-ink)" }}>Responsável</span>}
                          </div>
                          <div className="text-[11px] truncate" style={{ color: "var(--muted)" }}>{m.cargo} · Ramal {m.ramal}</div>
                        </div>
                        <div className="w-[86px] flex-none">
                          <Barra valor={(carga / cargaMax) * 100} cor={carga >= 5 ? "var(--amber)" : "var(--green)"} altura={5} />
                          <div className="text-[10px] font-bold text-right mt-0.5 tabular-nums" style={{ color: "var(--muted)" }}>{fmtNum(carga)} abertas</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 pt-3 text-[12px] font-bold" style={{ borderTop: "1px dashed var(--line)", color: "var(--muted)" }}>
                  <span className="flex items-center gap-1.5"><Icon name="tarefas" size={14} /> {fmtNum(abertas.length)} tarefas abertas</span>
                  <span className="flex items-center gap-1.5"><Icon name="projetos" size={14} /> {fmtNum(projetosEq)} projetos ativos</span>
                  <span className="ml-auto flex items-center gap-1" style={{ color: "var(--green)" }}><Icon name="indicadores" size={14} /> Carga {fmtPct(Math.round((abertas.length / (membros.length * 6)) * 100))}</span>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== Organograma ===================== */

function NoUnidade({ unidade, profundidade }: { unidade: Unidade; profundidade: number }) {
  const { unidades, usuarios, tarefas } = useApp();
  const [aberto, setAberto] = useState(profundidade < 2);
  const filhos = unidades.filter((u) => u.parentId === unidade.id);
  const resp = usuarios.find((u) => u.id === unidade.responsavelId);
  const ehRaiz = profundidade === 0;

  return (
    <div>
      <div className="flex items-stretch gap-0">
        {profundidade > 0 && (
          <div className="flex-none relative" style={{ width: 22 }}>
            <span className="absolute left-0 top-0 bottom-0 w-px" style={{ background: "var(--line-2)" }} />
            <span className="absolute left-0 top-[22px] w-full h-px" style={{ background: "var(--line-2)" }} />
          </div>
        )}
        <button
          onClick={() => setAberto(!aberto)}
          className={`card card-hover flex items-center gap-3 px-4 py-3 my-1.5 text-left cursor-pointer flex-1 max-w-[560px] ${ehRaiz ? "" : ""}`}
          style={ehRaiz ? { background: "var(--deep)", borderColor: "var(--deep)" } : undefined}
        >
          <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-none" style={ehRaiz ? { background: "rgba(242,183,10,0.18)", color: "#f2b70a" } : { background: "var(--green-soft)", color: "var(--green)" }}>
            <Icon name={unidade.tipo === "Órgão" ? "administracao" : unidade.tipo === "Secretaria" ? "organograma" : "equipes"} size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 flex-wrap">
              <span className={`font-display font-bold text-[14px] ${ehRaiz ? "text-[#f4f7f2]" : ""}`}>{unidade.nome}</span>
              <Chip tom={unidade.tipo === "Secretaria" ? "azul" : unidade.tipo === "Órgão" ? "amarelo" : "verde"} dot={false}>{unidade.tipo}</Chip>
            </span>
            <span className={`block text-[11.5px] mt-0.5 ${ehRaiz ? "text-[rgba(244,247,242,0.65)]" : ""}`} style={ehRaiz ? undefined : { color: "var(--muted)" }}>
              {unidade.sigla} · Ramal {unidade.ramal ?? "—"}
              {resp && <> · Resp.: {resp.nome.split(" ").slice(0, 2).join(" ")}</>}
            </span>
          </span>
          {filhos.length > 0 && (
            <span className="flex-none icon-btn !w-7 !h-7" style={ehRaiz ? { color: "#f2b70a" } : undefined} aria-label={aberto ? "Recolher" : "Expandir"}>
              <Icon name={aberto ? "chevron-b" : "chevron-d"} size={15} />
            </span>
          )}
        </button>
      </div>
      {aberto && filhos.length > 0 && (
        <div className="ml-3 anim-fade">
          {filhos.map((f) => <NoUnidade key={f.id} unidade={f} profundidade={profundidade + 1} />)}
        </div>
      )}
    </div>
  );
}

export function Organograma() {
  const { unidades, usuarios } = useApp();
  const raiz = unidades.find((u) => u.parentId === null)!;
  const secretarias = unidades.filter((u) => u.tipo === "Secretaria");

  return (
    <div>
      <CabecalhoPagina
        titulo="Organograma"
        subtitulo={`Estrutura administrativa de ${raiz.nome} · ${fmtNum(unidades.length)} unidades cadastradas`}
      />
      <div className="grid lg:grid-cols-[1fr_290px] gap-4 items-start">
        <Reveal>
          <div className="card p-5 overflow-x-auto">
            <NoUnidade unidade={raiz} profundidade={0} />
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="card p-5 space-y-4">
            <div className="ovl">Resumo da estrutura</div>
            {[
              ["Secretarias", secretarias.length],
              ["Departamentos", unidades.filter((u) => u.tipo === "Departamento").length],
              ["Divisões", unidades.filter((u) => u.tipo === "Divisão").length],
              ["Setores", unidades.filter((u) => u.tipo === "Setor").length],
              ["Servidores cadastrados", usuarios.length],
              ["Servidores ativos", usuarios.filter((u) => u.ativo).length],
            ].map(([k, v]) => (
              <div key={k as string} className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted)" }}>{k}</span>
                <span className="font-display font-extrabold text-[17px] tabular-nums">{fmtNum(v as number)}</span>
              </div>
            ))}
            <div className="pt-3 text-[11.5px] leading-relaxed" style={{ borderTop: "1px dashed var(--line)", color: "var(--muted)" }}>
              Clique nas unidades para expandir ou recolher os níveis subordinados. A lotação dos servidores segue esta estrutura.
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
