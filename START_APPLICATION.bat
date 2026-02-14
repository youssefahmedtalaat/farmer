@echo off
title Farmer Assistant - Starting Application
color 0A

echo ========================================
echo   Farmer Assistant Web Platform
echo   Starting Application...
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo [1/4] Checking Node.js installation...
node --version
echo.

echo [2/4] Installing/Updating Frontend Dependencies...
cd /d "%~dp0"
if not exist "node_modules" (
    echo Installing frontend dependencies (this may take a few minutes)...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install frontend dependencies!
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed.
)
echo.

echo [3/4] Installing/Updating Backend Dependencies...
cd /d "%~dp0server"
if not exist "node_modules" (
    echo Installing backend dependencies (this may take a few minutes)...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install backend dependencies!
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies already installed.
)
echo.

echo [4/4] Starting Servers...
echo.

REM Check if ports are already in use
netstat -ano | findstr ":3001" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Port 3001 is already in use!
    echo Backend server might already be running.
    echo.
)

netstat -ano | findstr ":3000" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Port 3000 is already in use!
    echo Frontend server might already be running.
    echo.
)

echo ========================================
echo   IMPORTANT: Keep server windows open!
echo ========================================
echo.
echo Starting Backend Server (Port 3001)...
echo Starting Frontend Server (Port 3000)...
echo.
echo The application will open automatically in your browser.
echo.
echo To stop the servers, close the server windows or press Ctrl+C
echo.
echo ========================================
echo.

REM Start backend server in a new window
cd /d "%~dp0server"
start "Farmer Assistant - Backend Server" cmd /k "title Backend Server (Port 3001) && echo ======================================== && echo   Backend Server (Port 3001) && echo ======================================== && echo. && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server in a new window
cd /d "%~dp0"
start "Farmer Assistant - Frontend Server" cmd /k "title Frontend Server (Port 3000) && echo ======================================== && echo   Frontend Server (Port 3000) && echo ======================================== && echo. && npm run dev"

REM Wait a moment for frontend to start
timeout /t 5 /nobreak >nul

REM Open browser
start http://localhost:3000

echo.
echo ========================================
echo   Application Started Successfully!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo.
echo Two windows have opened:
echo - One for the Backend Server
echo - One for the Frontend Server
echo.
echo Keep both windows open while using the application.
echo.
echo Press any key to exit this window (servers will keep running)...
pause >nul

