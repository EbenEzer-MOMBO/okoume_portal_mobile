import { ImageSourcePropType } from 'react-native';

import { ModePaiement } from '@/lib/api/types';

/**
 * Taxe de séjour forfaitaire appliquée côté client. L'API de disponibilité ne renvoie
 * qu'un tarif par nuit (`tarif_nuit`) — aucune ligne de taxe n'est documentée côté serveur.
 * À vérifier/ajuster dès que le backend expose un calcul de devis serveur.
 */
export const STAY_TAX = 4500;

/** Part de l'acompte lorsque le client choisit « Acompte ». Règle purement côté client. */
export const DEPOSIT_RATE = 0.3;

export const ROOM_TYPES = [
  'Toutes les chambres',
  'Chambre double',
  'Suite',
  'Suite présidentielle',
] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export const GUEST_OPTIONS = [
  { value: '1', label: '1 personne' },
  { value: '2', label: '2 personnes' },
  { value: '3', label: '3 personnes' },
  { value: '4', label: '4 personnes' },
];

export const PRICE_FILTERS = ['< 100 000', '100 – 180 000', '> 180 000'];
export const AMENITY_FILTERS = ['Vue mer', 'Terrasse', 'Baignoire', 'Petit-déjeuner'];

export type PaymentMethod = {
  /** Valeur envoyée telle quelle dans `modePaiement` — à confirmer contre l'énumération réelle du backend. */
  id: ModePaiement;
  name: string;
  hint: string;
  initials: string;
  color: string;
  logo?: ImageSourcePropType;
  /** Ce mode exige un numéro de téléphone (mobile money). */
  requiresPhone: boolean;
  comingSoon?: boolean;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'moov_money',
    name: 'Moov Money',
    hint: 'Validation par code USSD',
    initials: 'MM',
    color: '#1C1B19',
    logo: require('@/assets/images/moov_money.png'),
    requiresPhone: true,
  },
  {
    id: 'airtel_money',
    name: 'Airtel Money',
    hint: 'Validation sur votre mobile',
    initials: 'AM',
    color: '#8B7355',
    logo: require('@/assets/images/airtel_money.png'),
    requiresPhone: true,
  },
  {
    id: 'clickpay',
    name: 'Clikpay',
    hint: 'Redirection sécurisée',
    initials: 'CP',
    color: '#57534E',
    logo: require('@/assets/images/clikpay-logo.png'),
    requiresPhone: false,
    comingSoon: true,
  },
  {
    id: 'carte_bancaire',
    name: 'Carte bancaire',
    hint: 'Visa, Mastercard',
    initials: 'CB',
    color: '#3F3B37',
    logo: require('@/assets/images/visa.png'),
    requiresPhone: false,
    comingSoon: true,
  },
];

export const HOTEL = {
  name: 'Ya Hôtel',
  city: 'Koumameyong',
  address: 'Koumameyong, Gabon',
  phone: '+241 060 27 90 94',
  checkIn: 'dès 14 h',
  checkOut: 'avant 12 h',
  cancellationNotice: "Annulation gratuite jusqu'à 48 h avant l'arrivée.",
} as const;
