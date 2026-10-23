# PC-Astral Market

Website demo bán Laptop, PC, màn hình và phụ kiện bằng HTML/CSS/JavaScript thuần, gồm 24 sản phẩm.

- Tìm kiếm, lọc, sắp xếp; xem chi tiết; slider và countdown.
- Giỏ hàng, tổng tiền tự động, form đặt hàng mô phỏng.
- Đăng ký/đăng nhập; lưu tài khoản dạng username, salt và mã băm.
- LocalStorage giữ dữ liệu qua F5; kết thúc demo xóa dữ liệu ứng dụng.

## Chạy

Mở thư mục này bằng VS Code → cài Live Server → nhấp phải `index.html` → Open with Live Server. Cấu hình đi kèm dùng **http://127.0.0.1:5510/index.html** để tách khỏi portfolio từng chạy ở 5500. Đổi cổng sẽ dùng vùng LocalStorage riêng.

Có thể mở trực tiếp `index.html`; khi đó dùng `js/san-pham-du-phong.js`. Khi sửa `js/products.json`, nên chạy Live Server; trước khi bàn giao cần đồng bộ dữ liệu dự phòng từ thư mục gốc bằng `python tools/sync_offline_products.py`.

## Demo và kiểm tra nhanh

Xem sản phẩm → tìm/lọc → thêm cùng món hai lần → sửa số lượng → xóa → F5 → nhập form sai rồi đúng → đặt hàng → F5 xác nhận. Kiểm tra thêm đăng ký → đăng nhập → F5 → đăng xuất → đăng nhập lại.

Số lượng 0/âm/lẻ/quá kho phải bị chặn; tổng tiền phải khớp; gửi lặp không tạo thêm đơn. Font Sarabun cần mạng, không tải được sẽ dùng Arial. Website không có backend hoặc thanh toán thật.

Xem [README tổng dự án](../README.md) để có hướng dẫn clone, bảng testcase và bản đồ file JavaScript.
