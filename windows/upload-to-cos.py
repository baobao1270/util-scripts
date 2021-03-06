import sys
import os
import uuid
from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client

"""
[Install]
Run in PowerShell:
    $shortcut = (New-Object -COM WScript.Shell).CreateShortcut("$($env:APPDATA)\Microsoft\Windows\SendTo\COS2.lnk");
    $python = cmd /c where python
    $shortcut.TargetPath=$python
    $shortcut.Arguments='"Path To This File"'
    $shortcut.Save()

[Usage]
Right click a file, then navigate to "send to", then click "COS".
"""

AK = "<Tencent Cloud COS SecretId>"
SK = "<Tencent Cloud COS SecretKey>"
REGION = "ap-shanghai"
BUCKET = "<Bucket Id>-<AppId>" # something like "cdn-123456"
PREFIX = "by-uuid/"

client = CosS3Client(CosConfig(Region=REGION, SecretId=AK, SecretKey=SK))
files = sys.argv[1:]
for file in files:
    print("\r\n" + "-"*40 + "\r\n")
    if os.path.isdir(file):
        print("Skipping Folder:", file)
        continue
    print("Uploading File:", file)
    extname = file.split(".")[-1]
    with open(file, "rb") as f:
        target_name = "{}.{}".format(str(uuid.uuid4()), extname)
        response = client.put_object(
            Bucket=BUCKET,
            Body=f,
            Key=PREFIX + target_name,
            StorageClass='STANDARD',
            EnableMD5=False
        )
        print("COS Link:", "https://{}.cos.{}.myqcloud.com/{}{}".format(BUCKET, REGION, PREFIX, target_name))
        print("CDN Link:", "https://{}.file.myqcloud.com/{}{}".format(BUCKET, PREFIX, target_name))

print("\r\n" + "-"*40 + "\r\n")
input("Press Enter to Continue...")
