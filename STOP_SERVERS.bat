@echo off
title Farmer Assistant - Stop Servers
color 0C

echo ========================================
echo   Stopping Farmer Assistant Servers
echo ========================================
echo.

echo Stopping processes on ports 3000 and 3001...
echo.

REM Find and kill processes on port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Stopping Frontend Server (Port 3000) - PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM Find and kill processes on port 3001 (Backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do (
    echo Stopping Backend Server (Port 3001) - PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM Also try to kill node processes (be careful with this)
echo.
echo Checking for remaining Node.js processes...
tasklist | findstr "node.exe" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo.
    echo WARNING: There are still Node.js processes running.
    echo You may need to manually close the server windows.
    echo.
) else (
    echo All servers stopped successfully!
)

echo.
echo ========================================
echo   Done!
echo ========================================
echo.
pause













