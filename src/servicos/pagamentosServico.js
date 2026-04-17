import { supabase } from "./supabase";

/**
 * Busca pagamentos por mês/ano
 * + Filtra por unidade_id (localStorage)
 * + Filtra por profissional_id (localStorage)
 */
export async function buscarPagamentosPorMes(ano, mes) {
  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 1);

  const unidadeId = localStorage.getItem("unidade_id");
  const profissionalId = localStorage.getItem("profissional_id");

  let query = supabase
    .from("pagamentos")
    .select(`
      id,
      data_pagamento,
      valor,
      nf,

      pacientes ( id, nome ),
      formas_pagamento ( id, nome ),

      cobrancas (
        id,
        descricao,
        valor_total,
        valor_pago,
        procedimentos (
          id,
          descricao
        )
      )
    `)
    .gte("data_pagamento", inicio.toISOString().split("T")[0])
    .lt("data_pagamento", fim.toISOString().split("T")[0])
    .order("data_pagamento", { ascending: true });

  if (unidadeId) {
    query = query.eq("unidade_id", Number(unidadeId));
  }

  if (profissionalId) {
    query = query.eq("profissional_id", Number(profissionalId));
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar pagamentos:", error);
    throw error;
  }

  return data;
}

/**
 * Insere novo pagamento
 */
export async function inserirPagamento(dados) {
  if (!dados.cobranca_id) {
    throw new Error("Pagamento precisa de uma cobrança vinculada");
  }

  const unidadeId = localStorage.getItem("unidade_id");
  const profissionalId = localStorage.getItem("profissional_id");

  const payload = {
    ...dados,
    unidade_id: dados.unidade_id ?? Number(unidadeId),
    profissional_id: dados.profissional_id ?? Number(profissionalId)
  };

  const { error } = await supabase
    .from("pagamentos")
    .insert([payload]);

  if (error) {
    console.error("Erro ao inserir pagamento:", error);
    throw error;
  }
}

/**
 * 🔥 Busca opções de procedimento/cobrança para o select
 */
export async function buscarOpcoesProcedimento(pacienteId) {
  if (!pacienteId) return [];

  // 🔹 1. Cobranças abertas
  const { data: cobrancas, error: erroCobrancas } = await supabase
    .from("cobrancas")
    .select(`
      id,
      descricao,
      data,
      valor_total,
      valor_pago,
      procedimento_id
    `)
    .eq("paciente_id", pacienteId)
    .eq("status", "aberto");

  if (erroCobrancas) {
    console.error("Erro ao buscar cobranças:", erroCobrancas);
    throw erroCobrancas;
  }

  // 🔹 2. Procedimentos ativos
  const { data: procedimentos, error: erroProcedimentos } = await supabase
    .from("procedimentos")
    .select(`
      id,
      descricao,
      tipo,
      valor_total,
      valor_mensal
    `)
    .eq("paciente_id", pacienteId)
    .eq("status", "ativo");

  if (erroProcedimentos) {
    console.error("Erro ao buscar procedimentos:", erroProcedimentos);
    throw erroProcedimentos;
  }

  const opcoes = [];

  // 🔥 Mapa de procedimentos que já têm cobrança
  const procedimentosComCobranca = new Set(
    cobrancas.map((c) => c.procedimento_id)
  );

  // ✅ cobranças abertas (com saldo)
  cobrancas.forEach((c) => {
    const restante = (c.valor_total || 0) - (c.valor_pago || 0);

    if (restante > 0) {
      opcoes.push({
        tipo: "cobranca",
        id: c.id,
        procedimento_id: c.procedimento_id,
        restante,
        descricao: `${c.descricao} • ${formatarData(c.data)} • falta R$ ${restante.toFixed(2)}`
      });
    }
  });

  // ✅ procedimentos (novo lançamento)
  procedimentos.forEach((p) => {
    // 🔥 REGRA: FIXO não pode ter nova cobrança se já existir uma
    if (p.tipo === "fixo" && procedimentosComCobranca.has(p.id)) {
      return;
    }

    opcoes.push({
      tipo: "procedimento",
      id: p.id,
      descricao: p.descricao,
      valor_total: p.valor_total,
      valor_mensal: p.valor_mensal,
      tipo_procedimento: p.tipo
    });
  });

  return opcoes;
}

// helper
function formatarData(data) {
  if (!data) return "";
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR");
}