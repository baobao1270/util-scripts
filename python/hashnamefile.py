#!/usr/bin/python3

helpstr = """ 
  Usage: hashnamefile <algorithm> <source> <dest>
  Supported algorithms: md5, sha1, sha256, sha512
"""

import os, sys, hashlib, shutil

algos = {
    "md5":    lambda: hashlib.md5(),
    "sha1":   lambda: hashlib.sha1(),
    "sha256": lambda: hashlib.sha256(),
    "sha512": lambda: hashlib.sha512(),
}

if len(sys.argv) != 4 :
    print(helpstr)
    os._exit(-1)
algo = sys.argv[1]
if algo not in algos.keys():
    print("Hashing algorithm not supported.")
    print(helpstr)
    os._exit(-2)
srcdir = sys.argv[2]
dstdir = sys.argv[3]
srcdir_files = os.listdir(srcdir)
if not os.path.exists(dstdir):
    os.makedirs(dstdir)
for f in srcdir_files:
    srcext  = f.split(".")[-1]
    srcname = f[:-len(srcext)-1]
    srcpath = os.path.join(srcdir, f)
    if os.path.isdir(srcpath):
        print("Skipping {}".format(srcpath))
        continue
    hasher = algos[algo]()
    with open(srcpath, "rb") as file:
        while True:
            data = file.read(1024)
            if not data:
                break
            hasher.update(data)
    dstext  = srcext
    dstname = hasher.hexdigest()
    dstpath = os.path.join(dstdir, "{}.{}".format(dstname, dstext))
    shutil.copy2(srcpath, dstpath)
    print("{} {} from {}".format(dstpath, algo, srcpath))
