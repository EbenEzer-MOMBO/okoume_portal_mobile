import { useAuth } from '@clerk/expo';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

import { createReservationRequest, getMyReservations, getReservationByReference } from '@/lib/api/reservations';
import { DemandeReservationPayload } from '@/lib/api/types';
import { getGuestToken, subscribeGuestSession } from '@/lib/auth/guest-session';
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

export function useGuestTokenPresent() {
  return useSyncExternalStore(subscribeGuestSession, getGuestToken, () => null);
}

/** Historique : session (Clerk / invité) si possible, sinon références locales. */
export function useTrackedReservations() {
  const { state } = useAppStore();
  const { isSignedIn } = useAuth();
  const guestToken = useGuestTokenPresent();
  const hasSession = Boolean(isSignedIn || guestToken);

  const mine = useQuery({
    queryKey: ['reservations', 'mine', guestToken, isSignedIn],
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
