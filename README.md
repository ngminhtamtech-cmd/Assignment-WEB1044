# PC-Astral Market — WEB1044

Website bán máy tính mô phỏng phục vụ Assignment môn Lập trình cơ sở với JavaScript. Sản phẩm gồm **Laptop, PC để bàn, màn hình và phụ kiện**; dữ liệu tĩnh có 24 sản phẩm, 4 danh mục.

Dự án dùng **HTML, CSS, JavaScript thuần**, class `Product`/`Cart`, không backend và không thanh toán thật. Ảnh lưu trong `img/`; font Sarabun tải từ Google Fonts, khi không có mạng dùng Arial.

## Chức năng

- Trang chủ có slider, countdown và nhóm sản phẩm mới/hot/khuyến mãi.
- Danh sách, chi tiết sản phẩm; tìm kiếm không dấu, lọc kết hợp và sắp xếp.
- Giỏ hàng: thêm trùng cộng số lượng, tăng/giảm/xóa, giới hạn tồn kho và tính tổng tự động.
- Đặt hàng mô phỏng: kiểm tra form, giữ bản nháp qua F5, xác nhận đơn và chống gửi lặp.
- Đăng ký/đăng nhập/đăng xuất: lưu username, salt và mã băm mật khẩu; không lưu mật khẩu nguyên văn. Đây là xác thực demo phía trình duyệt.
- LocalStorage giữ dữ liệu khi F5 hoặc tắt server. Nút **Kết thúc buổi demo** xóa dữ liệu ứng dụng; đặt hàng thành công dọn giỏ và bản nháp theo luồng xử lý.

## Luồng sử dụng và testcase

**Luồng mua hàng:** xem sản phẩm → tìm/lọc/sắp xếp → thêm giỏ → sửa số lượng → nhập thông tin → đặt hàng mô phỏng → xem xác nhận.

**Luồng tài khoản:** đăng ký → đăng nhập → F5 → đăng xuất → đăng nhập lại. Đăng xuất không xóa tài khoản.

Các ca dưới đây là checklist chạy lại khi thay đổi mã, không phải khẳng định đã kiểm thử lại ở mọi phiên bản:

| Thao tác kiểm tra | Kết quả mong đợi |
|---|---|
| Tìm có/không dấu, kết hợp danh mục/giá, sắp xếp | Kết quả đúng điều kiện; reload giữ bộ lọc qua URL |
| Thêm cùng sản phẩm hai lần | Một dòng giỏ, số lượng cộng dồn |
| Tăng/giảm/xóa và F5 | Tổng tiền, badge và số lượng khớp dữ liệu đã lưu |
| Nhập 0, âm, lẻ hoặc quá tồn kho | Chặn, giữ số lượng hợp lệ trước đó; xóa bằng nút riêng |
| Đăng ký, đăng nhập rồi F5 | Giữ tài khoản và trạng thái đăng nhập khi lưu trữ được phép |
| Form trống/sai và F5 | Báo lỗi; giữ năm trường bản nháp |
| Đặt hàng rồi nhấn lặp/F5 | Không tạo đơn lặp; giữ xác nhận |
| Giá hoặc giỏ thay đổi lúc nhập form | Cập nhật tóm tắt, yêu cầu xác nhận lại |
| Lưu đơn thất bại / dọn giỏ thất bại | Giữ giỏ khi chưa lưu đơn; nếu đã lưu thì thử lại bước dọn, không tạo đơn mới |
| Xóa storage hoặc JSON lưu bị hỏng | Dùng dữ liệu mặc định khi đọc lại, xử lý lỗi có kiểm soát |
| Bấm Ưu đãi tháng 10 | Mở `products.html?group=sale` của PC-Astral Market |

Bằng chứng các lần kiểm tra nằm trong `docs/`; các công cụ kiểm tra nằm trong `tools/`. Một số công cụ dùng đường dẫn runtime của máy phát triển, cần điều chỉnh nếu chạy trên máy khác.

## Clone và chạy dự án

```bash
git clone https://github.com/ngminhtamtech-cmd/Assignment-WEB1044.git
cd Assignment-WEB1044
code .
```

1. Cài extension **Live Server** trong VS Code.
2. Mở `PC-Astral-Market/index.html`, nhấp phải → **Open with Live Server**.
3. Cấu hình `.vscode/settings.json` dùng cổng **5510**, truy cập **http://127.0.0.1:5510/index.html**.
4. Nếu server cũ đang chạy, dừng rồi mở lại. Không dùng lại cổng 5500 từng chạy portfolio. Nếu cổng 5510 đã có server của dự án, dùng server đó thay vì mở thêm.

Không cần `npm install`. Có thể mở trực tiếp `index.html` bằng Chrome/Edge; chế độ `file://` dùng dữ liệu dự phòng. Khi sửa sản phẩm, nên dùng Live Server để đọc trực tiếp `js/products.json`.

**Lưu ý dữ liệu:** LocalStorage tách theo trình duyệt, hostname và cổng. Đổi từ 5500 sang 5510 không xóa dữ liệu cũ nhưng không tự chuyển tài khoản/giỏ sang địa chỉ mới. Trình duyệt chặn lưu trữ hoặc người dùng tự xóa dữ liệu có thể làm mất dữ liệu đã lưu.

## Tìm nhanh mã nguồn

| File trong `PC-Astral-Market/js/` | Nhiệm vụ |
|---|---|
| `products.json`, `du-lieu.js` | Dữ liệu gốc và nạp/kiểm tra sản phẩm |
| `san-pham-du-phong.js` | Dữ liệu nhúng cho chế độ mở trực tiếp |
| `mo-hinh.js` | Class Product/Cart, thêm/sửa/xóa và tính tổng |
| `luu-tru.js` | LocalStorage, tài khoản, băm mật khẩu, kết thúc demo |
| `hien-thi.js` | Tìm/lọc/sắp xếp và giao diện dùng chung |
| `su-kien.js` | Khởi tạo, event delegation và đồng bộ giỏ |
| `trang/*.js` | Xử lý riêng từng trang |

Tìm **`ÔN JS - CÂU`** trong VS Code để đến các chú thích ôn bảo vệ. Khi sửa JSON, đồng bộ bản dự phòng bằng `python tools/sync_offline_products.py` trước khi bàn giao chế độ file trực tiếp.

## Tài liệu

- `BaoCao_Assignment2_PC-Astral-Market.docx`: báo cáo Assignment.
- `UseCase_Logic_Ham_PC-Astral-Market.docx`: sơ đồ, logic và tra cứu hàm.
- `Bộ-câu-hỏi.docx`: tài liệu ôn JavaScript.
- `PC-Astral-Market/ASSET-SOURCES.md`: nguồn tài nguyên.
- `submission/`: gói nộp đã xuất; có thể chưa chứa các thay đổi mới nhất. Muốn chạy mã hiện tại, dùng thư mục `PC-Astral-Market` trong repository.
