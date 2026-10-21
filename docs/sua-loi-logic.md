# Kiểm tra và sửa logic ngày 21/10/2026

Đã giữ nguyên tên hàm tiếng Việt và khóa dữ liệu cũ. Bổ sung khóa `pc-astral.checkout-draft.v1` và cờ `choDonGio` trong đơn. Class Product/Cart, dữ liệu JSON, 7 trang và giao diện chính được giữ.

## Bằng chứng trước và sau

`logic-baseline.json` ghi nhận năm phép thử chưa đạt trước khi sửa: F5 mất form nháp, giá tự cập nhật không yêu cầu xác nhận lại, thiếu trạng thái xử lý xóa giỏ lỗi, đăng ký sau reset ghi lại tài khoản, đăng nhập sau reset ghi lại phiên.

Sau sửa: `current-tests.json` đạt 18 nhóm cũ; `accounts-models-tests.json` đạt 13 nhóm cũ; `logic-regressions.json` đạt 13 tình huống trên mỗi trình duyệt Chrome/Edge (26 lượt HTTP). `logic-file-regressions.json` kiểm tra cùng tình huống khi mở trực tiếp file từ bản ZIP giải nén. Các thử nghiệm không phải bảo đảm cho mọi trình duyệt/chính sách máy chưa thử.

## Các thay đổi cần đọc khi bảo vệ

| Phần | Cách xử lý và nơi đọc |
|---|---|
| Form nháp | `docGiaTriBieuMau` dùng chung cho gửi form và lưu nháp; `luuBanNhap` nghe input; `khoiPhucBanNhap` chỉ điền các trường chuỗi. Cùng nằm trong `js/trang/dat-hang.js`. |
| Giá và nội dung giỏ | `cacDongGiongNhau` so ID, số lượng và tùy chọn đơn giá; cờ `canXacNhanLai` không bị mất khi render tổng. Lần bấm thông báo thay đổi chưa tạo đơn. |
| Dọn giỏ sau lưu đơn | `thuDonGio` đọc lại đơn/giỏ lưu, kiểm tra cùng đơn còn dang dở và giỏ còn khớp rồi mới xóa. `xoaGio` phục hồi bộ nhớ nếu ghi giỏ rỗng thất bại. |
| Thử lại | Nút thử dọn chỉ xử lý đơn đã lưu. Đơn đã hoàn tất ở tab khác hoặc giỏ mới đã đổi thì không được xóa nhầm. Cờ không có ở đơn cũ được hiểu là không còn bước dọn dang dở. |
| Reset khi đang await | `ketThucDemo` ghi dấu reset tăng dần trước khi xóa khóa; `dangKy` và `dangNhap` so dấu này sau await, dừng nếu buổi demo đã kết thúc. |
| Thông báo lỗi | Xóa một món nhưng không ghi được giỏ phải nói rõ chỉ đổi trong trang. Xóa nháp thất bại hiển thị cảnh báo riêng trên xác nhận. |

## Đơn giản hóa có kiểm soát

- Đọc form tại một hàm thay vì khai báo lại dữ liệu ở mỗi sự kiện.
- Gộp hai nhánh đăng nhập thành công lặp nhau.
- Sự kiện hết khuyến mãi không có dữ liệu kèm theo dùng `Event` thay cho `CustomEvent`.
- Giữ vòng for, hàm có tên, biến trung gian và chú thích ở các bước F5, lưu đơn, await và reset.
- Mã mới có 135 khai báo hàm/phương thức có tên trong 12 JS: tăng 7 hàm để chia các chức năng khôi phục dữ liệu theo nhiệm vụ. Không coi giảm số dòng/hàm là mục tiêu nếu làm khó hiểu hoặc mất xử lý lỗi.

## Giới hạn

LocalStorage cần cùng origin/cách mở; chuyển hostname, cổng hoặc chế độ file/HTTP có thể dùng vùng dữ liệu khác. Trình duyệt chặn lưu hoặc người dùng tự xóa dữ liệu thì không thể bảo đảm giữ qua F5. Đơn chỉ là mô phỏng, tài khoản không phải xác thực server. Xử lý đa tab có kiểm tra lại trạng thái nhưng LocalStorage không có giao dịch nhiều khóa nguyên tử; không coi đây là hệ thống bán hàng nhiều người dùng.

Tài khoản được giữ qua F5, tắt server và đăng xuất; nút kết thúc demo chủ động xóa tài khoản. Giỏ dọn khi đặt đơn thành công; nháp xóa khi đơn lưu thành công hoặc kết thúc demo. Nếu việc dọn thất bại, cảnh báo và trạng thái xử lý phải còn rõ ràng.
