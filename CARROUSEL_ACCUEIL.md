# 🎠 Système de Carrousel Page d'Accueil

## Vue d'ensemble

Le système de carrousel permet aux administrateurs de gérer dynamiquement les bannières affichées sur la page d'accueil d'EntreCoiffeur.

## Fonctionnalités

### Module Admin (`/admin` > Carrousel Accueil)

- ✅ **Création de bannières** : Jusqu'à 5 bannières maximum
- ✅ **Configuration complète** :
  - Titre (obligatoire)
  - Sous-titre (optionnel)
  - Description (optionnel)
  - URL d'image (optionnel)
  - Texte du bouton CTA
  - Lien du bouton
  - Couleur de fond (avec sélecteur de couleur)
  - Couleur du texte (avec sélecteur de couleur)
  - Ordre d'affichage (1-5)
  - Statut actif/inactif
- ✅ **Gestion** : Modifier, activer/désactiver, supprimer
- ✅ **Aperçu en temps réel** dans le formulaire
- ✅ **Statistiques** : Total, actives, inactives

### Affichage Public (Page d'Accueil)

- ✅ **Carrousel automatique** : Affiche les bannières actives
- ✅ **Navigation** : Boutons précédent/suivant
- ✅ **Responsive** : S'adapte à tous les écrans
- ✅ **Personnalisable** : Couleurs, textes, images, liens
- ✅ **Fallback** : Bannières par défaut si aucune n'est configurée

## Comment utiliser

### 1. Créer une bannière

