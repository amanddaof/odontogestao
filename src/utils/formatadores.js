export function formatarCPF(valor) {
  if (!valor) return "—";

  const numeros = String(valor).replace(/\D/g, "").slice(0, 11);

  if (numeros.length !== 11) return valor; // se estiver incompleto, mostra como veio

  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatarTelefone(valor) {
  if (!valor) return "—";

  const numeros = String(valor).replace(/\D/g, "").slice(0, 11);

  // Celular com 11 dígitos: (11) 98765-4321
  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  // Fixo com 10 dígitos: (11) 3456-7890
  if (numeros.length === 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return valor;
}
