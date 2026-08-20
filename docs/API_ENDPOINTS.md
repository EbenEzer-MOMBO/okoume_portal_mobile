# API_ENDPOINTS.md — Kina Hôtel (Okoume Portal)

> Copie de la documentation backend (`okoume_portal/API_ENDPOINTS.md`), tenue à jour
> manuellement à chaque changement d'API côté serveur. La documentation de référence
> reste **`/api-docs`** (Swagger UI) sur le déploiement backend.
>
> **Statut côté app mobile (Expo) au moment de cette copie** : les 10 endpoints du
> parcours client ci-dessous sont implémentés côté backend, mais l'app mobile ne fait
> encore aucun appel réseau (données et navigation simulées localement). Voir
> `prompts_app_client.md` dans ce dossier pour le plan d'écrans prévu.

## Parcours réservation client (web ou mobile)

```
CLIENT (web ou mobile, anonyme ou Clerk)

  1. GET /api/chambres/disponibilite?from=...&to=...
     Voir les chambres disponibles sur la période

  2. POST /api/reservations/demande
     Soumettre la demande (statut: en_attente)
     Email de confirmation enfilé pour le client

  3. GET /api/reservations/{ref}
     Suivre le statut de sa demande via la référence

RECEPTION (dashboard desktop ou web)

  4. GET /api/reservations/en-attente
     Voir les demandes à traiter

  5. PATCH /api/reservations/{ref}/statut { statut: "confirmee" | "annulee" }
     Confirmer ou refuser — re-vérifie la disponibilité au moment de la confirmation
     Email de réponse enfilé pour le client

INVITÉ EN SÉJOUR (statut réservation = checkin, Clerk requis)

  6. GET /api/menu
     Consulter le menu du restaurant

  7. POST /api/commandes/room-service
     Commander depuis la chambre — prix calculés côté serveur

  8. POST /api/paiements/initier
     Initier un paiement mobile — implémentation stub, ne débite jamais réellement
```

## Authentification côté API

Un helper unique (`src/lib/api-auth.ts` côté backend) résout l'acteur de chaque requête :

- JWT interne (`okoume_session`, cookie ou `Authorization: Bearer`) → staff
- Session Clerk (`Authorization: Bearer <token Clerk>`) avec une ligne dans `utilisateurs` → staff, rôle lu en base
- Session Clerk sans ligne dans `utilisateurs` → invité (guest)
- Aucune identité → anonyme

Pour l'app mobile Expo : utiliser `@clerk/clerk-expo` et envoyer le token Clerk en
`Authorization: Bearer <token>`. Un utilisateur Clerk sans compte staff est traité comme
invité — c'est le chemin normal pour un client de l'hôtel.

Routes publiques (aucune auth) : `GET /api/chambres/disponibilite`, `POST /api/reservations/demande`,
`GET /api/reservations/{ref}`, `GET /api/menu`.
Routes nécessitant un Bearer Clerk (invité ou staff) : `POST /api/commandes/room-service`,
`POST /api/paiements/initier`.
Routes réservées au staff (`reception`/`direction`) : `GET /api/reservations/en-attente`,
`PATCH /api/reservations/{ref}/statut`.

## Limites connues côté backend

- **Paiement** : `POST /api/paiements/initier` est un stub. Aucun agrégateur (Clickpay,
  Airtel Money, Moov) n'est réellement intégré — voir `src/lib/paiements/provider.ts`.
  Répond toujours `statut: "en_attente"`, ne débite jamais. Le client doit poller
  `GET /api/reservations/{ref}` pour l'état final.
- **Email** : `email_queue` est consommée via Resend si `RESEND_API_KEY` est défini côté
  serveur ; sinon les emails restent en statut `pending`.
- **Concurrence** : deux demandes simultanées sur la même chambre peuvent toutes deux
  passer en `en_attente` — c'est volontaire. Le point de sérialisation réel est la
  confirmation staff (`PATCH .../statut`), qui revérifie la disponibilité et rejette en
  409 si un conflit est apparu entretemps.
- **Room service** : nécessite que la réservation soit au statut `checkin` et que le
  `chambreNumero` envoyé corresponde à la chambre réservée (403 sinon). Les prix ne sont
  jamais pris depuis la requête — toujours recalculés serveur depuis le menu.
