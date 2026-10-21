# PC-Astral Market

Website bán máy tính mô phỏng môn WEB1044, dùng HTML, CSS và JavaScript thuần. Phiên bản **21/10/2026** có **24 sản phẩm, 4 danh mục, 7 trang**, JSON, class Product/Cart và tài khoản demo.

Form đặt hàng hiện giữ cả năm trường đang nhập qua F5 bằng khóa `pc-astral.checkout-draft.v1`. Nháp được xóa khi đơn lưu thành công hoặc kết thúc demo; không lưu mật khẩu đang gõ. Tài khoản đã đăng ký vẫn giữ username, salt và mã băm để đăng nhập bình thường, kể cả sau F5 hoặc đăng xuất.

Đơn có cờ `choDonGio` để nhận biết bước dọn giỏ còn dang dở. Nếu lưu đơn được nhưng chưa dọn giỏ, nút thử lại chỉ dọn giỏ còn khớp với đơn, không tạo thêm đơn hoặc xóa giỏ mua mới. Khi giá/món hàng thay đổi, cần xác nhận lại trước khi lưu đơn. Trình duyệt chặn ghi/xóa dữ liệu sẽ có cảnh báo rõ.

## Chạy dự án

Mở đúng thư mục `PC-Astral-Market` bằng VS Code, nhấp phải `index.html` → **Open with Live Server**. Dừng server của dự án khác nếu đang mở nhầm trang. Giữ cùng hostname và cổng khi chuyển trang.

**Chạy nhanh trên máy khác:** giải nén toàn bộ ZIP, vào thư mục `PC-Astral-Market` và nhấp đúp `index.html`. Chế độ `file://` đọc bản JSON nhúng trong `js/san-pham-du-phong.js`, không dùng fetch nên không còn lỗi Failed to fetch. Đã thử Chrome và Edge với chuyển trang, giỏ, tài khoản và đặt hàng. Ảnh/font đều cục bộ.

**Khi sửa dữ liệu để bảo vệ:** nên dùng Live Server; chế độ HTTP luôn đọc trực tiếp `js/products.json`, sửa xong F5 là thấy. Bản nhúng không tự cập nhật khi sửa JSON: chạy `tools/sync_offline_products.py` hoặc công cụ đóng gói `tools/package_submission.py` ở thư mục dự án để đồng bộ. Hai công cụ này dùng Python, chỉ cần trên máy chuẩn bị gói nộp; máy xem bài không cần cài. Không sửa tay `san-pham-du-phong.js`.

Giữ cùng cách mở khi demo. Dữ liệu LocalStorage của file trực tiếp và localhost có thể khác nhau; không trông chờ chuyển giỏ giữa hai cách mở. Live Server vẫn phù hợp khi dùng trình duyệt khác hoặc chính sách máy chặn lưu trữ file. Không cần npm, backend hoặc hosting.

## Chức năng và các trang

| Trang | Tệp | Chức năng |
|---|---|---|
| Trang chủ | index.html | Slider, nhóm mới/hot/khuyến mãi, countdown |
| Danh sách | products.html | Tìm không dấu, lọc AND, sắp xếp, giữ lựa chọn trên URL |
| Chi tiết | product-detail.html | Ảnh, cấu hình, giá, tồn kho, chọn số lượng |
| Giỏ | cart.html | Gộp trùng, tăng/giảm/xóa, tổng tự cập nhật |
| Đặt hàng | checkout.html | Validation, lưu đơn trước khi xóa giỏ, chặn gửi lặp |
| Tài khoản | register.html | Đăng ký, đăng nhập, đăng xuất demo |
| Giới thiệu | about.html | Mô tả và chính sách minh họa |

Khách không bắt buộc đăng nhập để đặt đơn. Số lượng phải là số nguyên từ 1 đến tồn kho; nhập 0/âm/lẻ/quá tồn bị chặn và giữ số cũ. Muốn bỏ món dùng nút Xóa. Giỏ rỗng có thông báo và không thể đặt hàng. Phí giao hàng demo bằng 0.

## Dữ liệu JSON và class

`js/products.json` là mảng JSON chuẩn, có đủ `id`, `name`, `price`, `imgUrl`, `description`, `category`, `quantity`. Các trường thêm phục vụ thương hiệu, giá giảm và cấu hình. `du-lieu.js` nạp/kiểm tra JSON; `su-kien.js` chờ xong rồi tạo Product và Cart.

