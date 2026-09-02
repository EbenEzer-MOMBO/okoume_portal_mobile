import { API_URL } from '@/lib/env';
import { ChambreDisponible, Equipement, MenuItem, ReservationDetail, ReservationStatut } from '@/lib/api/types';

function asNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(n) ? n : 0;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : String(value ?? '');
}

function pick<T>(record: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key] as T;
  }
  return undefined;
}

/** Absolue une URL d'image (chemin Next `/…` ou URL Cloudinary). */
export function resolveMediaUrl(url: unknown, extras?: unknown): string | null {
  const fromList = Array.isArray(extras) && typeof extras[0] === 'string' ? extras[0] : null;
  const raw = (typeof url === 'string' && url) || fromList;
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/')) return `${API_URL}${raw}`;
  return raw;
}

export function mapChambre(raw: unknown): ChambreDisponible {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const amenites = pick<unknown>(r, 'amenites');
  // Map the full photos array
  const photosRaw = r.photos;
  const photos: string[] = Array.isArray(photosRaw)
    ? photosRaw
        .filter((p): p is string => typeof p === 'string')
        .map((p) => resolveMediaUrl(p))
        .filter((p): p is string => p !== null)
    : [];
  const photo_url = resolveMediaUrl(pick(r, 'photo_url', 'photoUrl'), photosRaw) ?? (photos[0] ?? null);
  return {
    id: asNumber(r.id),
    numero: asString(r.numero),
    type_chambre: asString(pick(r, 'type_chambre', 'typeChambre')),
    tarif_nuit: asNumber(pick(r, 'tarif_nuit', 'tarifNuit')),
    capacite: asNumber(r.capacite),
    amenites: Array.isArray(amenites) ? amenites.filter((a): a is string => typeof a === 'string') : [],
    photo_url,
    photos,
  };
}

export function mapEquipement(raw: unknown): Equipement {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    id: asNumber(r.id),
    nom: asString(r.nom),
    iconeUrl: resolveMediaUrl(pick(r, 'iconeUrl', 'icone_url')),
  };
}

export function mapMenuItem(raw: unknown): MenuItem {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const stockRaw = pick<unknown>(r, 'stock');
  const stock = typeof stockRaw === 'number' ? stockRaw : undefined;

  return {
    id: asNumber(r.id),
    nom: asString(r.nom),
    description: typeof r.description === 'string' ? r.description : undefined,
    prix: asNumber(r.prix),
    categorie: typeof r.categorie === 'string' ? r.categorie : undefined,
    disponible: Boolean(r.disponible),
    photo_url: resolveMediaUrl(pick(r, 'photo_url', 'photoUrl')),
    isPlatDuJour: Boolean(pick(r, 'isPlatDuJour', 'is_plat_du_jour')),
    outOfStock: Boolean(pick(r, 'outOfStock', 'out_of_stock')),
    stock,
  };
}

const STATUTS: ReservationStatut[] = ['en_attente', 'confirmee', 'annulee', 'checkin', 'checkout'];

export function mapReservationDetail(raw: unknown): ReservationDetail {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const chambreRaw = r.chambre && typeof r.chambre === 'object' ? (r.chambre as Record<string, unknown>) : {};
  const statut = asString(r.statut);
  const photoUrl = resolveMediaUrl(pick(chambreRaw, 'photoUrl', 'photo_url', 'photos'))
    ?? (Array.isArray(chambreRaw.photos) && chambreRaw.photos[0] ? resolveMediaUrl(chambreRaw.photos[0]) : null)
    ?? (Array.isArray(r.chambrePhotos) && r.chambrePhotos[0] ? resolveMediaUrl(r.chambrePhotos[0]) : null);

  return {
    id: asNumber(r.id),
    reference: asString(r.reference),
    statut: STATUTS.includes(statut as ReservationStatut) ? (statut as ReservationStatut) : 'en_attente',
    clientNom: asString(pick(r, 'clientNom', 'client_nom')),
    chambre: {
      numero: asString(pick(chambreRaw, 'numero', 'chambreNumero')),
      type_chambre: asString(pick(chambreRaw, 'type_chambre', 'typeChambre', 'chambreType')),
      photoUrl,
    },
    dateArrivee: asString(pick(r, 'dateArrivee', 'date_arrivee')),
    dateDepart: asString(pick(r, 'dateDepart', 'date_depart')),
    nombreNuits: asNumber(pick(r, 'nombreNuits', 'nombre_nuits')),
    montantTotal: asNumber(pick(r, 'montantTotal', 'montant_total')),
  };
}
