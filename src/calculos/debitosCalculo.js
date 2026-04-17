export function calcularResumoFinanceiroPaciente(paciente) {
  const cobrancas = Array.isArray(paciente?.cobrancas)
    ? paciente.cobrancas
    : [];

  let valorDebito = 0;
  let quantidadeDebitos = 0;

  cobrancas.forEach((c) => {
    const valorTotal = Number(c.valor_total || 0);
    const valorPago = Number(c.valor_pago || 0);

    const restante = Math.max(0, valorTotal - valorPago);

    if (restante > 0) {
      valorDebito += restante;
      quantidadeDebitos += 1;
    }
  });

  const temDebito = valorDebito > 0;

  return {
    // ⚠️ mantive essas props pra não quebrar nada
    mensalidade: paciente?.mensalidade || 0,

    quantidadeDebitos,
    valorDebito,
    temDebito,

    // 🔥 compatibilidade com o que já existia
    debitoFinal: valorDebito,
    totalPagoGeral: 0,
    totalEsperado: 0,
    totalMensalidades: 0,
    naoAcertou: 0,
    parciais: 0,
    pagasInteiras: 0
  };
}
