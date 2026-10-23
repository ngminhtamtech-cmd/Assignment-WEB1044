"""Sơ đồ cho báo cáo được giữ nguyên bố cục, cập nhật theo website hiện hành."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / 'docs/diagrams/report-current'

def canvas(name, height):
    OUT.mkdir(parents=True, exist_ok=True)
    image = Image.new('RGB', (1600, height), 'white')
    draw = ImageDraw.Draw(image)
    return image, draw

def box(draw, rect, lines, size=33):
    x, y, w, h = rect
    draw.rounded_rectangle((x,y,x+w,y+h), radius=12, fill='#edf3f5', outline='#68757c', width=2)
    font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', size)
    step = size * 1.35
    assert len(lines)*step < h-10, lines
    for i,line in enumerate(lines):
        assert draw.textlength(line,font=font) < w-24, line
        draw.text((x+w/2,y+h/2+(i-(len(lines)-1)/2)*step),line,font=font,fill='#222222',anchor='mm')

def arrow(draw, points):
    draw.line(points, fill='#68757c', width=3)
    x,y=points[-1];px,py=points[-2]
    if x==px:
        sign=1 if y>py else -1
        draw.polygon([(x,y),(x-8,y-sign*14),(x+8,y-sign*14)], fill='#68757c')
    else:
        sign=1 if x>px else -1
        draw.polygon([(x,y),(x-sign*14,y-8),(x-sign*14,y+8)], fill='#68757c')

def make_diagrams():
    image,d=canvas('sitemap',820)
    box(d,(540,20,520,140),['Trang chủ — index.html','Banner, danh mục và nhóm hàng'])
    for x in [270,800,1330]:arrow(d,[(800,160),(800,220),(x,220),(x,290)])
    box(d,(30,290,480,150),['Sản phẩm — products.html','Tìm kiếm, lọc và sắp xếp'])
    box(d,(560,290,480,150),['Giỏ hàng — cart.html','Số lượng và tổng tiền'])
    box(d,(1090,290,480,150),['Tài khoản — register.html','Đăng ký, đăng nhập, đăng xuất'])
    box(d,(30,550,480,150),['Chi tiết — product-detail.html','Cấu hình và thêm giỏ'])
    box(d,(560,550,480,150),['Đặt hàng — checkout.html','Form và xác nhận mô phỏng'])
    box(d,(1090,550,480,150),['Giới thiệu — about.html','Thông tin và chính sách'])
    arrow(d,[(270,440),(270,550)]);arrow(d,[(510,625),(535,625),(535,365),(560,365)])
    arrow(d,[(800,440),(800,550)]);arrow(d,[(1570,365),(1590,365),(1590,625),(1570,625)])
    d.text((800,770),'Header và footer giúp chuyển giữa các trang; đặt hàng không bắt buộc đăng nhập.',font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',30),fill='#222222',anchor='mm')
    image.save(OUT/'sitemap.png')

    image,d=canvas('structure',1520)
    box(d,(510,20,580,120),['PC-Astral-Market','Thư mục website bàn giao'],36)
    box(d,(40,230,730,240),['7 file HTML ở cấp gốc','index.html · products.html','product-detail.html · cart.html','checkout.html · register.html · about.html'],32)
    box(d,(830,230,730,240),['css/style.css','Font, nền tảng, thành phần','Bố cục các trang và responsive'],34)
    box(d,(40,570,730,410),['js — dữ liệu và chức năng chung','products.json · san-pham-du-phong.js','du-lieu.js · mo-hinh.js','luu-tru.js · hien-thi.js · su-kien.js','js/trang — xử lý từng trang','trang-chu.js · san-pham.js · chi-tiet.js','gio-hang.js · dat-hang.js · tai-khoan.js'],31)
    box(d,(830,570,730,410),['img/','Ảnh sản phẩm, ảnh banner sử dụng cục bộ','assets/fonts/sarabun/','Font Sarabun và giấy phép OFL.txt'],32)
    box(d,(270,1140,1060,200),['Tài liệu ở cấp gốc','README.md · ASSET-SOURCES.md','HUONG-DAN-MO-WEBSITE.txt'],34)
    # Các nhóm cùng thuộc thư mục gốc, không biểu diễn js là thư mục con của HTML.
    d.line([(800,140),(800,1080)],fill='#68757c',width=3)
    for x in [405,1195]:
        arrow(d,[(800,185),(x,185),(x,230)])
        arrow(d,[(800,525),(x,525),(x,570)])
    arrow(d,[(800,1080),(800,1140)])
    image.save(OUT/'structure.png')

    image,d=canvas('data',910)
    box(d,(25,30,460,220),['Danh mục','id · name','Nhóm Laptop, PC, Màn hình,','Phụ kiện'],31)
    box(d,(600,30,970,220),['Product từ products.json','id · name · price · imgUrl','description · category · quantity','Thêm thương hiệu, thông số và nhãn nhóm'],33)
    box(d,(25,360,600,240),['Cart — các dòng giỏ','productId · quantity','Tra Product để lấy giá hiện hành','Tính thành tiền và cộng tổng'],33)
    box(d,(850,360,720,240),['Đơn đã xác nhận','Mã đơn, người nhận, ngày đặt','Tên hàng, số lượng, đơn giá tại lúc đặt','choDonGio: bước dọn giỏ còn dang dở'],31)
    arrow(d,[(485,140),(600,140)]);arrow(d,[(600,170),(545,170),(545,330),(325,330),(325,360)])
    arrow(d,[(625,480),(850,480)])
    box(d,(25,690,745,160),['Tài khoản trong LocalStorage','username · salt · passwordHash','Đăng xuất chỉ xóa trạng thái đăng nhập'],31)
    box(d,(825,690,745,160),['Bản nháp trong LocalStorage','Họ tên, email, điện thoại, địa chỉ, ghi chú','Xóa sau khi lưu đơn hoặc kết thúc demo'],31)
    image.save(OUT/'data.png')

    image,d=canvas('order',1470)
    main=[['1 Kiểm tra thông tin nhận hàng','Giỏ có hàng, số lượng hợp lệ'],
          ['2 So giỏ và giá với lần hiển thị','Thay đổi: giữ form, yêu cầu xác nhận lại'],
          ['3 Tạo bản chụp và lưu đơn','LocalStorage — đánh dấu chờ dọn giỏ'],
          ['4 Xóa nháp, thử dọn giỏ khớp đơn','Chỉ xử lý sau khi đơn đã lưu được'],
          ['5 Hiển thị xác nhận cùng mã đơn','F5 đọc lại đơn đã lưu, không tạo đơn mới']]
    for i,lines in enumerate(main):
        y=30+i*255;box(d,(420,y,820,160),lines,33)
        if i:arrow(d,[(830,y-95),(830,y)])
    box(d,(20,360,335,220),['Form sai / giá đổi','Hiện lỗi hoặc','yêu cầu xác nhận','Giữ nội dung nhập'],29)
    arrow(d,[(420,365),(355,365)])
    box(d,(1260,510,320,250),['Lưu đơn thất bại','Giữ giỏ và nháp','Mở lại nút gửi','Không báo thành công'],27)
    arrow(d,[(1240,620),(1260,620)])
    box(d,(20,780,335,330),['Dọn giỏ thất bại','Giữ đơn đã lưu','Cờ choDonGio','Thử lại cùng đơn','Giỏ đã đổi:','không tự xóa'],29)
    arrow(d,[(420,875),(355,875)])
    box(d,(300,1300,1000,120),['Đơn chỉ mô phỏng; không gửi email hoặc thu tiền thật.','Kết thúc buổi demo mới xóa dữ liệu riêng của website.'],31)
    image.save(OUT/'order.png')
    return OUT

if __name__ == '__main__':
    print(make_diagrams())
