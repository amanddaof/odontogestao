import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { buscarUnidades } from "../servicos/unidadesServico";
import "./estilos/Cabecalho.css";

export default function Cabecalho({ unidade, profissional }) {
  const navigate = useNavigate();

  const ehProfissional = localStorage.getItem("tipo_usuario") === "profissional";

  const [unidades, setUnidades] = useState([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState("");

  useEffect(() => {
    carregarUnidades();
  }, []);

  async function carregarUnidades() {
    try {
      const lista = await buscarUnidades();
      setUnidades(lista || []);

      const unidadeSalva = localStorage.getItem("unidade_id");

      if (unidadeSalva) {
        setUnidadeSelecionada(unidadeSalva);
      } else if (lista && lista.length > 0) {
        localStorage.setItem("unidade_id", String(lista[0].id));
        setUnidadeSelecionada(String(lista[0].id));
      }
    } catch (e) {
      console.error("Erro ao carregar unidades:", e);
      setUnidades([]);
    }
  }

  function trocarUnidade(e) {
    const novaUnidadeId = e.target.value;
    setUnidadeSelecionada(novaUnidadeId);
    localStorage.setItem("unidade_id", String(novaUnidadeId));
    window.location.reload();
  }

  function sair() {
    const confirmar = window.confirm("Deseja sair do sistema?");
    if (!confirmar) return;

    localStorage.removeItem("usuario_id");
    localStorage.removeItem("tipo_usuario");
    localStorage.removeItem("profissional_id");
    localStorage.removeItem("unidade_id");

    navigate("/login", { replace: true });
  }

  return (
    <header className="cabecalho">
      {/* ESQUERDA */}
      <div className="cabecalho-esquerda">
        <img
          className="cabecalho-marca"
          src="/logo+nome.png"
          alt="OdontoGestão"
        />
      </div>

      {/* CENTRO */}
      <nav className="cabecalho-centro menu">
        <NavLink
          to="/"
          className={({ isActive }) => "menu-link" + (isActive ? " ativo" : "")}
        >
          Resumo
        </NavLink>

        <NavLink
          to="/pagamentos"
          className={({ isActive }) => "menu-link" + (isActive ? " ativo" : "")}
        >
          Pagamentos
        </NavLink>

        <NavLink
          to="/pacientes"
          className={({ isActive }) => "menu-link" + (isActive ? " ativo" : "")}
        >
          Pacientes
        </NavLink>

        {ehProfissional && (
          <NavLink
            to="/configuracoes"
            className={({ isActive }) =>
              "menu-link" + (isActive ? " ativo" : "")
            }
          >
            Configurações
          </NavLink>
        )}
      </nav>

      {/* DIREITA */}
      <div className="cabecalho-direita">
        <div className="cabecalho-identidade">
          <span className="profissional">{profissional || "Profissional"}</span>

          {unidades.length > 0 && (
            <div className="unidade-select">
              <select value={unidadeSelecionada} onChange={trocarUnidade}>
                {unidades.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button className="btn-sair" onClick={sair}>
          Sair
        </button>
      </div>
    </header>
  );
}
