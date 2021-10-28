@echo off
rem
rem	Script to uninstall any previous instance of the SVG-FTG utility
rem
cd /D "%~dp0%"
rem
if not exist "%ProgramFiles(x86)%\SVG\ST6UNST.LOG" goto skip_pf_x86
echo.
set /p ans="OK to uninstall existing version of SVG-FTG so that it can be replaced [Y/N]? "
if /I "%ans%" == "N" goto finish
"%SystemRoot%\ST6UNST.exe" -n "%ProgramFiles(x86)%\SVG\ST6UNST.LOG" -f -q
:skip_pf_x86
rem
rem
if not exist "%ProgramFiles%\SVG\ST6UNST.LOG" goto skip_pf
echo.
set /p ans="OK to uninstall existing version of SVG-FTG so that it can be replaced [Y/N]? "
if /I "%ans%" == "N" goto finish
"%SystemRoot%\ST6UNST.exe" -n "%ProgramFiles%\SVG\ST6UNST.LOG" -f -q
:skip_pf
rem
:finish
