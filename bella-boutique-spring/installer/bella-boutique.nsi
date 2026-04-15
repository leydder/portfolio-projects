; ════════════════════════════════════════════════════════
;  Bella Boutique – Instalador NSIS
; ════════════════════════════════════════════════════════
Unicode True
!include "MUI2.nsh"

; ── Info general ────────────────────────────────────────
Name "Bella Boutique"
OutFile "BellaBoutique-Instalador.exe"
InstallDir "$PROGRAMFILES\Bella Boutique"
InstallDirRegKey HKCU "Software\BellaBoutique" "InstallDir"
RequestExecutionLevel admin
SetCompressor /SOLID lzma

; ── Páginas del asistente ────────────────────────────────
!define MUI_ABORTWARNING
!define MUI_WELCOMEPAGE_TITLE "Bienvenido a Bella Boutique"
!define MUI_WELCOMEPAGE_TEXT "Este asistente instalara Bella Boutique en su equipo.$\r$\n$\r$\nHaga clic en Siguiente para continuar."
!define MUI_FINISHPAGE_RUN         "$WINDIR\System32\wscript.exe"
!define MUI_FINISHPAGE_RUN_PARAMETERS '"$INSTDIR\iniciar.vbs"'
!define MUI_FINISHPAGE_RUN_TEXT    "Abrir Bella Boutique ahora"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "Spanish"

; ════════════════════════════════════════════════════════
;  INSTALACION
; ════════════════════════════════════════════════════════
Section "Bella Boutique" SecMain

    SetOutPath "$INSTDIR"

    ; ── Archivos principales ────────────────────────────
    File "bella.jar"
    File "iniciar.vbs"
    File "detener.bat"

    ; ── Base de datos: solo si NO existe (conserva datos) ─
    IfFileExists "$INSTDIR\bella_boutique.db" db_existe
        File "bella_boutique.db"
    db_existe:

    ; ── Carpeta de imagenes ─────────────────────────────
    CreateDirectory "$INSTDIR\uploads"

    ; ── Acceso directo en el Escritorio ─────────────────
    CreateShortcut \
        "$DESKTOP\Bella Boutique.lnk" \
        "$WINDIR\System32\wscript.exe" \
        '"$INSTDIR\iniciar.vbs"' \
        "$WINDIR\System32\wscript.exe" 0

    ; ── Menu Inicio ─────────────────────────────────────
    CreateDirectory "$SMPROGRAMS\Bella Boutique"

    CreateShortcut \
        "$SMPROGRAMS\Bella Boutique\Abrir Bella Boutique.lnk" \
        "$WINDIR\System32\wscript.exe" \
        '"$INSTDIR\iniciar.vbs"' \
        "$WINDIR\System32\wscript.exe" 0

    CreateShortcut \
        "$SMPROGRAMS\Bella Boutique\Detener servidor.lnk" \
        "$INSTDIR\detener.bat" "" \
        "$INSTDIR\detener.bat" 0

    CreateShortcut \
        "$SMPROGRAMS\Bella Boutique\Desinstalar.lnk" \
        "$INSTDIR\Desinstalar.exe"

    ; ── Registro (para desinstalador en Panel de Control) ─
    WriteRegStr HKCU "Software\BellaBoutique" "InstallDir" "$INSTDIR"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\BellaBoutique" \
                     "DisplayName" "Bella Boutique"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\BellaBoutique" \
                     "UninstallString" '"$INSTDIR\Desinstalar.exe"'
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\BellaBoutique" \
                     "DisplayVersion" "1.0"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\BellaBoutique" \
                     "Publisher" "Bella Boutique"

    WriteUninstaller "$INSTDIR\Desinstalar.exe"

SectionEnd

; ════════════════════════════════════════════════════════
;  DESINSTALACION
; ════════════════════════════════════════════════════════
Section "Uninstall"

    ; Detener servidor si corre
    ExecWait '"$INSTDIR\detener.bat"'

    Delete "$INSTDIR\bella.jar"
    Delete "$INSTDIR\iniciar.vbs"
    Delete "$INSTDIR\detener.bat"
    Delete "$INSTDIR\Desinstalar.exe"
    ; La BD y uploads NO se borran para conservar datos
    ; Delete "$INSTDIR\bella_boutique.db"
    ; RMDir /r "$INSTDIR\uploads"

    RMDir "$INSTDIR"

    Delete "$DESKTOP\Bella Boutique.lnk"
    Delete "$SMPROGRAMS\Bella Boutique\Abrir Bella Boutique.lnk"
    Delete "$SMPROGRAMS\Bella Boutique\Detener servidor.lnk"
    Delete "$SMPROGRAMS\Bella Boutique\Desinstalar.lnk"
    RMDir  "$SMPROGRAMS\Bella Boutique"

    DeleteRegKey HKCU "Software\BellaBoutique"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\BellaBoutique"

SectionEnd