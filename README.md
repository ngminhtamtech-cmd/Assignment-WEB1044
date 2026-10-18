# PC-Astral Market — Assignment WEB1044

PC-Astral Market là website bán máy tính mô phỏng cho môn **Lập trình cơ sở với JavaScript (WEB1044)**. Dự án thực hành cách tổ chức dữ liệu, thao tác DOM, xử lý sự kiện, kiểm tra form và lưu trạng thái trên trình duyệt bằng **HTML, CSS và JavaScript thuần**.

Website có **6 trang, 24 sản phẩm, 4 danh mục**, hoạt động bằng dữ liệu tĩnh và chạy trên máy cá nhân. Không cần backend, API, SQL, npm, bước build hoặc hosting để trình bày bài.

- **Kho GitHub:** [ngminhtamtech-cmd/Assignment-WEB1044](https://github.com/ngminhtamtech-cmd/Assignment-WEB1044)
- **Báo cáo Word:** [Tải báo cáo Assignment 2](submission/BaoCao_Assignment2_PC-Astral-Market.docx)
- **Gói nộp:** [Tải ZIP website và báo cáo](submission/WEB1044_LapTrinhJSCoBan_PC-Astral-Market_Assignment.zip)
- **Hướng dẫn riêng của website:** [PC-Astral-Market/README.md](PC-Astral-Market/README.md)
- **Ảnh minh chứng:** [docs/screenshots](docs/screenshots)

Giảng viên hướng dẫn: **Cô Lê Anh Đào**. Nhóm gồm **3 thành viên**; tên và MSSV được để trống trên bìa để nhóm tự bổ sung.

## 1. Mục tiêu và phạm vi

Người xem có thể tìm một máy tính phù hợp, xem cấu hình, thêm sản phẩm vào giỏ, điều chỉnh số lượng và điền thông tin đặt hàng. Sau khi kiểm tra hợp lệ, website tạo xác nhận đơn mô phỏng trong trình duyệt.

Đây là bài tập frontend. Website không gửi đơn tới cửa hàng, không gửi email, không nhận thanh toán thật và không có tài khoản hay trang quản trị. Thông tin giá và tồn kho phục vụ minh họa, không phải dữ liệu kinh doanh cập nhật.

## 2. Chạy dự án

### Cách 1 — VS Code Live Server

1. Tải ZIP từ GitHub và giải nén, hoặc clone kho:

   ```bash
   git clone https://github.com/ngminhtamtech-cmd/Assignment-WEB1044.git
   ```

2. Trong VS Code, mở đúng thư mục **`Assignment-WEB1044/PC-Astral-Market`**.
3. Cài tiện ích **Live Server** của Ritwick Dey nếu chưa có.
4. Nhấp phải `index.html` → **Open with Live Server**.
5. Chuyển trang bằng các liên kết trong website; giữ cùng hostname và cổng để các trang dùng chung giỏ hàng.

Nếu đã có Live Server của dự án khác đang chạy, dừng server đó trước khi mở website này. Khi mở trực tiếp thư mục `PC-Astral-Market`, địa chỉ thường có dạng `http://127.0.0.1:5500/index.html`; cổng thực tế có thể khác.

### Cách 2 — Máy chủ tĩnh của Python

Nếu máy đã có Python, mở terminal ở thư mục kho và chạy:

```bash
cd PC-Astral-Market
python -m http.server 5500
```

Mở [http://localhost:5500](http://localhost:5500). Dùng `Ctrl+C` trong terminal để dừng server. Nếu cổng đang bận, chọn cổng khác và dùng cổng đó xuyên suốt buổi demo.

Chạy qua HTTP local để kiểm thử lưu trữ giữa các trang; không dùng đường dẫn `file://`. Máy chủ tĩnh chỉ phục vụ tệp, không phải backend xử lý đơn hàng. Ảnh và font đều được lưu trong dự án nên website không cần CDN khi demo.

## 3. Các trang và chức năng

| Trang | Tệp | Nội dung chính |
|---|---|---|
| Trang chủ | `index.html` | Slider, danh mục, sản phẩm mới/hot/khuyến mãi, countdown |
| Danh sách sản phẩm | `products.html` | Tìm kiếm, lọc, sắp xếp, số kết quả và trạng thái không tìm thấy |
| Chi tiết sản phẩm | `product-detail.html` | Ảnh, cấu hình, giá, tồn kho minh họa, chọn số lượng và thêm giỏ |
| Giỏ hàng | `cart.html` | Thêm/gộp sản phẩm, sửa số lượng, xóa, thành tiền và tổng tiền |
| Đặt hàng | `checkout.html` | Kiểm tra form, tóm tắt giỏ và xác nhận đơn mô phỏng |
| Giới thiệu | `about.html` | Giới thiệu đề tài, chính sách và liên hệ minh họa |

### Sản phẩm, tìm kiếm và bộ lọc

- Bốn danh mục: **Laptop, PC để bàn, Màn hình, Phụ kiện**; mỗi danh mục có 6 sản phẩm.
- Ba nhóm **mới, hot, khuyến mãi** độc lập với danh mục; một sản phẩm có thể thuộc nhiều nhóm.
- Tìm theo tên hoặc thương hiệu, không phân biệt hoa/thường và dấu tiếng Việt.
- Lọc đồng thời theo danh mục, thương hiệu, nhóm và khoảng giá; sản phẩm phải thỏa tất cả điều kiện.
- Khoảng giá: dưới 5 triệu; từ 5 đến dưới 15 triệu; từ 15 đến dưới 30 triệu; từ 30 triệu.
- Sắp xếp mặc định, giá tăng, giá giảm hoặc tên A–Z; không sửa mảng sản phẩm gốc.
- Trạng thái tìm/lọc/sắp xếp được lưu trên URL nên tải lại vẫn giữ lựa chọn.

Ví dụ URL trong website:

```text
products.html?category=laptop
products.html?group=new
products.html?q=asus
product-detail.html?id=p01
```

### Slider và countdown

Slider có 3 banner, nút trước/tiếp, chấm chọn và tự chuyển sau 6 giây. Tự chuyển được tạm dừng khi rê chuột, focus bằng bàn phím, bấm tạm dừng hoặc tab bị ẩn.

Chiến dịch khuyến mãi kết thúc lúc **23:59:59 ngày 30/10/2026, múi giờ UTC+07:00**. Thời hạn được đặt cố định trong `js/data.js`, không tạo lại khi reload. Hết hạn, đồng hồ dừng và sản phẩm dùng lại giá thường ở tất cả các trang. Nếu demo sau ngày này, có thể chủ động đặt một thời hạn tương lai cố định trong dữ liệu trước buổi trình bày.

### Giỏ hàng và đặt hàng

- Thêm trùng sản phẩm sẽ tăng số lượng trên dòng hiện có.
- Số lượng phải là số nguyên từ 1 đến tồn kho; nhập sai giữ lại giá trị hợp lệ trước đó. Xóa hàng dùng nút riêng.
- Tổng tiền bằng tổng thành tiền các dòng; phí vận chuyển mô phỏng bằng 0.
- LocalStorage giữ giỏ sau khi reload/chuyển trang và đồng bộ giữa các tab cùng origin.
- Form bắt buộc họ tên, email, điện thoại và địa chỉ; ghi chú không bắt buộc.
- Điện thoại nhận 10 chữ số bắt đầu bằng `0`, hoặc dạng `+84` tương ứng sau chuẩn hóa.
- Lỗi hiển thị cạnh trường; focus tới trường lỗi đầu tiên, giữ dữ liệu đang nhập.
- Giá vừa thay đổi thì yêu cầu xem lại tổng và xác nhận lại; chặn gửi lặp trong lúc xử lý.
- Lưu đơn vào SessionStorage thành công **trước khi xóa giỏ**. Nếu lưu lỗi, giữ giỏ để thử lại.
- Xác nhận đơn gần nhất có thể tải lại trong cùng phiên; đây không phải lịch sử đơn hàng của tài khoản.

## 4. Đối chiếu yêu cầu Assignment

| Yêu cầu | Phần đáp ứng |
|---|---|
| Y1.1 — Khởi tạo | Dữ liệu object, hàm render, sự kiện và logic riêng từng trang |
| Y1.2 — Sản phẩm | Mảng 24 sản phẩm; danh mục, ba nhóm, ảnh, giá, nút thao tác, hover/focus |
| Y1.3 — Slider | Điều khiển và tự chuyển bằng JavaScript |
| Y1.4 — Form | Kiểm tra rỗng, email, số điện thoại và báo lỗi từng trường |
| Y1.5 — Giỏ hàng | Thêm, xóa, đổi số lượng, lưu LocalStorage |
| Y1.6 — Nâng cao | Countdown và cập nhật giá khi hết khuyến mãi |
| Y1.7 — Tự đề xuất | Tìm kiếm, lọc và sắp xếp; có lý do và tình huống kiểm thử trong báo cáo |
| Y2 — Tổ chức mã | HTML ở gốc website; JS trong `js`; CSS trong `css` |
| Y3 — Báo cáo | Phân tích, sơ đồ, ảnh minh chứng, kiểm thử, công cụ và hướng dẫn chạy |

## 5. Cấu trúc kho

```text
Assignment-WEB1044/
├── README.md
├── .gitignore
├── .gitattributes
├── PC-Astral-Market/
│   ├── index.html
│   ├── products.html
│   ├── product-detail.html
│   ├── cart.html
│   ├── checkout.html
│   ├── about.html
│   ├── css/                 # fonts, base, components, pages, responsive
│   ├── js/                  # dữ liệu, logic dùng chung và logic từng trang
│   ├── assets/
│   │   ├── images/products/ # 24 ảnh sản phẩm JPG/PNG
│   │   └── fonts/sarabun/   # font local và giấy phép
│   ├── README.md
│   └── ASSET-SOURCES.md
├── docs/
│   ├── diagrams/            # sơ đồ logic, PNG và nguồn Draw.io
│   ├── screenshots/         # ảnh giao diện thật
│   └── ...                  # nguồn dữ liệu và kết quả kiểm thử
├── tools/                   # công cụ hỗ trợ kiểm thử, báo cáo và đóng gói
├── submission/
│   ├── BaoCao_Assignment2_PC-Astral-Market.docx
│   └── WEB1044_LapTrinhJSCoBan_PC-Astral-Market_Assignment.zip
├── BaoCao_Assignment2_PC-Astral-Market.docx
└── WEB1044_LapTrinhJSCoBan_PC-Astral-Market_Assignment.zip
```

Hai tệp bàn giao ở gốc giống bản trong `submission` để thuận tiện lấy bài. ZIP chỉ chứa thư mục website và DOCX; không có ZIP lồng nhau. Tệp tạm, bản sao lưu, cache, thư viện cài trên máy và tệp khóa Word không đưa lên GitHub.

## 6. Tổ chức JavaScript và dữ liệu

Website dùng các thẻ **`script defer`**, không dùng `import/export`. Thứ tự nạp: `data.js` → `utils.js` → `storage.js` → `cart.js` → `common.js` → file của trang.

| Thành phần | Trách nhiệm |
|---|---|
| `PCAstral.data` | Danh mục, sản phẩm, banner, thời hạn khuyến mãi |
| `PCAstral.utils` | Định dạng tiền, giá hiện hành, tìm/lọc/sắp xếp, kiểm tra thông tin |
| `PCAstral.storage` | Đọc/ghi JSON, xử lý dữ liệu hỏng hoặc storage bị chặn |
| `PCAstral.cart` | Thêm, sửa, xóa, chuẩn hóa giỏ và tính tổng |
| `PCAstral.ui` | Header, footer, thẻ sản phẩm, thông báo và sự kiện chung |
| File riêng từng trang | Hiển thị dữ liệu và xử lý tương tác của trang đó |

HTML giữ bố cục cố định, form và các `<template>`. JavaScript điền dữ liệu và cập nhật trạng thái. CSS chia thành font, nền tảng, thành phần, bố cục trang và responsive. Xem [hướng dẫn tìm nơi sửa](PC-Astral-Market/README.md#tìm-đúng-nơi-để-sửa).

Mỗi sản phẩm có mã ổn định, tên, danh mục, thương hiệu, giá, ảnh, mô tả, thông số, tồn kho và nhóm hiển thị. Giá là số nguyên VNĐ; chỉ định dạng thành chuỗi khi đưa ra giao diện.

| Khóa lưu trữ | Nơi lưu | Nội dung |
|---|---|---|
| `pc-astral.cart.v1` | LocalStorage | Mã sản phẩm và số lượng; tên/ảnh/giá được tra lại từ dữ liệu |
| `pc-astral.last-order.v1` | SessionStorage | Đơn gần nhất: mã, thời điểm, người nhận, sản phẩm, giá và tổng lúc đặt |

Nếu storage bị chặn, website thông báo rõ và chỉ giữ giỏ tạm ở trang hiện tại. Muốn reset demo, xóa riêng hai khóa trên trong DevTools; không xóa toàn bộ storage của origin có dữ liệu khác.

## 7. Kiểm thử và kịch bản demo

Kết quả đã ghi nhận:

- [18 nhóm kiểm thử chức năng](docs/test-results.md) trên Chrome/Edge ngày 17/10/2026.
- [7 nhóm kiểm tra sau refactor](docs/refactor-tests.json), gồm giữ focus khi sửa giỏ, giữ form khi giá đổi và lưu đơn trước khi xóa giỏ.
- [Kiểm tra gói ZIP giải nén](docs/package-smoke.json): sáu trang, tài nguyên local, giỏ, đặt hàng, gửi lặp và reload xác nhận.
- Responsive ở chiều rộng 390, 768 và 1440 px; thao tác bằng bàn phím; xử lý JSON lỗi, storage bị chặn và khuyến mãi hết hạn.

Trình tự demo đề xuất:

1. Mở trang chủ, giới thiệu ba nhóm sản phẩm và điều khiển slider.
2. Tìm ASUS, lọc Laptop và mức giá từ 30 triệu, đổi cách sắp xếp.
3. Xem chi tiết, thêm cùng sản phẩm hai lần để thấy gộp số lượng.
4. Sửa số lượng, thử nhập sai, xóa một dòng, reload để kiểm tra lưu giỏ.
5. Gửi form rỗng/sai định dạng rồi điền hợp lệ.
6. Xác nhận đơn mô phỏng, kiểm tra giỏ được xóa và reload xác nhận.

Các công cụ trong `tools` không được tải vào website. Một số công cụ kiểm thử/tạo báo cáo đang cấu hình đường dẫn runtime, Playwright hoặc font của môi trường phát triển; cần điều chỉnh trước khi dùng trên máy khác. Không cần chạy chúng để mở website. Word có thể sửa trực tiếp; nếu chạy lại `build_report.py`, nội dung báo cáo sẽ được tạo lại từ nguồn Python.

## 8. Báo cáo và sơ đồ

Báo cáo gồm tổng quan, đối chiếu Y1–Y3, tổ chức mã, dữ liệu, Use Case, giải thích logic bằng hình, ảnh giao diện, kiểm thử và hướng dẫn chạy. Phần quản lý GitHub trình bày cách chia việc trong nhóm và quy trình đề xuất cho các lần cập nhật tiếp theo.

- Ba sơ đồ Use Case: tổng quan; tìm và chọn sản phẩm; giỏ hàng và đặt hàng.
- [Nguồn Draw.io gồm ba trang](docs/diagrams/usecases/PC-Astral-Market-UseCases.drawio), kèm các PNG trong cùng thư mục.
- Mục lục hai cấp, danh mục hình/bảng có dấu chấm dẫn và số trang tự động.
- Khi chỉnh nội dung Word: cập nhật toàn bộ mục lục, kiểm tra số trang rồi tạo lại gói nộp để DOCX trong ZIP khớp bản bên ngoài.

## 9. Làm việc nhóm qua GitHub

`main` lưu phiên bản đã kiểm tra. Với các lần sửa tiếp theo, nhóm thống nhất người phụ trách giao diện, JavaScript, kiểm thử và báo cáo; đây là cách tổ chức công việc, không phải bảng ghi nhận đóng góp đã hoàn thành của từng người.

1. Tạo [Issue](https://github.com/ngminhtamtech-cmd/Assignment-WEB1044/issues) ghi rõ việc cần làm, người phụ trách, yêu cầu Y1/Y2/Y3 liên quan và điều kiện hoàn thành.
2. Lấy phiên bản `main` mới nhất, tạo nhánh riêng như `feature/product-filter`, `fix/cart-quantity` hoặc `docs/report`.
3. Sửa theo phạm vi đã nhận, kiểm tra chức năng liên quan rồi commit với nội dung cụ thể, ví dụ `fix: giữ số lượng cũ khi nhập sai`.
4. Push nhánh và mở [Pull Request](https://github.com/ngminhtamtech-cmd/Assignment-WEB1044/pulls), mô tả thay đổi và cách kiểm thử. Một thành viên khác xem lại trước khi ghép vào `main`.
5. Sau khi ghép, các thành viên cập nhật bản mới. Người tổng hợp cập nhật báo cáo, ảnh minh chứng và ZIP khi cần.

Không sửa cùng lúc một phần của file Word: chọn một người tổng hợp DOCX, các bạn khác góp ý qua Issue/PR. Nếu xung đột mã nguồn, trao đổi để giữ cả thay đổi cần thiết rồi chạy lại luồng liên quan. Không force-push lên nhánh chung và không đưa thông tin đăng nhập hoặc dữ liệu khách hàng thật vào kho.

Kho được khởi tạo từ phiên bản dự án hiện tại; không tạo lại lịch sử commit hoặc nhận xét duyệt bài cho các công việc đã thực hiện trước đó.

## 10. Công nghệ và nguồn tài nguyên

- **Website:** HTML5, CSS3, JavaScript thuần; không dùng React, Vue, jQuery, Bootstrap hay thư viện slider/validation.
- **API trình duyệt:** DOM, LocalStorage, SessionStorage, timer, URLSearchParams. Đây là API có sẵn, không phải thư viện cài thêm.
- **Ảnh, tên máy, thông số và giá tham khảo:** [PC Market](https://pcmarket.vn/), bản chụp ngày 16/10/2026. Xem [ASSET-SOURCES.md](PC-Astral-Market/ASSET-SOURCES.md) để biết nguồn từng sản phẩm.
- **Font:** Sarabun lưu cục bộ, có tiếng Việt; [giấy phép SIL Open Font License](PC-Astral-Market/assets/fonts/sarabun/OFL.txt).
- Ảnh sản phẩm thuộc chủ sở hữu tương ứng. Dự án ghi nguồn, không tuyên bố sở hữu ảnh hoặc tự cấp lại giấy phép cho tài nguyên bên thứ ba.

## 11. Giới hạn hiện tại

Dữ liệu và tồn kho là tĩnh; không có hệ thống kho nhiều người dùng. Tồn kho không bị trừ sau khi đặt đơn demo. Dữ liệu trình duyệt có thể bị xóa hoặc không dùng chung giữa các địa chỉ/cổng khác nhau. Không có đăng nhập, quản trị, backend, thanh toán hoặc email thật. Kho này không tự triển khai GitHub Pages; bài được trình bày bằng máy chủ local.
