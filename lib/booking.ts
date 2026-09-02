import { countNights } from '@/lib/format';

export type PaymentOptionId = 'integral';

export type Quote = {
  nights: number;
  subtotal: number;
  total: number;
  /** Montant à régler : intégralité du séjour */
  due: number;
  /** Reste à régler sur place */
  balance: number;
};

export function computeQuote(
  nightlyPrice: number,
  arrival: number,
  departure: number,
  _paymentOption?: unknown
): Quote {
  const nights = countNights(arrival, departure);
  const subtotal = nightlyPrice * nights;
  const total = subtotal;

  return { nights, subtotal, total, due: total, balance: 0 };
}

export const PAYMENT_OPTIONS: {
  id: PaymentOptionId;
  label: string;
  hint: string;
  amountOf: (quote: Quote) => number;
}[] = [
  { id: 'integral', label: 'Règlement intégral', hint: 'Paiement total du séjour', amountOf: (q) => q.total },
];

