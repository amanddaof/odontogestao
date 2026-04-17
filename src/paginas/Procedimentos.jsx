import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  inserirProcedimento,
  buscarProcedimentosPorPaciente
} from "../servicos/procedimentosServico";
import "./estilos/Procedimentos.css";

export default function Procedimentos() {
  const { id } = useParams();

  const [mostrarForm, setMostrarForm] = useState(false);
  const [procedimentos, setProcedimentos] = useState([]);

  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("fixo");
  const [valorTotal, setValorTotal] = useState("");
  const [valorMensal, setValorMensal] = useState("");

  useEffect(() => {
    carregarProcedimentos();
  }, []);

  async function carregarProcedimentos() {
    try {
      const dados = await buscarProcedimentosPorPaciente(Number(id));
      setProcedimentos(dados || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      paciente_id: Number(id),
      descricao,
      tipo,
      valor_total: tipo === "fixo" ? Number(valorTotal) : null,
      valor_mensal: tipo === "mensal" ? Number(valorMensal) : null,
      status: "ativo"
    };

    try {
      await inserirProcedimento(payload);

      setDescricao("");
      setValorTotal("");
      setValorMensal("");
      setTipo("fixo");
      setMostrarForm(false);

      await carregarProcedimentos();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar procedimento");
    }
  }

  // ordena: ativos primeiro
  const ordenados = [...procedimentos].sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === "ativo" ? -1 : 1;
  });

  return (
    <div className="procedimentos">
      {/* TOPO */}
      <div className="procedimentos-topo">
        <Link to={`/pacientes/${id}`} className="voltar">
          ← Voltar
        </Link>

        <button
          className="botao-novo"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          + Novo procedimento
        </button>
      </div>

      <h1 className="titulo">Procedimentos</h1>

      {/* FORM */}
      {mostrarForm && (
  <div className="form-card">
    <form onSubmit={handleSubmit} className="form-grid">
      
      <div className="campo">
        <label>Descrição</label>
        <input
          placeholder="Ex: Limpeza, Ortodontia..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />
      </div>

      <div className="campo">
        <label>Tipo</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="fixo">Fixo</option>
          <option value="mensal">Mensal</option>
        </select>
      </div>

      {tipo === "fixo" && (
        <div className="campo">
          <label>Valor total</label>
          <input
            type="number"
            placeholder="Ex: 150"
            value={valorTotal}
            onChange={(e) => setValorTotal(e.target.value)}
            required
          />
        </div>
      )}

      {tipo === "mensal" && (
        <div className="campo">
          <label>Valor mensal</label>
          <input
            type="number"
            placeholder="Ex: 100"
            value={valorMensal}
            onChange={(e) => setValorMensal(e.target.value)}
            required
          />
        </div>
      )}

      <div className="form-acoes">
        <button type="submit" className="btn-salvar">
          Salvar
        </button>

        <button
          type="button"
          className="btn-cancelar"
          onClick={() => setMostrarForm(false)}
        >
          Cancelar
        </button>
      </div>
    </form>
  </div>
)}

      {/* LISTA LIMPA (SEM BLOCOS) */}
      <div className="lista-procedimentos">
        {ordenados.length === 0 ? (
          <p className="vazio">Nenhum procedimento cadastrado.</p>
        ) : (
          ordenados.map((p, index) => {
            const isFinalizado = p.status === "finalizado";

            const mostrarDivisor =
              isFinalizado &&
              index > 0 &&
              ordenados[index - 1].status !== "finalizado";

            return (
              <div key={p.id}>
                {mostrarDivisor && (
                  <div className="divisor">Finalizados</div>
                )}

                <div
                  className={`item-procedimento ${
                    isFinalizado ? "finalizado" : "ativo"
                  }`}
                >
                  <div className="info">
                    <div className="linha-topo">
                      <strong>{p.descricao}</strong>

                      <span className={`badge ${p.tipo}`}>
                        {p.tipo === "fixo" ? "Fixo" : "Mensal"}
                      </span>
                    </div>

                    <div className={`status ${p.status}`}>
                      ● {isFinalizado ? "Finalizado" : "Ativo"}
                    </div>
                  </div>

                  <div className="valor">
                    R${" "}
                    {Number(
                      p.tipo === "fixo"
                        ? p.valor_total
                        : p.valor_mensal
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}