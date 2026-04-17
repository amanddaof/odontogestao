import { supabase } from "../servicos/supabase";

/**
 * Verifica se um procedimento FIXO pode ser finalizado
 * @param {number} procedimentoId
 */
export async function verificarFinalizacaoProcedimento(procedimentoId) {
  try {
    // 1. Buscar o procedimento
    const { data: procedimento, error: erroProcedimento } = await supabase
      .from("procedimentos")
      .select("*")
      .eq("id", procedimentoId)
      .single();

    if (erroProcedimento) throw erroProcedimento;

    // 👉 Só continua se for FIXO
    if (procedimento.tipo !== "fixo") return;

    // 2. Verificar se existe alguma cobrança em aberto
    const { data: cobrancasEmAberto, error: erroCobrancas } = await supabase
      .from("cobrancas")
      .select("id")
      .eq("procedimento_id", procedimentoId)
      .neq("status", "finalizado");

    if (erroCobrancas) throw erroCobrancas;

    // 3. Se NÃO houver cobranças em aberto → finaliza procedimento
    if (cobrancasEmAberto.length === 0) {
      await supabase
        .from("procedimentos")
        .update({ status: "finalizado" })
        .eq("id", procedimentoId);
    }
  } catch (error) {
    console.error("Erro ao verificar finalização do procedimento:", error);
  }
}