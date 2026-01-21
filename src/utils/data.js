export function formatarDataBR(dataISO) {
  if (!dataISO) return "";

  // dataISO vem tipo "2026-01-13"
  const [ano, mes, dia] = dataISO.split("-");

  return `${dia}/${mes}/${ano}`;
}
