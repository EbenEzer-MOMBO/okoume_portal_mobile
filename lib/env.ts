import Constants from 'expo-constants';

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

function lanHostnameFromExpo(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;
  try {
    const { hostname } = new URL(hostUri.includes('://') ? hostUri : `http://${hostUri}`);
    if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') return null;
    return hostname;
  } catch {
    return null;
  }
}

const fromEnv = process.env.EXPO_PUBLIC_API_URL;
const lanHost = lanHostnameFromExpo();
const looksLocal =
  !fromEnv || fromEnv.includes('localhost') || fromEnv.includes('127.0.0.1');

/** Base URL de l'API. En Expo Go, on privilégie l'IP LAN de Metro (pas localhost). */
export const API_URL =
  lanHost && looksLocal ? `http://${lanHost}:3000` : (fromEnv ?? 'https://yahotel.ga');

if (__DEV__) {
  console.log(`[api] API_URL=${API_URL}`);
}


