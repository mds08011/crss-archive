@echo off
rem
rem	Script to perform full installation (or upgrade) of the SVG-FTG utility
rem
echo.
echo.
echo	SVG-FTG Installation Script
echo ================================
echo.
cd /D "%~dp0%"
rem
call .\Uninstall.bat
rem
.\setup.exe
rem
call .\ModifyShortcut.bat
