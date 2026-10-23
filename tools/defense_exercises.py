"""Mười bài luyện chỉ áp dụng trên bản sao tmp/defense/practice."""
from pathlib import Path
import json, shutil
from defense_content import r, M,U,S,E,D,H,P,G,O,A

EXERCISES=[
dict(id='C01', title='Thêm một sản phẩm',
 ask='Em thêm sản phẩm mới, không viết tay một thẻ HTML, rồi chứng minh nó vào giỏ được.',
 answer='Em thêm object vào products.json với ID p25 chưa dùng, tên PC Ôn tập, giá 12000000, imgUrl là img/p07.jpg, mô tả, category desktop và quantity 10. Các trường mở rộng được Product nhận mặc định nếu không khai báo. Em thử qua HTTP trước, rồi sinh lại JSON dự phòng để kiểm tra file://.',
 steps='Thêm object cuối mảng và dấu phẩy đúng JSON. Dùng ảnh có thật p07.jpg để bài tập không phụ thuộc tải ảnh. Chạy python tools/sync_offline_products.py bằng Python có sẵn khi áp dụng ở bản luyện đầy đủ công cụ; script đọc JSON gốc và tạo lại bản nhúng.',
 refs=[r('js/products.json','"id": "p01"','Mẫu bảy trường'),r(D,'function kiemTraSanPham(','Kiểm tra đầu vào'),r('tools/sync_offline_products.py','def sync_offline_products():','Đồng bộ file mở trực tiếp')],
 checks='Danh sách có 25 thẻ; tìm PC Ôn tập có p25; thêm hai lần thành một dòng quantity 2 và tổng 24.000.000 đ. Kiểm tra lại file:// sau đồng bộ.',
 follow='ID trùng thì sao? Hàm nạp kiểm tra trùng và báo lỗi; phải sửa ID, không dùng vị trí mảng thay thế.',
 trap='Quên sinh bản nhúng sẽ làm HTTP có sản phẩm mới nhưng file:// vẫn là dữ liệu cũ.',
 undo='Xóa đúng object p25 và sinh lại bản dự phòng, hoặc bỏ toàn bộ bản sao luyện tập.',
 solution='{"id":"p25","name":"PC Ôn tập","price":12000000,\n "imgUrl":"img/p07.jpg","description":"Máy luyện demo",\n "category":"desktop","quantity":10}'),
dict(id='C02',title='Đổi giá và giá khuyến mãi',
 ask='Đổi p01 thành giá thường 20 triệu, giá khuyến mãi 18 triệu. Những trang nào cần kiểm tra?',
 answer='Em sửa price và salePrice trong JSON, đồng thời kiểm tra promotionId khớp chiến dịch và chiến dịch chưa hết hạn. Các trang dùng Product.layGia nên không sửa riêng từng thẻ giá. Em kiểm tra cả danh sách, chi tiết, giỏ và xác nhận đơn.',
 steps='Sửa p01 price=20000000, salePrice=18000000, promotionId=astral-launch. Giữ hạn chiến dịch hoạt động trên bản luyện. Đồng bộ JSON dự phòng nếu mở file trực tiếp.',
 refs=[r('js/products.json','"id": "p01"','Sản phẩm cần sửa'),r(M,'dangGiamGia(thoiDiem) {','Điều kiện khuyến mãi'),r(M,'layGia(thoiDiem) {','Giá dùng chung')],
 checks='Trước hết hạn: giá 18 triệu, giỏ quantity 2 bằng 36 triệu. Khi hết hạn, đơn giá trở lại 20 triệu; đơn đã lưu giữ snapshot lúc đặt.',
 follow='salePrice lớn hơn price thì sao? Không được coi là giảm giá; phương thức trả giá thường.',
 trap='Sửa chữ giá trong DOM không sửa giá thật dùng để tính tổng.',
 undo='Khôi phục ba trường p01 từ bản nguồn rồi đồng bộ JSON nhúng.'),
dict(id='C03',title='Giới hạn theo tồn kho',
 ask='Đặt tồn kho p01 bằng 2 và chặn khách mua món thứ ba.',
 answer='Em sửa quantity của sản phẩm thành 2, không sửa quantity của dòng giỏ để giả lập tồn kho. Cart cộng số cũ và số mới trước khi gọi coTheMua. Khi đã có hai món, thêm tiếp phải bị chặn và tổng không đổi.',
 steps='Sửa quantity=2 trong object p01. Bắt đầu bằng giỏ thử rỗng rồi thêm lần lượt 1, 1 và 1. Kiểm tra cả nút tăng và nhập trực tiếp số 3.',
 refs=[r('js/products.json','"id": "p01"','Tồn kho minh họa'),r(M,'coTheMua(soLuong) {','Giới hạn'),r(M,'themSanPham(maSanPham, soLuong) {','Kiểm tra tổng khi thêm')],
 checks='Hai lần đầu thành công; lần ba bị chặn; giỏ một dòng quantity 2. Nhập 0 hoặc 3 giữ 2; F5 vẫn 2.',
 follow='Tồn kho 0 thì sao? Nút mua khóa và dữ liệu giỏ cũ được kiểm tra lại khi nạp.',
 trap='HTML max chỉ hỗ trợ nhập liệu; class vẫn phải kiểm tra trước khi gán.',
 undo='Khôi phục quantity gốc và xóa giỏ của phiên luyện nếu cần.'),
dict(id='C04',title='Thêm banner thứ tư',
 ask='Thêm một banner và sửa để bộ đếm không còn cố định ba banner.',
 answer='Em thêm object banner đủ các trường giống mẫu trong du-lieu.js. Chấm điều khiển và chuyển vòng đã dựa vào độ dài mảng, nhưng dòng slide-count đang ghi cố định /03 nên phải sửa thêm. Em lấy cả vị trí lẫn tổng từ dữ liệu để banner thứ tư hiển thị 04 / 04.',
 steps='Sao chép một object banner, đổi tiêu đề/ảnh/liên kết thành nội dung banner thứ tư. Trong hienThiBanner thay dòng bộ đếm bằng ba dòng ở dưới. Giữ taoNutBanner và chuyenBanner đang dùng banners.length.',
 refs=[r(D,'"banners": [','Mảng banner'),r(H,"document.getElementById('slide-count').textContent",'Dòng đếm cần sửa'),r(H,'function taoNutBanner(','Chấm tự sinh')],
 checks='Có 4 chấm; chấm thứ tư hiển thị đúng nội dung và 04 / 04. Next từ cuối về đầu, prev từ đầu về cuối; link banner đi đúng trang.',
 follow='Chỉ sửa /03 thành /04 có tốt không? Không; lần thêm sau lại sai, nên đọc độ dài dữ liệu.',
 trap='Đây là bài mở rộng, không khẳng định bộ đếm hiện tại đã tự tổng quát theo số banner.',
 undo='Khôi phục mảng banners và dòng bộ đếm từ nguồn; bài luyện không thay website chính.',
 solution="const soThuTu = ('0' + (viTriBanner + 1)).slice(-2);\nconst tongBanner = ('0' + duLieu.banners.length).slice(-2);\ndocument.getElementById('slide-count').textContent =\n  soThuTu + ' / ' + tongBanner;"),
dict(id='C05',title='Kiểm tra trước và sau hết hạn',
 ask='Cho chiến dịch hết hạn trong lúc khách đang nhập đơn và chứng minh giá cập nhật đúng.',
 answer='Em chỉ đổi endsAt trên bản luyện thành mốc có múi giờ, gần thời điểm thử. Em mở sẵn form với sản phẩm khuyến mãi để quan sát giá trước và sau hạn. Khi giá đổi, form phải giữ nội dung và lần bấm đặt đầu chỉ nhắc xem lại, chưa tạo đơn.',
 steps='Chọn hạn cách giờ thử khoảng một phút để kịp thao tác, ghi đủ +07:00. Dùng p01 đang giảm giá, thêm một món, mở form và điền đủ. Sau hết hạn bấm đặt hai lần theo hướng dẫn xác nhận.',
 refs=[r(D,'"endsAt":','Mốc cố định'),r(H,'function capNhatDemNguoc(','Chặn thời gian âm'),r(O,'if (canXacNhanLai ||','Yêu cầu xác nhận lại')],
 checks='Countdown không âm; nhóm sale cập nhật; đơn giá về price. Form không mất nội dung. Lần bấm cảnh báo chưa có đơn; lần sau lưu đúng giá thường.',
 follow='Có đổi ngày hệ điều hành không? Không cần; chỉ thay cấu hình bản luyện hoặc dùng đồng hồ của công cụ test.',
 trap='Đổi duy nhất chữ countdown sẽ không kiểm tra được logic giá.',
 undo='Khôi phục endsAt và dữ liệu thử, không để chiến dịch hết hạn do bài luyện trong nguồn bàn giao.'),
dict(id='C06',title='Tìm kiếm theo mã sản phẩm',
 ask='Cho phép gõ p01 để tìm sản phẩm tương ứng, vẫn tìm tên và hãng được.',
 answer='Em mở locSanPham và thêm id vào chuỗi dùng để tìm kiếm. Hàm boDau cùng includes vẫn dùng như cũ nên không cần viết một bộ lọc thứ hai. Em thử cả mã, tên và hãng để chắc không làm mất tìm kiếm cũ.',
 steps='Thay phần tạo chuoiTimKiem bằng đoạn dưới; không sửa điều kiện danh mục, giá hay sắp xếp. ID được chuyển thành chuỗi khi tạo Product nên ghép vào chuỗi tìm được.',
 refs=[r(U,'const chuoiTimKiem =','Điểm thêm ID'),r(P,'function hienThiDanhSachSanPham(','Lấy từ khóa form')],
 checks='q=p01 trả đúng p01; q=P01 cũng đúng; q=asus vẫn có các sản phẩm ASUS; từ khóa vô nghĩa cho trạng thái rỗng. F5 giữ q.',
 follow='Có cần sửa JSON để thêm trường keyword không? Không với yêu cầu này; id đã có sẵn.',
 trap='Không thay chuỗi tên + hãng thành chỉ ID vì sẽ làm mất khả năng tìm cũ.',
 undo='Trả chuoiTimKiem về tên + thương hiệu.',
 solution="const chuoiTimKiem = boDau(\n  sanPham.id + ' ' + sanPham.name + ' ' + sanPham.brand\n);"),
dict(id='C07',title='Thêm khoảng giá',
 ask='Thêm lựa chọn từ 10 đến dưới 20 triệu và giữ được sau F5.',
 answer='Em thêm mã 10to20 vào bảng khoảng giá và thêm option cùng value trong HTML. Mảng giá trị URL hợp lệ đang lấy Object.keys từ bảng đó nên không cần một danh sách giá mới. Em kiểm tra cả hai mốc biên để tránh nhận sai 20 triệu.',
 steps="Thêm '10to20': [10000000, 20000000] vào cacKhoangGia; thêm option value=10to20 ở filter-price. Đây là lựa chọn bổ sung có thể chồng lên các khoảng cũ, mỗi lần khách chỉ chọn một khoảng.",
 refs=[r(U,'const cacKhoangGia =','Cấu hình giá'),r('products.html','<option value="under5">','Các lựa chọn HTML'),r(P,'price: Object.keys(tienIch.priceRanges)','URL hợp lệ tự lấy từ dữ liệu')],
 checks='9.999.999 bị loại, 10.000.000 được nhận, 19.999.999 được nhận, 20.000.000 bị loại. Chọn trên giao diện rồi F5 vẫn là 10to20.',
 follow='Vì sao cận trên không lấy? Để quy tắc khoảng giá thống nhất với các khoảng hiện có.',
 trap='Chỉ thêm option mà không thêm bảng giá sẽ rơi về khoảng mặc định.',
 undo='Xóa đúng option và khóa 10to20; đưa URL về products.html.',
 solution="'10to20': [10000000, 20000000],\n<!-- Trong select filter-price -->\n<option value=\"10to20\">10 đến dưới 20 triệu</option>"),
dict(id='C08',title='Sắp xếp tên Z đến A',
 ask='Thêm lựa chọn tên Z–A và bảo đảm F5 không làm nó trở về mặc định.',
 answer='Em sửa ba điểm: thêm option HTML, cho phép mã name-desc khi đọc URL và thêm nhánh so sánh trong locSanPham. Hàm so sánh đảo thứ tự hai tên để được giảm dần. Em vẫn sort mảng kết quả nên mảng products gốc không bị đổi thứ tự.',
 steps="Thêm option name-desc vào select sort; thêm 'name-desc' vào giaTriHopLe.sort. Khai báo soSanhTenGiam rồi thêm else if cho mã đó, không thay nhánh name đang là A–Z.",
 refs=[r('products.html','<option value="name">','Lựa chọn giao diện'),r(P,"sort: ['default'",'Danh sách cho URL'),r(U,'function soSanhTen(','Chỗ đặt hàm so sánh')],
 checks='Chọn Z–A, tên theo locale vi đảo chiều A–Z; F5 giữ name-desc trên URL và select. Về mặc định trả đúng thứ tự dữ liệu ban đầu.',
 follow='Quên sửa giaTriHopLe.sort thì sao? Lựa chọn có thể chạy lúc đổi nhưng bị đưa về mặc định khi đọc lại URL.',
 trap='Không sort thẳng duLieu.products hoặc chỉ đảo chữ của nhãn lựa chọn.',
 undo='Bỏ option, mã hợp lệ, hàm và nhánh name-desc đã thêm.',
 solution="function soSanhTenGiam(truoc, sau) {\n  return sau.name.localeCompare(truoc.name, 'vi');\n}\n// Thêm nhánh sau nhánh name\nelse if (boLoc.sort === 'name-desc') {\n  ketQua.sort(soSanhTenGiam);\n}"),
dict(id='C09',title='Giới hạn ghi chú 300 ký tự',
 ask='Thêm giới hạn ghi chú 300 ký tự, báo lỗi cạnh trường và giữ bản nháp nếu quá dài.',
 answer='Em sửa maxlength từ 500 thành 300 để hỗ trợ nhập, nhưng vẫn thêm kiểm tra JavaScript vì bản nháp cũ có thể dài hơn. Em bổ sung vùng note-error và đưa note vào danh sách hiển thị lỗi. Lỗi không được xóa form hoặc bản nháp; sửa xuống giới hạn thì có thể đặt tiếp.',
 steps='Trong kiemTraKhachHang kiểm tra khachHang.note đã trim dài hơn 300. Trong checkout.html thêm aria-describedby=note-error và span tương ứng. Trong hienThiLoiDatHang thêm note vào danhSachKhoa4; không đổi cacTruongNhap vì note đã có.',
 refs=[r(U,'function kiemTraKhachHang(','Thêm điều kiện ghi chú'),r('checkout.html','<textarea id="note"','maxlength và mô tả lỗi'),r(O,'const danhSachKhoa4 =','Trường được hiện lỗi')],
 checks='0 và 300 ký tự hợp lệ; nháp 301 ký tự được khôi phục nhưng bị chặn submit, hiện lỗi và giữ nội dung sau F5. Sửa còn 300 rồi đặt được; không có lỗi null khi tìm note-error.',
 follow='maxlength đã đủ chưa? Chưa; JS phải kiểm tra cả dữ liệu khôi phục hoặc giá trị gán từ mã.',
 trap='Chỉ thêm cacLoi.note mà quên span hoặc mảng hiển thị sẽ khiến người dùng không thấy lý do bị chặn.',
 undo='Khôi phục cả ba file từ bản nguồn, không giữ riêng một nửa thay đổi.',
 solution="if (khachHang.note && khachHang.note.length > 300) {\n  cacLoi.note = 'Ghi chú tối đa 300 ký tự.';\n}\n<!-- Đặt dưới textarea -->\n<span id=\"note-error\" class=\"field-error\"></span>"),
dict(id='C10',title='Sửa đường dẫn ảnh',
 ask='Ảnh sản phẩm không hiện khi copy sang thư mục con, em chẩn đoán và sửa thế nào?',
 answer='Em kiểm tra Network hoặc Console, giá trị imgUrl và file thật trong img. Đường dẫn phải tương đối như img/p01.jpg, không phải đường dẫn ổ đĩa của máy em hoặc /img ở gốc server. Sau khi sửa dữ liệu, em tải lại để chắc ảnh thật đã hiện, không chỉ thấy thông báo dự phòng.',
 steps='Ở bản luyện, cho p01 trỏ img/khong-ton-tai.jpg để tái hiện lỗi. Quan sát yêu cầu 404 và khung dự phòng, rồi sửa về img/p01.jpg có thật. Đồng bộ JSON nhúng nếu kiểm tra file://.',
 refs=[r('js/products.json','"id": "p01"','Đường dẫn ảnh'),r(D,'if (typeof sanPham.imgUrl','Kiểm tra dạng đường dẫn'),r(U,'function xuLyAnhLoi(','Giao diện khi ảnh lỗi')],
 checks='Trước sửa có 404 và fallback; sau sửa ảnh naturalWidth > 0, không còn yêu cầu ảnh lỗi ở lần mở mới. Thử dưới một thư mục có dấu/khoảng trắng.',
 follow='Fallback có nghĩa ảnh đã tải thành công không? Không; đó chỉ là cách giao diện xử lý tài nguyên bị lỗi.',
 trap='Không copy đường dẫn C:/... vào JSON hoặc tắt bảo mật trình duyệt.',
 undo='Giữ lại đường dẫn hợp lệ trong bản luyện hoặc bỏ bản sao; không tạo lỗi trên website chính.')
]

