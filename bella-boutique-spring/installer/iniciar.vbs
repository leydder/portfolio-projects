Option Explicit

Dim WshShell, fso, installDir, jarPath

Set WshShell = CreateObject("WScript.Shell")
Set fso     = CreateObject("Scripting.FileSystemObject")

installDir = fso.GetParentFolderName(WScript.ScriptFullName)
jarPath    = installDir & "\bella.jar"

' ── Verificar JAR ──────────────────────────────────────────
If Not fso.FileExists(jarPath) Then
    MsgBox "No se encontro bella.jar en:" & vbCrLf & installDir _
         & vbCrLf & "Por favor reinstale la aplicacion.", _
           vbCritical, "Bella Boutique"
    WScript.Quit 1
End If

' ── Verificar Java ─────────────────────────────────────────
Dim javaOk
javaOk = False
On Error Resume Next
WshShell.Run "javaw -version", 0, True
javaOk = (Err.Number = 0)
On Error GoTo 0

If Not javaOk Then
    MsgBox "Java no esta instalado o no esta en el PATH." & vbCrLf & vbCrLf _
         & "Descargue Java 21 desde:" & vbCrLf _
         & "https://www.java.com", _
           vbCritical, "Bella Boutique"
    WScript.Quit 1
End If

' ── Iniciar servidor si no esta corriendo ──────────────────
If Not IsServerRunning() Then
    WshShell.CurrentDirectory = installDir
    WshShell.Run "javaw -jar """ & jarPath & """", 0, False

    Dim intentos
    intentos = 0
    Do While Not IsServerRunning() And intentos < 60
        WScript.Sleep 1000
        intentos = intentos + 1
    Loop

    If intentos >= 60 Then
        MsgBox "El servidor no pudo iniciar en 60 segundos." & vbCrLf _
             & "Verifique que Java 21 este instalado.", _
               vbExclamation, "Bella Boutique"
        WScript.Quit 1
    End If

    WScript.Sleep 1000
End If

' ── Abrir Chrome ───────────────────────────────────────────
Dim chromeExe
chromeExe = BuscarChrome()

If chromeExe <> "" Then
    WshShell.Run """" & chromeExe & """ --new-window http://localhost:8080", 1, False
Else
    ' Navegador por defecto si no hay Chrome
    WshShell.Run "http://localhost:8080"
End If

' ══════════════════════════════════════════════════════════
' Funciones
' ══════════════════════════════════════════════════════════

Function IsServerRunning()
    On Error Resume Next
    Dim http
    Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    http.setTimeouts 300, 300, 300, 300
    http.open "GET", "http://localhost:8080", False
    http.send
    IsServerRunning = (Err.Number = 0)
    On Error GoTo 0
End Function

Function BuscarChrome()
    Dim rutas(2)
    rutas(0) = WshShell.ExpandEnvironmentStrings( _
                   "%ProgramFiles%\Google\Chrome\Application\chrome.exe")
    rutas(1) = WshShell.ExpandEnvironmentStrings( _
                   "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe")
    rutas(2) = WshShell.ExpandEnvironmentStrings( _
                   "%LocalAppData%\Google\Chrome\Application\chrome.exe")
    Dim i
    For i = 0 To 2
        If fso.FileExists(rutas(i)) Then
            BuscarChrome = rutas(i)
            Exit Function
        End If
    Next
    BuscarChrome = ""
End Function