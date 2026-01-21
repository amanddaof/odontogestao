import { supabase } from "./supabase";

export async function login(usuario, senha) {
  const { data, error } = await supabase
    .from("usuarios")
    .select(`
      id,
      tipo,
      usuario,
      profissional_id,
      unidade_padrao_id,
      ativo
    `)
    .eq("usuario", usuario)
    .eq("senha_hash", senha)
    .eq("ativo", true)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export function salvarSessao(dados) {
  localStorage.setItem("usuario_id", String(dados.id));
  localStorage.setItem("tipo_usuario", String(dados.tipo));
  localStorage.setItem("profissional_id", String(dados.profissional_id));
  localStorage.setItem("unidade_id", String(dados.unidade_padrao_id));
}

export function logout() {
  localStorage.removeItem("usuario_id");
  localStorage.removeItem("tipo_usuario");
  localStorage.removeItem("profissional_id");
  localStorage.removeItem("unidade_id");
}

export function estaLogado() {
  return Boolean(localStorage.getItem("usuario_id"));
}
