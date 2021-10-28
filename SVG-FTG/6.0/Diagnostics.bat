@echo off
rem
rem	Diagnostic Script to check environment before installation (or upgrade) of the SVG-FTG utility
rem
cd /D "%~dp0%"
echo "Current location:"
cd
echo.
echo "Other BAT files here:
dir *.bat
echo.
echo "EXE files here:"
dir *.exe
echo.
echo "Contents of %ProgramFiles(x86)%\SVG:"
dir "%ProgramFiles(x86)%\SVG\"
echo.
echo "Contents of "%ProgramFiles%\SVG:"
dir "%ProgramFiles%\SVG\"
echo.
echo "Checking for %SystemRoot%\ST6UNST.exe:"
dir "%SystemRoot%\ST6UNST.exe"
echo.
echo "SVG shortcuts in %ProgramData%\Microsoft\Windows\Start Menu\Programs:"
dir "%ProgramData%\Microsoft\Windows\Start Menu\Programs\SVG*"
echo.
echo "SVG shortcuts in %AppData%\Microsoft\Windows\Start Menu\Programs:"
dir "%AppData%\Microsoft\Windows\Start Menu\Programs\SVG*"
echo.
echo "Testing shortcuts (see TestShortcut.log):"
echo Dim sLink, oLink, oWS, oFSO > TestShortcut.vbs
echo Set oWS = WScript.CreateObject("WScript.Shell") >> TestShortcut.vbs
echo Set oFSO = CreateObject("Scripting.FileSystemObject") >> TestShortcut.vbs
echo sLink = oWS.SpecialFolders("StartMenu") ^& "\Programs\SVG Family-Tree Generator\SVG.lnk" >> TestShortcut.vbs
echo If Not oFSO.FileExists(sLink) Then >> TestShortcut.vbs
echo sLink = oWS.SpecialFolders("AllUsersStartMenu") ^& "\Programs\SVG Family-Tree Generator\SVG.lnk" >> TestShortcut.vbs
echo End If >> TestShortcut.vbs
echo If oFSO.FileExists(sLink) Then >> TestShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLink) >> TestShortcut.vbs
echo WScript.Echo "Old working dir=" ^& oLink.WorkingDirectory >> TestShortcut.vbs
echo oLink.WorkingDirectory = "%CD%" >> TestShortcut.vbs
echo oLink.Save >> TestShortcut.vbs
echo WScript.Echo "New working dir=" ^& oLink.WorkingDirectory >> TestShortcut.vbs
echo End If >> TestShortcut.vbs
rem
%SystemRoot%\system32\cscript.exe TestShortcut.vbs  //NoLogo > TestShortcut.log 2>&1
echo.
pause
