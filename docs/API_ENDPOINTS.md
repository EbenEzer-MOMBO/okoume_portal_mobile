# API_ENDPOINTS.md — Kina Hôtel (Okoume Portal)

> Ce fichier complète la spécification OpenAPI `API_SPEC.yaml`.
> Il liste les **endpoints manquants** à créer et les **anomalies** connues.
> La spec OpenAPI documente uniquement ce qui existe et a été **vérifié dans le code**.

---

## 1. Anomalies Connues (endpoints existants mais défaillants ou incomplets)

### [CRITIQUE] `GET /api/reservations` — Filtre de dates silencieusement ignoré

**Fichier :** `src/app/api/reservations/route.ts`

```ts
// Les paramètres sont lus mais JAMAIS appliqués :
const dateStart = searchParams.get('from')
const dateEnd = searchParams.get('to')
const allReservations = await query // ← query sans WHERE
```

**Impact :** L'app web qui ferait `GET /api/reservations?from=2026-08-20&to=2026-08-25`
pour vérifier la disponibilité recevra TOUTES les réservations, pas celles de la période.

**Correction requise :** Appliquer les conditions `dateArrivee >= from AND dateDepart <= to`
dans la requête Drizzle.

---

### [MOYEN] `GET /api/auth/sync` — Rôle lu depuis Clerk, pas depuis la BDD

**Fichier :** `src/app/api/auth/sync/route.ts`

Le JWT interne encode le rôle depuis `user.publicMetadata?.role` (Clerk).
Mais le rôle de référence est dans la table `utilisateurs` (BDD PostgreSQL).
Si un admin modifie le rôle en BDD sans le répercuter dans les métadonnées Clerk,
le JWT sera incorrectement généré.

**Correction recommandée :** Faire un lookup dans `utilisateurs` par `clerkId`
avant de générer le JWT.

---

### [MOYEN] `POST /api/reservations` — Authentification incohérente avec GET

Le `GET` appelle `await verifySession()` sans passer `request` (cookie uniquement).
Le `POST` appelle `await verifySession(request)` (cookie + header Authorization).
Le `GET` ne peut donc pas être appelé avec un header Bearer, seulement via cookie.

---

### [MINEUR] `replicatedData.clients` dans `/api/sync` — `doc_cni_url` non inclus

La réponse de sync réplique les clients mais omet `doc_cni_url` :

```ts
clients: serverClients.map(c => ({
  id: c.id, nom: c.nom, email: c.email, telephone: c.telephone, adresse: c.adresse
  // doc_cni_url manquant ici
}))
```

L'app Desktop ne peut pas pré-charger la CNI d'un client existant depuis la réplication.

---

## 2. Endpoints Manquants — À Créer

Le flux complet Réservation Client vers Réception n'est pas implémenté côté backend.
La table `reservations` et l'endpoint `POST /api/reservations` existent,
mais le mécanisme de notification réception et la consultation des demandes en attente
sont absents.

---

### `GET /api/chambres/disponibilite` — Vérifier la disponibilité (public)

**Pourquoi :** `GET /api/chambres` retourne le statut courant des chambres
(`libre/occupee`), pas la disponibilité pour une **période future**.

```
GET /api/chambres/disponibilite?from=2026-09-01&to=2026-09-05
```

**Réponse attendue :**
```json
{
  "chambres": [
    {
      "id": 3,
      "numero": "105",
      "type_chambre": "standard",
      "tarif_nuit": 46000,
      "capacite": 2,
      "amenites": ["WiFi", "Climatisation"],
      "photo_url": "https://..."
    }
  ],
  "periode": { "from": "2026-09-01", "to": "2026-09-05", "nuits": 4 }
}
```

**Accès :** Public (aucune authentification requise).

---

### `POST /api/reservations/demande` — Soumettre une demande de séjour (public)

**Pourquoi :** `POST /api/reservations` requiert un cookie `okoume_session`,
donc inaccessible à un client visiteur du site web sans compte staff.

**Comportement attendu :**
- Crée une réservation avec statut `en_attente`
- Envoie un email de confirmation au client (via `email_queue`)

**Body request :**
```json
{
  "clientNom": "Annie Fink",
  "clientEmail": "annie@example.com",
  "clientTel": "065389340",
  "chambreId": 3,
  "dateArrivee": "2026-09-01",
  "dateDepart": "2026-09-05",
  "notes": "Chambre non-fumeur si possible"
}
```

**Body response (201) :**
```json
{
  "success": true,
  "reference": "RES-2609-XZ7AB",
  "message": "Votre demande a été reçue. La réception vous contactera sous 24h."
}
```

**Accès :** Public.

---

### `GET /api/reservations/en-attente` — Consulter les demandes en attente

**Pourquoi :** Le dashboard réception doit voir et traiter les demandes entrantes.
`GET /api/reservations` retourne tout sans filtrage exploitable facilement.

```
GET /api/reservations/en-attente
```

Retourne les réservations avec `statut = 'en_attente'`, triées par `created_at DESC`.

**Accès :** `reception`, `direction`.

---

### `PATCH /api/reservations/:id/statut` — Confirmer ou refuser une demande

**Pourquoi :** La réception doit pouvoir accepter ou refuser une demande client.

**Body request :**
```json
{
  "statut": "confirmee",
  "notes": "Bienvenue au Kina Hotel."
}
```

Statuts valides : `confirmee` | `annulee`.

**Effets attendus :**
- Met à jour `statut` en BDD
- Envoie un email de confirmation ou refus au client
- Si `confirmee` : bloque le créneau pour éviter les doubles réservations

**Accès :** `reception`, `direction`.

---

