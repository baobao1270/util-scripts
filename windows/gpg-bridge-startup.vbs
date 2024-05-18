' https://github.com/BusyJay/gpg-bridge?tab=readme-ov-file#using-gnupg-agent-as-ssh-agent
set WshShell = CreateObject("WScript.Shell")
WshShell.Run "D:\Develop\Repo\windows\gpg-bridge.exe --ssh \\.\pipe\gpg-bridge", 0
