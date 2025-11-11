# Système de Gestion du Carrousel Page d'Accueil

## 🎯 Objectif

Permettre à l'administrateur de gérer les bannières du carrousel de la page d'accueil depuis le dashboard admin, avec un maximum de 5 bannières.

## ✨ Fonctionnalités Implémentées

### 1. Base de Données (Convex Schema)

**Table `homeCarouselBanners`** :
- `title` : Titre de la bannière
- `subtitle` : Sous-titre (optionnel)
- `description` : Description (optionnel)
- `imageUrl` : URL d'image externe (optionnel)
- `imageStorageId` : ID de stockage Convex (optionnel)
- `buttonText` : Texte du bouton CTA
- `buttonLink` : Lien du bouton
- `backgroundColor` : Couleur de fond
- `textColor` : Couleur du texte
- `order` : Ordre d'affichage (1-5)
- `isActive` : Statut actif/inactif
- `createdBy` : Admin créateur
- `updatedBy` : Dernier admin modificateur
- `createdAt` / `updatedAt` : Timestamps

**Index** :
- `by_order` : Pour trier par ordre
- `by_active` : Pour filtrer les actives
- `by_active_order` : Pour récupérer les bannières actives triées

---

### 2. API Convex

#### Queries (`functions/queries/homeCarousel.ts`)

**`getActiveBanners`** :
- Récupère les bannières actives (max 5)
- Utilisé par la page d'accueil publique
- Trié par ordre croissant

**`getAllBanners`** :
- Récupère toutes les bannières
- Utilisé par le dashboard admin
- Trié par ordre

**`getBannerById`** :
- Récupère une bannière spécifique
- Utilisé pour l'édition

**`getActiveBannersCount`** :
- Compte les bannières actives
- Utilisé pour les statistiques

#### Mutations (`functions/mutations/homeCarousel.ts`)

**`createBanner`** :
- Crée une nouvelle bannière
- Vérifie : admin, limite de 5, ordre unique
- Paramètres : tous les champs + userId

**`updateBanner`** :
- Met à jour une bannière existante
- Vérifie : admin, ordre unique si changé
- Paramètres : bannerId + champs modifiables + userId

**`deleteBanner`** :
- Supprime une bannière
- Vérifie : admin
- Paramètres : bannerId + userId

**`reorderBanners`** :
- Réorganise l'ordre des bannières
- Paramètres : array de {bannerId, order} + userId

**`toggleBannerStatus`** :
- Active/Désactive une bannière
- Paramètres : bannerId + userId

---

### 3. Module Admin (`HomeCarouselModule.jsx`)

#### Statistiques Affichées
- **Total Bannières** : X / 5
- **Bannières Actives** : Nombre visible sur le site
- **Bannières Inactives** : Nombre masquées

#### Liste des Bannières
Chaque bannière affiche :
- **Drag Handle** : Pour réorganiser (futur)
- **Badge d'ordre** : Position (1-5)
- **Aperçu** : Couleur de fond + indication image
- **Titre** : Titre principal
- **Sous-titre** : Si présent
- **Description** : Tronquée à 2 lignes
- **Badge CTA** : Texte du bouton si présent
- **Badge Statut** : Actif/Inactif
- **Actions** :
  - 👁️ Activer/Désactiver
  - ✏️ Modifier
  - 🗑️ Supprimer

#### Formulaire d'Ajout/Édition
**Champs** :
- Titre * (requis)
- Sous-titre
- Description (textarea)
- URL de l'image
- Texte du bouton (défaut: "Commander")
- Lien du bouton (défaut: "/marketplace")
- Couleur de fond (color picker + input)
- Couleur du texte (color picker + input)
- Ordre d'affichage (select 1-5)
- Statut actif (checkbox)
- **Aperçu en temps réel** : Montre le rendu

---

## 🎨 Interface Utilisateur

### Dashboard Admin

```
┌─────────────────────────────────────────────────────────┐
│ Carrousel Page d'Accueil        [+ Ajouter une bannière]│
│ Gérez les bannières du carrousel (maximum 5)            │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│ │ Total        │ │ Bannières    │ │ Bannières    │    │
│ │ Bannières    │ │ Actives      │ │ Inactives    │    │
│ │   3 / 5      │ │   2          │ │   1          │    │
│ └──────────────┘ └──────────────┘ └──────────────┘    │
├─────────────────────────────────────────────────────────┤
│ Bannières du Carrousel                                  │
│ Glissez-déposez pour réorganiser                        │
├─────────────────────────────────────────────────────────┤
│ ☰ [1] [Aperçu] Livraison Gratuite                      │
│              dès 50€ d'achat...                         │
│              [Commander] [Actif]     [👁️] [✏️] [🗑️]    │
├─────────────────────────────────────────────────────────┤
│ ☰ [2] [Aperçu] Nouveautés 2024                         │
│              Découvrez notre...                         │
│              [Découvrir] [Actif]     [👁️] [✏️] [🗑️]    │
└─────────────────────────────────────────────────────────┘
```

