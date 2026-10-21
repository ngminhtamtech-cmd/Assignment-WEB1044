# Cấu trúc phiên bản ngày 20/10/2026

```text
PC-Astral-Market/
├── index.html
├── products.html
├── product-detail.html
├── cart.html
├── checkout.html
├── register.html
├── about.html
├── css/
│   └── style.css
├── img/                       # 24 ảnh sản phẩm thật
├── assets/fonts/sarabun/       # Font local và giấy phép
└── js/
    ├── san-pham-du-phong.js    # JSON nhúng tự sinh cho file://
    ├── du-lieu.js                # Cấu hình và nạp JSON
    ├── products.json          # Dữ liệu sản phẩm JSON chuẩn
    ├── mo-hinh.js              # class Product, class Cart
    ├── luu-tru.js             # Lưu trữ và tài khoản demo
    ├── hien-thi.js              # Tiện ích và giao diện chung
    ├── su-kien.js              # Khởi tạo và sự kiện chung
    └── trang/                 # Logic riêng để file chung không quá lớn
        ├── trang-chu.js
        ├── san-pham.js
        ├── chi-tiet.js
        ├── gio-hang.js
        ├── dat-hang.js
        └── tai-khoan.js
```

HTML ngang cấp `css`, `img`, `js` như mẫu. Năm file lõi theo mẫu được giữ; `products.json` tách dữ liệu JSON chuẩn khỏi cú pháp JavaScript. `js/du-lieu.js` nạp dữ liệu đó. Những trang mở rộng vẫn được giữ để đáp ứng đủ Y1–Y3.

Luồng khởi tạo: HTML → script defer → du-lieu.js đọc JSON → su-kien.js chờ hoàn tất → tạo Product và Cart → dựng phần chung → chạy trang hiện tại.

Quy tắc ảnh: `img/p01.jpg`, dùng dấu `/` và không có dấu `/` đầu chuỗi. Đây là đường dẫn tương đối nên chạy được cả khi mở website trong thư mục con.

## Nơi đọc và sửa theo tính năng

| Việc cần làm | Tệp và điểm bắt đầu |
|---|---|
| Thêm sản phẩm | `js/products.json`; đủ 7 trường, ID không trùng |
| Đổi banner hoặc hạn khuyến mãi | `js/du-lieu.js`, phần `banners`, `promotion` |
| Kiểm tra giá và tồn kho | `js/mo-hinh.js`, class `Product` |
| Thêm, sửa, xóa và tính tổng giỏ | `js/mo-hinh.js`, class `Cart` |
| Giữ dữ liệu khi F5 | `js/luu-tru.js`, `docJSON`/`luuJSON`; `js/su-kien.js`, `khoiTaoWebsite` |
| Xóa dữ liệu demo | `js/luu-tru.js`, `ketThucDemo`; `js/su-kien.js`, `xuLyBamNutChung` |
| Đăng ký và đăng nhập | `js/luu-tru.js`, `khaiBaoTaiKhoan`; `js/trang/tai-khoan.js` |
| Tìm kiếm, lọc, sắp xếp | `js/hien-thi.js`, `locSanPham`; `js/trang/san-pham.js` |
| Thẻ sản phẩm và header/footer | `js/hien-thi.js`, `taoTheSanPham`, `hienThiDauTrang`, `hienThiCuoiTrang` |
| Event delegation thêm giỏ | `js/su-kien.js`, `xuLyBamNutChung`, `xuLyThemGio` |
| Event delegation tăng, giảm, xóa | `js/trang/gio-hang.js`, `xuLyBamNutGio`, `xuLyDoiSoLuong` |
| Bố cục và màu | HTML tương ứng và các phần đánh số trong `css/style.css` |

## Lưu trữ đã thống nhất

- LocalStorage giữ giỏ, tài khoản, đăng nhập và đơn demo sau F5, đổi trang hoặc tắt rồi mở Live Server trên cùng origin.
- **Tắt Live Server không tự xóa dữ liệu.** Bấm “Kết thúc buổi demo” và xác nhận để xóa riêng các khóa của PC-Astral Market. Đăng xuất chỉ xóa trạng thái đăng nhập.
- Username, salt ngẫu nhiên và mã băm PBKDF2 lưu ở `pc-astral.users.v1`. Không lưu mật khẩu nguyên văn. Đây chỉ là tài khoản mô phỏng trên trình duyệt, không phải hệ thống xác thực thật.
- Không có `unload`/`beforeunload` xóa dữ liệu, vì F5 và chuyển trang cũng kích hoạt vòng đời rời trang.

## Tài liệu và kiểm thử

- Hai Word hiện hành: `BaoCao_Assignment2_PC-Astral-Market.docx` (9 trang) và `UseCase_Logic_Ham_PC-Astral-Market.docx` (8 trang).
- Báo cáo Y3 đã viết lại; sơ đồ Use Case tổng quan có tài khoản. Word tổng quan và sửa nhanh cũ đã được xóa theo yêu cầu.
- Kiểm thử hiện tại: `current-tests.json` và `accounts-models-tests.json`. Các file `test-results.json`, `refactor-tests.json` là bằng chứng lịch sử, không thay thế kết quả hiện tại.
- Bộ công cụ chính: `tools/run_tests.cjs test_current.cjs`, `tools/run_tests.cjs test_accounts_models.cjs`, `tools/build_documents.py`, `tools/package_submission.py`.
- Dùng `tools/export_documents.ps1` và `tools/render_documents.py` để kiểm tra bố cục. Các công cụ sinh Word cũ đã dọn; nguồn sơ đồ PNG/Draw.io ở docs/diagrams/usecases.

## Refactor để học JavaScript cơ bản

Hàm được khai báo có tên, rồi mới gán vào PCAstral hoặc đăng ký sự kiện. Không còn IIFE, arrow function, spread, destructuring hoặc toán tử ba ngôi. Các vòng tìm kiếm, lọc và tính tổng dùng for; đọc form bằng từng trường cụ thể. Mã bất đồng bộ chỉ giữ tại nơi đọc JSON và thao tác tài khoản. README có bảng đối chiếu với các bài học.

## Sửa lỗi Failed to fetch khi nhấp đúp HTML

HTML nạp san-pham-du-phong.js trước du-lieu.js. Với file://, du-lieu.js dùng JSON.parse trên chuỗi nhúng; với HTTP, tiếp tục fetch products.json. tools/sync_offline_products.py sinh bản nhúng từ JSON gốc, tự chạy khi đóng gói. Không có bản dữ liệu sửa tay thứ hai. Kiểm thử file thực tế Chrome/Edge nằm ở docs/file-mode-tests.json.
