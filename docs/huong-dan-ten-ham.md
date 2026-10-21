# Tra cứu tên JavaScript tiếng Việt

Đọc `PC-Astral-Market/js/mo-hinh.js` trước: Product xử lý sản phẩm; Cart xử lý giỏ.
Tên hàm dùng động từ tiếng Việt không dấu. Giữ class Product, Cart theo mẫu môn học.
Các API chuẩn, cấu trúc JSON, khóa LocalStorage, HTML ID và URL vẫn giữ nguyên.

| Cần sửa | File trong website | Tên hàm để Ctrl+F |
|---|---|---|
| Nạp JSON | js/du-lieu.js | napDuLieuSanPham |
| Thêm, đổi số lượng, xóa | js/mo-hinh.js | themSanPham, doiSoLuong, xoaSanPham |
| Giá và tổng tiền | js/mo-hinh.js | layGia, tinhTongGio |
| Lưu khi F5, kết thúc demo | js/luu-tru.js | docJSON, luuJSON, ketThucDemo |
| Đăng ký, đăng nhập | js/luu-tru.js | dangKy, dangNhap, bamMatKhau |
| Tìm, lọc, sắp xếp | js/hien-thi.js | boDau, locSanPham, soSanhGiaTang |
| Khởi tạo, bắt nút chung | js/su-kien.js | khoiTaoWebsite, xuLyThemGio |
| Banner, đồng hồ | js/trang/trang-chu.js | chuyenBanner, capNhatDemNguoc |
| Danh sách sản phẩm | js/trang/san-pham.js | hienThiDanhSachSanPham |
| Chi tiết | js/trang/chi-tiet.js | hienThiChiTiet |
| Giỏ hàng | js/trang/gio-hang.js | hienThiGioHang, xuLyDoiSoLuong |
| Đặt hàng | js/trang/dat-hang.js | donHangHopLe, xuLyDatHang |
| Form tài khoản | js/trang/tai-khoan.js | xuLyDangKy, xuLyDangNhap |

Luồng thêm giỏ: xuLyThemGio → themSanPham → baoGioThayDoi → luuGio →
luuJSON → sự kiện cart-changed → hienThiGioHang.

Tên trong mẫu chấm bài tương ứng: addProduct → themSanPham;
removeProduct → xoaSanPham; getTotal → layTongTien.
File `doi-ten-javascript.json` lưu bảng đối chiếu cũ/mới.

Không cần thuộc thuật toán mật mã: bamMatKhau nhờ trình duyệt tạo mã băm.
Không thay bằng lưu mật khẩu nguyên văn. await chờ JSON/mã băm xong rồi mới chạy tiếp.
Website không có thư viện JS, import/export, arrow function, spread, destructuring,
toán tử ba ngôi, map/filter/reduce hoặc hàm tự chạy IIFE.

JSON gốc vẫn là js/products.json. san-pham-du-phong.js được sinh tự động khi đóng gói,
chỉ phục vụ mở trực tiếp index.html. Sửa JSON và demo bằng Live Server để F5 thấy ngay.
