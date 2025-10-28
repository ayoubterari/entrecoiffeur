# Script PowerShell pour remplacer le noir par le bordeaux dans les JSX

$rootPath = "c:\Users\a.tirari\Desktop\freeL\entrecoiffeur\frontend\src"

# Trouver tous les fichiers JSX et JS
$files = Get-ChildItem -Path $rootPath -Include *.jsx,*.js -Recurse -File

Write-Host "Remplacement du noir par le bordeaux dans JSX/JS..."

$modifiedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $modified = $false
    
    # Remplacer #000000 et #000 par bordeaux
    if ($content -match '#000000|#000\b') {
        $content = $content -replace '#000000', '#3d1a2e'
        $content = $content -replace '#000\b', '#3d1a2e'
        $modified = $true
    }
    
    # Remplacer les variations de noir
    if ($content -match '#1a1a1a') {
        $content = $content -replace '#1a1a1a', '#5a2842'
        $modified = $true
    }
    
    if ($content -match '#404040') {
        $content = $content -replace '#404040', '#6b3d54'
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Modifie: $($file.Name)" -ForegroundColor Green
        $modifiedCount++
    }
}

Write-Host "Termine! Fichiers JSX/JS modifies: $modifiedCount" -ForegroundColor Cyan
