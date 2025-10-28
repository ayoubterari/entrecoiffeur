# Script PowerShell pour remplacer les couleurs dans les fichiers JSX

$rootPath = "c:\Users\a.tirari\Desktop\freeL\entrecoiffeur\frontend\src"

# Trouver tous les fichiers JSX et JS
$files = Get-ChildItem -Path $rootPath -Include *.jsx,*.js -Recurse -File

Write-Host "Fichiers JSX/JS a traiter: $($files.Count)"

$modifiedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $modified = $false
    
    # Remplacer les couleurs
    if ($content -match '#ff6b9d|#FF6B9D') {
        $content = $content -replace '#ff6b9d', '#000000' -replace '#FF6B9D', '#000000'
        $modified = $true
    }
    
    if ($content -match '#e84393|#E84393') {
        $content = $content -replace '#e84393', '#000000' -replace '#E84393', '#000000'
        $modified = $true
    }
    
    if ($content -match '#fd79a8|#FD79A8') {
        $content = $content -replace '#fd79a8', '#1a1a1a' -replace '#FD79A8', '#1a1a1a'
        $modified = $true
    }
    
    if ($content -match '#ff8fb3|#FF8FB3') {
        $content = $content -replace '#ff8fb3', '#404040' -replace '#FF8FB3', '#404040'
        $modified = $true
    }
    
    if ($content -match '#ffeaa7|#FFEAA7') {
        $content = $content -replace '#ffeaa7', '#808080' -replace '#FFEAA7', '#808080'
        $modified = $true
    }
    
    if ($content -match '#4cd964|#4CD964') {
        $content = $content -replace '#4cd964', '#404040' -replace '#4CD964', '#404040'
        $modified = $true
    }
    
    if ($content -match '#667eea|#667EEA') {
        $content = $content -replace '#667eea', '#000000' -replace '#667EEA', '#000000'
        $modified = $true
    }
    
    if ($content -match '#e91e63|#E91E63') {
        $content = $content -replace '#e91e63', '#000000' -replace '#E91E63', '#000000'
        $modified = $true
    }
    
    if ($content -match '#c2185b|#C2185B') {
        $content = $content -replace '#c2185b', '#000000' -replace '#C2185B', '#000000'
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Modifie: $($file.Name)" -ForegroundColor Green
        $modifiedCount++
    }
}

Write-Host "Termine! Fichiers JSX/JS modifies: $modifiedCount" -ForegroundColor Cyan
