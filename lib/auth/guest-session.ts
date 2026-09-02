import * as SecureStore from 'expo-secure-store';

const GUEST_TOKEN_KEY = 'okoume.guestToken';
const GUEST_PROFILE_KEY = 'okoume.guestProfile';

export type GuestProfile = {
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
};

let memoryToken: string | null = null;
let memoryProfile: GuestProfile | null = null;
let isHydrated = false;
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
  
  const storedProfile = await SecureStore.getItemAsync(GUEST_PROFILE_KEY);
  if (storedProfile) {
    try {
      memoryProfile = JSON.parse(storedProfile);
    } catch {
      memoryProfile = null;
    }
  }
  
  isHydrated = true;
  notify();
  return stored;
}

/**
 * Vrai dès que la session invité a fini d'être restaurée depuis le SecureStore.
 */
export function isGuestSessionLoaded(): boolean {
  return isHydrated;
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
  memoryProfile = null;
  await SecureStore.deleteItemAsync(GUEST_TOKEN_KEY);
  await SecureStore.deleteItemAsync(GUEST_PROFILE_KEY);
  notify();
}

export function getGuestProfile(): GuestProfile | null {
  return memoryProfile;
}

export async function setGuestProfile(
  nomOrProfile: string | GuestProfile,
  prenomParam?: string,
  telephoneParam?: string,
  emailParam?: string
): Promise<void> {
  if (typeof nomOrProfile === 'object' && nomOrProfile !== null) {
    memoryProfile = { ...memoryProfile, ...nomOrProfile };
  } else {
    memoryProfile = {
      ...memoryProfile,
      nom: nomOrProfile,
      prenom: prenomParam || '',
      ...(telephoneParam !== undefined ? { telephone: telephoneParam } : {}),
      ...(emailParam !== undefined ? { email: emailParam } : {}),
    };
  }
  await SecureStore.setItemAsync(GUEST_PROFILE_KEY, JSON.stringify(memoryProfile));
  notify();

  // Synchronisation automatique avec la base de données PostgreSQL du serveur backend (table `clients`)
  if (memoryProfile?.email) {
    try {
      const { apiRequest } = await import('@/lib/api/client');
      void apiRequest('/api/auth/profile', {
        method: 'POST',
        body: memoryProfile,
      }).catch((err) => console.warn('Synchro profil BDD backend:', err));
    } catch (e) {}
  }
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
