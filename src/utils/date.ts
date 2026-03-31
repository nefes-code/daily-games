import moment from "moment-timezone";

const TZ = "America/Sao_Paulo";

/** Retorna a data de hoje no fuso de Brasília, formato YYYY-MM-DD */
export function getToday(): string {
  return moment.tz(TZ).format("YYYY-MM-DD");
}

/**
 * Formata uma string de data para exibição.
 * Aceita strings no formato YYYY-MM-DD ou ISO timestamp.
 *
 * Para colunas `date` do banco (ex: playedAt), o drizzle serializa como
 * meia-noite UTC ("2026-03-30T00:00:00.000Z"). Aplicar timezone causaria
 * exibição do dia anterior, então sempre extraímos só a parte da data.
 */
export function formatDateBR(date: string, fmt = "DD/MM"): string {
  const datePart = date.length > 10 ? date.split("T")[0] : date;
  return moment(datePart, "YYYY-MM-DD").format(fmt);
}

/** Retorna a data de 30 dias atrás no fuso de Brasília, à meia-noite */
export function thirtyDaysAgo(): Date {
  return moment.tz(TZ).subtract(30, "days").startOf("day").toDate();
}
