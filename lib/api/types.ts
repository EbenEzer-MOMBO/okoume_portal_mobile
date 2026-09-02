/** Types du contrat backend — voir docs/API_ENDPOINTS.md. */

export type ChambreDisponible = {
  id: number;
  numero: string;
  type_chambre: string;
  tarif_nuit: number;
  capacite: number;
  amenites: string[];
  /** URL principale de la première photo (compatibilité). */
  photo_url: string | null;
  /** Galerie complète de photos. */
  photos: string[];
};

/** Équipement avec icône image URL depuis /api/equipements */
export type Equipement = {
  id: number;
  nom: string;
  iconeUrl: string | null;
};

export type DisponibiliteResponse = {
  chambres: ChambreDisponible[];
  periode: { from: string; to: string; nuits: number };
};

export type ReservationStatut = 'en_attente' | 'confirmee' | 'annulee' | 'checkin' | 'checkout';

export type DemandeReservationPayload = {
  clientNom: string;
  clientEmail: string;
  clientTel: string;
  chambreId: number;
  dateArrivee: string;
  dateDepart: string;
  notes?: string;
};

export type DemandeReservationResponse = {
  success: boolean;
  reference: string;
  message: string;
};

export type ReservationDetail = {
  id: number;
  reference: string;
  statut: ReservationStatut;
  clientNom: string;
  chambre: { numero: string; type_chambre: string; photoUrl?: string | null };
  dateArrivee: string;
  dateDepart: string;
  nombreNuits?: number;
  montantTotal?: number;
};

export type MenuItem = {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  categorie?: string;
  disponible: boolean;
  photo_url?: string | null;
  isPlatDuJour?: boolean;
  outOfStock?: boolean;
  stock?: number;
};

export type RoomServiceItemPayload = {
  menuItemId: number;
  quantite: number;
  notes?: string;
};

export type RoomServiceOrderPayload = {
  chambreNumero: string;
  referenceReservation: string;
  items: RoomServiceItemPayload[];
};

export type RoomServiceOrderResponse = {
  success: boolean;
  commandeId: number;
  statut: string;
};

export type ModePaiement = 'moov_money' | 'airtel_money' | 'clickpay' | 'carte_bancaire';

export type InitierPaiementPayload = {
  reference: string;
  montant: number;
  modePaiement: ModePaiement;
  telephonePaiement?: string;
};

export type InitierPaiementResponse = {
  success: boolean;
  statut: 'en_attente';
  message: string;
  transactionId?: string;
};

export type SyncStatusResponse = {
  isOnline: boolean;
  lastSyncAt?: string | null;
  counts?: {
    reservations: number;
    dossiers: number;
    chambres: number;
    stocks: number;
    plats: number;
    commandes: number;
  };
};

export type SendOtpResponse = {
  success: boolean;
  message: string;
};

export type VerifyOtpResponse = {
  success: boolean;
  token: string;
};

export type CommandeItemDetail = {
  id: number;
  nom: string;
  quantite: number;
  prixUnitaire: string | number;
};

export type CommandeClient = {
  id: number;
  statut: string;
  typeCommande: string;
  modePaiement: string | null;
  total: string | number;
  createdAt: string;
  clientNom?: string | null;
  clientTelephone?: string | null;
  adresseLivraison?: string | null;
  chambre?: { id: number; numero: string; typeChambre?: string } | null;
  items: CommandeItemDetail[];
};

