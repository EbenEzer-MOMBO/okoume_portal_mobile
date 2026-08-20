# Okoumé — App mobile Client

Application mobile (Expo SDK 54 / React Native) permettant aux clients de l'Hôtel Okoumé
de rechercher une chambre, réserver, payer et suivre leur séjour.

L'interface est l'implémentation du prototype Claude Design **App Client Okoumé**.

## Démarrer

```bash
npm install
npx expo start
```

## Parcours implémentés

| # | Écran | Route |
| --- | --- | --- |
| 01 | Splash | `app/index.tsx` |
| 02 | Connexion / Inscription | `app/login.tsx` |
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

## Organisation du code

```
app/                routes expo-router (Stack racine + groupe (tabs))
components/ui/      primitives du design system (Text, Button, Card, Badge, BottomSheet…)
components/booking/ composants métier réservation (RoomCard, PaymentOptionCard…)
components/stay/    composants métier séjour (StayBanner, HotelContactCard)
components/navigation/ barre d'onglets personnalisée
constants/theme.ts  jetons du design system (couleurs, typographie, espacements, rayons)
constants/hotel.ts  données de l'hôtel, chambres, modes de paiement
lib/                formatage (FCFA, dates) et calcul du devis
store/app-store.tsx état applicatif partagé (recherche, réservation, notifications)
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

## Données

Les données (chambres, réservations passées, notifications, utilisateur) sont statiques et
centralisées dans `constants/hotel.ts` et `store/app-store.tsx`. L'authentification et le
paiement sont simulés : ils constituent les points de branchement pour Clerk et les
agrégateurs de paiement (Moov Money, Airtel Money, ClickPay, carte bancaire).
