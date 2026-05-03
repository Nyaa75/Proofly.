# Proofly

> Certifiez votre travail freelance. Un identifiant unique, une analyse IA, une page publique immuable.

---

## Stack

- **Next.js 14** App Router + TypeScript
- **Tailwind CSS** — design institutionnel (Cormorant Garamond + IBM Plex)
- **Supabase** — Auth (email + Google OAuth) · PostgreSQL · Storage
- **Anthropic** — Claude claude-sonnet-4-20250514 avec web_search
- **Stripe** — Checkout · Webhooks · Abonnements

---

## Démarrage rapide

### 1. Installation

```bash
cd proofly
npm install
cp .env.example .env.local
```

### 2. Variables d'environnement

Renseignez `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

ANTHROPIC_API_KEY=sk-ant-...

STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_AGENCY_PRICE_ID=price_...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase — Base de données

Ouvrez le **SQL Editor** dans votre projet Supabase et exécutez `supabase/schema.sql`.

Ce script crée :
- `proofs` — table des certifications avec RLS
- `subscriptions` — table des abonnements Stripe
- Bucket `proofs` dans Supabase Storage
- Politiques RLS pour chaque table
- Vue `proofs_with_plan`

### 4. Supabase — Auth

Dans **Authentication > Providers** :
- ✅ Email (activé par défaut)
- ✅ Google OAuth — ajoutez vos credentials Google Cloud

Dans **Authentication > URL Configuration** :
```
Site URL: http://localhost:3000
Redirect URLs: http://localhost:3000/auth/callback
```

### 5. Stripe — Produits

Dans le dashboard Stripe, créez deux produits récurrents :
- **Pro** — 9€/mois → copiez le `price_id` → `STRIPE_PRO_PRICE_ID`
- **Agency** — 29€/mois → copiez le `price_id` → `STRIPE_AGENCY_PRICE_ID`

### 6. Stripe — Webhook local

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copiez le `whsec_...` affiché → `STRIPE_WEBHOOK_SECRET`

### 7. Lancement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

---

## Architecture des pages

| Route | Description |
|-------|-------------|
| `/` | Landing page avec pricing |
| `/dashboard` | Liste des certifications de l'utilisateur |
| `/new` | Formulaire de soumission en 4 étapes |
| `/cert/[id]` | Page publique et immuable du certificat |

## API Routes

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/analyze` | POST | Analyse IA via Claude (vérifie quota) |
| `/api/stripe/checkout` | POST | Crée une session Stripe Checkout |
| `/api/stripe/webhook` | POST | Reçoit les événements Stripe |
| `/api/og` | GET | Génère l'image OG SVG pour chaque certificat |
| `/auth/callback` | GET | Callback OAuth Supabase |

---

## Fonctionnalités

### Analyse IA
- Claude claude-sonnet-4-20250514 analyse le contenu (texte, image, PDF, frame vidéo)
- `web_search` tool activé pour les URLs (analyse le contenu de la page)
- Retourne : score 0-100, résumé, étapes vérifiées, signaux humains, mots-clés, flags

### Sécurité
- Limite freemium **vérifiée côté serveur** (pas côté client)
- RLS Supabase sur toutes les tables
- Webhook Stripe vérifié par signature

### Partage
- Page `/cert/[id]` 100% publique, sans auth requise
- Meta OG tags dynamiques (titre, score, statut)
- Image OG SVG générée à la volée
- Boutons LinkedIn + copie de lien

### Hachage
- SHA-256 calculé côté client avant upload
- Stocké en base pour garantir l'immutabilité

---

## Déploiement (Vercel)

```bash
vercel --prod
```

Variables à configurer dans Vercel :
- Toutes les variables de `.env.local`
- `NEXT_PUBLIC_APP_URL=https://proofly.app`

Webhook Stripe en production :
- URL : `https://proofly.app/api/stripe/webhook`
- Événements : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
