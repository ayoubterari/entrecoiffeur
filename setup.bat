@echo off
echo ========================================
echo    ENTRE COIFFEUR - SETUP SCRIPT
echo ========================================
echo.

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

cd ..
echo ========================================
echo    SETUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Run 'start-backend.bat' to start the Convex backend
echo 2. Copy the Convex URL and update frontend/.env.local
echo 3. Run 'start-frontend.bat' to start the React frontend
echo.
echo The application will be available at http://localhost:3000
echo.
pause
