// src/calculos/dashboardCalculos.js
import { calcularDebitosPaciente } from "./pacientesCalculos";

/**
 * Se vier "2026-01-14T00:00:00+00:00" -> pega só "2026-01-14"
 */
export function somenteDataYYYYMMDD(valor) {
  if (!valor) return "";
  return String(valor).slice(0, 10);
}

export function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toFixed(2)}`;
}

export function mesAnoLabel(mes, ano) {
  const mm = String(mes).padStart(2, "0");
  return `${mm}/${ano}`;
}

export function tratarPacientesComDebito(pacientes) {
  return (pacientes || []).map(p => ({
    ...p,
    ...calcularDebitosPaciente(p)
  }));
}

export function filtrarPagamentosPagos(pagamentosMes) {
  return (pagamentosMes || []).filter(
    p => p.formas_pagamento?.nome !== "Não acertou"
  );
}

export function calcularResumoMensal({ pagamentosMes, pagamentosPagosMes, pacientes }) {
  const totalRecebidoMes = pagamentosPagosMes.reduce(
    (s, p) => s + Number(p.valor || 0),
    0
  );

  const totalComNF = pagamentosPagosMes
    .filter(p => p.nf)
    .reduce((s, p) => s + Number(p.valor || 0), 0);

  const totalSemNF = pagamentosPagosMes
    .filter(p => !p.nf)
    .reduce((s, p) => s + Number(p.valor || 0), 0);

  const aliquota = 0.06;
  const impostoNF = totalComNF * aliquota;

  const faturamentoLiquido = totalSemNF + (totalComNF - impostoNF);

  const quantidadeNaoAcertou = (pagamentosMes || []).filter(
    p => p.formas_pagamento?.nome === "Não acertou"
  ).length;

  const percentualNF = totalRecebidoMes <= 0 ? 0 : (totalComNF / totalRecebidoMes) * 100;

  const nfBarPercent = totalRecebidoMes <= 0
    ? 0
    : Math.max(0, Math.min(100, (totalComNF / totalRecebidoMes) * 100));

  const debitoTotalAcumulado = (pacientes || []).reduce(
    (s, p) => s + Number(p.valorDebito || 0),
    0
  );

  return {
    totalRecebidoMes,
    totalComNF,
    totalSemNF,
    impostoNF,
    faturamentoLiquido,
    quantidadeNaoAcertou,
    percentualNF,
    nfBarPercent,
    debitoTotalAcumulado
  };
}

/**
 * Regras do dia:
 * - Recebido no dia: soma pagamentos pagos no dia
 * - Esperado no dia: soma do "valor cheio" das consultas do dia
 *   = soma dos pagamentos do dia + soma das mensalidades do "Não acertou" do dia
 *
 * OBS: aqui eu usei:
 * - para "Não acertou": usa p.valor como mensalidade cheia (igual os outros)
 * Se no seu banco o "Não acertou" vier com valor zerado, me fala que ajusto pra puxar do paciente.
 */

export function calcularResumoDiario({
  pagamentosPagosMes,
  dataSelecionada
}) {
  const totalRecebidoDia = (pagamentosPagosMes || [])
    .filter(p => somenteDataYYYYMMDD(p.data_pagamento) === dataSelecionada)
    .reduce((s, p) => s + Number(p.valor || 0), 0);

  return {
    totalRecebidoDia
  };
}

export function calcularDevedoresTop5(pacientes) {
  return (pacientes || [])
    .filter(p => p.temDebito)
    .sort((a, b) => b.valorDebito - a.valorDebito)
    .slice(0, 5);
}

export function calcularDadosFormasPagamento(pagamentosPagosMes) {
  const mapa = {};

  (pagamentosPagosMes || []).forEach(p => {
    const nomeForma = p.formas_pagamento?.nome || "Sem forma";
    if (!mapa[nomeForma]) mapa[nomeForma] = 0;
    mapa[nomeForma] += Number(p.valor || 0);
  });

  return Object.entries(mapa)
    .map(([forma, total]) => ({ forma, total }))
    .sort((a, b) => b.total - a.total);
}

export function calcularRecebimentosPorDia(pagamentosPagosMes) {
  const mapa = {};

  (pagamentosPagosMes || []).forEach(p => {
    const dia = somenteDataYYYYMMDD(p.data_pagamento);
    if (!dia) return;

    if (!mapa[dia]) mapa[dia] = 0;
    mapa[dia] += Number(p.valor || 0);
  });

  return Object.entries(mapa)
    .map(([dia, total]) => ({
      dia: dia.split("-")[2],
      total
    }))
    .sort((a, b) => Number(a.dia) - Number(b.dia));
}

export function calcularMelhorDia(dadosRecebimentosPorDia) {
  if (!dadosRecebimentosPorDia || dadosRecebimentosPorDia.length === 0) return null;

  return dadosRecebimentosPorDia.reduce((melhor, atual) => {
    return atual.total > melhor.total ? atual : melhor;
  }, dadosRecebimentosPorDia[0]);
}
