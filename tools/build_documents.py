"""Dựng đúng hai tài liệu hiện hành; không sinh lại các bản Word đã thay thế."""
from pathlib import Path
import re, json
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.opc.constants import RELATIONSHIP_TYPE
from report_usecases import make_usecases

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT/'PC-Astral-Market'
FIG = ROOT/'docs/diagrams/concise'
FIG.mkdir(parents=True, exist_ok=True)
USE = make_usecases()
REPORT = ROOT/'BaoCao_Assignment2_PC-Astral-Market.docx'
GUIDE = ROOT/'UseCase_Logic_Ham_PC-Astral-Market.docx'
REPO = 'https://github.com/ngminhtamtech-cmd/Assignment-WEB1044'

def flow(name, labels, note):
    image = Image.new('RGB', (1600, 360), 'white')
    d = ImageDraw.Draw(image)
    font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 29)
    step = 1600/len(labels)
    for i, label in enumerate(labels):
        x = int(i*step)+12
        d.rounded_rectangle((x,30,x+step-45,195),radius=10,outline='#333333',width=3)
        lines=label.split('\n')
        for j,line in enumerate(lines):
            assert d.textlength(line,font=font)<step-65, line
            d.text((x+(step-45)/2,70+j*38),line,font=font,fill='#222222',anchor='mm')
        if i<len(labels)-1:
            y=112; end=x+step-4
            d.line((x+step-45,y,end,y),fill='#333333',width=3)
            d.polygon(((end,y),(end-13,y-8),(end-13,y+8)),fill='#333333')
    d.multiline_text((20,230),note,font=font,fill='#222222',spacing=12)
    image.save(FIG/(name+'.png'))
    return FIG/(name+'.png')

CART = flow('gio-hang', ['Thêm / sửa / xóa\nKiểm tra số lượng','Cập nhật Cart\nGộp dòng trùng','Lưu LocalStorage\nTính lại tổng','Cập nhật giao diện\nDòng giỏ và badge'],
            'F5: đọc dữ liệu đã lưu → kiểm tra dòng giỏ → tạo lại Cart → hiển thị.\nNhập sai: báo lỗi và giữ giá trị hợp lệ trước đó. Không sửa riêng con số trên màn hình.')
ORDER = flow('dat-hang', ['Kiểm tra form\nGiỏ và giá','Tạo bản chụp đơn\nLưu đơn thành công','Xóa nháp\nDọn giỏ khớp đơn','Hiển thị xác nhận\nGiữ nguyên mã đơn'],
             'Lưu đơn lỗi: giữ form và giỏ. Giá hoặc giỏ đổi: yêu cầu xác nhận lại.\nDọn giỏ lỗi: đơn vẫn đã lưu; nút thử lại chỉ dọn giỏ, không tạo thêm đơn.')
SLIDER = flow('slider', ['Nhận nút / timer\nTrước, sau, chấm','Đổi vị trí banner\nVòng đầu ↔ cuối','Đọc banner tại vị trí\nẢnh, tiêu đề, link','Cập nhật giao diện\nĐánh dấu chấm chọn'],
              'Tự chuyển sau 6 giây; tạm dừng khi rê chuột, có focus, tab ẩn hoặc người dùng bấm dừng.')
CLOCK = flow('countdown', ['Đọc hạn cố định\nTrong du-lieu.js','Hạn − giờ hiện tại\nKhông nhỏ hơn 0','Đổi ra ngày giờ\nPhút và giây','Hết hạn: dừng đếm\nTrở về giá thường'],
             'Cập nhật mỗi giây và khi trở lại tab. F5 không tạo lại thời hạn.\nProduct.layGia là nguồn đơn giá chung của danh sách, chi tiết, giỏ và đơn hàng.')

def setup():
    doc=Document(); s=doc.sections[0]
    s.page_width=Cm(21);s.page_height=Cm(29.7)
    s.left_margin=Cm(3);s.right_margin=Cm(2);s.top_margin=s.bottom_margin=Cm(2)
    s.header_distance=s.footer_distance=Cm(.8)
    for name,size in [('Normal',12),('Title',21),('Subtitle',12),('Heading 1',15),('Heading 2',13),('Caption',10.5),('TOC 1',11),('TOC 2',11)]:
        if name not in doc.styles: doc.styles.add_style(name,1)
        st=doc.styles[name];st.font.name='Times New Roman';st.font.size=Pt(size);st.font.color.rgb=RGBColor(0,0,0)
        for border in st.element.xpath('.//w:pBdr'):border.getparent().remove(border)
        for fonts in st.element.xpath('.//w:rFonts'):
            for attribute in list(fonts.attrib):
                if 'theme' in attribute.lower():del fonts.attrib[attribute]
            for attribute in ['ascii','hAnsi','eastAsia','cs']:fonts.set(qn('w:'+attribute),'Times New Roman')
        st.paragraph_format.line_spacing=1.15;st.paragraph_format.space_after=Pt(7)
        if name.startswith('Heading'):st.font.bold=True;st.paragraph_format.keep_with_next=True
        if name.startswith('TOC'):
            st.paragraph_format.tab_stops.add_tab_stop(Cm(16),WD_TAB_ALIGNMENT.RIGHT,WD_TAB_LEADER.DOTS)
            st.paragraph_format.space_after=Pt(5)
    foot=s.footer.paragraphs[0];foot.alignment=WD_ALIGN_PARAGRAPH.CENTER
    field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');foot._p.append(field)
    return doc

