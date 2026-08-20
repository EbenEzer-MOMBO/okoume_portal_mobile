import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import { createReservationRequest, getReservationByReference } from '@/lib/api/reservations';
import { DemandeReservationPayload } from '@/lib/api/types';
import { useAppStore } from '@/store/app-store';

/** Latence de rafraîchissement du statut de réservation pendant le suivi actif. */
const POLL_INTERVAL_MS = 5000;

export function useReservation(reference: string | null, options: { poll?: boolean } = {}) {
  return useQuery({
    queryKey: ['reservation', reference],
    queryFn: () => getReservationByReference(reference as string),
    enabled: !!reference,
    refetchInterval: options.poll ? POLL_INTERVAL_MS : false,
  });
}

/** Réservation la plus récente suivie sur cet appareil (bandeau « Mon séjour », etc.). */
export function useActiveStay(options: { poll?: boolean } = {}) {
  const { activeReference } = useAppStore();
  return { reference: activeReference, query: useReservation(activeReference, options) };
}

/** Toutes les réservations suivies sur cet appareil (écran Historique). */
export function useTrackedReservations() {
  const { state } = useAppStore();

  return useQueries({
    queries: state.trackedReferences.map((reference) => ({
      queryKey: ['reservation', reference],
      queryFn: () => getReservationByReference(reference),
    })),
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DemandeReservationPayload) => createReservationRequest(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reservation', data.reference] });
    },
  });
}
