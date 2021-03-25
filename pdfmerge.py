import sys, os, argparse, pikepdf, uuid
from PyPDF2 import PdfFileMerger, PdfFileReader

parser = argparse.ArgumentParser(description="Merge PDFs to one.")
parser.add_argument("src", metavar="<folder>",  type=str, help="Folder that contain PDFs.")
parser.add_argument("out",  metavar="<outfile>", type=str, help="Output Filename.")
args = parser.parse_args()
src  = args.src
out  = args.out if args.out.endswith(".pdf") else (args.out + ".pdf")
pdf  = PdfFileMerger()
temp_files = []

for filename in os.listdir(src):
    if not filename.endswith(".pdf"):
        continue
    print("Adding {}".format(filename))
    filepath = os.path.join(src, filename)
    decrypted_pdf = pikepdf.open(filepath)
    decrypted_pdf.save(filepath + "-decrypted.pdf")
    pdf.append(filepath + "-decrypted.pdf")
print("\nSaving...")
pdf.write(out)
for tempfile in temp_files: os.remove(tempfile)
print("Merged PDF save to ./{}".format(out))
