import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { buscarPagamentosPorMes, inserirPagamento } from "../servicos/pagamentosServico";
import { buscarPacientes } from "../servicos/pacientesServico";
import { buscarFormasPagamento } from "../servicos/formasPagamentoServico";
import { formatarDataBR } from "../utils/data";
import "./estilos/Pagamentos.css";

export default function Pagamentos() {
  const hoje = new Date();
  const [searchParams] = useSearchParams();

  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth() + 1);

  const [pagamentos, setPagamentos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [mostrandoNovo, setMostrandoNovo] = useState(false);

  const [novoPagamento, setNovoPagamento] = useState({
    data_pagamento: hoje.toISOString().split("T")[0],
    paciente_id: "",
    forma_pagamento_id: "",
    valor: "",
    nf: false,
    tipo: "mensalidade"
  });

  useEffect(() => {
    carregarDados();
  }, [ano, mes]);

  async function carregarDados() {
    setCarregando(true);

    try {
      const [pag, pac, formas] = await Promise.all([
        buscarPagamentosPorMes(ano, mes),
        buscarPacientes(),
        buscarFormasPagamento()
      ]);

      setPagamentos(pag || []);
      setPacientes(pac || []);
      setFormasPagamento(formas || []);
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
      setPagamentos([]);
      setPacientes([]);
      setFormasPagamento([]);
    } finally {
      setCarregando(false);
    }
  }

  function atualizarCampo(campo, valor) {
    setNovoPagamento(prev => ({
      ...prev,
      [campo]: valor
    }));
  }

  useEffect(() => {
    const pacienteId = searchParams.get("paciente");

    if (pacienteId && pacientes.length > 0 && !mostrandoNovo) {
      setMostrandoNovo(true);

      setNovoPagamento(prev => ({
        ...prev,
        paciente_id: Number(pacienteId)
      }));
    }
  }, [pacientes, searchParams]);

  function mesAnterior() {
    if (mes === 1) {
      setMes(12);
      setAno(a => a - 1);
    } else {
      setMes(m => m - 1);
    }
  }

  function proximoMes() {
    if (mes === 12) {
      setMes(1);
      setAno(a => a + 1);
    } else {
      setMes(m => m + 1);
    }
  }

  const pacienteSelecionado = useMemo(() => {
    if (!novoPagamento.paciente_id) return null;
    return pacientes.find(p => Number(p.id) === Number(novoPagamento.paciente_id));
  }, [novoPagamento.paciente_id, pacientes]);

  const mensalidadePaciente = Number(pacienteSelecionado?.mensalidade || 0);
  const valorDigitado = Number(novoPagamento.valor || 0);

  const ehPagamentoParcial =
    mensalidadePaciente > 0 &&
    valorDigitado > 0 &&
    valorDigitado < mensalidadePaciente;

  async function salvarPagamento() {
    try {
      if (!novoPagamento.paciente_id || !novoPagamento.forma_pagamento_id) {
        alert("Preencha paciente e forma de pagamento");
        return;
      }

      const unidadeId = Number(localStorage.getItem("unidade_id")) || 1;

      const dados = {
        paciente_id: Number(novoPagamento.paciente_id),
        profissional_id: 1,
        unidade_id: unidadeId,
        forma_pagamento_id: Number(novoPagamento.forma_pagamento_id),
        data_pagamento: novoPagamento.data_pagamento,
        valor: Number(novoPagamento.valor || 0),
        nf: Boolean(novoPagamento.nf),
        tipo: novoPagamento.tipo
      };

      await inserirPagamento(dados);

      setMostrandoNovo(false);
      setNovoPagamento({
        data_pagamento: hoje.toISOString().split("T")[0],
        paciente_id: "",
        forma_pagamento_id: "",
        valor: "",
        nf: false,
        tipo: "mensalidade"
      });

      carregarDados();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar pagamento");
    }
  }

  const totalRecebido = pagamentos.reduce((s, p) => s + Number(p.valor || 0), 0);

  const totalNaoAcertado = pagamentos.filter(
    p => p.formas_pagamento?.nome === "Não acertou"
  ).length;

  const totalComNF = pagamentos
    .filter(p => p.nf)
    .reduce((s, p) => s + Number(p.valor || 0), 0);

  return (
    <div className="pagamentos">
      {/* TOPO */}
      <div className="pagamentos-topo">
        <div className="pagamentos-titulo">
          <h1>Pagamentos</h1>
          <span className="pagamentos-subtitulo">
            Controle mensal • {String(mes).padStart(2, "0")}/{ano}
            <span className="badge-contagem">{pagamentos.length} lançamentos</span>
          </span>
        </div>

        <div className="controle-mes">
          <button className="btn-mes" onClick={mesAnterior}>◀</button>
          <span className="mes-label">
            {String(mes).padStart(2, "0")}/{ano}
          </span>
          <button className="btn-mes" onClick={proximoMes}>▶</button>
        </div>

        <button className="btn-novo" onClick={() => setMostrandoNovo(true)}>
          + Novo pagamento
        </button>
      </div>

      {/* RESUMO */}
      <div className="resumo-mes">
        <div className="resumo-card">
          <span className="resumo-label">Recebido</span>
          <span className="resumo-valor">R$ {totalRecebido.toFixed(2)}</span>
        </div>

        <div className="resumo-card alerta">
          <span className="resumo-label">Não acertou</span>
          <span className="resumo-valor">{totalNaoAcertado}</span>
        </div>

        <div className="resumo-card">
          <span className="resumo-label">Com NF</span>
          <span className="resumo-valor">R$ {totalComNF.toFixed(2)}</span>
        </div>
      </div>

      {/* TABELA */}
      <div className="tabela-wrapper">
        <table className="tabela-pagamentos">
          <thead>
            <tr>
              <th>Data</th>
              <th>Paciente</th>
              <th>Forma</th>
              <th>Valor</th>
              <th>NF</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {mostrandoNovo && (
              <>
                <tr className="linha-nova">
                  <td>
                    <input
                      type="date"
                      value={novoPagamento.data_pagamento}
                      onChange={e => atualizarCampo("data_pagamento", e.target.value)}
                    />
                  </td>

                  <td>
                    <select
                      value={novoPagamento.paciente_id}
                      onChange={e => {
                        atualizarCampo("paciente_id", e.target.value);
                        atualizarCampo("tipo", "mensalidade");
                      }}
                    >
                      <option value="">Selecione</option>
                      {pacientes.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nome}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <select
                      value={novoPagamento.forma_pagamento_id}
                      onChange={e => {
                        const formaId = Number(e.target.value);
                        const forma = formasPagamento.find(f => f.id === formaId);

                        atualizarCampo("forma_pagamento_id", formaId);

                        if (forma?.nome === "Não acertou") {
                          atualizarCampo("valor", 0);
                          atualizarCampo("tipo", "mensalidade");
                        }
                      }}
                    >
                      <option value="">Selecione</option>
                      {formasPagamento.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.nome}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={novoPagamento.valor}
                      disabled={
                        formasPagamento.find(f => f.id == novoPagamento.forma_pagamento_id)?.nome ===
                        "Não acertou"
                      }
                      onChange={e => atualizarCampo("valor", e.target.value)}
                    />
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={novoPagamento.nf}
                      onChange={e => atualizarCampo("nf", e.target.checked)}
                    />
                  </td>

                  <td className="acoes">
                    <button className="btn-acao ok" onClick={salvarPagamento}>✔</button>
                    <button className="btn-acao cancelar" onClick={() => setMostrandoNovo(false)}>✖</button>
                  </td>
                </tr>

                {ehPagamentoParcial && (
                  <tr>
                    <td colSpan="6">
                      <div className="aviso-parcial">
                        <div className="aviso-topo">
                          <strong>Pagamento parcial detectado</strong>
                          <div>
                            Mensalidade do paciente:{" "}
                            <strong>R$ {mensalidadePaciente.toFixed(2)}</strong>
                            {"  "}•{"  "}
                            Valor informado:{" "}
                            <strong>R$ {valorDigitado.toFixed(2)}</strong>
                          </div>
                        </div>

                        <div className="aviso-opcoes">
                          <label>
                            <input
                              type="radio"
                              name="tipo_pagamento"
                              checked={novoPagamento.tipo === "mensalidade"}
                              onChange={() => atualizarCampo("tipo", "mensalidade")}
                            />
                            Mensalidade (parcial)
                          </label>

                          <label>
                            <input
                              type="radio"
                              name="tipo_pagamento"
                              checked={novoPagamento.tipo === "complemento"}
                              onChange={() => atualizarCampo("tipo", "complemento")}
                            />
                            Complemento
                          </label>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )}

            {!carregando && pagamentos.length === 0 && (
              <tr>
                <td colSpan="6" className="vazio">
                  Nenhum pagamento registrado neste mês.
                </td>
              </tr>
            )}

            {!carregando &&
              pagamentos.map(p => {
                const formaNome = p.formas_pagamento?.nome || "-";
                const ehNaoAcertou = formaNome === "Não acertou";

                return (
                  <tr key={p.id} className={ehNaoAcertou ? "linha-nao-acertou" : ""}>
                    {/* ✅ CORRIGIDO: sem timezone bug */}
                    <td>{formatarDataBR(String(p.data_pagamento).slice(0, 10))}</td>

                    <td>{p.pacientes?.nome}</td>

                    <td>
                      <span className={"chip " + (ehNaoAcertou ? "chip-erro" : "chip-neutro")}>
                        {formaNome}
                      </span>
                    </td>

                    <td className={"td-valor " + (ehNaoAcertou ? "td-valor-nao" : "")}>
                      R$ {Number(p.valor).toFixed(2)}
                    </td>

                    <td className="td-nf">
                      {p.nf ? (
                        <span className="chip chip-ok">✔ Com NF</span>
                      ) : (
                        <span className="chip chip-neutro">—</span>
                      )}
                    </td>

                    <td />
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
