# 📸 Upload d'images pour le Carrousel - Implémentation

## Résumé des modifications

Le système de carrousel a été amélioré pour permettre l'**upload direct d'images** au lieu de saisir des URLs. Les images sont maintenant stockées dans **Convex Storage** de manière sécurisée.

## ✅ Modifications apportées

### 1. Frontend - HomeCarouselModule.jsx

**Imports ajoutés** :
```javascript
import { Upload, Loader2 } from 'lucide-react'
```

**État ajouté** :
```javascript
const generateUploadUrl = useMutation(api.files.generateUploadUrl)
const [isUploading, setIsUploading] = useState(false)
const [imagePreview, setImagePreview] = useState(existingImageUrl || banner?.imageUrl || '')
```

**Fonctions ajoutées** :

1. **`handleImageUpload`** : Gère l'upload de l'image vers Convex Storage
   - Validation du type de fichier (images uniquement)
   - Validation de la taille (max 5 MB)
   - Upload vers Convex via `generateUploadUrl`
   - Création d'un aperçu local avec FileReader
   - Sauvegarde du `storageId` dans le formulaire

2. **`handleRemoveImage`** : Supprime l'image sélectionnée
   - Efface le `storageId` et l'URL
   - Réinitialise l'aperçu

**Interface utilisateur** :

- **Zone d'upload avec drag & drop visuel** :
  - Bordure en pointillés
  - Icône Upload
  - Texte explicatif
  - Indicateur de chargement (spinner)
  - Formats acceptés : PNG, JPG, WebP
  - Taille max : 5 MB

- **Aperçu de l'image** :
  - Image affichée en 48px de hauteur
  - Bouton X pour supprimer (rouge)
  - Responsive et moderne

- **Affichage dans la liste** :
  - Récupération de l'URL depuis Convex Storage via `useQuery`
  - Affichage de l'image dans la carte de bannière
  - Fallback sur icône si pas d'image

### 2. Backend - homeCarousel.ts (Query)

**Query `getActiveBanners` enrichie** :

```typescript
// Enrichir avec les URLs des images depuis Convex storage
const bannersWithUrls = await Promise.all(
  banners.map(async (banner) => {
    let imageUrl = banner.imageUrl;
    
    // Si une image est stockée dans Convex, récupérer son URL
    if (banner.imageStorageId) {
      try {
        imageUrl = await ctx.storage.getUrl(banner.imageStorageId as any);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'URL de l\'image:', error);
      }
    }
    
    return {
      ...banner,
      imageUrl, // Remplacer ou ajouter l'URL de l'image
    };
  })
);

return bannersWithUrls;
```

**Avantages** :
- Les URLs sont générées côté serveur
- Pas besoin de queries supplémentaires côté client
- URLs temporaires et signées automatiquement
- Performance optimale

### 3. Schéma Convex (déjà existant)

Le schéma `homeCarouselBanners` contient déjà les champs nécessaires :
```typescript
{
  imageUrl: v.optional(v.string()),        // URL externe (legacy)
  imageStorageId: v.optional(v.string()),  // ID Convex Storage (nouveau)
  // ... autres champs
}
```

## 🎯 Fonctionnalités

### Upload d'image

1. **Cliquer sur la zone d'upload**
2. **Sélectionner une image** (PNG, JPG, WebP)
3. **Validation automatique** :
   - Type de fichier vérifié
   - Taille vérifiée (max 5 MB)
4. **Upload vers Convex Storage**
5. **Aperçu immédiat** de l'image
6. **Sauvegarde du storageId** dans le formulaire

### Modification d'image

1. **Ouvrir le formulaire d'édition**
2. **L'image existante s'affiche** automatiquement
3. **Cliquer sur X** pour supprimer
4. **Uploader une nouvelle image** si souhaité

### Affichage

- **Dans l'admin** : Aperçu de l'image dans la liste des bannières
- **Sur la page d'accueil** : Image complète dans le carrousel
- **Responsive** : S'adapte à tous les écrans

## 🔒 Sécurité

- ✅ **Validation du type** : Uniquement les images
- ✅ **Validation de la taille** : Maximum 5 MB
- ✅ **Stockage sécurisé** : Convex Storage avec URLs signées
- ✅ **Gestion d'erreurs** : Messages d'erreur clairs
- ✅ **Permissions** : Seuls les admins peuvent uploader

## 📊 Flux complet

```
1. Admin clique "Ajouter une bannière"
   ↓
2. Remplit le formulaire
   ↓
3. Clique sur la zone d'upload
   ↓
4. Sélectionne une image
   ↓
5. Validation (type + taille)
   ↓
6. Upload vers Convex Storage
   ↓
7. Récupération du storageId
   ↓
8. Aperçu local affiché
   ↓
9. Sauvegarde de la bannière
   ↓
10. Query enrichit avec l'URL de l'image
   ↓
11. Affichage sur la page d'accueil
```

## 🎨 Design

