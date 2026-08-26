import { useAuth } from '@clerk/expo';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/lib/api/client';
import { createReservationRequest, getMyReservations, getReservationByReference } from '@/lib/api/reservations';
import { DemandeReservationPayload } from '@/lib/api/types';
import { useGuestTokenPresent } from '@/lib/queries/auth';
import { useAppStore } from '@/store/app-store';

/** Latence de rafraîchissement du statut de réservation pendant le suivi actif. */
const POLL_INTERVAL_MS = 5000;

/** Une référence introuvable (404) est définitive : inutile de réessayer ou de continuer à poller. */
function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

export function useReservation(reference: string | null, options: { poll?: boolean } = {}) {
  return useQuery({
    queryKey: ['reservation', reference],
    queryFn: () => getReservationByReference(reference as string),
    enabled: !!reference,
    retry: (failureCount, error) => !isNotFound(error) && failureCount < 3,
    refetchInterval: (query) => (options.poll && !isNotFound(query.state.error) ? POLL_INTERVAL_MS : false),
  });
}

/** Réservation la plus récente suivie sur cet appareil (bandeau « Mon séjour », etc.). */
export function useActiveStay(options: { poll?: boolean } = {}) {
  const { activeReference } = useAppStore();
  return { reference: activeReference, query: useReservation(activeReference, options) };
}

/** Historique : session (Clerk ou invité OTP) si possible, sinon références locales. */
export function useTrackedReservations() {
  const { state } = useAppStore();
  const { isSignedIn } = useAuth();
  const hasGuestToken = useGuestTokenPresent();
  const hasSession = Boolean(isSignedIn || hasGuestToken);

  const mine = useQuery({
    queryKey: ['reservations', 'mine', isSignedIn, hasGuestToken],
    queryFn: getMyReservations,
    enabled: hasSession,
    retry: false,
  });

  const local = useQueries({
    queries: state.trackedReferences.map((reference) => ({
      queryKey: ['reservation', reference],
      queryFn: () => getReservationByReference(reference),
      enabled: !mine.data,
    })),
  });

  if (mine.data) {
    return {
      isLoading: mine.isLoading,
      reservations: mine.data,
    };
  }

  return {
    isLoading: local.length > 0 && local.some((q) => q.isLoading),
    reservations: local.map((q) => q.data).filter((r) => !!r),
  };
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DemandeReservationPayload) => createReservationRequest(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reservation', data.reference] });
      queryClient.invalidateQueries({ queryKey: ['reservations', 'mine'] });
    },
  });
}
