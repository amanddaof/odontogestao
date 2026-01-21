import { supabase } from "./supabase";

/**
 * Busca pagamentos por mês/ano
 * + Filtra por unidade_id (localStorage)
 * + Filtra por profissional_id (localStorage) ✅
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
      tipo,
      unidade_id,
      profissional_id,
      pacientes ( id, nome ),
      formas_pagamento ( id, nome )
    `)
    .gte("data_pagamento", inicio.toISOString())
    .lt("data_pagamento", fim.toISOString())
    .order("data_pagamento", { ascending: true });

  // filtra por unidade
  if (unidadeId) {
    query = query.eq("unidade_id", Number(unidadeId));
  }

  // filtra por profissional ✅ (evita misturar pagamentos)
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
 * - garante unidade_id e profissional_id se não vierem do form ✅
 */
export async function inserirPagamento(dados) {
  const unidadeId = localStorage.getItem("unidade_id");
  const profissionalId = localStorage.getItem("profissional_id");

  const payload = {
    ...dados,
    unidade_id: dados.unidade_id ?? (unidadeId ? Number(unidadeId) : null),
    profissional_id:
      dados.profissional_id ?? (profissionalId ? Number(profissionalId) : null)
  };

  const { error } = await supabase.from("pagamentos").insert([payload]);

  if (error) {
    console.error("Erro ao inserir pagamento:", error);
    throw error;
  }
}
