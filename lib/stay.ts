import type { BadgeTone } from '@/components/ui/badge';
import { formatDay } from '@/lib/format';
import type { PaymentOptionId } from '@/lib/booking';
import type { StayStatus } from '@/store/app-store';

export type StayCopy = {
  statusLabel: string;
  headline: string;
  subtitle: string;
};

/** Libellés du séjour selon son avancement. */
export function getStayCopy(status: StayStatus, arrival: number, departure: number): StayCopy {
  switch (status) {
    case 'encours':
      return {
        statusLabel: 'Séjour en cours',
        headline: 'Vous êtes chez nous',
        subtitle: `Départ le ${formatDay(departure)}, avant 12 h.`,
      };
    case 'termine':
      return {
        statusLabel: 'Séjour terminé',
        headline: 'Séjour terminé',
        subtitle: 'Merci de votre visite. La facture est disponible dans vos réservations.',
      };
    default:
      return {
        statusLabel: 'Séjour à venir',
        headline: `J − ${arrival}`,
        subtitle: `Arrivée le ${formatDay(arrival)}, à partir de 14 h.`,
      };
  }
}

/** Badge de statut de paiement affiché sur la carte de séjour. */
export function getPaymentBadge(
  option: PaymentOptionId | null,
  status: StayStatus
): { label: string; tone: BadgeTone } {
  if (option === 'arrivee') {
    return { label: 'À régler sur place', tone: 'destructive' };
  }
  if (option === 'integral' || status === 'termine') {
    return { label: 'Payé', tone: 'onDark' };
  }
  return { label: 'Acompte réglé', tone: 'onDark' };
}

/** Badge de statut affiché dans l'historique des réservations. */
export function getReservationBadge(status: StayStatus): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'encours':
      return { label: 'En cours', tone: 'dark' };
    case 'termine':
      return { label: 'Terminée', tone: 'muted' };
    default:
      return { label: 'Confirmée', tone: 'dark' };
  }
}
