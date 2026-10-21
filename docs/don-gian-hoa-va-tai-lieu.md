# Đơn giản hóa JavaScript và chuẩn hóa hai tài liệu

Ngày kiểm tra: 21/10/2026. Áp dụng trong PC-Astral-Market của thư mục dự án hiện tại.

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

1. `BaoCao_Assignment2_PC-Astral-Market.docx`: 9 trang; Y1, ba đề xuất kèm lý do, Y2 đúng cấu trúc, sơ đồ, kết quả kiểm thử, thư viện/công cụ, GitHub. Mục lục tự động có dấu chấm dẫn và số trang căn phải. Có 4 hình và 5 bảng nội dung, ngoài bảng thành viên.
2. `UseCase_Logic_Ham_PC-Astral-Market.docx`: 8 trang; chỉ Use Case, logic, bảng các hàm chính và số dòng. Có ba Use Case và bốn sơ đồ luồng; không chép các khối mã dài.

Bìa giữ ba thành viên trống tên/MSSV và Cô Lê Anh Đào. Báo cáo Word cũ được thay thế bằng nội dung mới; xóa hai Word tổng quan/sửa nhanh và các bộ sinh Word lỗi thời. Nguồn mới duy nhất là `tools/build_documents.py`.

## Bằng chứng sau thay đổi

- 18 nhóm kiểm thử chức năng và 13 nhóm mô hình/tài khoản đạt.
- 26 lượt lỗi logic qua HTTP và 26 lượt tương ứng qua file:// đạt trên Chrome/Edge.
- Mở trực tiếp tại đường dẫn có dấu/khoảng trắng trên Chrome/Edge đạt; kiểm tra AST 12 file JS, 135 khai báo hàm/phương thức, 7 trang đạt.
- Toàn bộ 17 trang Word được render bằng Microsoft Word → PDF → PNG và kiểm tra bố cục. Không có LibreOffice trong runtime nên dùng Word cài sẵn để render.
- ZIP được tạo lại từ mã cuối và báo cáo Y3; đối chiếu byte báo cáo trong ZIP với bản gốc, thử bản giải nén. Xem `package-check.json`, `package-smoke.json` và `documents-qa.json`.

Kết quả chỉ áp dụng các ca đã chạy, không bảo đảm mọi môi trường đều không có lỗi. LocalStorage vẫn phụ thuộc origin, quyền lưu trữ và dữ liệu trình duyệt; tắt server không chủ động xóa tài khoản.
