# Kết quả kiểm thử PC-Astral Market

Ngày: 19/10/2026. Kiểm thử JSON, class Product/Cart và LocalStorage. Chạy bằng Playwright với Chrome và Edge cài trên máy. Phục vụ HTTP tĩnh localhost.

- **PASS** 01. Trang chủ khởi tạo đủ ba nhóm, 24 sản phẩm / 4 danh mục
- **PASS** 02. Slider next / prev / dot / tự chuyển / dừng khi focus
- **PASS** 03. Tìm kiếm không dấu, không phân biệt hoa thường, không sửa mảng gốc
- **PASS** 04. Lọc AND / giá biên / sắp xếp / reload / xóa lọc
- **PASS** 05. Chi tiết hợp lệ / thiếu ID / ID sai / hết hàng / ảnh dự phòng
- **PASS** 06. Giỏ: thêm trùng, số lượng, tổng, lưu reload và xóa
- **PASS** 07. Storage JSON hỏng / ID lạ / số lượng sai / gộp trùng
- **PASS** 08. Đồng bộ giỏ giữa hai tab
- **PASS** 09. Validation rỗng / khoảng trắng / email sai / điện thoại sai
- **PASS** 10. Đặt hàng hợp lệ / chuẩn hóa +84 / chống lặp / reload xác nhận
- **PASS** 11. Lưu đơn bị chặn: giữ giỏ, không báo đặt hàng thành công
- **PASS** 12. LocalStorage bị chặn: cảnh báo và giỏ tạm thời
- **PASS** 13. Countdown hết hạn / giá trở về giá thường / tổng giỏ cập nhật
- **PASS** 14. Bảy trang responsive 390 / 768 / 1440, không tràn ngang
- **PASS** 15. Bàn phím: skip link và thao tác tìm kiếm
- **PASS** 18. 24 ảnh thật cục bộ / nguồn rõ ràng / không còn SVG
- **PASS** 16. Không có lỗi JavaScript, console hoặc HTTP
- **PASS** 17. Edge: khởi tạo, mua hàng, lưu giỏ và responsive
