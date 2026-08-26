import * as SecureStore from 'expo-secure-store';

const GUEST_TOKEN_KEY = 'okoume.guestToken';

let memoryToken: string | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeGuestSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** À appeler une fois au démarrage pour recharger le jeton persistant (voir `token-bridge.tsx`). */
export async function hydrateGuestToken(): Promise<string | null> {
  const stored = await SecureStore.getItemAsync(GUEST_TOKEN_KEY);
  memoryToken = stored;
  notify();
  return stored;
}

export function getGuestToken(): string | null {
  return memoryToken;
}

export async function setGuestToken(token: string): Promise<void> {
  memoryToken = token;
  await SecureStore.setItemAsync(GUEST_TOKEN_KEY, token);
  notify();
}

export async function clearGuestToken(): Promise<void> {
  memoryToken = null;
  await SecureStore.deleteItemAsync(GUEST_TOKEN_KEY);
  notify();
}

/**
 * Lecture d'affichage uniquement (email) : le payload du JWT n'est pas vérifié ici,
 * la vérification de signature reste du ressort exclusif du backend (`verifyGuestToken`).
 */
export function decodeGuestEmail(token: string): string | null {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const json = globalThis.atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { email?: string };
    return typeof payload.email === 'string' ? payload.email : null;
  } catch {
    return null;
  }
}
