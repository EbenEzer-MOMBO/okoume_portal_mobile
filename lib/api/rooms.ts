import { apiRequest } from '@/lib/api/client';
import { mapChambre, mapEquipement } from '@/lib/api/map';
import { ChambreDisponible, DisponibiliteResponse, Equipement } from '@/lib/api/types';

type AvailabilityPayload = {
  chambres?: unknown[];
  periode?: DisponibiliteResponse['periode'];
};

/** GET /api/chambres/disponibilite — public. */
export async function getAvailability(from: string, to: string): Promise<DisponibiliteResponse> {
  const params = new URLSearchParams({ from, to });
  const data = await apiRequest<AvailabilityPayload>(`/api/chambres/disponibilite?${params.toString()}`);
  return {
    chambres: (data.chambres ?? []).map(mapChambre),
    periode: data.periode ?? { from, to, nuits: 1 },
  };
}

/** GET /api/chambres — public. Catalogue complet des chambres. */
export async function getAllRooms(): Promise<ChambreDisponible[]> {
  const data = await apiRequest<{ chambres?: unknown[] }>('/api/chambres');
  return (data.chambres ?? []).map(mapChambre);
}

/** GET /api/equipements — public. Retourne la liste des équipements avec icones. */
export async function getEquipements(): Promise<Equipement[]> {
  const data = await apiRequest<{ equipements?: unknown[] }>('/api/equipements');
  return (data.equipements ?? []).map(mapEquipement);
}

/** GET /api/chambres/[id]/indisponibilites — public. Retourne les dates déjà réservées. */
export async function getRoomUnavailableDates(chambreId: number): Promise<string[]> {
  const data = await apiRequest<{ dates: string[] }>(`/api/chambres/${chambreId}/indisponibilites`);
  return data.dates ?? [];
}

