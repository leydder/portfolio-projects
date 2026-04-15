@echo off
setlocal EnableDelayedExpansion
set "INSTDIR=%~dp0"
if "%INSTDIR:~-1%"=="\" set "INSTDIR=%INSTDIR:~0,-1%"

echo.
echo  ==========================================
echo   Instalando Bella Boutique...
echo  ==========================================
echo.

:: Crear carpeta uploads si no existe
if not exist "%INSTDIR%\uploads\" mkdir "%INSTDIR%\uploads"

:: Crear accesos directos via VBScript auxiliar
set "VBS_TEMP=%TEMP%\bella_shortcuts.vbs"

(
echo Set ws  = CreateObject^("WScript.Shell"^)
echo Set fso = CreateObject^("Scripting.FileSystemObject"^)
echo instDir = "%INSTDIR%"
echo.
echo ' Acceso directo en el Escritorio
echo desktop = ws.SpecialFolders^("Desktop"^)
echo Set s1 = ws.CreateShortcut^(desktop ^& "\Bella Boutique.lnk"^)
echo s1.TargetPath     = "wscript.exe"
echo s1.Arguments      = Chr^(34^) ^& instDir ^& "\iniciar.vbs" ^& Chr^(34^)
echo s1.WorkingDirectory = instDir
echo s1.Description    = "Abrir Bella Boutique"
echo s1.Save
echo.
echo ' Menu Inicio
echo progDir = ws.SpecialFolders^("Programs"^) ^& "\Bella Boutique"
echo If Not fso.FolderExists^(progDir^) Then fso.CreateFolder^(progDir^)
echo Set s2 = ws.CreateShortcut^(progDir ^& "\Bella Boutique.lnk"^)
echo s2.TargetPath     = "wscript.exe"
echo s2.Arguments      = Chr^(34^) ^& instDir ^& "\iniciar.vbs" ^& Chr^(34^)
echo s2.WorkingDirectory = instDir
echo s2.Description    = "Abrir Bella Boutique"
echo s2.Save
echo Set s3 = ws.CreateShortcut^(progDir ^& "\Detener servidor.lnk"^)
echo s3.TargetPath     = instDir ^& "\detener.bat"
echo s3.WorkingDirectory = instDir
echo s3.Save
) > "%VBS_TEMP%"

cscript //nologo "%VBS_TEMP%"
del "%VBS_TEMP%"

echo.
echo  Instalacion completada.
echo  Se creo el acceso directo "Bella Boutique" en el Escritorio.
echo.
echo  NOTA: Asegurese de tener Java 21 instalado.
echo  Descarga: https://www.java.com
echo.
pause