### `GET /api/reservations/:reference` — Suivi d'une réservation par le client

**Pourquoi :** Permet au client de vérifier le statut de sa demande depuis le web ou mobile.

**Accès :** Public (référence unique, pas d'authentification).

**Body response :**
```json
{
  "reference": "RES-2609-XZ7AB",
  "statut": "confirmee",
  "clientNom": "Annie Fink",
  "chambre": { "numero": "105", "type_chambre": "standard" },
  "dateArrivee": "2026-09-01",
  "dateDepart": "2026-09-05"
}
```

---

---

## 3. Flux Restauration & Room Service — À Créer

Les équipes mobile et web ont besoin d'interagir avec le restaurant. Actuellement, seul le point de vente (Desktop Tauri) peut créer des commandes via la synchronisation locale (`/api/sync`). Il faut des endpoints REST standards pour les autres applications.

### `GET /api/menu` — Consulter le menu (public)
**Pourquoi :** Permet à l'application client (web/mobile) d'afficher les plats et boissons disponibles.
**Réponse attendue :** Liste des `MenuItem` où `disponible = true`.

### `POST /api/menu` — Créer/Modifier un plat (staff)
**Pourquoi :** Permet au back-office web ou mobile d'ajouter des plats (actuellement, seul le Desktop le fait via sync).
**Accès :** `restauration`, `direction`.

### `POST /api/commandes/room-service` — Commander depuis la chambre (client)
**Pourquoi :** Le client est dans sa chambre et utilise l'application mobile/web pour commander un repas.
**Body request :**
```json
{
  "chambreNumero": "105",
  "referenceReservation": "RES-2609-XZ7AB",
  "items": [
    { "menuItemId": 12, "quantite": 2, "notes": "Sans oignons" }
  ]
}
```
**Effet :** Crée une `CommandePos` en statut `en_cours` rattachée à la réservation. La restauration doit recevoir une notification.

### `GET /api/commandes` — Liste des commandes (staff)
**Pourquoi :** Permet au back-office mobile/web du restaurant de voir les commandes entrantes (room service ou table).

---

## 4. Flux Paiement & Finance — À Créer

### `POST /api/paiements/initier` — Payer en ligne (client)
**Pourquoi :** Permet au client de payer sa réservation ou son room service en ligne (Clikpay, Airtel Money, Moov).
**Body request :**
```json
{
  "reference": "RES-2609-XZ7AB",
  "montant": 46000,
  "modePaiement": "airtel_money",
  "telephonePaiement": "074000000"
}
```

### `GET /api/transactions` — Tableau de bord financier
**Pourquoi :** La table `transactions` est alimentée par le sync desktop,
mais il n'existe **aucun endpoint GET** pour la consulter depuis le web ou l'app direction.

```
GET /api/transactions?from=2026-08-01&to=2026-08-31&source=hotel
```
**Accès :** `direction`.

---

## 5. Flux Réservation Client — Séquence Complète

```
CLIENT (web ou mobile)

  1. GET /api/chambres/disponibilite?from=...&to=...
     Voir les chambres disponibles sur la période  [A CREER]

  2. POST /api/reservations/demande
     Soumettre la demande (statut: en_attente)  [A CREER]
     Email de confirmation envoyé au client

  3. GET /api/reservations/:reference
     Suivre le statut de sa demande  [A CREER]

RECEPTION (dashboard desktop ou web)

  4. GET /api/reservations/en-attente
     Voir les demandes à traiter  [A CREER]

  5. PATCH /api/reservations/:id/statut { statut: "confirmee" }
     Confirmer ou refuser  [A CREER]
     Email de réponse envoyé au client

  6. Check-in physique via Desktop Tauri
     POST /api/sync avec action CREATE_RESERVATION  [EXISTANT]
```

---

## 4. Tableau de Bord des Endpoints Existants

| Endpoint | Methode | Usage | Authentification | Statut |
|---|---|---|---|---|
| `/api/auth/sync` | GET | Login Desktop, génère JWT interne | Clerk | Operationnel |
| `/api/auth/me` | GET | Profil utilisateur courant | Clerk | Operationnel |
| `/api/auth/me` | POST | Mise à jour profil + avatar Cloudinary | Clerk | Operationnel |
| `/api/auth/logout` | POST | Déconnexion (supprime cookie) | Aucune | Operationnel |
| `/api/user-role` | GET | Rôle pour routage Desktop | Clerk | Operationnel |
| `/api/chambres` | GET | Liste toutes les chambres | Aucune (public) | Operationnel |
| `/api/chambres` | PATCH | Modifier le statut d'une chambre | JWT interne | Operationnel |
| `/api/reservations` | GET | Lister les réservations | JWT interne | Defaillant (filtre dates ignore) |
| `/api/reservations` | POST | Créer une réservation (staff) | JWT interne | Partiel (exclut clients publics) |
| `/api/sync` | POST | Sync Desktop -> Serveur (14 actions) | Clerk | Operationnel |
| `/api/upload` | POST | Upload image chambre ou avatar | JWT interne | Operationnel |
| `/api/upload-doc` | POST | Upload CNI ou fiche police | Clerk | Operationnel |

---

## 5. Accès à la Documentation Interactive

La documentation Swagger UI est accessible en local à :

```
http://localhost:3000/api-docs
```

Elle est générée à partir du fichier `API_SPEC.yaml` situé à la racine du projet.
Pour la mettre à jour, modifier `API_SPEC.yaml` directement — aucune régénération manuelle requise.

> Recommandation : restreindre l'accès à `/api-docs` en production
> (middleware d'authentification ou variable d'environnement `NODE_ENV`).
