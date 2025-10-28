# Script PowerShell pour remplacer le bordeaux par un noir doux dans JSX

$rootPath = "c:\Users\a.tirari\Desktop\freeL\entrecoiffeur\frontend\src"

# Trouver tous les fichiers JSX et JS
$files = Get-ChildItem -Path $rootPath -Include *.jsx,*.js -Recurse -File

Write-Host "Remplacement du bordeaux par le noir doux dans JSX/JS..."

$modifiedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $modified = $false
    
    # Remplacer bordeaux par noir doux
    if ($content -match '#3d1a2e') {
        $content = $content -replace '#3d1a2e', '#2d2d2d'
        $modified = $true
    }
    
    if ($content -match '#2a1220') {
        $content = $content -replace '#2a1220', '#1a1a1a'
        $modified = $true
    }
    
    if ($content -match '#5a2842') {
        $content = $content -replace '#5a2842', '#404040'
        $modified = $true
    }
    
    if ($content -match '#6b3d54') {
        $content = $content -replace '#6b3d54', '#555555'
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Modifie: $($file.Name)" -ForegroundColor Green
        $modifiedCount++
    }
}

Write-Host "Termine! Fichiers JSX/JS modifies: $modifiedCount" -ForegroundColor Cyan
