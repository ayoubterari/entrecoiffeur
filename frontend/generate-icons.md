# Génération des icônes PWA

## Option 1 : Utiliser un outil en ligne (Recommandé)

### PWA Builder Image Generator
1. Allez sur https://www.pwabuilder.com/imageGenerator
2. Uploadez votre logo EntreCoiffeur (512x512px minimum)
3. Téléchargez le package d'icônes
4. Extrayez les fichiers dans `frontend/public/icons/`

### Real Favicon Generator
1. Allez sur https://realfavicongenerator.net/
2. Uploadez votre logo
3. Configurez les options (couleur de fond #C0B4A5)
4. Téléchargez le package
5. Copiez les fichiers PNG dans `frontend/public/icons/`

## Option 2 : Utiliser ImageMagick (Ligne de commande)

Si vous avez ImageMagick installé :

```bash
# Depuis un logo source de 512x512px
convert logo-512.png -resize 72x72 icons/icon-72x72.png
convert logo-512.png -resize 96x96 icons/icon-96x96.png
convert logo-512.png -resize 128x128 icons/icon-128x128.png
convert logo-512.png -resize 144x144 icons/icon-144x144.png
convert logo-512.png -resize 152x152 icons/icon-152x152.png
convert logo-512.png -resize 192x192 icons/icon-192x192.png
convert logo-512.png -resize 384x384 icons/icon-384x384.png
convert logo-512.png -resize 512x512 icons/icon-512x512.png
```

## Option 3 : Utiliser un script Node.js

Installez sharp :
```bash
npm install sharp
```

Créez un script `generate-icons.js` :

```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = 'logo-source.png'; // Votre logo source

if (!fs.existsSync('public/icons')) {
  fs.mkdirSync('public/icons', { recursive: true });
}

sizes.forEach(size => {
  sharp(inputFile)
    .resize(size, size)
    .toFile(`public/icons/icon-${size}x${size}.png`)
    .then(() => console.log(`✓ Généré: icon-${size}x${size}.png`))
    .catch(err => console.error(`✗ Erreur pour ${size}x${size}:`, err));
});
```

Exécutez :
```bash
node generate-icons.js
```

## Recommandations pour le logo

1. **Format source** : PNG avec transparence ou fond uni
2. **Dimensions** : Minimum 512x512px (idéal : 1024x1024px)
3. **Couleur de fond** : #C0B4A5 (beige EntreCoiffeur)
4. **Marges** : Laissez 10% de marge autour du logo
5. **Simplicité** : Logo lisible même en petit (72x72px)

## Vérification

Après génération, vérifiez que tous les fichiers sont présents :

```
public/icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
└── icon-512x512.png
```

## Test

1. Démarrez l'application : `npm run dev`
2. Ouvrez Chrome DevTools (F12)
3. Allez dans l'onglet "Application"
4. Section "Manifest" : Vérifiez que toutes les icônes sont chargées
5. Aucune erreur ne doit apparaître

## Placeholder temporaire

En attendant les vraies icônes, vous pouvez créer des placeholders avec un fond de couleur :

```javascript
// create-placeholder-icons.js
const { createCanvas } = require('canvas');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const color = '#C0B4A5';

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fond de couleur
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  
  // Texte "EC"
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${size/2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EC', size/2, size/2);
  
  // Sauvegarder
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/icons/icon-${size}x${size}.png`, buffer);
  console.log(`✓ Créé: icon-${size}x${size}.png`);
});
```
