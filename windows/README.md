## Install on Windows
You can the scripts on Windows with the following command:
```powershell
git clone https://github.com/baobao1270/util-scripts.git Repo
New-Item -Path Tools -ItemType SymbolicLink -Value Repo\windows

$userPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
[Environment]::SetEnvironmentVariable("Path", $userPath + ";$env:USERPROFILE\Scripts", [EnvironmentVariableTarget]::User)
[Environment]::SetEnvironmentVariable("Path", $userPath + ";$env:USERPROFILE\Scripts\adk-platform-tools", [EnvironmentVariableTarget]::User)
```
