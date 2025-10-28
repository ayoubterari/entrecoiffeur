# Script PowerShell pour remplacer les couleurs roses par noir et blanc
# EntreCoiffeur - Conversion vers palette Noir & Blanc

$rootPath = "c:\Users\a.tirari\Desktop\freeL\entrecoiffeur\frontend\src"

# Définir les remplacements de couleurs
$colorReplacements = @{
    # Rose principal vers noir
    '#ff6b9d' = '#000000'
    '#FF6B9D' = '#000000'
    
    # Rose foncé vers noir
    '#e84393' = '#000000'
    '#E84393' = '#000000'
    '#fd79a8' = '#1a1a1a'
    '#FD79A8' = '#1a1a1a'
    
    # Rose clair vers gris foncé
    '#ff8fb3' = '#404040'
    '#FF8FB3' = '#404040'
    
    # Jaune accent vers gris moyen
    '#ffeaa7' = '#808080'
    '#FFEAA7' = '#808080'
    
    # Vert vers gris foncé
    '#4cd964' = '#404040'
    '#4CD964' = '#404040'
    
    # Violet vers noir
    '#667eea' = '#000000'
    '#667EEA' = '#000000'
    
    # Rouge vers noir
    '#e91e63' = '#000000'
    '#E91E63' = '#000000'
    '#c2185b' = '#000000'
    '#C2185B' = '#000000'
}

# Fonction pour remplacer les couleurs dans un fichier
function Replace-Colors {
    param (
        [string]$filePath
    )
    
    $content = Get-Content $filePath -Raw -Encoding UTF8
    $modified = $false
    
    foreach ($oldColor in $colorReplacements.Keys) {
        $newColor = $colorReplacements[$oldColor]
        if ($content -match [regex]::Escape($oldColor)) {
            $content = $content -replace [regex]::Escape($oldColor), $newColor
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
        Write-Host "✓ Modifié: $filePath" -ForegroundColor Green
        return 1
    }
    return 0
}

# Trouver tous les fichiers CSS et JSX
$files = Get-ChildItem -Path $rootPath -Include *.css,*.jsx,*.js -Recurse -File

Write-Host "`n🎨 Conversion vers palette Noir & Blanc..." -ForegroundColor Cyan
Write-Host "Fichiers à traiter: $($files.Count)`n" -ForegroundColor Yellow

$modifiedCount = 0

foreach ($file in $files) {
    $modifiedCount += Replace-Colors -filePath $file.FullName
}

Write-Host "`n✅ Terminé!" -ForegroundColor Green
Write-Host "Fichiers modifiés: $modifiedCount" -ForegroundColor Cyan
Write-Host "`nLa palette de couleurs a été convertie en Noir & Blanc.`n" -ForegroundColor White
