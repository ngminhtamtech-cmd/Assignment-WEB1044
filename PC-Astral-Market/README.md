# PC-Astral Market

Website bán máy tính mô phỏng cho WEB1044, sử dụng HTML, CSS và JavaScript thuần. Các file JS nạp bằng `script defer`, trao đổi qua object `window.PCAstral`. Không cần npm, build, API, SQL hoặc hosting.

## Chạy bằng VS Code Live Server

1. Giải nén đầy đủ thư mục `PC-Astral-Market`.
2. Mở thư mục này trong VS Code.
3. Cài tiện ích **Live Server** của Ritwick Dey nếu chưa có.
4. Nhấp phải `index.html` → **Open with Live Server**.
5. Giữ nguyên hostname và cổng khi chuyển trang để dùng chung LocalStorage.

Chạy qua HTTP local để các trang dùng chung origin và lưu giỏ ổn định. Không dùng `file://` để kiểm thử storage giữa các trang. Live Server chỉ phục vụ file, không phải backend ứng dụng.

Cách thay thế nếu máy có Python: chạy `python -m http.server 5500` trong thư mục website, rồi mở `http://localhost:5500`.

## Chức năng

- 24 sản phẩm trong 4 danh mục: Laptop, PC để bàn, Màn hình, Phụ kiện.
- Ba nhóm mới, hot, khuyến mãi, render từ mảng object trong `js/data.js`.
- Slider 3 banner, next/prev/dot, tự chuyển 6 giây, dừng khi hover/focus và nút tạm dừng.
- Tìm kiếm không dấu; lọc danh mục, thương hiệu, ngân sách, nhóm; sắp xếp giá và tên.
- URL lưu trạng thái tìm kiếm/lọc; trang chi tiết có thông số và sản phẩm liên quan.
- Giỏ thêm/xóa/sửa số lượng, lưu LocalStorage và đồng bộ tab cùng origin.
- Form đặt hàng kiểm tra rỗng/email/điện thoại, xác nhận COD mô phỏng.
- Countdown chiến dịch và cập nhật giá sau khi hết hạn.

## Dữ liệu, storage và giới hạn

- `js/data.js`: sản phẩm, danh mục, banner, thời hạn khuyến mãi.
- Chiến dịch kết thúc **30/10/2026 23:59:59 UTC+07:00**; không tự đặt lại khi reload. Khi demo sau ngày này, chủ động sửa `promotion.endsAt` trong `data.js` sang một ngày tương lai cố định nếu cần trình bày nhóm khuyến mãi. Không sửa mã đồng hồ để tự gia hạn mỗi lượt truy cập.
- `pc-astral.cart.v1` trong LocalStorage chỉ lưu ID và số lượng.
- `pc-astral.last-order.v1` trong SessionStorage lưu đơn gần nhất và thông tin nhập form. Đóng phiên/xóa storage sẽ mất đơn tương ứng.
- Ảnh thật, tên model, cấu hình và giá tham khảo từ PC Market ngày 16/10/2026; nguồn từng sản phẩm ghi trong ASSET-SOURCES.md. Tồn kho, nhóm và chiến dịch khuyến mãi phục vụ mô phỏng.
- Không có tài khoản, backend hoặc thanh toán thực tế; tồn kho không bị trừ sau khi đặt đơn mô phỏng.
- Nếu storage bị chặn, website thông báo rõ và chỉ giữ giỏ tạm trong trang hiện tại. Không hoàn tất đơn khi không lưu được SessionStorage.
- Xóa riêng hai khóa nêu trên trong DevTools để reset demo. Không dùng `localStorage.clear()` nếu origin chứa dữ liệu khác.

## Tổ chức mã

Mỗi HTML nạp script theo thứ tự sau. `defer` giữ thứ tự thực thi và chờ HTML được đọc xong:

```html
<script defer src="js/data.js"></script>
<script defer src="js/utils.js"></script>
<script defer src="js/storage.js"></script>
<script defer src="js/cart.js"></script>
<script defer src="js/common.js"></script>
<script defer src="js/home.js"></script>
```

Dòng cuối thay bằng file của trang tương ứng. Chỉ `data.js` tạo `window.PCAstral`; các file sau bổ sung các nhóm hàm `utils`, `storage`, `cart`, `ui`. Ví dụ: `PCAstral.cart.addItem('p01', 2)` và `PCAstral.utils.currentPrice(product)`.