def para(doc,text,style=None): return doc.add_paragraph(text,style)
def heading(doc,text): return doc.add_heading(text,1)
def page(doc,title): doc.add_page_break();heading(doc,title)
def table(doc,headers,rows,widths):
    t=doc.add_table(rows=1,cols=len(headers));t.autofit=False
    for c,w in zip(t.columns,widths): c.width=Cm(w)
    for i,text in enumerate(headers): t.rows[0].cells[i].text=text
    for row in rows:
        cells=t.add_row().cells
        for i,text in enumerate(row):cells[i].text=str(text)
    for ri,row in enumerate(t.rows):
        pr=row._tr.get_or_add_trPr()
        keep=OxmlElement('w:cantSplit');pr.append(keep)
        if ri==0:pr.append(OxmlElement('w:tblHeader'))
        for i,c in enumerate(row.cells):
            c.width=Cm(widths[i]);tc=c._tc.get_or_add_tcPr()
            borders=OxmlElement('w:tcBorders')
            for side in ['top','left','bottom','right']:
                e=OxmlElement('w:'+side);e.set(qn('w:val'),'single');e.set(qn('w:sz'),'4');e.set(qn('w:color'),'D9D9D9');borders.append(e)
            tc.append(borders)
            margins=OxmlElement('w:tcMar')
            for side,value in [('top','70'),('bottom','70'),('left','90'),('right','90')]:
                e=OxmlElement('w:'+side);e.set(qn('w:w'),value);e.set(qn('w:type'),'dxa');margins.append(e)
            tc.append(margins)
            if ri==0:
                sh=OxmlElement('w:shd');sh.set(qn('w:fill'),'E8EDF2');tc.append(sh)
            for p in c.paragraphs:
                p.paragraph_format.space_after=Pt(2);p.paragraph_format.line_spacing=1.05
                for r in p.runs:r.font.size=Pt(11);r.bold=ri==0
    return t

def figure(doc,path,caption,width=16):
    p=doc.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.paragraph_format.keep_with_next=True
    p.add_run().add_picture(str(path),width=Cm(width))
    p=para(doc,caption,'Caption');p.alignment=WD_ALIGN_PARAGRAPH.CENTER

def link(doc,label,url):
    p=doc.add_paragraph();h=OxmlElement('w:hyperlink')
    h.set(qn('r:id'),doc.part.relate_to(url,RELATIONSHIP_TYPE.HYPERLINK,is_external=True))
    r=OxmlElement('w:r');t=OxmlElement('w:t');t.text=label;r.append(t);h.append(r);p._p.append(h)

def toc(doc):
    p=doc.add_paragraph('MỤC LỤC');p.runs[0].bold=True
    f=OxmlElement('w:fldSimple');f.set(qn('w:instr'),'TOC \\o "1-1" \\h \\z \\u')
    p=doc.add_paragraph();p._p.append(f)

def funcs(doc,filename,entries):
    source=(SITE/filename).read_text(encoding='utf-8')
    doc.add_heading(filename,2)
    rows=[]
    for name,description in entries:
        m=re.search(r'(?m)^\s*(?:(?:async )?function )?'+re.escape(name)+r'\(',source)
        assert m, (filename,name)
        lineno=source[:m.end()].count('\n')+1
        rows.append((name,description+' (dòng '+str(lineno)+').'))
    table(doc,['Hàm hoặc phương thức','Vai trò và vị trí'],rows,[5.4,10.6])

doc=setup()
for text in ['TRƯỜNG CAO ĐẲNG FPT POLYTECHNIC','CƠ SỞ ĐÀ NẴNG','MÔN LẬP TRÌNH CƠ SỞ VỚI JAVASCRIPT']:
    p=para(doc,text);p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.runs[0].bold=True
