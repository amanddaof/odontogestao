import { supabase } from "./supabase";

export async function buscarPacientes() {
  const unidadeId = localStorage.getItem("unidade_id");
  const profissionalId = localStorage.getItem("profissional_id");

  let query = supabase
    .from("pacientes")
    .select(`
  id,
  nome,
  unidade_id,
  profissional_id,

  cobrancas (
    id,
    valor_total,
    valor_pago,
    status
  ),

  pagamentos (
    id,
    valor,
    data_pagamento,
    formas_pagamento ( nome ),
    cobrancas (
      id,
      descricao,
      procedimentos ( descricao )
    )
  )
`)
    .order("nome", { ascending: true });

  if (unidadeId) {
    query = query.eq("unidade_id", Number(unidadeId));
  }

  if (profissionalId) {
    query = query.eq("profissional_id", Number(profissionalId));
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar pacientes:", error);
    throw error;
  }

  return data;
}

/**
 * Alias para manter compatibilidade com Dashboard.jsx
 */
export async function buscarPacientesPorUnidade() {
  return buscarPacientes();
}

export async function buscarPacientePorId(id) {
  const unidadeId = localStorage.getItem("unidade_id");
  const profissionalId = localStorage.getItem("profissional_id");

  let query = supabase
    .from("pacientes")
    .select(`
  id,
  nome,
  cpf,
  telefone,
  endereco,
  data_nascimento,
  unidade_id,
  profissional_id,

  cobrancas (
    id,
    valor_total,
    valor_pago,
    status
  ),

  profissionais (
    id,
    nome
  ),

  pagamentos (
    id,
    valor,
    data_pagamento,
    formas_pagamento ( nome ),
    cobrancas (
      id,
      descricao,
      valor_total,
      valor_pago,
      procedimentos ( descricao )
    )
  )
`)
    .eq("id", id);

  if (unidadeId) {
    query = query.eq("unidade_id", Number(unidadeId));
  }

  if (profissionalId) {
    query = query.eq("profissional_id", Number(profissionalId));
  }

  const { data, error } = await query.single();

  if (error) {
    console.error("Erro ao buscar paciente:", error);
    throw error;
  }

  return data;
}

/**
 * ✅ Insere novo paciente
 */
export async function inserirPaciente(dados) {
  const unidadeId = localStorage.getItem("unidade_id");
  const profissionalId = localStorage.getItem("profissional_id");

  const payload = {
    ...dados,
    unidade_id: unidadeId ? Number(unidadeId) : null,
    profissional_id: profissionalId ? Number(profissionalId) : null
  };

  const { error } = await supabase.from("pacientes").insert([payload]);

  if (error) {
    console.error("Erro ao inserir paciente:", error);
    throw error;
  }
}