### Modal de Formulaire

```
┌─────────────────────────────────────────────────────────┐
│ Nouvelle bannière                               [X]     │
│ Configurez les détails de la bannière                   │
├─────────────────────────────────────────────────────────┤
│ Titre *                                                  │
│ [Livraison Gratuite_________________________]           │
│                                                          │
│ Sous-titre                                               │
│ [dès 50€ d'achat partout en France__________]           │
│                                                          │
│ Description                                              │
│ [________________________________________]               │
│ [________________________________________]               │
│                                                          │
│ URL de l'image                                           │
│ [https://example.com/image.jpg___________]               │
│                                                          │
│ Texte du bouton      │ Lien du bouton                   │
│ [Commander_______]   │ [/marketplace__________]         │
│                                                          │
│ Couleur de fond      │ Couleur du texte                 │
│ [🎨] [#f3f4f6____]   │ [🎨] [#1f2937_______]           │
│                                                          │
│ Ordre d'affichage *  │ Statut                           │
│ [Position 1 ▼]       │ [✓] Bannière active              │
│                                                          │
│ Aperçu                                                   │
│ ┌─────────────────────────────────────────┐            │
│ │                                           │            │
│ │     Livraison Gratuite                    │            │
│ │     dès 50€ d'achat partout en France     │            │
│ │                                           │            │
│ └─────────────────────────────────────────┘            │
│                                                          │
│                        [Annuler] [Créer]                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux Utilisateur

### Créer une Bannière

```
1. Admin clique sur "Ajouter une bannière"
   ↓
2. Modal s'ouvre avec formulaire vide
   ↓
3. Admin remplit les champs :
   - Titre (requis)
   - Sous-titre, description (optionnels)
   - URL image ou laisse vide
   - Texte et lien du bouton
   - Couleurs (fond + texte)
   - Ordre (1-5)
   - Statut actif/inactif
   ↓
4. Admin voit l'aperçu en temps réel
   ↓
5. Admin clique "Créer"
   ↓
6. Validation :
   - Vérification admin
   - Maximum 5 bannières
   - Ordre unique
   ↓
7. Bannière créée et affichée dans la liste
```

### Modifier une Bannière

```
1. Admin clique sur ✏️ (Modifier)
   ↓
2. Modal s'ouvre avec données pré-remplies
   ↓
3. Admin modifie les champs souhaités
   ↓
4. Admin voit l'aperçu mis à jour
   ↓
5. Admin clique "Mettre à jour"
   ↓
6. Bannière mise à jour dans la liste
```

### Activer/Désactiver

```
1. Admin clique sur 👁️ (œil)
   ↓
2. Statut bascule immédiatement
   ↓
3. Badge et opacité mis à jour
   ↓
4. Si désactivée : masquée du site public
   Si activée : visible sur le site
```

### Supprimer

```
1. Admin clique sur 🗑️ (Supprimer)
   ↓
2. Confirmation demandée
   ↓
3. Si confirmé : bannière supprimée
   ↓
