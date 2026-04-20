import { calcularResumoFinanceiroPaciente } from "./debitosCalculo";

export function calcularDebitosPaciente(paciente) {
  const resumo = calcularResumoFinanceiroPaciente(paciente);

  return {
    temDebito: resumo.temDebito,
    quantidadeDebitos: resumo.quantidadeDebitos,
    valorDebito: resumo.debitoFinal
  };
}