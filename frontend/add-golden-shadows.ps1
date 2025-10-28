# Script PowerShell pour ajouter des ombres dorees

$rootPath = "c:\Users\a.tirari\Desktop\freeL\entrecoiffeur\frontend\src"

# Trouver tous les fichiers CSS
$files = Get-ChildItem -Path $rootPath -Include *.css -Recurse -File

Write-Host "Ajout des ombres dorees..."

$modifiedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $modified = $false
    
    # Remplacer les ombres noires par des ombres dorees
    # rgba(0, 0, 0, ...) -> rgba(218, 165, 32, ...)
    
    if ($content -match 'rgba\(0,\s*0,\s*0,') {
        $content = $content -replace 'rgba\(0,\s*0,\s*0,\s*0\.05\)', 'rgba(218, 165, 32, 0.1)'
        $content = $content -replace 'rgba\(0,\s*0,\s*0,\s*0\.08\)', 'rgba(218, 165, 32, 0.15)'
        $content = $content -replace 'rgba\(0,\s*0,\s*0,\s*0\.1\)', 'rgba(218, 165, 32, 0.2)'
        $content = $content -replace 'rgba\(0,\s*0,\s*0,\s*0\.12\)', 'rgba(218, 165, 32, 0.25)'
        $content = $content -replace 'rgba\(0,\s*0,\s*0,\s*0\.15\)', 'rgba(218, 165, 32, 0.3)'
        $content = $content -replace 'rgba\(0,\s*0,\s*0,\s*0\.16\)', 'rgba(218, 165, 32, 0.3)'
        $content = $content -replace 'rgba\(0,\s*0,\s*0,\s*0\.2\)', 'rgba(218, 165, 32, 0.35)'
        $content = $content -replace 'rgba\(0,\s*0,\s*0,\s*0\.25\)', 'rgba(218, 165, 32, 0.4)'
        $content = $content -replace 'rgba\(0,\s*0,\s*0,\s*0\.3\)', 'rgba(218, 165, 32, 0.45)'
        $content = $content -replace 'rgba\(0,\s*0,\s*0,\s*0\.4\)', 'rgba(218, 165, 32, 0.5)'
        $modified = $true
    }
    
    # Remplacer les ombres avec rgba(255, 107, 157, ...) par doree
    if ($content -match 'rgba\(255,\s*107,\s*157,') {
        $content = $content -replace 'rgba\(255,\s*107,\s*157,\s*0\.3\)', 'rgba(218, 165, 32, 0.4)'
        $content = $content -replace 'rgba\(255,\s*107,\s*157,\s*0\.4\)', 'rgba(218, 165, 32, 0.5)'
        $content = $content -replace 'rgba\(255,\s*107,\s*157,\s*0\.5\)', 'rgba(218, 165, 32, 0.6)'
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Modifie: $($file.Name)" -ForegroundColor Green
        $modifiedCount++
    }
}

Write-Host "Termine! Fichiers avec ombres dorees: $modifiedCount" -ForegroundColor Yellow
