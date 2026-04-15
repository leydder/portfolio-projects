@echo off
echo Deteniendo Bella Boutique...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Servidor detenido.
timeout /t 2 /nobreak >nul