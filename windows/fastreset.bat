@echo off
taskkill /f /im explorer.exe
adb kill-server
gpg-connect-agent killagent /bye
gpg-connect-agent /bye
gpg --card-status
start fastreset_explorer.vbs