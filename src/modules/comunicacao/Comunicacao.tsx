import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Campo, Chip, Icon, Modal, Seletor, useToast } from "../../components/ui";
import { useApp } from "../../lib/store";
import { fmtData, fmtHora, isoData, tempoRel } from "../../lib/format";
import { AnexoMsg } from "../../lib/data";

const EMOJIS = ["👍", "✅", "🎉", "🙏", "👀", "😄", "🚀", "⚠️"];

const RESPOSTAS = [
  "Recebido! Vou verificar e retorno em instantes.",
  "Perfeito, obrigado pelo aviso.",
  "Já estou olhando isso. Te posiciono ainda hoje.",
  "De acordo. Podemos seguir dessa forma.",
  "Boa! Vou registrar no chamado para formalizar.",
];

function renderizarTexto(texto: string) {
  const partes = texto.split(/(@[A-ZÀ-Ú][\wÀ-ÿ .\-]*(?: [A-ZÀ-Ú][\wÀ-ÿ\-]+)?)/g);
  return partes.map((p, i) =>
    p.startsWith("@") ? (
      <strong key={i} style={{ color: "var(--green)", fontWeight: 700 }}>{p}</strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export default function Comunicacao() {
  const { canais, mensagens, usuarios, comunicados, atual, enviarMensagem, reagirMensagem, fixarMensagem, criarCanal, publicarComunicado, marcarComunicadoLido, unidades } = useApp();
  const toast = useToast();
  const [canalId, setCanalId] = useState("c3");
  const [aba, setAba] = useState<"canais" | "diretas" | "comunicados">("canais");
  const [texto, setTexto] = useState("");
  const [digitando, setDigitando] = useState<string | null>(null);
  const [salvas, setSalvas] = useState<string[]>([]);
  const [busca, setBusca] = useState("");
  const [modalCanal, setModalCanal] = useState(false);
  const [novoCanal, setNovoCanal] = useState({ nome: "", descricao: "", visibilidade: "Público", automatico: false });
  const [modalComunicado, setModalComunicado] = useState(false);
  const [novoComunicado, setNovoComunicado] = useState({ titulo: "", mensagem: "", alvo: "Toda a organização", prioridade: "Normal", expiraEm: isoData(7) });
  const [anexo, setAnexo] = useState<AnexoMsg | null>(null);
  const fimRef = useRef<HTMLDivElement>(null);
  const contadorResposta = useRef(0);

  const canal = canais.find((c) => c.id === canalId) ?? canais[0];
  const msgs = useMemo(
    () => mensagens.filter((m) => m.canalId === canalId).sort((a, b) => a.data.localeCompare(b.data)),
    [mensagens, canalId]
  );

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs.length, digitando]);

  const nomeDe = (id: string) => usuarios.find((u) => u.id === id);
  const outraPonta = (c: typeof canais[number]) => usuarios.find((u) => c.membros.includes(u.id) && u.id !== atual.id);

  const enviar = () => {
    const t = texto.trim();
    if (!t && !anexo) return;
    enviarMensagem(canalId, t || `Enviou um anexo: ${anexo?.nome}`, atual.id, anexo ? [anexo] : undefined);
    setTexto("");
    setAnexo(null);
    // Simulação de resposta em tempo real (ambiente de demonstração)
    const respondente = canal.direto ? outraPonta(canal) : usuarios.find((u) => u.id !== atual.id && u.id === "u5");
    if (respondente) {
      setTimeout(() => setDigitando(respondente.nome), 900);
      setTimeout(() => {
        setDigitando(null);
        const r = RESPOSTAS[contadorResposta.current % RESPOSTAS.length];
        contadorResposta.current++;
        enviarMensagem(canalId, r, respondente.id);
      }, 2600);
    }
  };

  const criarCanalSubmit = () => {
    const slug = novoCanal.nome.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-à-ú]/g, "");
    if (!slug) { toast("Informe o nome do canal", "vermelho"); return; }
    criarCanal({ nome: slug, descricao: novoCanal.descricao || `Canal ${novoCanal.visibilidade.toLowerCase()}`, visibilidade: novoCanal.visibilidade as "Público", membros: [atual.id] });
    toast("Canal criado", "verde", `#${slug}`);
    setModalCanal(false);
    setNovoCanal({ nome: "", descricao: "", visibilidade: "Público", automatico: false });
  };

  const publicar = () => {
    if (!novoComunicado.titulo.trim() || !novoComunicado.mensagem.trim()) { toast("Preencha título e mensagem", "vermelho"); return; }
    publicarComunicado({ titulo: novoComunicado.titulo.trim(), mensagem: novoComunicado.mensagem.trim(), autorId: atual.id, alvo: novoComunicado.alvo, prioridade: novoComunicado.prioridade as "Normal", expiraEm: novoComunicado.expiraEm });
    toast("Comunicado publicado", "verde", novoComunicado.titulo);
    setModalComunicado(false);
    setNovoComunicado({ titulo: "", mensagem: "", alvo: "Toda a organização", prioridade: "Normal", expiraEm: isoData(7) });
  };

  const canaisVisiveis = canais.filter((c) => !c.direto && (busca === "" || c.nome.includes(busca.toLowerCase())));
  const diretas = canais.filter((c) => c.direto);
  const fixadas = msgs.filter((m) => m.fixada);
  const msgsSalvas = mensagens.filter((m) => salvas.includes(m.id));
  const membrosCanal = usuarios.filter((u) => canal.membros.includes(u.id));

  return (
    <div className="card overflow-hidden flex" style={{ height: "calc(100vh - 148px)", minHeight: 520, boxShadow: "var(--shadow-1)" }}>
      {/* ===== Coluna 1: listas ===== */}
      <div className="w-[250px] flex-none flex flex-col" style={{ borderRight: "1px solid var(--line)", background: "rgba(19,37,29,0.025)" }}>
        <div className="p-3.5" style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="flex gap-1 mb-2.5" style={{ background: "rgba(19,37,29,0.06)", borderRadius: 8, padding: 3 }}>
            {([["canais", "Canais"], ["diretas", "Diretas"], ["comunicados", "Avisos"]] as const).map(([v, r]) => (
              <button key={v} className="flex-1 py-1.5 rounded-md text-[11.5px] font-bold cursor-pointer border-0 transition-all"
                style={aba === v ? { background: "var(--deep)", color: "#f4f7f2" } : { background: "transparent", color: "var(--muted)" }}
                onClick={() => setAba(v)}>{r}</button>
            ))}
          </div>
          {(aba === "canais" || aba === "diretas") && (
            <div className="relative">
              <Icon name="busca" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input className="input !py-1.5 !text-[12px] pl-8" placeholder={aba === "diretas" ? "Nome, matrícula, unidade…" : "Buscar canal…"} value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {aba === "canais" && (
            <>
              {canaisVisiveis.map((c) => {
                const naoLida = mensagens.filter((m) => m.canalId === c.id).length > 0;
                return (
                  <button key={c.id} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left cursor-pointer border-0 mb-0.5 transition-colors"
                    style={canalId === c.id ? { background: "var(--green-soft)" } : { background: "transparent" }}
                    onMouseEnter={(e) => { if (canalId !== c.id) (e.currentTarget as HTMLButtonElement).style.background = "rgba(19,37,29,0.05)"; }}
                    onMouseLeave={(e) => { if (canalId !== c.id) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    onClick={() => { setCanalId(c.id); setAba("canais"); }}>
                    <span className="font-display font-extrabold text-[14px]" style={{ color: canalId === c.id ? "var(--green)" : "var(--muted)" }}>#</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12.5px] font-bold truncate">{c.nome}</span>
                    </span>
                    <Icon name={c.visibilidade === "Privado" ? "cadeado" : c.visibilidade === "Restrito" ? "olho" : "chat"} size={13} className="opacity-40" />
                    {naoLida && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />}
                  </button>
                );
              })}
              <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left cursor-pointer border-0 mt-1 transition-colors hover:bg-[rgba(30,122,84,0.07)]"
                style={{ color: "var(--green)" }} onClick={() => setModalCanal(true)}>
                <Icon name="mais" size={14} /> <span className="text-[12px] font-bold">Novo Canal</span>
              </button>
            </>
          )}
          {aba === "diretas" && diretas.map((c) => {
            const u = outraPonta(c);
            return (
              <button key={c.id} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left cursor-pointer border-0 mb-0.5 transition-colors"
                style={canalId === c.id ? { background: "var(--green-soft)" } : { background: "transparent" }}
                onMouseEnter={(e) => { if (canalId !== c.id) (e.currentTarget as HTMLButtonElement).style.background = "rgba(19,37,29,0.05)"; }}
                onMouseLeave={(e) => { if (canalId !== c.id) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                onClick={() => setCanalId(c.id)}>
                <Avatar nome={u?.nome ?? "?"} size={28} />
                <span className="flex-1 min-w-0">
                  <span className="block text-[12.5px] font-bold truncate">{u?.nome}</span>
                  <span className="block text-[10.5px] truncate" style={{ color: "var(--muted)" }}>{unidades.find((un) => un.id === u?.unidadeId)?.sigla} · {u?.matricula}</span>
                </span>
                <span className="w-2 h-2 rounded-full flex-none" style={{ background: u?.ativo ? "var(--green)" : "var(--grey)" }} title={u?.ativo ? "Disponível" : "Ausente"} />
              </button>
            );
          })}
          {aba === "comunicados" && (
            <div className="space-y-2 p-1">
              {comunicados.map((c) => (
                <button key={c.id} className="w-full text-left card !shadow-none px-3 py-2.5 cursor-pointer hover:border-[var(--green)] transition-colors" onClick={() => marcarComunicadoLido(c.id, atual.id)}>
                  <div className="flex items-center gap-2 mb-1">
                    <Chip tom={c.prioridade === "Urgente" ? "vermelho" : c.prioridade === "Importante" ? "ambar" : "azul"} dot={false}>{c.prioridade}</Chip>
                    <span className="text-[10px]" style={{ color: "var(--muted)" }}>{fmtData(c.publicadaEm)}</span>
                  </div>
                  <div className="text-[12px] font-bold leading-snug">{c.titulo}</div>
                  <div className="mt-1.5 rounded-full h-1 overflow-hidden" style={{ background: "rgba(19,37,29,0.1)" }}>
                    <div className="h-full bar-anim" style={{ width: `${(c.lidoPor.length / Math.max(1, usuarios.filter((u) => u.ativo).length)) * 100}%`, background: "var(--green)" }} />
                  </div>
                  <div className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>Lido por {c.lidoPor.length} de {usuarios.filter((u) => u.ativo).length} servidores ativos</div>
                </button>
              ))}
              <button className="btn btn-outline w-full !py-2 text-[12px]" onClick={() => setModalComunicado(true)}>
                <Icon name="mais" size={14} /> Publicar Comunicado
              </button>
            </div>
          )}
        </div>
        <div className="p-3 text-[10.5px] flex items-center gap-1.5" style={{ borderTop: "1px solid var(--line)", color: "var(--muted)" }}>
          <span className="w-1.5 h-1.5 rounded-full pulse-live" style={{ background: "var(--green)" }} /> Conectado à rede interna · mensagens sincronizadas
        </div>
      </div>

      {/* ===== Coluna 2: conversa ===== */}
      {aba === "comunicados" ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-3.5 flex items-center gap-3" style={{ borderBottom: "1px solid var(--line)" }}>
            <span style={{ color: "var(--amber)" }}><Icon name="sino" size={18} /></span>
            <div>
              <div className="font-display font-bold text-[15px]">Comunicados internos</div>
              <div className="text-[11px]" style={{ color: "var(--muted)" }}>Publicações oficiais com controle de leitura e público-alvo</div>
            </div>
            <button className="btn btn-accent ml-auto !py-1.5 text-[12px]" onClick={() => setModalComunicado(true)}><Icon name="mais" size={14} /> Publicar Comunicado</button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {comunicados.map((c) => {
              const autor = nomeDe(c.autorId);
              const pct = Math.round((c.lidoPor.length / Math.max(1, usuarios.filter((u) => u.ativo).length)) * 100);
              return (
                <div key={c.id} className="card card-hover p-5" style={{ borderLeft: `4px solid ${c.prioridade === "Urgente" ? "var(--red)" : c.prioridade === "Importante" ? "var(--amber)" : "var(--blue)"}` }}>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Chip tom={c.prioridade === "Urgente" ? "vermelho" : c.prioridade === "Importante" ? "ambar" : "azul"}>{c.prioridade}</Chip>
                    <span className="text-[11px] font-bold" style={{ color: "var(--muted)" }}>Público-alvo: {c.alvo}</span>
                    <span className="text-[11px] ml-auto" style={{ color: "var(--muted)" }}>Expira em {fmtData(c.expiraEm)}</span>
                  </div>
                  <h3 className="font-display font-bold text-[17px] m-0 mb-1.5">{c.titulo}</h3>
                  <p className="text-[13px] leading-relaxed m-0 mb-3" style={{ color: "var(--muted)" }}>{c.mensagem}</p>
                  <div className="flex items-center gap-3 pt-3" style={{ borderTop: "1px dashed var(--line)" }}>
                    <Avatar nome={autor?.nome ?? "?"} size={26} />
                    <span className="text-[12px] font-bold">{autor?.nome}</span>
                    <span className="text-[11px]" style={{ color: "var(--muted)" }}>{fmtData(c.publicadaEm)} {fmtHora(c.publicadaEm)}</span>
                    <span className="ml-auto flex items-center gap-2 text-[11.5px] font-bold" style={{ color: "var(--green)" }}>
                      <Icon name="olho" size={14} /> {pct}% de leitura
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-3.5 flex items-center gap-3" style={{ borderBottom: "1px solid var(--line)" }}>
            <span className="font-display font-extrabold text-[19px]" style={{ color: canal.direto ? "var(--ink)" : "var(--green)" }}>{canal.direto ? "" : "#"}</span>
            <div className="min-w-0">
              <div className="font-display font-bold text-[15px] truncate">{canal.direto ? outraPonta(canal)?.nome : canal.nome}</div>
              <div className="text-[11px] truncate" style={{ color: "var(--muted)" }}>{canal.descricao}</div>
            </div>
            <span className="ml-auto flex items-center gap-1.5 text-[11.5px] font-bold" style={{ color: "var(--muted)" }}>
              <Icon name="equipes" size={14} /> {canal.membros.length} membros
            </span>
            <Chip tom={canal.visibilidade === "Privado" ? "cinza" : canal.visibilidade === "Restrito" ? "ambar" : "verde"} dot={false}>{canal.visibilidade}</Chip>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
            {msgs.map((m, i) => {
              const autor = nomeDe(m.autorId);
              const anterior = msgs[i - 1];
              const agrupada = anterior && anterior.autorId === m.autorId && m.data.slice(0, 10) === anterior.data.slice(0, 10);
              const salva = salvas.includes(m.id);
              return (
                <div key={m.id} className={`group relative flex gap-3 rounded-lg px-2.5 py-1.5 -mx-2.5 hover:bg-[rgba(19,37,29,0.035)] ${agrupada ? "mt-0" : "mt-3"}`}>
                  {agrupada ? (
                    <span className="w-[34px] flex-none text-right text-[9.5px] pt-1.5 tabular-nums opacity-0 group-hover:opacity-60">{fmtHora(m.data)}</span>
                  ) : (
                    <Avatar nome={autor?.nome ?? "?"} size={34} />
                  )}
                  <div className="min-w-0 flex-1">
                    {!agrupada && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-[13px] font-extrabold">{autor?.nome}</span>
                        <span className="text-[10.5px]" style={{ color: "var(--muted)" }}>{unidades.find((u) => u.id === autor?.unidadeId)?.sigla} · {fmtHora(m.data)}</span>
                        {m.fixada && <span className="chip" style={{ background: "var(--yellow-soft)", color: "var(--accent-ink)" }}><Icon name="carimbo" size={10} /> Fixada</span>}
                      </div>
                    )}
                    <div className="text-[13px] leading-relaxed break-words">{renderizarTexto(m.texto)}</div>
                    {m.anexos?.map((a, j) => (
                      <span key={j} className="inline-flex items-center gap-2 mt-1.5 rounded-lg px-3 py-2 text-[11.5px] font-bold" style={{ background: "var(--blue-soft)", color: "var(--blue)" }}>
                        <Icon name="documentos" size={14} /> {a.nome} <span className="opacity-70 font-semibold">{a.tamanho}</span>
                      </span>
                    ))}
                    {Object.keys(m.reacoes).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {Object.entries(m.reacoes).filter(([, us]) => us.length > 0).map(([emoji, us]) => (
                          <button key={emoji}
                            className="chip cursor-pointer border transition-transform hover:scale-110"
                            style={{
                              background: us.includes(atual.id) ? "var(--green-soft)" : "var(--grey-soft)",
                              color: us.includes(atual.id) ? "var(--green)" : "var(--grey)",
                              border: us.includes(atual.id) ? "1px solid var(--green)" : "1px solid transparent",
                            }}
                            onClick={() => reagirMensagem(m.id, emoji, atual.id)}
                            title={us.map((uid) => nomeDe(uid)?.nome ?? uid).join(", ")}
                          >
                            {emoji} {us.length}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="absolute right-2 -top-3 hidden group-hover:flex items-center gap-0.5 card !shadow-none px-1 py-0.5" style={{ background: "#fff" }}>
                    {EMOJIS.slice(0, 4).map((e) => (
                      <button key={e} className="icon-btn !w-7 !h-7 text-[13px]" onClick={() => reagirMensagem(m.id, e, atual.id)} aria-label={`Reagir ${e}`}>{e}</button>
                    ))}
                    <button className="icon-btn !w-7 !h-7" title={m.fixada ? "Desafixar" : "Fixar mensagem"} onClick={() => { fixarMensagem(m.id); toast(m.fixada ? "Mensagem desafixada" : "Mensagem fixada no canal", "ambar"); }} aria-label="Fixar">
                      <Icon name="carimbo" size={13} />
                    </button>
                    <button className="icon-btn !w-7 !h-7" title={salva ? "Remover das salvas" : "Salvar mensagem"} style={salva ? { color: "var(--accent-2)" } : undefined}
                      onClick={() => { setSalvas((s) => salva ? s.filter((x) => x !== m.id) : [...s, m.id]); toast(salva ? "Removida das salvas" : "Mensagem salva", "verde"); }} aria-label="Salvar">
                      <Icon name="documentos" size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
            {digitando && (
              <div className="flex items-center gap-2.5 mt-3 px-2.5 anim-fade">
                <Avatar nome={digitando} size={30} />
                <span className="flex items-center gap-1 rounded-full px-3 py-2" style={{ background: "rgba(19,37,29,0.06)" }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--muted)", animation: `pulse-dot 1.2s ease-in-out ${i * 0.18}s infinite` }} />
                  ))}
                  <span className="text-[11px] font-semibold ml-1.5" style={{ color: "var(--muted)" }}>{digitando.split(" ")[0]} está digitando…</span>
                </span>
              </div>
            )}
            <div ref={fimRef} />
          </div>

          <div className="px-5 pb-4">
            {anexo && (
              <div className="flex items-center gap-2 mb-2 anim-pop">
                <span className="chip" style={{ background: "var(--blue-soft)", color: "var(--blue)" }}>
                  <Icon name="documentos" size={12} /> {anexo.nome} ({anexo.tamanho})
                </span>
                <button className="icon-btn !w-6 !h-6" onClick={() => setAnexo(null)} aria-label="Remover anexo"><Icon name="fechar" size={12} /></button>
              </div>
            )}
            <div className="rounded-xl p-2 flex items-end gap-1.5" style={{ background: "#fff", border: "1px solid var(--line-2)" }}>
              <button className="icon-btn" title="Anexar arquivo (PDF, imagem…)" onClick={() => { setAnexo({ nome: "comprovante_assinatura.pdf", tamanho: "212 KB" }); toast("Arquivo anexado", "azul", "comprovante_assinatura.pdf"); }} aria-label="Anexar">
                <Icon name="documentos" size={17} />
              </button>
              <button className="icon-btn" title="Emoji" onClick={() => setTexto((t) => t + "👍")} aria-label="Emoji">
                <span className="text-[15px]">😊</span>
              </button>
              <textarea
                className="flex-1 resize-none outline-none border-0 bg-transparent text-[13px] font-medium py-2"
                style={{ color: "var(--ink)", maxHeight: 110 }}
                rows={1}
                placeholder={canal.direto ? `Mensagem para ${outraPonta(canal)?.nome.split(" ")[0]}…` : `Mensagem em #${canal.nome} — use @ para mencionar`}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
              />
              <button className="btn btn-primary !py-2 !px-3.5" onClick={enviar} disabled={!texto.trim() && !anexo}>
                <Icon name="enviar" size={15} /> Enviar
              </button>
            </div>
            <div className="text-[10.5px] mt-1.5 flex gap-3" style={{ color: "var(--muted)" }}>
              <span><span className="kbd">Enter</span> envia</span>
              <span><span className="kbd">Shift+Enter</span> quebra linha</span>
              <span>@ menciona um servidor</span>
            </div>
          </div>
        </div>
      )}

      {/* ===== Coluna 3: detalhes ===== */}
      {aba !== "comunicados" && (
        <div className="w-[240px] flex-none overflow-y-auto p-4 hidden xl:block" style={{ borderLeft: "1px solid var(--line)", background: "rgba(19,37,29,0.025)" }}>
          <div className="ovl mb-2.5">Membros — {membrosCanal.length}</div>
          <div className="space-y-1.5 mb-5">
            {membrosCanal.map((u) => (
              <div key={u.id} className="flex items-center gap-2">
                <Avatar nome={u.nome} size={24} />
                <span className="text-[12px] font-semibold truncate flex-1">{u.nome}</span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: u.ativo ? "var(--green)" : "var(--grey)" }} />
              </div>
            ))}
          </div>
          <div className="ovl mb-2.5">Fixadas — {fixadas.length}</div>
          <div className="space-y-1.5 mb-5">
            {fixadas.length === 0 && <p className="text-[11.5px] m-0" style={{ color: "var(--muted)" }}>Nenhuma mensagem fixada.</p>}
            {fixadas.map((m) => (
              <div key={m.id} className="rounded-lg px-3 py-2 text-[11.5px] leading-snug" style={{ background: "#fff", border: "1px solid var(--line)" }}>
                <span className="font-bold">{nomeDe(m.autorId)?.nome.split(" ")[0]}:</span> {m.texto.slice(0, 90)}{m.texto.length > 90 ? "…" : ""}
              </div>
            ))}
          </div>
          <div className="ovl mb-2.5">Salvas — {msgsSalvas.length}</div>
          <div className="space-y-1.5">
            {msgsSalvas.length === 0 && <p className="text-[11.5px] m-0" style={{ color: "var(--muted)" }}>Passe o mouse sobre uma mensagem e use o ícone de documento para salvá-la.</p>}
            {msgsSalvas.map((m) => (
              <div key={m.id} className="rounded-lg px-3 py-2 text-[11.5px] leading-snug" style={{ background: "var(--yellow-soft)" }}>
                <span className="font-bold">{nomeDe(m.autorId)?.nome.split(" ")[0]}:</span> {m.texto.slice(0, 90)}{m.texto.length > 90 ? "…" : ""}
                <span className="block text-[10px] mt-1" style={{ color: "var(--muted)" }}>{tempoRel(m.data)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modais */}
      <Modal aberto={modalCanal} onFechar={() => setModalCanal(false)} titulo="Novo Canal"
        rodape={<><button className="btn btn-outline" onClick={() => setModalCanal(false)}>Cancelar</button><button className="btn btn-primary" onClick={criarCanalSubmit}><Icon name="check" size={15} /> Criar canal</button></>}>
        <div className="space-y-4">
          <Campo rotulo="Nome do canal" obrigatorio>
            <input className="input" placeholder="ex.: orcamento-2027" value={novoCanal.nome} onChange={(e) => setNovoCanal({ ...novoCanal, nome: e.target.value })} />
          </Campo>
          <Campo rotulo="Descrição">
            <input className="input" placeholder="Assunto principal do canal" value={novoCanal.descricao} onChange={(e) => setNovoCanal({ ...novoCanal, descricao: e.target.value })} />
          </Campo>
          <Seletor rotulo="Visibilidade" valor={novoCanal.visibilidade} onChange={(v) => setNovoCanal({ ...novoCanal, visibilidade: v })} opcoes={["Público", "Restrito", "Privado"]} />
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" className="mt-0.5" checked={novoCanal.automatico} onChange={(e) => setNovoCanal({ ...novoCanal, automatico: e.target.checked })} style={{ accentColor: "var(--green)" }} />
            <span className="text-[12px]" style={{ color: "var(--muted)" }}>
              <strong style={{ color: "var(--ink)" }}>Canal automático:</strong> canais também podem ser criados automaticamente a partir de secretarias, departamentos, equipes e projetos (ex.: Equipe de Infraestrutura → #infraestrutura).
            </span>
          </label>
        </div>
      </Modal>

      <Modal aberto={modalComunicado} onFechar={() => setModalComunicado(false)} titulo="Publicar Comunicado" largo
        rodape={<><button className="btn btn-outline" onClick={() => setModalComunicado(false)}>Cancelar</button><button className="btn btn-accent" onClick={publicar}><Icon name="enviar" size={15} /> Publicar</button></>}>
        <div className="space-y-4">
          <Campo rotulo="Título" obrigatorio><input className="input" placeholder="ex.: Janela de manutenção — sistemas indisponíveis" value={novoComunicado.titulo} onChange={(e) => setNovoComunicado({ ...novoComunicado, titulo: e.target.value })} /></Campo>
          <Campo rotulo="Mensagem" obrigatorio><textarea className="textarea" rows={4} placeholder="Texto completo do comunicado…" value={novoComunicado.mensagem} onChange={(e) => setNovoComunicado({ ...novoComunicado, mensagem: e.target.value })} /></Campo>
          <div className="grid grid-cols-2 gap-4">
            <Seletor rotulo="Público-alvo" valor={novoComunicado.alvo} onChange={(v) => setNovoComunicado({ ...novoComunicado, alvo: v })}
              opcoes={["Toda a organização", ...unidades.filter((u) => u.id !== "un0").map((u) => u.nome)]} />
            <Seletor rotulo="Prioridade" valor={novoComunicado.prioridade} onChange={(v) => setNovoComunicado({ ...novoComunicado, prioridade: v })} opcoes={["Normal", "Importante", "Urgente"]} />
          </div>
          <Campo rotulo="Data de expiração"><input className="input" type="date" value={novoComunicado.expiraEm} onChange={(e) => setNovoComunicado({ ...novoComunicado, expiraEm: e.target.value })} /></Campo>
        </div>
      </Modal>
    </div>
  );
}
