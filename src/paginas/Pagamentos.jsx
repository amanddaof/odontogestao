import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  buscarPagamentosPorMes,
  inserirPagamento,
  buscarOpcoesProcedimento
} from "../servicos/pagamentosServico";
import { buscarPacientes } from "../servicos/pacientesServico";
import { buscarFormasPagamento } from "../servicos/formasPagamentoServico";
import { formatarDataBR } from "../utils/data";
import "./estilos/Pagamentos.css";
import { criarCobranca, atualizarCobranca } from "../servicos/cobrancasServico";

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

  const [opcoesProcedimento, setOpcoesProcedimento] = useState([]);
  const [procedimentoSelecionado, setProcedimentoSelecionado] = useState("");

  const [novoPagamento, setNovoPagamento] = useState({
    data_pagamento: hoje.toISOString().split("T")[0],
    paciente_id: "",
    forma_pagamento_id: "",
    valor: "",
    nf: false
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
      console.error(e);
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

  async function handlePacienteChange(valor) {
    atualizarCampo("paciente_id", valor);

    if (!valor) {
      setOpcoesProcedimento([]);
      return;
    }

    try {
      const opcoes = await buscarOpcoesProcedimento(valor);
      setOpcoesProcedimento(opcoes || []);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    const pacienteId = searchParams.get("paciente");

    if (pacienteId && pacientes.length > 0 && !mostrandoNovo) {
      setMostrandoNovo(true);

      atualizarCampo("paciente_id", Number(pacienteId));
      handlePacienteChange(Number(pacienteId));
    }
  }, [pacientes]);

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

  async function salvarPagamento() {
  try {
    if (!novoPagamento.paciente_id || !novoPagamento.forma_pagamento_id) {
      alert("Preencha paciente e forma de pagamento");
      return;
    }

    let cobrancaId = null;

    // 🔹 se selecionou algo
    if (procedimentoSelecionado) {
      const [tipo, id] = procedimentoSelecionado.split("-");

      // ✅ cobrança existente
      if (tipo === "cobranca") {
        cobrancaId = Number(id);
      }

      // ✅ novo procedimento → criar cobrança
      if (tipo === "procedimento") {
        const procedimento = opcoesProcedimento.find(
          (p) => p.id === Number(id) && p.tipo === "procedimento"
        );

        const novaCobranca = await criarCobranca({
          paciente_id: Number(novoPagamento.paciente_id),
          procedimento,
          data: novoPagamento.data_pagamento
        });

        cobrancaId = novaCobranca.id;
      }
    }

    if (!cobrancaId) {
      alert("Selecione um procedimento ou cobrança");
      return;
    }

    // 💰 salva pagamento
    await inserirPagamento({
      paciente_id: Number(novoPagamento.paciente_id),
      cobranca_id: cobrancaId,
      forma_pagamento_id: Number(novoPagamento.forma_pagamento_id),
      data_pagamento: novoPagamento.data_pagamento,
      valor: Number(novoPagamento.valor || 0),
      nf: Boolean(novoPagamento.nf)
    });

    // 🔄 atualiza cobrança
    await atualizarCobranca(cobrancaId);

    // reset
    setMostrandoNovo(false);
    setProcedimentoSelecionado("");
    setOpcoesProcedimento([]);

    setNovoPagamento({
      data_pagamento: hoje.toISOString().split("T")[0],
      paciente_id: "",
      forma_pagamento_id: "",
      valor: "",
      nf: false
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
          <span className="mes-label">{String(mes).padStart(2, "0")}/{ano}</span>
          <button className="btn-mes" onClick={proximoMes}>▶</button>
        </div>

        <button className="btn-novo" onClick={() => setMostrandoNovo(true)}>
          + Novo pagamento
        </button>
      </div>

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

      <div className="tabela-wrapper">
        <table className="tabela-pagamentos">
          <thead>
            <tr>
              <th>Data</th>
              <th>Paciente</th>
              <th>Procedimento</th>
              <th>Forma</th>
              <th>Valor</th>
              <th>NF</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {mostrandoNovo && (
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
                    onChange={e => handlePacienteChange(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {pacientes.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </td>

                {/* ✅ PROCEDIMENTO */}
                <td>
                  <select
                    value={procedimentoSelecionado}
                    onChange={e => setProcedimentoSelecionado(e.target.value)}
                  >
                    <option value="">Selecione</option>

                    {opcoesProcedimento.map(op => (
                      <option key={`${op.tipo}-${op.id}`} value={`${op.tipo}-${op.id}`}>
                        {op.descricao}
                      </option>
                    ))}
                  </select>
                </td>

                <td>
                  <select
                    value={novoPagamento.forma_pagamento_id}
                    onChange={e => atualizarCampo("forma_pagamento_id", e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {formasPagamento.map(f => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </td>

                <td>
                  <input
                    type="number"
                    value={novoPagamento.valor}
                    onChange={e => atualizarCampo("valor", e.target.value)}
                  />
                </td>

                <td>
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
            )}

            {!carregando && pagamentos.length === 0 && (
              <tr>
                <td colSpan="7" className="vazio">
                  Nenhum pagamento registrado neste mês.
                </td>
              </tr>
            )}

            {!carregando &&
              pagamentos.map(p => (
                <tr key={p.id}>
                  <td>{formatarDataBR(p.data_pagamento)}</td>
                  <td>{p.pacientes?.nome}</td>
                  <td>{p.cobrancas?.procedimentos?.descricao || "-"}</td>
                  <td>{p.formas_pagamento?.nome}</td>
                  <td>R$ {Number(p.valor).toFixed(2)}</td>
                  <td>{p.nf ? "✔" : "-"}</td>
                  <td />
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}