# Script d'installation pour Entre Coiffeur
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Installation de Entre Coiffeur" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js n'est pas installé. Veuillez installer Node.js depuis https://nodejs.org" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

# Vérifier si npm est installé
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm n'est pas installé" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host ""
Write-Host "Installation des dépendances backend..." -ForegroundColor Yellow
Set-Location -Path "backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de l'installation du backend" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Installation des dépendances frontend..." -ForegroundColor Yellow
Set-Location -Path "../frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de l'installation du frontend" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit $LASTEXITCODE
}

# Retour au répertoire racine
Set-Location -Path ".."

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "Installation terminée avec succès!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pour démarrer l'application:" -ForegroundColor Cyan
Write-Host "1. Utilisez start-dev.bat ou start-dev.ps1" -ForegroundColor White
Write-Host "2. Ou ouvrez deux terminaux:" -ForegroundColor White
Write-Host "   - Terminal 1: cd backend && npm run dev" -ForegroundColor Gray
Write-Host "   - Terminal 2: cd frontend && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "L'application sera accessible sur:" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "- Backend Convex: Dashboard disponible dans le terminal" -ForegroundColor White
Write-Host ""
Read-Host "Appuyez sur Entrée pour terminer"
