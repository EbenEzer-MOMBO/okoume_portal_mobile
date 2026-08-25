import { API_URL } from '@/lib/env';

export class ApiError extends Error {
  status: number;
  /** Corps de la réponse d'erreur, quand le serveur en renvoie un (JSON ou texte). */
  body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Fournit le token Clerk courant pour les routes qui en ont besoin.
 * Posé au démarrage par `ClerkTokenBridge` (voir app/_layout.tsx) : les hooks React
 * n'ont pas leur place dans un module non-React comme celui-ci.
 */
let getAuthToken: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(getter: (() => Promise<string | null>) | null) {
  getAuthToken = getter;
}

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Ajoute l'en-tête Authorization: Bearer <token Clerk>. Échoue si aucune session. */
  authenticated?: boolean;
  signal?: AbortSignal;
};

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    // Le backend (`fail()`, src/lib/api/response.ts) renvoie `{ success: false, error }`.
    // `message` est gardé en repli pour les routes qui suivraient une autre convention.
    const record = body as Record<string, unknown>;
    if (typeof record.error === 'string' && record.error) return record.error;
    if (typeof record.message === 'string' && record.message) return record.message;
  }
  if (typeof body === 'string' && body) return body;
  return fallback;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, authenticated = false, signal } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = await getAuthToken?.();
  if (authenticated && !token) {
    throw new ApiError(401, 'Connexion requise pour cette action.');
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'erreur réseau';
    throw new ApiError(
      0,
      `Impossible de joindre le serveur (${API_URL}${path}). ${detail}`
    );
  }

  const parsed = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, extractMessage(parsed, `Erreur serveur (${response.status}).`), parsed);
  }

  return parsed as T;
}
