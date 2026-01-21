import { supabase } from "./supabase";

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

  return data;
}
