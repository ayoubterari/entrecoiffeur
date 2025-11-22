# Script de démarrage pour Entre Coiffeur
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Démarrage de Entre Coiffeur" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Démarrer le backend dans une nouvelle fenêtre
Write-Host "Démarrage du backend Convex..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Attendre un peu pour que le backend démarre
Write-Host "Attente de 5 secondes..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Démarrer le frontend dans une nouvelle fenêtre
Write-Host "Démarrage du frontend Vite..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "Les services sont en cours de démarrage" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend Convex: Dashboard disponible dans le terminal" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Fermez les fenêtres PowerShell pour arrêter les services." -ForegroundColor Yellow
Read-Host "Appuyez sur Entrée pour fermer cette fenêtre"
