# Système de Newsletter - EntreCoiffeur

## 📧 Vue d'ensemble

Système complet de gestion de newsletter permettant aux utilisateurs de s'abonner depuis la page d'accueil et aux administrateurs de gérer les abonnés depuis l'interface admin.

---

## 🏗️ Architecture Backend

### Table Convex `newsletterSubscribers`

```typescript
newsletterSubscribers: defineTable({
  email: v.string(),              // Email de l'abonné
  subscribedAt: v.number(),       // Date d'abonnement (timestamp)
  isActive: v.boolean(),          // Statut actif/désactivé
  source: v.optional(v.string()), // Source d'inscription (homepage, checkout, etc.)
}).index("by_email", ["email"])
  .index("by_active", ["isActive"])
  .index("by_subscribed_date", ["subscribedAt"])
```

**Champs** :
- `email` : Adresse email unique de l'abonné
- `subscribedAt` : Timestamp de la date d'abonnement
- `isActive` : `true` = actif, `false` = désabonné
- `source` : Provenance de l'inscription (ex: "homepage", "checkout")

**Index** :
- `by_email` : Recherche rapide par email
- `by_active` : Filtrage par statut
- `by_subscribed_date` : Tri chronologique

---

## 🔧 Backend - Mutations

### Fichier : `backend/convex/functions/mutations/newsletter.ts`

#### 1. **subscribeToNewsletter**
Permet à un utilisateur de s'abonner à la newsletter.

**Arguments** :
- `email` : string (requis)
- `source` : string (optionnel, défaut: "homepage")

**Fonctionnalités** :
- ✅ Validation de l'email (regex)
- ✅ Vérification des doublons
- ✅ Réactivation automatique si l'email existe mais est inactif
- ✅ Messages de retour personnalisés

**Retour** :
```javascript
{
  success: boolean,
  message: string,
  subscriberId?: Id<"newsletterSubscribers">
}
```

#### 2. **unsubscribeFromNewsletter**
Désactive un abonné (admin uniquement).

**Arguments** :
- `subscriberId` : Id<"newsletterSubscribers">

#### 3. **reactivateSubscriber**
Réactive un abonné désactivé (admin uniquement).

**Arguments** :
- `subscriberId` : Id<"newsletterSubscribers">

#### 4. **deleteSubscriber**
Supprime définitivement un abonné (admin uniquement).

**Arguments** :
- `subscriberId` : Id<"newsletterSubscribers">

---

## 📊 Backend - Queries

### Fichier : `backend/convex/functions/queries/newsletter.ts`

#### 1. **getAllNewsletterSubscribers**
Récupère tous les abonnés (admin).

**Retour** : Array de tous les abonnés triés par date décroissante

#### 2. **getNewsletterStats**
Statistiques complètes de la newsletter (admin).

**Retour** :
```javascript
{
  total: number,              // Total des abonnés
  active: number,             // Abonnés actifs
  inactive: number,           // Abonnés désactivés
  newLastWeek: number,        // Nouveaux abonnés (7 derniers jours)
  newThisMonth: number,       // Nouveaux abonnés (mois en cours)
  bySource: Record<string, number> // Répartition par source
}
```

#### 3. **searchNewsletterSubscribers**
Recherche et filtrage des abonnés (admin).

**Arguments** :
- `searchTerm` : string (optionnel) - Recherche dans les emails
- `isActive` : boolean (optionnel) - Filtre par statut

#### 4. **checkEmailSubscribed**
Vérifie si un email est déjà abonné.

**Arguments** :
- `email` : string

**Retour** :
```javascript
{
  isSubscribed: boolean,
  isActive: boolean
}
```

---

## 🎨 Frontend - Formulaire Public

### Fichier : `frontend/src/pages/Home.jsx`

**Section Newsletter** :
- Formulaire d'abonnement avec validation
- Champ email avec icône
- Bouton "S'abonner" avec état de chargement
- Messages de succès/erreur avec emojis
- Design moderne et responsive