1. Connectez-vous en tant qu'admin
2. Allez sur `/admin`
3. Cliquez sur "Carrousel Accueil" dans la sidebar
4. Cliquez sur "Ajouter une bannière"
5. Remplissez le formulaire (tous les champs sont optionnels) :
   - **Image de la bannière** (optionnel) : Cliquez pour uploader une image (PNG, JPG, WebP jusqu'à 5 MB)
   - **Titre** (optionnel) : Ex: "Livraison Gratuite"
   - **Sous-titre** (optionnel) : Ex: "dès 50€ d'achat partout en France"
   - **Description** (optionnel) : Texte détaillé
   - **Texte du bouton** (optionnel) : Ex: "Commander"
   - **Lien du bouton** (optionnel) : Ex: "/marketplace"
   - **Couleur de fond** : Choisir avec le sélecteur (par défaut : #f3f4f6)
   - **Couleur du texte** : Choisir avec le sélecteur (par défaut : #1f2937)
   - **Ordre** : Position 1-5
   - **Statut** : Cocher "Bannière active"
6. Cliquez sur "Créer"

**💡 Flexibilité totale** : Vous pouvez créer :
- Une bannière avec **uniquement une image** (plein écran)
- Une bannière avec **uniquement du texte** (sur fond coloré)
- Une bannière avec **image + texte** (superposition)
- Une bannière avec **uniquement une couleur** (bannière unie)

### 2. Modifier une bannière

1. Dans la liste des bannières, cliquez sur l'icône ✏️ "Modifier"
2. Modifiez les champs souhaités
3. Cliquez sur "Mettre à jour"

### 3. Activer/Désactiver une bannière

- Cliquez sur l'icône 👁️ pour activer/désactiver
- Les bannières inactives ne s'affichent pas sur la page d'accueil

### 4. Supprimer une bannière

1. Cliquez sur l'icône 🗑️ "Supprimer"
2. Confirmez la suppression

## Architecture Technique

### Backend (Convex)

**Table `homeCarouselBanners`** :
```typescript
{
  title: string,
  subtitle?: string,
  description?: string,
  imageUrl?: string,
  imageStorageId?: string,
  buttonText?: string,
  buttonLink?: string,
  backgroundColor?: string,
  textColor?: string,
  order: number,
  isActive: boolean,
  createdBy: Id<"users">,
  updatedBy?: Id<"users">,
  createdAt: number,
  updatedAt: number
}
```

**Queries** :
- `getActiveBanners` : Récupère les bannières actives (page publique)
- `getAllBanners` : Récupère toutes les bannières (admin)
- `getActiveBannersCount` : Compte les bannières actives
- `getBannerById` : Récupère une bannière par ID

**Mutations** :
- `createBanner` : Créer une nouvelle bannière
- `updateBanner` : Modifier une bannière
- `toggleBannerStatus` : Activer/désactiver
- `deleteBanner` : Supprimer une bannière

### Frontend

**Admin** :
- `HomeCarouselModule.jsx` : Module de gestion complet
- Intégré dans `/admin` avec permission `home-carousel`

**Page d'accueil** :
- `Home.jsx` : Affichage du carrousel
- Query `getActiveBanners` pour récupérer les bannières
- Fallback sur bannières par défaut si aucune n'est configurée

## Résolution de problèmes

### Les bannières ne s'affichent pas sur la page d'accueil

**Vérifications** :

1. **Bannières créées ?**
   - Allez sur `/admin` > Carrousel Accueil
   - Vérifiez qu'il y a au moins une bannière

2. **Bannières actives ?**
   - Les bannières doivent avoir le statut "Actif" (badge vert)
   - Cliquez sur l'icône 👁️ pour activer

3. **Console du navigateur** :
   - Ouvrez la console (F12)
   - Recherchez les logs : `🎠 Bannières du carrousel récupérées`
   - Vérifiez le nombre de bannières actives

4. **Cache du navigateur** :
   - Rafraîchissez la page (Ctrl+F5 ou Cmd+Shift+R)
   - Videz le cache si nécessaire

5. **Convex Dashboard** :
   - Allez sur https://dashboard.convex.dev
   - Vérifiez la table `homeCarouselBanners`
   - Assurez-vous qu'il y a des entrées avec `isActive: true`

### Exemples de bannières

**1. Bannière complète (image + texte + bouton)** :
```javascript
{
  title: "Livraison Gratuite",
  subtitle: "dès 50€ d'achat partout en France",
  imageStorageId: "kg2h4j5k6l7m8n9o0p1q2r3s",
  buttonText: "Commander",
  buttonLink: "/marketplace",
  backgroundColor: "#C0B4A5",
  textColor: "#ffffff",
  order: 1,
  isActive: true
}
```

**2. Bannière image seule (plein écran)** :
```javascript
{
  imageStorageId: "kg2h4j5k6l7m8n9o0p1q2r3s",
  backgroundColor: "#f3f4f6",
  order: 2,
  isActive: true
}
```

**3. Bannière texte seule (sans image)** :
```javascript
{
  title: "Nouveautés 2025",
  subtitle: "Découvrez notre nouvelle collection",
  buttonText: "Voir tout",
  buttonLink: "/marketplace",
  backgroundColor: "linear-gradient(135deg, #C0B4A5 0%, #DACCBB 100%)",
  textColor: "#1f2937",
  order: 3,
  isActive: true
}
```

**4. Bannière couleur unie (minimaliste)** :
```javascript
{
  backgroundColor: "#C0B4A5",
  textColor: "#ffffff",
  order: 4,
  isActive: true
}
```

## Conseils de design

### Couleurs recommandées

**Fond clair + Texte foncé** :
- Fond : `#f3f4f6` (gris clair)
- Texte : `#1f2937` (gris foncé)

**Fond beige + Texte foncé** :
- Fond : `#C0B4A5` (beige)
- Texte : `#1f2937` (gris foncé)

**Fond foncé + Texte clair** :
- Fond : `#2d2d2d` (noir)
- Texte : `#ffffff` (blanc)

**Dégradés** :
- `linear-gradient(135deg, #4E4A43 0%, #A2988B 50%, #C0B4A5 100%)`
- `linear-gradient(135deg, #C0B4A5 0%, #DACCBB 50%, #A2988B 100%)`

### Images

- **Format** : JPG, PNG, WebP
- **Dimensions recommandées** : 
  - **Mobile** : 1080x300px (ratio 3.6:1)
  - **Desktop** : 1920x336px (ratio 5.7:1)
  - **Optimal universel** : 1920x400px (ratio 4.8:1)
- **Poids maximum** : 5 MB
- **Stockage** : Convex Storage (automatique lors de l'upload)
- **Ratio d'aspect** : Paysage (largeur > hauteur)
- **object-fit** : cover (l'image couvre toute la surface)

### Textes

- **Titre** : Court et percutant (3-5 mots)
- **Sous-titre** : Complément d'information (5-10 mots)
- **Description** : Détails supplémentaires (optionnel)
- **Bouton** : Verbe d'action (Commander, Découvrir, Voir tout)

## Limites

- ✅ **Maximum 5 bannières** : Pour ne pas surcharger le carrousel
- ✅ **1 bannière par ordre** : Chaque position (1-5) est unique
- ✅ **Réservé aux admins** : Seuls les superadmins peuvent gérer

## Fichiers modifiés

### Backend
- `backend/convex/schema.ts` : Table homeCarouselBanners
- `backend/convex/functions/mutations/homeCarousel.ts` : Mutations
- `backend/convex/functions/queries/homeCarousel.ts` : Queries

### Frontend
- `frontend/src/components/dashboardv2/HomeCarouselModule.jsx` : Module admin
- `frontend/src/pages/Home.jsx` : Affichage public
- `frontend/src/pages/AdminV2.jsx` : Intégration admin

## Prochaines améliorations possibles

- [x] Upload d'images directement dans Convex storage ✅
- [ ] Drag & drop pour réorganiser l'ordre
- [ ] Prévisualisation en temps réel dans le formulaire
- [ ] Planification (dates de début/fin)
- [ ] Analytics (clics, vues)
- [ ] A/B testing
- [ ] Templates prédéfinis
- [ ] Animation personnalisable
- [ ] Support vidéo
- [ ] Ciblage par type d'utilisateur
