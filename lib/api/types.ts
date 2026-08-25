/** Types du contrat backend — voir docs/API_ENDPOINTS.md. */

export type ChambreDisponible = {
  id: number;
  numero: string;
  type_chambre: string;
  tarif_nuit: number;
  capacite: number;
  amenites: string[];
  photo_url: string | null;
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
  reference: string;
  statut: ReservationStatut;
  clientNom: string;
  chambre: { numero: string; type_chambre: string };
  dateArrivee: string;
  dateDepart: string;
};

export type MenuItem = {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  categorie?: string;
  disponible: boolean;
  photo_url?: string | null;
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
};

export type SyncStatusResponse = {
  isOnline: boolean;
};
