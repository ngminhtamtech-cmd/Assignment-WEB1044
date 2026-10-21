# PC-Astral Market — Assignment WEB1044

## Cập nhật giữ dữ liệu và sửa lỗi ngày 21/10

- Form đặt hàng lưu nháp năm trường vào `pc-astral.checkout-draft.v1`, khôi phục khi F5; không lưu mật khẩu đang gõ. Nháp xóa sau khi đơn lưu thành công hoặc kết thúc demo. Tab khác không tự ghi đè form đang mở.
- Đơn có cờ `choDonGio`. Nếu lưu đơn thành công nhưng dọn giỏ lỗi, xác nhận vẫn giữ mã đơn; nút thử lại chỉ dọn giỏ còn khớp, không tạo thêm đơn và không tự xóa giỏ mua mới.
- Khi giá hoặc nội dung giỏ đổi, người mua phải xác nhận lại dù tổng tiền đã tự cập nhật. So sánh cả ID, số lượng và đơn giá.
- Tài khoản vẫn giữ username, salt và mã băm qua F5/tắt server/đăng xuất. Kiểm tra dấu reset sau `await` ngăn tác vụ đăng ký/đăng nhập cũ ghi dữ liệu trở lại sau kết thúc demo.
- Giữ tên hàm tiếng Việt, tách đọc form để dùng chung, gộp nhánh đăng nhập lặp. Chi tiết: [kết quả sửa lỗi](docs/sua-loi-logic.md).

Kho dự án nhóm môn Lập trình cơ sở với JavaScript. Giảng viên hướng dẫn **Cô Lê Anh Đào**, nhóm 3 thành viên; tên/MSSV vẫn để trống trong tài liệu.

