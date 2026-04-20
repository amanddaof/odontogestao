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
    quantidadeDebitos,
    valorDebito,
    temDebito,

    // mantém compatibilidade com resto do sistema
    debitoFinal: valorDebito
  };
}