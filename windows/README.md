## Install on Windows
You can the scripts on Windows with the following command:
```powershell
git clone https://github.com/baobao1270/util-scripts.git
mv  util-scripts\windows $env:USERPROFILE\Scripts
rm  -Force -Recurse util-scripts

$userPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
[Environment]::SetEnvironmentVariable("Path", $userPath + ";$env:USERPROFILE\Scripts", [EnvironmentVariableTarget]::User)
[Environment]::SetEnvironmentVariable("Path", $userPath + ";$env:USERPROFILE\Scripts\adk-platform-tools", [EnvironmentVariableTarget]::User)
```
