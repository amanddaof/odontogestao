import { supabase } from "./supabase";
import { verificarFinalizacaoProcedimento } from "../calculos/verificarFinalizacaoProcedimento";

export async function criarCobranca({ paciente_id, procedimento, data }) {
  const valorTotal =
    procedimento.tipo_procedimento === "fixo"
      ? Number(procedimento.valor_total)
      : Number(procedimento.valor_mensal);

  if (!valorTotal || valorTotal <= 0) {
    throw new Error("Procedimento sem valor definido");
  }

  const { data: novaCobranca, error } = await supabase
    .from("cobrancas")
    .insert([
      {
        paciente_id,
        procedimento_id: procedimento.id,
        descricao: procedimento.descricao, // ✔ nome limpo (sem "(novo)")
        data,
        valor_total: valorTotal,
        valor_pago: 0,
        status: "aberto"
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar cobrança:", error);
    throw error;
  }

  return novaCobranca;
}

export async function atualizarCobranca(cobrancaId) {
  // pega pagamentos dessa cobrança
  const { data: pagamentos } = await supabase
    .from("pagamentos")
    .select("valor")
    .eq("cobranca_id", cobrancaId);

  const totalPago =
    pagamentos?.reduce((s, p) => s + Number(p.valor || 0), 0) || 0;

  // 🔥 pega cobrança atual (agora com procedimento_id também)
  const { data: cobranca } = await supabase
    .from("cobrancas")
    .select("valor_total, procedimento_id")
    .eq("id", cobrancaId)
    .single();

  const status = totalPago >= cobranca.valor_total ? "finalizado" : "aberto";

  const { error } = await supabase
    .from("cobrancas")
    .update({
      valor_pago: totalPago,
      status
    })
    .eq("id", cobrancaId);

  if (error) {
    console.error("Erro ao atualizar cobrança:", error);
    throw error;
  }

  // 🔥🔥🔥 AQUI É O PONTO QUE RESOLVE TUDO
  if (status === "finalizado") {
    await verificarFinalizacaoProcedimento(cobranca.procedimento_id);
  }
}