# Okoumé — App mobile Client

Application mobile (Expo SDK 54 / React Native) permettant aux clients de l'Hôtel Okoumé
de rechercher une chambre, réserver, payer, suivre leur séjour et commander en room service.

L'interface est l'implémentation du prototype Claude Design **App Client Okoumé**, branchée
sur l'API réelle `okoume_portal` documentée dans `docs/API_ENDPOINTS.md`.

## Démarrer

```bash
npm install
cp .env.example .env.local   # renseigner EXPO_PUBLIC_API_URL si le backend n'est pas en local
npx expo start
```

`EXPO_PUBLIC_API_URL` doit pointer vers une instance joignable de `okoume_portal` (voir
`.env.example` — sur un appareil physique, utilisez l'IP de votre machine, pas `localhost`).

## Parcours implémentés

| # | Écran | Route |
| --- | --- | --- |
| 01 | Splash | `app/index.tsx` |
| 02 | Connexion / Inscription (Clerk) | `app/login.tsx` |
| 03 | Accueil · recherche de disponibilité | `app/(tabs)/index.tsx` |
| 04 | Résultats de recherche | `app/resultats.tsx` |
| 05 | Fiche chambre | `app/chambre/[roomId].tsx` |
| 06 | Récapitulatif de réservation | `app/recapitulatif.tsx` |
| 07 | Paiement | `app/paiement.tsx` |
| 08 | Confirmation | `app/confirmation.tsx` |
| 09 | Mon séjour | `app/(tabs)/sejour.tsx` |
| 10 | Historique des réservations | `app/(tabs)/reservations.tsx` |
| 11 | Détail d'une réservation passée | `app/reservation/[id].tsx` |
| 12 | Profil / Paramètres | `app/(tabs)/profil.tsx` |
| 13 | Notifications | `app/(tabs)/notifications.tsx` |
| 14 | Menu room service *(nouveau)* | `app/menu.tsx` |
| 15 | Panier room service *(nouveau)* | `app/room-service-panier.tsx` |

## Organisation du code

```
app/                     routes expo-router (Stack racine + groupe (tabs))
components/ui/           primitives du design system (Text, Button, Card, BottomSheet…)
components/booking/      composants métier réservation (RoomCard, PaymentOptionCard…)
components/stay/         composants métier séjour (StayBanner, HotelContactCard)
components/room-service/ composants métier room service (MenuItemCard)
components/navigation/   barre d'onglets personnalisée
constants/theme.ts       jetons du design system (couleurs, typographie, espacements, rayons)
constants/hotel.ts       données statiques restantes (coordonnées hôtel, modes de paiement)
lib/api/                 client HTTP + un module par ressource du backend
lib/queries/             hooks React Query (cache, chargement, erreurs, polling de statut)
lib/auth/                pont entre le token Clerk et la couche API
lib/booking.ts           calcul du devis (nuits × tarif + taxe de séjour côté client)
lib/format.ts            formatage FCFA, dates, conversion vers l'ISO attendu par l'API
lib/stay.ts              libellés/badges dérivés du statut réel de réservation
store/app-store.tsx      état client (recherche, chambre sélectionnée, références suivies)
store/room-service-cart.tsx panier room service
```

## Design system

Toutes les valeurs de style proviennent de `constants/theme.ts` — aucun hex ni taille de
police n'est écrit en dur dans les écrans.

- **Couleurs** : noir bois `#1C1B19`, brun okoumé `#8B7355` (accent), crème `#F7F4EF`,
  crème clair `#FAF9F6`, cartes blanches, rouge `#EF4444` réservé aux erreurs.
- **Typographie** : Fraunces (serif) pour les titres et les montants, Inter pour l'UI,
  IBM Plex Mono pour les références de réservation. Les graisses utilisées sont chargées
  individuellement via `@expo-google-fonts` pour limiter la taille du bundle.
- **Composants** : chaque primitive expose des variantes typées (`<Text variant="title">`,
  `<Button variant="outline">`, `<Badge tone="muted">`) plutôt que des styles ad hoc.

## Données et API réelle

L'app appelle directement `okoume_portal` (voir `docs/API_ENDPOINTS.md`) : disponibilité des
chambres, demande de réservation, suivi par référence, menu, commande room service et
initiation de paiement. Authentification via `@clerk/expo` (email + mot de passe, avec
vérification par code si l'instance Clerk l'exige).

Limites assumées, documentées en commentaire aux endroits concernés :

- **Paiement** (`POST /api/paiements/initier`) est un stub côté backend : il ne débite jamais
  et répond toujours `en_attente`. L'écran Paiement affiche un état d'attente avec polling du
  statut réel, plus une action explicite pour continuer sans attendre indéfiniment.
- Aucun endpoint ne liste les réservations d'un client : l'Historique suit localement (sur
  l'appareil) les références créées, chacune rafraîchie via `GET /api/reservations/{ref}`.
- Aucun endpoint de facture, de notifications ou de préférences pour les invités : la facture
  est marquée « bientôt disponible », les notifications sont dérivées localement des
  changements de statut observés, les préférences restent locales.
- La taxe de séjour et la répartition acompte/solde sont calculées côté client
  (`lib/booking.ts`) car l'API de disponibilité ne renvoie qu'un tarif par nuit.
