@echo off
cd %USERPROFILE%\AppData\Roaming\Code
rd /s /q Cache CachedData CachedExtensionVSIXs CachedProfilesData "Code Cache" Crashpad DawnCache GPUCache logs User\History User\workspaceStorage