4. Liste mise à jour
```

---

## 📊 Règles de Gestion

### Limites
- ✅ **Maximum 5 bannières** au total
- ✅ **Ordre unique** : Pas de doublons (1-5)
- ✅ **Réservé aux admins** : Seuls les superadmin peuvent gérer

### Validation
- ✅ Titre obligatoire
- ✅ Ordre obligatoire (1-5)
- ✅ Vérification des permissions
- ✅ Vérification de l'ordre unique

### Affichage Public
- ✅ Seules les bannières **actives** sont affichées
- ✅ Triées par **ordre croissant**
- ✅ Maximum **5 bannières** affichées

---

## 🎨 Personnalisation

### Couleurs
- **Fond** : Couleur de fond de la bannière
- **Texte** : Couleur du texte (titre, sous-titre)
- **Sélecteur de couleur** + input hexadécimal

### Images
- **URL externe** : Lien vers une image hébergée
- **Storage Convex** : Upload futur (prévu)
- **Fallback** : Couleur de fond si pas d'image

### Bouton CTA
- **Texte personnalisable** : "Commander", "Découvrir", etc.
- **Lien personnalisable** : "/marketplace", "/products", etc.
- **Optionnel** : Peut être masqué

---

## 🧪 Tests à Effectuer

### Test 1 : Accès au Module ✓
- [ ] Se connecter en tant que superadmin
- [ ] Aller dans Dashboard Admin
- [ ] Cliquer sur "Carrousel Accueil"
- [ ] Vérifier l'affichage du module

### Test 2 : Création de Bannière ✓
- [ ] Cliquer sur "Ajouter une bannière"
- [ ] Remplir le formulaire
- [ ] Vérifier l'aperçu en temps réel
- [ ] Créer la bannière
- [ ] Vérifier qu'elle apparaît dans la liste

### Test 3 : Limite de 5 Bannières ✓
- [ ] Créer 5 bannières
- [ ] Vérifier que le bouton "Ajouter" est désactivé
- [ ] Essayer de créer une 6ème (doit échouer)

### Test 4 : Ordre Unique ✓
- [ ] Créer une bannière avec ordre 1
- [ ] Essayer de créer une autre avec ordre 1
- [ ] Vérifier le message d'erreur

### Test 5 : Modification ✓
- [ ] Cliquer sur ✏️ d'une bannière
- [ ] Modifier des champs
- [ ] Sauvegarder
- [ ] Vérifier les modifications

### Test 6 : Activation/Désactivation ✓
- [ ] Cliquer sur 👁️ d'une bannière active
- [ ] Vérifier qu'elle devient inactive
- [ ] Cliquer à nouveau
- [ ] Vérifier qu'elle redevient active

### Test 7 : Suppression ✓
- [ ] Cliquer sur 🗑️
- [ ] Confirmer la suppression
- [ ] Vérifier que la bannière disparaît

### Test 8 : Affichage Public ✓
- [ ] Créer 3 bannières actives
- [ ] Aller sur la page d'accueil
- [ ] Vérifier que les 3 bannières s'affichent
- [ ] Vérifier l'ordre correct

---

## 📝 Fichiers Créés/Modifiés

### Backend

**`backend/convex/schema.ts`** :
- Ajout de la table `homeCarouselBanners`

**`backend/convex/functions/queries/homeCarousel.ts`** :
- `getActiveBanners` : Bannières actives pour le public
- `getAllBanners` : Toutes les bannières pour l'admin
- `getBannerById` : Une bannière spécifique
- `getActiveBannersCount` : Compteur

**`backend/convex/functions/mutations/homeCarousel.ts`** :
- `createBanner` : Créer une bannière
- `updateBanner` : Modifier une bannière
- `deleteBanner` : Supprimer une bannière
- `reorderBanners` : Réorganiser l'ordre
- `toggleBannerStatus` : Activer/Désactiver

### Frontend

**`frontend/src/components/dashboardv2/HomeCarouselModule.jsx`** :
- Module complet de gestion
- Liste des bannières
- Formulaire d'ajout/édition
- Statistiques

**`frontend/src/pages/AdminV2.jsx`** :
- Import du module
- Rendu conditionnel

**`frontend/src/components/adminv2/Sidebar.jsx`** :
- Ajout de l'élément de menu "Carrousel Accueil"

---

## 🚀 Prochaines Étapes

### Intégration Page d'Accueil
1. Créer le composant `HomeCarousel.jsx`
2. Utiliser `getActiveBanners` query
3. Implémenter le carrousel avec navigation
4. Ajouter les animations de transition

### Améliorations Futures
- [ ] **Drag & Drop** : Réorganiser par glisser-déposer
- [ ] **Upload d'images** : Via Convex Storage
- [ ] **Prévisualisation** : Voir le rendu exact
- [ ] **Programmation** : Dates de début/fin
- [ ] **Analytics** : Clics sur les bannières
- [ ] **A/B Testing** : Tester différentes versions

---

## 🎉 Résultat

Le système de gestion du carrousel est maintenant **opérationnel** ! L'administrateur peut :

✅ **Créer** jusqu'à 5 bannières personnalisées
✅ **Modifier** les bannières existantes
✅ **Activer/Désactiver** selon les besoins
✅ **Supprimer** les bannières obsolètes
✅ **Personnaliser** couleurs, textes, liens
✅ **Prévisualiser** le rendu avant publication

Le carrousel de la page d'accueil peut maintenant être géré facilement depuis le dashboard admin ! 🚀