Ảnh dùng đường dẫn tương đối `img/p01.jpg`, có dấu `/` giữa thư mục và file, **không có dấu `/` ở đầu**. Product.quantity là tồn kho; CartItem.quantity là số khách chọn mua.

- Product: `dangGiamGia`, `layGia`, `layGiaHienThi`, `conHang`, `coTheMua`, `layTenDanhMuc`.
- Cart: `themSanPham`, `xoaSanPham`, `doiSoLuong`, `layTongTien`, `tinhTongGio`, `layGio`, `xoaGio`, `kiemTraGio`.
- Event delegation: `document` nhận nút thêm giỏ; `#cart-rows` nhận tăng/giảm/xóa và đổi số lượng.
- Các script dùng `defer`, trao đổi qua `window.PCAstral`, không dùng `import/export`.

Ví dụ URL: `products.html?category=laptop`, `products.html?q=asus`, `products.html?group=new`, `product-detail.html?id=p01`.

## Cách đọc JavaScript bản đơn giản ngày 20/10/2026

Tên file JS và hàm tự viết đã đổi sang tiếng Việt không dấu: `themSanPham`, `doiSoLuong`, `tinhTongGio`, `hienThiGioHang`, `xuLyDatHang`. Biến nghiệp vụ dùng các tên như `sanPham`, `gioHang`, `tongTien`, `soLuong`. Product và Cart giữ tên class theo mẫu môn học; các trường JSON, khóa lưu trữ và tham số URL giữ nguyên để dữ liệu đang lưu tiếp tục dùng được.

`constructor`, `addEventListener`, `JSON.parse`, `localStorage`, `fetch`, `sort` là tên chuẩn của JavaScript hoặc trình duyệt nên giữ nguyên. Tìm/lọc/tính tổng dùng vòng for; hàm so sánh sort được khai báo đầy đủ. Các bước bỏ dấu và chuẩn hóa số điện thoại viết riêng từng dòng; banner về đầu/cuối dùng if/else. Phần băm mật khẩu dùng Web Crypto có chú thích và vẫn giữ tài khoản đã đăng ký.


Các hàm được khai báo bằng `function tenHam(thamSo) { ... }`, sau đó mới gọi hoặc truyền tên hàm vào sự kiện. Class Product và Cart giữ cú pháp phương thức của class. Biến đều dùng `const` hoặc `let`, object chia sẻ ghi đủ `tenThuocTinh: giaTri`.

- Dùng vòng `for` để tìm sản phẩm, sao chép dòng giỏ, lọc danh sách và cộng tổng tiền từ 0.
- Dùng `if/else` có dấu ngoặc khối; đã bỏ arrow function, toán tử ba ngôi, spread, destructuring và hàm tự chạy IIFE.
- Đọc từng trường form qua `form.elements.tenTruong.value`, dễ đối chiếu với HTML.
- `sort` dùng hàm so sánh có tên. Không thay đổi thứ tự mảng sản phẩm gốc.
- `fetch`/`async`/`await` chỉ phục vụ đọc JSON và thao tác tài khoản có băm mật khẩu; có chú thích tại đoạn sử dụng.
- Vẫn dùng `addEventListener`, event delegation, DOM, JSON và LocalStorage theo môn học.

Nên đọc `mo-hinh.js` → `luu-tru.js` → `hien-thi.js` → `su-kien.js` → file trong `trang/`. Khi theo dõi nút Thêm giỏ: `xuLyBamNutChung` → `xuLyThemGio` → `themSanPham` → `baoGioThayDoi` → `luuGio` → giao diện nhận `cart-changed`.

| Bài học trong ảnh | Vị trí thực hành |
|---|---|
| Biến, kiểu dữ liệu, ép kiểu | `du-lieu.js`: kiểm tra kiểu; `su-kien.js`: Number đổi số lượng từ input |
| Điều kiện, vòng lặp | `mo-hinh.js`: kiểm tra tồn kho, tìm dòng và cộng tổng |
| Khai báo hàm, tham số, return | `hien-thi.js`: dinhDangTien, boDau, locSanPham |
| Mảng và object | `products.json`, danh sách items trong Cart, mảng kết quả lọc |
| OOP cơ bản | `mo-hinh.js`: class Product, Cart, constructor và các phương thức |
| BOM, DOM | `trang/`: đọc input, tạo dòng từ template, cập nhật textContent |
| Sự kiện | `su-kien.js`, `trang/gio-hang.js`: nghe ở thẻ cha và tìm nút bằng closest |
| API trình duyệt | `luu-tru.js`: LocalStorage/JSON; `trang/trang-chu.js`: timer |

