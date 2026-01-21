// src/calculos/pacientesCalculos.js

import { calcularResumoFinanceiroPaciente } from "./debitosCalculo";

export function calcularDebitosPaciente(paciente) {
  const resumo = calcularResumoFinanceiroPaciente(paciente);

  return {
    mensalidade: resumo.mensalidade,
    temDebito: resumo.temDebito,

    // aqui é só um contador de "eventos problemáticos"
    // (mensalidade parcial OU não acertou)
    quantidadeDebitos: resumo.parciais + resumo.naoAcertou,

    // valor real em aberto
    valorDebito: resumo.debitoFinal
  };
}
