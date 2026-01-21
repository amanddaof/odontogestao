// src/servicos/dashboardServico.js
import { buscarPagamentosPorMes } from "./pagamentosServico";
import { buscarPacientesPorUnidade } from "./pacientesServico";

export async function buscarDadosDashboard({ ano, mes }) {
  const [pagMes, pac] = await Promise.all([
    buscarPagamentosPorMes(ano, mes),
    buscarPacientesPorUnidade()
  ]);

  return {
    pagamentosMes: pagMes || [],
    pacientes: pac || []
  };
}