## Tìm đúng nơi để sửa

| Công việc | Tệp |
|---|---|
| Thêm/sửa sản phẩm | js/products.json |
| Banner, danh mục, hạn khuyến mãi | js/du-lieu.js |
| Class, giá và giới hạn số lượng | js/mo-hinh.js |
| Lưu trữ, tài khoản, reset | js/luu-tru.js |
| Tìm/lọc/sắp xếp và giao diện chung | js/hien-thi.js |
| Khởi tạo và sự kiện dùng chung | js/su-kien.js |
| Logic riêng từng trang | js/trang/ |
| Bố cục, form, template | HTML tương ứng ở gốc |
| Font, màu, trang và responsive | Các phần đánh số trong css/style.css |

HTML ngang cấp css, img, js như mẫu. Các trang mở rộng và js/trang được giữ để đáp ứng đủ Y1–Y3 mà không dồn logic vào một file. Chú thích trong JS và HTML đánh dấu theo tính năng.

## Giữ dữ liệu khi F5 và kết thúc demo

**F5 và tắt Live Server không tự xóa LocalStorage.** Theo phương án đã chọn, bấm **Kết thúc buổi demo** ở footer và xác nhận để xóa riêng dữ liệu website. Không có `unload`/`beforeunload` xóa dữ liệu vì F5 và chuyển trang cũng kích hoạt việc rời trang.

| Khóa | Dữ liệu |
|---|---|
| pc-astral.cart.v1 | productId và quantity |
| pc-astral.last-order.v1 | Snapshot đơn gần nhất |
| pc-astral.users.v1 | Username, salt và passwordHash |
| pc-astral.auth.v1 | Username đang đăng nhập |
| pc-astral.demo-reset.v1 | Dấu thời gian báo reset các tab khác |

Đăng xuất chỉ xóa trạng thái đăng nhập, giữ tài khoản và giỏ. Username được trim/chuyển chữ thường. Mật khẩu không lưu nguyên văn: Web Crypto tạo mã băm PBKDF2/SHA-256 và salt ngẫu nhiên. Đây chỉ là demo; người dùng có thể sửa LocalStorage, không phải cơ chế xác thực cho cửa hàng thật. Dùng mật khẩu riêng cho bài tập.

Đoạn cần chỉ khi bảo vệ: **GIỮ DỮ LIỆU KHI F5** trong su-kien.js và **XÓA BUỔI DEMO** trong luu-tru.js. Reset không dùng `localStorage.clear()` để tránh xóa dữ liệu dự án khác.

Storage bị chặn thì báo rõ; giỏ chỉ được giữ tạm trong trang đang mở. Đăng ký hoặc lưu đơn thất bại không báo thành công. JSON hỏng được báo ở giao diện. Giữ cùng origin để dữ liệu dùng chung.

## Demo và nguồn tài nguyên

Tìm ASUS → thêm p01 và p07 → thêm p01 lần nữa → sửa số lượng → thử 0 → xóa một món → F5 → đặt đơn sai rồi đúng → đăng ký/đăng nhập → F5 → kết thúc demo.

Khuyến mãi kết thúc **30/10/2026 lúc 23:59:59 +07:00**. Hết hạn, mọi trang dùng giá thường. Khi cần luyện sau ngày đó, đặt hạn tương lai cố định trong du-lieu.js; không tạo lại thời hạn mỗi lần reload.

Ảnh/thông số/giá tham khảo PC Market ngày 16/10/2026, xem ASSET-SOURCES.md. Sarabun local có giấy phép ở assets/fonts/sarabun/OFL.txt. Không dùng thư viện JS bên ngoài, SVG, CDN, thanh toán hoặc gửi đơn thật. Tồn kho tĩnh chưa trừ sau đơn demo.
