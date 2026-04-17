import { supabase } from "./supabase";

export async function inserirProcedimento(dados) {
  const unidadeId = localStorage.getItem("unidade_id");
  const profissionalId = localStorage.getItem("profissional_id");

  const payload = {
    ...dados,
    unidade_id: unidadeId ? Number(unidadeId) : null,
    profissional_id: profissionalId ? Number(profissionalId) : null
  };

  const { error } = await supabase
    .from("procedimentos")
    .insert([payload]);

  if (error) {
    console.error("Erro detalhado:", error);
    throw error;
  }
}

export async function buscarProcedimentosPorPaciente(pacienteId) {
  const { data, error } = await supabase
    .from("procedimentos")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar procedimentos:", error);
    throw error;
  }

  return data;
}