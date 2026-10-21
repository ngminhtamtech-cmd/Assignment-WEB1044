# Đối chiếu Assignment WEB1044 ngày 21/10/2026

Nguồn đối chiếu: đủ 5 trang của `Assignment - Lap trinh cơ sở với Javascript.pdf` do người học cung cấp. Các yêu cầu thực hiện nằm ở trang 2–4. Kết quả áp dụng cho mã trong `PC-Astral-Market` và tài liệu `BaoCao_Assignment2_PC-Astral-Market.docx` hiện tại.

## Kết quả Y1–Y3

| Yêu cầu | Bằng chứng thực hiện | Kiểm chứng |
|---|---|---|
| Y1.1 Khởi tạo đối tượng, hàm và giao diện | `du-lieu.js` nạp JSON, `mo-hinh.js` tạo Product/Cart, `su-kien.js` khởi tạo | Mở 7 trang, không có lỗi JS chưa xử lý trong luồng kiểm thử |
| Y1.2.1 Mảng đối tượng, nhóm mới/hot/khuyến mãi | 24 bản ghi JSON được chuyển thành mảng Product; tên, giá, ảnh, nút xem/thêm giỏ | Kiểm tra dữ liệu và trang chủ; đủ 4 danh mục |
| Y1.2.2 Trang danh mục thống nhất trang chủ | `products.html?category=...`, header/footer/thẻ dùng chung | Kiểm tra danh mục, lọc kết hợp, reload URL |
| Y1.2.3 Hiệu ứng sản phẩm | `css/style.css`: hover nâng thẻ, zoom ảnh; focus-within viền thẻ | Đối chiếu selector và giao diện; nút vẫn dùng được bằng bàn phím/cảm ứng |
| Y1.3 Slider điều khiển bằng JS | `trang/trang-chu.js`: trước/sau, dot, tự chuyển và dừng khi focus/hover | Nhóm kiểm thử 02 |
| Y1.4 Form kiểm tra rỗng/định dạng | Đặt hàng và tài khoản; lỗi cạnh trường, focus ô sai | Nhóm 09–11 và C05–C10 |
| Y1.5 Thêm/xóa/sửa giỏ, lưu qua reload | Cart + LocalStorage, dữ liệu lưu riêng ID/số lượng | Nhóm 06–08, 11–12; thêm trùng, dữ liệu hỏng và storage bị chặn |
| Y1.6 Ít nhất một chức năng nâng cao | Countdown đến hạn cố định `2026-10-30T23:59:59+07:00` | Nhóm 13: hết hạn dừng ở 0, giá thường và tổng tiền cập nhật |
| Y1.7 Ba chức năng tự đề xuất | Tìm kiếm, lọc, sắp xếp; lý do ghi tại mục 18 trong Word | Nhóm 03–04, C03 và C11 |
| Y2 Vị trí file | 7 HTML ở gốc; 12 JS dưới `js`; một CSS trong `css` | Kiểm tra cấu trúc, thứ tự script defer và đóng gói |
| Y3 Báo cáo, hình vẽ, thông tin thư viện | Word tổng quan: nghiệp vụ, dữ liệu, Product/Cart, phác thảo, sơ đồ giỏ, kiểm thử; mục 18–19 bổ sung đối chiếu và thư viện | Render và kiểm tra toàn bộ bản Word sau cập nhật |

Đề không bắt buộc SQL, framework, backend, hosting hay số lượng Use Case cụ thể. Các yêu cầu bổ sung của người học về JSON, class Product/Cart, đăng ký/đăng nhập, comment tiếng Việt và mở trực tiếp file vẫn được giữ.

## Ba chức năng tự đề xuất

- **Tìm kiếm:** khách nhớ tên hoặc thương hiệu; tìm không dấu và không phân biệt hoa thường giúp tìm nhanh. Không có kết quả thì hiển thị hướng dẫn.
- **Lọc:** khách cần đúng danh mục và ngân sách; danh mục, hãng và khoảng giá kết hợp theo AND, có nút xóa lọc và số kết quả.
- **Sắp xếp:** khách cần so sánh giá; hỗ trợ giá tăng/giảm và tên A–Z trên kết quả đã lọc, không sửa thứ tự dữ liệu gốc.

## JavaScript đã rút gọn

