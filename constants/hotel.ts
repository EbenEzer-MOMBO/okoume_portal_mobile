import { ImageSourcePropType } from 'react-native';

export type Room = {
  id: string;
  name: string;
  /** Prix par nuit en FCFA */
  price: number;
  capacity: number;
  size: string;
  view: string;
  /** Stock faible — affiche le badge « Dernières chambres » */
  lowStock: boolean;
  amenities: string[];
  description: string;
};

export const ROOMS: Room[] = [
  {
    id: 'ogooue',
    name: 'Chambre Ogooué',
    price: 85000,
    capacity: 2,
    size: '24 m²',
    view: 'Vue jardin',
    lowStock: false,
    amenities: ['Lit queen size', 'Climatisation', 'Wi-Fi fibre', 'Bureau', 'Coffre-fort', 'Petit-déjeuner'],
    description:
      "Une chambre calme ouverte sur le jardin intérieur, meublée en bois d'okoumé local. Idéale pour un séjour d'affaires ou une escale de quelques nuits.",
  },
  {
    id: 'ivindo',
    name: 'Chambre Ivindo',
    price: 110000,
    capacity: 2,
    size: '30 m²',
    view: 'Vue mer',
    lowStock: true,
    amenities: ['Lit king size', 'Balcon vue mer', 'Climatisation', 'Wi-Fi fibre', 'Machine à café', 'Petit-déjeuner'],
    description:
      "Chambre d'angle avec balcon privatif face à l'estuaire. Lumière naturelle toute la journée, literie king size et coin salon en rotin tressé.",
  },
  {
    id: 'loango',
    name: 'Suite Loango',
    price: 165000,
    capacity: 3,
    size: '48 m²',
    view: 'Terrasse privée',
    lowStock: false,
    amenities: ['Chambre séparée', 'Terrasse privée', 'Salon', 'Baignoire', 'Wi-Fi fibre', 'Petit-déjeuner'],
    description:
      'Une suite en deux espaces, salon et chambre, prolongée par une terrasse privée orientée au couchant. Service de conciergerie inclus.',
  },
];

export const DEFAULT_ROOM_ID = 'ivindo';

/** Taxe de séjour forfaitaire, en FCFA. */
export const STAY_TAX = 4500;

/** Part de l'acompte lorsque le client choisit « Acompte ». */
export const DEPOSIT_RATE = 0.3;

export const ROOM_TYPES = [
  'Toutes les chambres',
  'Chambre double',
  'Suite',
  'Suite présidentielle',
] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

/** Type de chambre sans disponibilité — pilote l'état vide des résultats. */
export const UNAVAILABLE_ROOM_TYPE: RoomType = 'Suite présidentielle';

export const GUEST_OPTIONS = [
  { value: '1', label: '1 personne' },
  { value: '2', label: '2 personnes' },
  { value: '3', label: '3 personnes' },
  { value: '4', label: '4 personnes' },
];

export const PRICE_FILTERS = ['< 100 000', '100 – 180 000', '> 180 000'];
export const AMENITY_FILTERS = ['Vue mer', 'Terrasse', 'Baignoire', 'Petit-déjeuner'];

export const ALTERNATIVE_DATES = [
  { label: '19 → 22 septembre', arrival: 19, departure: 22 },
  { label: '26 → 29 septembre', arrival: 26, departure: 29 },
];

export type PaymentMethod = {
  id: string;
  name: string;
  hint: string;
  initials: string;
  color: string;
  logo?: ImageSourcePropType;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'moov',
    name: 'Moov Money',
    hint: 'Validation par code USSD',
    initials: 'MM',
    color: '#1C1B19',
    logo: require('@/assets/images/moov_money.png'),
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    hint: 'Validation sur votre mobile',
    initials: 'AM',
    color: '#8B7355',
    logo: require('@/assets/images/airtel_money.png'),
  },
  { id: 'clickpay', name: 'ClickPay', hint: 'Redirection sécurisée', initials: 'CP', color: '#57534E' },
  {
    id: 'carte',
    name: 'Carte bancaire',
    hint: 'Visa, Mastercard',
    initials: 'CB',
    color: '#3F3B37',
    logo: require('@/assets/images/visa.png'),
  },
];

export const HOTEL = {
  name: 'Hôtel Okoumé',
  city: 'Libreville',
  address: 'Boulevard du Bord de Mer, Libreville',
  phone: '+241 11 44 22 08',
  checkIn: 'dès 14 h',
  checkOut: 'avant 12 h',
  cancellationNotice: "Annulation gratuite jusqu'à 48 h avant l'arrivée.",
} as const;

/** Réservations passées (lecture seule). */
export type PastReservation = {
  id: string;
  reference: string;
  roomName: string;
  dates: string;
  meta: string;
  nights: number;
  nightlyPrice: number;
  tax: number;
  paymentLabel: string;
};

export const PAST_RESERVATIONS: PastReservation[] = [
  {
    id: 'okm-2026-0117',
    reference: 'OKM-2026-0117',
    roomName: 'Chambre Ogooué',
    dates: '3 → 6 mars 2026',
    meta: '3 → 6 mars 2026 · 3 nuits · 2 personnes',
    nights: 3,
    nightlyPrice: 85000,
    tax: 4500,
    paymentLabel: 'Moov Money · ****4417',
  },
  {
    id: 'okm-2025-0842',
    reference: 'OKM-2025-0842',
    roomName: 'Suite Loango',
    dates: '14 → 16 décembre 2025',
    meta: '14 → 16 décembre 2025 · 2 nuits · 2 personnes',
    nights: 2,
    nightlyPrice: 165000,
    tax: 4500,
    paymentLabel: 'Carte bancaire · ****2210',
  },
];

/** Utilisateur de démonstration (remplacé par Clerk en production). */
export const DEMO_USER = {
  firstName: 'Aurélie',
  lastName: 'Mbadinga',
  initials: 'AM',
  email: 'aurelie.mbadinga@gmail.com',
  phone: '+241 66 12 34 56',
  country: 'Gabon',
} as const;