para(doc,'')
p=para(doc,'BÁO CÁO ASSIGNMENT 2','Title');p.alignment=WD_ALIGN_PARAGRAPH.CENTER
p=para(doc,'PC ASTRAL MARKET','Title');p.alignment=WD_ALIGN_PARAGRAPH.CENTER
p=para(doc,'Website bán máy tính mô phỏng');p.alignment=WD_ALIGN_PARAGRAPH.CENTER
para(doc,'')
para(doc,'Mã môn: WEB1044                         Lớp: ................................')
para(doc,'Giảng viên hướng dẫn: Cô Lê Anh Đào')
table(doc,['Thành viên','Họ và tên','MSSV'],[(1,'',''),(2,'',''),(3,'','')],[3,8,5])
para(doc,'Nhóm xây dựng website bằng HTML, CSS và JavaScript thuần. Báo cáo trình bày nghiệp vụ, đối chiếu Y1–Y3, tổ chức mã và kết quả kiểm thử. Các luồng xử lý được giải thích bằng lời và sơ đồ; phần tra cứu hàm nằm trong tài liệu riêng.')
para(doc,'Đà Nẵng, tháng 10 năm 2026').alignment=WD_ALIGN_PARAGRAPH.CENTER

doc.add_page_break();toc(doc)
heading(doc,'1 Tổng quan và phạm vi')
para(doc,'PC-Astral Market bán máy tính và phụ kiện dành cho sinh viên, người làm việc văn phòng và người chơi game. Nhóm dùng 24 sản phẩm minh họa, chia thành bốn danh mục: Laptop, PC để bàn, Màn hình và Phụ kiện.')
para(doc,'Khách xem danh sách, tìm hoặc lọc sản phẩm, xem cấu hình, chọn số lượng rồi thêm vào giỏ. Sau khi kiểm tra giỏ, khách nhập thông tin nhận hàng và xác nhận đơn mô phỏng. Không bắt buộc đăng nhập để mua hàng.')
para(doc,'Website có bảy trang: trang chủ, sản phẩm, chi tiết, giỏ hàng, đặt hàng, tài khoản và giới thiệu. Dữ liệu tĩnh nằm trong dự án; không có backend, cơ sở dữ liệu SQL, thanh toán thật hoặc gửi email. Giá và tồn kho chỉ phục vụ bài tập.')

page(doc,'2 Chức năng và ba yêu cầu tự đề xuất')
para(doc,'Bảng 1 đối chiếu các yêu cầu Y1 với chức năng đã triển khai. Nhóm mới, hot và khuyến mãi là nhãn sản phẩm; chúng khác với bốn danh mục hàng hóa.')
table(doc,['Yêu cầu','Cách thực hiện'],[
('Y1.1 Khởi tạo','Nạp dữ liệu, tạo Product và Cart, dựng giao diện chung rồi chạy trang hiện tại.'),
('Y1.2 Sản phẩm','Render 24 sản phẩm bằng JS; có ba nhóm mới/hot/khuyến mãi, tên, giá, ảnh và nút mua; trang danh mục và hiệu ứng hover/focus.'),
('Y1.3 Slider','Ba banner; nút trước/sau, chấm chọn và tự chuyển bằng JavaScript.'),
('Y1.4 Form','Kiểm tra rỗng, email, điện thoại; báo lỗi cạnh trường và focus lỗi đầu. Có thêm form tài khoản.'),
('Y1.5 Giỏ và lưu trữ','Thêm/gộp, đổi số lượng, xóa, tổng tiền tự cập nhật. LocalStorage giữ dữ liệu qua F5.'),
('Y1.6 Nâng cao','Countdown dùng thời hạn cố định; hết hạn ngừng giảm giá, không hiện số âm.')],[4,12])
para(doc,'Bảng 1. Đối chiếu các chức năng bắt buộc','Caption')
para(doc,'Y1.7 yêu cầu ba chức năng tự đề xuất. Cả ba chức năng dưới đây đã hoạt động riêng và kết hợp trên trang sản phẩm.')
table(doc,['Chức năng','Lý do chọn và hành vi hoàn chỉnh'],[
('1. Tìm kiếm','Khách thường biết tên hoặc thương hiệu. Tìm không phân biệt dấu/hoa thường; có thông báo không tìm thấy.'),
('2. Lọc sản phẩm','Khách cần chọn theo loại hàng và ngân sách. Lọc danh mục, thương hiệu, khoảng giá theo AND; có xóa lọc và số kết quả.'),
('3. Sắp xếp','Giúp so sánh theo giá hoặc tên. Giá tăng/giảm, tên A–Z và thứ tự mặc định; chỉ sắp kết quả hiện tại, không sửa mảng gốc.')],[4,12])
para(doc,'Bảng 2. Ba chức năng tự đề xuất và lý do lựa chọn','Caption')

