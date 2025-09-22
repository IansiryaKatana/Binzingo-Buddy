@echo off
echo Killing all running tasks...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
taskkill /f /im git.exe 2>nul
taskkill /f /im powershell.exe 2>nul
taskkill /f /im cmd.exe 2>nul
echo All tasks killed.
pause
