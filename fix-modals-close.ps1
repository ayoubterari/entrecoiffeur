# Script PowerShell pour désactiver la fermeture des modals au clic sur l'overlay
# Auteur: Assistant
# Date: 2025-11-09

Write-Host "🔧 Désactivation de la fermeture accidentelle des modals..." -ForegroundColor Cyan
Write-Host ""

# Chemin vers le dossier frontend/src
$srcPath = "c:\Users\a.tirari\Desktop\freeL\entrecoiffeur\frontend\src"

if (-not (Test-Path $srcPath)) {
    Write-Host "❌ Erreur: Le dossier $srcPath n'existe pas!" -ForegroundColor Red
    exit 1
}

# Compteurs
$filesModified = 0
$totalReplacements = 0

# Patterns à rechercher et remplacer
$patterns = @(
    @{
        Search = 'className="modal-overlay"\s+onClick=\{[^\}]+\}'
        Replace = 'className="modal-overlay"'
        Description = 'modal-overlay avec onClick'
    },
    @{
        Search = 'className="([^"]*overlay[^"]*)"\s+onClick=\{[^\}]+\}'
        Replace = 'className="$1"'
        Description = 'overlay avec onClick'
    },
    @{
        Search = 'className=''modal-overlay''\s+onClick=\{[^\}]+\}'
        Replace = 'className=''modal-overlay'''
        Description = 'modal-overlay avec onClick (guillemets simples)'
    },
    @{
        Search = 'className=''([^'']*overlay[^'']*)''\ s+onClick=\{[^\}]+\}'
        Replace = 'className=''$1'''
        Description = 'overlay avec onClick (guillemets simples)'
    }
)

# Fonction pour traiter un fichier
function Process-File {
    param (
        [string]$filePath
    )
    
    try {
        $content = Get-Content $filePath -Raw -ErrorAction Stop
        $originalContent = $content
        $fileModified = $false
        $replacementsInFile = 0
        
        foreach ($pattern in $patterns) {
            $matches = [regex]::Matches($content, $pattern.Search)
            if ($matches.Count -gt 0) {
                $content = $content -replace $pattern.Search, $pattern.Replace
                $replacementsInFile += $matches.Count
                $fileModified = $true
            }
        }
        
        if ($fileModified) {
            Set-Content $filePath $content -NoNewline
            $script:filesModified++
            $script:totalReplacements += $replacementsInFile
            
            $relativePath = $filePath.Replace($srcPath, "").TrimStart('\')
            Write-Host "  ✅ $relativePath" -ForegroundColor Green
            Write-Host "     └─ $replacementsInFile remplacement(s)" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "  ❌ Erreur lors du traitement de $filePath : $_" -ForegroundColor Red
    }
}

# Rechercher tous les fichiers .jsx et .js
Write-Host "📁 Recherche des fichiers à modifier..." -ForegroundColor Yellow
$files = Get-ChildItem -Path $srcPath -Recurse -Include *.jsx,*.js -File

Write-Host "   Trouvé: $($files.Count) fichiers" -ForegroundColor Gray
Write-Host ""

# Traiter chaque fichier
Write-Host "🔄 Traitement des fichiers..." -ForegroundColor Yellow
foreach ($file in $files) {
    Process-File -filePath $file.FullName
}

# Résumé
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✨ Traitement terminé!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Statistiques:" -ForegroundColor Yellow
Write-Host "   • Fichiers modifiés: $filesModified" -ForegroundColor White
Write-Host "   • Total de remplacements: $totalReplacements" -ForegroundColor White
Write-Host ""

if ($filesModified -gt 0) {
    Write-Host "✅ Les modals ne se fermeront plus au clic sur l'overlay!" -ForegroundColor Green
    Write-Host "   Les utilisateurs devront utiliser le bouton X ou Annuler." -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "   1. Tester chaque modal modifié" -ForegroundColor White
    Write-Host "   2. Vérifier que les boutons de fermeture fonctionnent" -ForegroundColor White
    Write-Host "   3. Commit les changements: git add . && git commit -m 'feat: Désactiver fermeture accidentelle des modals'" -ForegroundColor White
} else {
    Write-Host "ℹ️  Aucun fichier n'a nécessité de modification." -ForegroundColor Cyan
    Write-Host "   Les modals sont peut-être déjà configurés correctement." -ForegroundColor Gray
}

Write-Host ""
Write-Host "📝 Documentation: DESACTIVATION_FERMETURE_MODALS.md" -ForegroundColor Cyan
Write-Host ""