page(doc,'3 Tổ chức mã và dữ liệu theo Y2')
para(doc,'HTML nằm tại gốc PC-Astral-Market; CSS nằm trong css; toàn bộ mã JavaScript nằm trong js và js/trang. Ảnh thật nằm trong img, font Sarabun nằm trong assets/fonts. Bảng dưới phản ánh tên file đang chạy, thay cho các tên tiếng Anh của bản cũ.')
table(doc,['File hoặc thư mục','Nhiệm vụ'],[
('7 file .html ở gốc','Bố cục cố định, form, template và vùng chờ hiển thị dữ liệu.'),
('css/style.css','Font, màu sắc, thành phần và bố cục responsive.'),
('js/products.json','Nguồn dữ liệu sản phẩm JSON chính; không viết tay từng thẻ sản phẩm trong HTML.'),
('js/du-lieu.js','Cấu hình danh mục, banner, khuyến mãi; đọc và kiểm tra dữ liệu.'),
('js/san-pham-du-phong.js','Bản JSON nhúng sinh từ products.json, giúp mở trực tiếp file://. Không sửa tay.'),
('js/mo-hinh.js','Class Product và Cart: giá, tồn kho, dòng giỏ, số lượng, tổng tiền.'),
('js/luu-tru.js','Đọc/ghi JSON, tài khoản, mã băm mật khẩu và kết thúc demo.'),
('js/hien-thi.js','Tìm/lọc, định dạng, thẻ sản phẩm, header/footer và thông báo.'),
('js/su-kien.js','Khởi tạo, sự kiện dùng chung, thêm giỏ và đồng bộ lưu trữ.'),
('js/trang/','trang-chu.js, san-pham.js, chi-tiet.js, gio-hang.js, dat-hang.js, tai-khoan.js xử lý từng trang.')],[5.3,10.7])
para(doc,'Bảng 3. Phân chia nhiệm vụ theo cấu trúc thực tế','Caption')
para(doc,'Mỗi sản phẩm có bảy trường chính: id, name, price, imgUrl, description, category, quantity. quantity của Product là tồn kho; quantity trong dòng giỏ là số lượng mua. Giỏ chỉ lưu mã sản phẩm và số lượng, rồi lấy lại giá hiện hành từ Product.')
para(doc,'Các script dùng defer theo thứ tự dữ liệu dự phòng → dữ liệu → lưu trữ → mô hình → hiển thị → trang hiện tại → sự kiện. Không có import/export. Object PCAstral giúp các file chia sẻ dữ liệu mà không trùng tên biến; hàm khởi tạo giữ phạm vi riêng.')

page(doc,'4 Phân tích chức năng bằng Use Case')
para(doc,'Hình 1 mô tả những việc khách hàng có thể thực hiện. Khách hàng là tác nhân bên ngoài; LocalStorage và bộ đếm thời gian là cách xử lý bên trong, không phải tác nhân. Đăng nhập phục vụ tài khoản demo, không phải điều kiện đặt hàng.')
figure(doc,USE/'01-overview.png','Hình 1. Use Case tổng quan website',12.4)
para(doc,'Các Use Case tìm/chọn sản phẩm và giỏ/đặt hàng được phân tích chi tiết trong tài liệu UseCase_Logic_Ham_PC-Astral-Market.docx. Quan hệ include chỉ biểu diễn bước kiểm tra bắt buộc; các đường nối không biểu diễn thứ tự thao tác.')

page(doc,'5 Logic hoạt động trọng tâm')
para(doc,'Giỏ hàng lấy dữ liệu làm nguồn tính toán. Mỗi dòng có thành tiền bằng đơn giá hiện hành nhân số lượng; tổng tiền là tổng các dòng, phí vận chuyển demo bằng 0. Nhóm không cộng tiền bằng cách đọc chuỗi đã định dạng trên màn hình.')
figure(doc,CART,'Hình 2. Luồng cập nhật giỏ và khôi phục khi F5')
para(doc,'Đặt hàng phải lưu được đơn trước khi dọn giỏ. Nếu giá hoặc nội dung giỏ thay đổi, lần bấm đầu thông báo thay đổi; người mua kiểm tra và bấm lại. Nếu dọn giỏ lỗi, cờ choDonGio giữ lại bước cần thử; hệ thống không tạo thêm đơn khi thử lại.')
figure(doc,ORDER,'Hình 3. Luồng đặt hàng và xử lý lưu trữ thất bại')
para(doc,'Slider giữ vị trí banner hiện tại, đổi vị trí khi bấm nút hoặc hết 6 giây, sau đó cập nhật ảnh và nội dung. Khi có focus, rê chuột, tab ẩn hoặc bấm tạm dừng, slider không tự chuyển.')
para(doc,'Countdown lấy thời hạn cố định trừ thời gian hiện tại và cập nhật mỗi giây. Hết hạn thì dừng ở 0, báo kết thúc và lấy giá thường. F5 không đặt lại thời hạn; giỏ và form cùng dùng nguồn giá của Product.')
para(doc,'Tài khoản lưu username, salt và mã băm mật khẩu trong LocalStorage. Đăng ký xong đăng nhập bằng mật khẩu vừa nhập. Đăng xuất không xóa tài khoản. “Kết thúc buổi demo” xóa các khóa của website; không gọi localStorage.clear().')

