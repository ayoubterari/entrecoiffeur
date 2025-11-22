# Script PowerShell pour créer des icônes placeholder PWA
# Utilise PowerShell pour créer des images PNG simples

Write-Host "🎨 Création des icônes placeholder PWA pour EntreCoiffeur..." -ForegroundColor Cyan

# Créer le dossier icons s'il n'existe pas
$iconsPath = "public\icons"
if (-not (Test-Path $iconsPath)) {
    New-Item -ItemType Directory -Path $iconsPath -Force | Out-Null
    Write-Host "✓ Dossier 'public\icons' créé" -ForegroundColor Green
}

# Tailles d'icônes requises
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)

# Couleur de fond (beige EntreCoiffeur)
$backgroundColor = "#C0B4A5"

Write-Host ""
Write-Host "⚠️  IMPORTANT : Ce script crée des placeholders simples." -ForegroundColor Yellow
Write-Host "   Pour de vraies icônes professionnelles, utilisez :" -ForegroundColor Yellow
Write-Host "   - https://www.pwabuilder.com/imageGenerator" -ForegroundColor Yellow
Write-Host "   - https://realfavicongenerator.net/" -ForegroundColor Yellow
Write-Host ""

# Créer un fichier SVG temporaire pour chaque taille
foreach ($size in $sizes) {
    $svgContent = @"
<svg width="$size" height="$size" xmlns="http://www.w3.org/2000/svg">
  <rect width="$size" height="$size" fill="$backgroundColor"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="$([math]::Floor($size/2))" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">EC</text>
</svg>
"@
    
    $svgPath = "$iconsPath\icon-${size}x${size}.svg"
    $svgContent | Out-File -FilePath $svgPath -Encoding UTF8
    
    Write-Host "✓ Créé: icon-${size}x${size}.svg (placeholder)" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Icônes placeholder créées avec succès !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "   1. Remplacez ces placeholders par de vraies icônes PNG" -ForegroundColor White
Write-Host "   2. Utilisez un outil en ligne pour générer les icônes" -ForegroundColor White
Write-Host "   3. Ou convertissez les SVG en PNG avec un outil comme Inkscape" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Outils recommandés :" -ForegroundColor Cyan
Write-Host "   - PWA Builder: https://www.pwabuilder.com/imageGenerator" -ForegroundColor White
Write-Host "   - Real Favicon Generator: https://realfavicongenerator.net/" -ForegroundColor White
Write-Host ""
Write-Host "📖 Voir 'generate-icons.md' pour plus d'options" -ForegroundColor Cyan

# Note sur la conversion SVG vers PNG
Write-Host ""
Write-Host "💡 Astuce : Pour convertir les SVG en PNG :" -ForegroundColor Yellow
Write-Host "   - Installez Inkscape: https://inkscape.org/" -ForegroundColor White
Write-Host "   - Ou utilisez un convertisseur en ligne" -ForegroundColor White
Write-Host ""

# Créer un fichier README dans le dossier icons
$readmeContent = @"
# Icônes PWA - EntreCoiffeur

## ⚠️ Placeholders actuels

Les fichiers SVG dans ce dossier sont des **placeholders temporaires**.

Pour une application professionnelle, remplacez-les par de vraies icônes PNG.

## 🎨 Générer de vraies icônes

### Option 1 : PWA Builder (Recommandé)
1. Allez sur https://www.pwabuilder.com/imageGenerator
2. Uploadez votre logo (512x512px minimum)
3. Téléchargez le package
4. Remplacez les fichiers dans ce dossier

### Option 2 : Real Favicon Generator
1. Allez sur https://realfavicongenerator.net/
2. Uploadez votre logo
3. Configurez (couleur de fond: #C0B4A5)
4. Téléchargez et remplacez

## 📋 Fichiers requis

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## ✅ Vérification

Après avoir ajouté les vraies icônes :
1. Supprimez les fichiers .svg
2. Vérifiez que tous les .png sont présents
3. Testez avec Chrome DevTools (F12 > Application > Manifest)

Voir '../generate-icons.md' pour plus d'informations.
"@

$readmePath = "$iconsPath\README.md"
$readmeContent | Out-File -FilePath $readmePath -Encoding UTF8

Write-Host "✓ README créé dans $iconsPath" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Vous pouvez maintenant tester l'application !" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