def prepare():
    root=Path(__file__).resolve().parents[1]; site=root/'PC-Astral-Market'
    base=root/'tmp/defense/practice';base.mkdir(parents=True,exist_ok=True)
    def edit(folder,file,old,new):
        p=folder/file;t=p.read_text(encoding='utf-8');assert old in t,(file,old);p.write_text(t.replace(old,new,1),encoding='utf-8')
    for ex in EXERCISES:
        folder=base/ex['id']/'Bài luyện có dấu'/'PC-Astral-Market'
        assert not folder.exists(),'Practice folder already exists; inspect before preparing again'
        shutil.copytree(site,folder)
        data=json.loads((folder/'js/products.json').read_text(encoding='utf-8'))
        c=ex['id']
        if c=='C01':data.append(dict(id='p25',name='PC Ôn tập',price=12000000,imgUrl='img/p07.jpg',description='Máy luyện demo',category='desktop',quantity=10))
        if c=='C02':data[0].update(price=20000000,salePrice=18000000,promotionId='astral-launch')
        if c=='C03':data[0]['quantity']=2
        if c=='C04':
            t=(folder/D).read_text(encoding='utf-8');a=t.index('window.PCAstral.data = ')+len('window.PCAstral.data = ');b=t.index(';\nwindow.PCAstral.pages',a)
            config=json.loads(t[a:b]);banner=dict(config['banners'][0]);banner.update(title='Banner thứ tư\nÔn bảo vệ',caption='DEMO BANNER 4');config['banners'].append(banner)
            (folder/D).write_text(t[:a]+json.dumps(config,ensure_ascii=False,indent=2)+t[b:],encoding='utf-8')
            edit(folder,H,"    document.getElementById('slide-count').textContent = '0' + (viTriBanner + 1) + ' / 03';",'    '+ex['solution'].replace('\n','\n    '))
        if c=='C05':edit(folder,D,'2026-10-30T23:59:59+07:00','2026-10-22T10:00:10+07:00')
        if c=='C06':edit(folder,U,"const chuoiTimKiem = boDau(sanPham.name + ' ' + sanPham.brand);",ex['solution'])
        if c=='C07':
            edit(folder,U,"    under5: [0, 5000000],","    under5: [0, 5000000],\n    '10to20': [10000000, 20000000],")
            edit(folder,'products.html','<option value="under5">Dưới 5 triệu</option>','<option value="under5">Dưới 5 triệu</option>\n<option value="10to20">10 đến dưới 20 triệu</option>')
        if c=='C08':
            edit(folder,'products.html','<option value="name">Tên A–Z</option>','<option value="name">Tên A–Z</option>\n<option value="name-desc">Tên Z–A</option>')
            edit(folder,P,"sort: ['default', 'price-asc', 'price-desc', 'name']","sort: ['default', 'price-asc', 'price-desc', 'name', 'name-desc']")
            edit(folder,U,"    if (boLoc.sort === 'price-asc') {","    function soSanhTenGiam(truoc, sau) {\n      return sau.name.localeCompare(truoc.name, 'vi');\n    }\n    if (boLoc.sort === 'price-asc') {")
            edit(folder,U,"      ketQua.sort(soSanhTen);\n    }","      ketQua.sort(soSanhTen);\n    } else if (boLoc.sort === 'name-desc') {\n      ketQua.sort(soSanhTenGiam);\n    }")
        if c=='C09':
            edit(folder,U,'    return { data: khachHang, errors: cacLoi };',"    if (khachHang.note && khachHang.note.length > 300) {\n      cacLoi.note = 'Ghi chú tối đa 300 ký tự.';\n    }\n    return { data: khachHang, errors: cacLoi };")
            edit(folder,'checkout.html','maxlength="500"','maxlength="300" aria-describedby="note-error"')
            edit(folder,'checkout.html','</textarea>','</textarea>\n<span id="note-error" class="field-error"></span>')
            edit(folder,O,"const danhSachKhoa4 = ['name', 'email', 'phone', 'address'];","const danhSachKhoa4 = ['name', 'email', 'phone', 'address', 'note'];")
        if c=='C10':data[0]['imgUrl']='img/khong-ton-tai.jpg'
        (folder/'js/products.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
        embedded=json.dumps(json.dumps(data,ensure_ascii=False,separators=(',',':')),ensure_ascii=True)
        (folder/'js/san-pham-du-phong.js').write_text('window.PCAstral = window.PCAstral || {};\nwindow.PCAstral.offlineProductJSON = '+embedded+';\n',encoding='utf-8')
    print('Prepared ten separate practice copies; original website unchanged.')

if __name__=='__main__':prepare()