page(doc,'6 Minh chứng giao diện')
para(doc,'Hình dưới là ảnh chụp khi chạy kiểm thử, minh họa dữ liệu render từ JavaScript. Trang sản phẩm giữ tìm kiếm, lọc và sắp xếp trong URL để tải lại vẫn giữ lựa chọn.')
figure(doc,ROOT/'docs/screenshots/current/02-products-filtered.png','Hình 4. Trang sản phẩm với tìm kiếm và bộ lọc',14.2)
para(doc,'Các ảnh kiểm thử form báo lỗi, giỏ hàng, tài khoản và xác nhận đơn được lưu trong docs/screenshots/current để đối chiếu khi cần; báo cáo chỉ giữ một minh chứng tiêu biểu để tránh lặp nhiều trang giao diện.')

page(doc,'7 Kiểm thử và kết quả')
para(doc,'Nhóm chạy kiểm thử bằng Playwright trên Chrome và Edge qua HTTP local và mở trực tiếp file://. Các trường hợp dưới đây đã được chạy lại sau khi đổi cú pháp; không dùng kết quả tự ước lượng để ghi đạt.')
table(doc,['Phần kiểm tra','Kết quả và minh chứng'],[
('Chức năng chính','18/18 nhóm đạt: khởi tạo, slider, tìm kiếm, lọc, chi tiết, giỏ, form, đặt hàng, countdown, responsive và bàn phím.'),
('Mô hình và tài khoản','13/13 nhóm đạt: JSON đủ 24 sản phẩm, class, event delegation, đăng ký/đăng nhập/F5/đăng xuất/reset và lỗi lưu trữ.'),
('Các lỗi logic đặc biệt','13 tình huống trên mỗi trình duyệt: nháp F5, giá đổi, dọn giỏ lỗi, gửi lặp, tab cũ, reset khi đang băm mật khẩu. Tổng 26 lượt HTTP đạt.'),
('Mở trực tiếp và bản đóng gói','Chạy luồng mua hàng ở đường dẫn có dấu/khoảng trắng trên hai trình duyệt; thử thêm các lỗi logic với file:// và kiểm tra ZIP sau giải nén.'),
('Giao diện','Kiểm tra bảy trang ở 390, 768, 1440 px; không tràn ngang trong các ca đã chạy. Không có lỗi JavaScript chưa xử lý ở các luồng kiểm thử.')],[4.5,11.5])
para(doc,'Bảng 4. Kết quả kiểm thử sau chỉnh sửa','Caption')
para(doc,'Log chi tiết nằm tại docs/current-tests.json, accounts-models-tests.json, logic-regressions.json, logic-file-regressions.json, file-mode-tests.json và package-smoke.json. Đây là bằng chứng cho các tình huống đã thử, không phải cam kết website không thể có lỗi trong mọi điều kiện.')
para(doc,'Giới hạn lưu dữ liệu: tắt Live Server không xóa LocalStorage. Dữ liệu có thể mất khi người dùng tự xóa dữ liệu trình duyệt hoặc bị trình duyệt chặn. Cần giữ cùng địa chỉ/cổng khi demo; dữ liệu giữa file:// và localhost không mặc nhiên dùng chung.')
para(doc,'Giỏ được dọn khi đặt hàng thành công, bản nháp được xóa sau khi lưu đơn. Dữ liệu tài khoản được website giữ cho đến thao tác kết thúc demo. Tài khoản và đơn chỉ mô phỏng ở máy hiện tại, không phải dịch vụ bán hàng thật.')

