# Đơn giản hóa JavaScript và chuẩn hóa hai tài liệu

Ghi nhận ngày 21/10/2026; trạng thái tài liệu cập nhật ngày 22/10/2026. Áp dụng trong PC-Astral-Market của thư mục dự án hiện tại.

## Góp ý được áp dụng

- 18 vòng `for...of` chuyển sang `for` có chỉ số, đặt biến phần tử rõ ràng. Duyệt mảng, NodeList và danh sách khóa Object.keys đã kiểm tra tương đương trong các trường hợp sử dụng hiện tại.
- 11 tham số mặc định chuyển sang kiểm tra `=== undefined` trong thân hàm. Không dùng `if (!giaTri)` vì sẽ làm thay đổi các đầu vào hợp lệ như 0 hoặc false.
- 5 `catch` có tên biến `loi` đầy đủ.
- 5 chỗ `replaceChildren` chuyển thành xóa nội dung bằng `innerHTML = ''`, rồi `appendChild` nếu cần. Không đưa dữ liệu khách nhập vào innerHTML và không dựng lại form đặt hàng.
- Hai nơi định dạng tiền dùng `toLocaleString('vi-VN') + ' đ'`; bỏ object định dạng trung gian. Dữ liệu giá vẫn là số, chỉ thêm đơn vị khi hiển thị.
- Giữ nguyên tên hàm tiếng Việt, class Product/Cart, tên khóa lưu trữ và sự kiện.

## Góp ý không áp dụng máy móc

- Giữ 5 kiểm tra `Number.isSafeInteger`. `Number.isInteger` không bảo đảm số nằm trong miền nguyên mà JavaScript biểu diễn chính xác; thay riêng lời gọi sẽ làm yếu kiểm tra dữ liệu JSON và số lượng. Một lời gọi rõ nghĩa còn ngắn hơn tự viết thêm giới hạn số.
- Giữ object `PCAstral` và các phạm vi khởi tạo. Các file trang có tên biến giống nhau như `gioHang`, `giaoDien`; chuyển tất cả thành toàn cục có thể gây trùng khai báo, rò trạng thái và thêm phụ thuộc. Đây là object JavaScript thường, không phải framework hay import/export.
- Giữ Web Crypto, async/await, kiểm tra lỗi lưu trữ, xác nhận giá, cờ dọn giỏ và dấu reset. Các phần này thực hiện hành vi cần thiết đã được kiểm thử, không phải mã thừa.

## Hai tài liệu hiện hành

1. `BaoCao_Assignment2_PC-Astral-Market.docx`: 27 trang, 19 hình. Giữ bìa và chương mục bản người dùng khôi phục; chỉ cập nhật mô tả kỹ thuật, bảng nhiệm vụ, sơ đồ và kết quả kiểm thử. Mục lục, danh mục hình/bảng có dấu chấm dẫn.
2. `UseCase_Logic_Ham_PC-Astral-Market.docx`: 8 trang, 7 hình và 45 hàm chính kèm số dòng theo mã hiện tại.

Bìa giữ ba thành viên trống tên/MSSV và Cô Lê Anh Đào. `tools/build_documents.py` chỉ tạo tài liệu thứ hai; `tools/update_report_content.py` cập nhật cục bộ báo cáo đang có. Không chạy bộ tạo báo cáo ngắn cũ. Công cụ xuất Word chỉ cập nhật trường và số trang, giữ kiểu bìa người dùng.

## Bằng chứng sau thay đổi

- 18 nhóm kiểm thử chức năng và 13 nhóm mô hình/tài khoản đạt.
- 26 lượt lỗi logic qua HTTP và 26 lượt tương ứng qua file:// đạt trên Chrome/Edge.
- Mở trực tiếp tại đường dẫn có dấu/khoảng trắng trên Chrome/Edge đạt; kiểm tra AST 12 file JS, 135 khai báo hàm/phương thức, 7 trang đạt.
- Toàn bộ 35 trang Word được render bằng Microsoft Word → PDF → PNG và kiểm tra bố cục. Không có LibreOffice trong runtime nên dùng Word cài sẵn để render.
- ZIP được tạo lại từ mã cuối và báo cáo Y3; đối chiếu byte báo cáo trong ZIP với bản gốc, thử bản giải nén. Xem `package-check.json`, `package-smoke.json` và `documents-qa.json`.

Kết quả chỉ áp dụng các ca đã chạy, không bảo đảm mọi môi trường đều không có lỗi. LocalStorage vẫn phụ thuộc origin, quyền lưu trữ và dữ liệu trình duyệt; tắt server không chủ động xóa tài khoản.

Chi tiết đợt rút gọn và kiểm thử mới: [refactor ngày 22/10](refactor-2026-10-22.md). Nhật ký 21/10 là lịch sử; kết quả mới nằm trong các JSON đã cập nhật ngày thực chạy.