### Zone d'upload (vide)
```
┌─────────────────────────────────┐
│                                 │
│          📤 Upload              │
│                                <p className="text-xs text-muted-foreground mt-2">
                Dimensions recommandées : 1920x400px (ratio 4.8:1)
              </p>  │
│                                 │
│  PNG, JPG, WebP jusqu'à 5 MB    │
│                                 │
└─────────────────────────────────┘
```

### Zone d'upload (en cours)
```
┌─────────────────────────────────┐
│                                 │
│          ⏳ Loader              │
│                                 │
│      Upload en cours...         │
│                                 │
└─────────────────────────────────┘
```

### Aperçu avec image
```
┌─────────────────────────────────┐
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │      [Image Preview]      │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                            [X]   │
└─────────────────────────────────┘
```

## 🧪 Tests

### Test 1 : Upload d'une image valide
1. Créer une nouvelle bannière
2. Uploader une image PNG de 2 MB
3. ✅ Aperçu s'affiche
4. ✅ Bannière sauvegardée
5. ✅ Image visible sur la page d'accueil

### Test 2 : Upload d'un fichier invalide
1. Essayer d'uploader un PDF
2. ✅ Message d'erreur : "Veuillez sélectionner une image valide"

### Test 3 : Upload d'une image trop grande
1. Essayer d'uploader une image de 10 MB
2. ✅ Message d'erreur : "L'image ne doit pas dépasser 5 MB"

### Test 4 : Modification d'une bannière
1. Modifier une bannière existante
2. ✅ Image existante s'affiche
3. Supprimer l'image
4. ✅ Zone d'upload réapparaît
5. Uploader une nouvelle image
6. ✅ Nouvelle image sauvegardée

### Test 5 : Affichage dans la liste
1. Créer plusieurs bannières avec images
2. ✅ Toutes les images s'affichent dans la liste admin
3. ✅ Les images sont bien redimensionnées (32x20)

## 📝 Code exemple

### Upload d'une image

```javascript
const handleImageUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  // Validation
  if (!file.type.startsWith('image/')) {
    alert('Veuillez sélectionner une image valide')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('L\'image ne doit pas dépasser 5 MB')
    return
  }

  setIsUploading(true)

  try {
    // Générer l'URL d'upload
    const uploadUrl = await generateUploadUrl()

    // Upload le fichier
    const result = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    const { storageId } = await result.json()

    // Créer un aperçu local
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Mettre à jour le formData
    setFormData(prev => ({
      ...prev,
      imageStorageId: storageId,
      imageUrl: ''
    }))

    console.log('Image uploadée avec succès:', storageId)
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    alert('Erreur lors de l\'upload de l\'image')
  } finally {
    setIsUploading(false)
  }
}
```

### Affichage de l'image

```javascript
// Récupérer l'URL depuis Convex Storage
const imageUrl = useQuery(
  banner.imageStorageId ? api.files.getFileUrl : 'skip',
  banner.imageStorageId ? { storageId: banner.imageStorageId } : 'skip'
)

// Afficher l'image
{(imageUrl || banner.imageUrl) && (
  <img 
    src={imageUrl || banner.imageUrl} 
    alt={banner.title}
    className="w-full h-full object-cover"
  />
)}
```

## 🚀 Avantages

1. **Simplicité** : Plus besoin de chercher des URLs d'images externes
2. **Sécurité** : Images stockées de manière sécurisée dans Convex
3. **Performance** : URLs signées et optimisées
4. **UX** : Aperçu immédiat de l'image uploadée
5. **Fiabilité** : Pas de dépendance à des services externes
6. **Validation** : Contrôle du type et de la taille
7. **Responsive** : Images adaptées à tous les écrans

## 📦 Fichiers modifiés

### Frontend
- ✅ `frontend/src/components/dashboardv2/HomeCarouselModule.jsx`
  - Ajout de l'upload d'images
  - Aperçu de l'image
  - Gestion des erreurs

### Backend
- ✅ `backend/convex/functions/queries/homeCarousel.ts`
  - Enrichissement avec les URLs des images
  - Récupération depuis Convex Storage

### Documentation
- ✅ `CARROUSEL_ACCUEIL.md` : Mise à jour
- ✅ `CARROUSEL_UPLOAD_IMAGE.md` : Documentation technique (ce fichier)

## 🎉 Résultat

Le système de carrousel permet maintenant d'**uploader des images directement** depuis l'interface admin, sans avoir besoin de saisir des URLs. Les images sont stockées de manière sécurisée dans Convex Storage et affichées automatiquement sur la page d'accueil.

**Avant** : Saisir une URL d'image externe
```
URL de l'image: [https://example.com/image.jpg]
```

**Après** : Upload direct d'image
```
┌─────────────────────────────────┐
│          📤 Upload              │
│  Cliquez pour uploader une      │
│          image                  │
└─────────────────────────────────┘
```

C'est beaucoup plus simple et intuitif ! 🎨✨