- [Kho GitHub](https://github.com/ngminhtamtech-cmd/Assignment-WEB1044)
- [Báo cáo Y3 — 9 trang](BaoCao_Assignment2_PC-Astral-Market.docx)
- [Use Case, logic và các hàm — 8 trang](UseCase_Logic_Ham_PC-Astral-Market.docx)
- [ZIP website và tài liệu hiện tại](submission/WEB1044_LapTrinhJSCoBan_PC-Astral-Market_Assignment.zip)
- [Cấu trúc chi tiết và vị trí sửa mã](docs/current-structure.md)
- [Đối chiếu đề Y1–Y3 và kết quả rà soát JavaScript](docs/doi-chieu-de-bai.md)
- [Nguồn ảnh](PC-Astral-Market/ASSET-SOURCES.md)

Báo cáo Y3 đã viết lại theo cấu trúc tiếng Việt hiện hành, gồm ba chức năng tự đề xuất và lý do, sơ đồ phân tích, công nghệ/thư viện và kết quả kiểm thử. Tài liệu thứ hai chỉ gồm Use Case, logic và tra cứu hàm. Các Word cũ đã được thay thế; dự án chỉ giữ hai file DOCX này.

## Tải mã

```bash
git clone https://github.com/ngminhtamtech-cmd/Assignment-WEB1044.git
```

Mở thư mục con PC-Astral-Market để chạy website. Các phần bên dưới cũng có trong README nằm trong gói website.


Website bán máy tính mô phỏng môn WEB1044, dùng HTML, CSS và JavaScript thuần. Phiên bản **20/10/2026** có **24 sản phẩm, 4 danh mục, 7 trang**, JSON, class Product/Cart và tài khoản demo.

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

## Đối chiếu yêu cầu

| Yêu cầu | Phần đáp ứng |
|---|---|
| Y1.1 | Khởi tạo dữ liệu, class, render và sự kiện |
| Y1.2 | 24 sản phẩm, 4 danh mục, nhóm mới/hot/sale, ảnh và thao tác |
| Y1.3 | Slider JavaScript, nút/dot/tự chuyển và tạm dừng |
| Y1.4 | Form đặt hàng và tài khoản có kiểm tra dữ liệu |
| Y1.5 | Giỏ thêm/xóa/sửa, tính tổng, LocalStorage |
| Y1.6 | Countdown cố định và cập nhật giá hết hạn |
| Y1.7 | Tìm kiếm, lọc và sắp xếp |
| Y2 | HTML ở gốc, CSS trong css, JavaScript trong js, ảnh trong img |
| Y3 | Báo cáo trước và tài liệu tổng quan mới với checklist, phác thảo, giải thích logic |

## Kiểm thử và tài liệu hiện tại

- [18 nhóm kiểm thử chính](docs/current-tests.json): Chrome và Edge, ngày 20/10/2026.
- [13 nhóm kiểm tra JSON class tài khoản reset](docs/accounts-models-tests.json): Chrome.
- [Ảnh giao diện hiện tại](docs/screenshots/current).
- [Phác thảo và sơ đồ giỏ](docs/diagrams/current).
- [Kiểm tra ZIP giải nén](docs/package-smoke.json).

Tài liệu Use Case, logic và các hàm có ba sơ đồ Use Case, bốn sơ đồ xử lý và bảng tra cứu các hàm chính theo file/số dòng. Báo cáo Y3 giữ các nội dung chấm bài; không đưa danh sách câu hỏi dài hoặc tự chấm điểm bảo vệ vào bản nộp.

Công cụ hiện tại: `tools/run_tests.cjs test_current.cjs`, `tools/run_tests.cjs test_accounts_models.cjs`, `tools/build_documents.py`, `tools/export_documents.ps1`, `tools/render_documents.py`, `tools/package_submission.py`, `tools/check_package.cjs`. Một số công cụ cấu hình đường dẫn runtime/Playwright/font trên máy phát triển; điều chỉnh khi dùng máy khác. Website không cần chạy các công cụ này.

Các công cụ sinh Word cũ đã được dọn để tránh tạo lại tài liệu lỗi thời. `build_documents.py` là nguồn soạn hai Word hiện hành. `build_assets.py` chỉ tái tạo JSON từ snapshot nguồn; không ghi đè du-lieu.js/HTML. Các log cũ trong docs là bằng chứng lịch sử; kiểm tra phiên bản hiện tại bằng các log được nêu ở docs/don-gian-hoa-va-tai-lieu.md.

## Phối hợp nhóm qua GitHub

1. Tạo Issue nêu việc cần làm, người phụ trách và điều kiện hoàn thành.
2. Lấy main mới nhất, tạo nhánh riêng như feature/accounts hoặc fix/cart.
3. Sửa đúng phạm vi, chạy kiểm thử rồi commit nội dung cụ thể.
4. Push nhánh, mở Pull Request để một thành viên khác đọc và kiểm tra.
5. Merge sau khi đạt, cập nhật tài liệu và ZIP khi cần. Không force-push nhánh chung.

Chọn một người tổng hợp Word, các thành viên khác góp ý để tránh ghi đè file nhị phân. Không đưa mật khẩu hoặc dữ liệu khách hàng thật lên kho. Đây là quy trình đề xuất cho nhóm, không phải xác nhận rằng từng thành viên đã tạo PR hay được chấm điểm bảo vệ.

## Thư mục sau khi dọn ngày 21/10/2026

- PC-Astral-Market: website đang sử dụng, đã Việt hóa JavaScript.
- Đúng hai file Word ở thư mục gốc: báo cáo Y3 và UseCase_Logic_Ham.
- submission: chỉ giữ ZIP nộp bài hiện tại; không giữ Word trùng ở đây.
- docs: sơ đồ, nguồn ảnh, hướng dẫn và kết quả kiểm tra.
- tools: công cụ tạo dữ liệu, hai tài liệu và kiểm thử. export_documents.ps1 xuất hai Word để kiểm tra toàn bộ trang.
- tmp: chỉ được tạo khi kiểm thử hoặc render; có thể xóa sau khi hoàn thành.
