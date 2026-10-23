# Bộ câu hỏi bảo vệ PC-Astral Market

## Bản hiện hành ngày 23/10/2026

Theo yêu cầu mới, Bộ-câu-hỏi.docx đã được thay bằng bản **chỉ ôn JavaScript**, 10 trang, 27 câu hỏi ngắn trong 9 chủ đề; 69 tham chiếu mã đã được kiểm tra. Không còn phần nghiệp vụ, thang điểm hay tổ chức bảo vệ.

Dùng `tools/build_js_revision.py` để dựng bản hiện hành, `tools/export_defense_document.ps1` để cập nhật mục lục và xuất PDF, `tools/verify_js_revision.py` để kiểm tra và render. Sau khi xem đủ 10 trang mới dùng cờ `--visual-reviewed`. Kết quả hiện hành nằm ở `js-revision-qa.json`, danh sách tham chiếu ở `js-revision-index.json`.

Các phần dưới là lịch sử bản 60 câu ngày 22/10; không dùng builder/validator cũ để ghi đè hoặc nghiệm thu bản ôn JS hiện hành.

## Lịch sử bản 60 câu

Đối chiếu ngày 22/10/2026. Đầu ra: `Bộ-câu-hỏi.docx` tại gốc dự án, 40 trang, 60 câu và đáp án. File này phục vụ ôn tập, không được đưa vào ZIP nộp bài.

## Nội dung và kiểm tra

- A01–A20: câu trọng tâm; B01–B30: đào sâu; C01–C10: sửa tại chỗ.
- 154 tham chiếu nguồn, 6 trích đoạn nguyên bản ngắn, 3 sơ đồ luồng.
- Các bài C01–C10 chạy trên mười bản sao riêng qua Chrome; kiểm tra bổ sung bảy trang và luồng tài khoản. Tất cả 11 nhóm đạt. C01 thử thêm file://; C05 dùng đồng hồ kiểm thử. Không suy rộng thành mọi trình duyệt hoặc mọi tình huống đều đã kiểm tra.
- Mục lục được cập nhật bằng Word và kiểm tra trang của đủ 60 câu; xuất PDF và xem toàn bộ 40 trang. Renderer của Documents thiếu LibreOffice nên dùng Microsoft Word COM và pypdfium2.
- Đối chiếu SHA-256 của 68 tệp được bảo vệ: website, hai Word cũ và ZIP không đổi trong lần tạo bộ câu hỏi.

## Nguồn và bằng chứng

- `tools/defense_content.py`: 50 câu A/B.
- `tools/defense_exercises.py`: 10 bài C và cách chuẩn bị bản sao.
- `tools/inspect_defense_sources.cjs`: lấy vị trí hàm từ mã hiện tại.
- `tools/build_defense_document.py`: chỉ tạo Bộ-câu-hỏi.docx.
- `tools/export_defense_document.ps1`: cập nhật trường và xuất PDF bằng Word ẩn.
- `tools/verify_defense_document.py`: kiểm tra nội dung, tham chiếu, mục lục và bảo toàn tệp.
- `tools/test_defense.cjs`: kiểm thử trên các bản sao.
- `defense-practice-tests.json`, `defense-document-qa.json`, `defense-question-index.json`, `defense-preservation.json`: kết quả và dấu vết đối chiếu.
- `diagrams/defense/`: ba hình gốc được chèn vào tài liệu.

## Khi cần cập nhật

Dùng Node/Python và thư viện từ runtime đã cấu hình trên máy phát triển; công cụ không phải thành phần chạy website. Đọc các script để điều chỉnh đường dẫn runtime khi chuyển máy.

1. Nếu mã website đã đổi, ghi nhận mốc bảo toàn mới có chủ đích và cập nhật dữ liệu câu hỏi/đáp án theo mã thực tế.
2. Chạy `tools/inspect_defense_sources.cjs`, sau đó `tools/build_defense_document.py`.
3. Chạy `tools/export_defense_document.ps1`, rồi `tools/verify_defense_document.py --render`.
4. Xem từng ảnh trang. Chỉ sau khi kiểm tra đủ trang mới chạy `--visual-reviewed` để ghi nhận nghiệm thu.
5. Muốn chạy lại bài luyện, tạo bản sao bằng `tools/defense_exercises.py` rồi chạy `tools/test_defense.cjs`. Không áp các bài C vào website nộp bài. Dọn đúng `tmp/defense` sau khi hoàn thành và giữ bằng chứng trong docs.

Không gọi công cụ sinh lại báo cáo Y3 để tạo bộ câu hỏi. Không tự cập nhật ZIP hoặc hai Word cũ. Số dòng chỉ đúng với mốc mã đã đối chiếu; tên file/hàm là cách tìm chính sau khi mã thay đổi.
