import { useState } from "react";
import { AssistenteInstalacao, Login } from "./components/Acesso";
import { Shell, ViewKey } from "./components/shell";
import { ToastProvider } from "./components/ui";
import { AppProvider } from "./lib/store";
import Painel from "./views/Painel";
import MinhaArea from "./views/MinhaArea";
import Projetos from "./views/Projetos";
import Tarefas from "./views/Tarefas";
import Demandas from "./views/Demandas";
import Fluxos from "./views/Fluxos";
import { Equipes, Organograma } from "./views/Estrutura";
import { Calendario, Documentos } from "./views/Calendario";
import { Indicadores, Relatorios } from "./views/Analise";
import Riscos from "./views/Riscos";
import { Administracao, Configuracoes } from "./views/Sistema";

type Etapa = "instalacao" | "login" | "sistema";

function etapaInicial(): Etapa {
  try {
    if (!localStorage.getItem("siga.instalado")) return "instalacao";
    return localStorage.getItem("siga.sessao") ? "sistema" : "login";
  } catch {
    return "login";
  }
}

function guardar(chave: string, valor: string | null) {
  try {
    if (valor === null) localStorage.removeItem(chave);
    else localStorage.setItem(chave, valor);
  } catch {
    /* armazenamento indisponível */
  }
}

export default function App() {
  const [etapa, setEtapa] = useState<Etapa>(etapaInicial);
  const [view, setView] = useState<ViewKey>("painel");

  const irPara = (v: string) => setView(v as ViewKey);

  return (
    <AppProvider>
      <ToastProvider>
        {etapa === "instalacao" && (
          <AssistenteInstalacao
            onConcluir={() => {
              guardar("siga.instalado", "1");
              setEtapa("login");
            }}
          />
        )}
        {etapa === "login" && (
          <Login
            onEntrar={() => {
              guardar("siga.sessao", "1");
              setEtapa("sistema");
            }}
          />
        )}
        {etapa === "sistema" && (
          <Shell
            view={view}
            irPara={(v) => setView(v)}
            onLogout={() => {
              guardar("siga.sessao", null);
              setEtapa("login");
            }}
          >
            {view === "painel" && <Painel irPara={irPara} />}
            {view === "minha-area" && <MinhaArea />}
            {view === "projetos" && <Projetos />}
            {view === "tarefas" && <Tarefas />}
            {view === "demandas" && <Demandas />}
            {view === "fluxos" && <Fluxos />}
            {view === "equipes" && <Equipes />}
            {view === "organograma" && <Organograma />}
            {view === "calendario" && <Calendario />}
            {view === "documentos" && <Documentos />}
            {view === "indicadores" && <Indicadores />}
            {view === "riscos" && <Riscos />}
            {view === "relatorios" && <Relatorios />}
            {view === "administracao" && <Administracao />}
            {view === "configuracoes" && (
              <Configuracoes
                onRefazerInstalacao={() => {
                  guardar("siga.instalado", null);
                  setEtapa("instalacao");
                }}
              />
            )}
          </Shell>
        )}
      </ToastProvider>
    </AppProvider>
  );
}
