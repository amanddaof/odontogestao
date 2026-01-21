import { supabase } from "./supabase";

export async function buscarProfissionalLogado() {
  const profissionalId = localStorage.getItem("profissional_id");

  if (!profissionalId) return null;

  const { data, error } = await supabase
    .from("profissionais")
    .select("id, nome")
    .eq("id", Number(profissionalId))
    .single();

  if (error) {
    console.error("Erro ao buscar profissional logado:", error);
    return null;
  }

  return data;
}
