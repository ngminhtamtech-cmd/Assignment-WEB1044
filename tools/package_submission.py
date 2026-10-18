from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib, json, re, tempfile
from docx import Document

root=Path(__file__).resolve().parents[1]
(root/'tmp').mkdir(exist_ok=True)
site=root/'PC-Astral-Market'
report=root/'submission/BaoCao_Assignment2_PC-Astral-Market.docx'
archive=root/'submission/WEB1044_LapTrinhJSCoBan_PC-Astral-Market_Assignment.zip'
assert report.exists()
doc=Document(report)
manifest=json.loads((root/'docs/report-manifest.json').read_text(encoding='utf-8'))
assert len(doc.inline_shapes)==manifest['figures']
assert manifest['usecase_diagrams']==3
assert manifest['toc_levels']==2 and manifest['toc_leader']=='dots'
assert manifest['code_excerpts']==0
assert 'Lê Anh Đào' in '\n'.join(p.text for p in doc.paragraphs)
assert len(doc.tables[0].rows)==4
for row in doc.tables[0].rows[1:]:assert row.cells[1].text=='' and row.cells[2].text==''
assert all(p.parent.name=='js' for p in site.rglob('*.js'))
assert all(p.parent.name=='css' for p in site.rglob('*.css'))
assert len(list(site.glob('*.html')))==6
assert not list(site.rglob('*.svg'))
assert len(list((site/'assets/images/products').glob('*')))==24
for p in site.rglob('*'):
    if p.is_file() and p.suffix in ['.html','.css','.js']:
        source=p.read_text(encoding='utf-8')
        assert not re.search(r'[A-Z]:[\\/]',source), f'Absolute machine path in {p}'
with ZipFile(archive,'w',ZIP_DEFLATED) as z:
    for p in sorted(site.rglob('*')):
        if p.is_file():z.write(p,p.relative_to(root).as_posix())
    z.write(report,report.name)
with ZipFile(archive) as z:
    assert z.testzip() is None
    # A fresh, contained extraction for the final smoke check.
    destination=Path(tempfile.mkdtemp(prefix='submission-check-',dir=root/'tmp'))
    for member in z.infolist():
        resolved=(destination/member.filename).resolve()
        assert resolved.is_relative_to(destination.resolve())
    z.extractall(destination)
    assert report.read_bytes()==(destination/report.name).read_bytes()
    for p in site.rglob('*'):
        if p.is_file():assert p.read_bytes()==(destination/p.relative_to(root)).read_bytes()
summary={'archive':archive.name,'entries':len(z.namelist()),'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'report':report.name,'report_figures':len(doc.inline_shapes),'members_left_blank':3,'extractedDirectory':str(destination)}
(root/'docs/package-check.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(summary,ensure_ascii=False,indent=2))
