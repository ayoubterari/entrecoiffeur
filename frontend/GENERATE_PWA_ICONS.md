# Guide : Générer les Icônes PWA pour EntreCoiffeur

## 📋 Prérequis

Vous avez besoin d'un logo source en haute résolution (minimum 512x512px, idéalement 1024x1024px ou plus).

## 🎨 Méthode 1 : Utiliser PWA Asset Generator (Recommandé)

### Installation
```bash
npm install -g pwa-asset-generator
```

### Génération des icônes
```bash
# Depuis le dossier frontend
npx pwa-asset-generator logo-source.png public/icons --icon-only --background "#C0B4A5" --padding "10%"
```

### Options disponibles
- `--icon-only` : Génère uniquement les icônes (pas les splash screens)
- `--background "#C0B4A5"` : Couleur de fond (beige EntreCoiffeur)
- `--padding "10%"` : Ajoute un padding autour du logo
- `--type png` : Format PNG (par défaut)

## 🎨 Méthode 2 : Utiliser un Service en Ligne

### Option A : RealFaviconGenerator
1. Aller sur https://realfavicongenerator.net/
2. Upload votre logo
3. Configurer les options :
   - **iOS**: Activer "Add a solid, plain background color"
   - **Android Chrome**: Activer "Use a distinct picture for Android Chrome"
   - **Theme color**: #C0B4A5
4. Générer et télécharger
5. Extraire les fichiers dans `public/icons/`

### Option B : PWA Builder
1. Aller sur https://www.pwabuilder.com/imageGenerator
2. Upload votre logo (512x512 minimum)
3. Télécharger le package
4. Extraire les fichiers dans `public/icons/`

## 🎨 Méthode 3 : Manuellement avec Photoshop/GIMP

### Tailles requises
Créer les images suivantes dans `public/icons/` :
- `icon-72x72.png` (72x72px)
- `icon-96x96.png` (96x96px)
- `icon-128x128.png` (128x128px)
- `icon-144x144.png` (144x144px)
- `icon-152x152.png` (152x152px)
- `icon-192x192.png` (192x192px)
- `icon-384x384.png` (384x384px)
- `icon-512x512.png` (512x512px)

### Spécifications
- **Format**: PNG avec transparence
- **Couleur de fond**: Blanc ou transparent
- **Padding**: 10-15% autour du logo
- **Qualité**: Haute résolution, pas de compression excessive

## 📱 Icônes Supplémentaires (Optionnel)

### Apple Touch Icon
```bash
# Créer une icône 180x180 pour iOS
cp public/icons/icon-192x192.png public/apple-touch-icon.png
```

### Favicon
```bash
# Créer un favicon 32x32
cp public/icons/icon-72x72.png public/favicon.ico
```

### Raccourcis (Shortcuts)
Créer des icônes 96x96 pour les raccourcis :
- `shortcut-marketplace.png`
- `shortcut-dashboard.png`
- `shortcut-orders.png`

## ✅ Vérification

### Structure attendue
```
public/
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   ├── shortcut-marketplace.png
│   ├── shortcut-dashboard.png
│   └── shortcut-orders.png
├── apple-touch-icon.png
├── favicon.ico
└── manifest.json
```

### Test
1. Build l'application : `npm run build`
2. Servir : `npm run preview`
3. Ouvrir Chrome DevTools > Application > Manifest
4. Vérifier que toutes les icônes sont présentes

## 🎨 Recommandations Design

### Logo Source
- **Format**: SVG ou PNG haute résolution
- **Dimensions**: 1024x1024px minimum
- **Fond**: Transparent ou blanc
- **Style**: Simple, reconnaissable à petite taille

### Couleurs
- **Primaire**: #C0B4A5 (Beige EntreCoiffeur)
- **Secondaire**: #A89985 (Beige foncé)
- **Fond**: #FFFFFF (Blanc)

### Maskable Icons
Pour les icônes maskables (Android), assurez-vous que :
- Le logo est centré
- Il y a au moins 10% de padding
- Les éléments importants sont dans la "safe zone" (80% du centre)

## 🔧 Dépannage

### Les icônes ne s'affichent pas
- Vérifier les chemins dans `manifest.json`
- Vérifier que les fichiers existent dans `public/icons/`
- Vider le cache du navigateur
- Rebuild l'application

### Icônes floues sur mobile
- Utiliser des images haute résolution
- Exporter en PNG sans compression excessive
- Vérifier la taille exacte des fichiers

### Icônes coupées sur Android
- Ajouter plus de padding (15-20%)
- Utiliser le format maskable
- Tester avec différents launchers Android

## 📚 Ressources

- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Maskable.app](https://maskable.app/) - Tester les icônes maskables
- [Web.dev - Icon Guidelines](https://web.dev/add-manifest/#icons)