1. Bỏ `coKhuyenMai` và `layGiaHienTai` chỉ gọi lại phương thức Product. Giao diện gọi thẳng `sanPham.dangGiamGia()` và `sanPham.layGia()`; quy tắc giá vẫn nằm duy nhất trong Product.
2. Bỏ `taoThongBaoTrong`, một hàm chỉ có một nơi sử dụng. Đặt thông báo cố định ngay trong nhánh danh sách rỗng của `hienThiLuoiSanPham`.
3. Bỏ tham số `dungPhien` và hai nhánh chọn SessionStorage không được gọi. Hàm đọc/ghi JSON dùng trực tiếp LocalStorage. Khi kết thúc demo vẫn dọn khóa SessionStorage của phiên bản cũ nếu có.
4. Đồng bộ đoạn minh họa trong báo cáo nhanh và cập nhật vị trí mã trong cả hai tài liệu.

Lượt rút gọn đầu giảm từ 131 xuống 128 khai báo hàm/phương thức có tên. Lượt sửa lỗi theo kế hoạch tiếp theo bổ sung 7 hàm phục vụ lưu nháp và khôi phục sau lỗi, hiện có 135 khai báo trong cùng 12 file. Xem `sua-loi-logic.md` để đọc các thay đổi mới. Rà tên hàm và nơi gọi để tránh xóa nhầm hàm được dùng qua sự kiện/namespace; không coi số hàm ít hơn là mục tiêu hoặc bằng chứng mã đúng.

Luồng chính đã dùng hàm có tên, khai báo biến rõ, if/else, for, object/class và các API DOM. Kiểm tra cú pháp xác nhận không có import/export, arrow function, toán tử ba ngôi, destructuring, spread/rest hay map/filter/reduce/forEach trong mã website. `sort` dùng hàm so sánh có tên.

Các phần cần giữ: kiểm tra số lượng và dữ liệu JSON, xử lý lỗi storage, escape HTML, xác nhận tổng tiền khi hết khuyến mãi, mã băm mật khẩu và bản JSON dự phòng cho file://. Bỏ những phần này chỉ để ngắn hơn sẽ mất chức năng hoặc làm bài dễ lỗi. `async/await` chỉ phục vụ việc đọc JSON và API mã băm bất đồng bộ; không chuyển sang chuỗi callback khó đọc hơn.

## Bằng chứng kiểm thử

- `current-tests.json`: 18/18 nhóm chức năng chính; Chrome và kiểm tra bổ sung trên Edge, các chiều rộng 390/768/1440.
- `accounts-models-tests.json`: 13/13 nhóm JSON, class, event delegation, tài khoản và reset demo.
- `viet-hoa-check.json`: 12 file JS, 135 khai báo hàm/phương thức có tên, 7 HTML và kiểm tra cú pháp cơ bản.
- `logic-regressions.json` và `logic-file-regressions.json`: 13 tình huống bổ sung, mỗi tình huống chạy trên Chrome/Edge ở cả HTTP và file://; cả 52 lượt đạt. Trước sửa có 5 phép thử chưa đạt, lưu tại `logic-baseline.json`.
- `package-check.json`, `package-smoke.json`, `file-mode-tests.json`: kết quả đóng gói và chạy lại bản sao.
- `documents-qa.json`: kiểm tra 17 trang của hai Word hiện hành; các QA Word trước đó chỉ là lịch sử.

## Phần chưa thể kết luận 100 phần trăm

- Mã nguồn và tài liệu đáp ứng các mục Y1–Y3 trong phạm vi kiểm tra; không thể bảo đảm không có lỗi ở mọi trình duyệt và mọi tình huống chưa thử.
- Tên/MSSV của ba thành viên vẫn để trống theo yêu cầu. Trước khi nộp cần điền và đổi tên bản Word thành `<MSSV>.docx`, ZIP thành `WEB1044_LapTrinhJSCoBan_<MSSV>_Assignment.zip` theo ví dụ đề hoặc quy định lớp. Tên gói hiện tại chưa có MSSV.
- `BaoCao_Assignment2_PC-Astral-Market.docx` đã viết lại còn 9 trang và nằm trong ZIP. `UseCase_Logic_Ham_PC-Astral-Market.docx` dài 8 trang, giữ ngoài ZIP để đọc hiểu; không còn Word cũ.
- Khi bảo vệ sau ngày hết chiến dịch, countdown sẽ báo kết thúc và giá về thường đúng thiết kế. Nếu cần demo chiến dịch mới, sửa thời hạn cố định trong `js/du-lieu.js` trước buổi demo; không tạo lại hạn mỗi lần F5.
- LocalStorage giữ dữ liệu qua F5 và cả khi tắt server; chỉ nút Kết thúc buổi demo xóa dữ liệu theo lựa chọn của người học. Storage bị chặn thì cảnh báo và chỉ giữ giỏ tạm trong trang.
- Điểm trình bày/giải thích và đánh giá thẩm mỹ do giảng viên quyết định. Thang A trong đề là 70–100%, không phải cam kết tự động được 100%.
