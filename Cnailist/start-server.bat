@echo off
title Cnailist - Start Server
color 0A

echo ============================================
echo   CNAILIST - Starting Servers
echo ============================================
echo.

:: Start MySQL if not running
echo [1/3] Checking MySQL...
"C:\xampp\mysql\bin\mysqladmin.exe" -u root ping >nul 2>&1
if %errorlevel% neq 0 (
    echo      Starting MySQL XAMPP...
    start "" "C:\xampp\mysql\bin\mysqld.exe"
    timeout /t 3 /nobreak >nul
) else (
    echo      MySQL already running. OK!
)

:: Clear Laravel cache
echo [2/3] Clearing Laravel cache...
cd /d "%~dp0cnailist-laravel-backend"
php artisan config:clear >nul 2>&1
php artisan cache:clear >nul 2>&1
echo      Cache cleared. OK!

:: Start Laravel server
echo [3/3] Starting Laravel backend on http://localhost:8000 ...
echo.
echo ============================================
echo   BACKEND : http://localhost:8000/api
echo   ADMIN   : Open cnailist/admin/login.html
echo   LOGIN   : admin@cnailist.id / admin123
echo ============================================
echo.
echo Press CTRL+C to stop the server.
echo.
php artisan serve --host=0.0.0.0 --port=8000
