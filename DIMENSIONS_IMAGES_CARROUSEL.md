# 📐 Dimensions Exactes des Images du Carrousel

## 🎯 Dimensions Recommandées

Pour que vos images s'affichent **parfaitement nettes** et couvrent **entièrement la surface** de la bannière, voici les dimensions exactes basées sur l'analyse du CSS :

### 📱 Mobile (< 768px)

**Hauteur du carrousel** : `clamp(7.5rem, 22.5vh, 10.5rem)`
- **Minimum** : 120px (7.5rem)
- **Maximum** : 168px (10.5rem)
- **Dynamique** : 22.5% de la hauteur de l'écran

**Largeur** : 100% de l'écran (variable selon l'appareil)

**Dimensions recommandées** :
```
1080 x 300 px (ratio 3.6:1)
```

**Pourquoi ces dimensions ?**
- Largeur 1080px = résolution standard des smartphones modernes
- Hauteur 300px = moyenne entre 120px et 168px × 2 (pour la netteté Retina)
- Ratio 3.6:1 = format paysage adapté aux bannières mobiles

### 💻 Desktop (≥ 768px)

**Hauteur du carrousel** : `10.5rem` = **168px**

**Largeur maximale** : 
- Tablette : 100% de l'écran
- Desktop : `80rem` = **1280px**
- Large Desktop : `90rem` = **1440px**

**Dimensions recommandées** :
```
1920 x 336 px (ratio 5.7:1)
```

**Pourquoi ces dimensions ?**
- Largeur 1920px = résolution Full HD standard
- Hauteur 336px = 168px × 2 (pour la netteté sur écrans Retina/HiDPI)
- Ratio 5.7:1 = format panoramique adapté aux grands écrans

## ⭐ Dimension Optimale Universelle

Pour une image qui fonctionne **parfaitement sur tous les écrans** :

```
🎯 1920 x 400 px (ratio 4.8:1)
```

**Avantages** :
- ✅ Netteté maximale sur tous les appareils
- ✅ Ratio équilibré entre mobile et desktop
- ✅ Poids de fichier raisonnable (< 500 KB optimisé)
- ✅ Compatible avec les écrans Retina/HiDPI
- ✅ Pas de déformation grâce à `object-fit: cover`

## 📊 Tableau Récapitulatif

| Appareil | Largeur | Hauteur | Ratio | Usage |
|----------|---------|---------|-------|-------|
| **Mobile** | 1080px | 300px | 3.6:1 | Smartphones |
| **Desktop** | 1920px | 336px | 5.7:1 | Écrans larges |
| **Universel** | 1920px | 400px | 4.8:1 | **Recommandé** |

## 🎨 Comportement de l'Image

### CSS Appliqué

```css
.bannerSlide {
  min-width: 100%;
  height: clamp(7.5rem, 22.5vh, 10.5rem); /* Mobile */
  overflow: hidden;
}

/* Desktop */
@media (min-width: 768px) {
  .bannerSlide {
    height: 10.5rem; /* 168px */
  }
}
```

### Affichage de l'Image

```jsx
<img 
  src={imageUrl} 
  alt={banner.title}
  className="w-full h-full object-cover"
/>
```

**`object-fit: cover`** signifie :
- L'image **remplit complètement** le conteneur
- Les proportions de l'image sont **préservées**
- L'image peut être **recadrée** sur les bords si nécessaire
- **Aucune déformation** de l'image

## 📐 Calcul des Dimensions

### Pourquoi 1920 x 400 px ?

1. **Largeur 1920px** :
   - Résolution Full HD standard
   - Couvre 99% des écrans desktop modernes
   - Permet un zoom sans perte de qualité

2. **Hauteur 400px** :
   - Mobile : 400px ÷ 1.5 = 267px (proche de 300px optimal)
   - Desktop : 400px ÷ 2.4 = 167px (proche de 168px requis)
   - Marge de sécurité pour le recadrage

3. **Ratio 4.8:1** :
   - Compromis idéal entre mobile (3.6:1) et desktop (5.7:1)
   - Format panoramique élégant
   - Adapté aux bannières publicitaires

## 🖼️ Exemples de Dimensions

### Dimensions Minimales (Non recommandé)
```
1280 x 267 px
```
❌ Risque de pixellisation sur grands écrans

