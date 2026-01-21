// src/paginas/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import "./estilos/Dashboard.css";

import { buscarDadosDashboard } from "../servicos/dashboardServico";

import {
  tratarPacientesComDebito,
  filtrarPagamentosPagos,
  mesAnoLabel,
  formatarMoeda,
  calcularResumoMensal,
  calcularResumoDiario,
  calcularDevedoresTop5,
  calcularDadosFormasPagamento,
  calcularRecebimentosPorDia,
  calcularMelhorDia
} from "../calculos/dashboardCalculos";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";

export default function Dashboard() {
  const hoje = new Date();

  const [dataSelecionada, setDataSelecionada] = useState(
    hoje.toISOString().split("T")[0]
  );

  const [pagamentosMes, setPagamentosMes] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const ano = useMemo(
    () => Number(dataSelecionada.split("-")[0]),
    [dataSelecionada]
  );

  const mes = useMemo(
    () => Number(dataSelecionada.split("-")[1]),
    [dataSelecionada]
  );

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ano, mes]);

  async function carregarDados() {
    setCarregando(true);

    try {
      const { pagamentosMes, pacientes } = await buscarDadosDashboard({ ano, mes });

      setPagamentosMes(pagamentosMes || []);
      setPacientes(tratarPacientesComDebito(pacientes || []));
    } catch (e) {
      console.error("Erro ao carregar dashboard:", e);
      setPagamentosMes([]);
      setPacientes([]);
    } finally {
      setCarregando(false);
    }
  }

  const pagamentosPagosMes = useMemo(() => {
    return filtrarPagamentosPagos(pagamentosMes);
  }, [pagamentosMes]);

  const resumoMensal = useMemo(() => {
    return calcularResumoMensal({
      pagamentosMes,
      pagamentosPagosMes,
      pacientes
    });
  }, [pagamentosMes, pagamentosPagosMes, pacientes]);

