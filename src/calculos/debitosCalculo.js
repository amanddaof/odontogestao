export function calcularResumoFinanceiroPaciente(paciente) {
  const mensalidade = Number(paciente?.mensalidade || 0);

  const pagamentos = Array.isArray(paciente?.pagamentos)
    ? paciente.pagamentos
    : [];

  // normaliza tipo
  const pagamentosNormalizados = pagamentos.map(p => ({
    ...p,
    valor: Number(p.valor || 0),
    tipo: p.tipo || "mensalidade" // fallback importante
  }));

  const mensalidades = pagamentosNormalizados.filter(p => p.tipo === "mensalidade");
  const complementos = pagamentosNormalizados.filter(p => p.tipo === "complemento");

  const totalMensalidades = mensalidades.length;

  const totalPagoMensalidades = mensalidades.reduce(
    (soma, p) => soma + p.valor,
    0
  );

  const totalPagoComplementos = complementos.reduce(
    (soma, p) => soma + p.valor,
    0
  );

  const totalPagoGeral = totalPagoMensalidades + totalPagoComplementos;

  const totalEsperado = totalMensalidades * mensalidade;

  const debitoBruto = Math.max(0, totalEsperado - totalPagoMensalidades);

  const debitoFinal = Math.max(0, debitoBruto - totalPagoComplementos);

  const temDebito = debitoFinal > 0;

  const naoAcertou = mensalidades.filter(
    p => p.formas_pagamento?.nome === "Não acertou"
  ).length;

  const parciais = mensalidades.filter(p => {
    return p.valor > 0 && p.valor < mensalidade;
  }).length;

  const pagasInteiras = mensalidades.filter(p => p.valor >= mensalidade).length;

  return {
    mensalidade,
    totalMensalidades,
    naoAcertou,
    parciais,
    pagasInteiras,
    totalEsperado,
    totalPagoMensalidades,
    totalPagoComplementos,
    totalPagoGeral,
    debitoFinal,
    temDebito
  };
}
