@echo off
setlocal
cd /d "%~dp0.."

echo ================================================
echo  Preparando archivos para BellaBoutique Instalador
echo ================================================

echo.
echo [1/2] Compilando proyecto...
call mvnw.cmd clean package -DskipTests
if %ERRORLEVEL% neq 0 (
    echo ERROR: Fallo la compilacion.
    pause
    exit /b 1
)

echo.
echo [2/2] Copiando archivos al directorio installer\...
copy /Y "target\bella-0.0.1-SNAPSHOT.jar"  "installer\bella.jar"
copy /Y "bella_boutique.db"                "installer\bella_boutique.db"

echo.
echo ================================================
echo  Listo. Ahora abre Inno Setup y compila:
echo    installer\bella-boutique.iss
echo  El instalador se generara en:
echo    installer\BellaBoutique-Instalador.exe
echo ================================================
pause