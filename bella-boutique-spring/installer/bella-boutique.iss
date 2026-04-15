; ════════════════════════════════════════════════════════════
;  Bella Boutique – Script de instalación (Inno Setup 6+)
;  https://jrsoftware.org/isinfo.php
; ════════════════════════════════════════════════════════════

[Setup]
AppName=Bella Boutique
AppVersion=1.0
AppPublisher=Bella Boutique
AppPublisherURL=http://localhost:8080
DefaultDirName={autopf}\Bella Boutique
DefaultGroupName=Bella Boutique
AllowNoIcons=yes
Compression=lzma2/ultra64
SolidCompression=yes
OutputDir=.
OutputBaseFilename=BellaBoutique-Instalador
WizardStyle=modern
DisableProgramGroupPage=yes
; Pide al usuario la carpeta de instalación (comportamiento por defecto)

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

; ── Archivos a copiar ────────────────────────────────────
[Files]
; JAR principal (73 MB aprox.)
Source: "bella.jar";           DestDir: "{app}"; Flags: ignoreversion

; Scripts de inicio / parada
Source: "iniciar.vbs";         DestDir: "{app}"; Flags: ignoreversion
Source: "detener.bat";         DestDir: "{app}"; Flags: ignoreversion

; Base de datos inicial (solo si NO existe – respeta datos previos)
Source: "bella_boutique.db";   DestDir: "{app}"; Flags: onlyifdoesntexist uninsneveruninstall

; ── Carpetas vacías ──────────────────────────────────────
[Dirs]
Name: "{app}\uploads"

; ── Accesos directos ─────────────────────────────────────
[Icons]
; Escritorio
Name: "{autodesktop}\Bella Boutique"; \
      Filename: "{sys}\wscript.exe"; \
      Parameters: """{app}\iniciar.vbs"""; \
      WorkingDir: "{app}"; \
      Comment: "Abrir Bella Boutique en Chrome"

; Menú Inicio
Name: "{group}\Bella Boutique"; \
      Filename: "{sys}\wscript.exe"; \
      Parameters: """{app}\iniciar.vbs"""; \
      WorkingDir: "{app}"; \
      Comment: "Abrir Bella Boutique en Chrome"

Name: "{group}\Detener Bella Boutique"; \
      Filename: "{app}\detener.bat"; \
      WorkingDir: "{app}"; \
      Comment: "Detener el servidor"

; ── Ejecutar al terminar la instalación ──────────────────
[Run]
Filename: "{sys}\wscript.exe"; \
          Parameters: """{app}\iniciar.vbs"""; \
          Description: "Abrir Bella Boutique ahora"; \
          Flags: postinstall nowait skipifsilent