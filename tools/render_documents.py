"""Render PDF do Word xuất thành PNG để kiểm tra từng trang ở độ phân giải đầy đủ."""
from pathlib import Path
import pypdfium2 as pdfium
import json

root=Path(__file__).resolve().parents[1]
folder=root/'tmp/documents-render'
summary=[]
for pdf in folder.glob('*.pdf'):
    document=pdfium.PdfDocument(pdf)
    destination=folder/pdf.stem
    destination.mkdir(exist_ok=True)
    # Xóa đúng PNG của lần render cũ, tránh giữ trang thừa sau khi sửa bố cục.
    for previous in destination.glob('page-*.png'):
        previous.unlink()
    pages=[]
    for index in range(len(document)):
        page=document[index]
        page.render(scale=1.7).to_pil().save(destination/f'page-{index+1}.png')
        text=page.get_textpage().get_text_range()
        pages.append({'page':index+1,'text_start':text[:110],'text_end':text[-110:]})
    summary.append({'document':pdf.stem+'.docx','pages':len(document),'page_text':pages})
(folder/'render-index.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
print([(x['document'],x['pages']) for x in summary])