Mỗi file xử lý có một hàm bao tự chạy để biến cục bộ không trùng với file khác. Những hàm cần dùng chung được gán vào `PCAstral` ở cuối file; các hàm còn lại thuộc riêng file đó. File trang tổ chức theo thứ tự: trạng thái → đọc dữ liệu → hiển thị → sự kiện → khởi tạo.

Luồng chính: `PCAstral.data → lọc/sắp xếp → render → thao tác người dùng → PCAstral.cart → storage → cart-changed → cập nhật giao diện`.

- `js/data.js`: nguồn dữ liệu tĩnh.
- `js/utils.js`: tìm kiếm/lọc/sắp xếp, giá hiện hành, định dạng tiền, validation.
- `js/storage.js`: đọc/ghi JSON và cảnh báo lỗi.
- `js/cart.js`: logic giỏ hàng, chuẩn hóa dữ liệu, tính tổng.
- `js/common.js`: header/footer, thẻ sản phẩm, toast, sự kiện dùng chung.
- Các JS còn lại tương ứng từng trang; `about.js` chỉ khởi tạo phần dùng chung.
- `css/fonts.css`: Sarabun lưu cục bộ (400–800), gồm ký tự tiếng Việt, giấy phép SIL OFL 1.1.
- `css/base.css`, `components.css`, `pages.css`, `responsive.css`: CSS nền tảng, thành phần, trang và kích thước màn hình.
- `assets/images`: 24 ảnh JPG/PNG thật lưu cục bộ; toàn bộ website hoạt động khi Internet bị ngắt nhưng máy chủ local vẫn chạy.

### Tìm đúng nơi để sửa

| Muốn sửa | Nơi chỉnh |
|---|---|
| Tên, giá, ảnh, tồn kho, thời hạn sale | `js/data.js` |
| Bố cục, nhãn form, nội dung cố định | HTML tương ứng |
| Dòng giỏ hoặc dòng đơn | Thẻ `<template>` trong `cart.html` hoặc `checkout.html` |
| Header, footer, thẻ sản phẩm dùng chung | Các hàm render đầu `js/common.js` |
| Quy tắc tính tiền, giới hạn số lượng | `js/cart.js` và `js/utils.js` |
| Màu, font cơ bản | `css/base.css`, `css/fonts.css` |
| Nút, form, header, footer, thẻ sản phẩm | `css/components.css` |
| Bố cục riêng và responsive | `css/pages.css`, `css/responsive.css` |

Chỉnh trực tiếp HTML; không có bước sinh lại trang. Khung form luôn được giữ trong DOM, JS chỉ cập nhật lỗi và tóm tắt đơn. Dòng giỏ được nhân bản từ template khi thêm mới; đổi số lượng giữ nguyên input đang focus.

### Công cụ ngoài website

Thư mục `tools` ở cấp dự án chỉ phục vụ kiểm thử và tạo báo cáo, không cần để chạy website. `build_assets.py` có thể tái tạo dữ liệu từ bản chụp nguồn và sẽ ghi đè thay đổi thủ công trong `data.js`; chỉ chạy khi chủ động tái tạo dữ liệu. Các bộ kiểm thử dùng server HTTP tạm trên cổng trống và đóng server khi hoàn tất.

## Kịch bản bảo vệ bài

1. Chỉ ra mảng sản phẩm, object và các nhóm dữ liệu.
2. Điều khiển slider, trình bày timer và cách tính countdown theo timestamp.
3. Tìm ASUS; lọc Laptop và khoảng từ 30 triệu; sắp xếp theo giá.
4. Mở ASUS TUF Gaming 16 FX610JH-TU008W; thêm 2 lần; vào giỏ sửa số lượng và reload.
5. Xóa một sản phẩm; giải thích dữ liệu LocalStorage chỉ gồm ID/số lượng.
6. Đặt hàng với form rỗng rồi sai email/số điện thoại; chỉ ra lỗi từng trường.
7. Điền dữ liệu demo hợp lệ, xác nhận; reload để chứng minh SessionStorage.
8. Giải thích ba chức năng tự đề xuất và các giới hạn của frontend tĩnh.

## Thư viện và tài nguyên

Website không sử dụng thư viện bên ngoài. DOM, Storage, timer và URLSearchParams là API trình duyệt. Xem `ASSET-SOURCES.md` để biết nguồn hình và tài liệu tham khảo.