### Dimensions Standards (Acceptable)
```
1600 x 333 px
```
⚠️ Correct mais peut manquer de netteté sur Retina

### Dimensions Optimales (Recommandé)
```
1920 x 400 px
```
✅ Netteté parfaite sur tous les écrans

### Dimensions Maximales (Overkill)
```
3840 x 800 px (4K)
```
⚠️ Poids de fichier trop élevé, temps de chargement long

## 💾 Optimisation du Poids

Pour une image de **1920 x 400 px** :

### Format JPG
- **Qualité 85%** : ~150-250 KB ✅ Recommandé
- **Qualité 90%** : ~250-400 KB ✅ Acceptable
- **Qualité 95%** : ~400-600 KB ⚠️ Lourd

### Format WebP
- **Qualité 80%** : ~80-150 KB ✅ Optimal
- **Qualité 85%** : ~120-200 KB ✅ Recommandé

### Format PNG
- **PNG-8** : ~200-400 KB ✅ Si peu de couleurs
- **PNG-24** : ~800 KB - 2 MB ❌ Trop lourd

## 🎯 Recommandations Finales

### Pour une Qualité Optimale

1. **Créez votre image en 1920 x 400 px**
2. **Exportez en WebP qualité 85%** (ou JPG qualité 85%)
3. **Vérifiez que le poids < 500 KB**
4. **Testez sur mobile et desktop**

### Outils Recommandés

- **Photoshop** : Exportation pour le web
- **Figma** : Export 2x avec compression
- **Canva** : Template personnalisé 1920x400
- **TinyPNG** : Compression automatique
- **Squoosh** : Conversion WebP en ligne

## 📱 Zones de Sécurité

Pour éviter que des éléments importants soient recadrés :

```
┌─────────────────────────────────────────┐
│ ← 10% → [ZONE SÛRE 80%] ← 10% →        │
│         Texte et éléments               │
│         importants ici                  │
└─────────────────────────────────────────┘
```

**Zone sûre** : Centrez les éléments importants dans les **80% centraux** de l'image.

## 🧪 Test de Vérification

Après l'upload, vérifiez :

1. ✅ L'image est **nette** sur mobile
2. ✅ L'image est **nette** sur desktop
3. ✅ Aucune **déformation** visible
4. ✅ Les éléments importants sont **visibles**
5. ✅ Le **temps de chargement** est rapide (< 1s)

## 📊 Comparaison Visuelle

### Image 1080x300 (Mobile)
```
┌────────────────────────────────┐
│                                │ 300px
└────────────────────────────────┘
        1080px
```

### Image 1920x400 (Universel)
```
┌──────────────────────────────────────────┐
│                                          │ 400px
└──────────────────────────────────────────┘
              1920px
```

### Image 3840x800 (4K)
```
┌────────────────────────────────────────────────────────────────┐
│                                                                │ 800px
└────────────────────────────────────────────────────────────────┘
                          3840px
```

## 🎨 Template Photoshop

### Nouveau Document
- **Largeur** : 1920 pixels
- **Hauteur** : 400 pixels
- **Résolution** : 72 ppi (web)
- **Mode couleur** : RVB
- **Profil** : sRGB IEC61966-2.1

### Guides de Sécurité
- Guide vertical : 192px (10% gauche)
- Guide vertical : 1728px (10% droite)
- Guide horizontal : 40px (10% haut)
- Guide horizontal : 360px (10% bas)

## 📝 Checklist Avant Upload

- [ ] Dimensions : 1920 x 400 px ✅
- [ ] Format : WebP ou JPG ✅
- [ ] Poids : < 500 KB ✅
- [ ] Qualité : 85% minimum ✅
- [ ] Éléments importants dans la zone sûre ✅
- [ ] Testé sur mobile et desktop ✅
- [ ] Pas de texte trop petit (< 16px) ✅
- [ ] Bon contraste texte/fond ✅

## 🚀 Résumé

**Dimension optimale recommandée** : **1920 x 400 px**

Cette dimension garantit :
- ✅ Netteté parfaite sur tous les écrans
- ✅ Poids de fichier raisonnable
- ✅ Compatibilité mobile et desktop
- ✅ Affichage sans déformation
- ✅ Temps de chargement rapide

**Format recommandé** : WebP qualité 85% (ou JPG qualité 85%)

**Poids cible** : < 500 KB

---

*Dernière mise à jour : Novembre 2024*
