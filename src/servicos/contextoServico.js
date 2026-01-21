import { supabase } from "./supabase";

/**
 * Lista unidades ativas
 */
export async function buscarUnidades() {
  const { data, error } = await supabase
    .from("unidades")
    .select("id, nome")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao buscar unidades:", error);
    throw error;
  }

  return data || [];
}

/**
 * Lista profissionais ativos de uma unidade
 */
export async function buscarProfissionaisPorUnidade(unidadeId) {
  const { data, error } = await supabase
    .from("profissionais_unidades")
    .select(`
      profissionais (
        id,
        nome
      )
    `)
    .eq("unidade_id", unidadeId)
    .eq("ativo", true);

  if (error) {
    console.error("Erro ao buscar profissionais por unidade:", error);
    throw error;
  }

  // transforma [{ profissionais: {...}}] => [{id,nome}]
  return (data || [])
    .map(x => x.profissionais)
    .filter(Boolean)
    .sort((a, b) => a.nome.localeCompare(b.nome));
}