page(doc,'8 Công cụ thư viện và quản lý nhóm')
table(doc,['Nhóm','Thực tế sử dụng'],[
('Công nghệ website','HTML5, CSS3, JavaScript thuần; không có bước build để chạy.'),
('Thư viện chạy trong website','Không sử dụng thư viện JavaScript hoặc CSS bên ngoài. Không có React, jQuery, Bootstrap hay thư viện slider/validation.'),
('API trình duyệt','DOM, addEventListener, LocalStorage, JSON, URLSearchParams, timer, fetch cho JSON tĩnh và Web Crypto để băm mật khẩu. Đây là API, không phải thư viện cài đặt.'),
('Tài nguyên','Font Sarabun local; ảnh và thông tin sản phẩm tham khảo PC Market, lưu trong dự án; nguồn từng ảnh ghi trong ASSET-SOURCES.md.'),
('Công cụ phát triển và kiểm tra','VS Code/Live Server để mở local; Node.js và Playwright chạy kiểm thử. Các công cụ này không được nạp vào website.'),
('Công cụ tài liệu','Python, python-docx, Pillow tạo Word/hình; Microsoft Word xuất PDF để kiểm tra bố cục. Sơ đồ có nguồn Draw.io chỉnh sửa được.')],[4.5,11.5])
para(doc,'Bảng 5. Phân biệt công nghệ, API, thư viện và công cụ','Caption')
doc.add_heading('Quản lý dự án cùng nhóm qua GitHub',2)
para(doc,'Kho GitHub lưu mã nguồn và tài liệu của dự án. Quy trình phối hợp đề xuất cho nhóm: cập nhật mã mới trước khi làm, phân chia phần việc, tạo nhánh riêng, commit có mô tả và nhờ thành viên khác kiểm tra trước khi gộp. Lịch sử commit giúp đối chiếu thay đổi và khôi phục phiên bản khi cần.')
link(doc,'GitHub dự án PC-Astral Market',REPO)
para(doc,REPO)
doc.add_heading('Chạy và bàn giao',2)
para(doc,'Giải nén gói nộp, mở PC-Astral-Market/index.html bằng Live Server hoặc mở trực tiếp. Nếu sửa products.json, dùng Live Server để đọc dữ liệu mới; chạy công cụ đồng bộ trước khi tạo lại bản mở trực tiếp. ZIP chứa website và báo cáo Y3 này; tài liệu Use Case, logic và hàm được giữ riêng để đọc hiểu.')
para(doc,'Nguồn đối chiếu: Assignment – Lập trình cơ sở với Javascript (WEB1044), Y1–Y3; ảnh/thông tin PC Market (https://pcmarket.vn/), danh sách nguồn trong PC-Astral-Market/ASSET-SOURCES.md; mã và log kiểm thử của chính dự án. Ba chức năng tự đề xuất và lý do nằm tại mục 2; các giới hạn của bản mô phỏng nằm tại mục 7.')
doc.save(REPORT)

doc=setup()
para(doc,'PC ASTRAL MARKET','Title')
para(doc,'Use Case logic hoạt động và các hàm','Subtitle')
heading(doc,'1 Use Case tổng quan')
para(doc,'Tài liệu này dùng để lần theo chức năng vào mã nguồn. Đọc sơ đồ để biết khách thực hiện được gì, đọc luồng để biết dữ liệu thay đổi thế nào, rồi dùng bảng hàm để tìm đúng chỗ sửa. Tên hàm và số dòng được lấy theo mã hiện tại; số dòng có thể thay đổi khi sửa file.')
figure(doc,USE/'01-overview.png','Hình 1. Phạm vi sử dụng của khách hàng',11.4)
para(doc,'Khách không cần đăng nhập để đặt hàng. Tài khoản demo hỗ trợ đăng ký, đăng nhập và đăng xuất. “Kết thúc buổi demo” là thao tác xóa dữ liệu riêng của website; không phải chức năng quản trị. Website không có tài khoản quản trị hay thanh toán trực tuyến.')

page(doc,'2 Use Case tìm và chọn sản phẩm')
figure(doc,USE/'02-find-select.png','Hình 2. Các chức năng tra cứu và chọn hàng',12.0)
para(doc,'Mục tiêu: tìm sản phẩm phù hợp. Điều kiện trước: dữ liệu sản phẩm đã nạp. Khách có thể xem danh mục, tìm kiếm, lọc và sắp xếp riêng hoặc kết hợp; sau đó xem chi tiết hoặc thêm giỏ ngay từ danh sách.')
para(doc,'Khi không có kết quả, trang hiện thông báo và cho xóa lọc. ID không tồn tại hiện “Không tìm thấy sản phẩm”. Sản phẩm hết hàng không cho thêm. Kết quả: danh sách đúng điều kiện và giỏ nhận đúng mã hàng, số lượng. UC02–UC04 là ba yêu cầu tự đề xuất của Y1.7.')

page(doc,'3 Use Case giỏ hàng và đặt hàng')
figure(doc,USE/'03-cart-checkout.png','Hình 3. Giỏ hàng và các bước kiểm tra bắt buộc',12.0)
para(doc,'Mục tiêu: hoàn tất một đơn mô phỏng. Khách xem giỏ, sửa hoặc xóa hàng; số lượng chỉ nhận số nguyên từ 1 đến tồn kho. Thêm trùng tăng số lượng của dòng cũ. Giỏ rỗng không thể đặt đơn.')
para(doc,'Đặt hàng luôn kiểm tra thông tin người nhận. Mũi tên «include» đi từ chức năng chính tới bước kiểm tra được sử dụng. Kết quả thành công là một bản chụp đơn đã lưu, không phải giao dịch thật. “Xem xác nhận” là đơn gần nhất được lưu trên trình duyệt, không phải danh sách lịch sử đơn hàng.')

