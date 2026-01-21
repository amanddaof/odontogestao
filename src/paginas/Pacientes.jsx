import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buscarPacientes } from "../servicos/pacientesServico";
import { calcularDebitosPaciente } from "../calculos/pacientesCalculos";
import "./estilos/Pacientes.css";

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [totalComDebito, setTotalComDebito] = useState(0);

  useEffect(() => {
    carregarPacientes();
  }, []);

  async function carregarPacientes() {
    try {
      const dados = await buscarPacientes();

      const pacientesTratados = dados
        .map(paciente => ({
          ...paciente,
          ...calcularDebitosPaciente(paciente)
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

      setPacientes(pacientesTratados);

      setTotalComDebito(
        pacientesTratados.filter(p => p.temDebito).length
      );
    } catch (err) {
      console.error("Erro ao carregar pacientes:", err);
    }
  }

  return (
    <div className="pacientes">
      <div className="pacientes-topo">
        <div>
          <h1>Pacientes</h1>
          <span className="contador">
            {totalComDebito} paciente(s) com débito
          </span>
        </div>

        <Link to="/pacientes/novo" className="botao-novo">
		  Novo paciente
		</Link>

      </div>

      <ul className="lista-pacientes">
        {pacientes.map(paciente => (
          <li key={paciente.id} className="item-paciente">
            <div className="info-linha">
              <strong className="nome">{paciente.nome}</strong>

              <span className="separador">•</span>

              <span className="mensalidade">
                Mensalidade: R$ {Number(paciente.mensalidade || 0).toFixed(2)}
              </span>

              {paciente.temDebito && (
                <>
                  <span className="separador">•</span>
                  <span className="valor-debito">
                    Débito: R$ {Number(paciente.valorDebito || 0).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            <div className="acoes">
              <span
                className={
                  paciente.temDebito
                    ? "status debito"
                    : "status ok"
                }
              >
                {paciente.temDebito ? "Com débito" : "Em dia"}
              </span>

              <Link
                to={`/pacientes/${paciente.id}`}
                className="botao-detalhes"
              >
                Ver detalhes
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
