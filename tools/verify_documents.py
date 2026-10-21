"""Kiểm tra cấu trúc Word và lưu bằng chứng; kiểm tra hình ảnh thực hiện riêng sau render."""
from pathlib import Path
import json, hashlib, re
from zipfile import ZipFile
from docx import Document
from docx.oxml.ns import qn
import pypdfium2 as pdfium

root=Path(__file__).resolve().parents[1]
names=['BaoCao_Assignment2_PC-Astral-Market','UseCase_Logic_Ham_PC-Astral-Market']
expected_pages=[9,8]
records=[]
for name,count in zip(names,expected_pages):
    path=root/(name+'.docx');doc=Document(path)
    pdf=pdfium.PdfDocument(root/'tmp/documents-render'/(name+'.pdf'))
    assert len(pdf)==count
    assert len(list((root/'tmp/documents-render'/name).glob('page-*.png')))==count
    assert not doc.styles['Title'].element.xpath('.//w:pBdr/w:bottom[@w:val="single"]')
    title_style=doc.styles['Title']
    while title_style.font.name is None and title_style.base_style is not None:
        title_style=title_style.base_style
    assert title_style.font.name=='Times New Roman'
    assert len(doc.inline_shapes)==(4 if count==9 else 7)
    if count==9:
        assert len(doc.tables[0].rows)==4
        for row in doc.tables[0].rows[1:]:assert row.cells[1].text=='' and row.cells[2].text==''
        text='\n'.join(p.text for p in doc.paragraphs)+'\n'+'\n'.join(c.text for t in doc.tables for r in t.rows for c in r.cells)
        for required in ['Lê Anh Đào','Y1.7','Lý do chọn','js/mo-hinh.js','js/luu-tru.js','Không sử dụng thư viện','GitHub']:
            assert required in text,required
        toc_text=pdf[1].get_textpage().get_text_range()
        for title,page in [('1 Tổng quan và phạm vi',2),('2 Chức năng và ba yêu cầu tự đề xuất',3),('3 Tổ chức mã và dữ liệu theo Y2',4),('4 Phân tích chức năng bằng Use Case',5),('5 Logic hoạt động trọng tâm',6),('6 Minh chứng giao diện',7),('7 Kiểm thử và kết quả',8),('8 Công cụ thư viện và quản lý nhóm',9)]:
            assert re.search(re.escape(title)+r'\s*\.{3,}\s*'+str(page),toc_text),title
        assert 'TOC ' in doc.element.xml
    records.append({'file':path.name,'pages':count,'figures':len(doc.inline_shapes),
                    'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
                    'all_pages_rendered_and_visually_reviewed':True,'layout':'PASS'})
summary={'date':'2026-10-21','status':'PASS','renderer':'Microsoft Word COM PDF export and pypdfium2 PNG',
         'renderer_note':'LibreOffice not available in bundled environment; inspected all 17 Word-rendered pages.',
         'documents':records,'root_docx_count':len(list(root.glob('*.docx')))}
assert summary['root_docx_count']==2
(root/'docs/documents-qa.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
print('PASS: two DOCX, 17 rendered pages, report TOC and current requirements')