const resumoDiario = useMemo(() => {
  return calcularResumoDiario({
    pagamentosMes,
    pagamentosPagosMes,
    dataSelecionada,
    pacientes
  });
}, [pagamentosMes, pagamentosPagosMes, dataSelecionada, pacientes]);

  const devedores = useMemo(() => {
    return calcularDevedoresTop5(pacientes);
  }, [pacientes]);

  const dadosFormasPagamento = useMemo(() => {
    return calcularDadosFormasPagamento(pagamentosPagosMes);
  }, [pagamentosPagosMes]);

  const dadosRecebimentosPorDia = useMemo(() => {
    return calcularRecebimentosPorDia(pagamentosPagosMes);
  }, [pagamentosPagosMes]);

  const melhorDia = useMemo(() => {
    return calcularMelhorDia(dadosRecebimentosPorDia);
  }, [dadosRecebimentosPorDia]);

  return (
    <div className="dash3">
      {/* HEADER */}
      <div className="dash3-header">
        <div className="dash3-header-left">
          <h1>Dashboard</h1>
          <p className="dash3-subtitle">Relatório de {mesAnoLabel(mes, ano)}</p>
        </div>

        <div className="dash3-header-right">
          <div className="dash3-datebox">
            <span className="dash3-date-label">Data</span>
            <input
              className="dash3-date-input"
              type="date"
              value={dataSelecionada}
              onChange={e => setDataSelecionada(e.target.value)}
            />
          </div>
        </div>
      </div>

      {carregando ? (
        <p className="dash3-loading">Carregando dashboard...</p>
      ) : (
        <>
          {/* RESUMO DO MÊS */}
          <section className="dash3-resumo">
            <div className="dash3-resumo-top">
              <h2>Resumo do mês</h2>
            </div>

            <div className="dash3-resumo-grid">
              <div className="dash3-kpi">
                <span className="dash3-kpi-label">Recebido no mês</span>
                <strong className="dash3-kpi-value">
                  {formatarMoeda(resumoMensal.totalRecebidoMes)}
                </strong>
                <span className="dash3-kpi-sub">Sem “Não acertou”</span>
              </div>

              <div className="dash3-kpi">
                <span className="dash3-kpi-label">Líquido estimado</span>
                <strong className="dash3-kpi-value">
                  {formatarMoeda(resumoMensal.faturamentoLiquido)}
                </strong>
                <span className="dash3-kpi-sub">Já descontado imposto NF</span>
              </div>

              <div className="dash3-kpi">
                <span className="dash3-kpi-label">Não acertou</span>
                <strong className="dash3-kpi-value">
                  {resumoMensal.quantidadeNaoAcertou}
                </strong>
                <span className="dash3-kpi-sub">Consultas sem pagamento</span>
              </div>

              {/* KPI largo */}
              <div className="dash3-kpi wide">
                <div className="dash3-kpi-row">
                  <span className="dash3-kpi-label">NF</span>
                  <span className="dash3-kpi-mini">
                    {resumoMensal.percentualNF.toFixed(1)}% do total recebido
                  </span>
                </div>

                <div className="dash3-bar">
                  <div
                    className="dash3-bar-fill"
                    style={{ width: `${resumoMensal.nfBarPercent}%` }}
                    title={`NF: ${resumoMensal.percentualNF.toFixed(1)}%`}
                  />
                </div>

                <div className="dash3-kpi-row bottom">
                  <div className="dash3-kpi-col">
                    <span className="dash3-kpi-sub">Com NF</span>
                    <strong className="dash3-kpi-small">
                      {formatarMoeda(resumoMensal.totalComNF)}
                    </strong>
                  </div>

                  <div className="dash3-divider" />

                  <div className="dash3-kpi-col">
                    <span className="dash3-kpi-sub">Débito acumulado</span>
                    <strong className="dash3-kpi-small danger">
                      {formatarMoeda(resumoMensal.debitoTotalAcumulado)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* pills */}
            <div className="dash3-resumo-footer">
              <div className="dash3-pill">
                <span className="dash3-pill-label">Esperado no dia:</span>
                <strong className="dash3-pill-value">
                  {formatarMoeda(resumoDiario.totalEsperadoDia)}
                </strong>
              </div>

              <div className="dash3-pill">
                <span className="dash3-pill-label">Recebido no dia:</span>
                <strong className="dash3-pill-value">
                  {formatarMoeda(resumoDiario.totalRecebidoDia)}
                </strong>
              </div>

              <div className="dash3-pill">
                <span className="dash3-pill-label">Débito do dia:</span>
                <strong className="dash3-pill-value">
                  {formatarMoeda(resumoDiario.debitoDia)}
                </strong>
              </div>

              <div className="dash3-pill">
                <span className="dash3-pill-label">Imposto NF (6%):</span>
                <strong className="dash3-pill-value">
                  {formatarMoeda(resumoMensal.impostoNF)}
                </strong>
              </div>

              <div className="dash3-pill">
                <span className="dash3-pill-label">Melhor dia:</span>
                <strong className="dash3-pill-value">
                  {melhorDia ? `Dia ${melhorDia.dia}` : "—"}
                </strong>
              </div>
            </div>
          </section>

          {/* GRID BI */}
          <section className="dash3-grid">
            {/* NF / IMPOSTO */}
            <div className="dash3-panel">
              <div className="dash3-panel-top">
                <div>
                  <h3>Informe sobre NF / Imposto</h3>
                  <p>Comparativo do mês selecionado</p>
                </div>
              </div>

              <div className="dash3-nf-tabs">
                <button className="dash3-nf-tab ativo">Nota Fiscal</button>
                <button className="dash3-nf-tab">Sem Nota Fiscal</button>
              </div>

              <div className="dash3-nf-cards">
                <div className="dash3-nf-card">
                  <span className="dash3-nf-card-label">Com NF</span>
                  <strong className="dash3-nf-card-value">
                    {formatarMoeda(resumoMensal.totalComNF)}
                  </strong>
                </div>

                <div className="dash3-nf-card">
                  <span className="dash3-nf-card-label">Sem NF</span>
                  <strong className="dash3-nf-card-value">
                    {formatarMoeda(resumoMensal.totalSemNF)}
                  </strong>
                </div>
              </div>

              <div className="dash3-nf-footer">
                <div className="dash3-nf-footer-left">
                  <strong>Imposto sobre NF (6%)</strong>
                  <span>{resumoMensal.percentualNF.toFixed(1)}% do total recebido</span>
                </div>
                <strong className="dash3-nf-footer-right">
                  {formatarMoeda(resumoMensal.impostoNF)}
                </strong>
              </div>
            </div>

            {/* DEVEDORES */}
            <div className="dash3-panel">
              <div className="dash3-panel-top">
                <div>
                  <h3>Devedores do mês</h3>
                  <p>Prioridade para cobrança</p>
                </div>

                <div className="dash3-tag">{devedores.length} em destaque</div>
              </div>

              {devedores.length === 0 ? (
                <div className="dash3-empty">Nenhum paciente com débito 🎉</div>
              ) : (
                <ul className="dash3-devedores">
                  {devedores.map((p, idx) => (
                    <li key={p.id} className="dash3-devedor">
                      <span className="dash3-rank">{idx + 1}</span>

                      <div className="dash3-devedor-info">
                        <span className="dash3-devedor-nome">{p.nome}</span>
                      </div>

                      <strong className="dash3-devedor-valor">
                        {formatarMoeda(p.valorDebito)}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ENTRADAS POR DIA */}
            <div className="dash3-panel">
              <div className="dash3-panel-top">
                <div>
                  <h3>Entradas por dia no mês</h3>
                  <p>Fluxo de recebimentos em {mesAnoLabel(mes, ano)}</p>
                </div>

                <div className="dash3-pill-chart">
                  {melhorDia ? formatarMoeda(melhorDia.total) : "—"}
                </div>
              </div>

              {dadosRecebimentosPorDia.length === 0 ? (
                <div className="dash3-empty">
                  Nenhum pagamento registrado neste mês.
                </div>
              ) : (
                <div className="dash3-chart">
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={dadosRecebimentosPorDia}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={v => `R$ ${Number(v).toFixed(2)}`} />
                      <Line type="monotone" dataKey="total" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* FORMAS DE PAGAMENTO */}
            <div className="dash3-panel">
              <div className="dash3-panel-top">
                <div>
                  <h3>Formas de pagamento</h3>
                  <p>Comparativo por canal</p>
                </div>
              </div>

              {dadosFormasPagamento.length === 0 ? (
                <div className="dash3-empty">
                  Nenhum pagamento registrado neste mês.
                </div>
              ) : (
                <div className="dash3-chart">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={dadosFormasPagamento} barCategoryGap={18}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="forma" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={v => `R$ ${Number(v).toFixed(2)}`} />
                      <Bar dataKey="total" radius={[10, 10, 10, 10]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
