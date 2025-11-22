@echo off
echo ====================================
echo Installation de Entre Coiffeur
echo ====================================
echo.

echo Installation des dependances backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Erreur lors de l'installation du backend
    pause
    exit /b %errorlevel%
)

echo.
echo Installation des dependances frontend...
cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo Erreur lors de l'installation du frontend
    pause
    exit /b %errorlevel%
)

echo.
echo ====================================
echo Installation terminee avec succes!
echo ====================================
echo.
echo Pour demarrer l'application:
echo 1. Ouvrez deux terminaux
echo 2. Terminal 1: cd backend && npm run dev
echo 3. Terminal 2: cd frontend && npm run dev
echo.
echo Ou utilisez les scripts:
echo - start-dev.bat pour demarrer les deux services
echo.
pause
