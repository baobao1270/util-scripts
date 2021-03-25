import win32com, os
from win32com.client import Dispatch, constants

name = input("Enter PPT Filename (with .ppt/.pptx subfix):")

ppt = win32com.client.Dispatch('PowerPoint.Application')
ppt.Visible = 1
pptSel = ppt.Presentations.Open(os.getcwd() + "\\" + name)

with open(name + "-转换.txt", "w+", encoding="utf-8") as f:
    for i in range(1, pptSel.Slides.Count + 1):
        #f.write("{}[PPT Page {}]{}".format("="*10, i, "="*10 + "\n"))
        shape_count = pptSel.Slides(i).Shapes.Count
        for j in range(1, shape_count + 1):
            if pptSel.Slides(i).Shapes(j).HasTextFrame:
                text = pptSel.Slides(i).Shapes(j).TextFrame.TextRange.Text
                text = text.replace("\v", "\n").replace("\r", "\n").replace("\n\n", "\n").replace(" "*4, " ")
                f.write(text + "\n")