**Fonctionnalités** :
- ✅ Validation email côté client (regex)
- ✅ État de chargement pendant l'envoi
- ✅ Messages de feedback (succès ✅ / erreur ⚠️)
- ✅ Réinitialisation automatique du formulaire après succès
- ✅ Disparition automatique du message après 5 secondes
- ✅ Désactivation du formulaire pendant l'envoi

**États gérés** :
```javascript
const [newsletterEmail, setNewsletterEmail] = useState('')
const [newsletterLoading, setNewsletterLoading] = useState(false)
const [newsletterMessage, setNewsletterMessage] = useState('')
const [newsletterSuccess, setNewsletterSuccess] = useState(false)
```

---

## 👨‍💼 Frontend - Module Admin

### Fichier : `frontend/src/components/adminv2/NewsletterModule.jsx`

**Fonctionnalités principales** :

### 📊 Statistiques (4 KPI Cards)
1. **Total Abonnés** : Nombre total d'abonnés
2. **Actifs** : Nombre d'abonnés actifs (badge vert)
3. **Inactifs** : Nombre de désabonnés (badge gris)
4. **Cette semaine** : Nouveaux abonnés des 7 derniers jours (badge bleu)

### 🔍 Filtres et Recherche
- **Barre de recherche** : Recherche par email en temps réel
- **Filtres rapides** :
  - Tous (affiche le total)
  - Actifs (affiche le nombre d'actifs)
  - Inactifs (affiche le nombre d'inactifs)

### 📋 Table des Abonnés
**Colonnes** :
- Email (avec icône 📧)
- Statut (badge Actif ✅ / Inactif ❌)
- Date d'abonnement (format FR avec heure)
- Source (badge bleu)
- Actions (boutons)

**Actions disponibles** :
- **Toggle statut** : Activer/Désactiver un abonné
- **Supprimer** : Suppression définitive avec confirmation

### 📥 Export CSV
- Bouton "Exporter CSV" dans le header
- Génère un fichier CSV avec :
  - Email
  - Statut (Actif/Inactif)
  - Date d'abonnement
  - Source
- Nom du fichier : `newsletter-subscribers-YYYY-MM-DD.csv`

### 🗑️ Dialog de Confirmation
- Popup de confirmation avant suppression
- Affiche l'email de l'abonné
- Boutons "Annuler" et "Supprimer"
- Message d'avertissement sur l'irréversibilité

---

## 🔐 Intégration Admin

### Sidebar (`components/adminv2/Sidebar.jsx`)
- **Icône** : Mail (📧)
- **Label** : "Newsletter"
- **Position** : Entre "Avis" et "Support"
- **Permission** : `newsletter`

### AdminV2 (`pages/AdminV2.jsx`)
- Import du module `NewsletterModule`
- Rendu conditionnel avec `hasAccess('newsletter')`
- Ajout dans la liste des modules accessibles

### Permissions (`schema.ts` - adminUsers)
```typescript
newsletter: v.optional(v.boolean()) // Gestion de la newsletter
```

### SettingsModule
- Permission "Newsletter" ajoutée dans la liste
- Icône : 📧
- Label : "Newsletter"
- Contrôle d'accès granulaire par admin

---

## 🎯 Flux d'Utilisation

### Côté Utilisateur

1. **Abonnement** :
   - Utilisateur visite la page d'accueil
   - Scroll jusqu'à la section Newsletter
   - Entre son email dans le champ
   - Clique sur "S'abonner"
   - Reçoit un message de confirmation ✅
   - Email sauvegardé dans la base de données

2. **Réabonnement** :
   - Si l'email existe mais est inactif
   - Le compte est automatiquement réactivé
   - Message : "Votre abonnement a été réactivé avec succès !"

3. **Email déjà abonné** :
   - Si l'email est déjà actif
   - Message : "Cet email est déjà abonné à la newsletter"

### Côté Admin

1. **Consultation** :
   - Admin accède à `/admin`
   - Clique sur "Newsletter" dans la sidebar
   - Voit les statistiques globales
   - Consulte la liste des abonnés

2. **Recherche** :
   - Utilise la barre de recherche pour trouver un email
   - Applique des filtres (Tous/Actifs/Inactifs)
   - Résultats mis à jour en temps réel

3. **Gestion** :
   - **Désactiver** : Clique sur l'icône ❌ pour désabonner
   - **Réactiver** : Clique sur l'icône 🔄 pour réactiver
   - **Supprimer** : Clique sur l'icône 🗑️ puis confirme

4. **Export** :
   - Clique sur "Exporter CSV"
   - Fichier téléchargé automatiquement
   - Utilisable dans Excel, Google Sheets, etc.

---

## 📁 Fichiers Créés/Modifiés

### Backend
- ✅ `backend/convex/schema.ts` : Table newsletterSubscribers
- ✅ `backend/convex/functions/mutations/newsletter.ts` : 4 mutations
- ✅ `backend/convex/functions/queries/newsletter.ts` : 4 queries

### Frontend
- ✅ `frontend/src/pages/Home.jsx` : Formulaire d'abonnement
- ✅ `frontend/src/components/adminv2/NewsletterModule.jsx` : Module admin
- ✅ `frontend/src/components/adminv2/Sidebar.jsx` : Onglet Newsletter
- ✅ `frontend/src/pages/AdminV2.jsx` : Intégration du module
- ✅ `frontend/src/components/adminv2/SettingsModule.jsx` : Permission newsletter

---

## ✨ Fonctionnalités Clés

### Sécurité
- ✅ Validation email côté client et serveur
- ✅ Vérification des doublons
- ✅ Permissions admin granulaires
- ✅ Confirmation avant suppression

### UX/UI
- ✅ Design moderne et responsive
- ✅ Messages de feedback clairs
- ✅ États de chargement
- ✅ Badges visuels colorés
- ✅ Icônes intuitives

### Performance
- ✅ Index optimisés pour les recherches
- ✅ Queries filtrées côté serveur
- ✅ Mise à jour en temps réel

### Gestion
- ✅ Statistiques détaillées
- ✅ Recherche et filtres puissants
- ✅ Export CSV
- ✅ Réactivation automatique

---

## 🚀 Prochaines Améliorations Possibles

### Fonctionnalités
- [ ] Envoi d'emails de bienvenue automatique
- [ ] Campagnes d'emailing depuis l'admin
- [ ] Segmentation des abonnés (par source, date, etc.)
- [ ] Templates d'emails personnalisables
- [ ] Statistiques d'ouverture et de clics
- [ ] Désabonnement en un clic depuis les emails
- [ ] Double opt-in (confirmation par email)
- [ ] Historique des campagnes envoyées

### Analytics
- [ ] Graphiques d'évolution des abonnements
- [ ] Taux de conversion par source
- [ ] Taux de désabonnement
- [ ] Meilleurs moments d'inscription

### Intégrations
- [ ] Mailchimp
- [ ] SendGrid
- [ ] Brevo (ex-Sendinblue)
- [ ] Zapier

---

## 📝 Notes Techniques

### Validation Email
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

### Format Date
```javascript
new Date(timestamp).toLocaleDateString('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})
```

### Export CSV
```javascript
const csvContent = [
  headers.join(','),
  ...rows.map(row => row.join(','))
].join('\n')

const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
const link = document.createElement('a')
link.href = URL.createObjectURL(blob)
link.download = `newsletter-subscribers-${date}.csv`
link.click()
```

---

## 🎉 Résumé

Le système de newsletter est maintenant **100% fonctionnel** avec :
- ✅ Formulaire d'abonnement sur la page d'accueil
- ✅ Sauvegarde automatique dans Convex
- ✅ Module admin complet avec statistiques
- ✅ Recherche et filtres avancés
- ✅ Export CSV
- ✅ Gestion des permissions
- ✅ Design moderne et responsive

Les utilisateurs peuvent s'abonner en quelques secondes, et les administrateurs disposent d'un outil puissant pour gérer leur base d'abonnés !
