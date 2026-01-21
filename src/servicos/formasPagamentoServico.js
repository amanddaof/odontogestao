import { supabase } from "./supabase";

/**
 * Busca todas as formas de pagamento cadastradas
 */
export async function buscarFormasPagamento() {
  const { data, error } = await supabase
    .from("formas_pagamento")
    .select("id, nome")
    .order("nome");

  if (error) {
    console.error("Erro ao buscar formas de pagamento:", error);
    throw error;
  }

  return data;
}
