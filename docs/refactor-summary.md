# Kết quả refactor PC-Astral Market

Ngày thực hiện: 17/10/2026.

## Mã nguồn

- Sáu HTML nạp JavaScript bằng `script defer` theo thứ tự data → utils → storage → cart → common → file trang.
- Không còn `import/export` trong mã chạy website. Dữ liệu và các hàm dùng chung nằm trong `window.PCAstral`.
- Giữ nguyên 24 sản phẩm, danh mục, banner, chiến dịch, URL, tên khóa và cấu trúc dữ liệu lưu trữ.
- HTML chứa bố cục banner, chi tiết, giỏ, form, trạng thái rỗng và xác nhận đơn. Dòng giỏ và đơn sử dụng template.
- Dòng giỏ đang tồn tại được cập nhật tại chỗ để giữ input và focus. Thay đổi giỏ hoặc giá cập nhật riêng tóm tắt đơn để giữ form đang nhập.
- CSS có khai báo riêng từng dòng; hợp nhất selector và mỗi breakpoint vào một khối. Nút, trường nhập và thành phần dùng chung chuyển về components.css.
- Bỏ công cụ sinh HTML cũ; cập nhật công cụ sinh dữ liệu để không tạo lại ES Modules.
- README bổ sung thứ tự đọc mã, cách giao tiếp giữa file và bảng chỉ dẫn nơi cần sửa.

## Kiểm thử thực tế

- Bộ chính: 18/18 nhóm đạt, gồm dữ liệu, tìm kiếm/lọc/sắp xếp, slider, giỏ, validation, lỗi storage, countdown và bàn phím.
- Bộ hồi quy: 7/7 nhóm đạt, gồm dữ liệu giữ nguyên, script defer, input/focus ổn định, form khi giá đổi, kiểm tra lại giá lúc submit, lưu đơn trước khi xóa giỏ, chống gửi lặp và hiển thị dữ liệu nhập dưới dạng văn bản.
- Chrome và Edge đều mở sáu trang ở 390, 768 và 1440 px; font Sarabun tải cục bộ, không tràn ngang.
- Không ghi nhận lỗi JavaScript, console, HTTP hoặc yêu cầu tải tài nguyên ngoài trong bộ hồi quy.
- Đối chiếu 18 ảnh trước/sau: kích thước và bố cục giữ nguyên. 13 ảnh trùng pixel; 5 ảnh có sai khác nhỏ tại vùng raster ảnh sản phẩm, đã kiểm tra trực quan. Xem `refactor-visual-comparison.json`.
- Lỗi CSS phát hiện trong refactor: khoảng cách lưới danh mục 768 px bị thay đổi do thứ tự `.product-grid` và `.catalog-grid`; đã sửa thứ tự ưu tiên và chụp lại đối chiếu.

Chi tiết: `test-results.json`, `test-results.md`, `refactor-tests.json`. Bộ kiểm thử dùng đồng hồ mô phỏng cố định cho giá và ca hết hạn; không thay thời gian máy người dùng.

## Báo cáo và đóng gói

- DOCX đã cập nhật tổ chức mã, luồng giỏ, đoạn code thật và kết quả kiểm thử sau refactor.
- Microsoft Word cập nhật mục lục và render thành 25 trang. Đã mở kiểm tra toàn bộ 25 ảnh trang bằng PDFium: không phát hiện tràn bảng, mất chữ, tách chú thích khỏi hình hoặc lệch số trang.
- Công cụ render_docx.py không chạy được vì máy thiếu LibreOffice; bản kiểm tra sử dụng Word ở chế độ ẩn và PDFium.
- Bìa giữ ba thành viên trống họ tên/MSSV và giảng viên Cô Lê Anh Đào.
- ZIP chỉ chứa website và DOCX. Kết quả giải nén, đối chiếu file và chạy luồng mua hàng lưu trong `package-check.json` và `package-smoke.json`.

Bản đối chiếu trước refactor nằm tại `tmp/refactor-before`, ngoài gói nộp. Các server HTTP phục vụ kiểm thử chạy trên cổng trống và tự đóng khi hoàn tất.
