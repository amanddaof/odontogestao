import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { buscarPacientePorId } from "../servicos/pacientesServico";
import "./estilos/ReciboPaciente.css";

export default function ReciboPaciente() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const anoAtual = new Date().getFullYear();
  const anoSelecionado = Number(searchParams.get("ano")) || anoAtual;

  const [paciente, setPaciente] = useState(null);
  const [dataEmissao, setDataEmissao] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    carregarDados();
  }, [id]);

  async function carregarDados() {
    const dadosPaciente = await buscarPacientePorId(id);
    setPaciente(dadosPaciente);
  }

  if (!paciente) {
    return <p>Carregando recibo...</p>;
  }

  const pagamentosAno = (paciente.pagamentos || []).filter(p => {
    if (!p.data_pagamento) return false;

    const anoPagamento = new Date(p.data_pagamento).getFullYear();

    return (
      anoPagamento === anoSelecionado &&
      p.formas_pagamento?.nome !== "Não acertou"
    );
  });

  const totalPago = pagamentosAno.reduce(
    (soma, p) => soma + Number(p.valor || 0),
    0
  );

  // ✅ agora vem direto da FK pacientes.profissional_id -> profissionais.id
  const nomeProfissional = paciente.profissionais?.nome || "Profissional responsável";

  const anosDisponiveis = Array.from(
    new Set([
      anoAtual,
      ...(paciente.pagamentos || [])
        .filter(p => p.data_pagamento)
        .map(p => new Date(p.data_pagamento).getFullYear())
    ])
  ).sort((a, b) => b - a);

  const textoRecibo = `Declaro que recebi do(a) paciente ${paciente.nome} a quantia total de R$ ${totalPago.toFixed(
    2
  )}, referente a serviços odontológicos prestados no ano de ${anoSelecionado}, para fins de comprovação.`;

  function alterarAno(e) {
    setSearchParams({ ano: e.target.value });
  }

  return (
    <div className="recibo">
      <div className="topo-recibo">
        <Link to={`/pacientes/${id}`}>← Voltar</Link>

        <button onClick={() => window.print()}>Imprimir</button>
      </div>

      <h1 className="titulo-recibo">RECIBO DE PAGAMENTO</h1>

      <div className="dados-recibo">
        <div>
          <strong>Paciente:</strong> {paciente.nome}
        </div>
        <div>{nomeProfissional}</div>
      </div>

      <div className="dados-recibo">
        <div>
  <strong>Ano:</strong>

  {/* Tela */}
  <select
    className="nao-imprimir"
    value={anoSelecionado}
    onChange={alterarAno}
  >
    {anosDisponiveis.map(ano => (
      <option key={ano} value={ano}>
        {ano}
      </option>
    ))}
  </select>

  {/* Impressão */}
  <span className="so-imprimir">{anoSelecionado}</span>
</div>

<div>
  <strong>Data de emissão:</strong>

  {/* Tela */}
  <input
    className="nao-imprimir"
    type="date"
    value={dataEmissao}
    onChange={e => setDataEmissao(e.target.value)}
  />

  {/* Impressão */}
  <span className="so-imprimir">
    {new Date(dataEmissao).toLocaleDateString("pt-BR")}
  </span>
</div>
      </div>

      <hr />

      <p className="total-recibo">
        <strong>
          Total pago em {anoSelecionado}: R$ {totalPago.toFixed(2)}
        </strong>
      </p>

      <div className="texto-recibo">
        <p>{textoRecibo}</p>
      </div>

      <div className="assinatura">
        <p>Assinatura: ___________________________</p>
      </div>

      <div className="rodape-recibo">
        <span>OdontoGestão • Documento gerado automaticamente</span>
        <span>v1 • {new Date().toLocaleString("pt-BR")}</span>
      </div>
    </div>
  );
}
