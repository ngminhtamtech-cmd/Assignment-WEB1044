"""Draw the report's explanatory figures; these are not website assets."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/diagrams/report'
OUT.mkdir(parents=True, exist_ok=True)
FONT = 'C:/Windows/Fonts/arial.ttf'
BOLD = 'C:/Windows/Fonts/arialbd.ttf'
INK = '#202020'
LINE = '#66757b'
BLUE = '#edf3f5'


class Diagram:
    def __init__(self, name, height=950, width=1400):
        self.path = OUT / name
        self.im = Image.new('RGB', (width, height), 'white')
        self.d = ImageDraw.Draw(self.im)

    def text(self, box, text, size=30, bold=False, center=False, color=INK):
        x, y, width, height = box
        font = ImageFont.truetype(BOLD if bold else FONT, size)
        lines = []
        for source in text.split('\n'):
            current = ''
            for word in source.split():
                proposed = (current + ' ' + word).strip()
                if current and self.d.textlength(proposed, font=font) > width:
                    lines.append(current)
                    current = word
                else:
                    current = proposed
            lines.append(current)
        step = int(size * 1.36)
        assert len(lines) * step <= height + 4, (self.path.name, text, len(lines) * step, height)
        for i, line in enumerate(lines):
            left = x + (width - self.d.textlength(line, font=font)) / 2 if center else x
            self.d.text((left, y + i * step), line, font=font, fill=color)

    def box(self, rect, title, body='', fill=BLUE, size=30):
        x, y, w, h = rect
        self.d.rounded_rectangle((x, y, x+w, y+h), radius=13, fill=fill, outline=LINE, width=2)
        self.text((x+22, y+17, w-44, 48), title, size, True, True)
        if body:
            self.text((x+22, y+66, w-44, h-75), body, size-2, False, True)

    def arrow(self, points, label='', label_at=None):
        self.d.line(points, fill=LINE, width=4, joint='curve')
        a, b = points[-2:]
        angle = math.atan2(b[1]-a[1], b[0]-a[0])
        self.d.polygon([b, (b[0]-16*math.cos(angle-.5), b[1]-16*math.sin(angle-.5)),
                        (b[0]-16*math.cos(angle+.5), b[1]-16*math.sin(angle+.5))], fill=LINE)
        if label:
            x, y = label_at or ((a[0]+b[0])/2+12, (a[1]+b[1])/2-20)
            font = ImageFont.truetype(FONT, 26)
            bounds = self.d.textbbox((x, y), label, font=font)
            self.d.rectangle((bounds[0]-5, bounds[1]-4, bounds[2]+5, bounds[3]+4), fill='white')
            self.d.text((x, y), label, font=font, fill=INK)

    def save(self):
        self.im.save(self.path)
        return self.path


def make_diagrams():
    # Six HTML pages, without implying that users must pass through every page.
    d = Diagram('01-navigation.png', 720)
    d.box((470,20,460,120), 'Trang chủ', 'Banner và nhóm sản phẩm')
    d.box((30,255,400,125), 'Sản phẩm', 'Tìm kiếm · lọc · sắp xếp')
    d.box((500,255,400,125), 'Giỏ hàng', 'Xem và sửa lựa chọn')
    d.box((970,255,400,125), 'Giới thiệu', 'Thông tin và chính sách')
    d.box((30,520,400,125), 'Chi tiết sản phẩm', 'Ảnh · giá · thông số')
    d.box((500,520,400,125), 'Đặt hàng', 'Thông tin người nhận')
    for x in (230,700,1170):
        d.arrow([(700,140),(700,195),(x,195),(x,255)])
    d.arrow([(230,380),(230,520)])
    d.arrow([(700,380),(700,520)])
    d.arrow([(430,580),(465,580),(465,320),(500,320)], 'Thêm giỏ', (475,430))
    d.save()

    d = Diagram('02-selection.png', 560)
    stages = [('24 sản phẩm','Danh sách gốc'),('Tìm kiếm','Tên hoặc thương hiệu'),('Lọc','Giữ sản phẩm phù hợp'),('Sắp xếp','Đổi thứ tự kết quả')]
    for i,(title,body) in enumerate(stages):
        x=20+i*350
        d.box((x,45,310,160),title,body,size=29)
        if i<3: d.arrow([(x+310,125),(x+350,125)])
    d.box((350,335,700,135),'Hiển thị danh sách cuối cùng','Có số kết quả; không tìm thấy thì hiện thông báo')
    d.arrow([(1225,205),(1225,270),(700,270),(700,335)])
    d.text((100,500,1200,45),'Thay đổi từ khóa hoặc bộ lọc → thực hiện lại từ danh sách gốc',28,center=True)
    d.save()

    # The directory chart is verified against the live filesystem.
    expected_html = ['index.html','products.html','product-detail.html','cart.html','checkout.html','about.html']
    expected_js = ['data.js','utils.js','storage.js','cart.js','common.js','home.js','products.js','product-detail.js','cart-page.js','checkout.js','about.js']
    expected_css = ['fonts.css','base.css','components.css','pages.css','responsive.css']
    site = ROOT/'PC-Astral-Market'
    assert set(expected_html)=={p.name for p in site.glob('*.html')}
    assert set(expected_js)=={p.name for p in (site/'js').glob('*.js')}
    assert set(expected_css)=={p.name for p in (site/'css').glob('*.css')}
    d = Diagram('03-folders.png', 1330)
    d.box((350,10,700,120),'PC-Astral-Market','Thư mục website bàn giao',size=30)
    groups = [
        ((60,200,580,290),'6 file HTML ở cấp gốc','index.html · products.html\nproduct-detail.html · cart.html\ncheckout.html · about.html'),
        ((760,200,580,290),'css','fonts.css · base.css\ncomponents.css · pages.css\nresponsive.css'),
        ((60,570,580,430),'js','data.js · utils.js · storage.js\ncart.js · common.js · home.js\nproducts.js · product-detail.js\ncart-page.js · checkout.js\nabout.js'),
        ((760,570,580,430),'assets','images / products\n24 ảnh JPG và PNG\n\nfonts / sarabun\n15 file font và giấy phép'),
        ((350,1120,700,140),'Tài liệu ở cấp gốc','README.md · ASSET-SOURCES.md')]
    for rect,title,body in groups:d.box(rect,title,body,size=29)
    d.arrow([(700,130),(700,155),(350,155),(350,200)])
    d.arrow([(700,155),(1050,155),(1050,200)])
    d.arrow([(700,155),(700,535),(350,535),(350,570)])
    d.arrow([(700,535),(1050,535),(1050,570)])
    d.arrow([(700,535),(700,1120)])
    d.save()

    d = Diagram('04-data.png', 800)
    d.box((30,35,570,225),'Danh mục','Mã và tên danh mục\nMỗi danh mục có 6 sản phẩm')
    d.box((790,35,580,300),'Sản phẩm','Mã · tên · thương hiệu · ảnh\nGiá thường · giá ưu đãi · số lượng\nMô tả · thông số · nhóm hiển thị')
    d.box((30,470,570,235),'Dòng giỏ hàng','Chỉ giữ mã sản phẩm và số lượng\nTên và giá được tra lại từ sản phẩm')
    d.box((790,470,580,265),'Đơn đã xác nhận','Mã đơn · thời điểm · người nhận\nTên hàng · đơn giá · số lượng\nTổng tiền tại lúc đặt hàng')
    d.arrow([(600,145),(790,145)],'Có nhiều',(630,105))
    d.arrow([(600,560),(695,560),(695,285),(790,285)],'Tra mã',(705,385))
    d.arrow([(600,645),(790,645)],'Lưu đơn',(633,605))
    d.save()

    d = Diagram('06-cart-state.png', 1150)
    d.box((30,20,570,160),'1  Mở trang','Đọc giỏ đã lưu trong trình duyệt')
    d.box((800,20,570,160),'2  Kiểm tra dữ liệu','Bỏ dòng sai; gộp mã trùng; giới hạn tồn kho')
    d.box((800,290,570,170),'3  Nhận thao tác','Thêm hàng · đổi số lượng · xóa hàng')
    d.box((800,565,570,170),'4  Cập nhật và lưu giỏ','Chỉ nhận số lượng nguyên từ 1 đến tồn kho')
    d.box((30,565,570,170),'5  Lấy đơn giá hiện hành','Còn khuyến mãi: dùng giá ưu đãi\nHết khuyến mãi: dùng giá thường')
    d.box((30,870,570,190),'6  Tính tiền','Từng dòng = đơn giá × số lượng\nTổng tiền = cộng các dòng; phí giao hàng = 0')
    d.box((800,870,570,190),'7  Hiển thị lại','Cập nhật số lượng, thành tiền\nvà số sản phẩm trên nút giỏ hàng')
    d.arrow([(600,100),(800,100)])
    d.arrow([(1085,180),(1085,225),(700,225),(700,520),(315,520),(315,565)],'Lần đầu mở trang',(360,475))
    d.arrow([(1085,460),(1085,565)],'Hợp lệ',(1100,500))
    d.arrow([(800,650),(600,650)])
    d.arrow([(315,735),(315,870)])
    d.arrow([(600,965),(800,965)])
    d.arrow([(1370,950),(1390,950),(1390,375),(1370,375)])
    d.text((50,270,550,200),'Nhập sai số lượng\n→ báo lỗi và giữ giá trị cũ.\n\nTải lại trang\n→ bắt đầu lại từ bước 1.',29)
    d.text((70,1085,1260,50),'Nếu trình duyệt chặn lưu: cảnh báo rõ và chỉ giữ giỏ tại trang đang mở.',28,center=True)
    d.save()

    d = Diagram('07-slider.png', 1120)
    d.box((400,20,600,125),'Mở trang chủ','Hiển thị banner đầu tiên trong 3 banner')
    d.box((30,270,600,170),'Người dùng điều khiển','Bấm Trước / Tiếp / chấm chọn\n→ chọn banner tương ứng')
    d.box((790,270,580,170),'Đến lượt tự chuyển sau 6 giây','Chuột/bàn phím trong slider,\nđã bấm Tạm dừng hoặc tab bị ẩn?')
    d.box((790,565,580,170),'Đang tạm dừng hoặc rời tab','Giữ nguyên banner hiện tại\nKiểm tra lại ở lượt tiếp theo',fill='#f6f6f6')
    d.box((30,565,600,170),'Được phép tự chuyển','Chọn banner kế tiếp')
    d.box((255,875,890,150),'Hiển thị banner đã chọn','Đổi ảnh, tiêu đề, mô tả, liên kết và chấm đang chọn')
    d.arrow([(700,145),(700,210),(330,210),(330,270)])
    d.arrow([(700,210),(1080,210),(1080,270)])
    d.arrow([(1080,440),(1080,565)],'Có',(1090,492))
    d.arrow([(790,395),(700,395),(700,515),(330,515),(330,565)],'Không',(615,465))
    d.arrow([(330,735),(330,810),(700,810),(700,875)])
    d.arrow([(30,355),(10,355),(10,950),(255,950)])
    d.arrow([(1370,650),(1390,650),(1390,215),(1200,215),(1200,270)])
    d.text((100,1050,1200,50),'Chuyển vòng: sau banner 3 là banner 1; trước banner 1 là banner 3.',29,center=True)
    d.save()

    d = Diagram('08-countdown.png', 1040)
    d.box((30,20,580,160),'Thời hạn cố định','23 giờ 59 phút 59 giây\nngày 30/10/2026, múi giờ Việt Nam')
    d.box((790,20,580,160),'Thời gian hiện tại','Lấy từ đồng hồ thiết bị\nMỗi giây tính lại một lần')
    d.box((340,310,720,150),'Tính thời gian còn lại','Thời hạn kết thúc trừ thời gian hiện tại')
    d.box((30,610,580,175),'Còn thời gian','Hiện ngày · giờ · phút · giây\nDùng giá ưu đãi cho hàng khuyến mãi')
    d.box((790,610,580,175),'Đã đến hoặc qua thời hạn','Dừng đếm; hiện đã kết thúc\nSản phẩm trở về giá thường')
    d.box((340,885,720,120),'Cập nhật giá thống nhất','Danh sách · chi tiết · giỏ hàng · đặt hàng')
    d.arrow([(320,180),(320,245),(700,245),(700,310)])
    d.arrow([(1080,180),(1080,245),(700,245)])
    d.arrow([(700,460),(700,535),(320,535),(320,610)],'> 0',(335,546))
    d.arrow([(700,535),(1080,535),(1080,610)],'≤ 0',(1095,546))
    d.arrow([(30,700),(10,700),(10,260),(340,260),(340,365)])
    d.arrow([(1080,785),(1080,825),(700,825),(700,885)])
    d.save()

    d = Diagram('09-checkout.png', 1290)
    steps = [(20,'1  Xem và chọn sản phẩm','Thêm vào giỏ, điều chỉnh số lượng'),
             (220,'2  Kiểm tra giỏ và điền thông tin','Họ tên · email · điện thoại · địa chỉ'),
             (420,'3  Kiểm tra trước khi xác nhận','Thông tin hợp lệ, giỏ có hàng, tổng tiền mới nhất'),
             (700,'4  Lưu thông tin đơn','Mã đơn, người nhận, sản phẩm, giá và số lượng'),
             (990,'5  Lưu thành công rồi mới xóa giỏ','Hiện xác nhận; tải lại vẫn xem được trong phiên')]
    for y,t,b in steps:d.box((305,y,790,145),t,b,size=29)
    d.arrow([(700,165),(700,220)])
    d.arrow([(700,365),(700,420)])
    d.arrow([(700,565),(700,700)],'Hợp lệ',(715,610))
    d.arrow([(700,845),(700,990)],'Đã lưu',(715,900))
    d.box((10,630,260,220),'Cần sửa','Hiện lỗi hoặc\nyêu cầu xem\nlại tổng tiền',fill='#f6f6f6',size=28)
    d.arrow([(305,495),(140,495),(140,630)])
    d.arrow([(140,630),(140,295),(305,295)])
    d.box((1140,875,250,240),'Lưu lỗi','Giữ giỏ hàng\nBáo chưa lưu\nCho thử lại',fill='#f6f6f6',size=28)
    d.arrow([(1095,772),(1265,772),(1265,875)])
    d.text((100,1200,1200,60),'Không gửi đơn đến cửa hàng và không thu tiền trong bản mô phỏng.',28,center=True)
    d.save()


def make_cover_frame():
    """A thin ornamental page frame inspired by the user's cover reference."""
    scale = 100
    w,h=2100,2970
    im=Image.new('RGBA',(w,h),(255,255,255,0));d=ImageDraw.Draw(im)
    left,right,top,bottom=185,1915,190,2780
    black='#252525';red='#a34832';green='#3a6a43'
    d.rectangle((left,top,right,bottom),outline=black,width=4)
    d.rectangle((left+16,top+16,right-16,bottom-16),outline=green,width=2)
    for x,sx in [(left,1),(right,-1)]:
        for y,sy in [(top,1),(bottom,-1)]:
            def xy(a,b):return (x+sx*a,y+sy*b)
            for offset,col in [(0,black),(20,red)]:
                pts=[xy(-22+offset,145),xy(-22+offset,57),xy(57,-22+offset),xy(145,-22+offset)]
                d.line(pts,fill=col,width=6)
            for off in (0,26,52):
                a=xy(off-12,off-12);b=xy(off+28,off+28)
                d.rectangle((min(a[0],b[0]),min(a[1],b[1]),max(a[0],b[0]),max(a[1],b[1])),outline=black,width=4)
            # Leaf sprig directed into the page at each corner.
            start=xy(82,82);end=xy(155,182)
            d.line([start,end],fill=green,width=3)
            for t in range(5):
                cx=x+sx*(88+t*12);cy=y+sy*(92+t*17)
                for side in (-1,1):
                    pts=[(cx,cy),(cx+sx*(side*23),cy-sy*4),(cx+sx*(side*30),cy+sy*11),(cx+sx*3,cy+sy*10)]
                    d.polygon(pts,fill=green)
    # Slim side vines, leaving the black frame legible.
    for x,s in [(left,1),(right,-1)]:
        d.line([(x,420),(x,2540)],fill=green,width=4)
        for y in range(445,2520,46):
            d.arc((x-13,y-13,x+13,y+24),90 if s==1 else 270,270 if s==1 else 450,fill=green,width=3)
            d.line([(x,y+5),(x+s*16,y-7)],fill=green,width=2)
    for y in (top,bottom):
        d.line([(820,y),(1280,y)],fill='white',width=8)
        d.line([(840,y),(1260,y)],fill=black,width=3)
        for x in range(930,1171,40):
            d.polygon([(x,y-8),(x+12,y),(x,y+8),(x-12,y)],fill=black)
    path=OUT/'cover-frame.png';im.save(path);return path


if __name__=='__main__':
    make_diagrams()
    make_cover_frame()
    print(OUT)
