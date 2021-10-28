@echo off
rem
rem	Script to modify Working Directory property of the default SVG-FTG shortcut to ensure that it starts in a user directory
rem	(this corresponds to the 'Start In' field when doing it manually)
rem
cd /D "%~dp0%"
rem
echo Dim sLink, oLink, oWS, oFSO > CreateShortcut.vbs
echo Set oWS = WScript.CreateObject("WScript.Shell") >> CreateShortcut.vbs
echo Set oFSO = CreateObject("Scripting.FileSystemObject") >> CreateShortcut.vbs
echo sLink = oWS.SpecialFolders("StartMenu") ^& "\Programs\SVG Family-Tree Generator\SVG.lnk" >> CreateShortcut.vbs
echo If Not oFSO.FileExists(sLink) Then >> CreateShortcut.vbs
echo sLink = oWS.SpecialFolders("AllUsersStartMenu") ^& "\Programs\SVG Family-Tree Generator\SVG.lnk" >> CreateShortcut.vbs
echo End If >> CreateShortcut.vbs
echo If oFSO.FileExists(sLink) Then >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLink) >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "%CD%" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs
echo End If >> CreateShortcut.vbs
rem
%SystemRoot%\system32\cscript.exe CreateShortcut.vbs  //B //NoLogo
del CreateShortcut.vbs