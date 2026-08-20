/**
 * Variables d'environnement exposées côté client (préfixe EXPO_PUBLIC_).
 * Centralisées ici pour échouer tôt et clairement si l'une manque.
 */
function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}. Voir .env.example.`);
  }
  return value;
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const CLERK_PUBLISHABLE_KEY = requireEnv(
  'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY',
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
);
