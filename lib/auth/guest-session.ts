import * as SecureStore from 'expo-secure-store';

const GUEST_TOKEN_KEY = 'okoume.guestToken';

export type GuestProfile = { email: string; nom: string; clientId: number };

let memoryToken: string | null = null;
let memoryProfile: GuestProfile | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function applyToken(token: string | null) {
  memoryToken = token;
  memoryProfile = token ? decodeGuestToken(token) : null;
}

export function subscribeGuestSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function hydrateGuestToken(): Promise<string | null> {
  const stored = await SecureStore.getItemAsync(GUEST_TOKEN_KEY);
  applyToken(stored);
  notify();
  return stored;
}

export function getGuestToken(): string | null {
  return memoryToken;
}

export async function setGuestToken(token: string): Promise<void> {
  applyToken(token);
  await SecureStore.setItemAsync(GUEST_TOKEN_KEY, token);
  notify();
}

export async function clearGuestToken(): Promise<void> {
  applyToken(null);
  await SecureStore.deleteItemAsync(GUEST_TOKEN_KEY);
  notify();
}

export function decodeGuestToken(token: string): GuestProfile | null {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const json = globalThis.atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { email?: string; nom?: string; clientId?: number };
    if (typeof payload.email !== 'string' || typeof payload.nom !== 'string') return null;
    return { email: payload.email, nom: payload.nom, clientId: Number(payload.clientId) };
  } catch {
    return null;
  }
}

export function getGuestProfile(): GuestProfile | null {
  return memoryProfile;
}
