import { DEPOSIT_RATE, Room, STAY_TAX } from '@/constants/hotel';
import { countNights } from '@/lib/format';

export type PaymentOptionId = 'acompte' | 'integral' | 'arrivee';

export type Quote = {
  nights: number;
  subtotal: number;
  tax: number;
  total: number;
  /** Montant à régler immédiatement selon la modalité choisie. */
  due: number;
  /** Reste à régler sur place. */
  balance: number;
};

export function computeQuote(
  room: Room,
  arrival: number,
  departure: number,
  paymentOption: PaymentOptionId | null
): Quote {
  const nights = countNights(arrival, departure);
  const subtotal = room.price * nights;
  const total = subtotal + STAY_TAX;
  const due =
    paymentOption === 'integral' ? total : paymentOption === 'acompte' ? Math.round(total * DEPOSIT_RATE) : 0;

  return { nights, subtotal, tax: STAY_TAX, total, due, balance: total - due };
}

export const PAYMENT_OPTIONS: {
  id: PaymentOptionId;
  label: string;
  hint: string;
  amountOf: (quote: Quote) => number;
}[] = [
  {
    id: 'acompte',
    label: 'Acompte de 30 %',
    hint: "Solde réglé à l'arrivée",
    amountOf: (q) => Math.round(q.total * DEPOSIT_RATE),
  },
  { id: 'integral', label: 'Solde intégral', hint: 'Tout est réglé maintenant', amountOf: (q) => q.total },
  {
    id: 'arrivee',
    label: "Paiement à l'arrivée",
    hint: "Aucun montant prélevé aujourd'hui",
    amountOf: () => 0,
  },
];
