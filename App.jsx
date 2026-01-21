import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import Cabecalho from "./componentes/Cabecalho";
import Rodape from "./componentes/Rodape";
import RodapeLogin from "./componentes/RodapeLogin";

import { supabase } from "./servicos/supabase";

import Dashboard from "./paginas/Dashboard";
import Pacientes from "./paginas/Pacientes";
import Pagamentos from "./paginas/Pagamentos";
import PacienteDetalhe from "./paginas/PacienteDetalhe";
import PacienteNovo from "./paginas/PacienteNovo";
import ReciboPaciente from "./paginas/ReciboPaciente";
import Login from "./paginas/Login";
import Configuracoes from "./paginas/Configuracoes";

function RotaPrivada({ children }) {
  const logado = Boolean(localStorage.getItem("usuario_id"));
  return logado ? children : <Navigate to="/login" replace />;
}

function AppConteudo() {
  const location = useLocation();
  const logado = Boolean(localStorage.getItem("usuario_id"));
  const estaNoLogin = location.pathname === "/login";

  const [profissionalNome, setProfissionalNome] = useState("");
  const [carregandoTopo, setCarregandoTopo] = useState(false);

  useEffect(() => {
    if (!logado) {
      setProfissionalNome("");
      return;
    }

    carregarProfissionalCabecalho();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logado]);

  async function carregarProfissionalCabecalho() {
    try {
      setCarregandoTopo(true);

      const profissionalId = localStorage.getItem("profissional_id");

      // se não tiver profissional_id, não tenta buscar
      if (
        !profissionalId ||
        profissionalId === "null" ||
        profissionalId === "undefined"
      ) {
        setProfissionalNome("Profissional");
        return;
      }

      // busca direto pelo profissional_id salvo na sessão
      const { data: prof, error: erroProf } = await supabase
        .from("profissionais")
        .select("id, nome")
        .eq("id", Number(profissionalId))
        .maybeSingle(); // ✅ não quebra se não achar

      if (erroProf) {
        console.error("Erro ao buscar profissional:", erroProf);
        setProfissionalNome("Profissional");
        return;
      }

      if (!prof) {
        // não encontrou o profissional (id inválido)
        setProfissionalNome("Profissional");
        return;
      }

      setProfissionalNome(prof.nome || "Profissional");
    } catch (e) {
      console.error("Erro ao carregar profissional no cabeçalho:", e);
      setProfissionalNome("Profissional");
    } finally {
      setCarregandoTopo(false);
    }
  }

  return (
    <>
      {/* Cabeçalho: só quando logado e fora do login */}
      {logado && !estaNoLogin && (
        <Cabecalho
          unidade={null}
          profissional={carregandoTopo ? "Carregando..." : profissionalNome}
        />
      )}

      <main className="conteudo">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <RotaPrivada>
                <Dashboard />
              </RotaPrivada>
            }
          />

          <Route
            path="/pacientes"
            element={
              <RotaPrivada>
                <Pacientes />
              </RotaPrivada>
            }
          />

          <Route
            path="/pacientes/novo"
            element={
              <RotaPrivada>
                <PacienteNovo />
              </RotaPrivada>
            }
          />

          <Route
            path="/pacientes/:id"
            element={
              <RotaPrivada>
                <PacienteDetalhe />
              </RotaPrivada>
            }
          />

          <Route
            path="/pacientes/:id/recibo"
            element={
              <RotaPrivada>
                <ReciboPaciente />
              </RotaPrivada>
            }
          />

          <Route
            path="/pagamentos"
            element={
              <RotaPrivada>
                <Pagamentos />
              </RotaPrivada>
            }
          />

          <Route
            path="/configuracoes"
            element={
              <RotaPrivada>
                <Configuracoes />
              </RotaPrivada>
            }
          />
        </Routes>
      </main>

      {/* Rodapé: aparece só depois do login */}
      {logado && !estaNoLogin && <Rodape />}

      {/* Rodapé exclusivo do login */}
      {!logado && estaNoLogin && <RodapeLogin />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppConteudo />
    </BrowserRouter>
  );
}
