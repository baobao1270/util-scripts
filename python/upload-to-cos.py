#!/usr/bin/python3

import sys
import os
import uuid
from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client

"""
[Install]
Run in PowerShell:
    pip install -U cos-python-sdk-v5
    $shortcut = (New-Object -COM WScript.Shell).CreateShortcut("$($env:APPDATA)\Microsoft\Windows\SendTo\Tencent COS.lnk")
    $shortcut.TargetPath = (Get-Command -Name python        | Select-Object -Property Source -First 1).Source
    $shortcut.Arguments  = (Get-Command -Name upload-to-cos | Select-Object -Property Source -First 1).Source
    $shortcut.Save()
[Usage]
Right click a file, then navigate to "send to", then click "COS".
"""

AK = "<Tencent Cloud COS SecretId>"
SK = "<Tencent Cloud COS SecretKey>"
REGION = "ap-shanghai"
COS_REGION  = "accelerate"
BUCKET = "<Bucket Id>-<AppId>" # something like "cdn-123456"
PREFIX = "by-uuid/"

def progress_callback(consumed_bytes, total_bytes):
    if total_bytes:
        rate = int(100 * (float(consumed_bytes) / float(total_bytes)))
        print('\r{0}% '.format(rate), end="", flush=True)

client = CosS3Client(CosConfig(Region=COS_REGION, SecretId=AK, SecretKey=SK))
files = sys.argv[1:]
for file in files:
    print("\r\n" + "-"*40 + "\r\n")
    if os.path.isdir(file):
        print("Skipping Folder:", file)
        continue
    print("Uploading File:", file)
    basename = os.path.basename(file)
    key = f"{PREFIX}{uuid.uuid4()}/{basename}"
    response = client.upload_file(
        Bucket=BUCKET,
        LocalFilePath=file,
        Key=key,
        MAXThread=5,
        EnableMD5=True,
        progress_callback=progress_callback
    )
    print("\nCDN Link:", "https://{}.file.myqcloud.com/{}".format(BUCKET, key))

print("\r\n" + "-"*40 + "\r\n")
input("Press Enter to Continue...")

