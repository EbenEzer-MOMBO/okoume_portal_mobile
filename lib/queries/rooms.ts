import { useQuery } from '@tanstack/react-query';

import { getAllRooms, getAvailability, getEquipements, getRoomUnavailableDates } from '@/lib/api/rooms';

/** Chambres disponibles sur une période. `enabled` évite l'appel tant que les dates ne sont pas valides. */
export function useAvailability(from: string, to: string, enabled: boolean) {
  return useQuery({
    queryKey: ['disponibilite', from, to],
    queryFn: () => getAvailability(from, to),
    enabled,
  });
}

/** Catalogue de toutes les chambres de l'hôtel. */
export function useAllRooms() {
  return useQuery({
    queryKey: ['chambres'],
    queryFn: () => getAllRooms(),
  });
}

/** Liste des équipements avec leurs icônes images. */
export function useEquipements() {
  return useQuery({
    queryKey: ['equipements'],
    queryFn: () => getEquipements(),
    staleTime: 1000 * 60 * 10, // 10 min
  });
}

/** Dates indisponibles pour une chambre précise (pour bloquer le calendrier). */
export function useRoomUnavailableDates(chambreId: number | null) {
  return useQuery({
    queryKey: ['chambre-indisponibilites', chambreId],
    queryFn: () => getRoomUnavailableDates(chambreId!),
    enabled: chambreId !== null,
    staleTime: 1000 * 60 * 5, // 5 min
  });
}
