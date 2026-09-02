/** Formate un montant en francs CFA : 85000 → « 85 000 FCFA ». */
export function formatAmount(amount: number): string {
  if (!Number.isFinite(amount)) return '—';
  return `${String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
}

/**
 * Le calendrier de recherche reste borné à un mois unique (simplicité de l'UI) :
 * les dates sont manipulées comme des quantièmes de septembre 2026.
 */
export const BOOKING_MONTH_LABEL = 'Calendrier des séjours';
export const FIRST_SELECTABLE_DAY = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
})();
export const MONTH_START_OFFSET = 1;

export function formatDay(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Convertit un timestamp en date ISO pour l'API (YYYY-MM-DD). */
export function toISODate(timestamp: number): string {
  const date = new Date(timestamp);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Extrait le timestamp d'une date ISO (YYYY-MM-DD) renvoyée par l'API. */
export function dayFromISODate(iso: string): number {
  return new Date(iso).getTime();
}

export function formatRange(arrival: number, departure: number): string {
  return `${formatDay(arrival)} → ${formatDay(departure)}`;
}

export function countNights(arrival: number, departure: number): number {
  const diffTime = Math.abs(departure - arrival);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count > 1 ? plural : singular}`;
}