page(doc,'4 Logic giỏ hàng đặt hàng và F5')
figure(doc,CART,'Hình 4. Dữ liệu giỏ là nguồn tính tổng')
para(doc,'Cart giữ các dòng gồm productId và quantity. Khi tính tiền, Cart tra Product theo ID, lấy giá đang áp dụng, nhân số lượng rồi cộng dồn. Định dạng tiền chỉ thực hiện khi hiển thị, vì chuỗi “1.000.000 đ” không dùng để cộng tiền.')
para(doc,'Nút trong danh sách và giỏ được xử lý bằng event delegation ở phần tử cha. Sự kiện xác định nút gần nhất và mã sản phẩm, gọi Cart trước rồi cập nhật dòng hiển thị. Nhập số lượng sai giữ số cũ, không dựng lại toàn bộ form làm mất focus.')
figure(doc,ORDER,'Hình 5. Chỉ dọn giỏ sau khi đơn lưu được')
para(doc,'Khi form đang mở, ứng dụng so cả mã hàng, số lượng và đơn giá với lần hiển thị trước. Dù tổng tiền không đổi, đổi sản phẩm vẫn phải xác nhận lại. Form sai hoặc lưu đơn thất bại đều giữ dữ liệu để sửa hoặc thử lại.')
para(doc,'Đơn đã lưu nhưng dọn giỏ lỗi: cờ choDonGio cho biết bước chưa xong. F5 đọc lại đơn; nút thử lại chỉ dọn khi giỏ còn khớp đơn. Nếu khách đã mua giỏ mới, không tự xóa giỏ đó. Khóa trạng thái gửi ngăn nhấp nhanh hoặc Enter tạo nhiều đơn.')
para(doc,'Bản nháp lưu đủ năm trường mỗi khi nhập và được khôi phục khi F5. Dữ liệu nháp hỏng được bỏ qua; không lưu mật khẩu đang gõ. Form đang nhập không bị dữ liệu nháp của tab khác tự ghi đè.')

page(doc,'5 Logic slider countdown và tài khoản')
figure(doc,SLIDER,'Hình 6. Chuyển banner bằng JavaScript')
figure(doc,CLOCK,'Hình 7. Countdown dùng thời hạn cố định')
para(doc,'Đăng ký: kiểm tra tên và mật khẩu → tìm tên trùng → tạo salt → băm mật khẩu → kiểm tra dấu reset → lưu username, salt và hash. Đăng nhập: tìm tài khoản → băm mật khẩu nhập với salt đã lưu → so hash → kiểm tra reset và tài khoản còn tồn tại → lưu trạng thái đăng nhập.')
para(doc,'Phần băm phải chờ xử lý bất đồng bộ. Nếu người dùng kết thúc demo trong lúc chờ, mã kiểm tra dấu reset sau await và dừng, tránh khôi phục dữ liệu vừa bị xóa. Không bỏ bước này để làm mã ngắn hơn.')
table(doc,['Khóa LocalStorage','Dữ liệu và lúc xóa'],[
('pc-astral.cart.v1','Giỏ; dọn sau khi lưu đơn thành công hoặc kết thúc demo.'),
('pc-astral.checkout-draft.v1','Nháp năm trường; xóa sau lưu đơn hoặc kết thúc demo.'),
('pc-astral.users.v1','Username, salt, hash; giữ sau đăng xuất, chỉ website chủ động xóa khi kết thúc demo.'),
('pc-astral.auth.v1','Trạng thái đăng nhập; xóa khi đăng xuất hoặc kết thúc demo.'),
('pc-astral.last-order.v1','Đơn gần nhất; đơn mới thay thế đơn cũ, kết thúc demo thì xóa.'),
('pc-astral.demo-reset.v1','Mốc reset để chặn tác vụ cũ; được cập nhật và giữ lại.')],[6.5,9.5])

