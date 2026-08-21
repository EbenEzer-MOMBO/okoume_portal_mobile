/** Formate un montant en francs CFA : 85000 → « 85 000 FCFA ». */
export function formatAmount(amount: number): string {
  if (!Number.isFinite(amount)) return '—';
  return `${String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
}

/**
 * Le calendrier de recherche reste borné à un mois unique (simplicité de l'UI) :
 * les dates sont manipulées comme des quantièmes de septembre 2026.
 */
export const BOOKING_MONTH_LABEL = 'Septembre 2026';
export const BOOKING_MONTH_DAYS = 30;
export const BOOKING_MONTH = 9;
export const BOOKING_YEAR = 2026;
/** Premier jour sélectionnable (les jours antérieurs sont passés). */
export const FIRST_SELECTABLE_DAY = 8;
/** Décalage du 1er septembre 2026 (mardi) dans une semaine commençant le lundi. */
export const MONTH_START_OFFSET = 1;

export function formatDay(day: number): string {
  return `${day} sept. 2026`;
}

/** Convertit un quantième du mois de recherche en date ISO pour l'API (YYYY-MM-DD). */
export function toISODate(day: number): string {
  return `${BOOKING_YEAR}-${String(BOOKING_MONTH).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Extrait le quantième d'une date ISO (YYYY-MM-DD) renvoyée par l'API. */
export function dayFromISODate(iso: string): number {
  return Number(iso.split('-')[2]);
}

export function formatRange(arrival: number, departure: number): string {
  return `${arrival} → ${formatDay(departure)}`;
}

export function countNights(arrival: number, departure: number): number {
  return Math.max(1, departure - arrival);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count > 1 ? plural : singular}`;
}
