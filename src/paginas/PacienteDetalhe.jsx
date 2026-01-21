import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { buscarPacientePorId } from "../servicos/pacientesServico";
import { calcularResumoFinanceiroPaciente } from "../calculos/debitosCalculo";
import { formatarDataBR } from "../utils/data";
import "./estilos/PacienteDetalhe.css";
import { formatarCPF, formatarTelefone } from "../utils/formatadores";

export default function PacienteDetalhe() {
  const { id } = useParams();

  const [paciente, setPaciente] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarPaciente();
  }, [id]);

  async function carregarPaciente() {
    try {
      setCarregando(true);
      const dados = await buscarPacientePorId(id);
      setPaciente(dados);
    } catch (e) {
      console.error("Erro ao buscar paciente:", e);
      setPaciente(null);
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) return <p>Carregando paciente...</p>;
  if (!paciente) return <p>Paciente não encontrado.</p>;

  const resumo = calcularResumoFinanceiroPaciente(paciente);

  const pagamentosOrdenados = [...(paciente.pagamentos || [])].sort(
    (a, b) => new Date(b.data_pagamento) - new Date(a.data_pagamento)
  );

  return (
    <div className="paciente-detalhe">
      <div className="topo-detalhe">
        <Link className="voltar" to="/pacientes">
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
        </div>
      </div>

      <div className="cabecalho-paciente">
        <h1 style={{ margin: 0 }}>{paciente.nome}</h1>

        <div className="resumo">
          <span className={`status ${resumo.temDebito ? "debito" : "ok"}`}>
            {resumo.temDebito ? "Com débito" : "Em dia"}
          </span>

          <span>
            <strong>Mensalidade:</strong>{" "}
            R$ {Number(resumo.mensalidade).toFixed(2)}
          </span>

          <span className={`debito-total ${resumo.temDebito ? "ativo" : "neutro"}`}>
            <strong>Em aberto:</strong>{" "}
            R$ {Number(resumo.debitoFinal).toFixed(2)}
          </span>
        </div>

        <div className="resumo-historico">
          <div>
            <strong>{resumo.totalMensalidades}</strong>
            <span>Mensalidades</span>
          </div>

          <div>
            <strong>{resumo.naoAcertou}</strong>
            <span>Não acertou</span>
          </div>

          <div>
            <strong>R$ {Number(resumo.totalEsperado).toFixed(2)}</strong>
            <span>Total esperado</span>
          </div>

          <div>
            <strong>R$ {Number(resumo.totalPagoGeral).toFixed(2)}</strong>
            <span>Total pago</span>
          </div>

          <div>
            <strong>R$ {Number(resumo.debitoFinal).toFixed(2)}</strong>
            <span>Débito</span>
          </div>
        </div>
      </div>

      <div className="conteudo-inferior">
        <div className="info-cadastral">
  <h2>Informações do paciente</h2>

  <div className="linha-info">
  <span className="label">CPF:</span>
  <span>{formatarCPF(paciente.cpf)}</span>
</div>

<div className="linha-info">
  <span className="label">Telefone:</span>
  <span>{formatarTelefone(paciente.telefone)}</span>
</div>

  <div className="linha-info">
    <span className="label">Endereço:</span>
    <span>{paciente.endereco || "—"}</span>
  </div>

  <div className="linha-info">
    <span className="label">Data de nascimento:</span>
    <span>
      {paciente.data_nascimento
        ? new Date(paciente.data_nascimento).toLocaleDateString("pt-BR")
        : "—"}
    </span>
  </div>
</div>

        <div className="historico-pagamentos">
          <h2>Histórico</h2>

          <ul className="lista-pagamentos">
            {pagamentosOrdenados.length === 0 ? (
              <p>Nenhum registro ainda.</p>
            ) : (
              pagamentosOrdenados.map(p => {
                const naoAcertou = p.formas_pagamento?.nome === "Não acertou";

                const tipoTexto =
                  p.tipo === "complemento"
                    ? "Complemento"
                    : "Mensalidade";

                return (
                  <li
                    key={p.id}
                    className={`item-pagamento ${naoAcertou ? "nao-acertou" : ""}`}
                  >
                    <span className="data">
                      {formatarDataBR(p.data_pagamento)}
                    </span>

                    <span className="forma">
                      {p.formas_pagamento?.nome}{" "}
                      <span style={{ color: "#777" }}>
                        ({tipoTexto})
                      </span>
                    </span>

                    <span className="valor">
                      R$ {Number(p.valor || 0).toFixed(2)}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