page(doc,'6 Các hàm dữ liệu và mô hình')
funcs(doc,'js/du-lieu.js',[
('kiemTraSanPham','Kiểm tra kiểu và các trường bắt buộc trước khi tạo Product'),
('napDuLieuSanPham','Đọc JSON qua HTTP; mở file trực tiếp thì đọc bản nhúng')])
funcs(doc,'js/mo-hinh.js',[
('dangGiamGia','So chiến dịch và thời hạn; chỉ giảm khi giá giảm hợp lệ'),
('layGia','Trả về số tiền hiện hành dùng chung cho mọi trang'),
('layGiaHienThi','Đổi số thành chuỗi VNĐ; không thay đổi giá gốc'),
('conHang','Cho biết tồn kho còn lớn hơn 0'),
('coTheMua','Kiểm tra số lượng nguyên an toàn và không vượt tồn kho'),
('layTenDanhMuc','Tra tên danh mục theo mã'),
('kiemTraGio','Lọc dữ liệu lưu bị hỏng, gộp trùng và giới hạn tồn kho'),
('themSanPham','Tìm dòng cũ để cộng dồn hoặc tạo dòng mới'),
('doiSoLuong','Kiểm tra số mới, cập nhật dòng và gọi lưu giỏ'),
('xoaSanPham','Xóa dòng theo ID rồi báo dữ liệu thay đổi'),
('tinhTongGio','Tính đơn giá, thành tiền, tổng số lượng và tổng tiền'),
('layTongTien','Lấy tổng tiền từ kết quả tính giỏ'),
('xoaGio','Thử lưu giỏ rỗng; phục hồi giỏ trong bộ nhớ nếu lưu thất bại')])
para(doc,'Product có thuộc tính sản phẩm; Cart giữ danh sách sản phẩm, các dòng giỏ và hàm gọi khi thay đổi. constructor là tên chuẩn của JavaScript. Dùng Ctrl+F tên hàm trong đúng file; không đổi tên để tránh đứt các nơi đang gọi.')

page(doc,'7 Các hàm lưu trữ và đặt hàng')
funcs(doc,'js/luu-tru.js',[
('docJSON','Đọc và JSON.parse; dữ liệu lỗi trả về giá trị dự phòng'),
('luuJSON','JSON.stringify rồi ghi; trả true/false để bên gọi xử lý'),
('ketThucDemo','Ghi mốc reset rồi xóa đúng các khóa dữ liệu website'),
('bamMatKhau','Dùng Web Crypto PBKDF2 với salt, không lưu mật khẩu thô'),
('dangKy','Kiểm tra, băm và lưu tài khoản; chặn tên trùng'),
('dangNhap','So hash, kiểm tra reset sau await rồi lưu phiên'),
('dangXuat','Xóa trạng thái đăng nhập, giữ tài khoản và giỏ')])
funcs(doc,'js/trang/dat-hang.js',[
('luuBanNhap','Lưu năm trường khi form phát sinh input'),
('khoiPhucBanNhap','Đọc nháp và điền lại các trường có kiểu chuỗi'),
('cacDongGiongNhau','So ID, số lượng và khi cần so thêm giá'),
('hienThiTongTien','Cập nhật tóm tắt; đánh dấu khi cần xác nhận lại'),
('taoDonHang','Tạo mã đơn, thời điểm, thông tin và bản chụp dòng hàng'),
('xuLyDatHang','Kiểm tra form/giá, lưu đơn trước rồi xử lý dọn giỏ'),
('thuDonGio','Thử lại bước dọn giỏ của cùng đơn; không tạo đơn khác'),
('hienThiXacNhan','Hiển thị bản chụp đã lưu và cảnh báo còn tồn tại')])

page(doc,'8 Các hàm hiển thị và sự kiện')
funcs(doc,'js/hien-thi.js',[
('boDau','Chuẩn hóa tìm kiếm không dấu và không phân biệt hoa thường'),
('locSanPham','Duyệt sản phẩm, kết hợp tìm kiếm và các điều kiện lọc'),
('kiemTraKhachHang','Trim rồi kiểm tra bắt buộc, email và điện thoại'),
('taoTheSanPham','Dựng thẻ dùng chung từ Product'),
('theoDoiKhuyenMai','Phát sự kiện giá cần cập nhật khi hết hạn')])
funcs(doc,'js/su-kien.js',[
('xuLyThemGio','Bắt nút thêm giỏ qua phần tử cha và gọi Cart'),
('xuLyLuuTruThayDoi','Đồng bộ khi tab khác thay đổi dữ liệu'),
('khoiTaoWebsite','Chờ dữ liệu rồi tạo mô hình, giao diện và trang')])
funcs(doc,'js/trang/trang-chu.js',[
('chuyenBanner','Cộng vị trí, vòng đầu/cuối, hiển thị banner mới'),
('tuChuyenBanner','Kiểm tra điều kiện tạm dừng trước khi tự chuyển'),
('capNhatDemNguoc','Tính phần thời gian còn lại, dừng khi bằng 0')])
funcs(doc,'js/trang/san-pham.js',[
('hienThiDanhSachSanPham','Lấy kết quả lọc, sắp xếp rồi render'),
('capNhatURL','Ghi lựa chọn vào URL để reload vẫn giữ')])
funcs(doc,'js/trang/gio-hang.js',[
('xuLyBamNutGio','Nhận tăng/giảm/xóa qua event delegation'),
('xuLyDoiSoLuong','Đọc ô nhập và giữ giá trị trước nếu nhập sai')])
doc.save(GUIDE)
print(REPORT.name);print(GUIDE.name)
