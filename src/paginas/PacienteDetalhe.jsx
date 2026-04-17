import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { buscarPacientePorId } from "../servicos/pacientesServico";
import "./estilos/PacienteDetalhe.css";

export default function PacienteDetalhe() {
  const { id } = useParams();

  const [paciente, setPaciente] = useState(null);

  useEffect(() => {
    carregarPaciente();
  }, []);

  async function carregarPaciente() {
    try {
      const dados = await buscarPacientePorId(Number(id));
      setPaciente(dados);
    } catch (err) {
      console.error("Erro ao carregar paciente:", err);
    }
  }

  if (!paciente) return <p>Carregando...</p>;

  const temDebito = false; // depois vamos integrar com cálculo real

  return (
    <div className="paciente-detalhe">

      {/* TOPO */}
      <div className="topo-detalhe">
        <Link to="/pacientes" className="voltar">
          ← Voltar
        </Link>

        <div className="acoes-topo">
          <Link
            className="btn-primario"
            to={`/pagamentos?paciente=${paciente.id}`}
          >
            Registrar pagamento
          </Link>

          <Link
            className="btn-secundario"
            to={`/pacientes/${paciente.id}/recibo`}
          >
            Recibo
          </Link>

          <Link
            className="btn-secundario"
            to={`/pacientes/${paciente.id}/procedimentos`}
          >
            Procedimentos
          </Link>
        </div>
      </div>

      {/* CABEÇALHO */}
      <div className="cabecalho-paciente">
        <h1>{paciente.nome}</h1>

        <div className="resumo">
          <span className={`status ${temDebito ? "debito" : "ok"}`}>
            {temDebito ? "Com débito" : "Em dia"}
          </span>

          <span>
            Mensalidade: R$ {Number(paciente.mensalidade || 0).toFixed(2)}
          </span>

          <span className={`debito-total ${temDebito ? "ativo" : "neutro"}`}>
            Débito: R$ 0,00
          </span>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="conteudo-inferior">

        {/* INFO CADASTRAL */}
        <div className="info-cadastral">
          <h2>Informações</h2>

          <div className="linha-info">
            <span className="label">CPF</span>
            <span>{paciente.cpf || "-"}</span>
          </div>

          <div className="linha-info">
            <span className="label">Telefone</span>
            <span>{paciente.telefone || "-"}</span>
          </div>

          <div className="linha-info">
            <span className="label">Endereço</span>
            <span>{paciente.endereco || "-"}</span>
          </div>

          <div className="linha-info">
            <span className="label">Nascimento</span>
            <span>{paciente.data_nascimento || "-"}</span>
          </div>
        </div>

        {/* HISTÓRICO */}
        <div className="historico-pagamentos">
          <h2>Histórico de pagamentos</h2>

          {paciente.pagamentos?.length === 0 ? (
            <p>Nenhum pagamento registrado.</p>
          ) : (
            <ul className="lista-pagamentos">
              {paciente.pagamentos.map((p) => (
                <li key={p.id} className="item-pagamento">
                  <span className="data">
                    {p.data_pagamento || "-"}
                  </span>

                  <span className="forma">
                    {p.formas_pagamento?.nome || "-"}
                  </span>

                  <span className="valor">
                    R$ {Number(p.valor).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}