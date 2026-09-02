import type { BadgeTone } from '@/components/ui/badge';
import type { ReservationStatut } from '@/lib/api/types';
import { formatDay } from '@/lib/format';

export type StayCopy = {
  statusLabel: string;
  headline: string;
  subtitle: string;
};

/** Libellés du séjour selon le statut réel renvoyé par l'API. */
export function getStayCopy(statut: ReservationStatut, arrival: number, departure: number): StayCopy {
  switch (statut) {
    case 'confirmee':
      return {
        statusLabel: 'Séjour à venir',
        headline: `J − ${arrival}`,
        subtitle: `Arrivée le ${formatDay(arrival)}, à partir de 14 h.`,
      };
    case 'checkin':
      return {
        statusLabel: 'Séjour en cours',
        headline: 'Vous êtes chez nous',
        subtitle: `Départ le ${formatDay(departure)}, avant 12 h.`,
      };
    case 'checkout':
      return {
        statusLabel: 'Séjour terminé',
        headline: 'Séjour terminé',
        subtitle: 'Merci de votre visite. La facture est disponible dans vos réservations.',
      };
    case 'annulee':
      return {
        statusLabel: 'Demande refusée',
        headline: 'Demande refusée',
        subtitle: 'Cette demande n’a pas été confirmée. Contactez la réception pour plus d’informations.',
      };
    case 'en_attente':
    default:
      return {
        statusLabel: 'Demande envoyée',
        headline: 'En attente de confirmation',
        subtitle: 'La réception va examiner votre demande et vous répondra sous 24 h.',
      };
  }
}

/** Badge de statut affiché sur fond clair (historique, détail passé). */
export function getStatutBadge(statut: ReservationStatut): { label: string; tone: BadgeTone } {
  switch (statut) {
    case 'confirmee':
      return { label: '✓ Payée en ligne — Check-in à finaliser', tone: 'dark' };
    case 'checkin':
      return { label: 'Séjour en cours (Check-in actif)', tone: 'dark' };
    case 'checkout':
      return { label: 'Terminée', tone: 'muted' };
    case 'annulee':
      return { label: 'Refusée', tone: 'destructive' };
    case 'en_attente':
    default:
      return { label: 'Paiement en attente', tone: 'muted' };
  }
}
