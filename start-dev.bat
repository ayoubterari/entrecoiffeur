@echo off
echo ====================================
echo Demarrage de Entre Coiffeur
echo ====================================
echo.

echo Demarrage du backend Convex...
start cmd /k "cd backend && npm run dev"

echo Attente de 5 secondes...
timeout /t 5 /nobreak > nul

echo Demarrage du frontend Vite...
start cmd /k "cd frontend && npm run dev"

echo.
echo ====================================
echo Les services sont en cours de demarrage
echo ====================================
echo.
echo Backend Convex: http://localhost:8000 (dashboard)
echo Frontend: http://localhost:3000
echo.
echo Fermez cette fenetre pour arreter les services.
pause
