# Script PowerShell pour eliminer toutes les ombres et effets roses

$rootPath = "c:\Users\a.tirari\Desktop\freeL\entrecoiffeur\frontend\src"

# Trouver tous les fichiers CSS
$files = Get-ChildItem -Path $rootPath -Include *.css -Recurse -File

Write-Host "Elimination des ombres et effets roses..."

$modifiedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $modified = $false
    
    # Remplacer les ombres roses par des ombres dorees
    if ($content -match 'rgba\(255,\s*107,\s*157,') {
        $content = $content -replace 'rgba\(255,\s*107,\s*157,\s*0\.1\)', 'rgba(218, 165, 32, 0.15)'
        $content = $content -replace 'rgba\(255,\s*107,\s*157,\s*0\.15\)', 'rgba(218, 165, 32, 0.2)'
        $content = $content -replace 'rgba\(255,\s*107,\s*157,\s*0\.2\)', 'rgba(218, 165, 32, 0.25)'
        $content = $content -replace 'rgba\(255,\s*107,\s*157,\s*0\.25\)', 'rgba(218, 165, 32, 0.3)'
        $content = $content -replace 'rgba\(255,\s*107,\s*157,\s*0\.3\)', 'rgba(218, 165, 32, 0.35)'
        $content = $content -replace 'rgba\(255,\s*107,\s*157,\s*0\.35\)', 'rgba(218, 165, 32, 0.4)'
        $content = $content -replace 'rgba\(255,\s*107,\s*157,\s*0\.4\)', 'rgba(218, 165, 32, 0.45)'
        $content = $content -replace 'rgba\(255,\s*107,\s*157,\s*0\.45\)', 'rgba(218, 165, 32, 0.5)'
        $content = $content -replace 'rgba\(255,\s*107,\s*157,\s*0\.5\)', 'rgba(218, 165, 32, 0.55)'
        $modified = $true
    }
    
    # Remplacer les backgrounds roses par noir doux
    if ($content -match 'background:\s*rgba\(255,\s*107,\s*157,') {
        $content = $content -replace 'background:\s*rgba\(255,\s*107,\s*157,\s*0\.1\)', 'background: rgba(45, 45, 45, 0.05)'
        $content = $content -replace 'background:\s*rgba\(255,\s*107,\s*157,\s*0\.15\)', 'background: rgba(45, 45, 45, 0.08)'
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Modifie: $($file.Name)" -ForegroundColor Green
        $modifiedCount++
    }
}

Write-Host "Termine! Fichiers modifies: $modifiedCount" -ForegroundColor Cyan
Write-Host "Toutes les ombres roses ont ete remplacees par des ombres dorees" -ForegroundColor Yellow
