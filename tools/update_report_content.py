"""Chỉnh cục bộ báo cáo Y3 hiện có; không dựng lại bìa, chương hoặc kiểu định dạng."""
from pathlib import Path
from hashlib import sha256
import json
from docx import Document
from report_updated_diagrams import make_diagrams
from report_usecases import make_usecases

ROOT=Path(__file__).resolve().parents[1]
PATH=ROOT/'BaoCao_Assignment2_PC-Astral-Market.docx'
doc=Document(PATH)
before_hash=sha256(PATH.read_bytes()).hexdigest()
headings=[p.text for p in doc.paragraphs if p.style.name.startswith('Heading')]
cover=[p._p.xml for p in doc.paragraphs[:15]]
assert len(doc.inline_shapes)==19, 'Dừng: đây không phải bản báo cáo đầy đủ đã duyệt.'

def set_text(p,text):
    # Giữ pPr/rPr và định dạng sẵn có; chỉ đổi nội dung đoạn văn thường.
    runs=p.runs
    if not runs:
        p.add_run(text)
    else:
        runs[0].text=text
        for run in runs[1:]:run.text=''
        # Các tình huống chỉ in đậm nhãn trước dấu hai chấm, không in đậm cả đoạn.
        if text.startswith(('Mục tiêu:', 'Trường hợp cần xử lý:', 'Kết quả:')):
            label,body=text.split(':',1)
            runs[0].text=label+':'
            runs[0].bold=True
            content=p.add_run(body)
            content.bold=False

changes=json.loads((ROOT/'docs/report-content-updates.json').read_text(encoding='utf-8'))
for change in changes:
    found=[p for p in doc.paragraphs if p.text==change['old'] or p.text==change['new']]
    assert len(found)==1, 'Không nhận ra đoạn báo cáo: '+change['old'][:80]
    set_text(found[0],change['new'])

# Chỉ sửa chữ trong chú thích, giữ trường SEQ của Word.
for p in doc.paragraphs:
    for run in p.runs:
        if 'Sáu' in run.text:run.text=run.text.replace('Sáu','Bảy')

def cell(table,row,col,text):
    c=doc.tables[table].rows[row].cells[col]
    set_text(c.paragraphs[0],text)
    for p in c.paragraphs[1:]:set_text(p,'')

cell(1,1,1,'Mở bảy trang, nạp JSON, tạo mô hình và gắn sự kiện. Không có lỗi JavaScript trong các luồng đã kiểm thử.')
cell(1,2,1,'24 sản phẩm từ JSON; có tên, giá, ảnh và nút thao tác. Có danh mục, nhóm mới/hot/khuyến mãi và hiệu ứng hover/focus.')
cell(1,4,1,'Form đặt hàng kiểm tra rỗng, email và điện thoại; form tài khoản kiểm tra tên và mật khẩu. Lỗi hiện cạnh ô cần sửa.')
tasks=[
('du-lieu.js; products.json; san-pham-du-phong.js','Nạp và kiểm tra JSON; cấu hình danh mục, banner, khuyến mãi. Bản dự phòng dùng khi mở file trực tiếp.'),
('mo-hinh.js','Class Product xác định giá và tồn kho; Cart thêm, sửa, xóa và tính tổng giỏ.'),
('luu-tru.js','Đọc/ghi LocalStorage, xử lý lỗi; đăng ký, băm mật khẩu, đăng nhập và kết thúc demo.'),
('hien-thi.js','Tiện ích tìm/lọc/sắp xếp, validation; dựng header, footer, thẻ sản phẩm và thông báo.'),
('su-kien.js','Chờ dữ liệu, tạo mô hình, khởi tạo trang; thêm giỏ bằng event delegation và đồng bộ tab.'),
('trang/trang-chu.js, trang/san-pham.js, trang/chi-tiet.js','Xử lý trang chủ, danh sách và chi tiết; slider, countdown và bộ lọc.'),
('trang/gio-hang.js, trang/dat-hang.js, trang/tai-khoan.js','Xử lý giỏ, đặt hàng và tài khoản. Trang giới thiệu dùng phần khởi tạo chung.')]
for i,(name,role) in enumerate(tasks,1):cell(2,i,0,name);cell(2,i,1,role)
cell(5,2,1,'Chặn ghi khóa đơn trong LocalStorage khi đặt hàng')
cell(5,5,1,'Xem bảy trang ở 390, 768 và 1440 px')
cell(6,2,1,'DOM, LocalStorage, Web Crypto, bộ hẹn giờ, URLSearchParams')
cell(6,2,2,'Cập nhật nội dung, lưu dữ liệu, băm mật khẩu, điều khiển thời gian và đọc lựa chọn.')

images=make_diagrams();use=make_usecases()
replacements={0:images/'sitemap.png',2:images/'structure.png',3:images/'data.png',4:use/'01-overview.png',14:images/'order.png'}
for i,path in replacements.items():
    shape=doc.inline_shapes[i]
    rid=shape._inline.graphic.graphicData.pic.blipFill.blip.embed
    doc.part.related_parts[rid]._blob=path.read_bytes()
    # Giữ chiều rộng; cập nhật tỷ lệ ảnh để chữ không méo.
    from PIL import Image
    with Image.open(path) as image:shape.height=int(shape.width*image.height/image.width)

assert headings==[p.text for p in doc.paragraphs if p.style.name.startswith('Heading')]
assert cover==[p._p.xml for p in doc.paragraphs[:15]]
assert len(doc.inline_shapes)==19
doc.save(PATH)
(ROOT/'docs/report-content-sync.json').write_text(json.dumps({
 'before_sha256':before_hash,'after_sha256':sha256(PATH.read_bytes()).hexdigest(),
 'paragraphs_updated':len(changes),'diagrams_updated':list(replacements),
 'headings':headings,'cover_xml_preserved':True,'figures':19,
 'note':'Giữ bìa và chương mục; cập nhật nội dung kỹ thuật và bảng nhiệm vụ.'
},ensure_ascii=False,indent=2),encoding='utf-8')
print('Updated existing Y3 report; cover and headings preserved.')
